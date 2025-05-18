'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import FilterPanel from '../../../../components/filters/FilterPanel';
import SearchBar from '../../../../components/SearchBar';
import PetCardSkeleton from '../../../../components/PetCardSkeleton';
import { motion } from 'framer-motion';

export default function ShelterDetailPage({ params }) {
    const resolvedParams = use(params);
    const shelterId = resolvedParams.id;

    const [shelter, setShelter] = useState(null);
    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

    const [filters, setFilters] = useState({
        species: '',
        gender: '',
        status: '',
        tags: [],
        priceRange: {
            min: '',
            max: ''
        }
    });
    const [searchTerm, setSearchTerm] = useState('');

    const [donationSettings, setDonationSettings] = useState(null);
    const [loadingDonationSettings, setLoadingDonationSettings] = useState(false);
    const [donationSettingsError, setDonationSettingsError] = useState('');

    useEffect(() => {
        const fetchShelterData = async () => {
            try {
                setLoading(true);

                const shelterResponse = await axios.get(`/api/organizations/${shelterId}`);

                if (shelterResponse.data.success) {
                    setShelter(shelterResponse.data.organization);

                    const petsResponse = await axios.get(`/api/organizations/${shelterId}/pets`);

                    if (petsResponse.data.success) {
                        const nonAdoptedPets = petsResponse.data.pets.filter(
                            pet => pet.status !== 'adopted'
                        );
                        setPets(nonAdoptedPets);
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
    }, [shelterId]);

    useEffect(() => {
        applyFilters();
    }, [filters, pets, searchTerm]);

    const applyFilters = () => {
        let result = [...pets];

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(pet =>
                pet.name.toLowerCase().includes(searchLower) ||
                pet.breed.toLowerCase().includes(searchLower) ||
                (pet.tags && pet.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }

        if (filters.species) {
            result = result.filter(pet => pet.specie === filters.species);
        }

        if (filters.gender) {
            result = result.filter(pet => pet.gender === filters.gender);
        }

        if (filters.status) {
            result = result.filter(pet => pet.status === filters.status);
        }

        if (filters.tags && filters.tags.length > 0) {
            result = result.filter(pet =>
                filters.tags.every(tag => pet.tags && pet.tags.includes(tag))
            );
        }

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
            status: '',
            tags: [],
            priceRange: {
                min: '',
                max: ''
            }
        });
        setSearchTerm('');
    };

    const fetchDonationSettings = async (organizationId) => {
        try {
            setLoadingDonationSettings(true);
            setDonationSettingsError('');

            const response = await axios.get(`/api/organization/donation-settings?organizationId=${organizationId}&public=true`);

            if (response.data.success) {
                setDonationSettings(response.data.settings || null);
            } else {
                setDonationSettingsError('Could not load donation information');
                setDonationSettings(null);
            }
        } catch (error) {
            console.error('Failed to fetch donation settings:', error);
            setDonationSettingsError('Failed to load donation information');
            setDonationSettings(null);
        } finally {
            setLoadingDonationSettings(false);
        }
    };

    const handleOpenDonationModal = () => {
        if (shelter && shelter._id) {
            fetchDonationSettings(shelter._id);
            setIsDonationModalOpen(true);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
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
                <Link href="/browse/shelters" className="text-teal-600 mt-4 inline-block">
                    ← Back to Shelters
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link
                    href="/browse/shelters"
                    className="group inline-flex items-center text-gray-600 hover:text-teal-600 transition-all duration-300"
                >
                    <div className="mr-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm group-hover:border-teal-200 group-hover:-translate-x-1 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="font-medium">Back to shelters</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="h-40 bg-gradient-to-r from-teal-500 to-emerald-400 relative">
                    <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,0 L100,0 L100,25 C75,40 50,30 25,20 C10,15 0,10 0,5 Z" fill="white" />
                        </svg>
                    </div>

                    {shelter.isVerified && (
                        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-2 shadow-sm">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-1 text-sm font-medium text-gray-800">Verified</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row">
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
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 text-4xl font-bold">
                                        {shelter.organizationName?.charAt(0).toUpperCase() || 'O'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:ml-8 mt-6 md:mt-0 flex flex-col sm:flex-row justify-between w-full">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-3">{shelter.organizationName}</h1>

                                <div className="flex items-center mt-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-gray-600 ml-2">
                                        {shelter.location || (shelter.city && shelter.province ? `${shelter.city}, ${shelter.province}` : 'Location not specified')}
                                    </p>
                                </div>

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

                                {shelter.description && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold text-lg mb-2">About Us</h3>
                                        <p className="text-gray-600">{shelter.description}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex mt-6 sm:mt-0 gap-3">
                                <button
                                    onClick={() => setIsRescueModalOpen(true)}
                                    className="h-fit px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center justify-center text-sm"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Request Rescue
                                </button>

                                <motion.button
                                    onClick={handleOpenDonationModal}
                                    className="h-fit px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md flex items-center justify-center text-sm relative"
                                    whileHover={{ scale: 1.05 }}
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        boxShadow: [
                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                            "0 10px 15px -3px rgba(126, 34, 206, 0.3)",
                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        ]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        repeatType: "reverse"
                                    }}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Donate Now
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Pets from {shelter.organizationName}</h2>
                        <p className="text-gray-600 mt-1">Find your perfect companion</p>
                    </div>
                </div>

                <div className="mb-4 md:mb-6 lg:mb-8 flex flex-col sm:flex-row gap-4 ">
                    <SearchBar
                        placeholder="Search shelter pets..."
                        onSearch={setSearchTerm}
                        className="max-w-2xl w-full"
                    />

                    <div className="self-end sm:self-auto">
                        <FilterPanel
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onReset={resetFilters}
                            totalCount={pets.length}
                            filteredCount={filteredPets.length}
                            showIconOnly={true}
                        />
                    </div>
                </div>

                {filteredPets.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600">No pets match your filter criteria or this shelter currently has no pets listed.</p>
                        {pets.length > 0 && (
                            <button
                                onClick={resetFilters}
                                className="mt-4 px-4 py-2 text-sm font-medium text-teal-600 border border-teal-600 rounded hover:bg-teal-50"
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
                                            <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded">Adopted</span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{pet.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {pet.breed} • {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                                    </p>

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
                                            className="text-teal-600 hover:text-teal-800 text-sm font-medium"
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

            {isRescueModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsRescueModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Request Rescue Service</h3>
                            <p className="text-gray-600 mt-2">Contact {shelter.organizationName} directly to request animal rescue assistance</p>
                        </div>

                        <div className="space-y-4">
                            {shelter.contactNumber && (
                                <a
                                    href={`tel:${shelter.contactNumber}`}
                                    className="flex items-center p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                                >
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">Call Now</div>
                                        <div className="text-sm text-teal-700">{shelter.contactNumber}</div>
                                    </div>
                                </a>
                            )}

                            {shelter.email && (
                                <a
                                    href={`mailto:${shelter.email}?subject=Rescue%20Request%20-%20Urgent&body=Hello%20${encodeURIComponent(shelter.organizationName)}%2C%0A%0AI%20would%20like%20to%20request%20your%20assistance%20for%20an%20animal%20rescue.%20%0A%0ADetails%3A%0A-%20Location%3A%20%0A-%20Animal%20type%3A%20%0A-%20Situation%3A%20%0A%0AThank%20you.`}
                                    className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">Email</div>
                                        <div className="text-sm text-green-700">{shelter.email}</div>
                                    </div>
                                </a>
                            )}

                            <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                <p className="text-sm text-gray-600">Please provide as much information as possible about the animal and situation when contacting the organization for rescue assistance.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsRescueModalOpen(false)}
                            className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {isDonationModalOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden relative"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                    >
                        <button
                            onClick={() => setIsDonationModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm z-10 transition-all hover:shadow"
                            aria-label="Close donation modal"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                            <div className="p-6 md:w-5/12 md:p-8 md:border-r border-gray-100 bg-gradient-to-br from-purple-50 to-white">
                                <div className="text-center md:text-left">
                                    <div className="w-16 h-16 mx-auto md:mx-0 bg-purple-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                                        <motion.div
                                            className="absolute inset-0 bg-purple-600 opacity-10"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 3,
                                                ease: "easeInOut",
                                            }}
                                        />
                                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Support {shelter?.organizationName}</h3>
                                    <p className="text-gray-600">Your donation helps us rescue and care for animals in need</p>
                                </div>

                                <div className="mt-8 hidden md:block">
                                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Your Impact</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4M12 20V4" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-600">Feed a rescued animal for a month</p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-600">Support veterinary treatment</p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-600">Improve shelter facilities</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-8 bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Questions about donating?
                                    </h4>
                                    <div className="space-y-2">
                                        {shelter?.email && (
                                            <a href={`mailto:${shelter.email}`} className="text-sm flex items-center group hover:text-purple-700 transition-colors">
                                                <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="border-b border-dashed border-gray-300 group-hover:border-purple-300">{shelter.email}</span>
                                            </a>
                                        )}
                                        {shelter?.contactNumber && (
                                            <a href={`tel:${shelter.contactNumber}`} className="text-sm flex items-center group hover:text-purple-700 transition-colors">
                                                <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="border-b border-dashed border-gray-300 group-hover:border-purple-300">{shelter.contactNumber}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:w-7/12 md:p-8 overflow-y-auto">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Methods</h3>

                                {loadingDonationSettings && (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                        <p className="text-gray-600">Loading donation information...</p>
                                    </div>
                                )}

                                {donationSettingsError && (
                                    <div className="bg-red-50 p-5 rounded-lg mb-6 border border-red-100">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-red-700 font-medium">
                                                {donationSettingsError}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!loadingDonationSettings && !donationSettingsError &&
                                    (!donationSettings ||
                                        !donationSettings.enableDonations ||
                                        (!donationSettings.donationQR &&
                                            !donationSettings.bankDetails?.accountNumber)) && (
                                        <div className="bg-yellow-50 p-5 rounded-lg mb-6 border border-yellow-100">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-yellow-700 font-medium">
                                                    This organization hasn&apos;t set up their donation details yet
                                                </p>
                                            </div>
                                            <p className="text-yellow-600 text-sm mt-2 ml-8">
                                                Please contact them directly to inquire about donation options.
                                            </p>
                                        </div>
                                    )}

                                {!loadingDonationSettings && !donationSettingsError && donationSettings?.enableDonations && (
                                    <div className="space-y-6">
                                        {donationSettings.donationQR && (
                                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="p-5">
                                                    <div className="flex items-center mb-4">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <h4 className="font-medium text-gray-900">Scan to Donate</h4>
                                                    </div>
                                                    <div className="flex justify-center py-2">
                                                        <div className="relative h-52 w-52 border border-gray-100 rounded-lg p-2 bg-white shadow-sm">
                                                            <Image
                                                                src={donationSettings.donationQR}
                                                                alt="Donation QR Code"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                            <motion.div
                                                                className="absolute inset-0 border-2 border-purple-500 rounded-lg opacity-0"
                                                                animate={{
                                                                    opacity: [0, 0.5, 0],
                                                                    scale: [1, 1.05, 1],
                                                                }}
                                                                transition={{
                                                                    repeat: Infinity,
                                                                    duration: 3,
                                                                    repeatDelay: 1,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-center text-gray-500 mt-3">
                                                        Scan with your mobile banking or payment app
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {donationSettings.bankDetails &&
                                            (donationSettings.bankDetails.bankName ||
                                                donationSettings.bankDetails.accountNumber) && (
                                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="p-5">
                                                        <div className="flex items-center mb-4">
                                                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                                                                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                                                </svg>
                                                            </div>
                                                            <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            {donationSettings.bankDetails.bankName && (
                                                                <div className="flex items-start mb-2">
                                                                    <span className="w-24 flex-shrink-0 text-gray-500 text-sm">Bank:</span>
                                                                    <span className="font-medium text-gray-800">{donationSettings.bankDetails.bankName}</span>
                                                                </div>
                                                            )}
                                                            {donationSettings.bankDetails.accountName && (
                                                                <div className="flex items-start mb-2">
                                                                    <span className="w-24 flex-shrink-0 text-gray-500 text-sm">Account Name:</span>
                                                                    <span className="font-medium text-gray-800">{donationSettings.bankDetails.accountName}</span>
                                                                </div>
                                                            )}
                                                            {donationSettings.bankDetails.accountNumber && (
                                                                <div className="flex items-start mb-2">
                                                                    <span className="w-24 flex-shrink-0 text-gray-500 text-sm">Account #:</span>
                                                                    <span className="font-medium text-gray-800 flex items-center">
                                                                        {donationSettings.bankDetails.accountNumber}
                                                                        <button
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(donationSettings.bankDetails.accountNumber);
                                                                                alert('Account number copied to clipboard!');
                                                                            }}
                                                                            className="ml-2 text-teal-500 hover:text-teal-700 focus:outline-none"
                                                                            title="Copy account number"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                                                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                                                                            </svg>
                                                                        </button>
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {donationSettings.bankDetails.instructions && (
                                                                <div className="mt-4 pt-3 border-t border-gray-200">
                                                                    <p className="text-xs font-medium text-gray-500 mb-1">Additional Instructions:</p>
                                                                    <p className="text-sm text-gray-700">{donationSettings.bankDetails.instructions}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-3">
                                                            Please include your name in the transfer reference for our records
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={() => setIsDonationModalOpen(false)}
                                        className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}