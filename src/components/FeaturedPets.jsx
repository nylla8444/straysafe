'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import PetCard from './pets/PetCard';
import Link from 'next/link';

export default function FeaturedPets() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentPets = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/pets/recent');

                if (response.data.success) {
                    setPets(response.data.pets);
                } else {
                    setError('Failed to fetch recent pets');
                }
            } catch (err) {
                console.error('Error fetching recent pets:', err);
                setError('Something went wrong while fetching pets');
            } finally {
                setLoading(false);
            }
        };

        fetchRecentPets();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-5">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }
    return (
        <div className="flex flex-wrap justify-center gap-6">
            {pets.length > 0 ? (
                pets.map(pet => (

                    <PetCard pet={pet} key={pet._id} userRole="guest" />

                ))
            ) : (
                <div className="w-full text-center text-gray-500 py-10">
                    No pets available at the moment
                </div>
            )}
        </div>
    );
}