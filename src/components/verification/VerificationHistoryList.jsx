import React from 'react';
import { formatDistance } from 'date-fns';

export default function VerificationHistoryList({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center p-4 border rounded bg-gray-50">
                <p className="text-gray-500">No verification history available</p>
            </div>
        );
    }

    function getStatusBadge(status) {
        switch (status) {
            case 'verified':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Verified</span>;
            case 'followup':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">Followup</span>;
            case 'rejected':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
        }
    }

    return (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {history.map((item) => (
                    <li key={item._id}>
                        <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <div className="flex items-center">
                                        <p className="text-sm font-medium text-gray-900">
                                            Status changed from {getStatusBadge(item.previousStatus)} to {getStatusBadge(item.newStatus)}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500">
                                        {item.resubmission ? (
                                            <span className="inline-flex items-center mr-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                Organization Resubmission
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center mr-2 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                Admin Action
                                            </span>
                                        )}
                                        <span>
                                            {formatDistance(new Date(item.timestamp), new Date(), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-5 flex-shrink-0">
                                    {item.admin && (
                                        <span className="text-xs text-gray-500">
                                            By: Admin ID {item.admin.toString().substring(0, 8)}...
                                        </span>
                                    )}
                                </div>
                            </div>
                            {item.notes && (
                                <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                    {item.notes}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}