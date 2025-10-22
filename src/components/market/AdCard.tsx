import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ad } from "@/lib/types";
import { MapPin, Calendar, Gauge, GitCommitHorizontal, Fuel, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type AdCardProps = {
  ad: Ad;
};

export function AdCard({ ad }: AdCardProps) {
  const imageUrl = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : `https://picsum.photos/seed/${ad.id}/600/400`;

  return (
    <Card className="overflow-hidden h-full flex flex-col group">
      <div className="relative aspect-video overflow-hidden">
        <Link href={`/market/${ad.id}`}>
          <Image
            src={imageUrl as string}
            alt={ad.title}
            width={600}
            height={400}
            className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${ad.make} ${ad.model}`}
          />
        </Link>
        {ad.dealer?.verificationStatus === 'verified' && (
            <div className="absolute top-3 left-3 bg-blue-500 text-white rounded-full p-1.5" title="Verified Dealer">
                <ShieldCheck className="w-4 h-4" />
            </div>
        )}
        <Badge 
            className={cn(
                "absolute top-3 right-3",
                ad.status === 'sold' ? 'bg-destructive text-destructive-foreground' : 'bg-primary/80 backdrop-blur-sm text-primary-foreground'
            )}
        >
          {ad.status === 'sold' ? 'Sold' : 'For Sale'}
        </Badge>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-lg leading-snug truncate group-hover:text-primary">
          <Link href={`/market/${ad.id}`}>{ad.title}</Link>
        </h3>
        <p className="font-semibold text-xl text-primary mt-1 mb-3">
          ₹{ad.price.toLocaleString("en-IN")}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{ad.year}</span>
            </div>
            <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 shrink-0" />
                <span>{ad.kmDriven.toLocaleString("en-IN")} km</span>
            </div>
            <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 shrink-0" />
                <span>{ad.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
                <GitCommitHorizontal className="w-4 h-4 shrink-0" />
                <span>{ad.transmission}</span>
            </div>
        </div>
        
        <div className="border-t mt-4 pt-3 flex items-center justify-between text-xs text-muted-foreground">
             <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{ad.location}</span>
             </div>
             <span>{ad.createdAt ? new Date(ad.createdAt as any).toLocaleDateString() : ''}</span>
        </div>
      </CardContent>
    </Card>
  );
}
