'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import VerificationHistoryList from '../verification/VerificationHistoryList';

export default function OrganizationsManagement({ onUpdateStats }) {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [filter, setFilter] = useState('pending'); // 'pending', 'verified', 'followup', 'rejected'
    const [notes, setNotes] = useState('');
    const [actionPerformed, setActionPerformed] = useState(false);
    const [historyOrgId, setHistoryOrgId] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [organizationToDelete, setOrganizationToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    const router = useRouter();

    useEffect(() => {
        fetchOrganizations();
    }, [filter, actionPerformed]);

    const handleAuthError = (error) => {
        if (error.response && error.response.status === 401) {
            // Redirect to admin login
            setError('Your session has expired. Please login again.');
            setTimeout(() => {
                router.push('/login/admin');
            }, 2000);
        }
    };

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/organizations?status=${filter}`, {
                withCredentials: true
            });
            setOrganizations(response.data.organizations);
            setError('');
        } catch (err) {
            console.error('Failed to fetch organizations:', err);
            handleAuthError(err);
            setError('Failed to load organizations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (orgId) => {
        try {
            setError('');
            await axios.put(`/api/admin/organizations/${orgId}/verify`, {
                status: 'verified',
                notes: notes || 'Organization verified by admin.'
            }, {
                withCredentials: true
            });

            // Call onUpdateStats after successful verification
            if (onUpdateStats) {
                await onUpdateStats();
            }

            fetchOrganizations();
            setSelectedOrg(null);
            setNotes('');
        } catch (err) {
            console.error('Failed to verify organization:', err);
            handleAuthError(err);
            setError(`Failed to verify organization: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleFollowUp = async (orgId) => {
        if (!notes.trim()) {
            setError('Please provide follow-up instructions for the organization.');
            return;
        }

        try {
            setError('');
            await axios.put(`/api/admin/organizations/${orgId}/verify`, {
                status: 'followup',
                notes: notes
            }, {
                withCredentials: true
            });

            // Call onUpdateStats after successful follow-up request
            if (onUpdateStats) {
                await onUpdateStats();
            }

            fetchOrganizations();
            setSelectedOrg(null);
            setNotes('');
        } catch (err) {
            console.error('Failed to request follow-up:', err);
            handleAuthError(err);
            setError(`Failed to request follow-up: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleReject = async (orgId) => {
        if (!notes.trim()) {
            setError('Please provide a reason for rejection.');
            return;
        }

        try {
            setError('');
            await axios.put(`/api/admin/organizations/${orgId}/verify`, {
                status: 'rejected',
                notes: notes
            }, {
                withCredentials: true
            });

            // Call onUpdateStats after successful rejection
            if (onUpdateStats) {
                await onUpdateStats();
            }

            fetchOrganizations();
            setSelectedOrg(null);
            setNotes('');
        } catch (err) {
            console.error('Failed to reject organization:', err);
            handleAuthError(err);
            setError(`Failed to reject organization: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleViewHistory = async (orgId) => {
        try {
            setLoadingHistory(true);
            setHistoryOrgId(orgId);

            const response = await axios.get(`/api/admin/organizations/${orgId}/history`, {
                withCredentials: true
            });

            setHistory(response.data.history || []);
        } catch (err) {
            console.error('Failed to fetch history:', err);
            handleAuthError(err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleCloseHistory = () => {
        setHistoryOrgId(null);
        setHistory([]);
    };

    const handleDelete = async (organizationId) => {
        try {
            setError('');
            setIsDeleting(true);

            // Make the API call to delete the organization
            await axios.delete(`/api/admin/organizations/${organizationId}/delete`, {
                data: { reason: deleteReason },
                withCredentials: true
            });

            // Update local state
            setOrganizations(prevOrganizations =>
                prevOrganizations.filter(org => org._id !== organizationId)
            );

            // Update stats
            if (onUpdateStats) {
                await onUpdateStats();
            }

            // Show success message
            setStatusMessage({
                type: 'success',
                text: 'Organization deleted successfully.'
            });

            // Close the confirmation modal
            setShowDeleteConfirmation(false);
            setOrganizationToDelete(null);
            setDeleteReason('');

            // If the deleted organization was selected, clear the selection
            if (selectedOrg && selectedOrg._id === organizationId) {
                setSelectedOrg(null);
            }
        } catch (err) {
            console.error('Failed to delete organization:', err);
            handleAuthError(err);
            setError(`Failed to delete organization: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConfirmDelete = (organization) => {
        setOrganizationToDelete(organization);
        setShowDeleteConfirmation(true);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
        setOrganizationToDelete(null);
        setDeleteReason('');
    };

    return (
        <div>
            {/* Responsive header section - stack vertically on mobile */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold">Organizations Management</h2>
                    <button
                        onClick={() => fetchOrganizations()}
                        className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                        title="Refresh organizations list"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                {/* Filter buttons - grid on mobile, flex on desktop */}
                <div className="grid grid-cols-2 gap-1 sm:flex sm:space-x-2 w-full sm:w-auto">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${filter === 'pending' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('followup')}
                        className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${filter === 'followup' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                    >
                        Follow Up
                    </button>
                    <button
                        onClick={() => setFilter('verified')}
                        className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${filter === 'verified' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                    >
                        Verified
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                    {error}
                </div>
            )}

            {statusMessage && (
                <div className={`${statusMessage.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-teal-100 border-teal-400 text-teal-700'} px-4 py-3 rounded mb-4 flex justify-between items-center text-sm sm:text-base`}>
                    <div>{statusMessage.text}</div>
                    <button onClick={() => setStatusMessage(null)} className="text-xs sm:text-sm font-semibold">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Mobile: Show back button when org is selected */}
            <div className="block sm:hidden mb-3">
                {selectedOrg && (
                    <button
                        onClick={() => setSelectedOrg(null)}
                        className="flex items-center text-teal-600 mb-2"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to list
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700 mx-auto"></div>
                    <p className="mt-2 text-sm sm:text-base">Loading organizations...</p>
                </div>
            ) : organizations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center text-sm sm:text-base">
                    <p>No organizations found with {filter} status.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* List of organizations - Hide on mobile when an org is selected */}
                    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 h-[500px] sm:h-[600px] overflow-y-auto 
                    ${selectedOrg ? 'hidden sm:block' : ''}`}>
                        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                            Organization List ({organizations.length})
                        </h3>
                        <ul className="divide-y">
                            {organizations.map(org => (
                                <li
                                    key={org._id}
                                    className={`py-3 sm:py-4 cursor-pointer hover:bg-gray-50 ${selectedOrg?._id === org._id ? 'bg-teal-50' : ''}`}
                                    onClick={() => setSelectedOrg(org)}
                                >
                                    <div className="flex items-center">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden relative">
                                            {org.profileImage ? (
                                                <Image
                                                    src={org.profileImage}
                                                    alt={org.organizationName}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                    {org.organizationName?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium text-sm sm:text-base">{org.organizationName}</p>
                                            <p className="text-xs sm:text-sm text-gray-500">{org.email}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Organization details and verification actions */}
                    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 
                    ${!selectedOrg && 'hidden sm:block'}`}>
                        {selectedOrg ? (
                            <div>
                                <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">{selectedOrg.organizationName}</h3>
                                <div className="mb-4 sm:mb-6 grid gap-2 text-sm sm:text-base">
                                    <p><span className="font-medium">Email:</span> {selectedOrg.email}</p>
                                    <p><span className="font-medium">Phone:</span> {selectedOrg.contactNumber || 'Not provided'}</p>
                                    <p><span className="font-medium">Location:</span> {selectedOrg.location || 'Not provided'}</p>
                                    <p>
                                        <span className="font-medium">Status:</span>{' '}
                                        {selectedOrg.verificationStatus === 'verified' && <span className="text-green-500">Verified</span>}
                                        {selectedOrg.verificationStatus === 'pending' && <span className="text-teal-500">Pending</span>}
                                        {selectedOrg.verificationStatus === 'followup' && <span className="text-yellow-500">Follow Up Required</span>}
                                        {selectedOrg.verificationStatus === 'rejected' && <span className="text-red-500">Rejected</span>}
                                    </p>
                                    {selectedOrg.verificationNotes && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm sm:text-base">
                                            <p className="font-medium">Notes:</p>
                                            <p>{selectedOrg.verificationNotes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4 sm:mb-6">
                                    <h4 className="font-medium mb-2 text-sm sm:text-base">Verification Document:</h4>
                                    {selectedOrg.verificationDocument ? (
                                        <div>
                                            <a
                                                href={selectedOrg.verificationDocument}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-teal-600 hover:underline text-sm sm:text-base"
                                            >
                                                View Document
                                            </a>
                                            <div className="mt-3 p-2 border rounded">
                                                {selectedOrg.verificationDocument.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex items-center text-gray-600">
                                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                                        </svg>
                                                        PDF Document
                                                    </div>
                                                ) : (
                                                    <div className="relative h-32 sm:h-40 w-full">
                                                        <Image
                                                            src={selectedOrg.verificationDocument}
                                                            alt="Verification document"
                                                            fill
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-red-500 text-sm sm:text-base">No verification document provided</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-medium text-sm sm:text-base">Notes</label>
                                    <textarea
                                        className="w-full p-2 border rounded text-sm sm:text-base"
                                        rows="3"
                                        placeholder={
                                            filter === 'pending' ? 'Add verification notes...' :
                                                filter === 'followup' ? 'Specify what additional documents are needed...' :
                                                    'Add any additional notes'
                                        }
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                </div>

                                {/* Responsive action buttons */}
                                <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
                                    {selectedOrg.verificationStatus !== 'verified' && (
                                        <button
                                            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 text-sm sm:text-base"
                                            onClick={() => handleVerify(selectedOrg._id)}
                                        >
                                            Verify
                                        </button>
                                    )}

                                    {selectedOrg.verificationStatus !== 'followup' && (
                                        <button
                                            className="bg-yellow-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-yellow-600 text-sm sm:text-base whitespace-nowrap"
                                            onClick={() => handleFollowUp(selectedOrg._id)}
                                        >
                                            Follow-up
                                        </button>
                                    )}

                                    {selectedOrg.verificationStatus !== 'rejected' && (
                                        <button
                                            className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base"
                                            onClick={() => handleReject(selectedOrg._id)}
                                        >
                                            Reject
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleViewHistory(selectedOrg._id)}
                                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs sm:text-sm"
                                    >
                                        History
                                    </button>

                                    <button
                                        className="bg-gray-300 text-gray-800 px-3 sm:px-4 py-2 rounded hover:bg-gray-400 text-sm sm:text-base sm:ml-auto"
                                        onClick={() => {
                                            setSelectedOrg(null);
                                            setNotes('');
                                        }}
                                    >
                                        Close
                                    </button>

                                    <button
                                        onClick={() => handleConfirmDelete(selectedOrg)}
                                        className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 sm:py-12 text-gray-500">
                                <p className="text-sm sm:text-base">Select an organization to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Responsive history modal */}
            {historyOrgId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-3 sm:p-4 border-b sticky top-0 bg-white z-10">
                            <h3 className="text-base sm:text-lg font-semibold">Verification History</h3>
                            <button
                                onClick={handleCloseHistory}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="p-3 sm:p-6">
                            {loadingHistory ? (
                                <div className="text-center py-6 sm:py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-teal-600"></div>
                                    <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading history...</p>
                                </div>
                            ) : (
                                <VerificationHistoryList history={history} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Responsive delete confirmation modal */}
            {showDeleteConfirmation && organizationToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-4 sm:p-6 m-3 sm:m-0">
                        <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-3 sm:mb-4">Delete Organization</h3>
                        <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                            Are you sure you want to delete the organization{' '}
                            <span className="font-semibold">
                                {organizationToDelete.organizationName}
                            </span>
                            ? This action cannot be undone.
                        </p>
                        <p className="mb-4 text-xs sm:text-sm text-gray-600 bg-yellow-50 p-2 border-l-4 border-yellow-400">
                            <strong>Warning:</strong> This will also delete all pets, adoption applications, and other data associated with this organization.
                        </p>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-2">
                                Reason for deletion (required):
                            </label>
                            <textarea
                                className="w-full p-2 border rounded text-sm sm:text-base"
                                rows="3"
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Enter reason for deleting this organization"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm sm:text-base"
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 text-sm sm:text-base"
                                onClick={() => handleDelete(organizationToDelete._id)}
                                disabled={isDeleting || !deleteReason.trim()}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}