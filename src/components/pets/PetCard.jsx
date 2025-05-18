import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function PetCard({ pet, onFavorite, userRole = 'guest' }) {

    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // Add state for toast notification
    const [toast, setToast] = useState({
        visible: false,
        type: '', // 'add' or 'remove'
        message: ''
    });

    // Only adopters can use favorites feature
    const canUseFavorites = userRole === 'adopter';

    // Check if pet is already in favorites when component loads
    useEffect(() => {
        // Only check favorite status if user is an adopter
        if (canUseFavorites && pet?._id) {
            checkFavoriteStatus();
        }
    }, [canUseFavorites, pet?._id]);

    // Auto-hide toast after delay
    useEffect(() => {
        if (toast.visible) {
            const timer = setTimeout(() => {
                setToast(prev => ({ ...prev, visible: false }));
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [toast.visible]);

    const checkFavoriteStatus = async () => {
        try {
            // Use the OPTIONS method as defined in the API
            const response = await axios({
                method: 'OPTIONS',
                url: `/api/favorites`,
                params: { petId: pet._id }
            });

            if (response.data.success) {
                setIsFavorited(response.data.isFavorited);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
            // Fail silently - just show as not favorited
        }
    };

    // Helper function for organization display names
    const getDisplayName = (name, threshold = 30) => {
        const cleanName = name?.normalize("NFKD").replace(/[^\x00-\x7F]/g, "") || name;

        if (!cleanName || cleanName.length <= threshold) return cleanName;

        return cleanName
            .split(/\s+/)
            .map(word => word[0] || '')
            .join('')
            .toUpperCase();
    };

    // Handle favorite toggle with API call
    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        try {
            setIsLoading(true);
            const newFavoritedState = !isFavorited;
            const action = newFavoritedState ? 'add' : 'remove';

            // Call the API to update favorites
            const response = await axios.post('/api/favorites', {
                petId: pet._id,
                action: action
            });

            if (response.data.success) {
                setIsFavorited(newFavoritedState);

                // Show toast notification based on the action
                setToast({
                    visible: true,
                    type: action,
                    message: newFavoritedState
                        ? `${pet.name} has been added to your favorites!`
                        : `${pet.name} has been removed from your favorites`
                });

                // Call the parent component's handler if provided
                if (onFavorite) {
                    onFavorite(pet, newFavoritedState);
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);

            // Show user-friendly error message as toast
            if (error.response?.status === 403) {
                setToast({
                    visible: true,
                    type: 'error',
                    message: 'You need to be logged in as an adopter to favorite pets'
                });
            } else {
                setToast({
                    visible: true,
                    type: 'error',
                    message: 'There was a problem updating your favorites'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="relative group bg-white rounded-xl shadow-md overflow-hidden border border-amber-100 transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] 
            w-[300px] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)]"
        >
            <div className={`absolute top-0 left-0 w-full h-1 ${pet.status === 'available' ? 'bg-teal-500' :
                pet.status === 'rehabilitating' ? 'bg-orange-500' :
                    'bg-teal-500'
                }`}></div>

            <div className="relative h-56 overflow-hidden">
                <Image
                    src={pet.img_arr[0]}
                    alt={pet.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center 30%'
                    }}
                    priority={true}
                />

                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{
                        background: `linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)`
                    }}
                ></div>

                <div className="absolute top-3 right-3 z-10">
                    <div className={`
                        flex items-center gap-1.5 px-3 py-1 rounded-full 
                        shadow-sm backdrop-blur-md transition-all duration-300 
                        ${pet.status === 'available'
                            ? 'bg-teal-500/85 text-white border border-teal-400/30'
                            : pet.status === 'rehabilitating'
                                ? 'bg-orange-500/85 text-white border border-orange-400/30'
                                : 'bg-teal-500/85 text-white border border-teal-400/30'
                        }
                    `}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        <span className="text-xs font-semibold">
                            {pet.status === 'available' ? 'Available' :
                                pet.status === 'rehabilitating' ? 'Rehabilitating' : 'Adopted'}
                        </span>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 z-10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <Link
                        href={`/browse/pets/${pet._id}`}
                        className="inline-block w-full py-2 text-center bg-white/90 backdrop-blur-sm text-orange-600 font-medium rounded-lg hover:bg-white hover:text-orange-700 transition-colors duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        View Full Profile
                    </Link>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 relative">
                        <h3 className="font-bold text-xl text-gray-800 leading-tight group-hover:text-orange-500 transition-colors duration-300 
                        truncate max-w-[10ch] lg:max-w-[15ch]">
                            {pet.name}
                        </h3>

                        {pet.name.length > 10 && (
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                            left-0 top-full mt-1 z-50 bg-gray-900/90 backdrop-blur-sm text-white text-sm 
                            rounded-md px-2.5 py-1.5 shadow-lg pointer-events-none">
                                {pet.name}
                            </div>
                        )}

                        {pet.age && (
                            <p className="text-sm text-gray-500 mt-0.5">{pet.age} old</p>
                        )}
                    </div>

                    {/* Only show favorite button for adopters */}
                    {canUseFavorites && (
                        <button
                            className={`relative z-10 flex-shrink-0 p-1.5 rounded-full transition-colors duration-200 
                            ${isLoading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : isFavorited
                                        ? 'text-rose-500 bg-rose-50'
                                        : 'text-gray-400 hover:text-orange-500 hover:bg-amber-50'}`}
                            onClick={handleFavoriteClick}
                            disabled={isLoading}
                            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin"></div>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    stroke={isFavorited ? "none" : "currentColor"}
                                    fill={isFavorited ? "currentColor" : "none"}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            )}
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-y-2 mb-3">
                    <div className="w-full flex items-center text-gray-600">
                        {pet.specie === 'dog' ? (
                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 9.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm-3.842 3.635c-.17-.216-.32-.442-.447-.677l-3.091.548c.292.493.638.956 1.023 1.371l2.515-1.242zm-9.097.715c.366.219.764.387 1.187.497l.138-2.114c-.401-.103-.769-.258-1.095-.468l-.23 2.085zm7.842-3.850l3.097.545c.14-.495.212-1.009.212-1.545 0-1.253-.37-2.42-1.003-3.407l-2.306 4.407zm-5.903-4.615l-1.195 1.088c-.526.478-.866 1.108-.994 1.773l3.294-.05c-.012-.595-.15-1.16-.4-1.67l-.705-1.141zm-2.293 7.073l-2.549 1.161c.328.587.749 1.101 1.242 1.525l1.396-2.027c-.033-.219-.057-.441-.067-.667l-.022.008zm11.09-10.403c-.938-.531-2.022-.835-3.171-.835-2.479 0-4.593 1.396-5.654 3.427l3.582 2.164c.475-.911 1.418-1.535 2.523-1.535.187 0 .37.018 .544.053l2.176-3.274z" />
                            </svg>
                        ) : pet.specie === 'cat' ? (
                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11.197 9c0 .556-.63 1-1.406 1-.773 0-1.4-.444-1.4-1 0-.554.627-1 1.4-1s1.406.446 1.406 1zM6 9c0 .556-.635 1-1.41 1-.77 0-1.395-.444-1.395-1 0-.554.625-1 1.394-1C5.365 8 6 8.446 6 9zm13.404 3.9c0 1.989-.635 3.673-2.08 4.69C16.726 18.073 15.343 18 14.64 18H14c-.878 0-1.673-.487-2-1.146-.323.659-1.122 1.146-2 1.146h-.642c-.7 0-2.085.073-2.682-.41C5.23 16.573 5 14.889 5 12.9c0-5.182 2.903-6.9 7.2-6.9s7.204 1.718 7.204 6.9zM4.5 7A3.5 3.5 0 0 1 1 3.5c.002-.814.19-1.552.8-2.173.475-.486 1.13-.827 2.256-.827C5.56.5 7 2.274 7 3.5 7 5.817 5.309 7 4.5 7zm11 0c-.809 0-2.5-1.183-2.5-3.5C13 2.274 14.44.5 15.944.5c1.127 0 1.782.341 2.257.827.61.621.796 1.359.799 2.173A3.5 3.5 0 0 1 15.5 7z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3 8H6v1h6v-1zm0-3H6v1h6v-1zm5-3H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm1 10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1v-6h17v6z" />
                            </svg>
                        )}
                        <span className="text-sm">
                            <span className="font-medium">{pet.breed}</span> {pet.specie?.charAt(0).toUpperCase() + pet.specie?.slice(1)}
                        </span>
                    </div>

                    <div className="w-1/2 flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {pet.gender === 'male' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m0-15a4.5 4.5 0 10-4.5 4.5M12 4.5a4.5 4.5 0 114.5 4.5" />
                            )}
                        </svg>
                        <span className="text-sm">{pet.gender?.charAt(0).toUpperCase() + pet.gender?.slice(1)}</span>
                    </div>

                    {pet.weight && (
                        <div className="w-1/2 flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                            <span className="text-sm">{pet.weight} kg</span>
                        </div>
                    )}
                </div>

                {pet.tags && pet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {pet.tags.slice(0, 2).map(tag => (
                            <span
                                key={tag}
                                className="bg-teal-50 text-teal-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors duration-200"
                            >
                                {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                        ))}
                        {pet.tags.length > 2 && (
                            <span className="bg-gray-50 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                                +{pet.tags.length - 2}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-4 pt-3 border-t border-amber-100 flex justify-between items-center">
                    <div className={`
                        flex items-center gap-1.5 
                        ${pet.adoptionFee > 0 ? 'text-orange-600' : 'text-teal-600'}
                    `}>
                        <span className="font-medium">
                            {pet.adoptionFee > 0 ? `₱${pet.adoptionFee}` : 'Free'}
                        </span>
                    </div>

                    {pet.organization?.organizationName && (
                        <div className="flex items-center">
                            <div className="mr-2 w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center overflow-hidden">
                                {pet.organization.profileImage ? (
                                    <Image
                                        src={pet.organization.profileImage}
                                        alt={pet.organization.organizationName}
                                        width={20}
                                        height={20}
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-teal-500">
                                        {pet.organization.organizationName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span
                                className="text-xs text-gray-600 hover:text-orange-600 transition-colors duration-200 truncate
                                max-w-[100px] "
                                title={pet.organization.organizationName}
                            >
                                {getDisplayName(pet.organization.organizationName)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <Link href={`/browse/pets/${pet._id}`} className="absolute inset-0 z-0" aria-hidden="true"></Link>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        className={`fixed bottom-30 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg 
                            flex items-center gap-3 min-w-[280px] max-w-md
                            ${toast.type === 'add' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' :
                                toast.type === 'remove' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' :
                                    'bg-gradient-to-r from-rose-500 to-pink-500 text-white'}`}
                    >
                        <div className="p-2 rounded-full bg-white/20">
                            {toast.type === 'add' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ) : toast.type === 'remove' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}