"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [message, setMessage] = useState('');
    const [validationError, setValidationError] = useState('');
    const router = useRouter();

    // Email validation
    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        if (email.indexOf(' ') !== -1) return 'Email address cannot contain spaces';

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(email) ? '' : 'Please enter a valid email address';
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setValidationError(validateEmail(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email
        const error = validateEmail(email);
        if (error) {
            setValidationError(error);
            return;
        }

        setStatus('submitting');
        setMessage('');

        try {
            const response = await axios.post('/api/forgot-password', { email });

            if (response.data.success) {
                setStatus('success');
                setMessage(
                    'Password reset instructions have been sent to your email address. ' +
                    'The link will expire in 1 hour.'
                );
            }
        } catch (error) {
            // Don't reveal if email exists or not for security
            setStatus('success');
            setMessage(
                'If your email is registered with us, you will receive password reset instructions shortly. ' +
                'The link will expire in 1 hour.'
            );
            console.error('Error requesting password reset:', error);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4 py-12 -mt-24">
            <div className="w-full max-w-md">
                {/* Logo and branding */}
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        <Link href="/">
                            <Image
                                src="/logo.svg"
                                alt="StraySpot Logo"
                                width={100}
                                height={100}
                                className="h-16 w-16 rounded-full"
                            />
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Reset Your Password</h1>
                    <p className="mt-2 text-gray-600">Enter your email address to receive a password reset link</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {status === 'success' ? (
                        <div className="p-6">
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">{message}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-teal-600 hover:text-teal-500 font-medium"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`mt-1 block w-full px-3 py-2 border ${validationError
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                                        } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                                    placeholder="you@example.com"
                                />
                                {validationError && (
                                    <p className="mt-1 text-sm text-red-600">{validationError}</p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={status === 'submitting' || validationError}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                        ${status === 'submitting' || validationError
                                            ? 'bg-teal-400 cursor-not-allowed'
                                            : 'bg-teal-600 hover:bg-teal-700'
                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200`}
                                >
                                    {status === 'submitting' ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : 'Send Reset Link'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link href="/login" className="text-teal-600 hover:text-teal-500 font-medium">
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}