'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
    const router = useRouter();
    const { user, isAuthenticated, logout, loading, refreshUser } = useAuth();
    const { admin, isAuthenticated: isAdminAuthenticated, adminLogout } = useAdminAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [suspensionBannerVisible, setSuspensionBannerVisible] = useState(true);
    const [clientReady, setClientReady] = useState(false);
    const menuRef = useRef(null);
    const pathname = usePathname();

    // Helper function to check if a link is active
    const isActive = (path) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };



    // Set client-ready state after initial render to avoid hydration errors
    useEffect(() => {
        setClientReady(true);

        // Debug user state
        console.log('Navbar - Auth state:', {
            isAuthenticated,
            userType: user?.userType,
            loading
        });
    }, [isAuthenticated, user, loading]);


    // Add this effect to detect and fix navigation issues
    useEffect(() => {
        if (clientReady && !loading && isAuthenticated && user) {
            console.log(`Navbar mounted - Current path: ${pathname}, User type: ${user?.userType}`);

            // Enforce correct route based on user type
            const correctRoute = user.userType === 'organization' ? '/organization' : '/profile';
            if ((user.userType === 'organization' && pathname === '/profile') ||
                (user.userType === 'adopter' && pathname === '/organization')) {
                console.log(`Correcting navigation: User is ${user.userType} but on ${pathname}`);
                router.replace(correctRoute);
            }
        }
    }, [clientReady, loading, isAuthenticated, user, pathname, router]);

    // Add refresh on mount
    useEffect(() => {
        if (clientReady && isAuthenticated) {
            // Refresh user data when component mounts to ensure it's in sync with JWT
            refreshUser().then(() => {
                console.log("User data refreshed in navbar");
            });
        }
    }, [clientReady]);

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

    // Handle logout with proper state refresh
    const handleLogout = async () => {
        try {
            // Clear local storage before logout API call
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');

            // Call logout
            await logout();

            // Force reload instead of navigation
            window.location.href = '/login';
        } catch (error) {
            console.error("Logout failed:", error);
            // Still redirect even if API fails
            window.location.href = '/login';
        }
    };

    const handleAdminLogout = async () => {
        await adminLogout();
        window.location.href = '/login/admin';
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

    // Animation variants
    const menuVariants = {
        hidden: { opacity: 0, x: "100%" },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
        exit: { opacity: 0, x: "100%", transition: { duration: 0.2, ease: "easeInOut" } }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    // Early return if on admin dashboard pages
    const hiddenNavbarPaths = ['/admin', '/verify-email', '/forgot-password', '/reset-password', '/login/admin'];
    if (pathname && hiddenNavbarPaths.some(path => pathname.startsWith(path))) {
        return null; // Don't render the navbar at all
    }

    return (
        <nav className="fixed top-4 left-0 right-0 mx-auto w-[95%] max-w-7xl bg-white/70 backdrop-blur-md text-gray-800 py-4 px-6 rounded-xl shadow-lg border border-white/30 z-60">
            {/* Suspension banner - updated for glassmorphism */}
            {clientReady && user?.userType === 'adopter' && user?.status === 'suspended' && suspensionBannerVisible && (
                <div className="w-full bg-red-500/90 backdrop-blur-sm text-white py-2 px-4 text-center mb-4 relative rounded-lg shadow-sm">
                    <div className="container mx-auto flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Your account has been suspended. Visit your profile for more information.</span>
                    </div>

                    <button
                        onClick={() => setSuspensionBannerVisible(false)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-red-200 transition-colors"
                        aria-label="Dismiss notification"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        {/* Logo with proper size */}
                        <div className="relative h-10 w-10">
                            <Image
                                src="/logo.svg"
                                fill
                                className="object-contain"
                                alt="StraySpot Logo"
                                priority
                            />
                        </div>

                        {/* Site name next to logo */}
                        <div className="text-xl font-bold">
                            <span className="text-orange-500">Stray</span>
                            <span className="text-teal-500">Spot</span>
                        </div>
                    </Link>
                </div>

                <div className="md:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-gray-800 focus:outline-none relative z-50"
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
                <div className="hidden md:flex items-center space-x-6">
                    <Link href="/" className={`relative pb-1 transition-colors ${isActive('/') ? 'text-orange-500 font-medium' : 'text-gray-800 hover:text-orange-500'}`}>
                        Home
                        {isActive('/') && (
                            <motion.div
                                layoutId="desktopActiveIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </Link>

                    <Link href="/about" className={`relative pb-1 transition-colors ${isActive('/about') ? 'text-orange-500 font-medium' : 'text-gray-800 hover:text-orange-500'}`}>
                        About
                        {isActive('/about') && (
                            <motion.div
                                layoutId="desktopActiveIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </Link>

                    <Link href="/browse" className={`relative pb-1 transition-colors ${isActive('/browse') ? 'text-orange-500 font-medium' : 'text-gray-800 hover:text-orange-500'}`}>
                        Browse
                        {isActive('/browse') && (
                            <motion.div
                                layoutId="desktopActiveIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </Link>

                    {/* Admin Dashboard Link */}
                    {isAdminAuthenticated && (
                        <Link href="/admin/dashboard" className={`relative pb-1 transition-colors ${isActive('/admin') ? 'text-orange-500 font-medium' : 'text-gray-800 hover:text-orange-500'}`}>
                            Admin Dashboard
                            {isActive('/admin') && (
                                <motion.div
                                    layoutId="desktopActiveIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </Link>
                    )}

                    {/* Profile/Organization Links */}
                    {isAuthenticated && !isAdminAuthenticated && (
                        <>
                            {user?.userType === 'adopter' && (
                                <Link
                                    href="/profile"
                                    className={`relative pb-1 transition-colors flex items-center ${isActive('/profile') ? 'text-orange-500 font-medium' : 'text-gray-800 hover:text-orange-500'}`}
                                >
                                    <div className="flex items-center">
                                        <span>My Profile</span>
                                        {user.status === 'suspended' && (
                                            <span className="ml-1 bg-red-500 rounded-full w-2 h-2"></span>
                                        )}
                                    </div>
                                    {isActive('/profile') && (
                                        <motion.div
                                            layoutId="desktopActiveIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </Link>
                            )}
                            {user?.userType === 'organization' && (
                                <Link
                                    href="/organization"
                                    className={`relative pb-1 transition-colors ${isActive('/organization') ? 'text-orange-500 font-medium' : 'text-gray-800 hover:text-orange-500'}`}
                                >
                                    Dashboard
                                    {isActive('/organization') && (
                                        <motion.div
                                            layoutId="desktopActiveIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </Link>
                            )}
                        </>
                    )}

                    {isAuthenticated || isAdminAuthenticated ? (
                        <button
                            onClick={isAdminAuthenticated ? handleAdminLogout : handleLogout}
                            className="bg-orange-500/90 hover:bg-orange-600/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            {isAdminAuthenticated ? 'Admin Logout' : 'Logout'}
                        </button>
                    ) : (
                        <>
                            <Link href="/login" className="bg-teal-500 text-white hover:bg-teal-600 px-4 py-2 rounded-lg font-medium transition-colors">Login</Link>
                            <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">Register</Link>
                        </>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={backdropVariants}
                            onClick={() => setMenuOpen(false)}
                        />

                        <motion.div
                            ref={menuRef}
                            className="fixed top-0 right-0 h-screen w-3/4 sm:w-1/2 md:w-2/5 bg-amber-50 shadow-lg z-50 p-6 pt-16 rounded-l-2xl border-l border-y border-white/50"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={menuVariants}
                        >
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="absolute top-4 right-4 text-gray-800 hover:text-orange-500 transition-colors"
                                aria-label="Close menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Logo in mobile menu */}
                            <div className="flex items-center mb-8 space-x-2">
                                <div className="relative h-8 w-8">
                                    <Image
                                        src="/logo.svg"
                                        fill
                                        className="object-contain"
                                        alt="StraySpot Logo"
                                    />
                                </div>
                                <div className="text-lg font-bold">
                                    <span className="text-orange-500">Stray</span>
                                    <span className="text-teal-500">Spot</span>
                                </div>
                            </div>

                            {/* Mobile menu links - Updated with active indicators */}
                            <div className="flex flex-col space-y-6">
                                <Link
                                    href="/"
                                    className={`relative transition-colors group ${isActive('/')
                                            ? 'text-orange-500 font-medium pl-3 border-l-2 border-orange-500'
                                            : 'text-gray-800 hover:text-orange-500 pl-3'
                                        } text-lg`}
                                >
                                    Home
                                    {isActive('/') && (
                                        <motion.div
                                            className="absolute left-0 top-0 bottom-0 w-full bg-orange-100 rounded-r-md -z-10"
                                            layoutId="mobileActiveIndicator"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.3 }}
                                        />
                                    )}
                                </Link>

                                <Link
                                    href="/about"
                                    className={`relative transition-colors group ${isActive('/about')
                                            ? 'text-orange-500 font-medium pl-3 border-l-2 border-orange-500'
                                            : 'text-gray-800 hover:text-orange-500 pl-3'
                                        } text-lg`}
                                >
                                    About
                                    {isActive('/about') && (
                                        <motion.div
                                            className="absolute left-0 top-0 bottom-0 w-full bg-orange-100 rounded-r-md -z-10"
                                            layoutId="mobileActiveIndicator"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.3 }}
                                        />
                                    )}
                                </Link>

                                <Link
                                    href="/browse"
                                    className={`relative transition-colors group ${isActive('/browse')
                                            ? 'text-orange-500 font-medium pl-3 border-l-2 border-orange-500'
                                            : 'text-gray-800 hover:text-orange-500 pl-3'
                                        } text-lg`}
                                >
                                    Browse
                                    {isActive('/browse') && (
                                        <motion.div
                                            className="absolute left-0 top-0 bottom-0 w-full bg-orange-100 rounded-r-md -z-10"
                                            layoutId="mobileActiveIndicator"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.3 }}
                                        />
                                    )}
                                </Link>

                                {/* Admin Dashboard Link */}
                                {isAdminAuthenticated && (
                                    <Link
                                        href="/admin/dashboard"
                                        className={`relative transition-colors group ${isActive('/admin')
                                                ? 'text-orange-500 font-medium pl-3 border-l-2 border-orange-500'
                                                : 'text-gray-800 hover:text-orange-500 pl-3'
                                            } text-lg`}
                                    >
                                        Admin Dashboard
                                        {isActive('/admin') && (
                                            <motion.div
                                                className="absolute left-0 top-0 bottom-0 w-full bg-orange-100 rounded-r-md -z-10"
                                                layoutId="mobileActiveIndicator"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.3 }}
                                            />
                                        )}
                                    </Link>
                                )}

                                {/* Profile/Organization Links */}
                                {isAuthenticated && !isAdminAuthenticated && (
                                    <>
                                        {user?.userType === 'adopter' && (
                                            <Link
                                                href="/profile"
                                                className={`relative transition-colors flex items-center ${isActive('/profile')
                                                        ? 'text-orange-500 font-medium pl-3 border-l-2 border-orange-500'
                                                        : 'text-gray-800 hover:text-orange-500 pl-3'
                                                    } text-lg`}
                                            >
                                                <div className="flex items-center">
                                                    <span>My Profile</span>
                                                    {user.status === 'suspended' && (
                                                        <span className="ml-1 bg-red-500 rounded-full w-2 h-2"></span>
                                                    )}
                                                </div>
                                                {isActive('/profile') && (
                                                    <motion.div
                                                        className="absolute left-0 top-0 bottom-0 w-full bg-orange-100 rounded-r-md -z-10"
                                                        layoutId="mobileActiveIndicator"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 0.3 }}
                                                    />
                                                )}
                                            </Link>
                                        )}
                                        {user?.userType === 'organization' && (
                                            <Link
                                                href="/organization"
                                                className={`relative transition-colors ${isActive('/organization')
                                                        ? 'text-orange-500 font-medium pl-3 border-l-2 border-orange-500'
                                                        : 'text-gray-800 hover:text-orange-500 pl-3'
                                                    } text-lg`}
                                            >
                                                Dashboard
                                                {isActive('/organization') && (
                                                    <motion.div
                                                        className="absolute left-0 top-0 bottom-0 w-full bg-orange-100 rounded-r-md -z-10"
                                                        layoutId="mobileActiveIndicator"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 0.3 }}
                                                    />
                                                )}
                                            </Link>
                                        )}
                                    </>
                                )}

                                {/* Keep existing decorative elements */}
                            </div>

                            {/* Decorative paw prints */}
                            <div className="absolute bottom-8 right-6 opacity-20 pointer-events-none">
                                <div className="w-6 h-6 rounded-full bg-orange-300 mb-2 ml-4"></div>
                                <div className="w-4 h-4 rounded-full bg-teal-300 ml-1"></div>
                                <div className="w-4 h-4 rounded-full bg-pink-300 ml-6"></div>
                                <div className="w-4 h-4 rounded-full bg-amber-300"></div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </nav>
    );
}

