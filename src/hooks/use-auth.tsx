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
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';

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

  useEffect(() => {
    const ensureAdminExists = async () => {
      const adminEmail = 'admin@gmail.com';
      const adminPassword = 'gajananmotors';
      
      try {
        // Temporarily sign in to check for user, this won't persist
        await signInWithEmailAndPassword(auth, 'test-user-creation@test.com', 'fakepassword');
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email' || error.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          } catch (creationError: any) {
             if (creationError.code !== 'auth/email-already-in-use') {
                console.error('Failed to create admin user:', creationError);
            }
          } finally {
             if(auth.currentUser) {
              await signOut(auth);
            }
          }
        }
      } finally {
        if (auth.currentUser && auth.currentUser.email !== adminEmail) {
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
          if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser;
            const enhancedUser: FirebaseUser = {
              ...firebaseUser,
              ...userData,
            };
            setUser(enhancedUser);
          } else {
              if (firebaseUser.email === 'admin@gmail.com') {
                  const adminUser: FirebaseUser = { ...firebaseUser, role: 'admin' };
                  setUser(adminUser);
              } else {
                  setUser(firebaseUser);
              }
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
  }, [auth, firestore]);

  const loginWithEmail = (email: string, pass: string) => {
    signInWithEmailAndPassword(auth, email, pass).catch(error => {
      console.error("Login failed:", error);
    });
  };

  const signUpWithEmail = (email: string, pass: string, name: string, phone: string) => {
    createUserWithEmailAndPassword(auth, email, pass).then(userCredential => {
      updateProfile(userCredential.user, { displayName: name });
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
      setDoc(userDocRef, userData)
        .catch(error => {
            const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: userDocRef.path,
                requestResourceData: userData,
            });
            errorEmitter.emit('permission-error', contextualError);
        });
    }).catch(error => {
      console.error("Sign up failed:", error);
    });
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
