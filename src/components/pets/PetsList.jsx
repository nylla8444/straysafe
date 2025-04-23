import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PetsList({ pets, onEdit, onDelete, onViewDetails, isOrganizationView = false }) {
    if (!pets || pets.length === 0) {
        return (
            <div className="text-center py-8">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No pets found</h3>
                {isOrganizationView && (
                    <p className="mt-1 text-sm text-gray-500">
                        Start by creating your first pet listing.
                    </p>
                )}
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'available':
                return <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">Available</span>;
            case 'rehabilitating':
                return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">Rehabilitating</span>;
            case 'adopted':
                return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">Adopted</span>;
            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map(pet => (
                <div
                    key={pet._id}
                    className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 transition-shadow hover:shadow-md"
                >
                    <div
                        className="cursor-pointer"
                        onClick={() => onViewDetails(pet)}
                    >
                        <div className="relative h-48">
                            <Image
                                src={pet.img_arr[0]}
                                alt={pet.name}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                            <div className="absolute top-2 right-2">
                                {getStatusBadge(pet.status)}
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold">{pet.name}</h3>
                                <p className="text-green-600 font-medium">
                                    {pet.adoptionFee > 0 ? `$${pet.adoptionFee}` : 'Free'}
                                </p>
                            </div>

                            <div className="text-sm text-gray-600 mt-1">
                                <p>
                                    {pet.breed} • {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)} • {pet.specie.charAt(0).toUpperCase() + pet.specie.slice(1)}
                                </p>
                            </div>

                            {pet.tags && pet.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {pet.tags.slice(0, 3).map(tag => (
                                        <span
                                            key={tag}
                                            className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                                        >
                                            {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </span>
                                    ))}
                                    {pet.tags.length > 3 && (
                                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                            +{pet.tags.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                {pet.info}
                            </p>
                        </div>
                    </div>

                    <div className="mt-2 p-4 pt-0 flex justify-between items-center border-t border-gray-100">
                        {isOrganizationView ? (
                            <div className="space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(pet);
                                    }}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(pet._id);
                                    }}
                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails(pet);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View Details
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}