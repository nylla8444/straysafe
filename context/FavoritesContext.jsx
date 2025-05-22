'use client';

import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
    const [favoritedPetIds, setFavoritedPetIds] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    // Use a ref to track last refresh time
    const lastRefreshTime = useRef(0);
    // Used to force refetch when needed
    const forceRefreshCounter = useRef(0);

    // Track if user is adopter
    const isAdopter = user?.userType === 'adopter';

    // Function to fetch favorites with debouncing
    const fetchFavorites = useCallback(async (force = false) => {
        // Only fetch if user is authenticated and is an adopter
        if (!isAuthenticated || !isAdopter) {
            setIsLoading(false);
            return;
        }

        // Don't refetch if we fetched recently (within last 2 seconds) unless forced
        const now = Date.now();
        if (!force && now - lastRefreshTime.current < 2000) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Update last refresh time
            lastRefreshTime.current = now;

            const response = await axios.get('/api/favorites');

            if (response.data.success) {
                // Store full favorite data
                setFavorites(response.data.favorites || []);

                // Store just the IDs for quick lookups
                const ids = response.data.favorites.map(pet => pet._id);
                setFavoritedPetIds(ids);
                console.log('Favorites fetched successfully:', ids.length, 'pets');
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError('Failed to load favorites');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, isAdopter]);

    // Check if a pet is favorited
    const isFavorited = useCallback((petId) => {
        // Convert IDs to strings for comparison to handle ObjectId vs string issues
        if (!petId || !favoritedPetIds.length) return false;
        const petIdStr = petId.toString();
        return favoritedPetIds.some(id => id.toString() === petIdStr);
    }, [favoritedPetIds]);

    // Toggle favorite status with improved error handling
    const toggleFavorite = useCallback(async (petId) => {
        if (!isAuthenticated || !isAdopter) {
            return { success: false, message: 'You must be logged in as an adopter' };
        }

        const currentlyFavorited = isFavorited(petId);
        const action = currentlyFavorited ? 'remove' : 'add';

        console.log(`Attempting to ${action} pet ${petId} ${currentlyFavorited ? '(currently favorited)' : '(not currently favorited)'}`);

        try {
            const response = await axios.post('/api/favorites', {
                petId,
                action
            });

            if (response.data.success) {
                console.log(`Successfully ${action}ed pet ${petId}`, response.data);

                // Update local state immediately for better UX
                if (action === 'add') {
                    setFavoritedPetIds(prev => [...prev, petId]);

                    // Additional logic for pet details page
                    if (pathname.includes('/browse/pets/')) {
                        try {
                            const petResponse = await axios.get(`/api/pets/${petId}`);
                            if (petResponse.data.success) {
                                setFavorites(prev => [...prev, petResponse.data.pet]);
                            }
                        } catch (err) {
                            console.error('Error fetching pet details:', err);
                        }
                    }
                } else if (action === 'remove') {
                    // Use the returned favorites from the API
                    if (response.data.favorites) {
                        setFavorites(response.data.favorites);
                        setFavoritedPetIds(response.data.favorites.map(pet => pet._id));
                    } else {
                        // Fallback to local state update
                        const petIdStr = petId.toString();
                        setFavoritedPetIds(prev => prev.filter(id => id.toString() !== petIdStr));
                        setFavorites(prev => prev.filter(pet => pet._id.toString() !== petIdStr));
                    }
                }

                // Increment force refresh counter to trigger a refetch on next navigation
                forceRefreshCounter.current += 1;

                return {
                    success: true,
                    action,
                    message: action === 'add' ? 'Pet added to favorites' : 'Pet removed from favorites'
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to update favorite'
            };
        } catch (err) {
            console.error('Error toggling favorite:', err);
            return { success: false, message: 'Error updating favorites' };
        }
    }, [isAuthenticated, isAdopter, isFavorited, pathname, fetchFavorites]);

    // Force refresh function that can be called directly
    const forceRefresh = useCallback(() => {
        console.log('Forcing favorites refresh');
        return fetchFavorites(true);
    }, [fetchFavorites]);

    // Fetch favorites when the user authentication changes
    useEffect(() => {
        if (isAuthenticated && isAdopter) {
            fetchFavorites(true);
        } else {
            // Clear favorites if user is not authenticated or not an adopter
            setFavoritedPetIds([]);
            setFavorites([]);
            setIsLoading(false);
        }
    }, [isAuthenticated, isAdopter, fetchFavorites]);

    // Refetch favorites when path changes to critical paths or when force refresh counter changes
    useEffect(() => {
        // Critical paths that should trigger a favorites refresh
        const shouldRefreshPaths = ['/browse/pets', '/profile'];

        // Check if current path starts with any of the refresh paths
        const shouldRefresh = shouldRefreshPaths.some(path =>
            pathname?.startsWith(path)
        );

        if (shouldRefresh) {
            console.log('Path change detected, refreshing favorites:', pathname);
            fetchFavorites(true);
        }
    }, [pathname, fetchFavorites, forceRefreshCounter.current]);

    // Listen for focus events to refresh data when user comes back to the tab
    useEffect(() => {
        const handleFocus = () => {
            console.log('Window focused, refreshing favorites');
            fetchFavorites(true);
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchFavorites]);

    return (
        <FavoritesContext.Provider value={{
            favorites,
            favoritedPetIds,
            isLoading,
            error,
            isFavorited,
            toggleFavorite,
            refreshFavorites: forceRefresh,
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === null) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};