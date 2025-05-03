'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import ApplicationsList from '../../../components/adopter/ApplicationsList';

export default function ApplicationsPage() {
    const { user, isAuthenticated, isAdopter } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Check if user is authenticated and is an adopter
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // CHANGE LATER
        // if (!isAdopter()) {
        //     router.push('/profile');
        //     return;
        // }

        // Check for success parameter
        const success = searchParams.get('success');
        if (success === 'true') {
            setShowSuccess(true);

            // Auto-hide success message after 6 seconds
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, isAdopter, router, searchParams]);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <Link href="/profile" className="text-blue-600 hover:underline flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Profile
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">My Adoption Applications</h1>

            {showSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">
                                Your adoption application was submitted successfully! The shelter will review your application and contact you.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <ApplicationsList />
        </div>
    );
}