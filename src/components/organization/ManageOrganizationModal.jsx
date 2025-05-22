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

    // Add validation state
    const [validationErrors, setValidationErrors] = useState({
        organizationName: '',
        contactNumber: '',
        city: '',
        province: '',
        profileImage: ''
    });

    const fileInputRef = useRef(null);
    const modalRef = useRef();

    // Add a reset function to restore original data
    const resetFormData = () => {
        if (organization) {
            // Split location into city and province if it contains a comma
            const locationParts = organization.location?.split(',').map(part => part.trim()) || ['', ''];

            setFormData({
                organizationName: organization.organizationName || '',
                contactNumber: organization.contactNumber || '',
                city: locationParts[0] || '',
                province: locationParts[1] || '',
            });

            // Reset image preview to original
            setProfileImage(null);
            setPreviewUrl(organization.profileImage || '');

            // Clear file input if it exists
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Reset validation errors
            setValidationErrors({
                organizationName: '',
                contactNumber: '',
                city: '',
                province: '',
                profileImage: ''
            });

            // Clear any error/success messages
            setError('');
            setSuccess('');
        }
    };

    // Initialize form data when modal opens or organization changes
    useEffect(() => {
        if (isOpen && organization) {
            resetFormData();
        }
    }, [organization, isOpen]);

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

    // Validation functions
    const validateName = (name) => {
        if (!name) return 'Organization name is required';
        if (name.trim() === '') return 'Organization name cannot be just spaces';
        return '';
    };

    const validatePhone = (phone) => {
        if (!phone) return 'Contact number is required';

        const digits = phone.replace(/\D/g, '');
        if (digits.length !== 11) return 'Contact number must contain exactly 11 digits';
        if (digits[0] !== '0') return 'Contact number must start with 0';
        if (!/^[0-9+\-\s()]+$/.test(phone)) return 'Contact number contains invalid characters';

        return '';
    };

    const validateLocation = (value, fieldName) => {
        if (!value) return `${fieldName} is required`;
        if (value.trim() === '') return `${fieldName} cannot be just spaces`;
        return '';
    };

    // Handle form changes with validation
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Real-time validation
        if (name === 'organizationName') {
            setValidationErrors(prev => ({
                ...prev,
                organizationName: validateName(value)
            }));
        }
        else if (name === 'contactNumber') {
            setValidationErrors(prev => ({
                ...prev,
                contactNumber: validatePhone(value)
            }));
        }
        else if (name === 'city') {
            setValidationErrors(prev => ({
                ...prev,
                city: validateLocation(value, 'City')
            }));
        }
        else if (name === 'province') {
            setValidationErrors(prev => ({
                ...prev,
                province: validateLocation(value, 'Province')
            }));
        }
    };

    // Enhanced file selection handler
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Only accept images
            if (!file.type.startsWith('image/')) {
                setValidationErrors(prev => ({
                    ...prev,
                    profileImage: 'Please select an image file'
                }));
                // Reset the file input
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            // File size validation (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                setValidationErrors(prev => ({
                    ...prev,
                    profileImage: `Image size (${fileSizeMB}MB) exceeds the 5MB limit`
                }));

                // Reset the file input
                if (fileInputRef.current) fileInputRef.current.value = '';

                // Alert for immediate feedback
                alert(`The selected image (${fileSizeMB}MB) is too large. Please select an image under 5MB.`);
                return;
            }

            // Clear any previous validation error
            setValidationErrors(prev => ({
                ...prev,
                profileImage: ''
            }));

            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(''); // Clear any general errors
        }
    };

    // Check if the form is valid before submission
    const isFormValid = () => {
        const orgNameError = organization?.isVerified ? '' : validateName(formData.organizationName);
        const phoneError = validatePhone(formData.contactNumber);
        const cityError = validateLocation(formData.city, 'City');
        const provinceError = validateLocation(formData.province, 'Province');

        // Update all validation errors
        setValidationErrors({
            organizationName: orgNameError,
            contactNumber: phoneError,
            city: cityError,
            province: provinceError,
            profileImage: validationErrors.profileImage // Keep existing image error if any
        });

        return !orgNameError && !phoneError && !cityError &&
            !provinceError && !validationErrors.profileImage;
    };

    // Input styling based on validation
    const getInputClassName = (fieldName) => {
        const baseClasses = "w-full p-2 border rounded";

        if (!formData[fieldName]) return baseClasses;

        return validationErrors[fieldName]
            ? `${baseClasses} border-red-500`
            : `${baseClasses} border-green-500`;
    };

    // Enhanced form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate all fields before submission
        if (!isFormValid()) {
            setError('Please fix the validation errors before submitting');
            return;
        }

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

    // Create a wrapper for onClose that resets data first
    const handleClose = () => {
        resetFormData();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70 p-4">
            <div ref={modalRef} className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Manage Account</h2>
                        <button
                            onClick={handleClose} // Use the new wrapper
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
                            <div className="flex items-center">
                                <div className="relative w-24 h-24 bg-gray-200 rounded-full overflow-hidden mr-4">
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
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
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
                                        Max size: 5MB (JPEG, PNG).<br />Large files may be automatically rejected.
                                    </p>
                                    {validationErrors.profileImage && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.profileImage}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">
                                Organization/Shelter Name
                                {organization?.isVerified && (
                                    <span className="ml-2 text-xs text-teal-600 font-normal">
                                        (Verified accounts cannot change their name)
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                required
                                disabled={organization?.isVerified}
                                className={`${getInputClassName('organizationName')} ${organization?.isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                            />
                            {validationErrors.organizationName && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.organizationName}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Contact Number</label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                required
                                placeholder="09XXXXXXXXX"
                                className={getInputClassName('contactNumber')}
                            />
                            {validationErrors.contactNumber && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.contactNumber}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Must be 11 digits starting with 0 (e.g., 09123456789)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block mb-2 font-medium">City/Municipality</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className={getInputClassName('city')}
                                />
                                {validationErrors.city && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">Province</label>
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    required
                                    className={getInputClassName('province')}
                                />
                                {validationErrors.province && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.province}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={handleClose} // Use the new wrapper
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || Object.values(validationErrors).some(error => error !== '')}
                                className={`px-4 py-2 text-white rounded ${isSubmitting || Object.values(validationErrors).some(error => error !== '')
                                    ? 'bg-teal-400 cursor-not-allowed'
                                    : 'bg-teal-600 hover:bg-teal-700'
                                    }`}
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