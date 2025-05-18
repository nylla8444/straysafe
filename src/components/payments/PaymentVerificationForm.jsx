import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function PaymentVerificationForm({ payment, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notes, setNotes] = useState('');

    const handleVerify = async (status) => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.put('/api/payments/verify', {
                paymentId: payment._id,
                status,
                notes
            });

            if (response.data.success) {
                onSuccess(response.data.payment);
            }
        } catch (err) {
            console.error('Failed to verify payment:', err);
            setError(err.response?.data?.error || 'Failed to verify payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Verify Payment</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 className="font-medium text-gray-700 mb-2">Payment Details</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <div className="mb-2">
                            <span className="text-sm text-gray-500">Amount:</span>
                            <p className="font-medium">₱{payment.amount}</p>
                        </div>

                        <div className="mb-2">
                            <span className="text-sm text-gray-500">Transaction ID:</span>
                            <p className="font-medium">{payment.transactionId || 'Not provided'}</p>
                        </div>

                        <div className="mb-2">
                            <span className="text-sm text-gray-500">Submitted on:</span>
                            <p className="font-medium">{new Date(payment.dateSubmitted).toLocaleDateString()}</p>
                        </div>

                        <div className="mb-2">
                            <span className="text-sm text-gray-500">Submitted by:</span>
                            <p className="font-medium">{payment.adopterId.firstName} {payment.adopterId.lastName}</p>
                            <p className="text-sm text-gray-500">{payment.adopterId.email}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-medium text-gray-700 mb-2">Payment Proof</h3>
                    <div className="h-64 relative rounded-md overflow-hidden">
                        <Image
                            src={payment.proofOfTransaction}
                            alt="Payment Proof"
                            fill
                            className="object-contain bg-gray-100"
                        />
                    </div>
                    <div className="mt-2 text-center">
                        <a
                            href={payment.proofOfTransaction}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:underline text-sm"
                        >
                            View full image
                        </a>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Add verification notes or feedback for the adopter"
                ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => handleVerify('rejected')}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white font-medium ${loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    Reject Payment
                </button>
                <button
                    onClick={() => handleVerify('verified')}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white font-medium ${loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    Verify Payment
                </button>
            </div>
        </div>
    );
}