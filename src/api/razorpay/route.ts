
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const paymentSchema = z.object({
  planId: z.string().optional(),
  isYearly: z.boolean().optional().default(false),
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
    const { planId, isYearly } = paymentSchema.parse(body);

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
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Razorpay API Error:', error);
    const errorMessage = (error instanceof Error && 'message' in error && (error as any).error) ? (error as any).error.description : 'Something went wrong on the server.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
