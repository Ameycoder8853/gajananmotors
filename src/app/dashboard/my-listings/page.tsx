'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function MyListingsPage() {
    const { user } = useAuth();

    // Mock data for now
    const myListings = [
        // { id: '1', title: '2021 Maruti Suzuki Swift', status: 'active', price: 550000 },
        // { id: '2', title: '2020 Hyundai Creta', status: 'sold', price: 1200000 },
    ];

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
                {/* We will map through user's ads here */}
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
