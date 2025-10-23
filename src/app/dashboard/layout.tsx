
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
    // If auth state is still being determined, do nothing.
    if (isUserLoading) {
      return; 
    }
    
    // Only redirect if loading is complete AND there is definitively no user.
    // This prevents redirects during the brief moment between Firebase auth loading
    // and the custom user profile being attached.
    if (!isUserLoading && !user) {
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
