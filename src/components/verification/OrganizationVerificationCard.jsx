import React from 'react';
import Image from 'next/image';

export default function OrganizationVerificationCard({ organization, onVerify, onReject, onFollowup }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Verified</span>;
            case 'followup':
                return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Needs Information</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Rejected</span>;
            default:
                return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                        {organization.profileImage ? (
                            <Image
                                src={organization.profileImage}
                                alt={organization.organizationName}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                {organization.organizationName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{organization.organizationName}</h3>
                        <p className="text-sm text-gray-600">{organization.location}</p>
                    </div>
                </div>
                {getStatusBadge(organization.verificationStatus)}
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{organization.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-medium">{organization.contactNumber}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600">Verification Document</p>
                    <a
                        href={organization.verificationDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                    >
                        View Document
                    </a>
                </div>

                {organization.verificationNotes && (
                    <div className="mb-4 p-3 bg-gray-50 border rounded-md">
                        <p className="text-sm font-medium">Previous Notes</p>
                        <p className="text-sm text-gray-700">{organization.verificationNotes}</p>
                    </div>
                )}

                <div className="mt-4">
                    <textarea
                        className="w-full p-2 border rounded mb-3 text-sm"
                        placeholder="Add notes for organization..."
                        id={`notes-${organization._id}`}
                        rows={3}
                    ></textarea>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onVerify(organization._id, document.getElementById(`notes-${organization._id}`).value)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                            Verify
                        </button>
                        <button
                            onClick={() => onFollowup(organization._id, document.getElementById(`notes-${organization._id}`).value)}
                            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                        >
                            Request More Info
                        </button>
                        <button
                            onClick={() => onReject(organization._id, document.getElementById(`notes-${organization._id}`).value)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}