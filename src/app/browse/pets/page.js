'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import FilterPanel from '../../../components/filters/FilterPanel';
import SearchBar from '../../../components/SearchBar';
import PetCardSkeleton from '../../../components/PetCardSkeleton';
import PetCard from '../../../components/pets/PetCard';
import { useAuth } from '../../../../context/AuthContext';
import { Suspense } from 'react';

// Create a separate component that uses search params
function PetsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const searchBarRef = useRef(null);
    // Get user information from auth context
    const { user } = useAuth();
    const userRole = user?.userType || 'guest';

    // Get initial specie from URL query parameter
    const initialSpecie = searchParams.get('specie') || '';

    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter states - keep all filters
    const [filters, setFilters] = useState({
        species: initialSpecie,
        gender: '',
        status: '',
        tags: [],
        priceRange: {
            min: '',
            max: ''
        }
    });

    // Fetch pets when species filter changes (only species is server-side filtered via API)
    useEffect(() => {
        const fetchPets = async () => {
            try {
                setLoading(true);
                // Create API endpoint with query parameter if species filter is set
                const endpoint = filters.species
                    ? `/api/pets?specie=${encodeURIComponent(filters.species)}`
                    : '/api/pets';

                const response = await axios.get(endpoint);

                if (response.data.success) {
                    // Filter out adopted pets
                    const availablePets = response.data.pets.filter(
                        pet => pet.status !== 'adopted'
                    );
                    setPets(availablePets);
                    // Will be filtered further by the applyFilters function
                    applyFilters(availablePets);
                }
            } catch (err) {
                console.error('Failed to fetch pets:', err);
                setError('Unable to load pets. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPets();
    }, [filters.species]); // Only depend on species filter for API calls

    // Apply all other filters client-side
    const applyFilters = (petsToFilter = pets) => {
        let result = [...petsToFilter];

        // Apply search term filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(pet =>
                pet.name.toLowerCase().includes(searchLower) ||
                pet.breed.toLowerCase().includes(searchLower) ||
                (pet.tags && pet.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }

        // Apply gender filter
        if (filters.gender) {
            result = result.filter(pet => pet.gender === filters.gender);
        }

        // Apply status filter
        if (filters.status) {
            result = result.filter(pet => pet.status === filters.status);
        }

        // Apply tags filter (all selected tags must be present)
        if (filters.tags.length > 0) {
            result = result.filter(pet =>
                filters.tags.every(tag => pet.tags && pet.tags.includes(tag))
            );
        }

        // Apply price range filter
        if (filters.priceRange.min !== '') {
            result = result.filter(pet =>
                pet.adoptionFee >= parseFloat(filters.priceRange.min)
            );
        }
        if (filters.priceRange.max !== '') {
            result = result.filter(pet =>
                pet.adoptionFee <= parseFloat(filters.priceRange.max)
            );
        }

        setFilteredPets(result);
    };

    // Re-apply filters when any filter or search term changes
    useEffect(() => {
        applyFilters();
    }, [filters.gender, filters.status, filters.tags, filters.priceRange, searchTerm]);

    // Handle filter changes for all filter types
    const handleFilterChange = (category, value) => {
        // Special case for species - update URL
        if (category === 'species') {
            const params = new URLSearchParams(searchParams.toString());

            if (value) {
                params.set('specie', value);
            } else {
                params.delete('specie');
            }

            // Update URL without page refresh
            router.push(`/browse/pets?${params.toString()}`, { scroll: false });

            // Update the species filter
            setFilters(prev => ({
                ...prev,
                species: value
            }));
        }
        // Handle other filter types without URL updates
        else if (category === 'tags') {
            // Toggle tag selection
            const updatedTags = filters.tags.includes(value)
                ? filters.tags.filter(tag => tag !== value)
                : [...filters.tags, value];

            setFilters(prev => ({
                ...prev,
                tags: updatedTags
            }));
        }
        else if (category === 'priceMin') {
            setFilters(prev => ({
                ...prev,
                priceRange: {
                    ...prev.priceRange,
                    min: value
                }
            }));
        }
        else if (category === 'priceMax') {
            setFilters(prev => ({
                ...prev,
                priceRange: {
                    ...prev.priceRange,
                    max: value
                }
            }));
        }
        else {
            // Handle gender and status filters
            setFilters(prev => ({
                ...prev,
                [category]: value
            }));
        }
    };

    const resetFilters = () => {
        // Clear all filters
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

        // Clear search term
        setSearchTerm('');

        // Remove specie parameter from URL
        router.push('/browse/pets', { scroll: false });
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleClearSearch = () => {
        // Use the searchBarRef to clear the search input
        if (searchBarRef.current) {
            searchBarRef.current.clear();
        }
        // This is a fallback, but the SearchBar component should call handleSearch with empty string
        setSearchTerm('');
    };



    const handleFavorite = (pet) => {
        console.log('Favorite toggled for pet:', pet.name);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-6">Browse Pets</h1>
                    <p className="text-gray-600 mb-6">Find your perfect companion.</p>
                </div>
            </div>

            <div className="mb-4 md:mb-6 lg:mb-8 flex flex-col sm:flex-row gap-4">
                <SearchBar
                    ref={searchBarRef}
                    placeholder="Search pets by name, breed, or tags..."
                    onSearch={handleSearch}
                    className="max-w-2xl w-full"
                    onClear={() => console.log("Search cleared from SearchBar component")}
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

            {loading ? (
                <div className="flex flex-wrap gap-6 justify-center sm:justify-start px-4 md:px-6">
                    {Array(20).fill().map((_, index) => (
                        <PetCardSkeleton key={index} />
                    ))}
                </div>
            ) : filteredPets.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">No pets match your filter criteria. Try adjusting your filters.</p>
                    {pets.length > 0 && (
                        <button
                            onClick={handleClearSearch}
                            className="mt-4 px-4 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded hover:bg-orange-50"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                    {filteredPets.map(pet => (
                        <PetCard
                            key={pet._id}
                            pet={pet}
                            onFavorite={handleFavorite}
                            userRole={userRole}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Main page component with Suspense boundary
export default function PetsPage() {
    return (
        <Suspense fallback={
            <div className="p-4">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
                <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                    {Array(12).fill().map((_, index) => (
                        <PetCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        }>
            <PetsPageContent />
        </Suspense>
    );
}