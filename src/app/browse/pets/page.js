'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import FilterPanel from '../../../components/filters/FilterPanel';

export default function PetsPage() {
    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
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

    useEffect(() => {
        const fetchPets = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/pets');
                if (response.data.success) {
                    setPets(response.data.pets);
                    setFilteredPets(response.data.pets);
                }
            } catch (err) {
                console.error('Failed to fetch pets:', err);
                setError('Unable to load pets. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPets();
    }, []);

    // Apply filters whenever filter criteria change
    useEffect(() => {
        applyFilters();
    }, [filters, pets]);

    const applyFilters = () => {
        let result = [...pets];

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
            status: '',
            tags: [],
            priceRange: {
                min: '',
                max: ''
            }
        });
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Browse Pets</h1>
                    <p className="text-gray-600 mt-1">Find your perfect companion.</p>
                </div>
            </div>

            <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
                totalCount={pets.length}
                filteredCount={filteredPets.length}
            />

            {filteredPets.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">No pets match your filter criteria. Try adjusting your filters.</p>
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
                                        {pet.adoptionFee > 0 ? `$${pet.adoptionFee}` : 'Free'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}