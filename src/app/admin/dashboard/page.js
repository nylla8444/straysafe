"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import axios from 'axios';
import OrganizationsManagement from '../../../components/admin/OrganizationsManagement';
import UpdateAdminCredentials from '../../../components/admin/UpdateAdminCredentials';

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

    const refreshStats = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/admin/stats');
            console.log("Stats refreshed:", response.data);
            setStats(response.data);
        } catch (error) {
            console.error('Error refreshing stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while auth initializes
    if (loading || !authInitialized) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-pulse text-xl">Loading admin dashboard...</div>
            </div>
        );
    }

    return (
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
                {activeTab === 'dashboard' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

                        {isLoading ? (
                            <div className="text-center">Loading statistics...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                    <h3 className="text-lg font-semibold text-gray-500 mb-2">Pending Verifications</h3>
                                    <p className="text-4xl font-bold">{stats.pendingOrganizations}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'organizations' && (
                    <OrganizationsManagement onUpdateStats={refreshStats} />
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