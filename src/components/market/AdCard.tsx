
'use client';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ad, FirebaseUser } from "@/lib/types";
import { MapPin, Calendar, Gauge, GitCommitHorizontal, Fuel, ShieldCheck, Trash2, Pencil, EyeOff as EyeOffIcon, Eye } from "lucide-react";
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
import { getStorage, ref, deleteObject } from "firebase/storage";
import { Textarea } from "../ui/textarea";

type AdCardProps = {
  ad: Ad;
};

const subscriptionLimits: { [key: string]: number } = {
    'Standard': 10,
    'Premium': 20,
};

export function AdCard({ ad }: AdCardProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { firestore, storage } = initializeFirebase();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrivateDialogOpen, setIsPrivateDialogOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [privateReason, setPrivateReason] = useState('');


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
  
  const isOwnerOnMyListings = user && user.uid === ad.dealerId && pathname.includes('/dashboard/my-listings');
  const isAdminOnAdminListings = user && user.role === 'admin' && pathname.includes('/admin/listings');
  const canShowControls = isOwnerOnMyListings || isAdminOnAdminListings;
  const editUrl = isAdminOnAdminListings ? `/admin/listings/edit/${ad.id}` : `/dashboard/my-listings/edit/${ad.id}`;


  const handleDelete = async () => {
    if (!user || !firestore || !storage) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication or storage service error.' });
        return;
    }
     // The user whose ad is being deleted, not necessarily the current user (if admin is deleting)
    const adOwnerId = ad.dealerId;

    try {
        // 1. Delete images from Firebase Storage
        const imageDeletePromises = (ad.images as string[]).map(imageUrl => {
            // Don't try to delete placeholder images
            if (imageUrl.includes('picsum.photos')) {
                return Promise.resolve();
            }
            const imageRef = ref(storage, imageUrl);
            return deleteObject(imageRef);
        });

        await Promise.all(imageDeletePromises);

        // 2. Delete the Firestore document for the ad
        const adRef = doc(firestore, 'cars', ad.id);
        deleteDocumentNonBlocking(adRef);

        // 3. Increment the original dealer's ad credits if applicable
        const ownerUserRef = doc(firestore, 'users', adOwnerId);
        // We need to get the owner's data to check their subscription status.
        // We don't have it in the `user` object if an admin is deleting.
        // For simplicity in a non-blocking operation, we'll increment optimistically.
        // A more complex implementation would fetch the user doc first.
        updateDocumentNonBlocking(ownerUserRef, {
            adCredits: increment(1)
        });

        toast({ title: 'Ad Deleted', description: 'The ad and its images have been successfully removed.' });

    } catch (error) {
        console.error("Failed to delete ad and its assets:", error);
        toast({ variant: 'destructive', title: 'Deletion Failed', description: 'There was an error removing the ad. Please try again.' });
    } finally {
        setIsDeleteDialogOpen(false);
        setDeleteInput('');
    }
  }

  const handleMakePrivate = async () => {
    if (!firestore) return;

    if (!privateReason) {
        toast({ variant: 'destructive', title: 'Reason Required', description: 'Please provide a reason for making this ad private.' });
        return;
    }

    try {
        const adRef = doc(firestore, 'cars', ad.id);
        updateDocumentNonBlocking(adRef, {
            visibility: 'private',
            moderationReason: privateReason,
        });
        toast({ title: 'Ad Made Private', description: 'The ad is no longer visible in the public marketplace.' });
    } catch (error) {
        console.error("Failed to make ad private:", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update the ad visibility.' });
    } finally {
        setIsPrivateDialogOpen(false);
        setPrivateReason('');
    }
  };

  const handleMakePublic = async () => {
    if (!firestore) return;
    try {
      const adRef = doc(firestore, 'cars', ad.id);
      updateDocumentNonBlocking(adRef, {
        visibility: 'public',
        moderationReason: null, // Clear the reason when making it public again
      });
      toast({
        title: 'Ad Made Public',
        description: 'The ad is now visible in the public marketplace.',
      });
    } catch (error) {
      console.error('Failed to make ad public:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the ad visibility.',
      });
    }
  };


  return (
    <>
    <Card className="overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative">
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
         {ad.visibility === 'private' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center text-white">
              <EyeOffIcon className="w-12 h-12 mx-auto" />
              <p className="font-bold mt-2">Ad is Private</p>
            </div>
          </div>
        )}
      </div>
      <CardContent className={cn("p-4 flex-grow flex flex-col", canShowControls && 'pb-2')}>
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
             {!canShowControls && <span>{getFormattedDate()}</span>}
        </div>
      </CardContent>
       {canShowControls && (
        <div className="px-4 pb-3 pt-1 flex justify-between items-center">
             <span className="text-xs text-muted-foreground">{getFormattedDate()}</span>
             <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="icon" className="h-8 w-8">
                    <Link href={editUrl}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Ad</span>
                    </Link>
                </Button>
                {isAdminOnAdminListings && (
                    ad.visibility === 'public' ? (
                    <AlertDialog open={isPrivateDialogOpen} onOpenChange={setIsPrivateDialogOpen}>
                        <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <EyeOffIcon className="h-4 w-4" />
                            <span className="sr-only">Make Private</span>
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Make Ad Private</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please provide a reason for making this ad private. This reason will be stored for internal records.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea 
                                value={privateReason}
                                onChange={(e) => setPrivateReason(e.target.value)}
                                placeholder="e.g., Violation of image policy."
                                className="my-2"
                            />
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPrivateReason('')}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleMakePrivate} disabled={!privateReason}>
                                Confirm & Make Private
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    ) : (
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleMakePublic}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Make Public</span>
                        </Button>
                    )
                )}
                 <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                                This action cannot be undone. This will permanently delete the ad and all its images. One ad credit will be restored to the original dealer.
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
        </div>
       )}
    </Card>
    </>
  );
}

    