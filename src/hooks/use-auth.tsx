
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
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, Timestamp, Firestore, collection, getDocs, writeBatch, query, orderBy, limit, where } from 'firebase/firestore';
import { initializeFirebase, errorEmitter, FirestorePermissionError, useFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { FirebaseUser, User as AppUser } from '@/lib/types';
import { useToast } from './use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  auth: Auth;
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

const subscriptionLimits = {
    'Standard': 10,
    'Premium': 20,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const { auth, firestore, isUserLoading: isFirebaseLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isFirebaseLoading || !auth || !firestore) {
      return; // Wait for firebase to be initialized
    }
    const ensureAdminExists = async () => {
      const adminEmail = 'admin@gmail.com';
      const adminPassword = 'gajananmotors';

      try {
        // Attempt to create the admin user. If the user already exists,
        // this will throw an 'auth/email-already-in-use' error, which we can safely ignore.
        const adminCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        const adminData: AppUser = {
          id: adminCred.user.uid,
          name: 'Admin',
          email: adminEmail,
          role: 'admin',
          phone: 'N/A',
          isPro: true,
          proExpiresAt: new Date(new Date().setDate(new Date().getDate() + 365 * 5)), // 5 years for admin
          createdAt: new Date(),
          adCredits: Infinity,
          verificationStatus: 'verified',
        };
        setDocumentNonBlocking(doc(firestore, 'users', adminCred.user.uid), adminData, { merge: false });
        // After creating the admin, sign them out immediately so it doesn't interfere with the current session.
        if (auth.currentUser?.email === adminEmail) {
            await signOut(auth);
        }
      } catch (error: any) {
        // If the admin user already exists, the creation will fail. This is expected and safe to ignore.
        // We only care about other potential errors during setup.
        if (error.code !== 'auth/email-already-in-use') {
          console.error('Failed to ensure admin user exists:', error);
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
              const oldPlan = appUser.subscriptionType;
              
              // Subscription expired
              appUser.isPro = false;
              appUser.adCredits = 0;
              appUser.subscriptionType = undefined;
              
              const batch = writeBatch(firestore);
              batch.update(userDocRef, { isPro: false, adCredits: 0, subscriptionType: null });
              
              if (oldPlan) {
                  // Make excess ads private
                  const adsRef = collection(firestore, 'cars');
                  const q = query(adsRef, where('dealerId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'));
                  const adsSnapshot = await getDocs(q);
                  
                  let publicAdsCount = 0;
                  adsSnapshot.forEach(adDoc => {
                      if (adDoc.data().visibility === 'public') {
                          publicAdsCount++;
                      }
                  });

                  if (publicAdsCount > 0) { // If there are more public ads than the new limit (which is 0)
                      const adsToMakePrivateQuery = query(adsRef, where('dealerId', '==', firebaseUser.uid), orderBy('createdAt', 'asc'));
                      const adsToMakePrivateSnapshot = await getDocs(adsToMakePrivateQuery);
                      let privateNeeded = publicAdsCount;
                      
                      adsToMakePrivateSnapshot.forEach(adDoc => {
                          if (privateNeeded > 0 && adDoc.data().visibility === 'public') {
                              batch.update(adDoc.ref, { visibility: 'private' });
                              privateNeeded--;
                          }
                      });
                  }
              }

              await batch.commit();

              toast({
                  title: "Subscription Expired",
                  description: "Your Pro plan has expired. Your ads are now private. Please renew to make them public again."
              });
            }

            const enhancedUser: FirebaseUser = { ...firebaseUser, ...appUser, photoURL: firebaseUser.photoURL, emailVerified: firebaseUser.emailVerified, isPhoneVerified: appUser.isPhoneVerified ?? false };
            setUser(enhancedUser);

            // Redirect based on role after login
            const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
            if (router && isLoginPage) { 
                if (appUser.role === 'admin') {
                    router.push('/dashboard');
                } else if (appUser.role === 'dealer') {
                    router.push('/dashboard/my-listings');
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
                    photoURL: firebaseUser.photoURL || '',
                    role: 'dealer',
                    phone: firebaseUser.phoneNumber || '',
                    isPro: false,
                    proExpiresAt: null,
                    createdAt: new Date(),
                    adCredits: 0,
                    verificationStatus: 'unverified'
                };
                setDocumentNonBlocking(userDocRef, newUser, { merge: false });
                const enhancedUser: FirebaseUser = { ...firebaseUser, ...newUser, photoURL: firebaseUser.photoURL, emailVerified: firebaseUser.emailVerified, isPhoneVerified: false };
                setUser(enhancedUser);
                if (router) router.push('/dashboard/my-listings');
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

  const loginWithEmail = (email: string, pass: string) => {
    if (!auth) return;
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
    if (!auth || !firestore) return;
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
        adCredits: 0,
        verificationStatus: 'unverified'
      };
      
      setDocumentNonBlocking(userDocRef, userData, { merge: false });
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
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will handle the rest
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
