
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
  const { user, isUserLoading, auth } = useAuth();
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
    
    // Redirect admins away from the dealer dashboard
    if (user.role === 'admin') {
        router.replace('/admin');
        return;
    }

    // Dealer-specific logic
    if (user.role === 'dealer') {
        const currentUser = auth.currentUser;
        // Redirect unverified dealers to the verification page
        if (!currentUser?.emailVerified && pathname !== '/email-verification') {
            router.push('/email-verification');
            return;
        }

        // If a verified dealer lands on the base dashboard, redirect to their listings.
        if (pathname === '/dashboard') {
            router.replace('/dashboard/my-listings');
        }
    }

  }, [user, isUserLoading, router, pathname, auth]);

  // Render a loading state while checking for user auth
  if (isUserLoading || !user || user.role === 'admin') { // Also show loader if user is an admin to hide dealer dashboard flash
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }

  // If we have a dealer user, render the dashboard content
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
