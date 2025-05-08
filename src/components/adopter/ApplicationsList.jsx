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
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="text-center py-8 bg-white rounded-lg shadow">
                <div className="mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
                <p className="text-gray-500 mb-6 px-4">You haven't submitted any adoption applications yet.</p>
                <Link href="/browse/pets" className="text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Browse Pets for Adoption
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header - Responsive layout */}
            <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-lg font-medium text-gray-900">Your Adoption Applications</h3>
                <Link
                    href="/browse/pets"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-center sm:text-left w-full sm:w-auto flex justify-center items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Adopt More Pets
                </Link>
            </div>

            {/* Applications list - Mobile optimized */}
            <ul className="divide-y divide-gray-200">
                {applications.map((app) => (
                    <li key={app._id} className="hover:bg-gray-50 transition-colors">
                        <Link href={`/profile/applications/${app.applicationId}`} className="block p-3 sm:p-4" aria-label={`View application for ${app.petId.name}`}>
                            <div className="flex items-center">
                                {/* Pet image - Responsive sizing */}
                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-md overflow-hidden relative flex-shrink-0">
                                    {app.petId.img_arr && app.petId.img_arr.length > 0 ? (
                                        <Image
                                            src={app.petId.img_arr[0]}
                                            alt={app.petId.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                                            <span className="text-xs text-gray-500">No image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Application details - Better mobile layout */}
                                <div className="ml-3 sm:ml-4 flex-grow min-w-0">
                                    {/* Top section with pet name and status */}
                                    <div className="flex justify-between items-start flex-wrap gap-y-1">
                                        <div className="pr-2 min-w-0">
                                            <p className="text-gray-900 font-medium truncate">{app.petId.name}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">{app.petId.breed}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {getStatusBadge(app.status)}
                                        </div>
                                    </div>

                                    {/* Bottom section with date and application ID */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-1">
                                        <p className="text-xs text-gray-500 order-2 sm:order-1">
                                            Submitted: {format(new Date(app.createdAt), 'MMM d, yyyy')}
                                        </p>

                                        {/* View details button - Better touch target */}
                                        <div className="order-1 sm:order-2 mt-1 sm:mt-0">
                                            <span className="text-xs text-blue-600 font-medium flex items-center justify-end sm:justify-start">
                                                <span className="hidden sm:inline mr-1">Application #</span>
                                                <span className="truncate max-w-[100px]">{app.applicationId}</span>
                                                <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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