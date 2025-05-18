'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

export default function RescueCaseModal({ isOpen, onClose, onSave, rescueCase, title, animalTypes }) {
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        animalType: animalTypes[0]?.value || 'dog',
        status: 'ongoing',
        rescueDate: format(new Date(), 'yyyy-MM-dd'),
        medicalDetails: '',
        outcome: '',
    });

    // Images state
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

    // Validation state
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize with existing data for edit mode
    useEffect(() => {
        if (rescueCase) {
            setFormData({
                title: rescueCase.title || '',
                description: rescueCase.description || '',
                location: rescueCase.location || '',
                animalType: rescueCase.animalType || animalTypes[0]?.value || 'dog',
                status: rescueCase.status || 'ongoing',
                rescueDate: rescueCase.rescueDate ? format(new Date(rescueCase.rescueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                medicalDetails: rescueCase.medicalDetails || '',
                outcome: rescueCase.outcome || '',
            });

            if (rescueCase.images && rescueCase.images.length > 0) {
                setExistingImages(rescueCase.images);
            }
        }
    }, [rescueCase, animalTypes]);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...files]);

            // Create preview URLs for the new images
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    // Remove an existing image
    const handleRemoveExistingImage = (index) => {
        const imageUrl = existingImages[index];
        setRemovedImages(prev => [...prev, imageUrl]);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    // Remove a new image
    const handleRemoveNewImage = (index) => {
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviewUrls[index]);

        setNewImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }

        if (!formData.animalType) {
            newErrors.animalType = 'Animal type is required';
        }

        if (!formData.rescueDate) {
            newErrors.rescueDate = 'Rescue date is required';
        }

        // If status is completed, outcome should be provided
        if (formData.status === 'completed' && !formData.outcome.trim()) {
            newErrors.outcome = 'Please provide an outcome for completed rescue cases';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Create form data object for API submission
            const formDataForApi = new FormData();

            // Add form fields
            formDataForApi.append('title', formData.title);
            formDataForApi.append('description', formData.description);
            formDataForApi.append('location', formData.location);
            formDataForApi.append('animalType', formData.animalType);
            formDataForApi.append('status', formData.status);
            formDataForApi.append('rescueDate', formData.rescueDate);

            if (formData.medicalDetails) {
                formDataForApi.append('medicalDetails', formData.medicalDetails);
            }

            if (formData.outcome) {
                formDataForApi.append('outcome', formData.outcome);
            }

            // For edit mode, add the case ID
            if (rescueCase) {
                formDataForApi.append('id', rescueCase._id);
            }

            // Add new images
            if (newImages.length > 0) {
                newImages.forEach(image => {
                    formDataForApi.append('newImages', image);
                });
            }

            // Add removed images
            if (removedImages.length > 0) {
                formDataForApi.append('removedImages', JSON.stringify(removedImages));
            }

            // Call the onSave function from parent
            await onSave(rescueCase ? {
                id: rescueCase._id,
                ...formData,
                newImages: newImages.length > 0 ? formDataForApi : [],
                removedImages
            } : formData);

            // Close the modal
            onClose();
        } catch (error) {
            console.error('Error saving rescue case:', error);
            setErrors(prev => ({ ...prev, submit: 'Failed to save rescue case. Please try again.' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close modal handler
    const handleClose = () => {
        // Clean up image preview URLs to prevent memory leaks
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));

        // Reset form state
        setFormData({
            title: '',
            description: '',
            location: '',
            animalType: animalTypes[0]?.value || 'dog',
            status: 'ongoing',
            rescueDate: format(new Date(), 'yyyy-MM-dd'),
            medicalDetails: '',
            outcome: '',
        });
        setExistingImages([]);
        setNewImages([]);
        setRemovedImages([]);
        setImagePreviewUrls([]);
        setErrors({});

        // Call parent onClose
        onClose();
    };

    // Prevent interaction with background when modal is open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                            {errors.submit}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="e.g., Injured Stray Dog Rescue"
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Provide details about the rescue case"
                                required
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        </div>

                        {/* Two columns for location and animal type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Main St., Barangay 123"
                                    required
                                />
                                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                            </div>

                            {/* Animal Type */}
                            <div>
                                <label htmlFor="animalType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Animal Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="animalType"
                                    name="animalType"
                                    value={formData.animalType}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md ${errors.animalType ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                >
                                    {animalTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.animalType && <p className="mt-1 text-sm text-red-500">{errors.animalType}</p>}
                            </div>
                        </div>

                        {/* Two columns for status and date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Rescue Date */}
                            <div>
                                <label htmlFor="rescueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Rescue Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="rescueDate"
                                    name="rescueDate"
                                    value={formData.rescueDate}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md ${errors.rescueDate ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                />
                                {errors.rescueDate && <p className="mt-1 text-sm text-red-500">{errors.rescueDate}</p>}
                            </div>
                        </div>

                        {/* Medical Details */}
                        <div>
                            <label htmlFor="medicalDetails" className="block text-sm font-medium text-gray-700 mb-1">
                                Medical Details <span className="text-gray-500 font-normal">(optional)</span>
                            </label>
                            <textarea
                                id="medicalDetails"
                                name="medicalDetails"
                                value={formData.medicalDetails}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Provide any medical details or observations"
                            />
                        </div>

                        {/* Outcome - Show conditionally if status is 'completed' */}
                        {formData.status === 'completed' && (
                            <div>
                                <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
                                    Outcome <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="outcome"
                                    name="outcome"
                                    value={formData.outcome}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md ${errors.outcome ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Describe the outcome of this rescue case"
                                    required={formData.status === 'completed'}
                                />
                                {errors.outcome && <p className="mt-1 text-sm text-red-500">{errors.outcome}</p>}
                            </div>
                        )}

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Images <span className="text-gray-500 font-normal">(optional)</span>
                            </label>

                            {/* Image upload button */}
                            <div className="mb-3">
                                <label htmlFor="images" className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md inline-flex items-center text-gray-700 hover:bg-gray-50">
                                    <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Images
                                </label>
                                <input
                                    type="file"
                                    id="images"
                                    name="images"
                                    onChange={handleImageChange}
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                />
                                <span className="ml-2 text-sm text-gray-500">You can select multiple images</span>
                            </div>

                            {/* Image previews container */}
                            {(existingImages.length > 0 || imagePreviewUrls.length > 0) && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                    {/* Existing images */}
                                    {existingImages.map((imageUrl, index) => (
                                        <div key={`existing-${index}`} className="relative border rounded-md overflow-hidden h-32">
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={imageUrl}
                                                    alt={`Existing rescue case image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(index)}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                                title="Remove image"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                    {/* New image previews */}
                                    {imagePreviewUrls.map((previewUrl, index) => (
                                        <div key={`new-${index}`} className="relative border rounded-md overflow-hidden h-32">
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={previewUrl}
                                                    alt={`New rescue case image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="absolute top-2 left-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                                                New
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewImage(index)}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                                title="Remove image"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Form buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isSubmitting ? 'Saving...' : 'Save Rescue Case'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}