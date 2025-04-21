'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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

    // Helper function to set user and cache in localStorage
    const setUserWithCache = (userData) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    };

    // Check authentication on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                console.log("Checking auth status...");
                const token = Cookies.get('token');

                if (!token) {
                    console.log("No token found");
                    setUserWithCache(null);
                    setLoading(false);
                    setAuthInitialized(true);
                    return;
                }

                // If we have a token but auth check fails, try using cached user data
                if (token && !user) {
                    const cachedUser = localStorage.getItem('user');
                    if (cachedUser) {
                        setUserWithCache(JSON.parse(cachedUser));
                    }
                }

                // Token exists, verify with backend
                console.log("Token exists, verifying...");
                const response = await axios.get('/api/auth/check');
                console.log("Auth check successful:", response.data);
                setUserWithCache(response.data.user);

            } catch (error) {
                console.error("Auth check failed:", error);
                Cookies.remove('token'); // Clear invalid token
                setUserWithCache(null);
            } finally {
                setLoading(false);
                setAuthInitialized(true);
            }
        };

        checkAuthStatus();
    }, [router]);

    // Login function 
    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/login', { email, password });
            Cookies.set('token', response.data.token);
            setUserWithCache(response.data.user);

            // We're no longer redirecting here - let the login page handle it
            return { success: true, user: response.data.user };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Even if API fails, clear local state
            Cookies.remove('token');
            localStorage.removeItem('user');
            setUser(null);
            router.push('/login');
        }
    };

    const refreshUser = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/auth/check');
            console.log("Refresh user response:", response.data);
            setUserWithCache(response.data.user);
            return response.data.user;
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check if user is an organization
    const isOrganization = () => {
        return user?.userType === 'organization';
    };

    // Helper function to check if user is an adopter
    const isAdopter = () => {
        return user?.userType === 'adopter';
    };

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