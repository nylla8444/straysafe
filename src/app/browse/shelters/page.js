'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import SearchBar from '../../../components/SearchBar';
import ShelterCardSkeleton from '../../../components/ShelterCardSkeleton';
import Pagination from '../../../components/Pagination';
import { Suspense } from 'react';

function SheltersPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get initial parameters from URL
    const initialPage = parseInt(searchParams.get('page') || '1', 10);
    const initialSearchTerm = searchParams.get('search') || '';

    const [shelters, setShelters] = useState([]);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalShelters, setTotalShelters] = useState(0);
    const sheltersPerPage = 20; // Match API default

    const searchBarRef = useRef(null);
    // URL tracking ref to prevent infinite loops
    const prevUrlRef = useRef('');

    // Fetch shelters when search term or page changes
    useEffect(() => {
        // Create current URL parameters for comparison
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.set('search', searchTerm);
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', sheltersPerPage.toString());

        const currentUrl = queryParams.toString();

        // Only fetch if URL parameters have actually changed
        if (prevUrlRef.current === currentUrl) {
            return; // Skip fetch if URL hasn't changed
        }

        // Update the previous URL ref
        prevUrlRef.current = currentUrl;

        const fetchShelters = async () => {
            try {
                setLoading(true);
                const endpoint = `/api/organizations?${currentUrl}`;
                const response = await axios.get(endpoint);

                if (response.data.success) {
                    setShelters(response.data.organizations);
                    setTotalPages(response.data.pagination.pages);
                    setTotalShelters(response.data.pagination.total);
                }
            } catch (err) {
                console.error('Failed to fetch shelters:', err);
                setError('Unable to load shelters. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchShelters();
    }, [searchTerm, currentPage, sheltersPerPage]);

    // Handle search functionality
    const handleSearch = (term) => {
        // Don't update URL if the search term hasn't changed
        if (term === searchTerm) return;

        // Update search term state
        setSearchTerm(term);

        // Reset to page 1 when searching
        setCurrentPage(1);

        // Update URL with search parameter
        const params = new URLSearchParams(searchParams.toString());

        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }

        // Always reset to page 1 when searching
        params.set('page', '1');

        // Update URL without page refresh and prevent state update loops
        const newUrl = `/browse/shelters?${params.toString()}`;
        if (window.location.pathname + window.location.search !== newUrl) {
            router.push(newUrl, { scroll: false });
        }
    };

    // Handle clearing the search
    const handleClearSearch = () => {
        // Use the searchBarRef to clear the search input
        if (searchBarRef.current) {
            searchBarRef.current.clear();
        }

        // Update search term state
        setSearchTerm('');

        // Reset to page 1
        setCurrentPage(1);

        // Update URL to remove search parameter
        const params = new URLSearchParams(searchParams.toString());
        params.delete('search');
        params.set('page', '1');

        // Update URL without page refresh
        router.push(`/browse/shelters?${params.toString()}`, { scroll: false });
    };

    // Handle page changes
    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());

        // Update URL
        router.push(`/browse/shelters?${params.toString()}`, { scroll: false });

        // Update state
        setCurrentPage(newPage);

        // Scroll to top when changing pages
        window.scrollTo(0, 0);
    };

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Browse Shelters</h1>
            <p className="text-gray-600 mb-6">Find animal shelters and rescue organizations.</p>

            {/* Search bar */}
            <div className="mb-6">
                <SearchBar
                    ref={searchBarRef}
                    placeholder="Search shelters by name or location..."
                    onSearch={handleSearch}
                    className="max-w-2xl"
                    onClear={() => console.log("Search cleared from SearchBar component")}
                />
            </div>

            {/* Apply skeleton loading here */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(6).fill().map((_, index) => (
                        <ShelterCardSkeleton key={index} />
                    ))}
                </div>
            ) : shelters.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">
                        {searchTerm ? 'No shelters match your search criteria.' : 'No shelters available at the moment.'}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className="mt-4 px-4 py-2 text-sm font-medium text-teal-600 border border-teal-600 rounded hover:bg-teal-50"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {shelters.map(shelter => (
                            <div key={shelter._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl border border-gray-100">
                                <div>
                                    {/* Color banner with optional pattern */}
                                    <div className="h-12 bg-gradient-to-r from-teal-500 to-emerald-400 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10">
                                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <path d="M0,0 L100,0 L100,5 C60,20 40,20 0,5 Z" fill="white" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-center">
                                            {/* Improved organization logo with elevation */}
                                            <div className="relative -mt-12 w-20 h-20 rounded-lg shadow-md overflow-hidden bg-white p-1 border border-gray-100">
                                                <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-100">
                                                    {shelter.profileImage ? (
                                                        <Image
                                                            src={shelter.profileImage}
                                                            alt={shelter.organizationName}
                                                            fill
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600 text-2xl font-bold">
                                                            {shelter.organizationName?.charAt(0).toUpperCase() || 'O'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Organization name and verification badge */}
                                            <div className="ml-4">
                                                <div className="flex items-center">

                                                    <div className="relative group/tooltip">
                                                        <h3 className="font-bold text-lg text-gray-800">
                                                            {(() => {

                                                                // Get a plain text version first
                                                                const plainText = shelter.organizationName
                                                                    .normalize("NFKD")  // Decompose characters to standard form
                                                                    .replace(/[^\x00-\x7F]/g, "") // Remove any remaining non-ASCII chars
                                                                    || shelter.organizationName;  // Fallback to original if completely stripped

                                                                // testing: Ginno's Drug Cartel (19, including space)
                                                                return plainText.length > 18
                                                                    ? plainText.split(/\s+/).map(word => word[0] || '').join('').toUpperCase()
                                                                    : plainText;
                                                            })()}
                                                        </h3>

                                                        {shelter.organizationName.length > 18 && (
                                                            <div className="absolute opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 
                                                            left-0 top-full mt-1 z-50 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-md
                                                            px-2.5 py-1.5 shadow-lg pointer-events-none w-52 whitespace-normal max-w-md">
                                                                {shelter.organizationName
                                                                    .normalize("NFKD")
                                                                    .replace(/[^\x00-\x7F]/g, "")
                                                                    || shelter.organizationName}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {shelter.isVerified && (
                                                        <span className="ml-2">
                                                            <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-sm">
                                                    {shelter.location || (shelter.city && shelter.province ? `${shelter.city}, ${shelter.province}` : 'Location not specified')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Additional organization info */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center text-gray-600 flex-wrap">
                                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    Shelter | Organization
                                                </div>
                                                <span className="text-teal-600 font-medium hover:text-teal-800 hover:underline">
                                                    <Link href={`/browse/shelters/${shelter._id}`}>
                                                        View Details
                                                    </Link>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination section */}
                    <div className="mt-8 mb-20 sm:mb-0">
                        <div className="text-center text-sm text-gray-600 mb-2">
                            Showing page {currentPage} of {totalPages} ({totalShelters} total shelters)
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

// Main page component with Suspense boundary
export default function SheltersPage() {
    return (
        <Suspense fallback={
            <div className="p-4">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(8).fill().map((_, index) => (
                        <ShelterCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        }>
            <SheltersPageContent />
        </Suspense>
    );
}