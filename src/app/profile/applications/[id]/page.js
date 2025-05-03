'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { use } from 'react';

export default function ApplicationDetailPage({ params }) {
    // Unwrap params using React.use()
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const { user, isAuthenticated, isAdopter } = useAuth();
    const router = useRouter();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Authentication checks
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // CHANGE LATER
        // if (!isAdopter()) {
        //     router.push('/profile');
        //     return;
        // }

        // Fetch the application details
        const fetchApplication = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/adoptions/${id}`);

                if (response.data.success) {
                    setApplication(response.data.application);
                } else {
                    setError(response.data.error || 'Failed to fetch application details');
                }
            } catch (err) {
                console.error('Error fetching application:', err);
                setError('Application not found or you do not have permission to view it');
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
        // Change params.id to just id in the dependency array
    }, [isAuthenticated, isAdopter, router, id]);

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
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="mb-6">
                    <Link href="/profile/applications" className="text-blue-600 hover:underline flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Applications
                    </Link>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="mb-6">
                    <Link href="/profile/applications" className="text-blue-600 hover:underline flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Applications
                    </Link>
                </div>

                <div className="text-center py-12">
                    <p className="text-gray-500">Application not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <Link href="/profile/applications" className="text-blue-600 hover:underline flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Applications
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b p-4 sm:p-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Application #{application.applicationId}</h1>
                    <div>{getStatusBadge(application.status)}</div>
                </div>

                {/* Application content */}
                <div className="p-4 sm:p-6">
                    {/* Pet Information Section */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <h2 className="font-semibold text-lg mb-3">Pet Information</h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                                    {application.petId.img_arr && application.petId.img_arr.length > 0 ? (
                                        <Image
                                            src={application.petId.img_arr[0]}
                                            alt={application.petId.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400">No image</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-medium text-lg">{application.petId.name}</h3>
                                <p className="text-gray-600 mb-2">
                                    {application.petId.breed} • {application.petId.gender} • {application.petId.specie}
                                </p>
                                <p className="text-gray-600">
                                    Status: <span className={application.petId.status === 'available' ? 'text-green-600' : 'text-blue-600'}>
                                        {application.petId.status.charAt(0).toUpperCase() + application.petId.status.slice(1)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <h2 className="font-semibold text-lg mb-3">Application Details</h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500">Submitted on {new Date(application.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="mb-2"><span className="font-medium">Housing Status:</span> {application.housingStatus}</p>
                                        <p className="mb-2"><span className="font-medium">Pets Allowed:</span> {application.petsAllowed}</p>
                                        <p className="mb-2"><span className="font-medium">Pet Location:</span> {application.petLocation}</p>
                                        <p className="mb-2"><span className="font-medium">Primary Caregiver:</span> {application.primaryCaregiver}</p>
                                    </div>
                                    <div>
                                        <p className="mb-2"><span className="font-medium">Other Pets:</span> {application.otherPets}</p>
                                        <p className="mb-2"><span className="font-medium">Financially Prepared:</span> {application.financiallyPrepared}</p>
                                        <p className="mb-2"><span className="font-medium">Emergency Pet Care:</span> {application.emergencyPetCare}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <h3 className="font-medium mb-2">Reference</h3>
                                    <p className="mb-1"><span className="font-medium">Name:</span> {application.reference.name}</p>
                                    <p className="mb-1"><span className="font-medium">Email:</span> {application.reference.email}</p>
                                    <p><span className="font-medium">Phone:</span> {application.reference.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Organization Response Section - Only show if there's a response */}
                    {(application.status === 'approved' || application.status === 'rejected') && (
                        <div className={`mb-8 p-4 rounded-lg ${application.status === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
                            <h2 className={`font-semibold text-lg mb-3 ${application.status === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                                {application.status === 'approved' ? 'Application Approved' : 'Application Rejected'}
                            </h2>

                            {application.rejectionReason && (
                                <div className="mb-4">
                                    <p className="font-medium">Reason:</p>
                                    <p className="text-gray-700">{application.rejectionReason}</p>
                                </div>
                            )}

                            {application.organizationNotes && (
                                <div className="mb-4">
                                    <p className="font-medium">Notes from {application.organizationId.organizationName}:</p>
                                    <p className="text-gray-700">{application.organizationNotes}</p>
                                </div>
                            )}

                            {application.reviewedBy && (
                                <p className="text-sm text-gray-600 mt-3">
                                    Reviewed by: {application.reviewedBy}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Organization Contact Section */}
                    <div className="mb-8">
                        <h2 className="font-semibold text-lg mb-3">Shelter Information</h2>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-lg">{application.organizationId.organizationName}</h3>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {application.organizationId.contactNumber && (
                                    <a
                                        href={`tel:${application.organizationId.contactNumber}`}
                                        className="flex items-center p-3 bg-white hover:bg-blue-50 rounded-lg transition-colors group"
                                    >
                                        <div className="mr-3 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">Phone</div>
                                            <div className="text-blue-600">{application.organizationId.contactNumber}</div>
                                        </div>
                                    </a>
                                )}

                                {application.organizationId.email && (
                                    <a
                                        href={`mailto:${application.organizationId.email}`}
                                        className="flex items-center p-3 bg-white hover:bg-blue-50 rounded-lg transition-colors group"
                                    >
                                        <div className="mr-3 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">Email</div>
                                            <div className="text-blue-600">{application.organizationId.email}</div>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}