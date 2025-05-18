import React, { useState } from 'react';
import axios from 'axios';
import PetImageUploader from './PetImageUploader';

export default function PetForm({ pet, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: pet?.name || '',
        specie: pet?.specie || 'dog',
        gender: pet?.gender || 'unknown',
        breed: pet?.breed || '',
        status: pet?.status || 'rehabilitating',
        tags: pet?.tags || [],
        info: pet?.info || '',
        adoptionFee: pet?.adoptionFee || 0,
        img_arr: pet?.img_arr || []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const specieOptions = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea pig', 'other'];
    const genderOptions = ['male', 'female', 'unknown'];
    const statusOptions = ['rehabilitating', 'available', 'adopted'];
    const tagOptions = [
        'vaccinated', 'neutered', 'house-trained',
        'special-needs', 'kid-friendly', 'senior',
        'good-with-cats', 'good-with-dogs'
    ];

    // Constants for field limits
    const NAME_MAX_LENGTH = 26;
    const BREED_MAX_LENGTH = 26;
    const MAX_ADOPTION_FEE = 99999.99; // 5 digits before decimal point

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for limited text fields
        if (name === 'name' && value.length > NAME_MAX_LENGTH) {
            return; // Prevent updating if exceeds limit
        }

        if (name === 'breed' && value.length > BREED_MAX_LENGTH) {
            return; // Prevent updating if exceeds limit
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;

        // For adoption fee, limit to 5 digits before decimal
        if (name === 'adoptionFee') {
            const numValue = parseFloat(value);
            if (numValue > MAX_ADOPTION_FEE) {
                return; // Don't update if over the limit
            }
        }

        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleTagToggle = (tag) => {
        setFormData(prev => {
            const tags = [...prev.tags];
            if (tags.includes(tag)) {
                return { ...prev, tags: tags.filter(t => t !== tag) };
            } else {
                return { ...prev, tags: [...tags, tag] };
            }
        });
    };

    const handleImagesChange = (images) => {
        setFormData(prev => ({ ...prev, img_arr: images }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form
        if (!formData.name || !formData.breed || !formData.info || formData.img_arr.length < 1) {
            setError('Please fill in all required fields and add at least one image');
            return;
        }

        // Validate field lengths
        if (formData.name.length > NAME_MAX_LENGTH) {
            setError(`Pet name must be ${NAME_MAX_LENGTH} characters or less`);
            return;
        }

        if (formData.breed.length > BREED_MAX_LENGTH) {
            setError(`Pet breed must be ${BREED_MAX_LENGTH} characters or less`);
            return;
        }

        // Validate adoption fee
        if (formData.adoptionFee > MAX_ADOPTION_FEE) {
            setError('Adoption fee exceeds the maximum allowed amount');
            return;
        }

        setIsSubmitting(true);

        try {
            let response;

            // Handle image uploads first if they are data URLs
            const imagesToUpload = formData.img_arr.filter(img => img.startsWith('data:'));
            const existingImages = formData.img_arr.filter(img => !img.startsWith('data:'));

            let uploadedImageUrls = [];

            // Upload any new images
            if (imagesToUpload.length > 0) {
                const uploadPromises = imagesToUpload.map(async (image) => {
                    const formData = new FormData();
                    // Convert data URL to blob
                    const blob = await fetch(image).then(r => r.blob());
                    formData.append('file', blob);

                    const uploadRes = await axios.post('/api/upload', formData);
                    return uploadRes.data.url;
                });

                uploadedImageUrls = await Promise.all(uploadPromises);
            }

            // Combine existing URLs with newly uploaded URLs
            const finalFormData = {
                ...formData,
                img_arr: [...existingImages, ...uploadedImageUrls]
            };

            if (pet?._id) {
                // Update existing pet
                response = await axios.put(`/api/pets/${pet._id}`, finalFormData);
            } else {
                // Create new pet
                response = await axios.post('/api/pets', finalFormData);
            }

            if (response.data.success) {
                onSubmit(response.data.pet);
            }
        } catch (err) {
            console.error('Error saving pet:', err);
            setError(err.response?.data?.error || 'Failed to save pet information');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Pet Name* <span className="text-xs text-gray-500">({formData.name.length}/{NAME_MAX_LENGTH})</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border ${formData.name.length >= NAME_MAX_LENGTH
                                ? 'border-orange-300 bg-orange-50'
                                : 'border-gray-300'
                                } p-2 shadow-sm`}
                            maxLength={NAME_MAX_LENGTH}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 ">Species*</label>
                        <select
                            name="specie"
                            value={formData.specie}
                            onChange={handleChange}
                            className="capitalize mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                            required
                        >
                            {specieOptions.map(option => (
                                <option key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Breed* <span className="text-xs text-gray-500">({formData.breed.length}/{BREED_MAX_LENGTH})</span>
                        </label>
                        <input
                            type="text"
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border ${formData.breed.length >= BREED_MAX_LENGTH
                                ? 'border-orange-300 bg-orange-50'
                                : 'border-gray-300'
                                } p-2 shadow-sm`}
                            maxLength={BREED_MAX_LENGTH}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <div className="mt-1 flex space-x-4">
                            {genderOptions.map(option => (
                                <label key={option} className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={option}
                                        checked={formData.gender === option}
                                        onChange={handleChange}
                                        className="h-4 w-4 border-gray-300 text-teal-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                        >
                            {statusOptions.map(option => (
                                <option key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Adoption Fee ($) <span className="text-xs text-gray-500">(Max: 99,999.99)</span>
                        </label>
                        <input
                            type="number"
                            name="adoptionFee"
                            value={formData.adoptionFee}
                            onChange={handleNumberChange}
                            min="0"
                            max="99999.99"
                            step="0.01"
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {tagOptions.map(tag => (
                                <button
                                    type="button"
                                    key={tag}
                                    onClick={() => handleTagToggle(tag)}
                                    className={`px-3 py-1 text-sm rounded-full ${formData.tags.includes(tag)
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pet Information*</label>
                        <textarea
                            name="info"
                            value={formData.info}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                            required
                            placeholder="Describe the pet's personality, background, and any other relevant information..."
                        ></textarea>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pet Images*</label>
                <PetImageUploader
                    images={formData.img_arr}
                    onChange={handleImagesChange}
                    maxImages={10}
                />
            </div>

            <div className="flex justify-end space-x-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white ${isSubmitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                        }`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : pet?._id ? 'Update Pet' : 'Add Pet'}
                </button>
            </div>
        </form>
    );
}