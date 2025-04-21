'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterTypePage() {
    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
            <p className="text-center mb-8">Please select account type:</p>

            <div className="flex flex-col md:flex-row gap-8 justify-center">
                <Link href="/register/adopter"
                    className="border p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                    <h2 className="text-xl font-semibold mb-3">I&apos;m an Adopter</h2>
                    <p className="mb-4">I&apos;m looking to adopt animals or help with animal welfare</p>
                    <div className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Continue as Adopter
                    </div>
                </Link>

                <Link href="/register/organization"
                    className="border p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                    <h2 className="text-xl font-semibold mb-3">I&apos;m a Shelter/Organization</h2>
                    <p className="mb-4">I represent an animal shelter or animal welfare organization</p>
                    <div className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                        Continue as Organization
                    </div>
                </Link>
            </div>

            <p className="text-center mt-8">
                Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login here</Link>
            </p>
        </div>
    );
}