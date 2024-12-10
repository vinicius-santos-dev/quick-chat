import { createInjectable } from 'ngxtension/create-injectable';
import { inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { CookieService } from 'ngx-cookie-service';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  bio?: string;
  photoURL?: string;
}

const supabase = createClient(
  environment.supabase.url,
  environment.supabase.publicKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// Create an injectable authentication store using ngxtension's utility
export const useAuthStore = createInjectable(() => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const cookieService = inject(CookieService);

  const storedUser = cookieService.get('auth_user');
  const currentUser = signal<AppUser | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  const authStateLoading = signal<boolean>(false);
  const isInitialized = signal<boolean>(true);

  // Set up Firebase auth state listener to keep user state in sync
  // This will run whenever the authentication state changes (login/logout)
  auth.onAuthStateChanged(async (user) => {
    console.log('Firebase Auth State Changed:', user);

    // authStateLoading.set(true);
    try {
      if (user) {
        // Always get fresh data from Firestore
        authStateLoading.set(true);
        console.log('Getting user from Firestore:', user.uid);
        const appUser = await getUserFromFirestore(user.uid);
        console.log('Firestore user data:', appUser);

        if (appUser) {
          cookieService.set(
            'auth_user',
            JSON.stringify(appUser),
            7,
            '/',
            '',
            true,
            'Strict'
          );
          currentUser.set(appUser);
        }
      } else {
        console.log('No user - setting currentUser to null');
        cookieService.delete('auth_user');
        currentUser.set(null);
      }
    } finally {
      authStateLoading.set(false);
      isInitialized.set(true);
    }
  });

  async function getUserFromFirestore(uid: string): Promise<AppUser | null> {
    try {
      const userDoc = await getDoc(doc(firestore, `users/${uid}`));
      console.log('Firestore doc exists:', userDoc.exists());
      if (userDoc.exists()) {
        return userDoc.data() as AppUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user from Firestore:', error);
      return null;
    }
  }

  async function createUserInFirestore(
    user: User & { bio?: string; photoURL?: string }
  ): Promise<void> {
    try {
      const newUser: AppUser = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
        bio: user.bio,
        photoURL: user.photoURL,
      };

      await setDoc(doc(firestore, `users/${user.uid}`), newUser);
      console.log('User document created successfully');
    } catch (error) {
      console.error('Error creating user document:', error);
      throw new Error('Failed to create user profile');
    }
  }

  async function signUp(
    email: string,
    password: string,
    displayName: string,
    bio?: string,
    photoURL?: string
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await createUserInFirestore({
        ...userCredential.user,
        displayName,
        bio: bio || "Hey there, I'm using QuickChat!",
        photoURL: photoURL || '/assets/default-avatar.png',
      });

      const appUser = await getUserFromFirestore(userCredential.user.uid);
      currentUser.set(appUser);
    } catch (error: any) {
      console.error('Signup error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error(
            'This email is already in use. Please try a different one.'
          );
        case 'auth/invalid-email':
          throw new Error('The email address is not valid.');
        case 'auth/weak-password':
          throw new Error(
            'The password is too weak. Please use a stronger password.'
          );
        default:
          throw new Error(
            'An error occurred during sign up. Please try again.'
          );
      }
    }
  }

  async function login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const appUser = await getUserFromFirestore(userCredential.user.uid);
      currentUser.set(appUser);
    } catch (error: any) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password. Please try again.');
        case 'auth/invalid-email':
          throw new Error('The email address is not valid.');
        case 'auth/user-disabled':
          throw new Error(
            'This account has been disabled. Please contact support.'
          );
        default:
          throw new Error('An error occurred during login. Please try again.');
      }
    }
  }

  async function logout(): Promise<void> {
    try {
      await signOut(auth);
      cookieService.delete('auth_user');
      currentUser.set(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('An error occurred during logout. Please try again.');
    }
  }

  async function updateProfile(
    uid: string,
    data: Partial<AppUser>,
    photoFile?: File
  ): Promise<void> {
    try {
      // Handle photo upload if provided
      if (photoFile) {
        // Validate file
        if (photoFile.size > 5 * 1024 * 1024) {
          // 5MB
          throw new Error('File size too large. Maximum size is 5MB.');
        }

        if (!photoFile.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }

        const filePath = `${uid}/${Date.now()}_${photoFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from('user-images')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('user-images').getPublicUrl(filePath);
        // Add the URL to the data object
        data.photoURL = publicUrl;

        // If there is an old photo, delete it from Supabase
        const currentUser = await getUserFromFirestore(uid);
        if (currentUser?.photoURL) {
          try {
            // Extract the file path from the old URL
            const oldPath = currentUser.photoURL.split('/').slice(-2).join('/');
            await supabase.storage.from('user-images').remove([oldPath]);
          } catch (deleteError) {
            console.error('Error deleting old photo:', deleteError);
          }
        }
      }

      await updateDoc(doc(firestore, `users/${uid}`), data);
      const updatedUser = await getUserFromFirestore(uid);
      currentUser.set(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  return {
    currentUser,
    signUp,
    login,
    logout,
    updateProfile,
    authStateLoading,
    isInitialized,
  };
});
