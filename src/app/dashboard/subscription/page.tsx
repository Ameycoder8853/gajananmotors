
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const tiers = [
  {
    name: 'Standard',
    planId: process.env.NEXT_PUBLIC_RAZORPAY_STANDARD_PLAN_ID || 'replace_with_your_standard_plan_id',
    price: 500,
    credits: 10,
    features: ['10 ad listings', 'Standard support'],
  },
  {
    name: 'Premium',
    planId: process.env.NEXT_PUBLIC_RAZORPAY_PREMIUM_PLAN_ID || 'replace_with_your_premium_plan_id',
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

  const handlePayment = async (planId: string, credits: number, planName: 'Standard' | 'Premium') => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to make a purchase.',
      });
      return;
    }

    if (!planId || planId.startsWith('replace_with')) {
        toast({
            variant: 'destructive',
            title: 'Configuration Error',
            description: 'The subscription plan ID is not configured. Please contact support.',
        });
        return;
    }

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
      body: JSON.stringify({ planId }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: errorData.error || 'Failed to create Razorpay subscription.',
        });
        return;
    }

    const data = await res.json();
    if (!data || !data.id) {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Failed to parse Razorpay subscription response.',
      });
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: 'Gajanan Motors',
      description: `${planName} Subscription Purchase`,
      subscription_id: data.id,
      handler: function (response: any) {
        if (!user?.uid) {
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: 'User not found after payment. Please contact support.',
            });
            return;
        };

        const userDocRef = doc(firestore, 'users', user.uid);
        
        updateDocumentNonBlocking(userDocRef, {
          adCredits: credits,
          isPro: true,
          subscriptionType: planName,
          proExpiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)), // subscription for 1 month
        });

        toast({
          title: 'Payment Successful',
          description: `${credits} ad credits have been added to your account.`,
        });
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

  if (user?.isPro && user.subscriptionType) {
    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight">Your Subscription</h1>
                <p className="mt-2 text-lg text-muted-foreground">Manage your current plan and benefits.</p>
            </div>
            <div className="max-w-md mx-auto">
                <Card className="border-primary border-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl">{user.subscriptionType} Plan</CardTitle>
                            <div className="flex items-center gap-1 text-primary">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold">Current Plan</span>
                            </div>
                        </div>
                        <CardDescription>
                            Your plan is active and provides you with exclusive benefits.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Ad Credits</span>
                            <span className="font-bold text-2xl">{user.adCredits ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Plan Expires On</span>
                            <span className="font-semibold">{user.proExpiresAt ? new Date(user.proExpiresAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" disabled>Plan is Active</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
  }

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
              <Button className="w-full" onClick={() => handlePayment(tier.planId, tier.credits, tier.name as 'Standard' | 'Premium')}>
                Choose Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
