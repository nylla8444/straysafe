'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

export default function DonationSettingsPage() {
    const { user, loading, isAuthenticated, isOrganization } = useAuth();
    const router = useRouter();

    const [donationQR, setDonationQR] = useState(null);
    const [qrPreview, setQRPreview] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [instructions, setInstructions] = useState('');
    const [enableDonations, setEnableDonations] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    // State variables for settings management
    const [hasExistingSettings, setHasExistingSettings] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch donation settings from the API instead of relying on user object
    const fetchDonationSettings = async () => {
        try {
            setIsLoadingSettings(true);
            const response = await axios.get('/api/organization/donation-settings');

            if (response.data.success && response.data.settings) {
                const settings = response.data.settings;
                let settingsExist = false;

                // Check if QR exists
                if (settings.donationQR) {
                    setQRPreview(settings.donationQR);
                    settingsExist = true;
                }

                // Check if bank details exist
                if (settings.bankDetails) {
                    setBankName(settings.bankDetails.bankName || '');
                    setAccountName(settings.bankDetails.accountName || '');
                    setAccountNumber(settings.bankDetails.accountNumber || '');
                    setInstructions(settings.bankDetails.instructions || '');

                    // If any bank details are provided, consider settings exist
                    if (settings.bankDetails.bankName || settings.bankDetails.accountNumber) {
                        settingsExist = true;
                    }
                }

                setEnableDonations(settings.enableDonations !== false);
                setHasExistingSettings(settingsExist);

                // Start in view mode if settings exist, or edit mode if setting up for first time
                setIsEditMode(!settingsExist);
            } else {
                // No settings found
                setHasExistingSettings(false);
                setIsEditMode(true); // Start in edit mode for new settings
            }
        } catch (error) {
            console.error('Error fetching donation settings:', error);
            setMessage({
                type: 'error',
                text: 'Failed to load donation settings. Please try again.'
            });
            setHasExistingSettings(false);
            setIsEditMode(true);
        } finally {
            setIsLoadingSettings(false);
        }
    };

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

            if (!user?.isVerified) {
                router.push('/organization');
                return;
            }

            // Fetch settings from API now that we know the user is authenticated
            fetchDonationSettings();
        }
    }, [loading, isAuthenticated, user, router, isOrganization]);

    const handleQRChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDonationQR(file);

            // Create image preview
            const reader = new FileReader();
            reader.onload = () => {
                setQRPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();

            if (donationQR) {
                formData.append('donationQR', donationQR);
            }

            // Bank details as JSON
            const bankDetails = {
                bankName,
                accountName,
                accountNumber,
                instructions
            };

            formData.append('bankDetails', JSON.stringify(bankDetails));
            formData.append('enableDonations', enableDonations.toString());

            const response = await axios.put('/api/organization/donation-settings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Donation settings updated successfully!' });
                setHasExistingSettings(true);
                setIsEditMode(false); // Return to view mode after successful save

                // Re-fetch settings to ensure we have the latest data
                fetchDonationSettings();
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to update settings.' });
            }
        } catch (error) {
            console.error('Error updating donation settings:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update donation settings. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || isLoadingSettings) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading donation settings...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user || !isOrganization() || !user.isVerified) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link href="/organization" className="text-teal-600 hover:text-teal-800 flex items-center mr-4">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold">Donation Settings</h1>
                </div>

                {/* Edit/Save buttons */}
                {hasExistingSettings && !isEditMode && (
                    <button
                        type="button"
                        onClick={() => setIsEditMode(true)}
                        className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Settings
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`p-4 rounded-md mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Current Settings View (Read-only) */}
            {hasExistingSettings && !isEditMode ? (
                <div className="space-y-6">
                    {/* Donation Status Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Donation Status</h2>
                        <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${enableDonations ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {enableDonations ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>

                    {/* QR Code Display */}
                    {qrPreview && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Donation QR Code</h2>
                            <div className="flex justify-center">
                                <div className="relative h-56 w-56">
                                    <Image
                                        src={qrPreview}
                                        alt="Donation QR Code"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-center text-gray-600 mt-3">
                                Donors can scan this QR code to send payments
                            </p>
                        </div>
                    )}

                    {/* Bank Details Display */}
                    {(bankName || accountNumber) && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Bank Transfer Details</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                {bankName && (
                                    <div className="flex items-start mb-2">
                                        <span className="w-32 flex-shrink-0 text-gray-500 text-sm">Bank:</span>
                                        <span className="font-medium text-gray-800">{bankName}</span>
                                    </div>
                                )}
                                {accountName && (
                                    <div className="flex items-start mb-2">
                                        <span className="w-32 flex-shrink-0 text-gray-500 text-sm">Account Name:</span>
                                        <span className="font-medium text-gray-800">{accountName}</span>
                                    </div>
                                )}
                                {accountNumber && (
                                    <div className="flex items-start mb-2">
                                        <span className="w-32 flex-shrink-0 text-gray-500 text-sm">Account #:</span>
                                        <span className="font-medium text-gray-800">{accountNumber}</span>
                                    </div>
                                )}
                                {instructions && (
                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Additional Instructions:</p>
                                        <p className="text-sm text-gray-700">{instructions}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Edit Mode - Settings Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Enable/Disable Donations */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Donation Status</h2>
                                <p className="text-sm text-gray-500">Control whether visitors can see donation options on your profile</p>
                            </div>
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={enableDonations}
                                        onChange={() => setEnableDonations(!enableDonations)}
                                    />
                                    <div className={`w-11 h-6 rounded-full transition ${enableDonations ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition transform ${enableDonations ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    {enableDonations ? 'Enabled' : 'Disabled'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* QR Code Upload */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Donation QR Code</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Upload a QR code image that links to your preferred mobile payment app or service.
                            Visitors will be able to scan this QR code to make donations directly.
                        </p>

                        <div className="mt-2">
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                {qrPreview ? (
                                    <div className="space-y-2 text-center">
                                        <div className="relative h-48 w-48 mx-auto">
                                            <Image
                                                src={qrPreview}
                                                alt="QR Code Preview"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <div className="flex text-sm justify-center">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                                                <span>Change QR Code</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={handleQRChange}
                                                    accept="image/*"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0H8m12 0a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                                                <span>Upload a QR code</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={handleQRChange}
                                                    accept="image/*"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Bank Transfer Details</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Provide your bank account details for supporters who prefer to make donations via bank transfer.
                        </p>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                                    Bank Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="bankName"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
                                    Account Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="accountName"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                                    Account Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="accountNumber"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-6">
                                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                                    Additional Instructions (Optional)
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="instructions"
                                        rows={3}
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        placeholder="E.g., Please include your name or email in the transfer reference"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        {hasExistingSettings && (
                            <button
                                type="button"
                                onClick={() => setIsEditMode(false)}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-purple-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}