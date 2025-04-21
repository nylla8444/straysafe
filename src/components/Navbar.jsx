'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, isAuthenticated, logout, isOrganization, isAdopter } = useAuth();
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

                {/* Mobile menu button */}
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

                {/* Desktop navigation */}
                <div className="hidden md:flex space-x-6">
                    <Link href="/" className="hover:text-blue-100">Home</Link>
                    <Link href="/about" className="hover:text-blue-100">About</Link>
                    <Link href="/animals" className="hover:text-blue-100">Animals</Link>

                    {isAuthenticated && isAdopter() && (
                        <Link href="/profile" className="hover:text-blue-100">My Profile</Link>
                    )}

                    {isAuthenticated && isOrganization() && (
                        <Link href="/organization" className="hover:text-blue-100">Organization Dashboard</Link>
                    )}

                    {isAuthenticated ? (
                        <button onClick={logout} className="hover:text-blue-100">Logout</button>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-blue-100">Login</Link>
                            <Link href="/register" className="hover:text-blue-100">Register</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile navigation */}
            {menuOpen && (
                <div className="md:hidden mt-4 flex flex-col space-y-3">
                    <Link href="/" className="hover:text-blue-100">Home</Link>
                    <Link href="/about" className="hover:text-blue-100">About</Link>
                    <Link href="/animals" className="hover:text-blue-100">Animals</Link>

                    {isAuthenticated && isAdopter() && (
                        <Link href="/profile" className="hover:text-blue-100">My Profile</Link>
                    )}

                    {isAuthenticated && isOrganization() && (
                        <Link href="/organization" className="hover:text-blue-100">Organization Dashboard</Link>
                    )}

                    {isAuthenticated ? (
                        <button onClick={logout} className="hover:text-blue-100 text-left">Logout</button>
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