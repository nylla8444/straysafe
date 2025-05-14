import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function EditProfileModal({ user, isOpen, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
        city: '',         // Changed from location to city
        province: '',     // Added new province field
        profileImage: '',
    });
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
        city: '',         // Changed from location to city
        province: ''      // Added new province field
    });
    const fileInputRef = useRef(null);

    // Initialize form with user data when modal opens
    useEffect(() => {
        if (user) {
            // Handle parsing the existing location if it's in "City, Province" format
            let city = '';
            let province = '';

            if (user.location) {
                const locationParts = user.location.split(',');
                if (locationParts.length >= 2) {
                    city = locationParts[0].trim();
                    province = locationParts[1].trim();
                } else {
                    // If not in expected format, just use the whole thing as city
                    city = user.location;
                }
            }

            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                contactNumber: user.contactNumber || '',
                city: user.city || city,
                province: user.province || province,
                profileImage: user.profileImage || '',
            });
            setPreviewUrl(user.profileImage || '');

            // Reset validation errors when modal opens
            setValidationErrors({
                firstName: '',
                lastName: '',
                contactNumber: '',
                city: '',
                province: ''
            });
        }
    }, [user, isOpen]);

    // Validation functions
    const validateName = (name, fieldName) => {
        if (!name) return `${fieldName} is required`;
        if (name.trim() === '') return `${fieldName} cannot be just spaces`;
        return '';
    };

    const validatePhone = (phone) => {
        if (!phone) return ''; // Phone can be optional

        const digits = phone.replace(/\D/g, '');
        if (digits.length !== 11) return 'Contact number must contain exactly 11 digits';
        if (digits[0] !== '0') return 'Contact number must start with 0';
        if (!/^[0-9+\-\s()]+$/.test(phone)) return 'Contact number contains invalid characters';

        return '';
    };

    const validateLocation = (value, fieldName) => {
        if (!value) return ''; // Fields can be optional
        if (value.trim() === '') return `${fieldName} cannot be just spaces`;
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time validation
        if (name === 'firstName') {
            setValidationErrors(prev => ({
                ...prev,
                firstName: validateName(value, 'First name')
            }));
        }
        else if (name === 'lastName') {
            setValidationErrors(prev => ({
                ...prev,
                lastName: validateName(value, 'Last name')
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size validation - already checking for 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            // Clear the file input so users can try again
            fileInputRef.current.value = '';

            // Set error message with more specific details
            setError(`Image size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 5MB limit. Please select a smaller file.`);

            // Show alert for immediate feedback
            alert("The selected image is too large (maximum size: 5MB). Please choose a smaller image.");
            return;
        }

        // Format validation
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            // Clear the file input
            fileInputRef.current.value = '';
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

    const isFormValid = () => {
        const firstNameError = validateName(formData.firstName, 'First name');
        const lastNameError = validateName(formData.lastName, 'Last name');
        const contactNumberError = validatePhone(formData.contactNumber);
        const cityError = validateLocation(formData.city, 'City');
        const provinceError = validateLocation(formData.province, 'Province');

        // Update all validation errors
        setValidationErrors({
            firstName: firstNameError,
            lastName: lastNameError,
            contactNumber: contactNumberError,
            city: cityError,
            province: provinceError
        });

        return !firstNameError && !lastNameError &&
            !contactNumberError && !cityError && !provinceError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Check form validity before submission
        if (!isFormValid()) {
            setError('Please fix the validation errors before submitting');
            return;
        }

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

            // Construct location from city and province for backward compatibility
            if (formData.city || formData.province) {
                const location = [
                    formData.city,
                    formData.province
                ].filter(Boolean).join(', ');

                submitData.append('location', location);
            }

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
                onClose();
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

    // Input styling based on validation
    const getInputClassName = (fieldName) => {
        const baseClasses = "w-full px-3 py-2 border rounded focus:outline-none";

        // If field is empty, use neutral styling
        if (!formData[fieldName]) {
            return `${baseClasses} border-gray-300 focus:border-teal-500`;
        }

        // If there's a validation error, use red styling, otherwise green
        return validationErrors[fieldName]
            ? `${baseClasses} border-red-500 focus:border-red-500`
            : `${baseClasses} border-green-500 focus:border-green-500`;
    };

    // helper function to check if there are any validation errors
    const hasValidationErrors = () => {
        return Object.values(validationErrors).some(error => error !== '');
    };

    // If modal is closed, don't render
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70 p-4">
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

                    {error && error.includes('MB') && (
                        <div className="mb-4 p-3 bg-orange-100 border-l-4 border-orange-500 text-orange-700 rounded flex items-center">
                            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
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
                                        Max size: 5MB (JPEG, PNG).<br />Large files may be automatically rejected.
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
                                    className={getInputClassName('firstName')}
                                    required
                                />
                                {validationErrors.firstName && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                                )}
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
                                    className={getInputClassName('lastName')}
                                    required
                                />
                                {validationErrors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                                )}
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
                                className={getInputClassName('contactNumber')}
                                placeholder="09XXXXXXXXX"
                            />
                            {validationErrors.contactNumber && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.contactNumber}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Must be 11 digits starting with 0 (e.g., 09123456789)
                            </p>
                        </div>

                        {/* Location - now split into city and province */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-gray-700 mb-2" htmlFor="city">
                                    City/Municipality
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className={getInputClassName('city')}
                                    placeholder="Manila"
                                />
                                {validationErrors.city && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2" htmlFor="province">
                                    Province
                                </label>
                                <input
                                    type="text"
                                    id="province"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    className={getInputClassName('province')}
                                    placeholder="Metro Manila"
                                />
                                {validationErrors.province && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.province}</p>
                                )}
                            </div>
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
                                className={`px-4 py-2 rounded ${isSubmitting || hasValidationErrors()
                                    ? 'bg-teal-400 cursor-not-allowed text-white'
                                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                                    }`}
                                disabled={isSubmitting || hasValidationErrors()}
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