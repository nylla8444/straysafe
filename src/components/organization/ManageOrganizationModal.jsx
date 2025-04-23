'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function ManageOrganizationModal({ organization, isOpen, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        organizationName: '',
        contactNumber: '',
        city: '',
        province: ''
    });

    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const modalRef = useRef();

    // Initialize form data when organization data is loaded
    useEffect(() => {
        if (organization) {
            // Split location into city and province if it contains a comma
            const locationParts = organization.location?.split(',').map(part => part.trim()) || ['', ''];

            setFormData({
                organizationName: organization.organizationName || '',
                contactNumber: organization.contactNumber || '',
                city: locationParts[0] || '',
                province: locationParts[1] || '',
            });

            if (organization.profileImage) {
                setPreviewUrl(organization.profileImage);
            }
        }
    }, [organization]);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Handle form changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle file selection
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Only accept images
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // File size validation (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be smaller than 5MB');
                return;
            }

            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            // Create FormData for multipart/form-data submission
            const data = new FormData();
            data.append('organizationName', formData.organizationName);
            data.append('contactNumber', formData.contactNumber);
            data.append('location', `${formData.city}, ${formData.province}`);

            // Only append image if a new one was selected
            if (profileImage) {
                data.append('profileImage', profileImage);
            }

            console.log('Submitting organization update...');
            const response = await axios.put('/api/organization/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Update response:', response.data);
            setSuccess('Profile updated successfully');

            // Notify parent component about the update
            if (onUpdate) {
                await onUpdate(response.data.organization);
            }

            // Force close the modal immediately
            onClose();

        } catch (error) {
            console.error('Update organization error:', error);
            setError(error.response?.data?.error || 'Failed to update organization profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Manage Organization</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block mb-2 font-medium">Profile Image</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                                    {previewUrl ? (
                                        <Image
                                            src={previewUrl}
                                            alt="Organization profile"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            No image
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, or JPEG (max 5MB)</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Organization Name</label>
                            <input
                                type="text"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Contact Number</label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block mb-2 font-medium">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Province</label>
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400"
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