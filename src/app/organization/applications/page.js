'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import ApplicationsManagement from '../../../components/organization/ApplicationsManagement';

export default function OrganizationApplicationsPage() {
    const { user, isAuthenticated, isOrganization } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!isOrganization()) {
            router.push('/profile');
            return;
        }

        // Add this check to redirect unverified organizations
        if (user && !user.isVerified) {
            router.push('/organization?error=verification_required');
            return;
        }
    }, [isAuthenticated, isOrganization, router, user]);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <Link href="/organization" className="text-teal-600 hover:underline flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">Adoption Applications</h1>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <ApplicationsManagement />
        </div>
    );
}