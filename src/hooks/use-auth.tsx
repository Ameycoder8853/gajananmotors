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
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { FirebaseUser, User as AppUser } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  isUserLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone: string) => Promise<void>;
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
      // This is a simplified way to ensure an admin user exists.
      // In a real-world application, you would manage this through a secure admin interface or a setup script.
      const adminEmail = 'admin@gmail.com';
      const adminPassword = 'gajananmotors';
      try {
        // We try to sign in. If it fails, the user likely doesn't exist, so we create it.
        await signInWithEmailAndPassword(auth, 'test-user-creation@test.com', 'fakepassword');
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
          // This is a workaround to check if we can create the user.
        } else if (error.code === 'auth/invalid-credential') {
            // It means some user exists, so we try to create the admin.
             try {
                await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
                console.log('Admin user created successfully.');
             } catch (creationError: any) {
                if (creationError.code !== 'auth/email-already-in-use') {
                    console.error('Failed to create admin user:', creationError);
                }
             }
        }
      }
      // Sign out any temporary user. The onAuthStateChanged listener will handle the real user.
      if (auth.currentUser) {
          await signOut(auth);
      }
    };
    
    ensureAdminExists();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          const enhancedUser: FirebaseUser = {
            ...firebaseUser,
            ...userData,
          };
          setUser(enhancedUser);
        } else {
            // This could be a new user or admin
            if (firebaseUser.email === 'admin@gmail.com') {
                const adminUser: FirebaseUser = { ...firebaseUser, role: 'admin' };
                setUser(adminUser);
            } else {
                setUser(firebaseUser);
            }
        }
      } else {
        setUser(null);
      }
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    
    const userDocRef = doc(firestore, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      id: userCredential.user.uid,
      name,
      phone,
      email,
      role: 'dealer',
      isPro: false,
      proExpiresAt: null,
      createdAt: new Date(),
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
