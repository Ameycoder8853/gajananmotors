
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';


const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
});

const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('');
};

export default function SettingsPage() {
  const { user, auth } = useAuth();
  const { toast } = useToast();
  const { firestore, storage } = initializeFirebase();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [pfpPreview, setPfpPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);


  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userDocRef, {
        name: values.name,
        phone: values.phone,
      });
       if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: values.name });
      }
      toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update profile.' });
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    if (!user || !auth.currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to change your password.' });
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email!, values.currentPassword);
        // Re-authenticate the user to confirm their identity
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // If re-authentication is successful, update the password
        await updatePassword(auth.currentUser, values.newPassword);
        
        toast({ title: 'Password Changed', description: 'Your password has been successfully updated.' });
        passwordForm.reset();

    } catch (error: any) {
        console.error('Password change error:', error);
        toast({
            variant: 'destructive',
            title: 'Password Change Failed',
            description: error.code === 'auth/wrong-password' ? 'The current password you entered is incorrect.' : error.message,
        });
    }
  }

  const handlePfpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPfpFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPfpPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePfpUpload = async () => {
    if (!pfpFile || !user || !auth.currentUser) {
      toast({ variant: 'destructive', title: 'Upload Error', description: 'No file selected or user not logged in.' });
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profile-pictures/${user.uid}/${pfpFile.name}`);
      await uploadBytes(storageRef, pfpFile);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      
      const userDocRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userDocRef, { photoURL: downloadURL });
      
      // Force a reload of the user to get the new photoURL reflected in the UI
      await auth.currentUser.reload();
      
      toast({ title: 'Profile Picture Updated', description: 'Your new picture has been saved.' });
      setPfpFile(null);
      setPfpPreview(null);
    } catch (error: any) {
      console.error('PFP upload failed:', error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="space-y-8 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your personal information and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} disabled />
                      </FormControl>
                      <FormDescription>
                          You cannot change your email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
              <div className="space-y-4 text-center">
                  <FormLabel>Profile Picture</FormLabel>
                  <Avatar className="h-32 w-32 mx-auto">
                    <AvatarImage src={pfpPreview || user?.photoURL || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback className="text-4xl">{getInitials(user?.displayName)}</AvatarFallback>
                  </Avatar>
                  <Input id="pfp-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handlePfpFileChange} />
                  <label htmlFor="pfp-upload" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Picture
                  </label>
                  <Button onClick={handlePfpUpload} disabled={isUploading || !pfpFile} className="w-full">
                    {isUploading ? 'Uploading...' : 'Upload Picture'}
                  </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password for better security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type={showCurrentPassword ? 'text' : 'password'} {...field} />
                      </FormControl>
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                     <div className="relative">
                      <FormControl>
                        <Input type={showNewPassword ? 'text' : 'password'} {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
