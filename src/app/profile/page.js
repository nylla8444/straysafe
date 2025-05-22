'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useFavorites } from '../../../context/FavoritesContext'; // Add this import
import Image from 'next/image';
import EditProfileModal from '../../components/adopter/EditProfileModal';
import axios from 'axios';
import Link from 'next/link';
import AdopterApplicationsList from '../../components/adopter/ApplicationsList';
import PaymentsSection from '../../components/payments/PaymentsSection';
import { motion } from 'framer-motion';

// Helper functions
const safeGetFirstChar = (str) => {
    if (!str) return '?';
    return str.charAt(0).toUpperCase();
};

const safeGetName = (obj, fallback = 'Unknown') => {
    return obj?.organizationName || fallback;
};

export default function ProfilePage() {
    const { user, loading, isAuthenticated, isAdopter, refreshUser } = useAuth();
    const { favorites, isLoading: loadingFavorites, error: favoritesError, toggleFavorite } = useFavorites(); // Use the favorites context

    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const initialLoadComplete = useRef(false);
    const [applications, setApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(true);
    const [applicationsError, setApplicationsError] = useState('');

    const [activeTab, setActiveTab] = useState('applications');

    // Auth-related useEffect
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
    }, [loading, isAuthenticated, user, router, refreshUser]);

    // Applications fetch useEffect
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


    // More handlers
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

    // HandleRemoveFavorite function
    const handleRemoveFavorite = async (petId) => {
        try {
            console.log("Removing pet from favorites:", petId);
            // Optional: add loading state if you have it
            const result = await toggleFavorite(petId);

            if (result.success) {
                // No need for alert - let the UI update naturally
                console.log("Successfully removed pet from favorites");
            } else {
                alert(result.message || 'Failed to remove pet from favorites');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('Failed to remove pet from favorites');
        } finally {
            // Optional: clear loading state if you added it
        }
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
            <h1 className="mb-6 text-2xl sm:text-3xl font-bold text-gray-800 border-b-2 border-amber-400 pb-2 inline-block">Your Profile</h1>

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

            <div className="bg-white/50 border-t-2 border-amber-400 shadow rounded-lg p-6">
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
                                {safeGetFirstChar(user.firstName)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold">{fullName}</h2>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row space-between w-full">
                    <div className="border-t t-4">
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

                    <div className="flex mt-6 sm:mt-0 sm:ml-auto">
                        <button
                            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 h-fit"
                            onClick={handleOpenEditModal}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div >
            </div >


            <div className="mt-8">
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`py-2 px-1 border-b-2 font-medium text-md ${activeTab === 'applications'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Adoption Applications
                        </button>

                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`py-2 px-1 border-b-2 font-medium text-md ${activeTab === 'payments'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Payments
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`py-2 px-1 border-b-2 font-medium text-md ${activeTab === 'favorites'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Favorites
                        </button>
                    </nav>
                </div>

                {/* Content based on active tab */}
                <div className="bg-white/50 shadow rounded-lg sm:p-3 md:p-4 lg:p-6">
                    {activeTab === 'applications' ? (
                        loadingApplications ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
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
                    ) : activeTab === 'favorites' ? (
                        <div className="py-2">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Your Favorite Pets</h2>
                                <Link href="/browse/pets" className="text-teal-600 hover:text-teal-800 text-sm flex items-center">
                                    <span>Browse more pets</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>

                            {loadingFavorites ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="bg-gray-100 rounded-lg overflow-hidden">
                                            <div className="h-48 bg-gray-200"></div>
                                            <div className="p-4">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                                <div className="h-8 bg-gray-200 rounded mt-4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : favoritesError ? (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{favoritesError}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : favorites.length > 0 ? (
                                <motion.div
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {favorites.map((pet, index) => (
                                        <motion.div
                                            key={pet._id}
                                            className="bg-white border rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow relative group"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <div className={`absolute top-0 left-0 w-full h-1 
                                                ${pet.status === 'available' ? 'bg-green-500' :
                                                    pet.status === 'rehabilitating' ? 'bg-amber-500' :
                                                        'bg-teal-500'}`}
                                            ></div>

                                            <div className="relative h-48">
                                                <Image
                                                    src={pet.img_arr?.[0] || '/images/pet-placeholder.jpg'}
                                                    alt={pet.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                <div className="absolute top-3 right-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium 
                                                        ${pet.status === 'available' ? 'bg-green-100 text-green-800' :
                                                            pet.status === 'rehabilitating' ? 'bg-amber-100 text-amber-800' :
                                                                'bg-teal-100 text-teal-800'}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                                        {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleRemoveFavorite(pet._id);
                                                    }}
                                                    className="absolute top-3 left-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-rose-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                                                    aria-label="Remove from favorites"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                    </svg>
                                                </button>

                                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-lg font-bold">{pet.name}</p>
                                                    <div className="flex items-center text-xs space-x-2 mt-1">
                                                        <span>{pet.breed}</span>
                                                        <span>•</span>
                                                        <span>{pet.gender?.charAt(0).toUpperCase() + pet.gender?.slice(1)}</span>
                                                        {pet.age && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{pet.age}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
                                                        <p className="text-sm text-gray-600 truncate max-w-[15ch]">{pet.breed} {pet.specie?.charAt(0).toUpperCase() + pet.specie?.slice(1)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`font-medium ${pet.adoptionFee > 0 ? 'text-emerald-600' : 'text-teal-600'}`}>
                                                            {pet.adoptionFee > 0 ? `₱${pet.adoptionFee}` : 'Free'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {pet.tags && pet.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {/* Show the first tag */}
                                                        <span
                                                            key={pet.tags[0]}
                                                            className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium"
                                                        >
                                                            {pet.tags[0].split('-').map(word =>
                                                                word ? word.charAt(0).toUpperCase() + word.slice(1) : ''
                                                            ).join(' ')}
                                                        </span>

                                                        {/* Show second tag if it exists */}
                                                        {pet.tags.length >= 2 && (
                                                            <span
                                                                key={pet.tags[1]}
                                                                className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium"
                                                            >
                                                                {pet.tags[1].split('-').map(word =>
                                                                    word ? word.charAt(0).toUpperCase() + word.slice(1) : ''
                                                                ).join(' ')}
                                                            </span>
                                                        )}

                                                        {/* Show +n only if there are 3 or more total tags */}
                                                        {pet.tags.length > 2 && (
                                                            <span className="bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                                                +{pet.tags.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {pet.organization && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="flex items-center">
                                                            <div className="w-5 h-5 rounded-full bg-gray-200 mr-2 flex items-center justify-center overflow-hidden">
                                                                {pet.organization?.profileImage ? (
                                                                    <Image
                                                                        src={pet.organization.profileImage}
                                                                        alt=""
                                                                        width={20}
                                                                        height={20}
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs font-bold">
                                                                        {safeGetFirstChar(pet.organization?.organizationName)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-600 truncate max-w-[25ch]">
                                                                {safeGetName(pet.organization, 'Unknown Organization')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-4 flex space-x-2">
                                                    <Link
                                                        href={`/browse/pets/${pet._id}`}
                                                        className="flex-1 text-center py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        View Details
                                                    </Link>
                                                    {pet.status === 'available' && (
                                                        <Link
                                                            href={`/adopt/${pet._id}`}
                                                            className="flex-1 text-center py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            Adopt
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h3>
                                    <p className="text-gray-600 mb-6">Start exploring pets that need a loving home</p>
                                    <Link
                                        href="/browse/pets"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                                    >
                                        Browse Pets
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
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
        </div >
    );
}