"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
    const router = useRouter();
    
    // Use router.push instead of redirect for client-side navigation
    useEffect(() => {
        router.push('/admin/dashboard');
    }, [router]);

    // Show a minimal loading state
    return (
        <div className="min-h-screen flex justify-center items-center">
            <div>Redirecting to dashboard...</div>
        </div>
    );
}