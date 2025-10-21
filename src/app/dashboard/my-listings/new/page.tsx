
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const adFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  make: z.string().min(2, 'Make is required.'),
  model: z.string().min(1, 'Model is required.'),
  year: z.coerce.number().min(1980, 'Year must be after 1980.').max(new Date().getFullYear() + 1),
  kmDriven: z.coerce.number().min(0, 'Kilometers must be a positive number.'),
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'CNG', 'LPG']),
  transmission: z.enum(['Automatic', 'Manual']),
  price: z.coerce.number().min(10000, 'Price must be at least ₹10,000.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  location: z.string().min(3, 'Location is required.'),
  images: z.string().url('Please enter a valid image URL. For multiple images, separate with commas.'), // Simple URL input for now
});

export default function NewListingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { firestore } = initializeFirebase();

  const form = useForm<z.infer<typeof adFormSchema>>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      title: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      kmDriven: 0,
      price: 10000,
      description: '',
      location: '',
      images: '',
    },
  });

  async function onSubmit(values: z.infer<typeof adFormSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to post an ad.' });
      return;
    }

    if ((user.adCredits ?? 0) <= 0) {
        toast({ variant: 'destructive', title: 'No Credits', description: 'You have no ad credits left. Please purchase a subscription.' });
        router.push('/dashboard/subscription');
        return;
    }

    try {
      const adsCollectionRef = collection(firestore, 'users', user.uid, 'ads');
      const userDocRef = doc(firestore, 'users', user.uid);

      await addDoc(adsCollectionRef, {
        ...values,
        dealerId: user.uid,
        images: values.images.split(',').map(url => url.trim()).filter(url => url),
        status: 'active',
        visibility: 'public', // Ads are public by default if user is pro
        createdAt: serverTimestamp(),
        soldAt: null,
        removedAt: null,
        removalPaid: false,
        removalPaymentId: null,
      });

      await updateDoc(userDocRef, {
          adCredits: increment(-1)
      });
      
      toast({
        title: 'Ad Published!',
        description: 'Your car is now listed in the marketplace.',
      });

      router.push('/dashboard/my-listings');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to post ad',
        description: error.message || 'An unexpected error occurred.',
      });
      console.error('Ad creation failed:', error);
    }
  }


  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/my-listings">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <div>
                    <CardTitle>Post a New Ad</CardTitle>
                    <CardDescription>Fill out the details of the car you want to sell.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                        <FormLabel>Ad Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 2021 Hyundai Creta SX" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField control={form.control} name="make" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Maruti Suzuki" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Swift" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 2021" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="kmDriven" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Kilometers Driven</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 25000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="fuelType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fuel Type</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select fuel type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Petrol">Petrol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="Electric">Electric</SelectItem>
                                <SelectItem value="CNG">CNG</SelectItem>
                                <SelectItem value="LPG">LPG</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="transmission" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select transmission type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Automatic">Automatic</SelectItem>
                                <SelectItem value="Manual">Manual</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 550000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Pune, Maharashtra" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Describe the car's condition, features, and history."
                                className="min-h-[120px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                        <FormLabel>Image URLs</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                {...field}
                            />
                        </FormControl>
                         <p className="text-xs text-muted-foreground">Enter one or more image URLs, separated by commas.</p>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Publishing...' : 'Publish Ad'}
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
