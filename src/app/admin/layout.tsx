
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until the user is loaded
    }

    if (!user) {
      router.replace('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.replace('/dashboard'); // Redirect non-admins away
    }

  }, [user, isUserLoading, router]);

  // Render a loading state while checking for user auth and role
  if (isUserLoading || !user || user.role !== 'admin') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }

  // If we have an admin user, render the admin layout content
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
