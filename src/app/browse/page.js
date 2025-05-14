'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function BrowsePage() {
    const router = useRouter();
    const pathname = usePathname(); // Add this line to get the current path

    useEffect(() => {
        router.replace('/browse/pets');
    }, [router]);

    // Show a minimal loading indicator while redirecting
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
    );
}