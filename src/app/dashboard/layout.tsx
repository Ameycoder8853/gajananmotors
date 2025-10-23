
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
      return; // Wait for auth state to be determined
    }
    
    // If auth check is complete and there is no user, redirect to login.
    // This now correctly handles all dashboard routes.
    if (!user && pathname.startsWith('/dashboard')) {
      router.push('/login');
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

  // If loading is finished and there's no user, we show a spinner while redirecting.
  // This prevents a brief flash of the dashboard content before the redirect happens.
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
      <main className="px-8 py-8 flex-1">
          {children}
      </main>
      <Footer />
    </div>
  );
}
