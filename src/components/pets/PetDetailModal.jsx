import React, { useState } from 'react';
import Image from 'next/image';

export default function PetDetailModal({ pet, onClose, onEdit }) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    if (!pet) return null;

    const nextImage = () => {
        setActiveImageIndex((prevIndex) =>
            prevIndex === pet.img_arr.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setActiveImageIndex((prevIndex) =>
            prevIndex === 0 ? pet.img_arr.length - 1 : prevIndex - 1
        );
    };

    // Function to handle edit and close together
    const handleEdit = () => {
        onClose(); // Close the modal first
        onEdit(pet); // Then trigger the edit function
    };

    const getStatusBadge = (status) => {
        // Status badge code remains unchanged
        switch (status) {
            case 'available':
                return <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Available</span>;
            case 'rehabilitating':
                return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">Rehabilitating</span>;
            case 'adopted':
                return <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded">Adopted</span>;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-semibold">{pet.name}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-lg overflow-hidden">
                                <Image
                                    src={pet.img_arr[activeImageIndex]}
                                    alt={`${pet.name} image ${activeImageIndex + 1}`}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="rounded-lg"
                                />

                                {pet.img_arr.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            {pet.img_arr.length > 1 && (
                                <div className="flex space-x-2 overflow-x-auto pb-2">
                                    {pet.img_arr.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 ${index === activeImageIndex ? 'ring-2 ring-teal-500' : ''
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${pet.name} thumbnail ${index + 1}`}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pet Information */}
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center">
                                        <h3 className="text-xl font-semibold">{pet.name}</h3>
                                        <div className="ml-2">
                                            {getStatusBadge(pet.status)}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mt-1">
                                        {pet.breed} • {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)} • {pet.specie.charAt(0).toUpperCase() + pet.specie.slice(1)}
                                    </p>
                                </div>
                                <p className="text-green-600 font-medium text-lg">
                                    {pet.adoptionFee > 0 ? `₱${pet.adoptionFee}` : 'Free'}
                                </p>
                            </div>

                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {pet.tags && pet.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                                        >
                                            {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </span>
                                    ))}
                                    {(!pet.tags || pet.tags.length === 0) && (
                                        <span className="text-gray-500 italic">No tags</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <h4 className="font-medium mb-2">About {pet.name}</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {pet.info}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t p-4 flex justify-end">
                    <button
                        onClick={handleEdit} // Use the combined function
                        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                        Edit Pet
                    </button>
                </div>
            </div>
        </div>
    );
}