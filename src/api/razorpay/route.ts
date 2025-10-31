
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const paymentSchema = z.object({
  planId: z.string().optional(),
  isYearly: z.boolean().optional().default(false),
  amount: z.number(), // Amount in INR
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
    const { planId, isYearly, amount } = paymentSchema.parse(body);

    if (isYearly) {
      // Create a subscription for yearly plans
      if (!planId) {
        return NextResponse.json({ error: 'Plan ID is required for a yearly subscription.' }, { status: 400 });
      }
      const options = {
          plan_id: planId,
          total_count: 1, // Only 1 payment for a yearly plan
          customer_notify: 1
      };
      const subscription = await razorpay.subscriptions.create(options);
      return NextResponse.json(subscription, { status: 200 });

    } else {
      // Create a one-time order for monthly plans
      const options = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_order_${new Date().getTime()}`,
      };
      const order = await razorpay.orders.create(options);
      return NextResponse.json(order, { status: 200 });
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return a user-friendly error string instead of the complex error object
      return NextResponse.json({ error: 'Invalid data provided. Please check your details and try again.' }, { status: 400 });
    }
    console.error('Razorpay API Error:', error);
    const errorMessage = (error instanceof Error && 'message' in error && (error as any).error) ? (error as any).error.description : 'Something went wrong on the server.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
