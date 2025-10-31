
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { config } from 'dotenv';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

config(); // Load environment variables from .env file

const paymentSchema = z.object({
  planId: z.string().optional(),
  amount: z.number().optional(),
  isYearly: z.boolean().optional().default(false),
  isReferralPurchase: z.boolean().optional().default(false),
});

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}
const db = getFirestore();

async function verifyReferralCode(referralCode: string, userId: string): Promise<{valid: boolean; message: string; referrer: any | null}> {
  if (!referralCode) return { valid: false, message: 'No code provided.', referrer: null };

  const usersRef = db.collection('users');
  const userSnapshot = await usersRef.doc(userId).get();
  const userData = userSnapshot.data();

  if (userData?.hasUsedReferral) {
    return { valid: false, message: 'You have already used a referral code.', referrer: null };
  }
  
  const q = usersRef.where('referralCode', '==', referralCode);
  const snapshot = await q.get();
  
  if (snapshot.empty) {
    return { valid: false, message: 'Invalid referral code.', referrer: null };
  }
  
  const referrer = snapshot.docs[0].data();
  if (snapshot.docs[0].id === userId) {
      return { valid: false, message: "You cannot use your own referral code.", referrer: null };
  }

  return { valid: true, message: 'Code is valid.', referrer };
}


export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay API keys are not set in environment variables.');
      return NextResponse.json({ error: 'Payment service is not configured. Please contact support.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await req.json();
    const { planId, isYearly, amount, isReferralPurchase } = paymentSchema.parse(body);

    if (isReferralPurchase) {
      // Create a one-time order for referral purchases
      if (!amount) {
        return NextResponse.json({ error: 'Amount is required for referral purchase.' }, { status: 400 });
      }
      const orderOptions = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: `rcpt_${new Date().getTime()}`,
      };
      const order = await razorpay.orders.create(orderOptions);
      return NextResponse.json(order, { status: 200 });

    } else {
       // Create a subscription for regular purchases
      if (!planId) {
        return NextResponse.json({ error: 'Plan ID is required for subscription.' }, { status: 400 });
      }
      const options = {
          plan_id: planId,
          total_count: isYearly ? 1 : 12, // 1 payment for yearly, 12 monthly payments for a year
          customer_notify: 1
      };
      const subscription = await razorpay.subscriptions.create(options);
      return NextResponse.json(subscription, { status: 200 });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Razorpay API Error:', error);
    const errorMessage = (error instanceof Error && 'message' in error) ? (error as any).error?.description || 'Something went wrong' : 'Something went wrong';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
