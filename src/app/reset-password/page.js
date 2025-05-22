"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('verifying'); // verifying, ready, submitting, success, error
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationError, setValidationError] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Reset token is missing. Please request a new password reset link.');
                return;
            }

            try {
                // Verify the token is valid before showing the form
                const response = await axios.post('/api/verify-reset-token', { token });

                if (response.data.valid) {
                    setStatus('ready');
                } else {
                    setStatus('error');
                    setMessage(response.data.error || 'Invalid or expired reset link. Please request a new one.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Invalid or expired reset link. Please request a new one.');
                console.error('Token verification error:', err);
            }
        };

        verifyToken();
    }, [searchParams]);

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.includes(' ')) return 'Password cannot contain spaces';
        if (password.length < 8) return 'Password must be at least 8 characters long';
        return '';
    };

    const validateForm = () => {
        const passwordError = validatePassword(password);
        if (passwordError) return passwordError;

        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }

        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validateForm();
        if (error) {
            setValidationError(error);
            return;
        }

        setValidationError('');
        setStatus('submitting');

        try {
            const token = searchParams.get('token');
            const response = await axios.post('/api/reset-password', {
                token,
                newPassword: password
            });

            if (response.data.success) {
                setStatus('success');
                setMessage('Your password has been successfully reset.');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login?passwordReset=true');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(response.data.error || 'Failed to reset password. Please try again.');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'An error occurred. Please try again.');
            console.error('Password reset error:', err);
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
                    <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
                    {status === 'ready' && (
                        <p className="mt-2 text-gray-600">Create a new password for your account</p>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 space-y-6">
                        {status === 'verifying' && (
                            <div className="flex flex-col items-center py-4">
                                <div className="rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent animate-spin mb-4"></div>
                                <p className="text-gray-600 text-lg text-center">Verifying your reset link...</p>
                            </div>
                        )}

                        {status === 'ready' && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {validationError && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{validationError}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                            ${status === 'submitting'
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
                                                Updating Password...
                                            </>
                                        ) : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {status === 'success' && (
                            <div className="text-center py-4">
                                <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">Password Reset Successful!</h2>
                                <p className="text-gray-600">{message}</p>
                                <p className="text-gray-500 mt-4 text-sm">Redirecting to login page...</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="text-center py-4">
                                <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">Password Reset Failed</h2>
                                <p className="text-gray-600">{message}</p>
                                <div className="mt-6">
                                    <Link href="/forgot-password" className="text-teal-600 hover:text-teal-500 font-medium">
                                        Request New Reset Link
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {(status === 'ready' || status === 'submitting') && (
                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-teal-600 hover:text-teal-500 font-medium">
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}