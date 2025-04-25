'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BrowseLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

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

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar with fixed width - always takes w-16 in the layout */}
            <div className="relative w-16 bg-white shadow-md z-50">
                {/* Overlay expansion that sits on top of content */}
                <div className={`
                    absolute top-0 left-0 h-full bg-white shadow-md
                    transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'w-64' : 'w-16'}
                    z-50
                `}>
                    <div className="p-4 flex justify-between items-center">
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
                        <ul>
                            <li>
                                <Link
                                    href="/browse/pets"
                                    className={`flex items-center p-4 ${pathname === '/browse' || pathname.includes('/browse/pets')
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 18c-1.1 0-2-.9-2-2 0 0-2-6-2-7 0-1.1.9-2 2-2s2 .9 2 2c0 1-2 7-2 7 0 1.1.9 2 2 2zm-5-6c-1.1 0-2-.9-2-2 0 0-2-4-2-5 0-1.1.9-2 2-2s2 .9 2 2c0 1-2 5-2 5 0 1.1.9 2 2 2z" />
                                    </svg>
                                    {sidebarOpen && <span>Pets</span>}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/browse/shelters"
                                    className={`flex items-center p-4 ${pathname.includes('/browse/shelters') ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {sidebarOpen && <span>Shelters</span>}
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 bg-gray-50">
                {children}
            </div>
        </div>
    );
}