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
import { getFirestore, doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
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

// Helper to convert Firestore Timestamps to Dates
const convertTimestamps = (data: any) => {
  if (!data) return data;
  for (const key in data) {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate();
    }
  }
  return data;
}

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
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        await signOut(auth);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          try {
            const adminCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
             const adminData: AppUser = {
              id: adminCred.user.uid,
              name: 'Admin',
              email: adminEmail,
              role: 'admin',
              phone: 'N/A',
              isPro: true,
              proExpiresAt: new Date(new Date().setDate(new Date().getDate() + 365*5)), // 5 years for admin
              createdAt: new Date(),
              adCredits: Infinity
            };
            await setDoc(doc(firestore, 'users', adminCred.user.uid), adminData);
            await signOut(auth);
          } catch (creationError: any) {
             if (creationError.code !== 'auth/email-already-in-use') {
                console.error('Failed to create admin user:', creationError);
            }
          }
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
            let appUser = convertTimestamps(userDoc.data()) as AppUser;
            
            // Check for subscription expiry
            if (appUser.role === 'dealer' && appUser.isPro && appUser.proExpiresAt && new Date() > appUser.proExpiresAt) {
              // Subscription expired
              appUser.isPro = false;
              appUser.adCredits = 0;
              await updateDoc(userDocRef, { isPro: false, adCredits: 0 });
              toast({
                  title: "Subscription Expired",
                  description: "Your Pro plan has expired. Please renew to keep your ads public."
              });
            }

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
             // New user from Google Sign in maybe, or something went wrong
             // Let's create a basic user doc if they don't have one
            const displayName = firebaseUser.displayName || 'New User';
            const email = firebaseUser.email;
            if (email) {
                const newUser: AppUser = {
                    id: firebaseUser.uid,
                    name: displayName,
                    email: email,
                    role: 'dealer',
                    phone: firebaseUser.phoneNumber || '',
                    isPro: false,
                    proExpiresAt: null,
                    createdAt: new Date(),
                    adCredits: 0
                };
                await setDoc(userDocRef, newUser);
                const enhancedUser: FirebaseUser = { ...firebaseUser, ...newUser };
                setUser(enhancedUser);
                router.push('/dashboard/subscription');
            }
          }

        } catch (error) {
            console.error("Error fetching user data:", error);
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
  }, [auth, firestore, router, toast]);

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
    // onAuthStateChanged will handle the rest
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
