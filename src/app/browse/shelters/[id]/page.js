'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import FilterPanel from '../../../../components/filters/FilterPanel';
import SearchBar from '../../../../components/SearchBar';
import PetCardSkeleton from '../../../../components/PetCardSkeleton';

export default function ShelterDetailPage({ params }) {
    // Unwrap the Promise params with React.use()
    const resolvedParams = use(params);
    const shelterId = resolvedParams.id;

    const [shelter, setShelter] = useState(null);
    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Update the initial filters state
    const [filters, setFilters] = useState({
        species: '',
        gender: '',
        // Only include 'available' and 'rehabilitating' as options
        status: '',
        tags: [],
        priceRange: {
            min: '',
            max: ''
        }
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchShelterData = async () => {
            try {
                setLoading(true);

                // Use the unwrapped shelterId from params
                const shelterResponse = await axios.get(`/api/organizations/${shelterId}`);

                if (shelterResponse.data.success) {
                    setShelter(shelterResponse.data.organization);

                    // Fetch pets for this shelter
                    const petsResponse = await axios.get(`/api/organizations/${shelterId}/pets`);

                    if (petsResponse.data.success) {
                        // Filter out adopted pets
                        const nonAdoptedPets = petsResponse.data.pets.filter(
                            pet => pet.status !== 'adopted'
                        );
                        setPets(nonAdoptedPets);
                        // Initially filter for available pets only
                        setFilteredPets(nonAdoptedPets.filter(pet => pet.status === 'available'));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch shelter data:', err);
                setError('Unable to load shelter information. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchShelterData();
    }, [shelterId]); // Add shelterId to the dependency array

    // Apply filters whenever filter criteria change
    useEffect(() => {
        applyFilters();
    }, [filters, pets, searchTerm]);

    const applyFilters = () => {
        let result = [...pets];

        // Search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(pet =>
                pet.name.toLowerCase().includes(searchLower) ||
                pet.breed.toLowerCase().includes(searchLower) ||
                (pet.tags && pet.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }

        // Filter by species
        if (filters.species) {
            result = result.filter(pet => pet.specie === filters.species);
        }

        // Filter by gender
        if (filters.gender) {
            result = result.filter(pet => pet.gender === filters.gender);
        }

        // Filter by status
        if (filters.status) {
            result = result.filter(pet => pet.status === filters.status);
        }

        // Filter by tags (all selected tags must be present)
        if (filters.tags && filters.tags.length > 0) {
            result = result.filter(pet =>
                filters.tags.every(tag => pet.tags && pet.tags.includes(tag))
            );
        }

        // Filter by price range
        if (filters.priceRange.min !== '') {
            result = result.filter(pet => pet.adoptionFee >= parseFloat(filters.priceRange.min));
        }
        if (filters.priceRange.max !== '') {
            result = result.filter(pet => pet.adoptionFee <= parseFloat(filters.priceRange.max));
        }

        setFilteredPets(result);
    };

    const handleFilterChange = (category, value) => {
        if (category === 'tags') {
            // Toggle tag selection
            const updatedTags = filters.tags.includes(value)
                ? filters.tags.filter(tag => tag !== value)
                : [...filters.tags, value];

            setFilters(prev => ({
                ...prev,
                tags: updatedTags
            }));
        } else if (category === 'priceRange') {
            setFilters(prev => ({
                ...prev,
                priceRange: value
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [category]: value
            }));
        }
    };

    const resetFilters = () => {
        setFilters({
            species: '',
            gender: '',
            // Only include 'available' and 'rehabilitating' as options
            status: '',
            tags: [],
            priceRange: {
                min: '',
                max: ''
            }
        });
        setSearchTerm('');
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Shelter header skeleton */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="h-40 bg-gray-200 animate-pulse"></div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row">
                            <div className="relative -mt-24 w-32 h-32 rounded-xl shadow-lg bg-gray-200 animate-pulse"></div>
                            <div className="md:ml-8 mt-6 md:mt-0">
                                <div className="h-8 bg-gray-200 w-64 rounded-md animate-pulse"></div>
                                <div className="h-4 bg-gray-200 w-40 rounded mt-4 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pets section skeleton */}
                <div className="mt-8">
                    <div className="h-7 bg-gray-200 w-64 rounded-md animate-pulse mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(6).fill().map((_, index) => (
                            <PetCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !shelter) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">{error || "Shelter not found"}</p>
                <Link href="/browse/shelters" className="text-blue-600 mt-4 inline-block">
                    ← Back to Shelters
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back to Shelters link */}
            <div className="mb-8">
                <Link
                    href="/browse/shelters"
                    className="group inline-flex items-center text-gray-600 hover:text-blue-600 transition-all duration-300"
                >
                    <div className="mr-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm group-hover:border-blue-200 group-hover:-translate-x-1 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="font-medium">Back to shelters</span>
                </Link>
            </div>

            {/* Organization header */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                {/* Banner */}
                <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                    <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,0 L100,0 L100,25 C75,40 50,30 25,20 C10,15 0,10 0,5 Z" fill="white" />
                        </svg>
                    </div>

                    {/* Verification badge */}
                    {shelter.isVerified && (
                        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-2 shadow-sm">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-1 text-sm font-medium text-gray-800">Verified</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row">
                        {/* Organization logo */}
                        <div className="relative -mt-24 w-32 h-32 rounded-xl shadow-lg overflow-hidden bg-white p-1 border border-gray-200 self-center md:self-start">
                            <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-50">
                                {shelter.profileImage ? (
                                    <Image
                                        src={shelter.profileImage}
                                        alt={shelter.organizationName}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 text-4xl font-bold">
                                        {shelter.organizationName?.charAt(0).toUpperCase() || 'O'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Organization details */}
                        <div className="md:ml-8 mt-6 md:mt-0">
                            <h1 className="text-3xl font-bold text-gray-800">{shelter.organizationName}</h1>
                            <div className="flex items-center mt-2">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-gray-600 ml-2">
                                    {shelter.location || (shelter.city && shelter.province ? `${shelter.city}, ${shelter.province}` : 'Location not specified')}
                                </p>
                            </div>

                            {/* Contact information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-gray-600 ml-2">{shelter.email}</p>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <p className="text-gray-600 ml-2">{shelter.contactNumber || 'Contact number not available'}</p>
                                </div>
                            </div>

                            {/* About section */}
                            {shelter.description && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-lg mb-2">About Us</h3>
                                    <p className="text-gray-600">{shelter.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pets section */}
            <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Pets from {shelter.organizationName}</h2>
                        <p className="text-gray-600 mt-1">Find your perfect companion</p>
                    </div>
                </div>

                {/* search bar and filter */}
                <div className="mb-4 md:mb-6 lg:mb-8 flex flex-col sm:flex-row gap-4 ">
                    <SearchBar
                        placeholder="Search shelter pets..."
                        onSearch={setSearchTerm}
                        className="max-w-2xl w-full"
                    />

                    {/* Filter Panel - Shows only icon on small screens and positioned below search */}
                    <div className="self-end sm:self-auto">
                        <FilterPanel
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onReset={resetFilters}
                            totalCount={pets.length}
                            filteredCount={filteredPets.length}
                            showIconOnly={true} /* Pass prop to indicate we want icon-only on small screens */
                        />
                    </div>
                </div>



                {/* Pet grid */}
                {filteredPets.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600">No pets match your filter criteria or this shelter currently has no pets listed.</p>
                        {pets.length > 0 && (
                            <button
                                onClick={resetFilters}
                                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPets.map(pet => (
                            <div key={pet._id} className="bg-white rounded-lg shadow overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-md">
                                <div className="relative h-48">
                                    <Image
                                        src={pet.img_arr[0]}
                                        alt={pet.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div className="absolute top-2 right-2">
                                        {pet.status === 'available' && (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Available</span>
                                        )}
                                        {pet.status === 'rehabilitating' && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">Rehabilitating</span>
                                        )}
                                        {pet.status === 'adopted' && (
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Adopted</span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{pet.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {pet.breed} • {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                                    </p>

                                    {/* Display tags (max 3) */}
                                    {pet.tags && pet.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {pet.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                                    {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                </span>
                                            ))}
                                            {pet.tags.length > 3 && (
                                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                                    +{pet.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-3">
                                        <Link
                                            href={`/browse/pets/${pet._id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            View Details
                                        </Link>
                                        <span className="text-green-600 font-medium">
                                            {pet.adoptionFee > 0 ? `₱${pet.adoptionFee}` : 'Free'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}