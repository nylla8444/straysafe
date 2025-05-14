'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import PetForm from '../../../components/pets/PetForm';
import PetsList from '../../../components/pets/PetsList';
import Link from 'next/link';
import PetDetailModal from '../../../components/pets/PetDetailModal';

export default function ManagePetsPage() {
    const { user, loading, isAuthenticated, isOrganization } = useAuth();
    const router = useRouter();
    const [allPets, setAllPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [filter, setFilter] = useState('all');
    const [petCounts, setPetCounts] = useState({
        all: 0,
        available: 0,
        rehabilitating: 0,
        adopted: 0
    });
    const [viewingPet, setViewingPet] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        console.log('Auth state:', { loading, isAuthenticated, isOrganization: isOrganization(), isVerified: user?.isVerified });

        if (!loading) {
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

            if (isAuthenticated && isOrganization() && user?.isVerified) {
                fetchPets();
            }
        }
    }, [loading, isAuthenticated, user, isOrganization]);

    useEffect(() => {
        if (filter === 'all') {
            setFilteredPets(allPets);
        } else {
            setFilteredPets(allPets.filter(pet => pet.status === filter));
        }
    }, [filter, allPets]);

    useEffect(() => {
        setPetCounts({
            all: allPets.length,
            available: allPets.filter(pet => pet.status === 'available').length,
            rehabilitating: allPets.filter(pet => pet.status === 'rehabilitating').length,
            adopted: allPets.filter(pet => pet.status === 'adopted').length
        });
    }, [allPets]);

    const fetchPets = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/organization/pets');

            // Ensure we set pets array even if success is false
            if (response.data && response.data.success) {
                setAllPets(response.data.pets || []);
            } else {
                setAllPets([]);
                if (response.data && response.data.error) {
                    setError(response.data.error);
                }
            }
        } catch (err) {
            console.error('Failed to fetch pets:', err);
            setError('Failed to load pets. Please try again.');
            setAllPets([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPet = () => {
        setSelectedPet(null);
        setShowForm(true);
        // Scroll to top on mobile when showing form
        window.scrollTo(0, 0);
    };

    const handleEditPet = (pet) => {
        setSelectedPet(pet);
        setShowForm(true);
        // Scroll to top on mobile when showing form
        window.scrollTo(0, 0);
    };

    const handleDeletePet = async (petId) => {
        if (!window.confirm('Are you sure you want to delete this pet listing?')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/pets/${petId}`);
            if (response.data.success) {
                setAllPets(prev => prev.filter(pet => pet._id !== petId));
            }
        } catch (err) {
            console.error('Failed to delete pet:', err);
            setError('Failed to delete pet. Please try again.');
        }
    };

    const handlePetSubmit = (pet) => {
        if (selectedPet) {
            setAllPets(prev => prev.map(p => p._id === pet._id ? pet : p));
        } else {
            setAllPets(prev => [pet, ...prev]);
        }

        setShowForm(false);
        setSelectedPet(null);
    };

    const handleViewPetDetails = (pet) => {
        setViewingPet(pet);
    };

    const handleCloseDetails = () => {
        setViewingPet(null);
    };

    // Get the filter label and color for mobile dropdown
    const getActiveFilterInfo = () => {
        switch (filter) {
            case 'available':
                return { label: 'Available', color: 'bg-green-600' };
            case 'rehabilitating':
                return { label: 'Rehabilitating', color: 'bg-yellow-600' };
            case 'adopted':
                return { label: 'Adopted', color: 'bg-teal-600' };
            default:
                return { label: 'All Pets', color: 'bg-teal-600' };
        }
    };

    const activeFilter = getActiveFilterInfo();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading your pets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            {/* Back navigation - improved for touch */}
            <div className="mb-4">
                <Link href="/organization" className="inline-flex items-center text-teal-600 hover:text-teal-800 text-sm sm:text-base py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            {/* Header - stacked on mobile, side-by-side on larger screens */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                <h1 className="text-2xl font-bold">Manage Pets</h1>
                {!showForm && (
                    <button
                        onClick={handleAddPet}
                        className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex justify-center items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Pet
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {showForm ? (
                <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">
                            {selectedPet ? 'Edit Pet' : 'Add New Pet'}
                        </h2>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-gray-500 hover:text-gray-700 p-2" // Increased touch target
                            aria-label="Close form"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <PetForm
                        pet={selectedPet}
                        onSubmit={handlePetSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            ) : (
                <>
                    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
                        {/* Mobile: Filter dropdown with proper overlay positioning */}
                        <div className="block sm:hidden mb-2 relative">
                            <div
                                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer ${activeFilter.color} text-white`}
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                            >
                                <div className="flex items-center">
                                    <span className="font-medium">{activeFilter.label}</span>
                                    <span className="ml-2 bg-white text-gray-800 rounded-full px-2 py-0.5 text-xs">
                                        {filter === 'all' ? petCounts.all :
                                            filter === 'available' ? petCounts.available :
                                                filter === 'rehabilitating' ? petCounts.rehabilitating : petCounts.adopted}
                                    </span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>

                            {/* Mobile filter options as overlay */}
                            {showMobileFilters && (
                                <>
                                    {/* Backdrop to close filter when clicking outside */}
                                    <div
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={() => setShowMobileFilters(false)}
                                    ></div>

                                    {/* Dropdown panel */}
                                    <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg overflow-hidden shadow-lg bg-white z-50 animate-fadeIn">
                                        <button
                                            onClick={() => {
                                                setFilter('all');
                                                setShowMobileFilters(false);
                                            }}
                                            className="w-full text-left px-4 py-3 border-b flex justify-between items-center hover:bg-gray-50"
                                        >
                                            <span>All Pets</span>
                                            <span className="bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs">{petCounts.all}</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setFilter('available');
                                                setShowMobileFilters(false);
                                            }}
                                            className="w-full text-left px-4 py-3 border-b flex justify-between items-center hover:bg-gray-50"
                                        >
                                            <span>Available</span>
                                            <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">{petCounts.available}</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setFilter('rehabilitating');
                                                setShowMobileFilters(false);
                                            }}
                                            className="w-full text-left px-4 py-3 border-b flex justify-between items-center hover:bg-gray-50"
                                        >
                                            <span>Rehabilitating</span>
                                            <span className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs">{petCounts.rehabilitating}</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setFilter('adopted');
                                                setShowMobileFilters(false);
                                            }}
                                            className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                                        >
                                            <span>Adopted</span>
                                            <span className="bg-teal-100 text-teal-800 rounded-full px-2 py-0.5 text-xs">{petCounts.adopted}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Desktop: Filter buttons remain unchanged */}
                        <div className="hidden sm:flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${filter === 'all'
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span>All Pets</span>
                                {petCounts.all > 0 && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === 'all' ? 'bg-white text-teal-600' : 'bg-gray-600 text-white'
                                        }`}>
                                        {petCounts.all}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setFilter('available')}
                                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${filter === 'available'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span>Available</span>
                                {petCounts.available > 0 && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === 'available' ? 'bg-white text-green-600' : 'bg-gray-600 text-white'
                                        }`}>
                                        {petCounts.available}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setFilter('rehabilitating')}
                                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${filter === 'rehabilitating'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span>Rehabilitating</span>
                                {petCounts.rehabilitating > 0 && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === 'rehabilitating' ? 'bg-white text-yellow-600' : 'bg-gray-600 text-white'
                                        }`}>
                                        {petCounts.rehabilitating}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setFilter('adopted')}
                                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${filter === 'adopted'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span>Adopted</span>
                                {petCounts.adopted > 0 && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === 'adopted' ? 'bg-white text-orange-600' : 'bg-gray-600 text-white'
                                        }`}>
                                        {petCounts.adopted}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-600">Loading pets...</p>
                        </div>
                    ) : filteredPets.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h3 className="mt-3 text-lg font-medium text-gray-900">No pets found</h3>
                            <p className="mt-2 text-gray-500">
                                {filter === 'all'
                                    ? "You haven't added any pets yet. Click 'Add New Pet' to get started."
                                    : `No ${filter} pets found. Try a different filter or add more pets.`
                                }
                            </p>
                            <button
                                onClick={handleAddPet}
                                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 inline-flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Add New Pet
                            </button>
                        </div>
                    ) : (
                        <PetsList
                            pets={filteredPets}
                            onEdit={handleEditPet}
                            onDelete={handleDeletePet}
                            onViewDetails={handleViewPetDetails}
                            isOrganizationView={true}
                        />
                    )}
                </>
            )}

            {viewingPet && (
                <PetDetailModal
                    pet={viewingPet}
                    onClose={handleCloseDetails}
                    onEdit={handleEditPet}
                />
            )}
        </div>
    );
}