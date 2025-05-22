"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

// Create a client component that safely uses useSearchParams
function VerificationContent() {
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const searchParams = useSearchParams();

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('No verification token found');
                return;
            }

            try {
                const response = await axios.post('/api/verify-email', { token });

                if (response.data.success) {
                    setStatus('success');
                    setMessage('Your email has been successfully verified! You can now sign in to your account.');
                } else {
                    setStatus('error');
                    setMessage(response.data.error || 'Failed to verify your email');
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification link is invalid or has expired');
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <>
            {status === 'verifying' && (
                <div className="flex flex-col items-center py-4">
                    <div className="rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent animate-spin mb-4"></div>
                    <p className="text-gray-600 text-lg text-center">Verifying your email...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="text-center py-4">
                    <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Verified!</h2>
                    <p className="text-gray-600">{message}</p>
                    <div className="mt-6">
                        <Link href="/login"
                            className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">
                            Sign In to Your Account
                        </Link>
                    </div>
                </div>
            )}

            {(status === 'error' || status === 'expired') && (
                <div className="text-center py-4">
                    <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
                    <p className="text-gray-600">{message}</p>
                    <div className="mt-6">
                        <Link href="/login" className="text-teal-600 hover:text-teal-500 font-medium">
                            Go to Login
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 py-12 -mt-24">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        <Image
                            src="/logo.svg"
                            alt="StraySpot Logo"
                            width={100}
                            height={100}
                            className="h-16 w-16 rounded-full"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Email Verification</h1>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 space-y-6">
                        <Suspense fallback={
                            <div className="flex flex-col items-center py-4">
                                <div className="rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent animate-spin mb-4"></div>
                                <p className="text-gray-600 text-lg text-center">Loading...</p>
                            </div>
                        }>
                            <VerificationContent />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}