import React, { useState } from 'react';
import axios from 'axios';

export default function VerificationResubmitForm({ organization, onSubmit }) {
    const [file, setFile] = useState(null);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!file && !additionalInfo) {
            setError('Please provide either additional information or a new document.');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            if (file) formData.append('document', file);
            if (additionalInfo) formData.append('additionalInfo', additionalInfo);

            const response = await axios.post(
                `/api/organization/verification/resubmit`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success) {
                setSuccess(true);
                setFile(null);
                setAdditionalInfo('');
                if (onSubmit) onSubmit(response.data);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to submit verification information.');
            console.error('Resubmission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-green-700">
                            Your information has been submitted successfully. We'll review it shortly.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information
                </label>
                <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={4}
                    placeholder="Provide any additional information that may help with verification..."
                ></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Verification Document (optional)
                </label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded"
                    accept="image/*, application/pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Upload a new document to support your verification (PDF, JPG, PNG)
                </p>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 rounded ${isSubmitting
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Additional Information'}
            </button>
        </form>
    );
}