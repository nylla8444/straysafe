"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import axios from 'axios';
import OrganizationsManagement from '../../../components/admin/OrganizationsManagement';
import UpdateAdminCredentials from '../../../components/admin/UpdateAdminCredentials';
import AdoptersManagement from '../../../components/admin/AdoptersManagement';

export default function AdminDashboardPage() {
    const { admin, loading, authInitialized, isAuthenticated, adminLogout } = useAdminAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        adopters: 0,
        organizations: 0,
        pendingOrganizations: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const router = useRouter();
    const [redirectTriggered, setRedirectTriggered] = useState(false);
    // Add the missing error state
    const [error, setError] = useState('');

    // Critical fix: Only redirect after auth is initialized AND loading is complete
    useEffect(() => {
        if (authInitialized && !loading && !redirectTriggered) {
            console.log("Auth check complete, state:", { isAuthenticated, admin });

            // Check session storage as a backup
            const storedAdmin = sessionStorage.getItem('adminData');

            if (!isAuthenticated && !storedAdmin) {
                console.log("No authentication found, redirecting to login");
                setRedirectTriggered(true); // Prevent multiple redirects
                router.push('/login/admin');
            } else {
                console.log("Authentication valid, staying on dashboard");
            }
        }
    }, [authInitialized, loading, isAuthenticated, admin, router, redirectTriggered]);

    // Fetch stats only when authenticated
    useEffect(() => {
        const fetchStats = async () => {
            if (isAuthenticated) {
                try {
                    setIsLoading(true);
                    const response = await axios.get('/api/admin/stats');
                    console.log("Stats received:", response.data);
                    setStats(response.data);
                } catch (error) {
                    console.error('Error fetching stats:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (isAuthenticated) {
            fetchStats();
        }
    }, [isAuthenticated]);

    // Define the missing handleAuthError function
    const handleAuthError = (err) => {
        if (err.response && err.response.status === 401) {
            console.log("Authentication error in dashboard");
            adminLogout(); // Log out the admin
            router.push('/login/admin');
        }
    };

    const refreshStats = async (forceFresh = false) => {
        try {
            setIsLoading(true);
            setError(''); // Clear any previous errors

            // Add cache busting when we want to force a fresh fetch
            const url = forceFresh
                ? `/api/admin/stats?timestamp=${Date.now()}`
                : '/api/admin/stats';

            const response = await axios.get(url, {
                withCredentials: true
            });

            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch admin stats:', err);
            handleAuthError(err);
            setError('Failed to load dashboard statistics.');
        } finally {
            setIsLoading(false);
        }
    };

    // Add a manual refresh button to the dashboard
    const ManualRefreshButton = () => (
        <button
            onClick={() => refreshStats(true)}
            className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            title="Refresh statistics"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </button>
    );

    // Show loading state while auth initializes
    if (loading || !authInitialized) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-pulse text-xl">Loading admin dashboard...</div>
            </div>
        );
    }

    return (
        // Add this to display the error message if it exists
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-blue-800 text-white p-6">
                <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

                <nav>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full text-left p-3 rounded ${activeTab === 'dashboard' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
                            >
                                Dashboard
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('organizations')}
                                className={`w-full text-left p-3 rounded ${activeTab === 'organizations' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
                            >
                                Organizations
                            </button>
                        </li>
                        {/* Add Adopters tab */}
                        <li>
                            <button
                                onClick={() => setActiveTab('adopters')}
                                className={`w-full text-left p-3 rounded ${activeTab === 'adopters' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
                            >
                                Adopters
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full text-left p-3 rounded ${activeTab === 'settings' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
                            >
                                Settings
                            </button>
                        </li>
                    </ul>
                </nav>

                <div className="absolute bottom-6 left-6">
                    <button
                        onClick={adminLogout}
                        className="text-white hover:text-red-200"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div>
                        {/* Existing dashboard content */}
                        <div className="flex items-center mb-8">
                            <h2 className="text-3xl font-bold">Dashboard</h2>
                            <ManualRefreshButton />
                        </div>

                        {isLoading ? (
                            <div className="text-center">Loading statistics...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Existing stat cards */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-500 mb-2">Total Users</h3>
                                    <p className="text-4xl font-bold">{stats.totalUsers}</p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-500 mb-2">Adopters</h3>
                                    <p className="text-4xl font-bold">{stats.adopters}</p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-500 mb-2">Organizations</h3>
                                    <p className="text-4xl font-bold">{stats.organizations}</p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-500 mb-2">Pending Organizations Application</h3>
                                    <p className="text-4xl font-bold">{stats.pendingOrganizations}</p>
                                </div>

                                {/* Add new stat cards for adopter details */}
                                {stats.adoptersActive !== undefined && (
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h3 className="text-lg font-semibold text-gray-500 mb-2">Active Adopters</h3>
                                        <p className="text-4xl font-bold">{stats.adoptersActive}</p>
                                    </div>
                                )}

                                {stats.adoptersSuspended !== undefined && (
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h3 className="text-lg font-semibold text-gray-500 mb-2">Suspended Adopters</h3>
                                        <p className="text-4xl font-bold">{stats.adoptersSuspended}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'organizations' && (
                    <OrganizationsManagement onUpdateStats={refreshStats} />
                )}

                {/* Add Adopters Management component */}
                {activeTab === 'adopters' && (
                    <AdoptersManagement
                        onUpdateStats={() => refreshStats(true)} // Force fresh data
                    />
                )}

                {activeTab === 'settings' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Admin Settings</h2>
                        <UpdateAdminCredentials />
                    </div>
                )}
            </div>
        </div>
    );
}