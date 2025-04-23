"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../../context/AdminAuthContext';

export default function AdminLoginPage() {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    const { admin, loading: authLoading, isAuthenticated, adminLogin } = useAdminAuth();
    const router = useRouter();

    // Add this useEffect to clear any stale session data
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
        
        const result = await adminLogin(adminId, password, adminCode);
        
        if (result.success) {
            // Explicitly redirect to admin dashboard after successful login
            router.push('/admin/dashboard');
        } else {
            setError(result.error || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Admin Login</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-4">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                        <span>{error}</span>
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

                <div className="mb-4">
                    <label htmlFor="adminId" className="block text-gray-700 text-sm font-bold mb-2">
                        Admin ID
                    </label>
                    <input
                        type="text"
                        id="adminId"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="adminCode" className="block text-gray-700 text-sm font-bold mb-2">
                        Admin Code
                    </label>
                    <input
                        type="password"
                        id="adminCode"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="flex items-center justify-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-400"
                    >
                        {isSubmitting ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </div>
            </form>
        </div>
    );
}