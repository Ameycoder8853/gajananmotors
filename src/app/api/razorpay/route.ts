import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const paymentSchema = z.object({
  amount: z.number().positive(),
});

export async function POST(req: Request) {
  try {
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
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
