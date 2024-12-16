import { createInjectable } from 'ngxtension/create-injectable';
import { DestroyRef, inject, signal } from '@angular/core';
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
import { supabase } from '../../shared';

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  bio?: string;
  photoURL?: string;
}

/**
 * Authentication Store
 *
 * Manages application's authentication state and user data.
 * Handles Firebase authentication, Firestore user data, and local storage.
 * Uses ngxtension's createInjectable for dependency injection pattern.
 */
export const useAuthStore = createInjectable(() => {
  // Dependencies
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const cookieService = inject(CookieService);
  const destroyRef = inject(DestroyRef);

  // State Management
  const currentUser = signal<AppUser | null>(null);

  const authStateLoading = signal<boolean>(false);

  // Cookie Management
  const handleUserCookie = {
    save: (user: AppUser) => {
      cookieService.set(
        'auth_user',
        JSON.stringify(user),
        7,
        '/',
        '',
        true,
        'Strict'
      );
    },
    load: () => {
      const storedUser = cookieService.get('auth_user');
      return storedUser ? JSON.parse(storedUser) : null;
    },
    clear: () => cookieService.delete('auth_user'),
  };

  // Initialize user from cookie
  currentUser.set(handleUserCookie.load());

  /**
   * Firebase Auth State Management
   *
   * Handles authentication state changes and syncs with local storage
   *
   * Flow:
   * 1. Sets loading state
   * 2. Fetches user data from Firestore if authenticated
   * 3. Updates cookie storage
   * 4. Updates application state
   * 5. Cleans up on logout
   */
  const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
    authStateLoading.set(true);

    try {
      if (user) {
        const appUser = await getUserFromFirestore(user.uid);

        if (appUser) {
          handleUserCookie.save(appUser);
          currentUser.set(appUser);
        }
      } else {
        handleUserCookie.clear();
        currentUser.set(null);
      }
    } finally {
      authStateLoading.set(false);
    }
  });

  async function getUserFromFirestore(uid: string): Promise<AppUser | null> {
    try {
      const userDoc = await getDoc(doc(firestore, `users/${uid}`));

      if (userDoc.exists()) {
        return userDoc.data() as AppUser;
      }

      return null;
    } catch (error) {
      throw new Error('Failed to fetch user profile');
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
    } catch (error) {
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
      handleUserCookie.clear();
      currentUser.set(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('An error occurred during logout. Please try again.');
    }
  }

  async function updateProfile(
    uid: string,
    profileData: Partial<AppUser>,
    photoFile?: File
  ): Promise<void> {
    try {
      if (photoFile) {
        if (photoFile.size > 5 * 1024 * 1024) {
          throw new Error('File size too large. Maximum size is 5MB.');
        }

        if (!photoFile.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }

        const filePath = `${uid}/${Date.now()}_${photoFile.name}`;

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
          .from('user-images')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl: imageUrl },
        } = supabase.storage.from('user-images').getPublicUrl(filePath);
        
        // Add the URL to the data object
        profileData.photoURL = imageUrl;

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

      await updateDoc(doc(firestore, `users/${uid}`), profileData);
      const updatedUser = await getUserFromFirestore(uid);

      currentUser.set(updatedUser);
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }

  // Cleanup
  destroyRef.onDestroy(() => {
    unsubscribeAuth();
  });

  return {
    currentUser,
    signUp,
    login,
    logout,
    updateProfile,
    authStateLoading,
  };
});
