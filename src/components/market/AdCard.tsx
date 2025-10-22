'use client';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ad, FirebaseUser } from "@/lib/types";
import { MapPin, Calendar, Gauge, GitCommitHorizontal, Fuel, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Timestamp, doc, increment } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button, buttonVariants } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { useState } from "react";
import { deleteDocumentNonBlocking, initializeFirebase, updateDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

type AdCardProps = {
  ad: Ad;
};

const subscriptionLimits = {
    'Standard': 10,
    'Premium': 20,
};

export function AdCard({ ad }: AdCardProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { firestore } = initializeFirebase();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');


  const imageUrl = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : `https://picsum.photos/seed/${ad.id}/600/400`;

  const getFormattedDate = () => {
    if (!ad.createdAt) return '';
    if (ad.createdAt instanceof Timestamp) {
      return ad.createdAt.toDate().toLocaleDateString();
    }
    // Handle case where it might already be a Date object or string
    try {
      return new Date(ad.createdAt as any).toLocaleDateString();
    } catch (e) {
      return "Invalid Date";
    }
  }
  
  const isOwnerOnMyListings = user && user.uid === ad.dealerId && pathname.includes('/my-listings');

  const handleDelete = async () => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication error.' });
        return;
    }

    const adRef = doc(firestore, 'cars', ad.id);
    const userRef = doc(firestore, 'users', user.uid);

    deleteDocumentNonBlocking(adRef);

    const currentUserPlan = user.subscriptionType;
    const creditLimit = currentUserPlan ? subscriptionLimits[currentUserPlan] : 0;
    
    // Only increment if the current credits are less than the limit
    if (user.adCredits !== undefined && user.adCredits < creditLimit) {
        updateDocumentNonBlocking(userRef, {
            adCredits: increment(1)
        });
    }

    toast({ title: 'Ad Deleted', description: 'Your ad has been successfully removed.' });
    setIsDialogOpen(false);
  }

  return (
    <>
    <Card className="overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up relative">
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
        <h3 className="font-bold text-lg leading-snug truncate transition-colors duration-300 group-hover:text-primary">
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
             <span>{getFormattedDate()}</span>
        </div>
      </CardContent>
       {isOwnerOnMyListings && (
        <div className="absolute bottom-2 right-2">
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Ad</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your ad and restore one ad credit (if your plan allows).
                            Please type <strong className="text-destructive">delete</strong> to confirm.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input 
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="delete"
                        className="my-2"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteInput('')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={deleteInput !== 'delete'}
                            className={cn(buttonVariants({ variant: 'destructive' }))}
                        >
                            Delete Ad
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
       )}
    </Card>
    </>
  );
}
