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
    // We allow access for logged-out users to see the subscription page
    if (!isUserLoading && !user && window.location.pathname !== '/dashboard/subscription') {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Render a loading state while checking for user, unless it's the public subscription page
  if (isUserLoading && (typeof window === 'undefined' || window.location.pathname !== '/dashboard/subscription')) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }

  // Allow logged-out users to see the subscription page
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
