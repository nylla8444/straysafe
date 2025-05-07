import React from 'react';

export default function PetCardSkeleton() {
    return (
        <div className="relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 max-w-[300px] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)]">
            {/* Image placeholder */}
            <div className="relative h-56 overflow-hidden bg-gray-200 animate-pulse"></div>

            {/* Content skeleton */}
            <div className="p-5">
                {/* Pet name skeleton */}
                <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-2 animate-pulse"></div>

                {/* Pet details skeleton */}
                <div className="flex flex-wrap gap-y-2 mb-3">
                    <div className="w-full flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>

                    <div className="w-1/2 flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>

                    <div className="w-1/2 flex items-center">
                        <div className="w-4 h-4 mr-2 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                </div>

                {/* Tags skeleton */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>

                {/* Footer skeleton */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}