"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        email: '',
        password: ''
    });
    const { user, loading, isAuthenticated, login, isOrganization, isAdopter } = useAuth();
    const router = useRouter();

    // Validation functions
    const validateEmail = (email) => {
        if (!email) return '';
        if (email.indexOf(' ') !== -1) return 'Email address cannot contain spaces';

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(email) ? '' : 'Please enter a valid email address';
    };

    const validatePassword = (password) => {
        if (!password) return '';
        if (password.includes(' ')) return 'Password cannot contain spaces';
        return '';
    };

    // Handle input changes with validation
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setValidationErrors(prev => ({
            ...prev,
            email: validateEmail(value)
        }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setValidationErrors(prev => ({
            ...prev,
            password: validatePassword(value)
        }));
    };

    // If already authenticated, redirect based on user type
    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            console.log("Already authenticated in login page, redirecting based on role");

            if (user.userType === 'organization') {
                router.push('/organization');
            } else {
                router.push('/profile');
            }
        }
    }, [user, loading, isAuthenticated, router]);

    const handleDismissError = () => {
        setError("");
    };

    useEffect(() => {
        // Clear any stale data when the login page loads
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Run validations
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        setValidationErrors({
            email: emailError,
            password: passwordError
        });

        // Don't proceed if there are validation errors
        if (emailError || passwordError) {
            setError("Please fix the validation errors");
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            // First clear any potential stale data
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');

            // Use the login function from AuthContext
            const result = await login(email, password);

            if (result.success) {
                console.log("Login successful, redirecting based on user type:", result.user?.userType);

                // Redirect based on user type
                if (result.user?.userType === 'organization') {
                    router.push('/organization');
                } else {
                    router.push('/profile');
                }
            } else {
                setError(result.error || "Login failed");
                setPassword("");
            }
        } catch (error) {
            setError("An unexpected error occurred");
            setPassword("");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Input styling based on validation
    const getInputClassName = (fieldName) => {
        const baseClasses = "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm";

        // Get the current value based on field name
        const value = fieldName === 'email' ? email : password;

        // If field is empty, use neutral styling
        if (!value) {
            return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
        }

        // If there's a validation error, use red styling, otherwise green
        return validationErrors[fieldName]
            ? `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500`
            : `${baseClasses} border-green-500 focus:ring-green-500 focus:border-green-500`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo and branding */}
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        {/* Replace with your actual logo */}
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">SS</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">StraySpot</h1>
                    <p className="mt-2 text-gray-600">Sign in to your account</p>
                </div>

                {/* Card container */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                                <div className="ml-auto pl-3">
                                    <div className="-mx-1.5 -my-1.5">
                                        <button
                                            onClick={handleDismissError}
                                            className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            <span className="sr-only">Dismiss</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                className={getInputClassName('email')}
                                placeholder="you@example.com"
                            />
                            {validationErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={getInputClassName('password')}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting || validationErrors.email || validationErrors.password}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                    ${isSubmitting || validationErrors.email || validationErrors.password
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Registration prompt */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}