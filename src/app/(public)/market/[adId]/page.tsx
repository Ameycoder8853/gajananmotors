import { notFound } from "next/navigation";
import { MOCK_ADS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageCarousel } from "@/components/market/ImageCarousel";
import { Calendar, Gauge, GitCommitHorizontal, Fuel, MapPin, Phone, User } from "lucide-react";

export async function generateStaticParams() {
  return MOCK_ADS.map((ad) => ({
    adId: ad.id,
  }));
}

export async function generateMetadata({ params }: { params: { adId: string } }) {
  const ad = MOCK_ADS.find((ad) => ad.id === params.adId);
  if (!ad) {
    return { title: "Ad Not Found" };
  }
  return {
    title: ad.title,
  };
}

export default function AdDetailPage({ params }: { params: { adId: string } }) {
  const ad = MOCK_ADS.find((ad) => ad.id === params.adId);

  if (!ad || !ad.dealer) {
    notFound();
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
                         <p className="font-semibold">{ad.dealer.name}</p>
                         <div className="flex items-center gap-2 mt-2 text-primary font-bold text-lg">
                            <Phone className="w-5 h-5" />
                            <span>{ad.dealer.phone}</span>
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
