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
        // Authentication checks...
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            if (user && !isOrganization()) {
                router.push('/profile');
                return;
            }

            if (user && isAuthenticated && !initialLoadComplete.current) {
                refreshUser();
                initialLoadComplete.current = true;
            }
        }
    }, [loading, isAuthenticated, user, router, isOrganization]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading your organization dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user || !isOrganization()) {
        return null;
    }

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleUpdateProfile = async (updatedOrg) => {
        try {
            await refreshUser();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to refresh user data:", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            {/* Header - Responsive for mobile */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                <h1 className="text-2xl sm:text-3xl font-bold">Organization Dashboard</h1>
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto text-center"
                >
                    Manage Organization
                </button>
            </div>

            {/* Profile Card - Improved mobile layout */}
            <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex flex-col items-center sm:items-start sm:flex-row gap-5 sm:gap-6">
                    {/* Profile Image - Centered on mobile, left-aligned on desktop */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
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

                    {/* Organization Details */}
                    <div className="flex-grow text-center sm:text-left w-full">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">{user.organizationName}</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Organization Details</h3>
                                <p className="mb-1.5"><span className="text-gray-600">Location:</span> {user.location}</p>
                                <p className="mb-1.5"><span className="text-gray-600">Verification Status:</span>
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
                                    <div className="mt-3 p-3 bg-gray-50 border rounded-md">
                                        <p className="text-sm font-medium">Message from admin:</p>
                                        <p className="text-sm text-gray-700">{user.verificationNotes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 sm:mt-0">
                                <h3 className="font-semibold mb-2 text-gray-800">Your Contact Information</h3>
                                <p className="mb-1.5"><span className="text-gray-600">Email:</span> {user.email}</p>
                                <p className="mb-1.5"><span className="text-gray-600">Phone:</span> {user.contactNumber}</p>
                            </div>
                        </div>

                        {/* Verification Form - Full width on all screen sizes */}
                        {(user.verificationStatus === 'followup' || user.verificationStatus === 'rejected') && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="font-semibold mb-3 text-center sm:text-left">Submit Additional Verification Information</h3>
                                <VerificationResubmitForm
                                    organization={user}
                                    onSubmit={() => refreshUser()}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Cards - Responsive grid with better spacing */}
            {/* Action Cards - Responsive grid with better spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                            <div className="ml-4 flex-grow">
                                <h2 className="font-semibold">Manage Pets</h2>
                                <p className="text-sm text-gray-600">Add, edit, and track adoption status</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <div className="ml-4 flex-grow">
                                <h2 className="font-semibold">Adoption Applications</h2>
                                <p className="text-sm text-gray-600">Manage adoption requests</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>

                        {/* New Payment Management Card */}
                        <Link
                            href="/organization/payments"
                            className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-grow">
                                <h2 className="font-semibold">Payment Management</h2>
                                <p className="text-sm text-gray-600">Verify and track adoption payments</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>

                        {/* New Donation Settings Card */}
                        <Link
                            href="/organization/donations"
                            className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-grow">
                                <h2 className="font-semibold">Donation Settings</h2>
                                <p className="text-sm text-gray-600">Configure donation methods and payments</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>


                        {/* New Inventory Management Card */}
                        <Link
                            href="/organization/inventory"
                            className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 10l-8-4m-8 4l8-4M4 7l8 4" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-grow">
                                <h2 className="font-semibold">Inventory Management</h2>
                                <p className="text-sm text-gray-600">Track supplies, donations, and equipment</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>

                        {/* New Rescue Cases Card */}
                        <Link
                            href="/organization/rescue-cases"
                            className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-red-100 rounded-lg">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-grow">
                                <h2 className="font-semibold">Rescue Cases</h2>
                                <p className="text-sm text-gray-600">Manage and track animal rescue operations</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </>
                ) : (
                    <>
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

                        {/* Add disabled payment card for unverified organizations */}
                        <div className="flex items-center p-4 bg-white rounded-lg shadow opacity-75 border-l-4 border-amber-500">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="font-semibold">Payment Management</h2>
                                <p className="text-sm text-amber-600">Verification required to access</p>
                            </div>
                        </div>

                        {/* Add disabled inventory card for unverified organizations */}
                        <div className="flex items-center p-4 bg-white rounded-lg shadow opacity-75 border-l-4 border-amber-500">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 10l-8-4m-8 4l8-4M4 7l8 4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="font-semibold">Inventory Management</h2>
                                <p className="text-sm text-amber-600">Verification required to access</p>
                            </div>
                        </div>

                    </>
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