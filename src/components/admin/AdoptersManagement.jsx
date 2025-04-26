import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { format } from 'date-fns';

export default function AdoptersManagement({ onUpdateStats }) {
    const [adopters, setAdopters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAdopter, setSelectedAdopter] = useState(null);
    const [filter, setFilter] = useState('all'); // all, active, suspended 
    const [notes, setNotes] = useState('');
    const [activityHistory, setActivityHistory] = useState([]);
    const [historyAdopterId, setHistoryAdopterId] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [statusChangeMessage, setStatusChangeMessage] = useState(null);

    // Ref to track if we're currently processing a status change
    const isChangingStatus = useRef(false);

    // Only fetch when filter changes, not when selectedAdopter changes
    useEffect(() => {
        if (!isChangingStatus.current) {
            fetchAdopters();
        }

        // Clear selected adopter if it doesn't match the current filter
        if (selectedAdopter) {
            if (filter === 'active' && selectedAdopter.status === 'suspended') {
                setSelectedAdopter(null);
            } else if (filter === 'suspended' && selectedAdopter.status !== 'suspended') {
                setSelectedAdopter(null);
            }
        }
    }, [filter]);

    const handleAuthError = (err) => {
        if (err.response?.status === 401) {
            // Handle auth error (e.g., redirect to login)
            console.log("Authentication error");
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }
    };

    const fetchAdopters = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/adopters?status=${filter}`, {
                withCredentials: true
            });
            setAdopters(response.data.adopters);
            setError('');
        } catch (err) {
            console.error('Failed to fetch adopters:', err);
            handleAuthError(err);
            setError('Failed to load adopters. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Add a helper function to update the selected adopter status
    const updateSelectedAdopterStatus = (adopterId, newStatus) => {
        // Update the selectedAdopter in state to reflect the new status immediately
        if (selectedAdopter && selectedAdopter._id === adopterId) {
            setSelectedAdopter(prev => ({
                ...prev,
                status: newStatus
            }));
        }

        // Also update in the main adopters list
        setAdopters(prevAdopters =>
            prevAdopters.map(adopter =>
                adopter._id === adopterId
                    ? { ...adopter, status: newStatus }
                    : adopter
            )
        );
    };


    const handleSuspend = async (adopterId) => {
        if (!notes.trim()) {
            setError('Please provide a reason for suspension.');
            return;
        }

        try {
            setError('');
            isChangingStatus.current = true; // Begin status change

            // First make the API call to update status
            await axios.put(`/api/admin/adopters/${adopterId}/status`, {
                status: 'suspended',
                notes: notes
            }, {
                withCredentials: true
            });

            // Update local state immediately
            updateSelectedAdopterStatus(adopterId, 'suspended');

            // Give the database a moment to update before refreshing stats
            setTimeout(async () => {
                if (onUpdateStats) {
                    await onUpdateStats();
                }
            }, 500); // 500ms delay

            // Show success message
            setStatusChangeMessage({
                type: 'success',
                text: 'Account suspended successfully. You can now view this adopter in the Suspended tab.'
            });

            // Clear notes
            setNotes('');

            // Remove from list if not in appropriate tab
            if (filter === 'active') {
                setAdopters(prevAdopters =>
                    prevAdopters.filter(adopter => adopter._id !== adopterId)
                );
            }
        } catch (err) {
            console.error('Failed to suspend adopter:', err);
            handleAuthError(err);
            setError(`Failed to suspend adopter: ${err.response?.data?.error || err.message}`);
        } finally {
            isChangingStatus.current = false; // End status change
        }
    };

    const handleReactivate = async (adopterId) => {
        try {
            setError('');
            isChangingStatus.current = true; // Begin status change

            await axios.put(`/api/admin/adopters/${adopterId}/status`, {
                status: 'active',
                notes: notes || 'Account reactivated by admin.'
            }, {
                withCredentials: true
            });

            // Update local state immediately
            updateSelectedAdopterStatus(adopterId, 'active');

            // Delayed stats update
            setTimeout(async () => {
                if (onUpdateStats) {
                    await onUpdateStats();
                }
            }, 500); // 500ms delay

            // Show success message
            setStatusChangeMessage({
                type: 'success',
                text: 'Account reactivated successfully. You can now view this adopter in the Active tab.'
            });

            // Clear notes
            setNotes('');

            // Remove from list if not in appropriate tab
            if (filter === 'suspended') {
                setAdopters(prevAdopters =>
                    prevAdopters.filter(adopter => adopter._id !== adopterId)
                );
            }
        } catch (err) {
            console.error('Failed to reactivate adopter:', err);
            handleAuthError(err);
            setError(`Failed to reactivate adopter: ${err.response?.data?.error || err.message}`);
        } finally {
            isChangingStatus.current = false; // End status change
        }
    };

    // Add this for switching tabs manually
    const handleTabChange = (newFilter) => {
        // Clear any status change messages when switching tabs
        setStatusChangeMessage(null);
        setFilter(newFilter);
    };

    const handleViewHistory = async (adopterId) => {
        try {
            setLoadingHistory(true);
            setHistoryAdopterId(adopterId);

            const response = await axios.get(`/api/admin/adopters/${adopterId}/history`, {
                withCredentials: true
            });

            setActivityHistory(response.data.history || []);
        } catch (err) {
            console.error('Failed to fetch history:', err);
            handleAuthError(err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleCloseHistory = () => {
        setHistoryAdopterId(null);
        setActivityHistory([]);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Adopters Management</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleTabChange('active')}
                        className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => handleTabChange('suspended')}
                        className={`px-4 py-2 rounded ${filter === 'suspended' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                    >
                        Suspended
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {statusChangeMessage && (
                <div className={`${statusChangeMessage.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-blue-100 border-blue-400 text-blue-700'} px-4 py-3 rounded mb-4 flex justify-between items-center`}>
                    <div>{statusChangeMessage.text}</div>
                    <button onClick={() => setStatusChangeMessage(null)} className="text-sm font-semibold">
                        Dismiss
                    </button>
                </div>
            )}

            <div className="bg-white shadow-md rounded overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {/* Left Column - Adopters List */}
                    <div className="col-span-1 border-r">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-medium">Adopters</h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : adopters.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                {filter === 'all' ? 'No adopters found.' : `No ${filter} adopters found.`}
                            </div>
                        ) : (
                            <ul className="max-h-96 overflow-y-auto">
                                {adopters.map(adopter => (
                                    <li
                                        key={adopter._id}
                                        className={`py-4 px-4 cursor-pointer hover:bg-gray-50 ${selectedAdopter?._id === adopter._id ? 'bg-blue-50' : ''}`}
                                        onClick={() => setSelectedAdopter(adopter)}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden relative">
                                                {adopter.profileImage ? (
                                                    <Image
                                                        src={adopter.profileImage}
                                                        alt={`${adopter.firstName} ${adopter.lastName}`}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        {adopter.firstName?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <p className="font-medium">
                                                    {adopter.firstName} {adopter.lastName}
                                                    {adopter.status === 'suspended' && (
                                                        <span className="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                                                            Suspended
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">{adopter.email}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Right Column - Selected Adopter Details */}
                    <div className="col-span-1 lg:col-span-2 p-6">
                        {!selectedAdopter ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <p>Select an adopter to view details</p>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-xl font-bold mb-6">{selectedAdopter.firstName} {selectedAdopter.lastName}</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h4 className="text-gray-500 text-sm mb-1">Contact Information</h4>
                                        <div className="bg-gray-50 rounded-md p-4">
                                            <p><span className="font-medium">Email:</span> {selectedAdopter.email}</p>
                                            <p><span className="font-medium">Phone:</span> {selectedAdopter.contactNumber || 'Not provided'}</p>
                                            <p><span className="font-medium">Location:</span> {selectedAdopter.location || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-500 text-sm mb-1">Account Information</h4>
                                        <div className="bg-gray-50 rounded-md p-4">
                                            <p><span className="font-medium">Joined:</span> {format(new Date(selectedAdopter.createdAt), 'PPP')}</p>
                                            <p><span className="font-medium">Status:</span>
                                                <span className={`ml-1 ${selectedAdopter.status === 'suspended' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {selectedAdopter.status === 'suspended' ? 'Suspended' : 'Active'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-gray-500 text-sm mb-1">Actions</h4>
                                    <div className="bg-gray-50 rounded-md p-4">
                                        <textarea
                                            className="w-full p-2 border rounded mb-4 h-24"
                                            placeholder="Add notes about this adopter..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        ></textarea>

                                        <div className="flex gap-2">
                                            {selectedAdopter.status !== 'suspended' && (
                                                <button
                                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                                    onClick={() => handleSuspend(selectedAdopter._id)}
                                                >
                                                    Suspend Account
                                                </button>
                                            )}

                                            {selectedAdopter.status === 'suspended' && (
                                                <button
                                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                                    onClick={() => handleReactivate(selectedAdopter._id)}
                                                >
                                                    Reactivate Account
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleViewHistory(selectedAdopter._id)}
                                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm ml-2"
                                            >
                                                View Activity
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History Modal */}
            {historyAdopterId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Activity History</h3>
                            <button
                                onClick={handleCloseHistory}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4">
                            {loadingHistory ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : activityHistory.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No activity history found.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {activityHistory.map((item, index) => (
                                        <li key={index} className="border-b pb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{item.action}</p>
                                                    {item.notes && <p className="text-gray-700 mt-1">{item.notes}</p>}
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {format(new Date(item.timestamp), 'PPP p')}
                                                </span>
                                            </div>
                                            {item.adminName && (
                                                <p className="text-xs text-gray-500 mt-1">by {item.adminName}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}