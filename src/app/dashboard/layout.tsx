
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until the user is loaded
    }

    if (!user) {
      router.push('/login');
      return;
    }

    // Bypass verification check for admin users
    if (user.role === 'admin') {
      if (pathname === '/dashboard/verification') {
        router.replace('/dashboard');
      }
      return; // Admin doesn't need further checks
    }

    // Redirect to verification if email is not verified, unless they are already there.
    if (!user.emailVerified && pathname !== '/dashboard/verification') {
      router.push('/dashboard/verification');
      return;
    }
    
    // This is the main entry point to the dashboard for dealers.
    if (pathname === '/dashboard') {
      router.replace('/dashboard/my-listings');
    }

  }, [user, isUserLoading, router, pathname]);

  // Render a loading state while checking for user auth
  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }

  // If loading is finished and there's still no user, it means the redirect is in progress.
  // Show a loader to prevent a flash of content.
  if (!user) {
     return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }

  // If we have a user, render the dashboard content
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-4 md:px-8 py-8">
          {children}
      </main>
      <Footer />
    </div>
  );
}
