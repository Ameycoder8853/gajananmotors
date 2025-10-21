'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { MOCK_ADS } from "@/lib/mock-data";
import { AdCard } from "@/components/market/AdCard";
import { Badge } from "@/components/ui/badge";
import { EyeOff } from "lucide-react";

export default function MyListingsPage() {
    const { user } = useAuth();

    // Mock data for now, filtering for the current user.
    // In a real app, this would be a Firestore query.
    const myListings = MOCK_ADS.filter(ad => ad.dealerId === user?.uid);

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold">My Listings</h1>
                <p className="text-muted-foreground">Manage your car advertisements. You have {user?.adCredits ?? 0} ad credits remaining.</p>
            </div>
            <Button asChild>
                <Link href="/dashboard/my-listings/new">Post a New Ad</Link>
            </Button>
        </div>

        {myListings.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map(ad => (
                    <div key={ad.id} className="relative">
                        <AdCard ad={ad} />
                        {ad.visibility === 'private' && (
                             <div className="absolute top-0 left-0 w-full h-full bg-black/50 rounded-lg flex flex-col items-center justify-center text-white p-4">
                                <EyeOff className="w-12 h-12" />
                                <p className="font-bold mt-2">Ad is Private</p>
                                <p className="text-sm text-center">Your subscription has expired. Renew to make this ad public again.</p>
                                <Button asChild variant="secondary" className="mt-4">
                                    <Link href="/dashboard/subscription">Renew Subscription</Link>
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
