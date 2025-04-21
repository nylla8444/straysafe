'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function OrganizationPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    useEffect(() => {
        // Check if we just came from onboarding
        const justCompletedOnboarding = localStorage.getItem('just_completed_onboarding');

        // Only run auth check logic after initial loading is done AND not from onboarding
        if (!loading) {
            // If we just completed onboarding, trust the redirect and don't check auth yet
            if (justCompletedOnboarding) {
                // Clear the flag
                localStorage.removeItem('just_completed_onboarding');
                // Don't redirect regardless of auth state
                setInitialLoadComplete(true);
                return;
            }

            // Normal auth check - only after loading completes
            if (!isAuthenticated) {
                console.log("Not authenticated in organization page, redirecting to login");
                router.push('/login');
                return;
            }

            setInitialLoadComplete(true);
        }
    }, [loading, isAuthenticated, router]);

    // Show loading until both auth check completes AND our local check is done
    if (loading || !initialLoadComplete) {
        return <div className="text-center p-12">
            <div className="animate-pulse">Loading your organization dashboard...</div>
        </div>;
    }

    // Organization page content...
    if (!user || !user.is_organization_member) {
        return null; // Will be handled by useEffect redirect
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Organization Dashboard</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Manage Organization
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">{user.organization_name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">Organization Details</h3>
                        <p><span className="text-gray-600">Location:</span> {user.organization_location}</p>
                        <p><span className="text-gray-600">Your Role:</span> {user.organization_role}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Your Contact Information</h3>
                        <p><span className="text-gray-600">Email:</span> {user.email}</p>
                        <p><span className="text-gray-600">Phone:</span> {user.phone}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Rescues</h2>
                    <p className="text-gray-600">No rescue records found.</p>
                    <div className="mt-4">
                        <button className="text-blue-600 hover:underline">
                            Add New Rescue
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Animals for Adoption</h2>
                    <p className="text-gray-600">No animals listed for adoption.</p>
                    <div className="mt-4">
                        <button className="text-blue-600 hover:underline">
                            List Animal for Adoption
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}