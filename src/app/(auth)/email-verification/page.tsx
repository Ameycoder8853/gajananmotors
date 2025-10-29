
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
import { sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EmailVerificationPage() {
  const { user, auth, isUserLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // If the user lands here but is already verified IN THIS SESSION, send them to the dashboard.
    // This handles the case where they complete verification and then navigate back.
    if (auth.currentUser?.emailVerified) {
      router.replace('/dashboard');
    }
  }, [auth.currentUser, router]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResendEmail = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      if (cooldown > 0) {
        toast({
            variant: "destructive",
            title: "Please wait",
            description: `You can send another email in ${cooldown} seconds.`,
        });
        return;
      }
      setIsSending(true);
      try {
        await sendEmailVerification(currentUser);
        toast({
          title: 'Verification Email Sent',
          description: `A new verification link has been sent to ${user?.email}. Please check your inbox.`,
        });
        setCooldown(60); // Start 60-second cooldown
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      } finally {
        setIsSending(false);
      }
    }
  };
  
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  // Prevent flash of content for already verified users while redirecting
  if (auth.currentUser?.emailVerified) {
    return (
       <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
     <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
            <MailCheck className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="text-2xl mt-4">Verify Your Email</CardTitle>
            <CardDescription>
                A verification link has been sent to your email address: <strong>{user?.email}</strong>.
                Please check your inbox and click the link to continue.
            </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
                Didn't receive the email? Check your spam folder or click below to resend.
            </p>
            <Button onClick={handleResendEmail} disabled={cooldown > 0 || isSending}>
              {isSending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
            </Button>
            <Alert variant="default" className="mt-6 text-left">
                <AlertDescription>
                   You must verify your email on the same device you are currently using.
                </AlertDescription>
            </Alert>
            <div className="mt-6">
                <Button variant="link" onClick={() => router.push('/login')}>Back to Login</Button>
            </div>
        </CardContent>
    </Card>
  );
}
