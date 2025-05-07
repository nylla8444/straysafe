'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import React from 'react';

export default function AdoptionApplicationPage() {
    const params = useParams();
    const petId = params.petId;

    const { user, isAuthenticated, isAdopter } = useAuth();
    const router = useRouter();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hasExistingApplication, setHasExistingApplication] = useState(false);

    const [formData, setFormData] = useState({
        housingStatus: '',
        petsAllowed: '',
        petLocation: '',
        primaryCaregiver: '',
        otherPets: '',
        financiallyPrepared: '',
        emergencyPetCare: '',
        reference: {
            name: '',
            email: '',
            phone: ''
        },
        termsAccepted: false
    });

    // Add validation state for form fields
    const [validationErrors, setValidationErrors] = useState({
        housingStatus: '',
        petsAllowed: '',
        petLocation: '',
        primaryCaregiver: '',
        otherPets: '',
        financiallyPrepared: '',
        emergencyPetCare: '',
        'reference.name': '',
        'reference.email': '',
        'reference.phone': '',
        termsAccepted: ''
    });

    // Validation functions
    const validateSelect = (value, fieldName) => {
        if (!value) return `Please select an option for ${fieldName}`;
        return '';
    };

    const validateText = (value, fieldName) => {
        if (!value) return `${fieldName} is required`;
        if (value.trim() === '') return `${fieldName} cannot be just spaces`;
        return '';
    };

    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        if (email.trim() === '') return 'Email cannot be just spaces';
        if (email.includes(' ')) return 'Email cannot contain spaces';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Please enter a valid email address';
    };

    const validatePhone = (phone) => {
        if (!phone) return 'Phone number is required';
        if (phone.trim() === '') return 'Phone number cannot be just spaces';

        const digits = phone.replace(/\D/g, '');
        if (digits.length !== 11) return 'Phone number must contain exactly 11 digits';
        if (digits[0] !== '0') return 'Phone number must start with 0';

        return '';
    };

    const validateTerms = (accepted) => {
        return accepted ? '' : 'You must agree to the terms and conditions';
    };

    useEffect(() => {
        // Redirect if not authenticated or not an adopter
        if (!isAuthenticated) {
            router.push(`/login?redirect=/adopt/${petId}`);
            return;
        }
        if (isAuthenticated && !isAdopter()) {
            router.push('/browse/pets');
            return;
        }

        // Fetch pet data and check for existing applications
        const fetchPetAndCheckApplications = async () => {
            try {
                setLoading(true);

                // Fetch pet data
                const petResponse = await axios.get(`/api/pets/${petId}`);
                if (!petResponse.data.success) {
                    setError('Unable to load pet information.');
                    setLoading(false);
                    return;
                }

                setPet(petResponse.data.pet);

                // Check for existing applications
                const applicationsResponse = await axios.get('/api/adoptions/adopter');
                if (applicationsResponse.data.success) {
                    const applications = applicationsResponse.data.applications;
                    const existingApp = applications.find(
                        app => app.petId._id === petId &&
                            ['pending', 'reviewing', 'approved'].includes(app.status)
                    );

                    if (existingApp) {
                        setHasExistingApplication(true);
                        setError(`You already have an active application for this pet (Application #${existingApp.applicationId}). Please check your applications in your profile.`);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load information. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchPetAndCheckApplications();
    }, [petId, isAuthenticated, router, isAdopter]);

    // Check if the form has any validation errors
    const hasValidationErrors = () => {
        return Object.values(validationErrors).some(error => error !== '');
    };

    // Get complete validation status (including empty fields)
    const validateForm = () => {
        const errors = {
            housingStatus: validateSelect(formData.housingStatus, 'housing status'),
            petsAllowed: validateSelect(formData.petsAllowed, 'pets allowed'),
            petLocation: validateText(formData.petLocation, 'Pet location'),
            primaryCaregiver: validateText(formData.primaryCaregiver, 'Primary caregiver'),
            otherPets: validateSelect(formData.otherPets, 'other pets'),
            financiallyPrepared: validateSelect(formData.financiallyPrepared, 'financial preparedness'),
            emergencyPetCare: validateText(formData.emergencyPetCare, 'Emergency pet care'),
            'reference.name': validateText(formData.reference.name, 'Reference name'),
            'reference.email': validateEmail(formData.reference.email),
            'reference.phone': validatePhone(formData.reference.phone),
            termsAccepted: validateTerms(formData.termsAccepted)
        };

        setValidationErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Update form data
        if (name.includes('.')) {
            // Handle nested objects (for reference fields)
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));

            // Validate reference fields
            if (child === 'email') {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: validateEmail(value)
                }));
            } else if (child === 'phone') {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: validatePhone(value)
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: validateText(value, child)
                }));
            }
        } else {
            // Handle regular fields
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));

            // Validate the field based on its type
            if (name === 'termsAccepted') {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: validateTerms(checked)
                }));
            } else if (['housingStatus', 'petsAllowed', 'otherPets', 'financiallyPrepared'].includes(name)) {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: validateSelect(value, name.replace(/([A-Z])/g, ' $1').toLowerCase())
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: validateText(value, name.replace(/([A-Z])/g, ' $1').toLowerCase())
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields before submission
        if (!validateForm()) {
            // Scroll to the first error
            const firstErrorField = Object.keys(validationErrors).find(key => validationErrors[key]);
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/adoptions', {
                petId: petId,
                ...formData
            });

            if (response.data.success) {
                // Redirect to a success page
                router.push(`/profile/applications?success=true`);
            } else {
                setError(response.data.error || 'Failed to submit application. Please try again.');
            }
        } catch (err) {
            console.error('Failed to submit adoption application:', err);
            setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function for input field styling
    const getInputClassName = (fieldName) => {
        const baseClasses = "w-full p-2 border rounded-md";
        if (!validationErrors[fieldName]) {
            return `${baseClasses} border-gray-300`;
        }
        return `${baseClasses} border-red-500`;
    };


    // Check if all required fields are filled
    const isFormComplete = () => {
        // Check all required select/radio fields
        if (!formData.housingStatus || !formData.petsAllowed ||
            !formData.otherPets || !formData.financiallyPrepared) {
            return false;
        }

        // Check all required text fields
        if (!formData.petLocation.trim() || !formData.primaryCaregiver.trim() ||
            !formData.emergencyPetCare.trim()) {
            return false;
        }

        // Check reference fields
        if (!formData.reference.name.trim() || !formData.reference.email.trim() ||
            !formData.reference.phone.trim()) {
            return false;
        }

        // Check terms acceptance
        if (!formData.termsAccepted) {
            return false;
        }

        return true;
    };


    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !pet) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error || 'Pet not found.'}</p>
                </div>
                <Link href="/browse/pets" className="text-blue-600 hover:underline">
                    ← Back to browse pets
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            {/* Back navigation */}
            <div className="mb-6">
                <Link href={`/browse/pets/${pet._id}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to pet details
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-8 text-center">Adoption Application</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pet information card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
                        <div className="relative h-48 w-full">
                            {pet.img_arr && pet.img_arr.length > 0 ? (
                                <Image
                                    src={pet.img_arr[0]}
                                    alt={pet.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">No image available</span>
                                </div>
                            )}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/60"></div>
                            <div className="absolute bottom-0 left-0 p-4 text-white">
                                <h2 className="text-xl font-bold">{pet.name}</h2>
                                <p>{pet.breed} • {pet.gender}</p>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="mb-4">
                                <h3 className="font-medium text-gray-700">From</h3>
                                <p className="text-gray-900">{pet.organization?.organizationName || 'Unknown shelter'}</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-medium text-gray-700">Adoption Fee</h3>
                                <p className="text-gray-900">{pet.adoptionFee > 0 ? `₱${pet.adoptionFee}` : 'Free'}</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-medium text-gray-700">Status</h3>
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    {pet.status}
                                </span>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-500">
                                    Completing this application is the first step in the adoption process.
                                    The shelter will review your application and contact you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-6">Tell us about you and your home</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block mb-2 font-medium">Do you rent or own your home?</label>
                                    <select
                                        name="housingStatus"
                                        value={formData.housingStatus}
                                        onChange={handleChange}
                                        className={getInputClassName('housingStatus')}
                                        required
                                    >
                                        <option value="">Please select</option>
                                        <option value="own">Own</option>
                                        <option value="rent">Rent</option>
                                        <option value="live with friends/relatives">Live with friends/relatives</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {validationErrors.housingStatus && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.housingStatus}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Are pets allowed in your residence?</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="petsAllowed"
                                                value="yes"
                                                checked={formData.petsAllowed === 'yes'}
                                                onChange={handleChange}
                                                className="mr-2"
                                                required
                                            />
                                            Yes
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="petsAllowed"
                                                value="no"
                                                checked={formData.petsAllowed === 'no'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            No
                                        </label>
                                    </div>
                                    {validationErrors.petsAllowed && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.petsAllowed}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Where will the adopted pet stay most of the time?</label>
                                    <textarea
                                        name="petLocation"
                                        value={formData.petLocation}
                                        onChange={handleChange}
                                        className={getInputClassName('petLocation')}
                                        rows="2"
                                        placeholder="E.g. Inside the house, backyard, etc."
                                        required
                                    ></textarea>
                                    {validationErrors.petLocation && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.petLocation}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Who will primarily care for the pet?</label>
                                    <input
                                        type="text"
                                        name="primaryCaregiver"
                                        value={formData.primaryCaregiver}
                                        onChange={handleChange}
                                        className={getInputClassName('primaryCaregiver')}
                                        placeholder="Name and relationship to you"
                                        required
                                    />
                                    {validationErrors.primaryCaregiver && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.primaryCaregiver}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Do you have other pets at home?</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="otherPets"
                                                value="yes"
                                                checked={formData.otherPets === 'yes'}
                                                onChange={handleChange}
                                                className="mr-2"
                                                required
                                            />
                                            Yes
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="otherPets"
                                                value="no"
                                                checked={formData.otherPets === 'no'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            No
                                        </label>
                                    </div>
                                    {validationErrors.otherPets && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.otherPets}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Are you financially prepared for pet expenses (e.g., food, vet care)?</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="financiallyPrepared"
                                                value="yes"
                                                checked={formData.financiallyPrepared === 'yes'}
                                                onChange={handleChange}
                                                className="mr-2"
                                                required
                                            />
                                            Yes
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="financiallyPrepared"
                                                value="no"
                                                checked={formData.financiallyPrepared === 'no'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            No
                                        </label>
                                    </div>
                                    {validationErrors.financiallyPrepared && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.financiallyPrepared}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">If you have to leave town, emergently or planned, where would your pet stay?</label>
                                    <textarea
                                        name="emergencyPetCare"
                                        value={formData.emergencyPetCare}
                                        onChange={handleChange}
                                        className={getInputClassName('emergencyPetCare')}
                                        rows="3"
                                        placeholder="Describe your emergency care plan"
                                        required
                                    ></textarea>
                                    {validationErrors.emergencyPetCare && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.emergencyPetCare}</p>
                                    )}
                                </div>

                                <div className="border-t pt-6 mt-6">
                                    <h3 className="text-lg font-medium mb-4">Personal Reference</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2 font-medium">Name</label>
                                            <input
                                                type="text"
                                                name="reference.name"
                                                value={formData.reference.name}
                                                onChange={handleChange}
                                                className={getInputClassName('reference.name')}
                                                required
                                            />
                                            {validationErrors['reference.name'] && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors['reference.name']}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block mb-2 font-medium">Email</label>
                                            <input
                                                type="text" // Changed from email for custom validation
                                                name="reference.email"
                                                value={formData.reference.email}
                                                onChange={handleChange}
                                                className={getInputClassName('reference.email')}
                                                required
                                                placeholder="example@email.com"
                                            />
                                            {validationErrors['reference.email'] && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors['reference.email']}</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-2 font-medium">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="reference.phone"
                                                value={formData.reference.phone}
                                                onChange={handleChange}
                                                className={getInputClassName('reference.phone')}
                                                required
                                                placeholder="09XXXXXXXXX"
                                            />
                                            {validationErrors['reference.phone'] && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors['reference.phone']}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">Must be 11 digits starting with 0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-lg font-medium mb-4">Terms and Conditions</h3>
                                <div className="bg-gray-50 p-4 rounded-md mb-6 max-h-64 overflow-y-auto text-sm">
                                    <p className="mb-4">By clicking the submit button:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>I agree to go through the adoption process, will undergo a home check, and interview.</li>
                                        <li>I understand my references will be checked including veterinary and personal.</li>
                                        <li>I understand there is an adoption donation associated with adoption of a pet and that it is tax deductible according to IRS 501(c)3 guidelines.</li>
                                        <li>I understand this donation will ensure the organization is equipped to rescue another homeless pet.</li>
                                        <li>I understand there is no &ldquo;cooling off&rdquo; period, and that if I no longer want or can no longer care for my adopted pet, I agree to notify Rescue Center BY EMAIL and provide a 14 day period to allow Rescue Center to make arrangements for my pet to be taken back into rescue.</li>
                                        <li>I agree to indemnify and hold harmless the rescue center against any losses, lawsuits, claims, injury, damages incurred by me or to any persons or property by my adopted pet, once adoption has been completed.</li>
                                        <li>I understand that Rescue Center will disclose any of the pet&apos;s health or behavior issues known by the rescue group before adoption is completed.</li>
                                        <li>I understand that if I no longer want my pet, or am no longer able to care for my adopted pet, I will be directed to surrender my pet to Rescue Center and provide transport to where Rescue Center deems appropriate.</li>
                                        <li>I verify all of the above information is true and accurate.</li>
                                    </ul>
                                </div>

                                <div className="flex items-start mb-6">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            name="termsAccepted"
                                            checked={formData.termsAccepted}
                                            onChange={handleChange}
                                            className={validationErrors.termsAccepted ? "w-4 h-4 border border-red-500 rounded" : "w-4 h-4 border border-gray-300 rounded"}
                                            required
                                        />
                                    </div>
                                    <label htmlFor="terms" className="ml-2 text-sm font-medium">
                                        I have read and agree to all terms and conditions
                                    </label>
                                </div>
                                {validationErrors.termsAccepted && (
                                    <p className="mb-4 text-sm text-red-600">{validationErrors.termsAccepted}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || hasValidationErrors() || !isFormComplete() || hasExistingApplication}
                                    className={`w-full py-3 px-4 font-medium rounded-md shadow-sm transition-colors ${loading || hasValidationErrors() || !isFormComplete() || hasExistingApplication
                                            ? 'bg-blue-400 cursor-not-allowed text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {loading ? 'Submitting...' : hasExistingApplication ? 'Already Applied' : 'Submit Application'}
                                </button>
                            </div>

                            <p className="mt-4 text-sm text-gray-500 text-center">
                                By submitting, you agree to be contacted by the shelter about your application.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}