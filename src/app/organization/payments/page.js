'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import PaymentStatus from '../../../components/payments/PaymentStatus';

export default function OrganizationPaymentsPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (user?.userType !== 'organization') {
            router.push('/profile');
            return;
        }

        const fetchPayments = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/payments', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setPayments(response.data.payments);
                }
            } catch (err) {
                console.error('Failed to fetch payments:', err);
                setError('Failed to load payments. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [isAuthenticated, user, router]);

    // Calculate payment statistics
    const stats = {
        total: payments.length,
        pending: payments.filter(p => p.status === 'pending').length,
        submitted: payments.filter(p => p.status === 'submitted').length,
        verified: payments.filter(p => p.status === 'verified').length,
        rejected: payments.filter(p => p.status === 'rejected').length
    };

    // Filter and search payments
    const filteredPayments = payments
        .filter(payment => filter === 'all' || payment.status === filter)
        .filter(payment => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                // Convert paymentId to string before using string methods
                String(payment.paymentId).toLowerCase().includes(searchLower) ||
                `${payment.adopterId.firstName} ${payment.adopterId.lastName}`.toLowerCase().includes(searchLower) ||
                payment.petId.name.toLowerCase().includes(searchLower)
            );
        });

    // Handle row click to navigate to payment detail
    const handleRowClick = (paymentId) => {
        router.push(`/organization/payments/${paymentId}`);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            {/* Page header with back button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <Link href="/organization" className="inline-flex items-center text-teal-600 hover:text-teal-800 mb-2">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold">Payment Management</h1>
                </div>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-400">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-2xl font-bold">{stats.verified}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
            </div>

            {/* Search and filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search input */}
                    <div className="flex-grow">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search payments
                        </label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Search by ID, adopter name, or pet name..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status filter */}
                    <div className="min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by status
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Payments display */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
                    <p className="text-gray-500">Loading payments...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            ) : filteredPayments.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No payments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {filter !== 'all'
                            ? `No ${filter} payments found.`
                            : searchTerm
                                ? 'No payments match your search.'
                                : 'No payments have been received yet.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {/* Desktop table view */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Adopter
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pet
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPayments.map(payment => (
                                    <tr
                                        key={payment._id}
                                        onClick={() => handleRowClick(payment._id)}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {payment.paymentId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payment.adopterId.firstName} {payment.adopterId.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {payment.petId.img_arr && payment.petId.img_arr.length > 0 ? (
                                                    <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                                                        <Image
                                                            src={payment.petId.img_arr[0]}
                                                            alt={payment.petId.name}
                                                            width={32}
                                                            height={32}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : null}
                                                <span className="text-sm text-gray-900 truncate max-w-[30ch]">{payment.petId.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ₱{payment.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <PaymentStatus status={payment.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.dateCreated).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile card view */}
                    <div className="md:hidden divide-y divide-gray-200">
                        {filteredPayments.map(payment => (
                            <div
                                key={payment._id}
                                onClick={() => handleRowClick(payment._id)}
                                className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors relative"
                            >
                                {/* Left border color indicator based on status */}
                                <div
                                    className={`absolute left-0 top-0 bottom-0 w-1 ${payment.status === 'pending' ? 'bg-gray-400' :
                                        payment.status === 'submitted' ? 'bg-blue-500' :
                                            payment.status === 'verified' ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                ></div>

                                {/* Header row with payment ID, date and status */}
                                <div className="flex justify-between items-center mb-3 pl-2">
                                    <div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 text-gray-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="font-medium text-gray-900">#{payment.paymentId}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(payment.dateCreated).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <PaymentStatus status={payment.status} />
                                </div>

                                {/* Main content with pet details and amount */}
                                <div className="flex items-center pl-2">
                                    {/* Pet image with fallback */}
                                    <div className="relative h-14 w-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                        {payment.petId.img_arr && payment.petId.img_arr.length > 0 ? (
                                            <Image
                                                src={payment.petId.img_arr[0]}
                                                alt={payment.petId.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment details */}
                                    <div className="ml-3 flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-gray-900 text-sm max-w-[20ch] truncate">{payment.petId.name}</p>
                                            <p className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm">
                                                ₱{payment.amount.toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center mt-1">
                                            <svg className="w-3.5 h-3.5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <p className="text-xs text-gray-600">
                                                {payment.adopterId.firstName} {payment.adopterId.lastName}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action hint */}
                                <div className="flex justify-end items-center mt-3 text-xs text-teal-600 pl-2">
                                    <span>View details</span>
                                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer with pagination/count */}
            {filteredPayments.length > 0 && (
                <div className="mt-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600">
                    <p>Showing {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}</p>
                    {(filter !== 'all' || searchTerm) && (
                        <button
                            onClick={() => {
                                setFilter('all');
                                setSearchTerm('');
                            }}
                            className="text-teal-600 hover:text-teal-800 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}