'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import PaymentStatus from '../../../../components/payments/PaymentStatus';
import PaymentSubmissionForm from '../../../../components/payments/PaymentSubmissionForm';
import PaymentVerificationForm from '../../../../components/payments/PaymentVerificationForm';

export default function PaymentDetailPage() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchPayment = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/payments/${id}`);
                if (response.data.success) {
                    setPayment(response.data.payment);
                }
            } catch (err) {
                console.error('Failed to fetch payment:', err);
                setError(err.response?.data?.error || 'Failed to load payment details');
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id, isAuthenticated, router]);

    const handlePaymentSubmitted = (updatedPayment) => {
        setPayment(prev => ({ ...prev, ...updatedPayment }));
    };

    const handlePaymentVerified = (updatedPayment) => {
        setPayment(prev => ({ ...prev, ...updatedPayment }));
    };

    const openImageViewer = (imageSrc) => {
        setCurrentImage(imageSrc);
        setImageViewerOpen(true);
    };

    // Determine if user is adopter or organization
    const isAdopter = user?.userType === 'adopter';
    const isOrganization = user?.userType === 'organization';

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-4 min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error || 'Payment not found.'}</p>
                </div>
                <Link href="/profile" className="text-teal-600 hover:text-teal-800 inline-flex items-center">
                    <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to profile
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
            {/* Back button */}
            <div className="mb-6 flex items-center">
                <Link href="/profile" className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to profile
                </Link>
            </div>

            {/* Main payment card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header section */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold">Payment #{payment.paymentId}</h1>
                        <PaymentStatus status={payment.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                        Created on {new Date(payment.dateCreated).toLocaleDateString()}
                    </p>
                </div>

                {/* Main content */}
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Pet details card */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h2 className="text-lg font-medium mb-3">Pet Details</h2>
                            <div className="flex items-start">
                                <div className="w-20 h-20 relative rounded-md overflow-hidden flex-shrink-0">
                                    {payment.petId.img_arr && payment.petId.img_arr.length > 0 ? (
                                        <Image
                                            src={payment.petId.img_arr[0]}
                                            alt={payment.petId.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                                            <span className="text-xs text-gray-500">No image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-3 flex-grow">
                                    <h3 className="font-medium text-base">{payment.petId.name}</h3>
                                    <p className="text-sm text-gray-500">{payment.petId.breed} • {payment.petId.specie}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Application #{payment.adoptionApplicationId.applicationId}
                                    </p>
                                    <div className="mt-2 inline-block bg-green-100 text-green-800 px-2 py-1 text-xs rounded-md">
                                        <span className="font-semibold">Fee: </span>
                                        ₱{payment.amount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Counterparty details card */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h2 className="text-lg font-medium mb-3">
                                {isAdopter ? 'Organization Details' : 'Adopter Details'}
                            </h2>
                            <div className="space-y-1">
                                {isAdopter ? (
                                    <>
                                        <p className="font-medium text-base">{payment.organizationId.organizationName}</p>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {payment.organizationId.email}
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {payment.organizationId.contactNumber}
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {payment.organizationId.location}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium text-base">{payment.adopterId.firstName} {payment.adopterId.lastName}</p>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {payment.adopterId.email}
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {payment.adopterId.contactNumber}
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {payment.adopterId.location}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment forms based on status and user type */}
                    {isAdopter && payment.status === 'pending' && (
                        <div className="mb-8">
                            <PaymentSubmissionForm payment={payment} onSuccess={handlePaymentSubmitted} />
                        </div>
                    )}

                    {isOrganization && payment.status === 'submitted' && (
                        <div className="mb-8">
                            <PaymentVerificationForm payment={payment} onSuccess={handlePaymentVerified} />
                        </div>
                    )}

                    {/* Show QR code for pending payments */}
                    {payment.status === 'pending' && (
                        <div className="mb-8 bg-gray-50 rounded-lg p-5">
                            <h2 className="text-lg font-medium mb-4 text-center">Payment QR Code</h2>
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-56 h-56 relative cursor-pointer border border-gray-200 p-2 bg-white rounded shadow-sm hover:shadow-md transition-shadow"
                                    onClick={() => openImageViewer(payment.qrImage)}
                                >
                                    <Image
                                        src={payment.qrImage}
                                        alt="Payment QR Code"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Tap QR code to enlarge</p>

                                {payment.paymentInstructions && (
                                    <div className="mt-6 text-center w-full max-w-md">
                                        <h3 className="font-medium text-gray-700 mb-2 text-base">Instructions:</h3>
                                        <div className="bg-white p-4 rounded-md border border-gray-200">
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap text-left">{payment.paymentInstructions}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Show proof of payment for submitted/verified/rejected payments */}
                    {payment.status !== 'pending' && payment.proofOfTransaction && (
                        <div className="mb-8 bg-gray-50 rounded-lg p-5">
                            <h2 className="text-lg font-medium mb-4 text-center">Proof of Payment</h2>
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-full max-w-md h-64 relative cursor-pointer border border-gray-200 bg-white rounded shadow-sm hover:shadow-md transition-shadow"
                                    onClick={() => openImageViewer(payment.proofOfTransaction)}
                                >
                                    <Image
                                        src={payment.proofOfTransaction}
                                        alt="Payment Proof"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Tap image to enlarge</p>

                                {payment.transactionId && (
                                    <div className="mt-4 p-3 bg-white rounded-md border border-gray-200 w-full max-w-md">
                                        <p className="text-sm">
                                            <span className="font-medium">Transaction ID:</span>
                                            <span className="ml-2 text-teal-600 break-all">{payment.transactionId}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Show organization notes for verified/rejected payments */}
                    {(payment.status === 'verified' || payment.status === 'rejected') && payment.organizationNotes && (
                        <div className="mb-6 bg-gray-50 rounded-lg p-5">
                            <h2 className="text-lg font-medium mb-3">Organization Notes</h2>
                            <div className="bg-white p-4 rounded-md border border-gray-200">
                                <p className="text-gray-700 whitespace-pre-wrap text-sm">{payment.organizationNotes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full screen image viewer */}
            {imageViewerOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
                    onClick={() => setImageViewerOpen(false)}
                >
                    <div className="relative w-full max-w-3xl h-[80vh]">
                        <Image
                            src={currentImage}
                            alt="Enlarged image"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <button
                        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
                        onClick={() => setImageViewerOpen(false)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}