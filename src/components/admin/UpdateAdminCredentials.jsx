import { useState } from 'react';
import axios from 'axios';

export default function UpdateAdminCredentials() {
    const [formData, setFormData] = useState({
        newAdminId: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        newAdminCode: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate form
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (!formData.currentPassword) {
            setError('Current password is required');
            return;
        }

        // Check if at least one field is being updated
        if (!formData.newAdminId && !formData.newPassword && !formData.newAdminCode) {
            setError('Please provide at least one field to update');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('Updating admin credentials...');

            // Prepare payload - only include fields that have values
            const payload = {
                currentPassword: formData.currentPassword
            };

            if (formData.newAdminId) payload.newAdminId = formData.newAdminId;
            if (formData.newPassword) payload.newPassword = formData.newPassword;
            if (formData.newAdminCode) payload.newAdminCode = formData.newAdminCode;

            // Log the payload (without sensitive data) for debugging
            console.log('Update payload keys:', Object.keys(payload));

            // Make the API request
            const response = await axios.put('/api/admin/update-credentials', payload);

            console.log('Update response:', response.data);

            if (response.data.success) {
                setSuccess('Credentials updated successfully');
                // Clear form
                setFormData({
                    newAdminId: '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    newAdminCode: ''
                });
            } else {
                setError(response.data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Failed to update admin credentials:', error);

            // Extract and display the error message
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md mx-auto w-full max-w-2xl">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Update Admin Credentials</h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm sm:text-base">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm sm:text-base">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3 sm:mb-4">
                    <label htmlFor="newAdminId" className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                        New Admin ID (leave blank to keep current)
                    </label>
                    <input
                        type="text"
                        id="newAdminId"
                        name="newAdminId"
                        value={formData.newAdminId}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm sm:text-base leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-3 sm:mb-4">
                    <label htmlFor="currentPassword" className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                        Current Password (required)
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm sm:text-base leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="mb-3 sm:mb-4">
                    <label htmlFor="newPassword" className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                        New Password (leave blank to keep current)
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm sm:text-base leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="mb-3 sm:mb-4">
                    <label htmlFor="confirmPassword" className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm sm:text-base leading-tight focus:outline-none focus:shadow-outline ${formData.newPassword && formData.newPassword !== formData.confirmPassword
                            ? 'border-red-500'
                            : ''
                            }`}
                    />
                    {formData.newPassword && formData.newPassword !== formData.confirmPassword && (
                        <p className="text-red-500 text-xs italic mt-1">Passwords don't match</p>
                    )}
                </div>

                <div className="mb-4 sm:mb-6">
                    <label htmlFor="newAdminCode" className="block text-gray-700 text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                        New Admin Code (leave blank to keep current)
                    </label>
                    <input
                        type="text"
                        id="newAdminCode"
                        name="newAdminCode"
                        value={formData.newAdminCode}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm sm:text-base leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-teal-400 text-sm sm:text-base"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Credentials'}
                    </button>
                </div>
            </form>
        </div>
    );
}