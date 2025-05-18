'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrowseLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [floatingMenuOpen, setFloatingMenuOpen] = useState(false);
    const pathname = usePathname();
    const sidebarRef = useRef(null);
    const router = useRouter();

    // Check if we're on a specific pet page (has more than 2 segments in path)
    const isSpecificPetPage = pathname.split('/').filter(Boolean).length > 2 && pathname.includes('/browse/pets/');

    // Animation variants for the circle button
    const circleButtonVariants = {
        open: {
            rotate: 45,
            backgroundColor: "rgb(0, 212, 146)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.2 }
        },
        closed: {
            rotate: 0,
            backgroundColor: "rgb(0, 187, 167)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.2 }
        }
    };


    // Auto-open sidebar on larger screens
    useEffect(() => {
        const handleResize = () => {
            // Only auto-close when going to mobile, never auto-open
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on path change
    useEffect(() => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
            setFloatingMenuOpen(false);
        }
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
            {/* Desktop sidebar - only show if not on specific pet page and on medium screens and up */}
            {!isSpecificPetPage && (
                <div className="hidden md:block relative w-12 bg-white shadow-md z-50">
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
                            <ul>
                                <li>
                                    <Link
                                        href="/browse/pets"
                                        className={`flex items-center px-2 py-4 md:p-4 ${pathname === '/browse' || pathname.includes('/browse/pets')
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 18c-1.1 0-2-.9-2-2 0 0-2-6-2-7 0-1.1.9-2 2-2s2 .9 2 2c0 1-2 7-2 7 0 1.1.9 2 2 2zm-5-6c-1.1 0-2-.9-2-2 0 0-2-4-2-5 0-1.1.9-2 2-2s2 .9 2 2c0 1-2 5-2 5 0 1.1.9 2 2 2z" />
                                        </svg>
                                        {sidebarOpen && <span className="ml-3">Pets</span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/browse/shelters"
                                        className={`flex items-center px-2 py-4 md:p-4 ${pathname.includes('/browse/shelters') ? 'bg-orange-100 text-orange-600' : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            <div className={`flex-1 p-4 sm:p-6 bg-amber-50 ${isSpecificPetPage ? 'w-full' : ''}`}>
                {children}
            </div>

            {/* Floating Circle Navigation Menu - Mobile Only */}
            {!isSpecificPetPage && (
                <div className="md:hidden">
                    {/* Floating menu items - Visible only when menu is open */}
                    <AnimatePresence>
                        {floatingMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-teal-500/30 z-30"
                                onClick={() => setFloatingMenuOpen(false)}
                            >
                                {/* Menu items in compact layout for mobile */}
                                <div className="absolute bottom-28 left-0 right-0 flex items-center justify-center">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="grid grid-cols-2 gap-4 p-4"
                                    >
                                        {/* Pets button */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1 }}
                                            onClick={() => {
                                                router.push('/browse/pets');
                                                setFloatingMenuOpen(false);
                                            }}
                                            className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl shadow-md cursor-pointer
                                                ${pathname === '/browse' || pathname.includes('/browse/pets')
                                                    ? 'bg-teal-500 text-white'
                                                    : 'bg-white text-teal-600'
                                                }`}
                                        >
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 18c-1.1 0-2-.9-2-2 0 0-2-6-2-7 0-1.1.9-2 2-2s2 .9 2 2c0 1-2 7-2 7 0 1.1.9 2 2 2zm-5-6c-1.1 0-2-.9-2-2 0 0-2-4-2-5 0-1.1.9-2 2-2s2 .9 2 2c0 1-2 5-2 5 0 1.1.9 2 2 2z" />
                                            </svg>
                                            <span className="mt-1 text-xs font-medium">Pets</span>
                                        </motion.div>

                                        {/* Shelters button */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                            onClick={() => {
                                                router.push('/browse/shelters');
                                                setFloatingMenuOpen(false);
                                            }}
                                            className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl shadow-md cursor-pointer
                                                ${pathname.includes('/browse/shelters')
                                                    ? 'bg-teal-500 text-white'
                                                    : 'bg-white text-teal-600'
                                                }`}
                                        >
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <span className="mt-1 text-xs font-medium">Shelters</span>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main floating button that toggles the menu */}
                    <motion.button
                        variants={circleButtonVariants}
                        initial="closed"
                        animate={floatingMenuOpen ? "open" : "closed"}
                        onClick={() => setFloatingMenuOpen(!floatingMenuOpen)}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center z-50"
                    >
                        <div className="relative w-7 h-7">
                            {/* Hamburger icon */}
                            <motion.svg
                                className="absolute inset-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: floatingMenuOpen ? 0 : 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </motion.svg>

                            {/* X icon */}
                            <motion.svg
                                className="absolute inset-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: floatingMenuOpen ? 1 : 0, rotate: floatingMenuOpen ? 0 : -90 }}
                                transition={{ duration: 0.2 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </motion.svg>
                        </div>
                    </motion.button>
                </div>
            )}
        </div>
    );
}