'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import PaymentStatus from '../../../../components/payments/PaymentStatus';
import PaymentVerificationForm from '../../../../components/payments/PaymentVerificationForm';

export default function OrganizationPaymentDetailPage() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [fullImageView, setFullImageView] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (user?.userType !== 'organization') {
            router.push('/profile');
            return;
        }

        const fetchPayment = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/payments/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

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
    }, [id, isAuthenticated, user, router]);

    const handlePaymentVerified = (updatedPayment) => {
        setPayment(prev => ({ ...prev, ...updatedPayment }));
        // Show details tab after verification
        setActiveTab('details');
    };

    // Function to render the payment timeline
    const renderTimeline = () => {
        const timeline = [];

        // Created
        timeline.push({
            date: payment.dateCreated,
            status: 'Created',
            description: `Payment request created for ₱${payment.amount}`,
            color: 'gray'
        });

        // Submitted (if applicable)
        if (payment.submissionDate) {
            timeline.push({
                date: payment.submissionDate,
                status: 'Submitted',
                description: 'Adopter submitted proof of payment',
                color: 'teal'
            });
        }

        // Verified/Rejected (if applicable)
        if (payment.dateVerified) {
            timeline.push({
                date: payment.dateVerified,
                status: payment.status === 'verified' ? 'Verified' : 'Rejected',
                description: payment.organizationNotes || (payment.status === 'verified' ?
                    'Payment was verified by organization' :
                    'Payment was rejected by organization'),
                color: payment.status === 'verified' ? 'green' : 'red'
            });
        }

        // Sort by date
        timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

        return timeline;
    };

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
                <Link href="/organization/payments" className="text-teal-600 hover:underline inline-flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to payments
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
            {/* Back link */}
            <div className="mb-4 sm:mb-6">
                <Link href="/organization/payments" className="inline-flex items-center text-teal-600 hover:text-teal-800 hover:underline font-medium">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to payments
                </Link>
            </div>

            {/* Action buttons for mobile - shown at the top for easy access */}
            <div className="lg:hidden mb-4">
                {payment.status === 'submitted' && (
                    <button
                        onClick={() => setActiveTab('verify')}
                        className="w-full bg-teal-600 text-white px-4 py-3 rounded-md hover:bg-teal-700 active:bg-teal-800 transition flex items-center justify-center font-medium"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verify Payment
                    </button>
                )}

                {(payment.status === 'verified' || payment.status === 'rejected') && (
                    <div className="w-full bg-teal-50 text-teal-600 px-4 py-3 rounded-md flex items-center justify-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {payment.status === 'verified' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                        </svg>
                        Payment {payment.status === 'verified' ? 'Verified' : 'Rejected'}
                    </div>
                )}
            </div>

            {/* Payment header with status badge */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 sm:mb-6">
                <div className="p-4 sm:p-6 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">Payment #{payment.paymentId}</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Created {new Date(payment.dateCreated).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between sm:justify-normal sm:flex-row w-full sm:w-auto">
                            <div className="mr-3">
                                <span className="block text-sm text-gray-500">Amount</span>
                                <span className="font-bold text-lg sm:text-xl">₱{payment.amount.toLocaleString()}</span>
                            </div>
                            <PaymentStatus status={payment.status} large />
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs - Optimized for touch */}
                <div className="border-b px-4 sm:px-6 overflow-x-auto">
                    <div className="flex space-x-4 sm:space-x-6">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'details'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Payment Details
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'timeline'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Timeline
                        </button>
                        {payment.status === 'submitted' && (
                            <button
                                onClick={() => setActiveTab('verify')}
                                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'verify'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Verify Payment
                            </button>
                        )}
                    </div>
                </div>

                {activeTab === 'details' && (
                    <div className="p-4 sm:p-6">
                        {/* Content sections stacked on mobile, side-by-side on desktop */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Pet and application details */}
                            <div>
                                <h2 className="text-lg font-medium mb-3">Pet & Adoption Details</h2>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    {payment.petId && (
                                        <div className="flex items-center mb-4">
                                            <div className="h-16 w-16 rounded-lg overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                                                {payment.petId.img_arr && payment.petId.img_arr.length > 0 ? (
                                                    <Image
                                                        src={payment.petId.img_arr[0]}
                                                        alt={payment.petId.name}
                                                        width={64}
                                                        height={64}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{payment.petId.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {payment.petId.breed} • {payment.petId.gender}
                                                </p>
                                                {payment.petId.specie && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 mt-1">
                                                        {payment.petId.specie}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {payment.adoptionApplicationId && (
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-gray-700 break-all">
                                                Application #{payment.adoptionApplicationId.applicationId}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {payment.qrImage && (
                                    <div className="mt-6">
                                        <h2 className="text-lg font-medium mb-3">Payment QR Code</h2>
                                        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                                            <div
                                                className="w-32 h-32 relative mb-3 cursor-pointer hover:opacity-90"
                                                onClick={() => setFullImageView(payment.qrImage)}
                                            >
                                                <Image
                                                    src={payment.qrImage}
                                                    alt="Payment QR Code"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3">Tap to enlarge</p>

                                            {payment.paymentInstructions && (
                                                <div className="text-sm text-gray-700 w-full p-3 bg-white rounded border border-gray-200">
                                                    <h4 className="font-medium mb-1">Payment Instructions</h4>
                                                    <p className="whitespace-pre-wrap">{payment.paymentInstructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Adopter details */}
                            <div>
                                <h2 className="text-lg font-medium mb-3">Adopter Details</h2>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mr-4 text-teal-600 flex-shrink-0">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium truncate">{payment.adopterId.firstName} {payment.adopterId.lastName}</h3>
                                            <p className="text-sm text-gray-500 truncate">{payment.adopterId.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex">
                                            <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span className="text-gray-600 break-all">
                                                {payment.adopterId.contactNumber || 'No phone number provided'}
                                            </span>
                                        </div>

                                        <div className="flex">
                                            <svg className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-gray-600 break-words">
                                                {payment.adopterId.location || 'No location provided'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment proof section */}
                                {(payment.status === 'submitted' || payment.status === 'verified' || payment.status === 'rejected') &&
                                    payment.proofOfTransaction && (
                                        <div className="mt-6">
                                            <h2 className="text-lg font-medium mb-3">Payment Proof</h2>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div
                                                    className="relative h-48 sm:h-64 rounded-lg overflow-hidden mb-4 border border-gray-200 cursor-pointer"
                                                    onClick={() => setFullImageView(payment.proofOfTransaction)}
                                                >
                                                    <Image
                                                        src={payment.proofOfTransaction}
                                                        alt="Payment Proof"
                                                        fill
                                                        className="object-contain"
                                                    />

                                                    <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white px-3 py-1 rounded-md text-xs flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Tap to view
                                                    </div>
                                                </div>

                                                {payment.transactionId && (
                                                    <div className="mb-3 bg-white p-3 border border-gray-200 rounded-md">
                                                        <p className="text-sm font-medium">Transaction ID</p>
                                                        <p className="text-gray-700 font-mono text-sm break-all">{payment.transactionId}</p>
                                                    </div>
                                                )}

                                                <div className="text-sm text-gray-500">
                                                    Submitted on {new Date(payment.dateSubmitted || payment.submissionDate).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Verification details if already verified/rejected */}
                        {(payment.status === 'verified' || payment.status === 'rejected') && payment.organizationNotes && (
                            <div className="mb-6">
                                <h2 className="text-lg font-medium mb-3">Verification Details</h2>
                                <div className={`bg-gray-50 p-4 rounded-lg border-l-4 ${payment.status === 'verified' ? 'border-green-500' : 'border-red-500'}`}>
                                    <div className="flex items-start">
                                        <div className="mr-3 mt-0.5">
                                            {payment.status === 'verified' ? (
                                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-100">
                                                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-red-100">
                                                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {payment.status === 'verified' ? 'Payment was verified' : 'Payment was rejected'}
                                            </p>
                                            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{payment.organizationNotes}</p>
                                            {payment.dateVerified && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {payment.status === 'verified' ? 'Verified' : 'Rejected'} on {new Date(payment.dateVerified).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg font-medium mb-4">Payment Timeline</h2>
                        <div className="flow-root">
                            <ul className="-mb-8">
                                {renderTimeline().map((event, index) => (
                                    <li key={index}>
                                        <div className="relative pb-8">
                                            {index !== renderTimeline().length - 1 ? (
                                                <span
                                                    className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                            <div className="relative flex gap-3">
                                                <div className="flex-shrink-0">
                                                    <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-white bg-${event.color}-100`}>
                                                        {event.status === 'Created' && (
                                                            <svg className={`h-5 w-5 text-${event.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        )}
                                                        {event.status === 'Submitted' && (
                                                            <svg className={`h-5 w-5 text-${event.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                            </svg>
                                                        )}
                                                        {event.status === 'Verified' && (
                                                            <svg className={`h-5 w-5 text-${event.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                        {event.status === 'Rejected' && (
                                                            <svg className={`h-5 w-5 text-${event.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex-1 flex flex-col sm:flex-row sm:justify-between pt-1.5">
                                                    <div className="mb-2 sm:mb-0 pr-2">
                                                        <p className="text-sm font-medium text-gray-900">{event.status}</p>
                                                        <p className="text-sm text-gray-500 mt-1 break-words">{event.description}</p>
                                                    </div>
                                                    <div className="text-sm text-gray-500 whitespace-nowrap sm:text-right mt-1 sm:mt-0">
                                                        <time dateTime={new Date(event.date).toISOString()}>
                                                            {new Date(event.date).toLocaleDateString()}
                                                            <br className="hidden sm:block" />
                                                            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'verify' && payment.status === 'submitted' && (
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Payment proof for quick reference during verification */}
                            <div className="md:w-1/2">
                                <h3 className="text-lg font-medium mb-3">Payment Proof</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div
                                        className="relative h-48 sm:h-60 rounded-lg overflow-hidden mb-4 border border-gray-200 cursor-pointer"
                                        onClick={() => setFullImageView(payment.proofOfTransaction)}
                                    >
                                        <Image
                                            src={payment.proofOfTransaction}
                                            alt="Payment Proof"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    {payment.transactionId && (
                                        <div className="mb-3 bg-white p-3 border border-gray-200 rounded-md">
                                            <p className="text-sm font-medium">Transaction ID</p>
                                            <p className="text-gray-700 font-mono text-sm break-all">{payment.transactionId}</p>
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-500">
                                        Submitted {new Date(payment.dateSubmitted || payment.submissionDate).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Verification form */}
                            <div className="md:w-1/2">
                                <h3 className="text-lg font-medium mb-3">Verify Payment</h3>
                                <PaymentVerificationForm
                                    payment={payment}
                                    onSuccess={handlePaymentVerified}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action buttons based on payment status - Desktop version (hidden on mobile) */}
            <div className="hidden lg:flex flex-row gap-4 mb-6">
                {payment.status === 'submitted' && (
                    <button
                        onClick={() => setActiveTab('verify')}
                        className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition flex items-center justify-center"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verify Payment
                    </button>
                )}

                {(payment.status === 'verified' || payment.status === 'rejected') && (
                    <div className="bg-teal-50 text-teal-600 px-6 py-2 rounded-md flex items-center justify-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {payment.status === 'verified' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                        </svg>
                        Payment {payment.status === 'verified' ? 'Verified' : 'Rejected'}
                    </div>
                )}
            </div>

            {/* Full image viewer modal */}
            {fullImageView && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setFullImageView(null)}
                >
                    <div className="relative w-full max-w-3xl h-[80vh]">
                        <Image
                            src={fullImageView}
                            alt="Enlarged image"
                            fill
                            className="object-contain"
                            quality={100}
                        />
                    </div>
                    <button
                        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
                        onClick={() => setFullImageView(null)}
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