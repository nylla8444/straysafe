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
    const [allPets, setAllPets] = useState([]); // Store all pets
    const [filteredPets, setFilteredPets] = useState([]); // Store filtered view
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

    useEffect(() => {
        if (!loading && isAuthenticated && isOrganization() && user?.isVerified) {
            fetchPets();
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
            if (response.data.success) {
                setAllPets(response.data.pets);
            }
        } catch (err) {
            console.error('Failed to fetch pets:', err);
            setError('Failed to load pets. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPet = () => {
        setSelectedPet(null);
        setShowForm(true);
    };

    const handleEditPet = (pet) => {
        setSelectedPet(pet);
        setShowForm(true);
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

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Back navigation remains unchanged */}
            <div className="mb-4">
                <Link href="/organization" className="flex items-center text-blue-600 hover:text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            {/* Header remains unchanged */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Pets</h1>
                {!showForm && (
                    <button
                        onClick={handleAddPet}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add New Pet
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {showForm ? (
                // Form section remains unchanged
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">
                            {selectedPet ? 'Edit Pet' : 'Add New Pet'}
                        </h2>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-full text-sm flex items-center ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span>All Pets</span>
                                {petCounts.all > 0 && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === 'all' ? 'bg-white text-blue-600' : 'bg-gray-600 text-white'
                                        }`}>
                                        {petCounts.all}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setFilter('available')}
                                className={`px-3 py-1 rounded-full text-sm flex items-center ${filter === 'available'
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
                                className={`px-3 py-1 rounded-full text-sm flex items-center ${filter === 'rehabilitating'
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
                                className={`px-3 py-1 rounded-full text-sm flex items-center ${filter === 'adopted'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span>Adopted</span>
                                {petCounts.adopted > 0 && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === 'adopted' ? 'bg-white text-blue-600' : 'bg-gray-600 text-white'
                                        }`}>
                                        {petCounts.adopted}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Loading and PetsList remain unchanged */}
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading pets...</p>
                        </div>
                    ) : (
                        <PetsList
                            pets={filteredPets} // Use filteredPets instead of pets
                            onEdit={handleEditPet}
                            onDelete={handleDeletePet}
                            onViewDetails={handleViewPetDetails}
                            isOrganizationView={true}
                        />
                    )}
                </>
            )}

            {/* Add the pet detail modal */}
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