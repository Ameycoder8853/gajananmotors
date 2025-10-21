import type { StaticImageData } from "next/image";

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'dealer' | 'admin';
  isPro: boolean;
  proExpiresAt: Date | null;
  createdAt: Date;
};

export type Ad = {
  id: string;
  dealerId: string;
  title: string;
  make: string;
  model: string;
  year: number;
  kmDriven: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'LPG';
  transmission: 'Automatic' | 'Manual';
  price: number;
  description: string;
  location: string;
  images: string[] | StaticImageData[];
  status: 'active' | 'sold' | 'removed';
  createdAt: Date;
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
