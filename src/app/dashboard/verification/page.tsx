
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getAuth,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
    grecaptcha?: any;
  }
}

export default function VerificationPage() {
  const { user, isUserLoading } = useAuth();
  const { toast } = useToast();
  const { firestore } = initializeFirebase();
  const storage = getStorage();
  const auth = getAuth();

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [files, setFiles] = useState<{ aadhar?: File; pan?: File; shopLicense?: File }>({});
  const [isUploading, setIsUploading] = useState(false);

  // This container is still necessary for reCAPTCHA to anchor to.
  useEffect(() => {
    return () => {
      // Cleanup the verifier on component unmount
      window.recaptchaVerifier?.clear();
    };
  }, []);

  const handleSendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await sendEmailVerification(currentUser);
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your inbox to verify your email address.',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      }
    }
  };


  const handleSendOtp = async () => {
    if (!user || !user.phone) {
        toast({ variant: 'destructive', title: 'Error', description: 'User phone number not found.' });
        return;
    }

    try {
        // Ensure the container is clean and verifier is cleared before creating a new one
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
            recaptchaContainer.innerHTML = '';
        }

        const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
        window.recaptchaVerifier = appVerifier;

        const phoneNumber = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`;
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        
        window.confirmationResult = confirmationResult;
        setOtpSent(true);
        toast({ title: 'OTP Sent', description: `An OTP has been sent to ${phoneNumber}.` });

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to send OTP', description: error.message });
        console.error("OTP send error:", error);
        // Attempt to clear verifier on failure to allow retry
        window.recaptchaVerifier?.clear();
    }
  };

  const handleVerifyOtp = async () => {
    if (window.confirmationResult && user) {
      try {
        await window.confirmationResult.confirm(otp);
        const userDocRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userDocRef, { isPhoneVerified: true });
        toast({ title: 'Phone Verified', description: 'Your phone number has been successfully verified.' });
        // Manually update user state to reflect phone verification
        // This is a simplified approach. A more robust solution might involve re-fetching user data.
        user.isPhoneVerified = true;
        setOtpSent(false);

      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Invalid OTP', description: 'The OTP you entered is incorrect.' });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: inputFiles[0] }));
    }
  };

  const handleSubmitDocuments = async () => {
    if (!user || !files.aadhar || !files.pan || !files.shopLicense) {
      toast({ variant: 'destructive', title: 'Missing Documents', description: 'Please upload all three documents.' });
      return;
    }

    setIsUploading(true);
    try {
      const uploadFile = async (file: File, docType: string): Promise<string> => {
        const storageRef = ref(storage, `verificationDocs/${user.uid}/${docType}_${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      };

      const aadharUrl = await uploadFile(files.aadhar, 'aadhar');
      const panUrl = await uploadFile(files.pan, 'pan');
      const shopLicenseUrl = await uploadFile(files.shopLicense, 'shopLicense');

      const userDocRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userDocRef, {
        aadharUrl,
        panUrl,
        shopLicenseUrl,
        verificationStatus: 'pending',
      });
      user.verificationStatus = 'pending';

      toast({ title: 'Documents Submitted', description: 'Your documents have been submitted for verification.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload documents. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  if (isUserLoading) return <div>Loading...</div>;

  const isEmailVerified = auth.currentUser?.emailVerified ?? false;
  const isPhoneVerified = user?.isPhoneVerified ?? false;
  const docsStatus = user?.verificationStatus ?? 'unverified';

  return (
    <div className="space-y-8">
      <div id="recaptcha-container"></div>
      <Card>
        <CardHeader>
          <CardTitle>Dealer Verification</CardTitle>
          <CardDescription>
            Complete these steps to verify your account and start selling.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {docsStatus === 'pending' && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Documents Pending Review</AlertTitle>
          <AlertDescription>
            Your documents have been submitted and are pending review. We will notify you once the review is complete.
          </AlertDescription>
        </Alert>
      )}

      {docsStatus === 'rejected' && (
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Documents Rejected</AlertTitle>
            <AlertDescription>
                Your documents were rejected. Please re-upload correct documents.
            </AlertDescription>
        </Alert>
      )}

      {docsStatus === 'verified' && (
         <Alert variant="default" className="bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-300" />
            <AlertTitle>Account Verified</AlertTitle>
            <AlertDescription>
                Congratulations! Your account is fully verified. You can now purchase a subscription.
            </AlertDescription>
        </Alert>
      )}

      {/* Email Verification */}
      <Card>
        <CardHeader>
          <CardTitle>1. Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-muted-foreground">Status: {isEmailVerified ? <span className="text-green-600 font-semibold">Verified</span> : <span className="text-orange-600 font-semibold">Not Verified</span>}</p>
          <Button onClick={handleSendVerificationEmail} disabled={isEmailVerified}>
            {isEmailVerified ? 'Email Verified' : 'Send Verification Email'}
          </Button>
        </CardContent>
      </Card>

      {/* Phone Verification */}
      <Card>
        <CardHeader>
          <CardTitle>2. Phone Number Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Status: {isPhoneVerified ? <span className="text-green-600 font-semibold">Verified</span> : <span className="text-orange-600 font-semibold">Not Verified</span>}</p>
            <Button onClick={handleSendOtp} disabled={isPhoneVerified || otpSent}>
              {isPhoneVerified ? 'Phone Verified' : otpSent ? 'OTP Sent' : 'Send OTP'}
            </Button>
          </div>
          {otpSent && !isPhoneVerified && (
            <div className="flex items-center gap-4">
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
              <Button onClick={handleVerifyOtp}>Verify OTP</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle>3. Document Upload</CardTitle>
          <CardDescription>Upload your Aadhar, PAN, and Shop License for verification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="aadhar">Aadhar Card</Label>
            <Input id="aadhar" name="aadhar" type="file" onChange={handleFileChange} accept="image/*,.pdf" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pan">PAN Card</Label>
            <Input id="pan" name="pan" type="file" onChange={handleFileChange} accept="image/*,.pdf" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopLicense">Shop License</Label>
            <Input id="shopLicense" name="shopLicense" type="file" onChange={handleFileChange} accept="image/*,.pdf" />
          </div>
          <Button onClick={handleSubmitDocuments} disabled={isUploading || docsStatus === 'pending' || docsStatus === 'verified'}>
            {isUploading ? 'Uploading...' : 'Submit Documents'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
