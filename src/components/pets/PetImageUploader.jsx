import React, { useState } from 'react';
import Image from 'next/image';

// Maximum file size: 5MB in bytes
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function PetImageUploader({ images, onChange, maxImages = 5 }) {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    // Convert bytes to MB for readable error messages
    const formatFileSize = (bytes) => {
        return (bytes / (1024 * 1024)).toFixed(2);
    };

    const handleFiles = (files) => {
        setError(null);

        if (images.length >= maxImages) {
            setError(`Maximum ${maxImages} images allowed`);
            return;
        }

        // Check for file size before processing
        const oversizedFiles = Array.from(files).filter(file => file.size > MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
            const fileNames = oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)}MB)`).join(', ');
            setError(`The following files exceed the 5MB limit: ${fileNames}`);
            return;
        }

        const newFiles = Array.from(files).slice(0, maxImages - images.length);

        const promises = newFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(results => {
            onChange([...images, ...results]);
        });
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
        // Clear error when user removes images
        setError(null);
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed p-6 rounded-md text-center ${error ? "border-red-500 bg-red-50" :
                    dragActive ? "border-teal-500 bg-teal-50" :
                        "border-gray-300"
                    }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    id="pet-image-upload"
                />
                <label htmlFor="pet-image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center">
                        <svg className={`w-10 h-10 ${error ? "text-red-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">Drag and drop images here or click to browse</p>
                        <p className="text-xs text-gray-500 mt-1">Upload at least 1 image (max 5MB each)</p>
                        <p className="text-xs text-gray-500">
                            {images.length} of {maxImages} images added
                        </p>

                        {error && (
                            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>
                </label>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-square w-full relative overflow-hidden rounded-md">
                                <Image
                                    src={img}
                                    alt={`Pet image ${index + 1}`}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="rounded-md"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}