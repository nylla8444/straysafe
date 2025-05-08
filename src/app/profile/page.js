'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Image from 'next/image';
import EditProfileModal from '../../components/EditProfileModal';
import axios from 'axios';
import Link from 'next/link';
import AdopterApplicationsList from '../../components/adopter/ApplicationsList';
import PaymentsSection from '../../components/payments/PaymentsSection';

export default function ProfilePage() {
    const { user, loading, isAuthenticated, isAdopter, refreshUser } = useAuth();
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const initialLoadComplete = useRef(false);
    const [applications, setApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(true);
    const [applicationsError, setApplicationsError] = useState('');
    const [activeTab, setActiveTab] = useState('applications');

    useEffect(() => {
        console.log("Profile page auth status:", { loading, isAuthenticated, user });

        if (!loading) {
            if (!isAuthenticated) {
                console.log("Not authenticated in profile page, redirecting to login");
                router.push('/login');
                return;
            }

            if (user?.userType === 'organization') {
                console.log("User is an organization, redirecting to organization page");
                router.push('/organization');
                return;
            }

            if (user && isAuthenticated && !initialLoadComplete.current) {
                console.log("Initial profile load - refreshing user data once");
                refreshUser();
                initialLoadComplete.current = true;
            }
        }

        if (user?.firstName && user?.lastName) {
            setFullName(`${user.firstName} ${user.lastName}`);
        }

    }, [loading, isAuthenticated, user, router]);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!isAuthenticated || !user || !isAdopter()) return;

            try {
                setLoadingApplications(true);
                const response = await axios.get('/api/adoptions/adopter');
                if (response.data.success) {
                    setApplications(response.data.applications || []);
                } else {
                    setApplicationsError('Could not load your applications');
                }
            } catch (error) {
                console.error('Error fetching applications:', error);
                setApplicationsError('Failed to fetch applications. Please try again later.');
            } finally {
                setLoadingApplications(false);
            }
        };

        if (user && isAuthenticated) {
            fetchApplications();
        }
    }, [user, isAuthenticated, isAdopter]);

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleProfileUpdate = async (updatedUser) => {
        console.log("Profile updated, refreshing data...");
        await refreshUser();
        setIsEditModalOpen(false);
    };

    if (loading) {
        return <div className="text-center p-12">
            <div className="animate-pulse">Loading your profile...</div>
        </div>;
    }

    if (!isAuthenticated || !user || !isAdopter()) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

            {user?.status === 'suspended' && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-red-700">Account Suspended</h3>
                            <div className="mt-2 text-red-600">
                                <p className="mb-2">Your account has been suspended due to suspicious activity or policy violations. This may include:</p>
                                <ul className="list-disc pl-5 mb-2">
                                    <li>Providing false information</li>
                                    <li>Violation of our adoption policies</li>
                                    <li>Multiple reports from organizations</li>
                                    <li>Suspicious adoption patterns</li>
                                </ul>
                                <p className="mt-2">
                                    While suspended, you cannot submit new adoption applications.
                                </p>
                                <p className="font-medium mt-4">
                                    If you believe this is an error, please contact us at{' '}
                                    <a href="mailto:strayspot@support.com" className="underline">strayspot@support.com</a>
                                    {' '}or call our support team at <a href="tel:+1234567890" className="underline">123-456-7890</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-6 mb-6">
                    <div className="relative bg-gray-200 rounded-full w-24 h-24 overflow-hidden">
                        {user.profileImage ? (
                            <Image
                                src={user.profileImage}
                                alt={fullName}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl text-gray-600">
                                {user.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold">{fullName}</h2>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <p><span className="text-gray-600">Email:</span> {user.email}</p>
                    <p><span className="text-gray-600">Phone:</span> {user.contactNumber || 'Not provided'}</p>
                    <p><span className="text-gray-600">Location:</span> {user.location || 'Not provided'}</p>

                    {(!user.contactNumber || !user.location) && (
                        <p className="text-red-500 text-sm mt-2">
                            Some of your contact information is missing. Please update your profile.
                        </p>
                    )}
                </div>

                <div className="mt-6 flex">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={handleOpenEditModal}
                    >
                        Edit Profile
                    </button>
                </div>
            </div>


            <div className="mt-8">
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`py-2 px-1 border-b-2 font-medium text-md ${activeTab === 'applications'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Adoption Applications
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`py-2 px-1 border-b-2 font-medium text-md ${activeTab === 'payments'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Payments
                        </button>
                    </nav>
                </div>

                {/* Content based on active tab */}
                <div className="bg-white shadow rounded-lg sm:p-3 md:p-4 lg:p-6">
                    {activeTab === 'applications' ? (
                        // Applications tab content
                        loadingApplications ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : applicationsError ? (
                            <div className="text-red-500">{applicationsError}</div>
                        ) : applications.length > 0 ? (
                            <AdopterApplicationsList applications={applications} />
                        ) : (
                            <div>
                                <p className="text-gray-600">You haven&apos;t submitted any adoption applications yet.</p>
                                <div className="mt-4">
                                    <Link href="/browse/pets" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block">
                                        Browse Pets for Adoption
                                    </Link>
                                </div>
                            </div>
                        )
                    ) : (
                        // Payments tab content
                        <PaymentsSection userId={user._id} userType={user.userType} />
                    )}
                </div>
            </div>

            <EditProfileModal
                user={user}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onUpdate={handleProfileUpdate}
            />
        </div>
    );
}