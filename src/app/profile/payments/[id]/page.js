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

    // Determine if user is adopter or organization
    const isAdopter = user?.userType === 'adopter';
    const isOrganization = user?.userType === 'organization';

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-4 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="max-w-5xl mx-auto p-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error || 'Payment not found.'}</p>
                </div>
                <Link href="/profile" className="text-blue-600 hover:underline">
                    Back to profile
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4">
            <div className="mb-6">
                <Link href="/profile" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to profile
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-wrap items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">Payment #{payment.paymentId}</h1>
                    <PaymentStatus status={payment.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h2 className="text-lg font-medium mb-3">Adoption Details</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 relative rounded-md overflow-hidden">
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
                                <div className="ml-3">
                                    <h3 className="font-medium">{payment.petId.name}</h3>
                                    <p className="text-sm text-gray-500">{payment.petId.breed}</p>
                                    <p className="text-sm text-gray-500">
                                        Application #{payment.adoptionApplicationId.applicationId}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500">Adoption Fee</p>
                                    <p className="font-medium">₱{payment.amount}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Created On</p>
                                    <p className="font-medium">{new Date(payment.dateCreated).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-medium mb-3">
                            {isAdopter ? 'Organization Details' : 'Adopter Details'}
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            {isAdopter ? (
                                <>
                                    <p className="font-medium">{payment.organizationId.organizationName}</p>
                                    <p className="text-sm text-gray-500">{payment.organizationId.email}</p>
                                    <p className="text-sm text-gray-500 mt-1">{payment.organizationId.contactNumber}</p>
                                    <p className="text-sm text-gray-500">{payment.organizationId.location}</p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium">{payment.adopterId.firstName} {payment.adopterId.lastName}</p>
                                    <p className="text-sm text-gray-500">{payment.adopterId.email}</p>
                                    <p className="text-sm text-gray-500 mt-1">{payment.adopterId.contactNumber}</p>
                                    <p className="text-sm text-gray-500">{payment.adopterId.location}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment forms based on status and user type */}
                {isAdopter && payment.status === 'pending' && (
                    <PaymentSubmissionForm payment={payment} onSuccess={handlePaymentSubmitted} />
                )}

                {isOrganization && payment.status === 'submitted' && (
                    <PaymentVerificationForm payment={payment} onSuccess={handlePaymentVerified} />
                )}

                {/* Show QR code for pending payments */}
                {payment.status === 'pending' && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium mb-3">Payment QR Code</h2>
                        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                            <div className="w-48 h-48 relative">
                                <Image
                                    src={payment.qrImage}
                                    alt="Payment QR Code"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            {payment.paymentInstructions && (
                                <div className="mt-4 text-center max-w-md">
                                    <h3 className="font-medium text-gray-700 mb-1">Instructions:</h3>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{payment.paymentInstructions}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Show proof of payment for submitted/verified/rejected payments */}
                {payment.status !== 'pending' && payment.proofOfTransaction && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium mb-3">Payment Proof</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-center">
                                <div className="h-64 w-full max-w-md relative">
                                    <Image
                                        src={payment.proofOfTransaction}
                                        alt="Payment Proof"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            {payment.transactionId && (
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Transaction ID:</span> {payment.transactionId}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Show organization notes for verified/rejected payments */}
                {(payment.status === 'verified' || payment.status === 'rejected') && payment.organizationNotes && (
                    <div className="mb-6">
                        <h2 className="text-lg font-medium mb-3">Organization Notes</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 whitespace-pre-wrap">{payment.organizationNotes}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}