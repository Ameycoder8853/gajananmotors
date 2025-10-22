'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { AdCard } from "@/components/market/AdCard";
import { EyeOff } from "lucide-react";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import type { Ad } from "@/lib/types";

export default function MyListingsPage() {
    const { user, isUserLoading } = useAuth();
    const firestore = useFirestore();

    const myListingsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'cars'), where('dealerId', '==', user.uid));
    }, [firestore, user]);

    const { data: myListings, isLoading: areListingsLoading } = useCollection<Ad>(myListingsQuery);

    const isLoading = isUserLoading || areListingsLoading;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
      );
    }
  
    if (user && !user.isPro) {
        return (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">My Listings</h1>
                        <p className="text-muted-foreground">You have no active subscription.</p>
                    </div>
                </div>
                <Card className="flex flex-col items-center justify-center text-center p-12">
                    <CardHeader>
                        <CardTitle>Get Started with a Subscription</CardTitle>
                        <CardDescription>You need an active plan to list your cars in the marketplace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                             <Link href="/dashboard/subscription">View Subscription Plans</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">My Listings</h1>
                    <p className="text-muted-foreground">You have {user?.adCredits ?? 0} ad credits remaining.</p>
                </div>
                <Button asChild disabled={(user?.adCredits ?? 0) <= 0}>
                    <Link href="/dashboard/my-listings/new">Post a New Ad</Link>
                </Button>
            </div>

            {(user?.adCredits ?? 0) <= 0 && (
                <Card className="mb-6 bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h3 className="font-semibold">You're out of ad credits!</h3>
                                <p className="text-sm text-muted-foreground">Please upgrade your subscription to post more ads.</p>
                            </div>
                            <Button asChild className="ml-auto">
                                <Link href="/dashboard/subscription">Upgrade Plan</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {myListings && myListings.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map(ad => (
                        <div key={ad.id} className="relative">
                            <AdCard ad={ad} />
                            {ad.visibility === 'private' && (
                                 <div className="absolute top-0 left-0 w-full h-full bg-black/60 rounded-lg flex flex-col items-center justify-center text-white p-4 text-center">
                                    <EyeOff className="w-12 h-12" />
                                    <p className="font-bold mt-2">Ad is Private</p>
                                    <p className="text-sm">This ad is not visible in the public marketplace because your subscription has expired or downgraded. Renew to make it public.</p>
                                    <Button asChild variant="secondary" className="mt-4">
                                        <Link href="/dashboard/subscription">Manage Subscription</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
            ) : (
                <Card className="flex flex-col items-center justify-center text-center p-12">
                    <CardHeader>
                        <CardTitle>No Listings Yet</CardTitle>
                        <CardDescription>You haven't posted any car ads.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                             <Link href="/dashboard/my-listings/new">Post Your First Ad</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    