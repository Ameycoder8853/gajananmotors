
'use client';

import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageCarousel } from "@/components/market/ImageCarousel";
import { Car, Calendar, Gauge, GitBranch, Fuel, MapPin, Phone, User, ShieldCheck } from "lucide-react";
import { useDoc } from "@/firebase";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { doc, getDoc } from "firebase/firestore";
import type { Ad, User as Dealer } from "@/lib/types";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

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
    { label: "Make", value: ad.make },
    { label: "Model", value: ad.model },
    { label: "Variant", value: ad.variant },
    { label: "Year of manufacture", value: ad.year },
    { label: "Kilometers driven", value: `${ad.kmDriven.toLocaleString("en-IN")} km` },
    { label: "Fuel Type", value: ad.fuelType },
    { label: "Transmission", value: ad.transmission },
    { label: "Location", value: ad.location },
  ];

  return (
    <div className="container py-8 md:py-12">
        <div className="mb-4">
            <Badge className="w-fit mb-2">{ad.make}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold">{ad.title}</h1>
            <p className="text-3xl font-bold text-primary pt-2">
                ₹{ad.price.toLocaleString("en-IN")}
            </p>
        </div>
      <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-2">
          <ImageCarousel images={ad.images as string[]} title={ad.title} />
           <Tabs defaultValue="overview" className="w-full mt-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardContent className="pt-6">
                   <Table>
                    <TableBody>
                      {specs.map(spec => (
                        <TableRow key={spec.label}>
                          <TableCell className="font-medium text-muted-foreground">{spec.label}</TableCell>
                          <TableCell className="font-semibold text-right">{spec.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
             <TabsContent value="description">
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
            </TabsContent>
            <TabsContent value="features">
              <Card>
                <CardContent className="pt-6">
                  <p>Features will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-1 sticky top-24">
            {dealer && (
                <Card className="border-primary border-2 shadow-lg">
                    <CardHeader className="bg-primary/5 text-center">
                        <div className="flex items-center gap-2 justify-center">
                            <h2 className="text-xl font-bold">{dealer.name}</h2>
                            {dealer.verificationStatus === 'verified' && (
                                <ShieldCheck className="w-6 h-6 text-blue-500 fill-current" />
                            )}
                        </div>
                         <CardTitle className="text-sm font-normal text-muted-foreground">Official Dealer</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 text-center">
                        <div className="flex items-center gap-2 mt-2 text-primary font-bold text-2xl justify-center">
                            <Phone className="w-6 h-6" />
                            <span>{dealer.phone}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Call the dealer for the best price</p>
                        <Button asChild className="w-full mt-4" size="lg">
                            <a href={`tel:${dealer.phone}`}>
                                <Phone className="mr-2 h-5 w-5" /> Contact Dealer
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
