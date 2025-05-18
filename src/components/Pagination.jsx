'use client';

import React from 'react';

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = ''
}) {
    // Calculate which page numbers to show with ellipsis as needed
    const getPageRange = () => {
        const range = [];

        if (totalPages <= 5) {
            // If 5 or fewer pages, show all pages
            for (let i = 1; i <= totalPages; i++) {
                range.push(i);
            }
        } else {
            // Always show first page
            range.push(1);

            // Calculate middle range
            if (currentPage <= 3) {
                // If near the start, show pages 2, 3, 4, then ellipsis
                range.push(2, 3, 4);
                range.push('...');
            } else if (currentPage >= totalPages - 2) {
                // If near the end, show ellipsis, then last 3 pages before the final page
                range.push('...');
                range.push(totalPages - 3, totalPages - 2, totalPages - 1);
            } else {
                // In the middle, show ellipsis, current page and surrounding pages, then ellipsis
                range.push('...');
                range.push(currentPage - 1, currentPage, currentPage + 1);
                range.push('...');
            }

            // Always show last page
            if (totalPages > 1) range.push(totalPages);
        }

        return range;
    };

    if (totalPages <= 1) return null;

    return (
        <div className={`flex items-center justify-center space-x-2 my-8 ${className}`}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-md text-sm ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-teal-50 hover:border-teal-300'
                    }`}
            >
                Previous
            </button>

            {getPageRange().map((page, index) =>
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2.5 py-1.5 text-gray-500">
                        ...
                    </span>
                ) : (
                    <button
                        key={`page-${page}`}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-md ${page === currentPage
                                ? 'bg-teal-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-teal-50 hover:border-teal-300'
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1.5 rounded-md text-sm ${currentPage >= totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-teal-50 hover:border-teal-300'
                    }`}
            >
                Next
            </button>
        </div>
    );
}