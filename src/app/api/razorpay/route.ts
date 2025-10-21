import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const paymentSchema = z.object({
  amount: z.number().positive(),
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
    const { amount } = paymentSchema.parse(body);

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: 'INR',
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Razorpay API Error:', error);
    // Provide a more specific error if available from Razorpay
    const errorMessage = (error instanceof Error && 'message' in error) ? error.message : 'Something went wrong';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
