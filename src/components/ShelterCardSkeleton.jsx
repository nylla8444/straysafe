import React from 'react';

export default function ShelterCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all border border-gray-100 w-full">
            {/* Color banner */}
            <div className="h-12 bg-gray-200 animate-pulse relative overflow-hidden"></div>

            <div className="p-5">
                <div className="flex items-center">
                    {/* Organization logo placeholder */}
                    <div className="relative -mt-12 w-20 h-20 rounded-lg shadow-md overflow-hidden bg-white p-1 border border-gray-100">
                        <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-200 animate-pulse"></div>
                    </div>

                    {/* Organization name and location */}
                    <div className="ml-4">
                        <div className="flex items-center">
                            <div className="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                            <div className="ml-2 w-5 h-5 rounded-full bg-gray-200 animate-pulse"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-md w-24 mt-2 animate-pulse"></div>
                    </div>
                </div>

                {/* Footer section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}