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

    const [formData, setFormData] = useState({
        housingStatus: '', // Rent or own
        petsAllowed: '', // Are pets allowed - now blank
        petLocation: '', // Where will pet stay
        primaryCaregiver: '', // Who will care for pet
        otherPets: '', // Do you have other pets - now blank
        financiallyPrepared: '', // Financial preparedness - now blank
        emergencyPetCare: '', // Where pet would stay during emergency
        reference: {
            name: '',
            email: '',
            phone: ''
        },
        termsAccepted: false // Terms and conditions checkbox
    });

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

        // Fetch pet data
        const fetchPet = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/pets/${petId}`);
                if (response.data.success) {
                    setPet(response.data.pet);
                } else {
                    setError('Unable to load pet information.');
                }
            } catch (err) {
                console.error('Failed to fetch pet:', err);
                setError('Failed to load pet information. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
    }, [petId, isAuthenticated, router, isAdopter]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

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
        } else {
            // Handle regular fields
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.termsAccepted) {
            alert('You must agree to the terms and conditions to proceed.');
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
                                <p className="text-gray-900">{pet.adoptionFee > 0 ? `$${pet.adoptionFee}` : 'Free'}</p>
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
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="">Please select</option>
                                        <option value="own">Own</option>
                                        <option value="rent">Rent</option>
                                        <option value="live with friends/relatives">Live with friends/relatives</option>
                                        <option value="other">Other</option>
                                    </select>
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
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Where will the adopted pet stay most of the time?</label>
                                    <textarea
                                        name="petLocation"
                                        value={formData.petLocation}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        rows="2"
                                        placeholder="E.g. Inside the house, backyard, etc."
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Who will primarily care for the pet?</label>
                                    <input
                                        type="text"
                                        name="primaryCaregiver"
                                        value={formData.primaryCaregiver}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Name and relationship to you"
                                        required
                                    />
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
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">If you have to leave town, emergently or planned, where would your pet stay?</label>
                                    <textarea
                                        name="emergencyPetCare"
                                        value={formData.emergencyPetCare}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        rows="3"
                                        placeholder="Describe your emergency care plan"
                                        required
                                    ></textarea>
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
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-2 font-medium">Email</label>
                                            <input
                                                type="email"
                                                name="reference.email"
                                                value={formData.reference.email}
                                                onChange={handleChange}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-2 font-medium">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="reference.phone"
                                                value={formData.reference.phone}
                                                onChange={handleChange}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                required
                                            />
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
                                            className="w-4 h-4 border border-gray-300 rounded"
                                            required
                                        />
                                    </div>
                                    <label htmlFor="terms" className="ml-2 text-sm font-medium">
                                        I have read and agree to all terms and conditions
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
                                >
                                    Submit Application
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