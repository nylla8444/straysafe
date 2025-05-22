'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterTypePage() {
    return (
        <div className="min-h-screen bg-amber-50  flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-4xl">
                {/* Logo and branding */}
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        <Image
                            src="/logo.svg"
                            alt="StraySpot Logo"
                            width={100}
                            height={100}
                            className="h-16 w-16 rounded-full"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Join StraySpot</h1>
                    <p className="mt-2 text-gray-600">Choose how you want to make a difference</p>
                </div>

                {/* Selection cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {/* Adopter card */}
                    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden">
                        <div className="h-32 bg-teal-500 flex items-center justify-center">
                            <svg className="w-20 h-20 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-3 text-gray-800">I&apos;m an Adopter</h2>
                            <p className="text-gray-600 mb-6 h-20">Looking to bring a new pet into your home? Join as an adopter to browse available animals and connect with shelters.</p>
                            <Link href="/register/adopter" className="block w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-md text-center transition-colors">
                                Continue as Adopter
                            </Link>
                        </div>
                    </div>

                    {/* Organization card */}
                    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden">
                        <div className="h-32 bg-orange-500 flex items-center justify-center">
                            <svg className="w-20 h-20 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                            </svg>
                        </div>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-3 text-gray-800">I&apos;m an Organization</h2>
                            <p className="text-gray-600 mb-6 h-20">Animal shelter or rescue group? Create an organizational account to list animals and manage adoption applications.</p>
                            <Link href="/register/organization" className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md text-center transition-colors">
                                Continue as Organization
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Login link */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}