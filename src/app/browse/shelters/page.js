'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

export default function SheltersPage() {
    const [shelters, setShelters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchShelters = async () => {
            try {
                setLoading(true);
                // Update this API endpoint based on your actual API
                const response = await axios.get('/api/organizations');
                if (response.data.success) {
                    setShelters(response.data.organizations);
                }
            } catch (err) {
                console.error('Failed to fetch shelters:', err);
                setError('Unable to load shelters. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchShelters();
    }, []);

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
            <h1 className="text-3xl font-bold mb-6">Browse Shelters</h1>
            <p className="text-gray-600 mb-6">Find animal shelters and rescue organizations.</p>

            {shelters.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">No shelters available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shelters.map(shelter => (
                        <div key={shelter._id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1">{shelter.organizationName}</h3>
                                <p className="text-gray-600 text-sm mb-2">{shelter.location}</p>
                                <div className="mt-3">
                                    <Link
                                        href={`/browse/shelters/${shelter._id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}