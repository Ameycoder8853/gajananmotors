
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Car, BarChart, CreditCard, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import type { User, Ad } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminDashboardPage() {
    const { user, isUserLoading } = useAuth();
    const router = useRouter();
    const firestore = useFirestore();

    // Fetch all dealers
    const dealersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'dealer'));
    }, [firestore]);
    const { data: dealers, isLoading: isDealersLoading } = useCollection<User>(dealersQuery);

    // Fetch all ads
    const adsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'cars'));
    }, [firestore]);
    const { data: ads, isLoading: areAdsLoading } = useCollection<Ad>(adsQuery);
    
    // Fetch recent ads
    const recentAdsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'cars'), orderBy('createdAt', 'desc'), limit(5));
    }, [firestore]);
    const { data: recentAds, isLoading: areRecentAdsLoading } = useCollection<Ad>(recentAdsQuery);


    const isLoading = isUserLoading || isDealersLoading || areAdsLoading || areRecentAdsLoading;

    if (isLoading || !user || user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
            </div>
        );
    }

    const totalDealers = dealers?.length ?? 0;
    const activeSubscriptions = dealers?.filter(d => d.isPro).length ?? 0;
    const activeListings = ads?.filter(ad => ad.status === 'active').length ?? 0;
    const adsSold = ads?.filter(ad => ad.status === 'sold').length ?? 0;
    
    const getInitials = (name?: string | null) => {
      if (!name) return 'U';
      return name.split(' ').map(n => n[0]).join('');
    };

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Dealers
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDealers}</div>
                        <p className="text-xs text-muted-foreground">
                            All registered dealers
                        </p>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeSubscriptions}</div>
                        <p className="text-xs text-muted-foreground">
                            Dealers with an active plan
                        </p>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeListings}</div>
                        <p className="text-xs text-muted-foreground">
                            Cars currently for sale
                        </p>
                    </CardContent>
                </Card>
                 <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ads Sold</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adsSold}</div>
                        <p className="text-xs text-muted-foreground">
                            Total cars marked as sold
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentAds && recentAds.length > 0 ? (
                           <div className="space-y-4">
                            {recentAds.map((ad) => (
                                <div key={ad.id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] as string : undefined} alt="Ad" />
                                        <AvatarFallback><Car /></AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{ad.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                           Listed for ₹{ad.price.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {ad.createdAt && new Date(ad.createdAt as any).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                           </div>
                        ) : (
                           <p className="text-muted-foreground">No recent activity to show.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
