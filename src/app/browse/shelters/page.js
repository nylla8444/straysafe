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
                        <div key={shelter._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl border border-gray-100">
                            <div>
                                {/* Color banner with optional pattern */}
                                <div className="h-12 bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <path d="M0,0 L100,0 L100,5 C60,20 40,20 0,5 Z" fill="white" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-center">
                                        {/* Improved organization logo with elevation */}
                                        <div className="relative -mt-12 w-20 h-20 rounded-lg shadow-md overflow-hidden bg-white p-1 border border-gray-100">
                                            <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-100">
                                                {shelter.profileImage ? (
                                                    <Image
                                                        src={shelter.profileImage}
                                                        alt={shelter.organizationName}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-2xl font-bold">
                                                        {shelter.organizationName?.charAt(0).toUpperCase() || 'O'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Organization name and verification badge */}
                                        <div className="ml-4">
                                            <div className="flex items-center">
                                                <h3 className="font-bold text-lg text-gray-800">{shelter.organizationName}</h3>
                                                {shelter.isVerified && (
                                                    <span className="ml-2">
                                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                {shelter.location || (shelter.city && shelter.province ? `${shelter.city}, ${shelter.province}` : 'Location not specified')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Additional organization info */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                {shelter.establishedYear ? `Est. ${shelter.establishedYear}` : 'Animal Shelter'}
                                            </div>
                                            <span className="text-blue-600 font-medium hover:text-blue-800 hover:underline">
                                                <Link href={`/browse/shelters/${shelter._id}`}>
                                                    View Details
                                                </Link>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}