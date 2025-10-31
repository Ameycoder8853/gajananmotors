
import type { StaticImageData } from "next/image";
import { Timestamp } from "firebase/firestore";
import { nanoid } from 'nanoid';

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  photoURL?: string;
  emailVerified?: boolean; // Added from FirebaseUser
  role: 'dealer' | 'admin';
  isPro?: boolean;
  proExpiresAt?: Date | null;
  createdAt: Date | Timestamp;
  subscriptionType?: 'Standard' | 'Premium' | 'Pro' | 'Standard Yearly' | 'Premium Yearly' | 'Pro Yearly';
  adCredits?: number;
  isPhoneVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  aadharUrl?: string;
  panUrl?: string;
  shopLicenseUrl?: string;
  referralCode: string;
  referredBy?: string;
  hasUsedReferral: boolean;
  nextSubscriptionDiscount: boolean;
};

export type FirebaseUser = import('firebase/auth').User & {
    role?: 'admin' | 'dealer';
    phone?: string;
    photoURL?: string;
    subscriptionType?: 'Standard' | 'Premium' | 'Pro' | 'Standard Yearly' | 'Premium Yearly' | 'Pro Yearly';
    adCredits?: number;
    isPro?: boolean;
    proExpiresAt?: Date | null;
    isPhoneVerified?: boolean;
    verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
    aadharUrl?: string;
    panUrl?: string;
    shopLicenseUrl?: string;
    referralCode?: string;
}

export type Ad = {
  id: string;
  dealerId: string;
  title: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  kmDriven: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'LPG';
  transmission: 'Automatic' | 'Manual';
  price: number;
  description: string;
  location: string;
  images: string[] | StaticImageData[];
  status: 'active' | 'sold' | 'removed';
  visibility: 'public' | 'private';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  soldAt: Date | null;
  removedAt: Date | null;
  removalPaid: boolean;
  removalPaymentId: string | null;
  dealer?: User;
  features?: string[];
};

export type Payment = {
  id: string;
  dealerId: string;
  adId: string | null;
  type: 'subscription' | 'removal';
  amount: number;
  currency: 'INR';
  razorpayPaymentId: string;
  status: 'created' | 'paid' | 'failed';
  createdAt: Date;
};
