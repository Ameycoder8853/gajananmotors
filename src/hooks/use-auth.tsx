
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
import { getFirestore, doc, setDoc, getDoc, updateDoc, Timestamp, Firestore, collection, getDocs, writeBatch, query, orderBy, limit, where } from 'firebase/firestore';
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
    }
  }
  return data;
}

const subscriptionLimits = {
    'Standard': 10,
    'Premium': 20,
};

// This function will run once to ensure the admin user exists in Firebase Auth and Firestore.
// It is designed to be run manually or as part of a deployment script, not on every app load.
const ensureAdminExists = async (auth: Auth, firestore: Firestore) => {
  const adminEmail = 'ameypatil261@gmail.com';
  const adminPassword = 'gajananmotors';

  try {
    // This will create the user if they don't exist.
    // It throws 'auth/email-already-in-use' if they do, which we can safely ignore.
    const adminCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    
    // If creation was successful, this is the first time. Let's create their Firestore doc.
    const adminData: AppUser = {
      id: adminCred.user.uid,
      name: 'Admin',
      email: adminEmail,
      role: 'admin',
      phone: 'N/A',
      createdAt: new Date(),
      isPro: true,
      adCredits: Infinity,
      verificationStatus: 'verified',
      emailVerified: true,
      isPhoneVerified: true,
    };
    await setDoc(doc(firestore, 'users', adminCred.user.uid), adminData);
    console.log('Admin user successfully created.');

    // Important: Sign out the admin immediately after creation so it doesn't affect the current user's session.
    if (auth.currentUser?.email === adminEmail) {
      await signOut(auth);
      console.log('Admin signed out post-creation.');
    }
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      // This is expected and fine. The admin user already exists.
    } else {
      // Log any other errors during this setup.
      console.error('Critical error during admin user setup:', error);
    }
  }
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
    
    // On the first load of the app, ensure the admin user exists.
    // This is safer than running it on every state change.
    ensureAdminExists(auth, firestore);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            let appUser = convertTimestamps(userDoc.data()) as AppUser;

            // Explicitly set admin role if email matches
            if (appUser.email === 'ameypatil261@gmail.com') {
              appUser.role = 'admin';
            }
            
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
                    createdAt: new Date(),
                    verificationStatus: 'unverified'
                };
                setDocumentNonBlocking(doc(firestore, 'users', firebaseUser.uid), newUser, { merge: false });
                const enhancedUser: FirebaseUser = { ...firebaseUser, ...newUser, photoURL: firebaseUser.photoURL, emailVerified: firebaseUser.emailVerified, isPhoneVerified: false };
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
    const creds = await signInWithEmailAndPassword(auth, email, pass);
    
    // Redirect after successful login
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
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone: string) => {
    if (!auth || !firestore) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userData: AppUser = {
        id: userCredential.user.uid,
        name,
        phone,
        email,
        role: 'dealer',
        createdAt: new Date(),
        verificationStatus: 'unverified'
      };
      
      setDocumentNonBlocking(userDocRef, userData, { merge: false });
      router.push('/email-verification');
      
    } catch (error: any) {
        let description = 'An unexpected error occurred.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already in use. Please log in or use a different email.';
        } else {
            description = error.message;
        }
        toast({
            variant: 'destructive',
            title: 'Sign Up Failed',
            description,
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
            verificationStatus: 'unverified'
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
