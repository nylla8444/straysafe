import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import axios from 'axios';
import PaymentSetupForm from '../payments/PaymentSetupForm';
import PaymentStatus from '../payments/PaymentStatus';

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
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [showPaymentSetup, setShowPaymentSetup] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        if (filter !== 'all' && selectedApp) {
            const isSelectedAppInFilteredList = applications.some(
                app => app._id === selectedApp._id && app.status === filter
            );
            if (!isSelectedAppInFilteredList) {
                setSelectedApp(null);
            }
        }
    }, [filter, applications, selectedApp]);

    // Show details view automatically when an application is selected on mobile
    useEffect(() => {
        if (selectedApp) {
            setShowMobileDetails(true);

            // If application is approved but has no paymentId, check if one exists
            if (selectedApp.status === 'approved' && !selectedApp.paymentId) {
                checkPaymentExists(selectedApp._id);
            }
        }
    }, [selectedApp]);

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

    const checkPaymentExists = async (applicationId) => {
        try {
            const response = await axios.get(`/api/payments/check`, {
                params: {
                    applicationId: applicationId
                }
            });

            if (response.data.success && response.data.payment) {
                // Update the selected application with payment data
                setSelectedApp(prev => ({
                    ...prev,
                    paymentId: response.data.payment._id,
                    paymentStatus: response.data.payment.status
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error checking payment status:", error);
            return false;
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
                setShowMobileDetails(false);
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
                return <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">Reviewing</span>;
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
            {/* Header with responsive filter system */}
            <div className="p-4 sm:p-5 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-xl font-semibold">Applications 1</h2>

                    {/* Mobile: Filter dropdown */}
                    <div className="w-full sm:hidden">
                        <select
                            className="w-full bg-white border rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Applications</option>
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Desktop: Filter buttons */}
                    <div className="hidden sm:flex space-x-2 flex-wrap justify-end">
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
                            className={`px-3 py-1 rounded-full text-sm ${filter === 'reviewing' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
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
            </div>

            {/* Notification messages */}
            {updateSuccess && (
                <div className="bg-green-50 p-3 sm:p-4 border-l-4 border-green-500">
                    <p className="text-green-700 text-sm sm:text-base">{updateSuccess}</p>
                </div>
            )}

            {deleteError && (
                <div className="bg-red-50 p-3 sm:p-4 border-l-4 border-red-500">
                    <p className="text-red-700 text-sm sm:text-base">{deleteError}</p>
                </div>
            )}

            {/* Mobile: Back button when viewing details */}
            {showMobileDetails && selectedApp && (
                <div className="md:hidden p-3 border-b">
                    <button
                        onClick={() => setShowMobileDetails(false)}
                        className="flex items-center text-teal-600"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to applications
                    </button>
                </div>
            )}

            {/* Main content area with responsive layout */}
            <div className="md:grid md:grid-cols-3">
                {/* Application list - hidden on mobile when details are shown */}
                <div className={`col-span-1 border-r ${showMobileDetails ? 'hidden md:block' : ''} max-h-[calc(100vh-250px)] overflow-y-auto`}>
                    {filteredApplications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No applications found
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {filteredApplications.map((app) => (
                                <li
                                    key={app._id}
                                    className={`p-3 cursor-pointer ${selectedApp?._id === app._id ? 'bg-teal-50' : 'hover:bg-gray-50'}`}
                                    onClick={() => setSelectedApp(app)}
                                >
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden relative flex-shrink-0">
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
                                        <div className="ml-3 flex-grow min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium truncate max-w-[120px] sm:max-w-[150px] mr-2">
                                                    {app.petId.name}
                                                </p>
                                                {getStatusBadge(app.status)}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">
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

                {/* Application details - shown on mobile only when an app is selected */}
                <div className={`col-span-1 md:col-span-2 p-3 sm:p-4 ${!showMobileDetails ? 'hidden md:block' : ''} max-h-[calc(100vh-250px)] overflow-y-auto`}>
                    {!selectedApp ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-center">Select an application to view details</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                                <h3 className="text-base sm:text-lg font-semibold">
                                    Application for {selectedApp.petId.name}
                                    <span className="text-xs sm:text-sm font-normal text-gray-500 block sm:inline sm:ml-2">
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

                            {/* Pet and applicant info - stacked on mobile, side-by-side on tablets+ */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
                                <div className="bg-gray-50 p-3 sm:p-4 rounded capitalize">
                                    <h4 className="font-medium mb-2 text-sm text-gray-500">Pet Information</h4>
                                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedApp.petId.name}</p>
                                    <p className="text-sm"><span className="font-medium">Species:</span> {selectedApp.petId.specie}</p>
                                    <p className="text-sm"><span className="font-medium">Breed:</span> {selectedApp.petId.breed}</p>
                                    <p className="text-sm"><span className="font-medium">Gender:</span> {selectedApp.petId.gender}</p>
                                    <p className="text-sm"><span className="font-medium">Status:</span> {selectedApp.petId.status}</p>
                                </div>

                                <div className="bg-gray-50 p-3 sm:p-4 rounded">
                                    <h4 className="font-medium mb-2 text-sm text-gray-500">Applicant Information</h4>
                                    <p className="text-sm break-words"><span className="font-medium">Name:</span> {selectedApp.adopterId.firstName} {selectedApp.adopterId.lastName}</p>
                                    <p className="text-sm break-words"><span className="font-medium">Email:</span> {selectedApp.adopterId.email}</p>
                                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedApp.adopterId.contactNumber}</p>
                                    <p className="text-sm"><span className="font-medium">Location:</span> {selectedApp.adopterId.location}</p>
                                </div>
                            </div>

                            {/* Application details section */}
                            <div className="mb-5">
                                <h4 className="px-2 sm:px-4 font-medium mb-3 text-sm text-gray-500">Application Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 capitalize">
                                    <div className='px-2 sm:px-4'>
                                        <p className="text-sm"><span className="font-medium">Housing Status:</span> {selectedApp.housingStatus}</p>
                                        <p className="text-sm"><span className="font-medium">Pets Allowed:</span> {selectedApp.petsAllowed}</p>
                                        <p className="text-sm"><span className="font-medium">Other Pets:</span> {selectedApp.otherPets}</p>
                                        <p className="text-sm"><span className="font-medium">Financially Prepared:</span> {selectedApp.financiallyPrepared}</p>
                                    </div>
                                    <div className='px-2 sm:px-4'>
                                        <p className="text-sm"><span className="font-medium">Pet Location:</span> {selectedApp.petLocation}</p>
                                        <p className="text-sm"><span className="font-medium">Primary Caregiver:</span> {selectedApp.primaryCaregiver}</p>
                                        <p className="text-sm"><span className="font-medium">Emergency Care:</span> {selectedApp.emergencyPetCare}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reference section */}
                            <div className="mb-5 px-2 sm:px-4">
                                <h4 className="font-medium mb-3 text-sm text-gray-500">Reference</h4>
                                <p className="text-sm"><span className="font-medium">Name:</span> {selectedApp.reference.name}</p>
                                <p className="text-sm break-words"><span className="font-medium">Email:</span> {selectedApp.reference.email}</p>
                                <p className="text-sm"><span className="font-medium">Phone:</span> {selectedApp.reference.phone}</p>
                            </div>

                            {/* Status update section */}
                            {(selectedApp.status === 'pending' || selectedApp.status === 'reviewing') && (
                                <div className="border-t pt-4 mt-4 px-2 sm:px-0">
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
                                        className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-teal-300"
                                        disabled={!updateStatus}
                                        onClick={handleStatusUpdate}
                                    >
                                        Update Status
                                    </button>
                                </div>
                            )}

                            {/* Notes section for approved/rejected applications */}
                            {(selectedApp.status === 'approved' || selectedApp.status === 'rejected') && (
                                <div className="border-t pt-4 mt-4 px-2 sm:px-0">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
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
                                            <p className="text-sm mb-2 break-words">
                                                <span className="font-medium">Rejection Reason:</span> {selectedApp.rejectionReason || 'No reason provided'}
                                            </p>
                                        )}
                                        <p className="text-sm break-words">
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

                            {/* Payment setup for approved applications */}
                            {selectedApp && selectedApp.status === 'approved' && (
                                <div className="border-t pt-4 mt-4 px-2 sm:px-0">
                                    <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                                        <h4 className="font-medium">Payment Setup</h4>
                                    </div>

                                    {/* Check if payment is already set up */}
                                    {selectedApp.paymentId ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                            <div>
                                                <PaymentStatus status={selectedApp.paymentStatus || 'pending'} />
                                                <p className="mt-2 text-sm text-gray-600">
                                                    Payment #{selectedApp.paymentId}
                                                    {selectedApp.paymentStatus === 'pending' ? ' awaiting payment' :
                                                        selectedApp.paymentStatus === 'submitted' ? ' awaiting verification' :
                                                            selectedApp.paymentStatus === 'verified' ? ' has been verified' : ' was rejected'}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/organization/payments/${selectedApp.paymentId}`}
                                                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-center sm:text-left w-full sm:w-auto"
                                            >
                                                View Payment Details
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                            <p className="text-gray-600">No payment has been set up for this application yet.</p>
                                            <button
                                                onClick={() => setShowPaymentSetup(true)}
                                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center sm:text-left w-full sm:w-auto flex items-center justify-center"
                                            >
                                                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2m2-4h.01M17 16h.01" />
                                                </svg>
                                                Setup Payment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile-friendly delete modal */}
            {showDeleteModal && selectedApp && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
                        <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-red-600">Delete Application</h3>
                        <p className="mb-5 text-sm sm:text-base">
                            Are you sure you want to delete the application for <b>{selectedApp.petId.name}</b> submitted by <b>{selectedApp.adopterId.firstName} {selectedApp.adopterId.lastName}</b>? This action cannot be undone.
                        </p>

                        <div className="flex flex-col sm:flex-row-reverse gap-3 sm:gap-4">
                            <button
                                onClick={handleDeleteApplication}
                                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 text-sm sm:text-base"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete Application"}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm sm:text-base"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Setup Modal */}
            {showPaymentSetup && selectedApp && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Setup Payment</h2>
                                <button
                                    onClick={() => setShowPaymentSetup(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <PaymentSetupForm
                                applicationId={selectedApp._id}
                                petDetails={selectedApp.petId}
                                onSuccess={(paymentData) => {
                                    setShowPaymentSetup(false);
                                    // Update selectedApp with payment info
                                    setSelectedApp(prev => ({
                                        ...prev,
                                        paymentId: paymentData._id,
                                        paymentStatus: paymentData.status
                                    }));
                                    // Refresh applications to get updated data
                                    setTimeout(fetchApplications, 1000);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}