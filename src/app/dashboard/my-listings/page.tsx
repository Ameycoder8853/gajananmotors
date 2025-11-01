
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
import { useToast } from "@/hooks/use-toast";

export default function MyListingsPage() {
    const { user, isUserLoading } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const myListingsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // Fetch all ads for the dealer, regardless of visibility
        return query(collection(firestore, 'cars'), where('dealerId', '==', user.uid));
    }, [firestore, user]);

    const { data: myListings, isLoading: areListingsLoading } = useCollection<Ad>(myListingsQuery);

    const isLoading = isUserLoading || areListingsLoading;
    
    const handleEditClick = () => {
        toast({
          title: "Feature Under Development",
          description: "We are currently working on the edit ad functionality. For now, please delete and repost the ad. We apologize for the inconvenience.",
          duration: 8000,
        });
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
      );
    }
  
    // This case covers users who have never subscribed or whose subscription has ended.
    if (user && !user.isPro) {
        return (
            <div className="animate-fade-in-up">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">My Listings</h1>
                        <p className="text-muted-foreground">You have no active subscription.</p>
                    </div>
                </div>

                {(myListings?.length ?? 0) === 0 ? (
                    <Card className="flex flex-col items-center justify-center text-center p-12 transition-all duration-300 hover:shadow-lg animate-fade-in-up">
                        <CardHeader>
                            <CardTitle>Get Started with a Subscription</CardTitle>
                            <CardDescription>You need an active plan to list your cars in the marketplace.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                 <Link href="/subscription">View Subscription Plans</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card className="mb-6 bg-destructive/10 border-destructive/20 animate-fade-in">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h3 className="font-semibold text-destructive">Your Ads are Paused</h3>
                                        <p className="text-sm text-muted-foreground">Your subscription has ended. Renew it to make your listings public again.</p>
                                    </div>
                                    <Button asChild className="ml-auto">
                                        <Link href="/subscription">Renew Subscription</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myListings?.map((ad, index) => (
                                <div key={ad.id} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <AdCard ad={ad} />
                                    {/* All ads will be private in this state */}
                                    <div className="absolute top-0 left-0 w-full h-full bg-black/60 rounded-lg flex flex-col items-center justify-center text-white p-4 text-center animate-fade-in">
                                        <EyeOff className="w-12 h-12" />
                                        <p className="font-bold mt-2">Ad is Private</p>
                                        <p className="text-sm">This ad is not visible in the public marketplace.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // This case is for active subscribers.
    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">My Listings</h1>
                    <p className="text-muted-foreground">You have {user?.adCredits ?? 0} ad credits remaining.</p>
                </div>
                <Button asChild disabled={(user?.adCredits ?? 0) <= 0}>
                    <Link href="/dashboard/my-listings/new">Post a New Ad</Link>
                </Button>
            </div>

            {(user?.adCredits ?? 0) <= 0 && (myListings?.length ?? 0) > 0 && (
                <Card className="mb-6 bg-amber-50 border-amber-200 animate-fade-in">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h3 className="font-semibold">You're out of ad credits!</h3>
                                <p className="text-sm text-muted-foreground">To post a new ad, please upgrade your plan or delete an existing one.</p>
                            </div>
                            <Button asChild className="ml-auto">
                                <Link href="/subscription">Manage Subscription</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {myListings && myListings.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map((ad, index) => (
                        <div key={ad.id} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <AdCard ad={ad} />
                            {ad.visibility === 'private' && (
                                <div className="absolute top-0 left-0 w-full h-full bg-black/60 rounded-lg flex flex-col items-center justify-center text-white p-4 text-center animate-fade-in">
                                    <EyeOff className="w-12 h-12" />
                                    <p className="font-bold mt-2">Ad is Private</p>
                                    {ad.moderationReason ? (
                                        <>
                                            <p className="text-sm mt-2">This ad was made private by an admin.</p>
                                            <p className="text-xs italic mt-1 text-gray-300">Reason: {ad.moderationReason}</p>
                                            <Button onClick={handleEditClick} variant="secondary" className="mt-4">
                                                Edit Ad
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm">This ad exceeds your plan's limit and is not public.</p>
                                            <Button asChild variant="secondary" className="mt-4">
                                                <Link href="/subscription">Upgrade Plan</Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
            ) : (
                <Card className="flex flex-col items-center justify-center text-center p-12 animate-fade-in-up transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                        <CardTitle>No Listings Yet</CardTitle>
                        <CardDescription>You haven't posted any car ads.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild disabled={(user?.adCredits ?? 0) <= 0}>
                             <Link href="/dashboard/my-listings/new">Post Your First Ad</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
