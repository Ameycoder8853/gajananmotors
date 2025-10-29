
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const monthlyTiers = [
  {
    name: 'Standard' as const,
    planId: process.env.NEXT_PUBLIC_RAZORPAY_STANDARD_PLAN_ID || 'replace_with_your_standard_plan_id',
    price: 500,
    priceSuffix: '/month',
    credits: 10,
    features: ['10 ad listings', 'Standard support'],
  },
  {
    name: 'Premium' as const,
    planId: process.env.NEXT_PUBLIC_RAZORPAY_PREMIUM_PLAN_ID || 'replace_with_your_premium_plan_id',
    price: 1000,
    priceSuffix: '/month',
    credits: 20,
    features: ['20 ad listings', 'Premium support', 'Featured listings'],
  },
  {
    name: 'Pro' as const,
    planId: process.env.NEXT_PUBLIC_RAZORPAY_PRO_PLAN_ID || 'replace_with_your_pro_plan_id',
    price: 2000,
    priceSuffix: '/month',
    credits: 50,
    features: ['50 ad listings', 'Premium support', 'Featured listings'],
  }
];

const yearlyTiers = [
    {
        name: 'Standard Yearly' as const,
        planId: process.env.NEXT_PUBLIC_RAZORPAY_STANDARD_YEARLY_PLAN_ID || 'replace_with_standard_yearly_id',
        price: 5000,
        priceSuffix: '/year',
        credits: 120, // 10 * 12
        features: ['120 ad listings', 'Standard support', 'Save ?1000'],
    },
    {
        name: 'Premium Yearly' as const,
        planId: process.env.NEXT_PUBLIC_RAZORPAY_PREMIUM_YEARLY_PLAN_ID || 'replace_with_premium_yearly_id',
        price: 10000,
        priceSuffix: '/year',
        credits: 240, // 20 * 12
        features: ['240 ad listings', 'Premium support', 'Featured listings', 'Save ?2000'],
    },
    {
        name: 'Pro Yearly' as const,
        planId: process.env.NEXT_PUBLIC_RAZORPAY_PRO_YEARLY_PLAN_ID || 'replace_with_pro_yearly_id',
        price: 20000,
        priceSuffix: '/year',
        credits: 600, // 50 * 12
        features: ['600 ad listings', 'Premium support', 'Featured listings', 'Save ?4000'],
    }
];

const allTiers = [...monthlyTiers, ...yearlyTiers];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const { user, isUserLoading } = useAuth();
  const { toast } = useToast();
  const { firestore } = initializeFirebase();
  const router = useRouter();

  const handlePayment = async (planId: string, credits: number, planName: string, isUpgrade: boolean = false, isYearly: boolean = false) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to purchase a subscription. Redirecting to login...',
      });
      router.push('/login');
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
        
        const expiryDate = new Date();
        if (isYearly) {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
        }

        const updateData: any = {
          isPro: true,
          subscriptionType: planName,
          proExpiresAt: expiryDate,
        };

        if (isUpgrade) {
            // For upgrades, we add the new credits.
            // A more complex system might prorate this.
            updateData.adCredits = increment(credits);
        } else {
            updateData.adCredits = credits;
        }

        updateDocumentNonBlocking(userDocRef, updateData);

        toast({
          title: isUpgrade ? 'Upgrade Successful!' : 'Payment Successful',
          description: `${credits} ad credits have been added to your account.`,
        });
        router.push('/dashboard/my-listings');
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

  const renderTierCard = (tier: (typeof allTiers)[0], isCurrent: boolean, isUpgradeOption: boolean, isYearly: boolean) => {
    return (
      <Card key={tier.name} className={cn("flex flex-col animate-fade-in-up transition-all duration-300 hover:shadow-lg hover:-translate-y-1", isCurrent && "border-primary border-2")}>
        <CardHeader>
          <div className="flex justify-between items-center">
             <CardTitle className="text-2xl">{tier.name.replace(' Yearly', '')}</CardTitle>
             {isCurrent && (
                <div className="flex items-center gap-1 text-primary">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold">Current Plan</span>
                </div>
             )}
          </div>
          <CardDescription>
            <span className="text-4xl font-bold">?{tier.price}</span>
            <span className="text-muted-foreground">{tier.priceSuffix}</span>
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
            {isCurrent ? (
                <Button className="w-full" disabled>Your Current Plan</Button>
            ) : (
                 <Button className="w-full" onClick={() => handlePayment(tier.planId, tier.credits, tier.name, isUpgradeOption, isYearly)}>
                    {isUpgradeOption ? `Switch to ${tier.name.replace(' Yearly', '')}` : 'Choose Plan'}
                </Button>
            )}
        </CardFooter>
      </Card>
    )
  }
  
  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }

  // Common layout for all subscription views
  return (
    <div className="py-12 animate-fade-in-up">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight">Subscription Plans</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                {user?.isPro ? 'Manage your current plan or choose a different one.' : 'Choose a plan that fits your needs to start posting ads.'}
            </p>
        </div>
        
        {user && user.isPro && user.subscriptionType && (
            <div className="max-w-2xl mx-auto mb-12">
                 <Card className="border-primary border-2 animate-fade-in-up">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl">{user.subscriptionType.replace(' Yearly', '')} Plan</CardTitle>
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
                </Card>
            </div>
        )}

       {user && user.verificationStatus !== 'verified' && (
        <Alert className="max-w-4xl mx-auto mb-8 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Account Verification Recommended</AlertTitle>
          <AlertDescription>
            You can purchase a subscription now, but you must complete account verification before you can post any ads.
             <Button variant="link" asChild className="p-1 h-auto">
                <Link href="/dashboard/verification">Complete Verification</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="monthly" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly Plans</TabsTrigger>
            <TabsTrigger value="yearly">Yearly Plans (Save up to 20%)</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {monthlyTiers.map((tier, index) => (
                    <div key={tier.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                        {renderTierCard(tier, user?.subscriptionType === tier.name, !!user?.isPro, false)}
                    </div>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="yearly">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {yearlyTiers.map((tier, index) => (
                    <div key={tier.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                         {renderTierCard(tier, user?.subscriptionType === tier.name, !!user?.isPro, true)}
                    </div>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


    