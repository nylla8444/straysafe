'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../../context/AuthContext'; // Add this import

export default function PetDetailPage({ params }) {
    // Properly handle the Promise-based params
    const resolvedParams = use(params);
    const petId = resolvedParams.id;

    const { user, isAuthenticated, isAdopter } = useAuth(); // Add auth context

    const [pet, setPet] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [hasExistingApplication, setHasExistingApplication] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('');

    // Add this useEffect for scroll detection
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Add this function to scroll to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchPetAndApplicationData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/pets/${petId}`);

                if (response.data.success) {
                    setPet(response.data.pet);

                    // Check for existing applications if the user is authenticated
                    if (isAuthenticated && isAdopter()) {
                        const applicationsResponse = await axios.get('/api/adoptions/adopter');
                        if (applicationsResponse.data.success) {
                            const applications = applicationsResponse.data.applications;
                            const existingApp = applications.find(
                                app => app.petId._id === petId &&
                                    ['pending', 'reviewing', 'approved'].includes(app.status)
                            );

                            if (existingApp) {
                                setHasExistingApplication(true);
                                setApplicationStatus(existingApp.status);
                            }
                        }
                    }
                } else {
                    setError('Failed to load pet information.');
                }
            } catch (err) {
                console.error('Error fetching pet details:', err);
                setError('Unable to load pet information. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (petId) {
            fetchPetAndApplicationData();
        }
    }, [petId, isAuthenticated, isAdopter]);

    const nextImage = () => {
        if (pet?.img_arr?.length > 1) {
            setActiveImageIndex(prev => (prev === pet.img_arr.length - 1 ? 0 : prev + 1));
        }
    };

    const prevImage = () => {
        if (pet?.img_arr?.length > 1) {
            setActiveImageIndex(prev => (prev === 0 ? pet.img_arr.length - 1 : prev - 1));
        }
    };

    const selectImage = (index) => {
        setActiveImageIndex(index);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'available':
                return <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">Available</span>;
            case 'rehabilitating':
                return <span className="bg-amber-100 text-amber-700 text-sm font-medium px-3 py-1 rounded-full">Rehabilitating</span>;
            case 'adopted':
                return <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">Adopted</span>;
            default:
                return null;
        }
    };

    const canUserAdopt = () => {
        if (!isAuthenticated) return false;
        if (!isAdopter()) return false;

        // Only check if the user is active (not suspended)
        if (user && user.status === 'active') {
            return true;
        }

        return false;
    };

    const getAdoptionButtonMessage = () => {
        if (!isAuthenticated) {
            return "Sign in to adopt";
        } else if (!isAdopter()) {
            return "Only adopters can submit applications";
        } else if (user && user.status === 'suspended') {
            return "Your account is suspended";
        } else if (user && user.status !== 'active') {
            return "Your account is not active";
        }

        return "Request to Adopt";
    };

    const renderAdoptionCTA = () => {
        if (pet.status !== 'available') {
            return (
                <div className="w-full mb-6 px-6 py-4 bg-gray-100 border border-gray-200 rounded-lg text-center">
                    <p className="text-gray-600">
                        {pet.status === 'rehabilitating'
                            ? `${pet.name} is currently being rehabilitated and not available for adoption yet.`
                            : `${pet.name} has already been adopted and found a forever home.`}
                    </p>
                </div>
            );
        }

        if (canUserAdopt()) {
            // User can adopt - but check if they already applied
            if (hasExistingApplication) {
                return (
                    <button
                        disabled
                        className="w-full mb-6 px-6 py-3 bg-gray-400 text-white text-lg font-medium rounded-lg cursor-not-allowed"
                    >
                        {applicationStatus === 'approved' ? 'Application Approved' :
                            applicationStatus === 'reviewing' ? 'Application Being Reviewed' :
                                'Already Applied'}
                    </button>
                );
            }

            // Normal adoption button (no existing application)
            return (
                <Link
                    href={`/adopt/${pet._id}`}
                    className="w-full mb-6 px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center group"
                >
                    <span>Request to Adopt</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            );
        } else {
            // User cannot adopt - show appropriate message
            return (
                <div className="mb-6 space-y-3">
                    <div className="px-6 py-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                        <p className="text-blue-700">{getAdoptionButtonMessage()}</p>
                    </div>

                    {!isAuthenticated && (
                        <Link
                            href={`/login?redirect=/browse/pets/${pet._id}`}
                            className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                            Sign in to continue
                        </Link>
                    )}
                </div>
            );
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="animate-pulse flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading pet details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="flex justify-start mb-6">
                    <Link href="/browse/pets" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back to Pets
                    </Link>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex">
                        <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="flex justify-start mb-6">
                    <Link href="/browse/pets" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back to Pets
                    </Link>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                    <p className="text-amber-700">Pet not found. The pet may have been removed or is no longer available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto md:p-6 lg:p-8 ">
            {/* Enhanced back navigation with hover effect */}
            <div className="mb-8">
                <Link
                    href="/browse/pets"
                    className="group inline-flex items-center text-gray-600 hover:text-blue-600 transition-all duration-300"
                >
                    <div className="mr-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm group-hover:border-blue-200 group-hover:-translate-x-1 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="font-medium">Back to pets</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {/* Pet name banner for mobile view */}
                <div className="md:hidden bg-gradient-to-r from-blue-600 to-blue-700 p-5">
                    <h1 className="text-2xl font-bold text-white">{pet.name}</h1>
                    <p className="text-blue-100">
                        {pet.breed} • {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)} • {pet.specie.charAt(0).toUpperCase() + pet.specie.slice(1)}
                    </p>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
                    {/* Left column - Enhanced Image Gallery */}
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 pb-0 md:p-8">
                        {/* Status badge - more visually prominent */}
                        <div className="absolute top-4 right-4 z-10">
                            <div className={`
                                flex items-center gap-1.5 px-3 py-1 rounded-full 
                                shadow-md backdrop-blur-lg transition-all duration-300 
                                ${pet.status === 'available'
                                    ? 'bg-green-500/90 text-white border border-green-400/30'
                                    : pet.status === 'rehabilitating'
                                        ? 'bg-amber-500/90 text-white border border-amber-400/30'
                                        : 'bg-blue-500/90 text-white border border-blue-400/30'
                                }
                            `}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                <span className="text-xs font-semibold">
                                    {pet.status === 'available' ? 'Available' :
                                        pet.status === 'rehabilitating' ? 'Rehabilitating' : 'Adopted'}
                                </span>
                            </div>
                        </div>

                        {/* Main image with enhanced presentation */}
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 shadow-lg mb-5">
                            {pet.img_arr && pet.img_arr.length > 0 ? (
                                <Image
                                    src={pet.img_arr[activeImageIndex]}
                                    alt={`${pet.name}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 500px"
                                    className="object-cover transition-opacity duration-500"
                                    priority={true}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}

                            {/* Enhanced image navigation controls */}
                            {pet.img_arr && pet.img_arr.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                                        aria-label="Previous image"
                                    >
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                                        aria-label="Next image"
                                    >
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* Image counter */}
                                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                                        {activeImageIndex + 1}/{pet.img_arr.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Enhanced thumbnails with visual indicators */}
                        {pet.img_arr && pet.img_arr.length > 1 && (
                            <div className="pb-6 md:pb-0">
                                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2.5">More photos</p>
                                <div className="grid grid-cols-5 gap-2.5">
                                    {pet.img_arr.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => selectImage(index)}
                                            className={`
                                                relative aspect-square rounded-lg overflow-hidden transition-all duration-300
                                                ${index === activeImageIndex
                                                    ? 'ring-2 ring-blue-500 ring-offset-2 shadow-md scale-105'
                                                    : 'opacity-80 hover:opacity-100 hover:shadow-md border border-gray-200'
                                                }
                                            `}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${pet.name} thumbnail ${index + 1}`}
                                                fill
                                                sizes="100px"
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column - Pet Information with enhanced styling */}
                    <div className="p-6 md:p-8">
                        {/* Enhanced pet name section with desktop view */}
                        <div className="hidden md:block mb-6">
                            <div className="flex flex-wrap items-start justify-between gap-y-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">{pet.name}</h1>
                                {getStatusBadge(pet.status)}
                            </div>

                            <div className="flex flex-wrap items-center mt-2 text-gray-600">
                                <div className="flex items-center mr-4 mb-2">
                                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0V5z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">{pet.breed}</span>
                                </div>
                                <div className="flex items-center mr-4 mb-2">
                                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        {pet.gender === 'male' ? (
                                            <path d="M10 2a1 1 0 011 1v1h2a1 1 0 110 2h-2v2a5 5 0 11-2 0V6H7a1 1 0 110-2h2V3a1 1 0 011-1z" />
                                        ) : (
                                            <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM7 10a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 11-2 0v-5H9v5a1 1 0 11-2 0v-7z" />
                                        )}
                                    </svg>
                                    <span className="text-sm">{pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}</span>
                                </div>
                                <div className="flex items-center mr-4 mb-2">
                                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">{pet.specie.charAt(0).toUpperCase() + pet.specie.slice(1)}</span>
                                </div>
                                {pet.age && (
                                    <div className="flex items-center mb-2">
                                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm">{pet.age} old</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Adoption fee with enhanced styling */}
                        <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-600 font-medium">Adoption Fee</p>
                                <div className={`text-xl font-bold ${pet.adoptionFee > 0 ? 'text-emerald-600' : 'text-blue-600'
                                    }`}>
                                    {pet.adoptionFee > 0 ? `₱${pet.adoptionFee}` : 'Free'}
                                </div>
                            </div>
                        </div>

                        {/* Enhanced characteristics section */}
                        {pet.tags && pet.tags.length > 0 && (
                            <div className="mb-8">
                                <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Characteristics
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {pet.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100"
                                        >
                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </span>
                                    ))}

                                </div>
                            </div>
                        )}

                        {/* Enhanced description section */}
                        <div className="mb-8">
                            <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                About {pet.name}
                            </h2>
                            <div className="prose prose-blue max-w-none text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <p className="whitespace-pre-wrap">{pet.info || `No additional information is available about ${pet.name}.`}</p>
                            </div>
                        </div>

                        {/* Call-to-action for available pets */}
                        {renderAdoptionCTA()}
                    </div>
                </div>

                {/* Enhanced shelter information with card design */}
                {pet.organization && (
                    <div className="border-t border-gray-200 bg-gradient-to-br from-blue-50 to-white">
                        <div className="p-6 md:p-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Adoption Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Shelter card */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-semibold text-gray-800 mb-4">About the Shelter</h3>
                                    <div className="flex items-start">
                                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex-shrink-0 overflow-hidden relative mr-4 border-2 border-white shadow-sm">
                                            {pet.organization.profileImage ? (
                                                <Image
                                                    src={pet.organization.profileImage}
                                                    alt={pet.organization.organizationName}
                                                    fill
                                                    sizes="64px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                                    {pet.organization.organizationName?.charAt(0).toUpperCase() || 'O'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg text-gray-800">{pet.organization.organizationName}</div>
                                            <div className="text-gray-600 flex items-center mt-1 mb-3">
                                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                {pet.organization.location || 'Location not specified'}
                                            </div>
                                            <Link
                                                href={`/browse/shelters/${pet.organization._id}`}
                                                className="text-blue-600 hover:text-blue-800 inline-flex items-center group"
                                            >
                                                <span className="group-hover:underline">Visit shelter</span>
                                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact card */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-semibold text-gray-800 mb-2">Interested in adopting {pet.name}?</h3>
                                    <p className="text-gray-600 mb-4">
                                        Contact the shelter directly to inquire about adopting this pet or schedule a visit.
                                    </p>

                                    <div className="space-y-3">
                                        {pet.organization.contactNumber && (
                                            <a
                                                href={`tel:${pet.organization.contactNumber}`}
                                                className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
                                            >
                                                <div className="mr-3 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800">Phone</div>
                                                    <div className="text-blue-600 group-hover:text-blue-700 transition-colors">{pet.organization.contactNumber}</div>
                                                </div>
                                            </a>
                                        )}

                                        {pet.organization.email && (
                                            <a
                                                href={`mailto:${pet.organization.email}`}
                                                className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
                                            >
                                                <div className="mr-3 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800">Email</div>
                                                    <div className="text-blue-600 group-hover:text-blue-700 transition-colors">{pet.organization.email}</div>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Add the Floating Back to Top Button right before the Mobile Bottom Navigation */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.button
                        onClick={scrollToTop}
                        className="md:hidden fixed right-4 bottom-20 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-50"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: [0, -10, 0],
                            transition: {
                                y: {
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "easeInOut"
                                },
                                opacity: { duration: 0.3 }
                            }
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{
                            backgroundColor: "#3B82F6",
                            boxShadow: "0 8px 15px rgba(59, 130, 246, 0.3)",
                            scale: 1.05
                        }}
                        aria-label="Scroll to top"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>

        </div>
    );
}