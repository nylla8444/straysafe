import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';

export default function CashDonationComponent() {
    const { user } = useAuth();

    useEffect(() => {
        console.log("Auth user data:", user);
    }, [user]);

    // States for donation form
    const [amount, setAmount] = useState('');
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [purpose, setPurpose] = useState('general');
    const [message, setMessage] = useState('');
    const [donationDate, setDonationDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States for donation list
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [summary, setSummary] = useState({ totalAmount: 0, averageAmount: 0, count: 0 });

    // Handle form submission
    const handleSubmitDonation = async (e) => {
        e.preventDefault();

        console.log("Submit donation - current user:", user);

        const userId = user?.userId || user?._id || user?.id;

        if (!user || !userId) {
            setNotification({
                show: true,
                type: 'error',
                message: 'User authentication required to record donations'
            });
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setNotification({
                show: true,
                type: 'error',
                message: 'Please enter a valid donation amount'
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Create donation data object to match our schema
            const donationData = {
                amount: parseFloat(amount),
                isAnonymous: isAnonymous,
                organizationId: userId,
                purpose: purpose,
                message: message,
                referenceNumber: referenceNumber,
                donationDate: donationDate
            };

            // Add donor info only if not anonymous
            if (!isAnonymous) {
                donationData.donorName = donorName;
                donationData.donorEmail = donorEmail;
            }

            // Send to our new cash-donation endpoint as JSON
            const response = await axios.post('/api/cash-donation', donationData);

            if (response.data.success) {
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Cash donation recorded successfully!'
                });

                // Reset form
                setAmount('');
                setDonorName('');
                setDonorEmail('');
                setIsAnonymous(false);
                setReferenceNumber('');
                setPurpose('general');
                setMessage('');
                setDonationDate(format(new Date(), 'yyyy-MM-dd'));

                // Refresh donation list
                fetchDonations();
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: response.data.message || 'Failed to record donation'
                });
            }
        } catch (error) {
            console.error('Error recording donation:', error);
            setNotification({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Error recording donation'
            });
        } finally {
            setIsSubmitting(false);

            // Hide notification after 3 seconds
            setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 3000);
        }
    };

    // Fetch donation list
    const fetchDonations = async () => {
        try {
            const userId = user?.userId || user?._id || user?.id;

            // Check if user exists before making the request
            if (!user || !userId) {
                setError('User authentication required to view donations');
                return;
            }

            setIsLoading(true);
            setError('');

            const response = await axios.get(`/api/cash-donation?organizationId=${userId}`);

            if (response.data.success) {
                setDonations(response.data.donations || []);

                // Set summary information
                if (response.data.summary) {
                    setSummary(response.data.summary);
                }
            } else {
                setError('Failed to load donation records');
            }
        } catch (error) {
            console.error('Error fetching donations:', error);
            console.error('Error details:', error.response?.data);
            setError(`Error loading donations: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Load donations when component mounts
    useEffect(() => {
        const userId = user?.userId || user?._id || user?.id;
        if (user && userId) {
            fetchDonations();
        }
    }, [user]);

    return (
        <div className="space-y-8 pb-10">
            {/* Fixed position notification for better UX */}
            {notification.show && (
                <div className="fixed top-4 right-4 left-4 md:left-auto md:max-w-md z-50 shadow-lg transition-all duration-300 transform translate-y-0 opacity-100">
                    <div className={`p-4 rounded-md ${notification.type === 'success'
                        ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
                        : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
                        <div className="flex items-center">
                            {notification.type === 'success' ? (
                                <svg className="h-5 w-5 mr-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 mr-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <p>{notification.message}</p>
                            <button
                                onClick={() => setNotification({ show: false, type: '', message: '' })}
                                className="ml-auto text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Donation Form - Improved layout */}
            <section className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-amber-50 p-4 border-b border-amber-100">
                    <h2 className="text-xl font-semibold text-amber-800">Record Cash Donation</h2>
                    <p className="text-amber-600 text-sm mt-1">Enter the details of the cash donation below.</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmitDonation} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {/* Amount - improved visibility */}
                            <div className="col-span-1">
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (₱) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">₱</span>
                                    </div>
                                    <input
                                        type="number"
                                        id="amount"
                                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        aria-label="Donation amount"
                                    />
                                </div>
                            </div>

                            {/* Purpose - improved select styling */}
                            <div className="col-span-1">
                                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                                    Purpose
                                </label>
                                <select
                                    id="purpose"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    aria-label="Donation purpose"
                                >
                                    <option value="general">General Fund</option>
                                    <option value="medical">Medical Care</option>
                                    <option value="food">Food & Supplies</option>
                                    <option value="shelter">Shelter Maintenance</option>
                                    <option value="rescue">Rescue Operations</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Date of donation - improved calendar styling */}
                            <div className="col-span-1">
                                <label htmlFor="donationDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Donation Date
                                </label>
                                <input
                                    type="date"
                                    id="donationDate"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                    value={donationDate}
                                    onChange={(e) => setDonationDate(e.target.value)}
                                    aria-label="Date of donation"
                                />
                            </div>

                            {/* Reference number - improved visibility */}
                            <div className="col-span-1">
                                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reference/Receipt Number
                                </label>
                                <input
                                    type="text"
                                    id="reference"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    placeholder="Enter reference number"
                                    aria-label="Reference or receipt number"
                                />
                            </div>

                            {/* Anonymous toggle - improved styling */}
                            <div className="col-span-full">
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <div className="flex items-center">
                                        <input
                                            id="anonymous"
                                            name="anonymous"
                                            type="checkbox"
                                            className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                            checked={isAnonymous}
                                            onChange={() => setIsAnonymous(!isAnonymous)}
                                            aria-label="Make donation anonymous"
                                        />
                                        <label htmlFor="anonymous" className="ml-3 block text-sm font-medium text-gray-700">
                                            Anonymous donation
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        When checked, donor information will be hidden from public donation records.
                                    </p>
                                </div>
                            </div>

                            {/* Donor information - conditionally shown */}
                            {!isAnonymous && (
                                <div className="col-span-full">
                                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                        <h3 className="text-sm font-medium text-blue-800 mb-3">Donor Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Donor Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="donorName"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
                                                    value={donorName}
                                                    onChange={(e) => setDonorName(e.target.value)}
                                                    placeholder="Full name"
                                                    aria-label="Donor's full name"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Donor Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="donorEmail"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
                                                    value={donorEmail}
                                                    onChange={(e) => setDonorEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    aria-label="Donor's email address"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes/Message - full width textarea */}
                            <div className="col-span-full">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes/Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={3}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Add any additional notes about this donation"
                                    aria-label="Additional notes or message"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Recording...
                                    </span>
                                ) : 'Record Donation'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Donation Summary - Improved cards */}
            {summary.count > 0 && (
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm hover:shadow transition-shadow">
                        <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full p-2 mr-3">
                                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-blue-800 text-sm font-medium">Total Donations</p>
                                <p className="text-2xl font-bold text-blue-900 mt-1">{summary.count}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 p-5 rounded-lg border border-green-100 shadow-sm hover:shadow transition-shadow">
                        <div className="flex items-center">
                            <div className="bg-green-100 rounded-full p-2 mr-3">
                                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-green-800 text-sm font-medium">Total Amount</p>
                                <p className="text-2xl font-bold text-green-900 mt-1">₱{summary.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-amber-50 p-5 rounded-lg border border-amber-100 shadow-sm hover:shadow transition-shadow">
                        <div className="flex items-center">
                            <div className="bg-amber-100 rounded-full p-2 mr-3">
                                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-amber-800 text-sm font-medium">Average Donation</p>
                                <p className="text-2xl font-bold text-amber-900 mt-1">₱{summary.averageAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Donation List - Improved table responsiveness */}
            <section className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-xl font-medium text-gray-900">Donation History</h2>
                    <button
                        onClick={fetchDonations}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center self-end sm:self-auto"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                <div className="px-6 py-4">
                    {/* Loading state */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-500">Loading donations...</span>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 border border-red-200">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Donation list - Responsive design for mobile */}
                    {!isLoading && !error && donations.length > 0 ? (
                        <div className="overflow-x-auto -mx-6">
                            <div className="inline-block min-w-full px-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                            <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {donations.map((donation) => (
                                            <tr key={donation._id} className="hover:bg-gray-50">
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(donation.donationDate), 'MMM d, yyyy')}
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <span className="hidden sm:inline">{donation.donationId}</span>
                                                    <span className="inline sm:hidden">{donation.donationId.substring(0, 8)}...</span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Not specified'}
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    ₱{donation.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${donation.purpose === 'medical' ? 'bg-blue-100 text-blue-800' :
                                                            donation.purpose === 'food' ? 'bg-green-100 text-green-800' :
                                                                donation.purpose === 'shelter' ? 'bg-amber-100 text-amber-800' :
                                                                    donation.purpose === 'rescue' ? 'bg-purple-100 text-purple-800' :
                                                                        'bg-gray-100 text-gray-800'}`}>
                                                        {donation.purpose.charAt(0).toUpperCase() + donation.purpose.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {donation.referenceNumber || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : !isLoading && !error ? (
                        <div className="py-12 text-center text-gray-500">
                            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-4 text-lg">No donations recorded yet.</p>
                            <p className="mt-2 text-sm text-gray-400">Record a donation using the form above.</p>
                        </div>
                    ) : null}

                    {/* Mobile-specific list view (alternative to table) */}
                    <div className="md:hidden mt-4">
                        {!isLoading && !error && donations.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-xs text-gray-500 italic">Scroll horizontally to view complete table ↔️</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}