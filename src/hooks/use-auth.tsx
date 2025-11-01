
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
  Auth,
  sendEmailVerification,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, Timestamp, Firestore, collection, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { initializeFirebase, errorEmitter, FirestorePermissionError, useFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { FirebaseUser, User as AppUser } from '@/lib/types';
import { useToast } from './use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  auth: Auth;
  isUserLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<any>;
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
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      convertTimestamps(data[key]);
    }
  }
  return data;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const { auth, firestore, isUserLoading: isFirebaseLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isFirebaseLoading || !auth || !firestore) {
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            let appUser = convertTimestamps(userDoc.data()) as AppUser;

            if (appUser.email === 'ameypatil261@gmail.com') {
              appUser.role = 'admin';
            }
            
            // Check for subscription expiry
            if (appUser.role === 'dealer' && appUser.isPro && appUser.proExpiresAt && new Date() > appUser.proExpiresAt) {
              
              appUser.isPro = false;
              appUser.adCredits = 0;
              appUser.subscriptionType = undefined;
              
              const batch = writeBatch(firestore);
              batch.update(userDocRef, { isPro: false, adCredits: 0, subscriptionType: null, razorpaySubscriptionId: null });
              
              const adsRef = collection(firestore, 'cars');
              const q = query(adsRef, where('dealerId', '==', firebaseUser.uid), where('visibility', '==', 'public'));
              const adsSnapshot = await getDocs(q);
              
              adsSnapshot.forEach((adDoc) => {
                  batch.update(adDoc.ref, { visibility: 'private' });
              });

              await batch.commit();

              toast({
                  variant: "destructive",
                  title: "Subscription Expired",
                  description: "Your Pro plan has expired. Your ads have been paused. Please renew to make them public again."
              });
            }

            const enhancedUser: FirebaseUser = { ...firebaseUser, ...appUser };
            setUser(enhancedUser);

          } else {
            const displayName = firebaseUser.displayName || 'New User';
            const email = firebaseUser.email;
            if (email) {
                const newUser: AppUser = {
                    id: firebaseUser.uid,
                    name: displayName,
                    email: email,
                    photoURL: firebaseUser.photoURL || '',
                    role: 'dealer',
                    phone: firebaseUser.phoneNumber || '',
                    createdAt: new Date(),
                    verificationStatus: 'unverified',
                    isPhoneVerified: false,
                };
                setDocumentNonBlocking(doc(firestore, 'users', firebaseUser.uid), newUser, { merge: false });
                const enhancedUser: FirebaseUser = { ...firebaseUser, ...newUser, photoURL: firebaseUser.photoURL };
                setUser(enhancedUser);
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
  }, [auth, firestore, router, toast, isFirebaseLoading]);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error("Auth service not initialized");
    try {
      const creds = await signInWithEmailAndPassword(auth, email, pass);
      
      const userDocRef = doc(firestore, 'users', creds.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const appUser = userDoc.data() as AppUser;
        if (appUser.email === 'ameypatil261@gmail.com' || appUser.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard/my-listings');
        }
      } else {
          router.push('/dashboard/my-listings');
      }
      return creds;
    } catch (error: any) {
       switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-email':
           toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'No account found with this email address.',
          });
          break;
        case 'auth/wrong-password':
           toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Incorrect password. Please try again.',
          });
          break;
        case 'auth/invalid-credential':
             toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid credentials. Please check your email and password.',
          });
          break;
        default:
           toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message,
          });
      }
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone: string) => {
    if (!auth || !firestore) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      await sendEmailVerification(userCredential.user);
      
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userData: AppUser = {
        id: userCredential.user.uid,
        name,
        phone,
        email,
        role: 'dealer',
        createdAt: new Date(),
        verificationStatus: 'unverified',
        isPhoneVerified: false,
      };
      
      setDocumentNonBlocking(userDocRef, userData, { merge: false });
      router.push('/email-verification');
      
    } catch (error: any) {
        let description = 'An unexpected error occurred.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already in use. Please log in or use a different email.';
        } else {
            description = error.message || 'An unknown error occurred during sign up.';
        }
        toast({
            variant: 'destructive',
            title: 'Sign Up Failed',
            description: description,
        });
        console.error("Sign up failed:", error);
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userDocRef = doc(firestore, 'users', result.user.uid);
    const userDoc = await getDoc(userDocRef);
     if (!userDoc.exists()) {
        const newUser: AppUser = {
            id: result.user.uid,
            name: result.user.displayName || 'New User',
            email: result.user.email!,
            photoURL: result.user.photoURL || '',
            role: 'dealer',
            phone: result.user.phoneNumber || '',
            createdAt: new Date(),
            isPhoneVerified: false,
            verificationStatus: 'unverified',
        };
        setDocumentNonBlocking(doc(firestore, 'users', result.user.uid), newUser, { merge: false });
    }
    router.push('/dashboard/my-listings');
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const value = {
    user,
    auth,
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
