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
import type { Ad, User as Dealer } from "@/lib/types";
import { useEffect, useState } from "react";

export default function AdDetailPage() {
  const params = useParams();
  const { adId } = params;
  const firestore = useFirestore();

  const adRef = useMemoFirebase(() => {
    if (!firestore || typeof adId !== 'string') return null;
    return doc(firestore, 'cars', adId);
  }, [firestore, adId]);

  const { data: ad, isLoading: isAdLoading } = useDoc<Ad>(adRef);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [isDealerLoading, setIsDealerLoading] = useState(true);
  
  useEffect(() => {
    const fetchDealer = async () => {
      if (ad && ad.dealerId && firestore) {
        setIsDealerLoading(true);
        const dealerRef = doc(firestore, 'users', ad.dealerId);
        const dealerSnap = await getDoc(dealerRef);
        if (dealerSnap.exists()) {
          setDealer(dealerSnap.data() as Dealer);
        }
        setIsDealerLoading(false);
      }
    };
    fetchDealer();
  }, [ad, firestore]);

  const isLoading = isAdLoading || isDealerLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (!ad) {
    return notFound();
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
                {dealer && (
                    <>
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
                    </>
                )}
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

    