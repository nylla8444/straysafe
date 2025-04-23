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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Organizations Management</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('followup')}
                        className={`px-4 py-2 rounded ${filter === 'followup' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                    >
                        Follow Up
                    </button>
                    <button
                        onClick={() => setFilter('verified')}
                        className={`px-4 py-2 rounded ${filter === 'verified' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                    >
                        Verified
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                    <p className="mt-2">Loading organizations...</p>
                </div>
            ) : organizations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p>No organizations found with {filter} status.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* List of organizations */}
                    <div className="bg-white rounded-lg shadow-md p-6 h-[600px] overflow-y-auto">
                        <h3 className="font-semibold mb-4">Organization List ({organizations.length})</h3>
                        <ul className="divide-y">
                            {organizations.map(org => (
                                <li
                                    key={org._id}
                                    className={`py-4 cursor-pointer hover:bg-gray-50 ${selectedOrg?._id === org._id ? 'bg-blue-50' : ''}`}
                                    onClick={() => setSelectedOrg(org)}
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden relative">
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
                                            <p className="font-medium">{org.organizationName}</p>
                                            <p className="text-sm text-gray-500">{org.email}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Organization details and verification actions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {selectedOrg ? (
                            <div>
                                <h3 className="font-semibold mb-4">{selectedOrg.organizationName}</h3>
                                <div className="mb-6 grid gap-2">
                                    <p><span className="font-medium">Email:</span> {selectedOrg.email}</p>
                                    <p><span className="font-medium">Phone:</span> {selectedOrg.contactNumber || 'Not provided'}</p>
                                    <p><span className="font-medium">Location:</span> {selectedOrg.location || 'Not provided'}</p>
                                    <p>
                                        <span className="font-medium">Status:</span>{' '}
                                        {selectedOrg.verificationStatus === 'verified' && <span className="text-green-500">Verified</span>}
                                        {selectedOrg.verificationStatus === 'pending' && <span className="text-blue-500">Pending</span>}
                                        {selectedOrg.verificationStatus === 'followup' && <span className="text-yellow-500">Follow Up Required</span>}
                                        {selectedOrg.verificationStatus === 'rejected' && <span className="text-red-500">Rejected</span>}
                                    </p>
                                    {selectedOrg.verificationNotes && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded">
                                            <p className="font-medium">Notes:</p>
                                            <p>{selectedOrg.verificationNotes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-medium mb-2">Verification Document:</h4>
                                    {selectedOrg.verificationDocument ? (
                                        <div>
                                            <a
                                                href={selectedOrg.verificationDocument}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                View Document
                                            </a>
                                            <div className="mt-3 p-2 border rounded">
                                                {selectedOrg.verificationDocument.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex items-center text-gray-600">
                                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                                        </svg>
                                                        PDF Document
                                                    </div>
                                                ) : (
                                                    <div className="relative h-40 w-full">
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
                                        <p className="text-red-500">No verification document provided</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-medium">Notes</label>
                                    <textarea
                                        className="w-full p-2 border rounded"
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

                                <div className="flex flex-wrap gap-2 mt-6">
                                    {selectedOrg.verificationStatus !== 'verified' && (
                                        <button
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                            onClick={() => handleVerify(selectedOrg._id)}
                                        >
                                            Verify
                                        </button>
                                    )}

                                    {selectedOrg.verificationStatus !== 'followup' && (
                                        <button
                                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                            onClick={() => handleFollowUp(selectedOrg._id)}
                                        >
                                            Request Follow-up
                                        </button>
                                    )}

                                    {selectedOrg.verificationStatus !== 'rejected' && (
                                        <button
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                            onClick={() => handleReject(selectedOrg._id)}
                                        >
                                            Reject
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleViewHistory(selectedOrg._id)}
                                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm ml-2"
                                    >
                                        View History
                                    </button>

                                    <button
                                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 ml-auto"
                                        onClick={() => {
                                            setSelectedOrg(null);
                                            setNotes('');
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>Select an organization to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {historyOrgId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Verification History</h3>
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

                        {loadingHistory ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                                <p className="mt-2 text-gray-600">Loading history...</p>
                            </div>
                        ) : (
                            <VerificationHistoryList history={history} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}