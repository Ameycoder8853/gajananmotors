import type { StaticImageData } from "next/image";
import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'dealer' | 'admin';
  isPro: boolean;
  proExpiresAt: Date | null;
  createdAt: Date | Timestamp;
  subscriptionType?: 'Standard' | 'Premium';
  adCredits?: number;
};

export type FirebaseUser = import('firebase/auth').User & {
    role?: 'admin' | 'dealer';
    phone?: string;
    subscriptionType?: 'Standard' | 'Premium';
    adCredits?: number;
    isPro?: boolean;
    proExpiresAt?: Date | null;
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
  soldAt: Date | null;
  removedAt: Date | null;
  removalPaid: boolean;
  removalPaymentId: string | null;
  dealer?: User;
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

    