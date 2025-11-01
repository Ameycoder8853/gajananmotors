
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const paymentSchema = z.object({
  planId: z.string(),
});

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
    const { planId } = paymentSchema.parse(body);

    const options = {
        plan_id: planId,
        total_count: 12, // For a 1-year subscription with monthly billing
        customer_notify: 1
    };

    const subscription = await razorpay.subscriptions.create(options);

    return NextResponse.json(subscription, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Razorpay API Error:', error);
    const errorMessage = (error instanceof Error && 'message' in error) ? (error as any).error?.description || 'Something went wrong' : 'Something went wrong';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
