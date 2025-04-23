'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext'; // Add this import

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    // Add admin auth context
    const { admin, isAuthenticated: isAdminAuthenticated, adminLogout } = useAdminAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold">
                        StraySafe
                    </Link>
                </div>

                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            )}
                        </svg>
                    </button>
                </div>

                <div className="hidden md:flex space-x-6">
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

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden mt-4 flex flex-col space-y-3">
                    <Link href="/" className="hover:text-blue-100">Home</Link>
                    <Link href="/about" className="hover:text-blue-100">About</Link>
                    <Link href="/browse" className="hover:text-blue-100">Browse</Link>

                    {/* Admin-specific navigation - mobile */}
                    {isAdminAuthenticated && (
                        <Link href="/admin/dashboard" className="hover:text-blue-100">Admin Dashboard</Link>
                    )}

                    {/* Regular user navigation - mobile */}
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

                    {/* Authentication buttons - mobile */}
                    {isAuthenticated || isAdminAuthenticated ? (
                        <button
                            onClick={isAdminAuthenticated ? adminLogout : logout}
                            className="hover:text-blue-100 text-left"
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
            )}
        </nav>
    );
}