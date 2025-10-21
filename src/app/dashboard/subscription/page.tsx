'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const tiers = [
  {
    name: 'Standard',
    price: 500,
    credits: 10,
    features: ['10 ad listings', 'Standard support'],
  },
  {
    name: 'Premium',
    price: 1000,
    credits: 20,
    features: ['20 ad listings', 'Premium support', 'Featured listings'],
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { firestore } = initializeFirebase();

  const handlePayment = async (amount: number, credits: number, planName: 'Standard' | 'Premium') => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to make a purchase.',
      });
      return;
    }

    // Ensure Razorpay script is loaded
    if (!window.Razorpay) {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Razorpay checkout is not available. Please refresh the page.',
      });
      return;
    }

    const res = await fetch('/api/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: errorData.error || 'Failed to create Razorpay order.',
        });
        return;
    }

    const data = await res.json();
    if (!data || !data.id) {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Failed to parse Razorpay order response.',
      });
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: 'Gajanan Motors',
      description: `${planName} Subscription Purchase`,
      order_id: data.id,
      handler: async function (response: any) {
        try {
          if (!user?.uid) throw new Error("User not found after payment.");

          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, {
            adCredits: credits,
            isPro: true,
            subscriptionType: planName,
            proExpiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)), // subscription for 1 month
          });

          toast({
            title: 'Payment Successful',
            description: `${credits} ad credits have been added to your account.`,
          });
          // Note: The useAuth hook will automatically redirect the user on state change.
        } catch (error) {
          console.error("Failed to update user document:", error);
          toast({
            variant: 'destructive',
            title: 'Update failed',
            description: 'Your payment was successful, but we failed to update your account. Please contact support.',
          });
        }
      },
      prefill: {
        name: user.displayName || 'Gajanan User',
        email: user.email || '',
        contact: user.phone || '',
      },
      theme: {
        color: '#F56565',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
        toast({
            variant: 'destructive',
            title: 'Payment Failed',
            description: response.error.description || 'Something went wrong during payment.',
        });
    });
    rzp.open();
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight">Subscription Plans</h1>
        <p className="mt-2 text-lg text-muted-foreground">Choose a plan that fits your needs to start posting ads.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold">₹{tier.price}</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handlePayment(tier.price, tier.credits, tier.name as 'Standard' | 'Premium')}>
                Choose Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
