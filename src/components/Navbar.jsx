'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { admin, isAuthenticated: isAdminAuthenticated, adminLogout } = useAdminAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const pathname = usePathname();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Close menu on path change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Animation variants
    const menuVariants = {
        hidden: {
            opacity: 0,
            x: "100%"
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        },
        exit: {
            opacity: 0,
            x: "100%",
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    // Prevent body scrolling when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [menuOpen]);

    return (
        <nav className="bg-blue-600 text-white p-4 relative z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold">
                        StraySpot
                    </Link>
                </div>

                <div className="md:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none relative z-50"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            )}
                        </svg>
                    </button>
                </div>

                {/* Desktop menu items */}
                <div className="hidden md:flex space-x-6">
                    {/* Existing desktop menu */}
                    <Link href="/" className="hover:text-blue-100">Home</Link>
                    <Link href="/about" className="hover:text-blue-100">About</Link>
                    <Link href="/browse" className="hover:text-blue-100">Browse</Link>

                    {/* Admin-specific navigation */}
                    {isAdminAuthenticated && (
                        <Link href="/admin/dashboard" className="hover:text-blue-100">Admin Dashboard</Link>
                    )}

                    {/* Regular user navigation */}
                    {isAuthenticated && !isAdminAuthenticated && (
                        <>
                            {user?.userType === 'adopter' && (
                                <Link href="/profile" className="hover:text-blue-100">My Profile</Link>
                            )}
                            {user?.userType === 'organization' && (
                                <Link href="/organization" className="hover:text-blue-100">Organization Dashboard</Link>
                            )}
                        </>
                    )}

                    {/* Authentication buttons */}
                    {isAuthenticated || isAdminAuthenticated ? (
                        <button
                            onClick={isAdminAuthenticated ? adminLogout : logout}
                            className="hover:text-blue-100"
                        >
                            {isAdminAuthenticated ? 'Admin Logout' : 'Logout'}
                        </button>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-blue-100">Login</Link>
                            <Link href="/register" className="hover:text-blue-100">Register</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile menu overlay with animations */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        {/* Backdrop/overlay */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-40"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={backdropVariants}
                        />

                        {/* Menu panel */}
                        <motion.div
                            ref={menuRef}
                            className="fixed top-0 right-0 h-full w-45 bg-blue-700 shadow-lg z-50 p-6 pt-16 md:hidden"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={menuVariants}
                        >
                            {/* Add close button at the top */}
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors duration-200"
                                aria-label="Close menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="flex flex-col space-y-4">
                                <Link href="/" className="text-white hover:text-blue-100 text-lg">Home</Link>
                                <Link href="/about" className="text-white hover:text-blue-100 text-lg">About</Link>
                                <Link href="/browse" className="text-white hover:text-blue-100 text-lg">Browse</Link>

                                {/* Admin-specific navigation - mobile */}
                                {isAdminAuthenticated && (
                                    <Link href="/admin/dashboard" className="text-white hover:text-blue-100 text-lg">Admin Dashboard</Link>
                                )}

                                {/* Regular user navigation - mobile */}
                                {isAuthenticated && !isAdminAuthenticated && (
                                    <>
                                        {user?.userType === 'adopter' && (
                                            <Link href="/profile" className="text-white hover:text-blue-100 text-lg">My Profile</Link>
                                        )}
                                        {user?.userType === 'organization' && (
                                            <Link href="/organization" className="text-white hover:text-blue-100 text-lg">Organization Dashboard</Link>
                                        )}
                                    </>
                                )}

                                {/* Authentication buttons - mobile */}
                                {isAuthenticated || isAdminAuthenticated ? (
                                    <button
                                        onClick={isAdminAuthenticated ? adminLogout : logout}
                                        className="text-white hover:text-blue-100 text-lg text-left"
                                    >
                                        {isAdminAuthenticated ? 'Admin Logout' : 'Logout'}
                                    </button>
                                ) : (
                                    <>
                                        <Link href="/login" className="text-white hover:text-blue-100 text-lg">Login</Link>
                                        <Link href="/register" className="text-white hover:text-blue-100 text-lg">Register</Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}