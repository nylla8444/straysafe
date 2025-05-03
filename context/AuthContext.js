'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Configure axios to use cookies
axios.defaults.withCredentials = true;
axios.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authInitialized, setAuthInitialized] = useState(false);
    const router = useRouter();

    // Helper function with improved clearing semantics
    const setUserWithCache = useCallback((userData) => {
        console.log("Setting user data:", userData);

        if (userData) {
            // Validate user type to prevent issues
            if (!userData.userType) {
                console.error("Warning: User data missing userType property:", userData);
                return; // Don't set invalid user data
            }

            // Clear any existing data first for clean slate
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');

            // Set new data
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            // Clear everything
            setUser(null);
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
        }
    }, []);

    // Check authentication on mount - improved with better error handling
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                console.log("Checking auth status...");
                const token = Cookies.get('token');

                // Clear state first if no token exists
                if (!token) {
                    console.log("No token found, clearing auth state");
                    setUserWithCache(null);
                    setLoading(false);
                    setAuthInitialized(true);
                    return;
                }

                // Token exists, verify with backend
                console.log("Token exists, verifying...");

                try {
                    const response = await axios.get('/api/auth/check', {
                        headers: { 'Cache-Control': 'no-cache' },
                        params: { _t: Date.now() } // Cache busting
                    });

                    // Validate user type from API response
                    if (!response.data.user || !response.data.user.userType) {
                        throw new Error("Invalid user data received from server");
                    }

                    setUserWithCache(response.data.user);
                } catch (apiError) {
                    console.error("Auth check failed:", apiError);
                    // Clean up invalid auth state
                    Cookies.remove('token', { path: '/' });
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('user');
                    setUser(null);
                }
            } finally {
                setLoading(false);
                setAuthInitialized(true);
            }
        };

        checkAuthStatus();
    }, [setUserWithCache]);

    // Improved login function with better cleanup
    const login = async (email, password) => {
        try {
            // Clear all previous auth state first
            Cookies.remove('token', { path: '/' });
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            setUser(null);

            const response = await axios.post('/api/login', { email, password });

            // Validate user data from login
            if (!response.data.user || !response.data.user.userType) {
                console.error("Login API returned invalid user data:", response.data);
                return {
                    success: false,
                    error: 'Invalid user data received from server'
                };
            }

            console.log("Login successful, user type:", response.data.user.userType);

            // Set cookie with explicit options for better control
            Cookies.set('token', response.data.token, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            // Set user data after cookie is set
            setUserWithCache(response.data.user);

            return { success: true, user: response.data.user };
        } catch (error) {
            console.error("Login error:", error);
            // Clean up any partial state
            Cookies.remove('token', { path: '/' });
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            setUser(null);

            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    // Complete logout with hard reload
    const logout = async () => {
        try {
            // First clear all client-side state
            Cookies.remove('token', { path: '/' });
            localStorage.clear(); // Clear ALL localStorage
            sessionStorage.clear(); // Clear ALL sessionStorage
            setUser(null);

            // Then call logout API
            await axios.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Force a complete page reload instead of a client-side navigation
            window.location.href = '/login';
        }
    };

    // Improved refresh function
    const refreshUser = async () => {
        try {
            console.log("Refreshing user data...");
            setLoading(true);

            const response = await axios.get('/api/auth/check', {
                headers: { 'Cache-Control': 'no-cache' },
                params: { _t: Date.now() } // Cache busting
            });

            // Validate refreshed user data
            if (!response.data.user || !response.data.user.userType) {
                console.error("Warning: Invalid user data from refresh:", response.data);
                throw new Error("Invalid user data received");
            }

            // Update user data
            setUserWithCache(response.data.user);
            return response.data.user;
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Helper functions with better logging
    const isOrganization = useCallback(() => {
        const result = user?.userType === 'organization';
        console.log("isOrganization check:", { result, userType: user?.userType, userId: user?._id });
        return result;
    }, [user]);

    const isAdopter = useCallback(() => {
        const result = user?.userType === 'adopter';
        console.log("isAdopter check:", { result, userType: user?.userType, userId: user?._id });
        return result;
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            authInitialized,
            login,
            logout,
            refreshUser,
            isOrganization,
            isAdopter
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);