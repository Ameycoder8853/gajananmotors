
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    // If the auth state is still loading, wait.
    if (isUserLoading) {
      return;
    }
    
    // Allow logged-out users to see the public subscription page
    if (!user && window.location.pathname === '/dashboard/subscription') {
      return;
    }

    // If user is not logged in and not on subscription page, redirect to login.
    if (!user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Render a loading state while checking for user auth
  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }

  // Allow unauthenticated users to see the subscription page, but show loading for other dashboard pages
  if (!user && (typeof window !== 'undefined' && window.location.pathname !== '/dashboard/subscription')) {
     return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
          {children}
      </main>
      <Footer />
    </div>
  );
}
