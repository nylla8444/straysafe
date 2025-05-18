'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function AdminPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Check if user is admin, otherwise redirect
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (isAuthenticated && user?.userType !== 'admin') {
                router.push('/');
            } else if (isAuthenticated && user?.userType === 'admin') {
                // Redirect to the dashboard page
                router.push('/admin/dashboard');
            }
        }
    }, [loading, isAuthenticated, user, router]);

    // Show loading while redirect happens
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
        </div>
    );
}