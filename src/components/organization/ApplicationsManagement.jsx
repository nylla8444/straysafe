import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import axios from 'axios';

export default function ApplicationsManagement() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [filter, setFilter] = useState('all');
    const [updateStatus, setUpdateStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);


    useEffect(() => {
        // If a filter is active (not 'all') and there's a selected app
        if (filter !== 'all' && selectedApp) {
            // Check if the selected application is still in the filtered list
            const isSelectedAppInFilteredList = applications.some(
                app => app._id === selectedApp._id && app.status === filter
            );

            // If the selected app is not in the current filter, deselect it
            if (!isSelectedAppInFilteredList) {
                setSelectedApp(null);
            }
        }
    }, [filter, applications, selectedApp]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/adoptions/organization');

            if (response.data.success) {
                setApplications(response.data.applications);
            } else {
                setError('Failed to fetch adoption applications');
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load adoption applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = filter === 'all'
        ? applications
        : applications.filter(app => app.status === filter);

    const handleDeleteApplication = async () => {
        if (!selectedApp) return;

        try {
            setIsDeleting(true);
            setDeleteError('');

            const response = await axios.delete(`/api/adoptions/${selectedApp.applicationId}/delete`);

            if (response.data.success) {
                setApplications(prev => prev.filter(app => app._id !== selectedApp._id));
                setUpdateSuccess('Application deleted successfully');
                setShowDeleteModal(false);
                setSelectedApp(null);
                setTimeout(() => setUpdateSuccess(''), 5000);
            }
        } catch (err) {
            console.error('Error deleting application:', err);
            setDeleteError(err.response?.data?.error || 'Failed to delete application');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedApp || !updateStatus) return;

        try {
            const response = await axios.put(`/api/adoptions/${selectedApp.applicationId}`, {
                status: updateStatus,
                organizationNotes: notes,
                rejectionReason: updateStatus === 'rejected' ? notes : ''
            });

            if (response.data.success) {
                setApplications(prev => prev.map(app =>
                    app._id === selectedApp._id ? { ...app, status: updateStatus } : app
                ));
                setSelectedApp({ ...selectedApp, status: updateStatus });
                setUpdateSuccess(`Application status updated to ${updateStatus}`);
                setUpdateStatus('');
                setNotes('');
                setTimeout(() => setUpdateSuccess(''), 5000);
                if (updateStatus === 'approved') {
                    setTimeout(fetchApplications, 1000);
                }
            }
        } catch (err) {
            console.error('Error updating application status:', err);
            setError('Failed to update application status');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Pending</span>;
            case 'reviewing':
                return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Reviewing</span>;
            case 'approved':
                return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Approved</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Rejected</span>;
            case 'withdrawn':
                return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Withdrawn</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Applications</h2>
                <div className="flex space-x-2">
                    <button
                        className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`px-3 py-1 rounded-full text-sm ${filter === 'reviewing' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setFilter('reviewing')}
                    >
                        Reviewing
                    </button>
                    <button
                        className={`px-3 py-1 rounded-full text-sm ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={`px-3 py-1 rounded-full text-sm ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {updateSuccess && (
                <div className="bg-green-50 p-4 border-l-4 border-green-500">
                    <p className="text-green-700">{updateSuccess}</p>
                </div>
            )}

            {deleteError && (
                <div className="bg-red-50 p-4 border-l-4 border-red-500">
                    <p className="text-red-700">{deleteError}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="col-span-1 border-r h-[calc(100vh-250px)] overflow-y-auto">
                    {filteredApplications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No applications found
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {filteredApplications.map((app) => (
                                <li
                                    key={app._id}
                                    className={`p-3 cursor-pointer ${selectedApp?._id === app._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    onClick={() => setSelectedApp(app)}
                                >
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full overflow-hidden relative flex-shrink-0">
                                            {app.petId.img_arr && app.petId.img_arr.length > 0 ? (
                                                <Image
                                                    src={app.petId.img_arr[0]}
                                                    alt={app.petId.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                                                    <span className="text-xs text-gray-500">No img</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-grow">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium truncate max-w-[150px] mr-2">
                                                    {app.petId.name}
                                                </p>
                                                {getStatusBadge(app.status)}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {app.adopterId.firstName} {app.adopterId.lastName}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {format(new Date(app.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="col-span-1 md:col-span-2 p-4 h-[calc(100vh-250px)] overflow-y-auto">
                    {!selectedApp ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>Select an application to view details</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold">
                                    Application for {selectedApp.petId.name}
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        (ID: {selectedApp.applicationId})
                                    </span>
                                </h3>
                                <div className="flex items-center space-x-3">
                                    {getStatusBadge(selectedApp.status)}
                                    {selectedApp.status === 'rejected' && (
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                            title="Delete application"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded capitalize">
                                    <h4 className="font-medium mb-2 text-sm text-gray-500">Pet Information</h4>
                                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedApp.petId.name}</p>
                                    <p className="text-sm"><span className="font-medium">Species:</span> {selectedApp.petId.specie}</p>
                                    <p className="text-sm"><span className="font-medium">Breed:</span> {selectedApp.petId.breed}</p>
                                    <p className="text-sm"><span className="font-medium">Gender:</span> {selectedApp.petId.gender}</p>
                                    <p className="text-sm"><span className="font-medium">Status:</span> {selectedApp.petId.status}</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded">
                                    <h4 className="font-medium mb-2 text-sm text-gray-500">Applicant Information</h4>
                                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedApp.adopterId.firstName} {selectedApp.adopterId.lastName}</p>
                                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedApp.adopterId.email}</p>
                                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedApp.adopterId.contactNumber}</p>
                                    <p className="text-sm"><span className="font-medium">Location:</span> {selectedApp.adopterId.location}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="px-4 font-medium mb-3 text-sm text-gray-500">Application Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 capitalize">
                                    <div className='px-4 '>
                                        <p className="text-sm "><span className="font-medium">Housing Status:</span> {selectedApp.housingStatus}</p>
                                        <p className="text-sm"><span className="font-medium">Pets Allowed:</span> {selectedApp.petsAllowed}</p>
                                        <p className="text-sm"><span className="font-medium">Other Pets:</span> {selectedApp.otherPets}</p>
                                        <p className="text-sm"><span className="font-medium">Financially Prepared:</span> {selectedApp.financiallyPrepared}</p>
                                    </div>
                                    <div className='px-4'>
                                        <p className="text-sm"><span className="font-medium">Pet Location:</span> {selectedApp.petLocation}</p>
                                        <p className="text-sm"><span className="font-medium">Primary Caregiver:</span> {selectedApp.primaryCaregiver}</p>
                                        <p className="text-sm"><span className="font-medium">Emergency Care:</span> {selectedApp.emergencyPetCare}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 px-4">
                                <h4 className="font-medium mb-3 text-sm text-gray-500">Reference</h4>
                                <p className="text-sm"><span className="font-medium">Name:</span> {selectedApp.reference.name}</p>
                                <p className="text-sm"><span className="font-medium">Email:</span> {selectedApp.reference.email}</p>
                                <p className="text-sm"><span className="font-medium">Phone:</span> {selectedApp.reference.phone}</p>
                            </div>

                            {(selectedApp.status === 'pending' || selectedApp.status === 'reviewing') && (
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="font-medium mb-3">Update Application Status</h4>

                                    <div className="mb-4">
                                        <label className="block mb-2 text-sm font-medium">Change Status</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={updateStatus}
                                            onChange={(e) => setUpdateStatus(e.target.value)}
                                        >
                                            <option value="">Select new status</option>
                                            {selectedApp.status === 'pending' && (
                                                <option value="reviewing">Move to Reviewing</option>
                                            )}
                                            <option value="approved">Approve Application</option>
                                            <option value="rejected">Reject Application</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-2 text-sm font-medium">Notes {updateStatus === 'rejected' && '(Reason for Rejection)'}</label>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            rows="3"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder={updateStatus === 'rejected'
                                                ? "Please provide a reason for rejection"
                                                : "Add notes about this application"
                                            }
                                        ></textarea>
                                    </div>

                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                                        disabled={!updateStatus}
                                        onClick={handleStatusUpdate}
                                    >
                                        Update Status
                                    </button>
                                </div>
                            )}

                            {(selectedApp.status === 'approved' || selectedApp.status === 'rejected') && (
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium mb-2">Organization Notes</h4>
                                        {selectedApp.status === 'rejected' && (
                                            <button
                                                onClick={() => setShowDeleteModal(true)}
                                                className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete Application
                                            </button>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        {selectedApp.status === 'rejected' && (
                                            <p className="text-sm mb-2">
                                                <span className="font-medium">Rejection Reason:</span> {selectedApp.rejectionReason || 'No reason provided'}
                                            </p>
                                        )}
                                        <p className="text-sm">
                                            <span className="font-medium">Notes:</span> {selectedApp.organizationNotes || 'No notes added'}
                                        </p>
                                        {selectedApp.reviewedBy && (
                                            <p className="text-sm mt-2 text-gray-500">
                                                Reviewed by: {selectedApp.reviewedBy}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showDeleteModal && selectedApp && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="font-bold text-xl mb-4 text-red-600">Delete Application</h3>
                        <p className="mb-6">
                            Are you sure you want to delete the application for <b>{selectedApp.petId.name}</b> submitted by <b>{selectedApp.adopterId.firstName} {selectedApp.adopterId.lastName}</b>? This action cannot be undone.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteApplication}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete Application"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}