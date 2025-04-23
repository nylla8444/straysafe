'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function OrganizationRegistrationPage() {
    const [formData, setFormData] = useState({
        organizationName: '',
        email: '',
        contactNumber: '',
        city: '',
        province: '',
        password: '',
        confirmPassword: ''
    });
    const [verificationFile, setVerificationFile] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setVerificationFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Email validation
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Phone number validation - exactly 11 digits
        const digits = formData.contactNumber.replace(/\D/g, '');
        if (digits.length !== 11) {
            setError('Contact number must contain exactly 11 digits');
            return;
        }

        // Allow only valid characters in phone number
        if (!/^[0-9+\-\s()]+$/.test(formData.contactNumber)) {
            setError('Contact number contains invalid characters');
            return;
        }

        // Password confirmation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Password strength validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!verificationFile) {
            setError('Please upload a verification document');
            return;
        }

        try {
            setIsSubmitting(true);

            // Create form data for file upload
            const data = new FormData();
            data.append('organizationName', formData.organizationName);
            data.append('email', formData.email);
            data.append('contactNumber', formData.contactNumber);
            data.append('city', formData.city);
            data.append('province', formData.province);
            data.append('password', formData.password);
            data.append('userType', 'organization');
            data.append('verificationDocument', verificationFile);

            const response = await axios.post('/api/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                router.push('/login?registered=true');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Organization Account</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4 md:col-span-2">
                        <label className="block mb-2">Organization/Shelter Name</label>
                        <input
                            type="text"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Contact Number</label>
                        <input
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Province</label>
                        <input
                            type="text"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4 md:col-span-2">
                        <label className="block mb-2">Verification Document (ID or Organization Proof)</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            required
                            className="w-full p-2 border rounded"
                            accept="image/*, application/pdf"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Please upload a valid ID or document proving organization status
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:bg-green-300"
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Organization Account'}
                    </button>
                </div>
            </form>

            <div className="text-center mt-4">
                <Link href="/register" className="text-blue-500 hover:underline">
                    ← Back to account type selection
                </Link>
                <p className="mt-2">
                    Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}