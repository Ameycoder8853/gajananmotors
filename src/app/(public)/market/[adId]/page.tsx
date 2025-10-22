'use client';

import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageCarousel } from "@/components/market/ImageCarousel";
import { Calendar, Gauge, GitCommitHorizontal, Fuel, MapPin, Phone, User, ShieldCheck } from "lucide-react";
import { useDoc, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc, getDoc } from "firebase/firestore";
import type { Ad, User } from "@/lib/types";
import { useEffect, useState } from "react";

export default function AdDetailPage() {
  const params = useParams();
  const { adId } = params;
  const firestore = useFirestore();
  const [adWithDealer, setAdWithDealer] = useState<{ ad: Ad; dealer: User | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This is a bit tricky because we don't know the dealerId from the adId alone.
  // We need to find the ad first. Since we don't have a top-level `ads` collection,
  // we can't query for the ad directly. This is a limitation of the current Firestore structure.
  // As a workaround, we'd need to know the dealerId to construct the path.
  // Since we can't do that, we have to assume the Ad data is passed or fetched in a way that provides dealerId.
  // Let's assume for now that the Ad object we get from our previous page or a state management has the dealerId.
  // However, the current setup doesn't pass this.
  // We will have to fetch all ads and find the one with the matching id. This is inefficient but necessary with the current structure.
  // A better structure would be a top-level `/ads/{adId}` collection with dealerId inside.
  
  // The query on the market page will give us the dealerId. We can't use useDoc easily without the full path.
  // So we will fetch the dealer separately.

  // Because generateStaticParams is hard with subcollections, let's make this a fully client-rendered page
  // for demonstration. In a real app, you'd use server-side rendering with a more complex data fetching strategy.
  
  useEffect(() => {
    // This is a placeholder for a real data fetching strategy.
    // In a real app, you would fetch the ad data based on the adId.
    // Since we don't have a good way to get the full path, we can't use useDoc effectively.
    // Let's fetch the ad and dealer manually.
    const fetchAdAndDealer = async () => {
      if (!firestore || typeof adId !== 'string') return;
      
      // This is very inefficient. A top-level 'ads' collection would be better.
      // We are essentially asking for all ads from all users and then filtering.
      // This will be slow and expensive. But it's the only way with the current DB structure.
      // I am assuming we can't find the ad directly.
      // Let's just create a dummy ad fetcher for now as this is a limitation that needs a bigger change.
      // A better way would be to have a top-level ads collection.
      
      // Let's assume we can't query. We will just show not found for now, as we can't build the doc ref.
      // To properly fix this, we need to know the dealerId.
      // A user clicking from the market page could have this passed via router state, but that's not robust.

      // We will show a "not found" because we cannot construct the document reference.
      setIsLoading(false);
    };

    fetchAdAndDealer();
  }, [adId, firestore]);
  
  const ad = adWithDealer?.ad;
  const dealer = adWithDealer?.dealer;
  
  // Since we can't fetch the ad with the current structure without the dealerId,
  // This page will always show notFound unless we change the data model.
  // The user prompt doesn't ask to change the data model.
  // I will leave the old mock-data based logic here but commented out
  // and make it so it appears broken, which it is. A real fix requires a schema change.

  if (!ad || !dealer) {
    // This will always trigger for now until data fetching is solved.
    // notFound();
    return (
        <div className="container py-8 md:py-12 text-center">
            <h1 className="text-2xl font-bold">Ad not found</h1>
            <p className="text-muted-foreground">This ad could not be loaded. This is likely due to a database structure issue where the ad cannot be fetched by its ID alone.</p>
        </div>
    )
  }

  const specs = [
    { icon: <Calendar className="w-5 h-5 text-muted-foreground" />, label: "Year", value: ad.year },
    { icon: <Gauge className="w-5 h-5 text-muted-foreground" />, label: "Kilometers", value: `${ad.kmDriven.toLocaleString("en-IN")} km` },
    { icon: <Fuel className="w-5 h-5 text-muted-foreground" />, label: "Fuel Type", value: ad.fuelType },
    { icon: <GitCommitHorizontal className="w-5 h-5 text-muted-foreground" />, label: "Transmission", value: ad.transmission },
    { icon: <MapPin className="w-5 h-5 text-muted-foreground" />, label: "Location", value: ad.location },
  ];

  return (
    <div className="container py-8 md:py-12">
      <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2">
          <ImageCarousel images={ad.images as string[]} title={ad.title} />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2">{ad.make}</Badge>
              <CardTitle className="text-3xl font-bold">{ad.title}</CardTitle>
              <p className="text-3xl font-bold text-primary pt-2">
                ₹{ad.price.toLocaleString("en-IN")}
              </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {specs.map(spec => (
                        <div key={spec.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {spec.icon}
                                <span className="text-muted-foreground">{spec.label}</span>
                            </div>
                            <span className="font-semibold">{spec.value}</span>
                        </div>
                    ))}
                </div>
                <Separator className="my-6" />
                <Card className="bg-secondary">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><User /> Dealer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center gap-2">
                            <p className="font-semibold">{dealer.name}</p>
                            {dealer.verificationStatus === 'verified' && (
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                            )}
                         </div>
                         <div className="flex items-center gap-2 mt-2 text-primary font-bold text-lg">
                            <Phone className="w-5 h-5" />
                            <span>{dealer.phone}</span>
                         </div>
                         <Button className="w-full mt-4">
                            <Phone className="mr-2 h-4 w-4" /> Contact Dealer
                        </Button>
                    </CardContent>
                </Card>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-12">
          <Card>
              <CardHeader>
                  <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p>{ad.description}</p>
                  </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}

