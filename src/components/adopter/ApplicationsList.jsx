import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import axios from 'axios';

export default function ApplicationsList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/adoptions/adopter');

                if (response.data.success) {
                    setApplications(response.data.applications);
                } else {
                    setError('Failed to fetch your adoption applications');
                }
            } catch (err) {
                console.error('Error fetching applications:', err);
                setError('Failed to load your adoption applications. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Helper function to get status badge color
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Pending</span>;
            case 'reviewing':
                return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Reviewing</span>;
            case 'approved':
                return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Approved</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Rejected</span>;
            case 'withdrawn':
                return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Withdrawn</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Adoption Applications</h3>
                <p className="text-gray-500 mb-6">You haven't submitted any adoption applications yet.</p>
                <Link href="/browse/pets" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                    Browse Pets for Adoption
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Your Adoption Applications</h3>
                <Link href="/browse/pets" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Adopt More Pets
                </Link>
            </div>
            <ul className="divide-y divide-gray-200">
                {applications.map((app) => (
                    <li key={app._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <Link href={`/profile/applications/${app.applicationId}`} className="block" aria-label={`View application for ${app.petId.name}`}>
                            <div className="flex items-center">
                                <div className="h-16 w-16 rounded-md overflow-hidden relative flex-shrink-0">
                                    {app.petId.img_arr && app.petId.img_arr.length > 0 ? (
                                        <Image
                                            src={app.petId.img_arr[0]}
                                            alt={app.petId.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                                            <span className="text-gray-500">No image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-900 font-medium">{app.petId.name}</p>
                                            <p className="text-sm text-gray-500">{app.petId.breed}</p>
                                        </div>
                                        <div>
                                            {getStatusBadge(app.status)}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-gray-500">
                                            Submitted on {format(new Date(app.createdAt), 'MMM d, yyyy')}
                                        </p>
                                        <div className="flex items-center">
                                            <p className="text-xs text-gray-500 mr-2">
                                                Application #{app.applicationId}
                                            </p>
                                            <span className="text-xs text-blue-600 font-medium flex items-center">
                                                View details
                                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}