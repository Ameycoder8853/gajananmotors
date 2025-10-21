'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUserInternal,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useRouter } from 'next/navigation';
import { FirebaseUser, User as AppUser } from '@/lib/types';
import { useToast } from './use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  isUserLoading: boolean;
  loginWithEmail: (email: string, pass: string) => void;
  signUpWithEmail: (email: string, pass: string, name: string, phone: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const { firebaseApp } = initializeFirebase();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const ensureAdminExists = async () => {
      const adminEmail = 'admin@gmail.com';
      const adminPassword = 'gajananmotors';
      
      try {
        // We try to sign in with a temporary user to check if admin exists. This is a workaround.
        // In a real app, this logic would be on a secure backend.
        const tempUserCreds = await signInWithEmailAndPassword(auth, 'test-user-creation@test.com', 'fakepassword').catch(() => null);

        // This is a simplified check. A more robust way would be a backend check.
        // This is just to ensure the admin user gets created for the demo.
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email' || error.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          } catch (creationError: any) {
             if (creationError.code !== 'auth/email-already-in-use') {
                console.error('Failed to create admin user:', creationError);
            }
          }
        }
      } finally {
        if(auth.currentUser) {
          await signOut(auth);
        }
      }
    };
    
    ensureAdminExists();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          let appUser: AppUser | null = null;

          if (userDoc.exists()) {
            appUser = userDoc.data() as AppUser;
          } else if (firebaseUser.email === 'admin@gmail.com') {
            appUser = {
              id: firebaseUser.uid,
              name: 'Admin',
              email: firebaseUser.email,
              role: 'admin',
              phone: '',
              isPro: true,
              proExpiresAt: new Date(new Date().setDate(new Date().getDate() + 365)),
              createdAt: new Date(),
            };
          }
          
          if (appUser) {
            const enhancedUser: FirebaseUser = { ...firebaseUser, ...appUser };
            setUser(enhancedUser);

            // Redirect based on role
            if (appUser.role === 'admin') {
              router.push('/dashboard');
            } else if (appUser.role === 'dealer') {
              if (appUser.isPro && (appUser.adCredits ?? 0) > 0) {
                router.push('/dashboard/my-listings');
              } else {
                router.push('/dashboard/subscription');
              }
            }
          } else {
             // New user from Google Sign in maybe
             setUser(firebaseUser);
             router.push('/dashboard/subscription');
          }

        } catch (error) {
            const contextualError = new FirestorePermissionError({
                operation: 'get',
                path: userDocRef.path
            });
            errorEmitter.emit('permission-error', contextualError);
        }
      } else {
        setUser(null);
      }
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, router]);

  const loginWithEmail = (email: string, pass: string) => {
    signInWithEmailAndPassword(auth, email, pass).catch(error => {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
      });
      console.error("Login failed:", error);
    });
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userData: AppUser = {
        id: userCredential.user.uid,
        name,
        phone,
        email,
        role: 'dealer',
        isPro: false,
        proExpiresAt: null,
        createdAt: new Date(),
        adCredits: 0
      };
      
      await setDoc(userDocRef, userData);
      // Let the onAuthStateChanged handle the redirect
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
      });
      console.error("Sign up failed:", error);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const value = {
    user,
    isUserLoading,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
