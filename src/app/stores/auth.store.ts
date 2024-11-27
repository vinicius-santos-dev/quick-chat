import { createInjectable } from 'ngxtension/create-injectable';
import { inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  bio?: string;
  photoURL?: string;
}

// Create an injectable authentication store using ngxtension's utility
export const useAuthStore = createInjectable(() => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const currentUser = signal<AppUser | null>(null);

  // Set up Firebase auth state listener to keep user state in sync
  // This will run whenever the authentication state changes (login/logout)
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const appUser = await getUserFromFirestore(user.uid);
      currentUser.set(appUser);
    } else {
      currentUser.set(null);
    }
  });

  async function getUserFromFirestore(uid: string): Promise<AppUser | null> {
    const userDoc = await getDoc(doc(firestore, `users/${uid}`));
    if (userDoc.exists()) {
      return userDoc.data() as AppUser;
    }
    return null;
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
        photoURL: user.photoURL
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
  ) {
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

  async function login(email: string, password: string) {
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

  async function logout() {
    try {
      await signOut(auth);
      currentUser.set(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('An error occurred during logout. Please try again.');
    }
  }

  return {
    currentUser,
    signUp,
    login,
    logout,
  };
});
