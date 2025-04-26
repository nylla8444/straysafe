import React from 'react';

export default function AdminDashboard({ stats, isLoading }) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
            
            {isLoading ? (
                <div className="flex justify-center my-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Organization Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Organizations</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {stats.organizations || 0}
                                    </h3>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-sm">Pending Verifications</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {stats.pendingOrganizations || 0}
                                    </h3>
                                </div>
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Adopter Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Adopters</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {stats.adopters || 0}
                                    </h3>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-sm">Active Adopters</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {stats.adoptersActive || stats.adopters || 0}
                                    </h3>
                                </div>
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold text-xl mb-4">System Overview</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-gray-600 font-medium">Total Users</h4>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                                <p className="text-right text-sm text-gray-500 mt-1">{stats.totalUsers || 0} users</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <h4 className="text-gray-600 font-medium">Adopters</h4>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div className="bg-green-600 h-2.5 rounded-full" style={{ 
                                            width: `${stats.totalUsers ? (stats.adopters / stats.totalUsers) * 100 : 0}%` 
                                        }}></div>
                                    </div>
                                    <p className="text-right text-sm text-gray-500 mt-1">
                                        {stats.adopters || 0} ({stats.totalUsers ? 
                                            Math.round((stats.adopters / stats.totalUsers) * 100) : 0}%)
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <h4 className="text-gray-600 font-medium">Organizations</h4>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
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
                    </div>
                </>
            )}
        </div>
    );
}