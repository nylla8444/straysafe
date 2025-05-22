'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function AdopterRegistrationPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        city: '',
        province: '',
        password: '',
        confirmPassword: ''
    });

    // Add validation states
    const [validationErrors, setValidationErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        city: '',
        province: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const router = useRouter();

    // Validation functions
    const validateName = (name, fieldName) => {
        if (!name) return '';
        if (name.trim() === '') return `${fieldName} cannot be just spaces`;
        return '';
    };

    const validateLocation = (location, fieldName) => {
        if (!location) return '';
        if (location.trim() === '') return `${fieldName} cannot be just spaces`;
        return '';
    };


    const validateEmail = (email) => {
        if (!email) return '';
        if (/\s/.test(email)) return 'Email address cannot contain spaces';

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(email) ? '' : 'Please enter a valid email address';
    };

    const validatePhone = (phone) => {
        if (!phone) return '';

        const digits = phone.replace(/\D/g, '');
        if (digits.length !== 11) return 'Contact number must contain exactly 11 digits';
        if (digits[0] !== '0') return 'Contact number must start with 0';
        if (!/^[0-9+\-\s()]+$/.test(phone)) return 'Contact number contains invalid characters';

        return '';
    };

    const validatePassword = (password) => {
        if (!password) return '';
        if (password.includes(' ')) return 'Password cannot contain spaces';
        return password.length >= 8 ? '' : 'Password must be at least 8 characters long';
    };

    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) return '';
        return confirmPassword === password ? '' : 'Passwords do not match';
    };

    const validateForm = () => {
        const firstNameError = validateName(formData.firstName, 'First name');
        const lastNameError = validateName(formData.lastName, 'Last name');
        const emailError = validateEmail(formData.email);
        const phoneError = validatePhone(formData.contactNumber);
        const cityError = validateLocation(formData.city, 'City/Municipality');
        const provinceError = validateLocation(formData.province, 'Province');
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

        // Also check if required fields are filled
        const requiredFieldsFilled =
            formData.firstName &&
            formData.lastName &&
            formData.email &&
            formData.contactNumber &&
            formData.city &&
            formData.province &&
            formData.password &&
            formData.confirmPassword;

        return !firstNameError && !lastNameError && !emailError && !phoneError &&
            !cityError && !provinceError && !passwordError && !confirmPasswordError &&
            requiredFieldsFilled;
    };

    useEffect(() => {
        setIsFormValid(validateForm());
    }, [formData]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Real-time validation
        if (name === 'firstName') {
            setValidationErrors(prev => ({
                ...prev,
                firstName: validateName(value, 'First name')
            }));
        }
        else if (name === 'lastName') {
            setValidationErrors(prev => ({
                ...prev,
                lastName: validateName(value, 'Last name')
            }));
        }
        else if (name === 'email') {
            setValidationErrors(prev => ({ ...prev, email: validateEmail(value) }));
        }
        else if (name === 'contactNumber') {
            setValidationErrors(prev => ({ ...prev, contactNumber: validatePhone(value) }));
        }
        else if (name === 'city') {
            setValidationErrors(prev => ({
                ...prev,
                city: validateLocation(value, 'City/Municipality')
            }));
        }
        else if (name === 'province') {
            setValidationErrors(prev => ({
                ...prev,
                province: validateLocation(value, 'Province')
            }));
        }
        else if (name === 'password') {
            setValidationErrors(prev => ({
                ...prev,
                password: validatePassword(value),
                confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
            }));
        }
        else if (name === 'confirmPassword') {
            setValidationErrors(prev => ({
                ...prev,
                confirmPassword: validateConfirmPassword(value, formData.password)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Run all validations
        const firstNameError = validateName(formData.firstName, 'First name');
        const lastNameError = validateName(formData.lastName, 'Last name');
        const emailError = validateEmail(formData.email);
        const phoneError = validatePhone(formData.contactNumber);
        const cityError = validateLocation(formData.city, 'City/Municipality');
        const provinceError = validateLocation(formData.province, 'Province');
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);


        // Validation errors
        setValidationErrors({
            firstName: firstNameError,
            lastName: lastNameError,
            email: emailError,
            contactNumber: phoneError,
            city: cityError,
            province: provinceError,
            password: passwordError,
            confirmPassword: confirmPasswordError
        });

        // Check if any validation failed
        if (firstNameError || lastNameError || emailError || phoneError ||
            cityError || provinceError || passwordError || confirmPasswordError) {
            setError('Please fix the errors in the form');
            return;
        }

        try {
            setIsSubmitting(true);

            // Send the complete registration data
            const response = await axios.post('/api/register', {
                userType: 'adopter',
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                contactNumber: formData.contactNumber,
                city: formData.city,
                province: formData.province,
                password: formData.password
            });

            if (response.data.success) {
                router.push('/login?verify=true');
            }
            
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Utility function to determine input border color based on validation
    const getInputClassName = (fieldName) => {
        const baseClasses = "w-full p-2 border rounded";
        if (!formData[fieldName]) return baseClasses;

        return validationErrors[fieldName]
            ? `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500`
            : `${baseClasses} border-green-500 focus:ring-green-500 focus:border-green-500`;
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Adopter Account</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="mb-4">
                        <label className="block mb-2">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className={getInputClassName('firstName')}
                        />
                        {validationErrors.firstName && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className={getInputClassName('lastName')}
                        />
                        {validationErrors.lastName && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={getInputClassName('email')}
                            placeholder="example@email.com"
                        />
                        {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                        {formData.email && !validationErrors.email && (
                            <p className="mt-1 text-sm text-green-600">Valid email format</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Contact Number</label>
                        <input
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            required
                            placeholder="09XXXXXXXXX"
                            className={getInputClassName('contactNumber')}
                        />
                        {validationErrors.contactNumber && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.contactNumber}</p>
                        )}
                        {formData.contactNumber && !validationErrors.contactNumber && (
                            <p className="mt-1 text-sm text-green-600">Valid contact number format</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Must be 11 digits starting with 0 (e.g., 09123456789)
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">City/Municipality</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className={getInputClassName('city')}
                        />
                        {validationErrors.city && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Province</label>
                        <input
                            type="text"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            required
                            className={getInputClassName('province')}
                        />
                        {validationErrors.province && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.province}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={getInputClassName('password')}
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
                        {formData.password && !validationErrors.password && (
                            <p className="mt-1 text-sm text-green-600">Password meets requirements</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className={getInputClassName('confirmPassword')}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
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
                        {validationErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                        )}
                        {formData.confirmPassword && !validationErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-green-600">Passwords match</p>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting || !isFormValid}
                        className="w-full bg-teal-500 text-white p-3 rounded hover:bg-teal-600 disabled:bg-teal-200 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                </div>
            </form>

            <div className="text-center mt-4">
                <Link href="/register" className="text-teal-500 hover:underline">
                    ← Back to account type selection
                </Link>
                <p className="mt-2">
                    Already have an account? <Link href="/login" className="text-teal-500 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}