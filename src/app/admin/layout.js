"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }) {
    const { admin, loading, isAuthenticated, authInitialized, refreshAdminToken } = useAdminAuth();
    const router = useRouter();

    // First try to refresh the token when component mounts
    useEffect(() => {
        // Skip refresh attempt if we're in the process of logging out
        const isLoggingOut = sessionStorage.getItem('adminLoggingOut') === 'true';

        if (!loading && !isAuthenticated && !isLoggingOut) {
            // Try to refresh the token before redirecting
            const attemptRefresh = async () => {
                const refreshed = await refreshAdminToken();

                // Only redirect if refresh fails and we're sure we're not authenticated
                if (!refreshed && authInitialized && !isLoggingOut) {
                    router.push('/login/admin');
                }
            };

            attemptRefresh();
        }
    }, [loading, isAuthenticated, authInitialized, refreshAdminToken, router]);

    // Show loading state during authentication check
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-teal-600 font-medium mt-4">Verifying admin session...</p>
                <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
            </div>
        );
    }

    // Don't show children until we're sure the user is authenticated
    // This prevents content flashing before redirect
    return isAuthenticated ? (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    ) : (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Checking admin credentials...</p>
        </div>
    );
}