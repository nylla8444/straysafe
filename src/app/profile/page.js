'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function ProfilePage() {
    const { user, loading, isAuthenticated, isAdopter } = useAuth();
    const router = useRouter();
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        if (!loading) {
            // If not logged in, redirect to login
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            // If user is an organization, redirect to organization page
            if (user?.userType === 'organization') {
                router.push('/organization');
                return;
            }
        }

        // Set the user's full name
        if (user?.firstName && user?.lastName) {
            setFullName(`${user.firstName} ${user.lastName}`);
        }

        // Debug Log
        if (user) {
            console.log("User data in profile:", user);
        }


    }, [loading, isAuthenticated, user, router]);

    if (loading) {
        return <div className="text-center p-12">Loading...</div>;
    }

    // Don't render anything if not authenticated or still checking or not an adopter
    if (!isAuthenticated || !user || !isAdopter()) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-6 mb-6">
                    <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center text-3xl text-gray-600">
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold">{fullName}</h2>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <p><span className="text-gray-600">Email:</span> {user.email}</p>
                    <p><span className="text-gray-600">Phone:</span> {user.contactNumber}</p>
                    <p><span className="text-gray-600">Location:</span> {user.location}</p>

                    {(!user.contactNumber || !user.location) && (
                        <p className="text-red-500 text-sm mt-2">
                            Some of your contact information is missing. Please update your profile.
                        </p>
                    )}

                </div>

                <div className="mt-6 flex">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Your Recent Activity</h2>
                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-600">No recent activity.</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Adoption Applications</h2>
                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-600">You haven&apos;t submitted any adoption applications yet.</p>
                    <div className="mt-4">
                        <a href="/animals" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block">
                            Browse Animals for Adoption
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}