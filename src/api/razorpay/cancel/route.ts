
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const cancelSchema = z.object({
  subscriptionId: z.string(),
});

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay API keys are not set in environment variables.');
      return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await req.json();
    const validationResult = cancelSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid subscription ID provided.' }, { status: 400 });
    }
    
    const { subscriptionId } = validationResult.data;

    // By default, this cancels at the end of the current billing cycle.
    // To cancel immediately and issue a refund, you need to handle refunds separately.
    // For simplicity, we are cancelling immediately without a refund in this example.
    const cancellation = await razorpay.subscriptions.cancel(subscriptionId);
    
    // For immediate cancellation with refund, you would use:
    // const cancellation = await razorpay.subscriptions.cancel(subscriptionId, { cancel_at_cycle_end: false });
    // And then potentially create a refund:
    // await razorpay.payments.refund(paymentId, { amount: refundAmount });

    return NextResponse.json(cancellation, { status: 200 });
    
  } catch (error: any) {
    console.error('Razorpay Cancellation Error:', error);
    const errorMessage = error?.error?.description || 'An unexpected error occurred while cancelling the subscription.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
