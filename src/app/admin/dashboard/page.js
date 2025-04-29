"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import OrganizationsManagement from '../../../components/admin/OrganizationsManagement';
import UpdateAdminCredentials from '../../../components/admin/UpdateAdminCredentials';
import AdoptersManagement from '../../../components/admin/AdoptersManagement';

export default function AdminDashboardPage() {
    const { admin, loading, authInitialized, isAuthenticated, adminLogout } = useAdminAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        adopters: 0,
        organizations: 0,
        pendingOrganizations: 0,
        rejectedOrganizations: 0,
        adoptersActive: 0,
        adoptersSuspended: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const router = useRouter();
    const [redirectTriggered, setRedirectTriggered] = useState(false);
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
                    await refreshStats();
                } catch (error) {
                    console.error('Error fetching stats:', error);
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
            className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 hover:rotate-180"
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

    const fadeVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar - Enhanced with active state indicators */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-64 bg-gradient-to-br from-blue-800 to-blue-900 text-white p-6 shadow-lg"
            >
                <div className="flex items-center space-x-3 mb-10">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                        <p className="text-xs text-blue-200">StraySpot Management</p>
                    </div>
                </div>

                <nav>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200
                                    ${activeTab === 'dashboard'
                                        ? 'bg-blue-700 text-white shadow-md'
                                        : 'text-blue-100 hover:bg-blue-700/50'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Dashboard</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('organizations')}
                                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200
                                    ${activeTab === 'organizations'
                                        ? 'bg-blue-700 text-white shadow-md'
                                        : 'text-blue-100 hover:bg-blue-700/50'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>Organizations</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('adopters')}
                                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200
                                    ${activeTab === 'adopters'
                                        ? 'bg-blue-700 text-white shadow-md'
                                        : 'text-blue-100 hover:bg-blue-700/50'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>Adopters</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200
                                    ${activeTab === 'settings'
                                        ? 'bg-blue-700 text-white shadow-md'
                                        : 'text-blue-100 hover:bg-blue-700/50'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Settings</span>
                            </button>
                        </li>
                    </ul>
                </nav>


            </motion.div>

            {/* Main content area */}
            <motion.div
                className="flex-1 p-8 overflow-y-auto"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
            >
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
                        {error}
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div>
                        <div className="flex items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
                            <ManualRefreshButton />
                        </div>

                        {isLoading ? (
                            <div className="bg-white p-12 rounded-xl shadow-md text-center">
                                <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600">Loading statistics...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                                            <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                                        </div>
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Adopters</p>
                                            <p className="text-3xl font-bold mt-1">{stats.adopters}</p>
                                        </div>
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Active Adopters</p>
                                            <p className="text-3xl font-bold mt-1">{stats.adoptersActive || 0}</p>
                                        </div>
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Suspended Adopters</p>
                                            <p className="text-3xl font-bold mt-1">{stats.adoptersSuspended || 0}</p>
                                        </div>
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Organizations Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Organizations</p>
                                            <p className="text-3xl font-bold mt-1">{stats.organizations || 0}</p>
                                        </div>
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Verified Organizations Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.425 }}
                                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Verified Organizations</p>
                                            <p className="text-3xl font-bold mt-1">{stats.verifiedOrganizations || 0}</p>
                                        </div>
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Pending Organizations Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 }}
                                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-amber-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Pending Organizations</p>
                                            <p className="text-3xl font-bold mt-1">{stats.pendingOrganizations || 0}</p>
                                        </div>
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Rejected Organizations Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-rose-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Rejected Organizations</p>
                                            <p className="text-3xl font-bold mt-1">{stats.rejectedOrganizations || 0}</p>
                                        </div>
                                        <div className="p-2 bg-rose-100 rounded-lg">
                                            <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 bg-white rounded-xl shadow-md p-6"
                        >
                            <h3 className="font-bold text-xl mb-4 text-gray-800">System Overview</h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-gray-600 font-medium mb-2">Total Users</h4>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                    <p className="text-right text-sm text-gray-500 mt-1">{stats.totalUsers || 0} users</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-gray-600 font-medium mb-2">Adopters</h4>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-green-600 h-2.5 rounded-full" style={{
                                                width: `${stats.totalUsers ? (stats.adopters / stats.totalUsers) * 100 : 0}%`
                                            }}></div>
                                        </div>
                                        <p className="text-right text-sm text-gray-500 mt-1">
                                            {stats.adopters || 0} ({stats.totalUsers ?
                                                Math.round((stats.adopters / stats.totalUsers) * 100) : 0}%)
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-gray-600 font-medium mb-2">Organizations</h4>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{
                                                width: `${stats.totalUsers ? (stats.organizations / stats.totalUsers) * 100 : 0}%`
                                            }}></div>
                                        </div>
                                        <p className="text-right text-sm text-gray-500 mt-1">
                                            {stats.organizations || 0} ({stats.totalUsers ?
                                                Math.round((stats.organizations / stats.totalUsers) * 100) : 0}%)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeTab === 'organizations' && (
                    <OrganizationsManagement onUpdateStats={refreshStats} />
                )}

                {activeTab === 'adopters' && (
                    <AdoptersManagement
                        onUpdateStats={() => refreshStats(true)}
                    />
                )}

                {activeTab === 'settings' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8 text-gray-800">Admin Settings</h2>
                        <UpdateAdminCredentials />
                    </div>
                )}
            </motion.div>
        </div>
    );
}