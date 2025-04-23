// src/components/EditProfileModal.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function EditProfileModal({ user, isOpen, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
        location: '',
        profileImage: '',
    });
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Initialize form with user data when modal opens
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                contactNumber: user.contactNumber || '',
                location: user.location || '',
                profileImage: user.profileImage || '',
            });
            setPreviewUrl(user.profileImage || '');
        }
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size validation
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            return;
        }

        // Format validation
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setError("Only JPEG and PNG formats are supported");
            return;
        }

        // Store the file to be submitted later with the form
        setFormData(prev => ({
            ...prev,
            profileImage: file
        }));

        // Create preview URL for display
        setPreviewUrl(URL.createObjectURL(file));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const submitData = new FormData();

            // Append all text fields
            Object.keys(formData).forEach(key => {
                // Skip the profileImage key as we handle it separately
                if (key !== 'profileImage' || typeof formData[key] === 'string') {
                    submitData.append(key, formData[key]);
                }
            });

            // Append the image file if it exists and is a File object
            if (formData.profileImage && formData.profileImage instanceof File) {
                submitData.append('profileImage', formData.profileImage);
            }

            // Profile update will handle the image upload directly
            const response = await axios.put('/api/user/profile', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                console.log('Profile updated successfully');
                onUpdate(response.data.user);
            } else {
                setError(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.message || 'An error occurred while updating your profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    // If modal is closed, don't render
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Edit Your Profile</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Profile Image */}
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Profile Picture</label>
                            <div className="flex items-center">
                                <div className="relative w-24 h-24 bg-gray-200 rounded-full overflow-hidden mr-4">
                                    {previewUrl ? (
                                        <Image
                                            src={previewUrl}
                                            alt="Profile preview"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/jpeg,image/png"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                                    >
                                        Choose Image
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max size: 5MB (JPEG, PNG)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 mb-2" htmlFor="firstName">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2" htmlFor="lastName">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="contactNumber">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                placeholder="e.g., 123-456-7890"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2" htmlFor="location">
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                placeholder="City, State"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}