'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import RescueCaseModal from '../../../components/rescue/RescueCaseModal';
import DeleteConfirmationModal from '../../../components/shared/DeleteConfirmationModal';
import RescueStatsDashboard from '../../../components/dashboard/RescueStatsDashboard';
import { format } from 'date-fns';

export default function RescueCasesPage() {
    const { user, loading, isAuthenticated, isOrganization } = useAuth();
    const router = useRouter();

    // State for rescue cases
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for filter and search
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedAnimalType, setSelectedAnimalType] = useState('all');

    // State for modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [currentCase, setCurrentCase] = useState(null);

    // Mobile specific state
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Notification state
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // State for active tab
    const [activeTab, setActiveTab] = useState('cases');

    // State for refresh button
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Animal types for filter dropdown
    const animalTypes = [
        { value: 'dog', label: 'Dog' },
        { value: 'cat', label: 'Cat' },
        { value: 'bird', label: 'Bird' },
        { value: 'wildlife', label: 'Wildlife' },
        { value: 'other', label: 'Other' }
    ];

    // Case status options for filter dropdown
    const statusOptions = [
        { value: 'ongoing', label: 'Ongoing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    // Auth check - redirect if not authorized
    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            if (user && !isOrganization()) {
                router.push('/profile');
                return;
            }

            if (user && !user.isVerified) {
                router.push('/organization');
                return;
            }

            // User is authenticated and verified, fetch rescue cases
            fetchRescueCases();
        }
    }, [loading, isAuthenticated, user, router, isOrganization]);

    // Fetch rescue cases from API
    const fetchRescueCases = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/organization/rescue-cases');

            if (response.data.success) {
                setCases(response.data.rescueCases || []);
            } else {
                setError('Failed to load rescue cases');
            }
        } catch (error) {
            console.error('Error fetching rescue cases:', error);
            setError('Error loading rescue cases. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh rescue cases data
    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            await fetchRescueCases();
            setNotification({
                show: true,
                type: 'success',
                message: 'Rescue cases refreshed!'
            });

            setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 3000);
        } catch (error) {
            console.error('Error refreshing rescue cases:', error);
            setNotification({
                show: true,
                type: 'error',
                message: 'Failed to refresh rescue cases'
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    // Filter cases based on search term, status, and animal type
    const filteredCases = cases.filter(rescueCase => {
        const matchesSearch = searchTerm === '' ||
            rescueCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rescueCase.description && rescueCase.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rescueCase.location && rescueCase.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rescueCase.caseId && rescueCase.caseId.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = selectedStatus === 'all' || rescueCase.status === selectedStatus;

        const matchesAnimalType = selectedAnimalType === 'all' || rescueCase.animalType === selectedAnimalType;

        return matchesSearch && matchesStatus && matchesAnimalType;
    });

    // Handle add new rescue case
    const handleAddCase = async (newCase) => {
        try {
            const response = await axios.post('/api/organization/rescue-cases', newCase);

            if (response.data.success) {
                // Fetch all cases again to ensure consistency
                fetchRescueCases();

                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Rescue case created successfully!'
                });
                setIsAddModalOpen(false);

                // Hide notification after 3 seconds
                setTimeout(() => {
                    setNotification({ show: false, type: '', message: '' });
                }, 3000);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: response.data.message || 'Failed to create rescue case'
                });
            }
        } catch (error) {
            console.error('Error creating rescue case:', error);
            setNotification({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Error creating rescue case'
            });
        }
    };

    // Handle update rescue case
    const handleUpdateCase = async (updatedCase) => {
        try {
            const response = await axios.put('/api/organization/rescue-cases', updatedCase);

            if (response.data.success) {
                // Update cases state with updated case
                setCases(cases.map(c => c._id === updatedCase.id ? response.data.rescueCase : c));

                // Fetch all cases again to ensure consistency
                fetchRescueCases();

                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Rescue case updated successfully!'
                });
                setIsEditModalOpen(false);
                setCurrentCase(null);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: response.data.message || 'Failed to update rescue case'
                });
            }
        } catch (error) {
            console.error('Error updating rescue case:', error);
            setNotification({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Error updating rescue case'
            });
        }
    };

    // Handle delete rescue case
    const handleDeleteCase = async (caseId) => {
        try {
            const response = await axios.delete(`/api/organization/rescue-cases?id=${caseId}`);

            if (response.data.success) {
                setCases(cases.filter(c => c._id !== caseId));
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Rescue case deleted successfully!'
                });
                setIsDeleteModalOpen(false);
                setCurrentCase(null);

                setTimeout(() => {
                    setNotification({ show: false, type: '', message: '' });
                }, 3000);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: response.data.message || 'Failed to delete rescue case'
                });
            }
        } catch (error) {
            console.error('Error deleting rescue case:', error);
            setNotification({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Error deleting rescue case'
            });
        }
    };

    // Reset filters function
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedAnimalType('all');
        setShowMobileFilters(false);
    };

    // View case details
    const handleViewCase = (rescueCase) => {
        setCurrentCase(rescueCase);
        setIsViewModalOpen(true);
    };

    // Loading state
    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading rescue cases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            {/* Header with navigation - Improved for mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                <div className="flex items-center">
                    <Link href="/organization" className="text-blue-600 hover:text-blue-800 flex items-center mr-4 p-1 -ml-1">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm sm:text-base">Back</span>
                    </Link>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Rescue Cases</h1>

                    {/* Add refresh button - Enlarged touch target for mobile */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="ml-3 p-3 sm:p-2 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        aria-label="Refresh rescue cases"
                        title="Refresh rescue cases"
                    >
                        <svg
                            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </button>
                </div>

                {/* Add Case Button - Only visible when on Cases tab */}
                {activeTab === 'cases' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-3 sm:py-2 rounded-md flex items-center justify-center shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Rescue Case
                    </button>
                )}
            </div>

            {/* Tabs - Scrollable horizontal menu with larger touch targets */}
            <div className="flex overflow-x-auto border-b border-gray-200 mb-6 pb-px">
                <button
                    onClick={() => setActiveTab('cases')}
                    className={`px-4 py-3 font-medium text-sm flex-shrink-0 ${activeTab === 'cases'
                        ? 'border-b-2 border-red-500 text-red-600'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Rescue Cases
                </button>
                <button
                    onClick={() => setActiveTab('statistics')}
                    className={`px-4 py-3 font-medium text-sm flex-shrink-0 ${activeTab === 'statistics'
                        ? 'border-b-2 border-red-500 text-red-600'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Statistics
                </button>
            </div>

            {/* Notification message */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-md mb-6 sticky top-0 z-10 shadow-md ${notification.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <p>{notification.message}</p>
                            <button
                                onClick={() => setNotification({ show: false, type: '', message: '' })}
                                className="ml-4 text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Conditional rendering based on activeTab */}
            {activeTab === 'cases' && (
                <div>
                    {/* Mobile filters toggle button */}
                    <div className="md:hidden mb-4">
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-300 shadow-sm"
                        >
                            <span className="font-medium text-gray-700">Filters & Search</span>
                            <svg
                                className={`w-5 h-5 text-gray-500 transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Filters and search - Shown/hidden on mobile, always visible on desktop */}
                    <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block mb-6`}>
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <label htmlFor="search" className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                                    <div className="relative">
                                        <div className="absolute left-0 top-0 bottom-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="search"
                                            placeholder="Search cases..."
                                            className="pl-10 pr-4 py-3 border border-gray-300 rounded-md w-full focus:ring-red-500 focus:border-red-500 text-base"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status filter */}
                                <div>
                                    <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                    <select
                                        id="status"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="border border-gray-300 rounded-md w-full py-3 px-3 focus:ring-red-500 focus:border-red-500 text-base appearance-none bg-white"
                                    >
                                        <option value="all">All Statuses</option>
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Animal Type filter */}
                                <div>
                                    <label htmlFor="animalType" className="block text-xs font-medium text-gray-500 mb-1">Animal Type</label>
                                    <select
                                        id="animalType"
                                        value={selectedAnimalType}
                                        onChange={(e) => setSelectedAnimalType(e.target.value)}
                                        className="border border-gray-300 rounded-md w-full py-3 px-3 focus:ring-red-500 focus:border-red-500 text-base appearance-none bg-white"
                                    >
                                        <option value="all">All Animal Types</option>
                                        {animalTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Reset filters button */}
                            {(searchTerm !== '' || selectedStatus !== 'all' || selectedAnimalType !== 'all') && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6 border border-red-200 shadow-sm">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* No cases message */}
                    {!isLoading && cases.length === 0 && (
                        <div className="bg-gray-50 rounded-lg p-6 sm:p-12 text-center border-2 border-dashed border-gray-300">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No rescue cases yet</h3>
                            <p className="mt-2 text-gray-600">
                                Get started by adding your first rescue case.
                            </p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-4 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-3 rounded-md text-base font-medium"
                            >
                                Add First Rescue Case
                            </button>
                        </div>
                    )}

                    {/* Desktop: Cases table - Hidden on mobile */}
                    {cases.length > 0 && (
                        <>
                            <div className="hidden md:block overflow-x-auto mb-6">
                                <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow overflow-hidden">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Case
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Animal Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredCases.map(rescueCase => (
                                            <tr key={rescueCase._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{rescueCase.title}</div>
                                                            <div className="text-sm text-gray-500">{rescueCase.caseId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {animalTypes.find(type => type.value === rescueCase.animalType)?.label || rescueCase.animalType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{rescueCase.location}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rescueCase.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                                                        rescueCase.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {rescueCase.status === 'ongoing' ? 'Ongoing' :
                                                            rescueCase.status === 'completed' ? 'Completed' : 'Cancelled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(rescueCase.rescueDate), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleViewCase(rescueCase)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setCurrentCase(rescueCase);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setCurrentCase(rescueCase);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile: Card-based cases view */}
                            <div className="md:hidden space-y-4">
                                {filteredCases.map(rescueCase => (
                                    <div key={rescueCase._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 text-lg">{rescueCase.title}</h3>
                                                    <p className="text-sm text-gray-500">{rescueCase.caseId}</p>
                                                </div>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${rescueCase.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                                                    rescueCase.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {rescueCase.status === 'ongoing' ? 'Ongoing' :
                                                        rescueCase.status === 'completed' ? 'Completed' : 'Cancelled'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Animal Type</div>
                                                    <div className="text-sm">{animalTypes.find(type => type.value === rescueCase.animalType)?.label || rescueCase.animalType}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Location</div>
                                                    <div className="text-sm">{rescueCase.location}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 uppercase font-medium mb-1">Date</div>
                                                    <div className="text-sm">{format(new Date(rescueCase.rescueDate), 'MMM dd, yyyy')}</div>
                                                </div>
                                                {rescueCase.outcome && (
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-medium mb-1">Outcome</div>
                                                        <div className="text-sm">{rescueCase.outcome.substring(0, 20)}...</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-3 flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewCase(rescueCase)}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors font-medium text-sm"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCurrentCase(rescueCase);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCurrentCase(rescueCase);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Filtered results message */}
                    {cases.length > 0 && filteredCases.length === 0 && (
                        <div className="bg-gray-50 p-6 sm:p-8 text-center rounded-lg border border-gray-200 mt-4">
                            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="mt-3 text-gray-600 mb-3">No rescue cases match your current filters.</p>
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}

                    {/* Add Rescue Case Modal */}
                    {isAddModalOpen && (
                        <RescueCaseModal
                            isOpen={isAddModalOpen}
                            onClose={() => setIsAddModalOpen(false)}
                            onSave={handleAddCase}
                            title="Add New Rescue Case"
                            animalTypes={animalTypes}
                        />
                    )}

                    {/* Edit Rescue Case Modal */}
                    {isEditModalOpen && currentCase && (
                        <RescueCaseModal
                            isOpen={isEditModalOpen}
                            onClose={() => {
                                setIsEditModalOpen(false);
                                setCurrentCase(null);
                            }}
                            onSave={handleUpdateCase}
                            rescueCase={currentCase}
                            title="Edit Rescue Case"
                            animalTypes={animalTypes}
                        />
                    )}

                    {/* View Rescue Case Modal */}
                    {isViewModalOpen && currentCase && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                                    <h3 className="text-lg font-semibold">Rescue Case Details</h3>
                                    <button
                                        onClick={() => {
                                            setIsViewModalOpen(false);
                                            setCurrentCase(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <h2 className="text-xl font-bold">{currentCase.title}</h2>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${currentCase.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                                                currentCase.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {currentCase.status === 'ongoing' ? 'Ongoing' :
                                                    currentCase.status === 'completed' ? 'Completed' : 'Cancelled'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">Case ID: {currentCase.caseId}</p>
                                        <p className="text-sm text-gray-500">Reported on {format(new Date(currentCase.rescueDate), 'MMMM dd, yyyy')}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Animal Type</h4>
                                            <p>{animalTypes.find(type => type.value === currentCase.animalType)?.label || currentCase.animalType}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Location</h4>
                                            <p>{currentCase.location}</p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Description</h4>
                                        <p className="bg-gray-50 p-3 rounded-md">{currentCase.description || 'No description provided.'}</p>
                                    </div>

                                    {currentCase.medicalDetails && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Medical Details</h4>
                                            <p className="bg-gray-50 p-3 rounded-md">{currentCase.medicalDetails}</p>
                                        </div>
                                    )}

                                    {currentCase.outcome && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Outcome</h4>
                                            <p className="bg-gray-50 p-3 rounded-md">{currentCase.outcome}</p>
                                        </div>
                                    )}

                                    {currentCase.images && currentCase.images.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Images</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {currentCase.images.map((image, index) => (
                                                    <div key={index} className="aspect-w-4 aspect-h-3 rounded-md overflow-hidden">
                                                        <Image
                                                            src={image}
                                                            alt={`Rescue case image ${index + 1}`}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t p-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => {
                                            setIsViewModalOpen(false);
                                            setCurrentCase(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsViewModalOpen(false);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {isDeleteModalOpen && currentCase && (
                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => {
                                setIsDeleteModalOpen(false);
                                setCurrentCase(null);
                            }}
                            onDelete={() => handleDeleteCase(currentCase._id)}
                            title="Delete Rescue Case"
                            message={`Are you sure you want to delete the rescue case "${currentCase.title}"? This action cannot be undone.`}
                        />
                    )}
                </div>
            )}

            {activeTab === 'statistics' && (
                <div className="bg-white shadow rounded-lg py-4 sm:p-6">
                    <h2 className="text-xl font-semibold mb-6">Rescue Statistics</h2>
                    <RescueStatsDashboard cases={cases} />
                    {/* <p className="text-gray-600 mb-8">Coming soon! This feature is currently under development. Here, you&apos;ll be able to see statistics about your rescue operations, including:</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 border border-gray-200 rounded-lg">
                            <div className="text-xl font-semibold text-gray-900">{cases.filter(c => c.status === 'ongoing').length}</div>
                            <div className="text-sm text-gray-500 mt-1">Ongoing Cases</div>
                        </div>

                        <div className="p-5 border border-gray-200 rounded-lg">
                            <div className="text-xl font-semibold text-gray-900">{cases.filter(c => c.status === 'completed').length}</div>
                            <div className="text-sm text-gray-500 mt-1">Completed Rescues</div>
                        </div>

                        <div className="p-5 border border-gray-200 rounded-lg">
                            <div className="text-xl font-semibold text-gray-900">{cases.length}</div>
                            <div className="text-sm text-gray-500 mt-1">Total Cases</div>
                        </div>
                    </div>

                    <div className="mt-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4">Future Statistics Features</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Monthly rescue trends</li>
                            <li>Animal type distribution</li>
                            <li>Average time to resolution</li>
                            <li>Location heat maps</li>
                            <li>Outcome tracking</li>
                        </ul>
                    </div> */}
                </div>
            )}
        </div>
    );
}