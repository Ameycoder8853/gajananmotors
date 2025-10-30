
'use client';
// This page is now a redirect handler for dealers.
// The actual admin dashboard content is at /admin/page.tsx.

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user, isUserLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isUserLoading) {
            return;
        }
        if (user) {
            if (user.role === 'admin') {
                router.replace('/admin');
            } else {
                router.replace('/dashboard/my-listings');
            }
        } else {
            router.replace('/login');
        }
    }, [isUserLoading, user, router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
}
