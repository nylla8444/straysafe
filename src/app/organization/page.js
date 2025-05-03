'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Image from 'next/image';
import ManageOrganizationModal from '../../components/organization/ManageOrganizationModal';
import VerificationResubmitForm from '../../components/organization/VerificationResubmitForm';
import Link from 'next/link';

export default function OrganizationPage() {
    const { user, loading, isAuthenticated, isOrganization, refreshUser } = useAuth();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const initialLoadComplete = useRef(false);

    useEffect(() => {
        console.log("Auth status check:", { loading, isAuthenticated, user });

        if (!loading) {
            if (!isAuthenticated) {
                console.log("Not authenticated in organization page, redirecting to login");
                router.push('/login');
                return;
            }

            if (user && !isOrganization()) {
                console.log("User is not an organization, redirecting to profile");
                router.push('/profile');
                return;
            }

            if (user && isAuthenticated && !initialLoadComplete.current) {
                console.log("Initial load - refreshing user data once");
                refreshUser();
                initialLoadComplete.current = true;
            }
        }
    }, [loading, isAuthenticated, user, router, isOrganization]);

    if (loading) {
        return <div className="text-center p-12">
            <div className="animate-pulse">Loading your organization dashboard...</div>
        </div>;
    }

    if (!isAuthenticated || !user || !isOrganization()) {
        return null;
    }

    console.log("Organization page user data:", user);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleUpdateProfile = async (updatedOrg) => {
        console.log("Organization updated, refreshing data...", updatedOrg);

        try {
            await refreshUser();
            console.log("User data refreshed, closing modal");
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to refresh user data:", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Organization Dashboard</h1>
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Manage Organization
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        {user.profileImage ? (
                            <Image
                                src={`${user.profileImage}?t=${Date.now()}`}
                                alt={user.organizationName}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl">
                                {user.organizationName?.charAt(0).toUpperCase() || 'O'}
                            </div>
                        )}
                    </div>
                    <div className="flex-grow">
                        <h2 className="text-2xl font-semibold mb-4">{user.organizationName}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Organization Details</h3>
                                <p><span className="text-gray-600">Location:</span> {user.location}</p>
                                <p><span className="text-gray-600">Verification Status:</span>
                                    {(() => {
                                        switch (user.verificationStatus) {
                                            case 'verified':
                                                return <span className="text-green-500 font-semibold ml-2">Verified</span>;
                                            case 'followup':
                                                return <span className="text-orange-500 font-semibold ml-2">Additional Information Needed</span>;
                                            case 'rejected':
                                                return <span className="text-red-500 font-semibold ml-2">Verification Rejected</span>;
                                            default:
                                                return <span className="text-yellow-500 font-semibold ml-2">Pending Verification</span>;
                                        }
                                    })()}
                                </p>

                                {user.verificationNotes && (user.verificationStatus === 'followup' || user.verificationStatus === 'rejected') && (
                                    <div className="mt-2 p-3 bg-gray-50 border rounded-md">
                                        <p className="text-sm font-medium">Message from admin:</p>
                                        <p className="text-sm text-gray-700">{user.verificationNotes}</p>
                                    </div>
                                )}

                                {(user.verificationStatus === 'followup' || user.verificationStatus === 'rejected') && (
                                    <div className="mt-6 border-t pt-4">
                                        <h3 className="font-semibold mb-3">Submit Additional Verification Information</h3>
                                        <VerificationResubmitForm
                                            organization={user}
                                            onSubmit={() => {
                                                // Refresh user data after submission
                                                refreshUser();
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Your Contact Information</h3>
                                <p><span className="text-gray-600">Email:</span> {user.email}</p>
                                <p><span className="text-gray-600">Phone:</span> {user.contactNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Only show clickable Manage Pets card if organization is verified */}
                {user.isVerified ? (
                    <>
                        <Link
                            href="/organization/pets"
                            className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="font-semibold">Manage Pets</h2>
                                <p className="text-sm text-gray-600">Add, edit, and track adoption status</p>
                            </div>
                            <svg className="w-5 h-5 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>


                        <Link
                            href="/organization/applications"
                            className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="font-semibold">Adoption Applications</h2>
                                <p className="text-sm text-gray-600">Manage adoption requests</p>
                            </div>
                            <svg className="w-5 h-5 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </>
                ) : (
                    /* Show disabled-looking card for unverified organizations */
                    <div className="flex items-center p-4 bg-white rounded-lg shadow opacity-75 border-l-4 border-amber-500">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h2 className="font-semibold">Manage Pets</h2>
                            <p className="text-sm text-amber-600">Verification required to access</p>
                        </div>
                    </div>
                )}

            </div>

            <ManageOrganizationModal
                organization={user}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onUpdate={handleUpdateProfile}
            />
        </div>
    );
}