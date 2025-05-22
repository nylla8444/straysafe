"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);

    const { admin, loading: authLoading, isAuthenticated, adminLogin } = useAdminAuth();
    const router = useRouter();

    // useEffect to clear any stale session data
    useEffect(() => {
        // Clear any stale admin data in session storage when visiting login page
        sessionStorage.removeItem('adminData');

        // Check for error parameter in URL
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'invalid_token') {
            setError('Your session has expired. Please log in again.');
        }
    }, []);

    // If already authenticated, redirect to admin dashboard
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/admin/dashboard');
        }
    }, [admin, authLoading, isAuthenticated, router]);

    const handleDismissError = () => {
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        setLoggingIn(true);

        try {
            const result = await adminLogin(adminId, password, adminCode);

            if (result.success) {
                // Show logging in state before redirecting
                setTimeout(() => {
                    router.push('/admin/dashboard');
                }, 1000);
            } else {
                setError(result.error || 'Login failed. Please try again.');
                setLoggingIn(false);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLoggingIn(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="-mt-24 min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                {loggingIn ? (
                    <div className="bg-white rounded-xl shadow-xl p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Logging in...</h2>
                        <p className="text-gray-600">Please wait while we verify your credentials</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="inline-block p-4 bg-amber-600 rounded-full mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
                            <p className="text-gray-600 mt-2">Access the StraySpot admin dashboard</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-xl p-8">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md flex justify-between items-center">
                                    <span className="text-red-700">{error}</span>
                                    <button
                                        type="button"
                                        onClick={handleDismissError}
                                        className="text-red-700 hover:text-red-900 font-bold"
                                        aria-label="Dismiss error"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="adminId" className="block text-gray-700 text-sm font-medium mb-2">
                                        Admin ID
                                    </label>
                                    <input
                                        type="text"
                                        id="adminId"
                                        value={adminId}
                                        onChange={(e) => setAdminId(e.target.value)}
                                        className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                        required
                                        placeholder="Enter your admin ID"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                        required
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="adminCode" className="block text-gray-700 text-sm font-medium mb-2">
                                        Admin Code
                                    </label>
                                    <input
                                        type="password"
                                        id="adminCode"
                                        value={adminCode}
                                        onChange={(e) => setAdminCode(e.target.value)}
                                        className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                        required
                                        placeholder="Enter your admin code"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing
                                            </>
                                        ) : 'Login as Admin'}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <Link href="/" className="text-amber-600 hover:text-amber-800 text-sm">
                                    Return to main site
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}