'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function BrowseLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const sidebarRef = useRef(null);
    const router = useRouter();

    // Check if we're on a specific pet page (has more than 2 segments in path)
    const isSpecificPetPage = pathname.split('/').filter(Boolean).length > 2 && pathname.includes('/browse/pets/');

    // Auto-close sidebar on smaller screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };

        // Check on initial load
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on path change
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Close sidebar when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar - only show if not on specific pet page */}
            {!isSpecificPetPage && (
                <div className="relative w-12 bg-white shadow-md z-50">
                    <div
                        ref={sidebarRef}
                        className={`
                        absolute top-0 left-0 h-full bg-white shadow-md
                        transition-all duration-300 ease-in-out
                        ${sidebarOpen ? 'w-64' : 'w-12'}
                        z-50
                    `}>
                        <div className="px-2 py-4 md:p-4 flex justify-between items-center">
                            <h2 className={`font-semibold ${sidebarOpen ? 'block' : 'hidden'}`}>Browse</h2>
                            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    {sidebarOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    )}
                                </svg>
                            </button>
                        </div>
                        <nav className="mt-5">
                            {/* Existing nav items */}
                            <ul>
                                <li>
                                    <Link
                                        href="/browse/pets"
                                        className={`flex items-center px-2 py-4 md:p-4  ${pathname === '/browse' || pathname.includes('/browse/pets')
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 18c-1.1 0-2-.9-2-2 0 0-2-6-2-7 0-1.1.9-2 2-2s2 .9 2 2c0 1-2 7-2 7 0 1.1.9 2 2 2zm-5-6c-1.1 0-2-.9-2-2 0 0-2-4-2-5 0-1.1.9-2 2-2s2 .9 2 2c0 1-2 5-2 5 0 1.1.9 2 2 2z" />
                                        </svg>
                                        {sidebarOpen && <span className="ml-3">Pets</span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/browse/shelters"
                                        className={`flex items-center px-2 py-4 md:p-4  ${pathname.includes('/browse/shelters') ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {sidebarOpen && <span className="ml-3">Shelters</span>}
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main content - adjust padding based on sidebar visibility */}
            <div className={`flex-1 p-6 bg-gray-50 ${isSpecificPetPage ? 'w-full' : ''}`}>
                {children}
            </div>
        </div>
    );
}