
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
import { useRouter, useParams, notFound } from 'next/navigation';
import { serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useFirestore, useStorage, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { carData, makes } from '@/lib/car-data';
import { states, citiesByState } from '@/lib/location-data';
import { Checkbox } from '@/components/ui/checkbox';
import { carFeatures } from '@/lib/car-features';
import type { Ad } from '@/lib/types';
import { cn } from '@/lib/utils';


const adFormSchema = z.object({
  make: z.string().min(2, 'Make is required.'),
  model: z.string().min(1, 'Model is required.'),
  variant: z.string().min(1, 'Variant is required.'),
  year: z.coerce.number().min(1980, 'Year must be after 1980.').max(new Date().getFullYear() + 1),
  kmDriven: z.coerce.number().min(0, 'Kilometers must be a positive number.'),
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'CNG', 'LPG']),
  transmission: z.enum(['Automatic', 'Manual']),
  price: z.coerce.number().min(10000, 'Price must be at least ?10,000.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  state: z.string().min(1, 'State is required.'),
  city: z.string().min(2, 'City is required.'),
  subLocation: z.string().min(2, 'Area/Sub-location is required.'),
  addressLine: z.string().optional(),
  newImages: z.array(z.instanceof(File)).max(20, 'You can upload a maximum of 20 images.').optional(),
  features: z.array(z.string()).optional(),
});

type AdFormValues = z.infer<typeof adFormSchema>;

interface ImageObject {
  id: string;
  url: string;
  type: 'existing' | 'new';
  file?: File;
}

export default function EditListingPage() {
  const { user, isUserLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { adId } = params;

  const firestore = useFirestore();
  const storage = useStorage();
  
  const adRef = useMemoFirebase(() => {
    if (!firestore || typeof adId !== 'string') return null;
    return doc(firestore, 'cars', adId);
  }, [firestore, adId]);

  const { data: ad, isLoading: isAdLoading } = useDoc<Ad>(adRef);

  const [images, setImages] = useState<ImageObject[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Drag and drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      make: '',
      model: '',
      variant: '',
      year: new Date().getFullYear(),
      kmDriven: 0,
      price: 10000,
      description: '',
      state: '',
      city: '',
      subLocation: '',
      addressLine: '',
      newImages: [],
      features: [],
    },
  });

  const selectedMake = form.watch('make');
  const selectedState = form.watch('state');

  useEffect(() => {
    if (ad) {
        const [addressLine, subLocation, city, state] = ad.location.split(',').map(s => s.trim()).reverse();

        form.reset({
            ...ad,
            state,
            city,
            subLocation,
            addressLine,
            newImages: [],
        });
        
        const existingImages: ImageObject[] = (ad.images as string[]).map(url => ({
          id: url,
          url: url,
          type: 'existing'
        }));
        setImages(existingImages);

        if (ad.make && carData[ad.make]) {
            setModels(carData[ad.make]);
        }
        if (state && citiesByState[state]) {
            setCities(citiesByState[state]);
        }
    }
  }, [ad, form]);

  const isLoading = isAdLoading || isUserLoading;

  // Ownership check
  if (!isLoading && ad && user && ad.dealerId !== user.uid) {
    return notFound();
  }

  useEffect(() => {
    if (selectedMake) {
      setModels(carData[selectedMake] || []);
      // Only reset model if the form has been touched, to avoid resetting on initial load
      if (form.formState.isDirty) {
        form.setValue('model', '');
      }
    }
  }, [selectedMake, form]);
  
  useEffect(() => {
    if (selectedState) {
        setCities(citiesByState[selectedState] || []);
        if (form.formState.isDirty) {
            form.setValue('city', '');
        }
    }
  }, [selectedState, form]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const newImageObjects: ImageObject[] = files.map(file => ({
        id: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
        type: 'new',
        file: file,
      }));
      
      const combined = [...images, ...newImageObjects].slice(0, 20);
      setImages(combined);
  }

  const removeImage = (index: number) => {
      const imageToRemove = images[index];
      if (imageToRemove.type === 'existing') {
          setImagesToRemove(prev => [...prev, imageToRemove.url]);
      }
      setImages(images.filter((_, i) => i !== index));
  }

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const newImages = [...images];
    const draggedItemContent = newImages.splice(dragItem.current, 1)[0];
    newImages.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    setImages(newImages);
  };

  async function uploadImages(files: File[], adId: string): Promise<string[]> {
    if (!storage || !user) throw new Error("Storage or user not available");

    const urls: string[] = [];
    let totalUploaded = 0;

    for (const file of files) {
        const storageRef = ref(storage, `cars/${adId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
        totalUploaded++;
        setUploadProgress((totalUploaded / files.length) * 100);
    }
    return urls;
  }

  async function deleteImages(urls: string[]) {
    if (!storage) return;
    for (const url of urls) {
        try {
            const imageRef = ref(storage, url);
            await deleteObject(imageRef);
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
                console.error("Failed to delete image:", url, error);
            }
        }
    }
  }

  async function onSubmit(values: AdFormValues) {
    if (!user || !adRef || !ad) {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid session. Please try again.' });
      return;
    }

    setUploadProgress(0);

    try {
        await deleteImages(imagesToRemove);
        
        const newFilesToUpload = images.filter(img => img.type === 'new' && img.file).map(img => img.file!);
        let newImageUrls: string[] = [];
        if (newFilesToUpload.length > 0) {
            newImageUrls = await uploadImages(newFilesToUpload, ad.id);
        }
        setUploadProgress(100);
        
        const existingImageUrls = images.filter(img => img.type === 'existing').map(img => img.url);
        const updatedImageUrls = [...existingImageUrls, ...newImageUrls];
        if (updatedImageUrls.length === 0) {
            toast({ variant: 'destructive', title: 'Image Required', description: 'You must have at least one image for the ad.' });
            setUploadProgress(null);
            return;
        }

        const title = `${values.year} ${values.make} ${values.model} ${values.variant}`;
        const locationParts = [values.addressLine, values.subLocation, values.city, values.state].filter(Boolean);
        const location = locationParts.join(', ');
        
        const { state, city, subLocation, newImages: _, ...adData } = values;

        updateDocumentNonBlocking(adRef, {
          ...adData,
          title,
          location,
          images: updatedImageUrls,
          updatedAt: serverTimestamp(),
          // When a dealer edits an ad that was private, assume it's to fix an issue.
          // Make it public again for re-review.
          visibility: 'public',
          moderationReason: null,
        });
        
        toast({
          title: 'Ad Updated!',
          description: 'Your car listing has been successfully updated.',
        });
    
        setUploadProgress(null); // Reset progress after success
        router.push('/dashboard/my-listings');

    } catch (error) {
        console.error("Failed to update ad:", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'There was an error updating your ad. Please try again.',
        });
        setUploadProgress(null);
    }
  }

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
                    <CardTitle>Edit Your Ad</CardTitle>
                    <CardDescription>Update the details of your car listing.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <FormField control={form.control} name="make" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Make</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a car make" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {makes.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMake}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {models.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="variant" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Variant</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., VXi, ZXi+" {...field} />
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
                         <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormLabel>Price (?)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 550000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {states.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a city" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                 <FormField control={form.control} name="subLocation" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sub-location / Area</FormLabel>
                         <FormControl>
                            <Input placeholder="e.g., Koregaon Park" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                 <FormField control={form.control} name="addressLine" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Street Address / Building</FormLabel>
                         <FormControl>
                            <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>


                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="lg:col-span-3">
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
                  name="newImages"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-3">
                      <FormLabel>Car Images (up to 20 total)</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-muted-foreground">You can add {20 - images.length} more images.</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} disabled={images.length >= 20} />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {images.length > 0 && (
                    <div className="lg:col-span-3">
                        <FormLabel>Image Previews (Drag to reorder)</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                          {images.map((image, index) => (
                            <div
                              key={image.id}
                              className={cn(
                                "relative aspect-square cursor-grab",
                                dragItem.current === index && "opacity-50"
                              )}
                              draggable
                              onDragStart={() => (dragItem.current = index)}
                              onDragEnter={() => (dragOverItem.current = index)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => e.preventDefault()}
                            >
                              <Image src={image.url} alt={`Preview ${index}`} fill className="object-cover rounded-md pointer-events-none" />
                              <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(index)}>
                                  <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                    </div>
                )}
                
                 <FormField
                    control={form.control}
                    name="features"
                    render={() => (
                        <FormItem className="lg:col-span-3">
                        <div className="mb-4">
                            <FormLabel className="text-base">Features</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {carFeatures.map((item) => (
                            <FormField
                                key={item.id}
                                control={form.control}
                                name="features"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                    (value) => value !== item.id
                                                )
                                                )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {item.label}
                                    </FormLabel>
                                    </FormItem>
                                )
                                }}
                            />
                            ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                {uploadProgress !== null && uploadProgress < 100 && (
                    <div className="lg:col-span-3">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-center mt-2 text-muted-foreground">Uploading images... {Math.round(uploadProgress)}%</p>
                    </div>
                )}

                <div className="lg:col-span-3 flex justify-end">
                    <Button type="submit" size="lg" disabled={form.formState.isSubmitting || (uploadProgress !== null && uploadProgress < 100)}>
                        {form.formState.isSubmitting || (uploadProgress !== null && uploadProgress < 100) ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
