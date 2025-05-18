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
        if (!isAuthenticated) {
            router.push(`/login?redirect=/adopt/${petId}`);
            return;
        }
        if (isAuthenticated && !isAdopter()) {
            router.push('/browse/pets');
            return;
        }

        const fetchPetAndCheckApplications = async () => {
            try {
                setLoading(true);

                const petResponse = await axios.get(`/api/pets/${petId}`);
                if (!petResponse.data.success) {
                    setError('Unable to load pet information.');
                    setLoading(false);
                    return;
                }

                setPet(petResponse.data.pet);

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

    const hasValidationErrors = () => {
        return Object.values(validationErrors).some(error => error !== '');
    };

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

        if (name.includes('.')) {
            const [parent, child] = name.split('.');

            // Special handling for phone field - only allow numbers
            if (child === 'phone') {
                // Remove any non-digit characters
                const numericValue = value.replace(/\D/g, '');

                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: numericValue
                    }
                }));

                setValidationErrors(prev => ({
                    ...prev,
                    [name]: validatePhone(numericValue)
                }));

                return; // Exit early after handling phone
            }

            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));

            if (child === 'email') {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: validateEmail(value)
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: validateText(value, child)
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));

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

    const handlePhoneKeyPress = (e) => {
        // Only allow numbers (0-9) 
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' &&
            e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
            e.preventDefault();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
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

    const getInputClassName = (fieldName) => {
        const baseClasses = "w-full p-2 border rounded-md";
        if (!validationErrors[fieldName]) {
            return `${baseClasses} border-gray-300`;
        }
        return `${baseClasses} border-red-500`;
    };

    const isFormComplete = () => {
        if (!formData.housingStatus || !formData.petsAllowed ||
            !formData.otherPets || !formData.financiallyPrepared) {
            return false;
        }

        if (!formData.petLocation.trim() || !formData.primaryCaregiver.trim() ||
            !formData.emergencyPetCare.trim()) {
            return false;
        }

        if (!formData.reference.name.trim() || !formData.reference.email.trim() ||
            !formData.reference.phone.trim()) {
            return false;
        }

        if (!formData.termsAccepted) {
            return false;
        }

        return true;
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-4 sm:p-6 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading application form...</p>
                </div>
            </div>
        );
    }

    if (error || !pet) {
        return (
            <div className="max-w-5xl mx-auto p-4 sm:p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error || 'Pet not found.'}</p>
                </div>
                <Link href="/browse/pets" className="inline-flex items-center text-teal-600 hover:underline py-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to browse pets
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <Link href={`/browse/pets/${pet._id}`} className="inline-flex items-center text-teal-600 hover:text-teal-800 py-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to pet details
                </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Adoption Application</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-1 order-1 lg:order-none">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden lg:sticky lg:top-6">
                        <div className="relative h-40 sm:h-48 w-full">
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
                            <div className="flex flex-wrap -mx-2">
                                <div className="px-2 w-1/2 mb-4">
                                    <h3 className="font-medium text-gray-700 text-sm">From</h3>
                                    <p className="text-gray-900 truncate">{pet.organization?.organizationName || 'Unknown shelter'}</p>
                                </div>

                                <div className="px-2 w-1/2 mb-4">
                                    <h3 className="font-medium text-gray-700 text-sm">Adoption Fee</h3>
                                    <p className="text-gray-900">{pet.adoptionFee > 0 ? `₱${pet.adoptionFee}` : 'Free'}</p>
                                </div>

                                <div className="px-2 w-full mb-4">
                                    <h3 className="font-medium text-gray-700 text-sm">Status</h3>
                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 capitalize">
                                        {pet.status}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-3">
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Completing this application is the first step in the adoption process.
                                    The shelter will review your application and contact you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 order-2">
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Tell us about you and your home</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-5 sm:space-y-6">
                                <div>
                                    <label className="block mb-2 font-medium text-sm sm:text-base">Do you rent or own your home?</label>
                                    <select
                                        name="housingStatus"
                                        value={formData.housingStatus}
                                        onChange={handleChange}
                                        className={`${getInputClassName('housingStatus')} h-11 text-base`}
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
                                    <label className="block mb-2 font-medium text-sm sm:text-base">Are pets allowed in your residence?</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center h-10 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="petsAllowed"
                                                value="yes"
                                                checked={formData.petsAllowed === 'yes'}
                                                onChange={handleChange}
                                                className="w-5 h-5 mr-2"
                                                required
                                            />
                                            <span className="select-none">Yes</span>
                                        </label>
                                        <label className="flex items-center h-10 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="petsAllowed"
                                                value="no"
                                                checked={formData.petsAllowed === 'no'}
                                                onChange={handleChange}
                                                className="w-5 h-5 mr-2"
                                            />
                                            <span className="select-none">No</span>
                                        </label>
                                    </div>
                                    {validationErrors.petsAllowed && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.petsAllowed}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-sm sm:text-base">Where will the adopted pet stay most of the time?</label>
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
                                    <label className="block mb-2 font-medium text-sm sm:text-base">Who will primarily care for the pet?</label>
                                    <input
                                        type="text"
                                        name="primaryCaregiver"
                                        value={formData.primaryCaregiver}
                                        onChange={handleChange}
                                        className={`${getInputClassName('primaryCaregiver')} h-11`}
                                        placeholder="Name and relationship to you"
                                        required
                                    />
                                    {validationErrors.primaryCaregiver && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.primaryCaregiver}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-sm sm:text-base">Do you have other pets at home?</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center h-10 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="otherPets"
                                                value="yes"
                                                checked={formData.otherPets === 'yes'}
                                                onChange={handleChange}
                                                className="w-5 h-5 mr-2"
                                                required
                                            />
                                            <span className="select-none">Yes</span>
                                        </label>
                                        <label className="flex items-center h-10 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="otherPets"
                                                value="no"
                                                checked={formData.otherPets === 'no'}
                                                onChange={handleChange}
                                                className="w-5 h-5 mr-2"
                                            />
                                            <span className="select-none">No</span>
                                        </label>
                                    </div>
                                    {validationErrors.otherPets && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.otherPets}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-sm sm:text-base">Are you financially prepared for pet expenses (e.g., food, vet care)?</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center h-10 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="financiallyPrepared"
                                                value="yes"
                                                checked={formData.financiallyPrepared === 'yes'}
                                                onChange={handleChange}
                                                className="w-5 h-5 mr-2"
                                                required
                                            />
                                            <span className="select-none">Yes</span>
                                        </label>
                                        <label className="flex items-center h-10 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="financiallyPrepared"
                                                value="no"
                                                checked={formData.financiallyPrepared === 'no'}
                                                onChange={handleChange}
                                                className="w-5 h-5 mr-2"
                                            />
                                            <span className="select-none">No</span>
                                        </label>
                                    </div>
                                    {validationErrors.financiallyPrepared && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.financiallyPrepared}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-sm sm:text-base">If you have to leave town, emergently or planned, where would your pet stay?</label>
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

                                <div className="border-t pt-5 sm:pt-6 mt-5 sm:mt-6">
                                    <h3 className="text-base sm:text-lg font-medium mb-4">Personal Reference</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2 font-medium text-sm sm:text-base">Name</label>
                                            <input
                                                type="text"
                                                name="reference.name"
                                                value={formData.reference.name}
                                                onChange={handleChange}
                                                className={`${getInputClassName('reference.name')} h-11`}
                                                required
                                            />
                                            {validationErrors['reference.name'] && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors['reference.name']}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block mb-2 font-medium text-sm sm:text-base">Email</label>
                                            <input
                                                type="text"
                                                name="reference.email"
                                                value={formData.reference.email}
                                                onChange={handleChange}
                                                className={`${getInputClassName('reference.email')} h-11`}
                                                required
                                                placeholder="example@email.com"
                                            />
                                            {validationErrors['reference.email'] && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors['reference.email']}</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-2 font-medium text-sm sm:text-base">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="reference.phone"
                                                value={formData.reference.phone}
                                                onChange={handleChange}
                                                onKeyPress={handlePhoneKeyPress}
                                                className={`${getInputClassName('reference.phone')} h-11`}
                                                required
                                                placeholder="09XXXXXXXXX"
                                                inputMode="numeric" // Tells mobile devices to show a numeric keyboard
                                                pattern="[0-9]*" // Additional hint for browsers
                                            />
                                            {validationErrors['reference.phone'] && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors['reference.phone']}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">Must be 11 digits starting with 0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 sm:mt-8 border-t pt-5 sm:pt-6">
                                <h3 className="text-base sm:text-lg font-medium mb-4">Terms and Conditions</h3>
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-6 max-h-48 sm:max-h-64 overflow-y-auto text-sm">
                                    <p className="mb-3 sm:mb-4">By clicking the submit button:</p>
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
                                    <div className="flex items-center h-6">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            name="termsAccepted"
                                            checked={formData.termsAccepted}
                                            onChange={handleChange}
                                            className={`w-5 h-5 ${validationErrors.termsAccepted ? "border-red-500" : "border-gray-300"} rounded`}
                                            required
                                        />
                                    </div>
                                    <label htmlFor="terms" className="ml-3 block text-sm sm:text-base font-medium cursor-pointer">
                                        I have read and agree to all terms and conditions
                                    </label>
                                </div>
                                {validationErrors.termsAccepted && (
                                    <p className="mb-4 text-sm text-red-600">{validationErrors.termsAccepted}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || hasValidationErrors() || !isFormComplete() || hasExistingApplication}
                                    className={`w-full py-3 sm:py-4 px-4 font-medium rounded-md shadow-sm transition-colors text-base ${loading || hasValidationErrors() || !isFormComplete() || hasExistingApplication
                                        ? 'bg-teal-400 cursor-not-allowed text-white'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                                        }`}
                                >
                                    {loading ? 'Submitting...' : hasExistingApplication ? 'Already Applied' : 'Submit Application'}
                                </button>
                            </div>

                            <p className="mt-4 text-xs sm:text-sm text-gray-500 text-center">
                                By submitting, you agree to be contacted by the shelter about your application.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}