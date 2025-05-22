"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authInitialized, setAuthInitialized] = useState(false);
    const router = useRouter();

    // Initialize from session storage first (for immediate UI response)
    useEffect(() => {
        const storedAdmin = sessionStorage.getItem('adminData');
        if (storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
                console.log("Admin loaded from session storage initially");
            } catch (e) {
                console.error("Failed to parse stored admin data");
                sessionStorage.removeItem('adminData');
            }
        }
    }, []);

    // Combined authentication check - only run this once
    useEffect(() => {
        const verifyAdminAuth = async () => {
            try {
                setLoading(true);
                const token = Cookies.get('adminToken');

                if (!token) {
                    console.log("No admin token found in cookie");
                    setAdmin(null);
                    sessionStorage.removeItem('adminData');
                    setLoading(false);
                    setAuthInitialized(true);
                    return;
                }

                // Try to verify the existing token
                try {
                    const response = await axios.get('/api/admin/auth/check', {
                        headers: { 'Cache-Control': 'no-cache' },
                        params: { _t: Date.now() }
                    });

                    if (response.data && response.data.admin) {
                        console.log("Admin verified with API:", response.data.admin);
                        setAdmin(response.data.admin);
                        sessionStorage.setItem('adminData', JSON.stringify(response.data.admin));
                        setLoading(false);
                        setAuthInitialized(true);
                        return;
                    }
                } catch (verifyError) {
                    console.log("Admin auth check failed, trying token refresh");
                    // Continue to token refresh attempt
                }

                // If verification failed, try to refresh the token
                try {
                    const refreshResponse = await axios.post('/api/admin/refresh-token');

                    if (refreshResponse.data.success) {
                        console.log("Admin token refreshed successfully");
                        setAdmin(refreshResponse.data.admin);
                        sessionStorage.setItem('adminData', JSON.stringify(refreshResponse.data.admin));
                    } else {
                        console.log("Admin token refresh failed");
                        setAdmin(null);
                        sessionStorage.removeItem('adminData');
                    }
                } catch (refreshError) {
                    console.error("Admin token refresh failed:", refreshError);
                    // Only clear on auth failures, not network errors
                    if (refreshError.response && refreshError.response.status === 401) {
                        setAdmin(null);
                        sessionStorage.removeItem('adminData');
                    }
                }
            } finally {
                setLoading(false);
                setAuthInitialized(true);
            }
        };

        verifyAdminAuth();
    }, []);

    const adminLogin = async (adminId, password, adminCode) => {
        try {
            setLoading(true);
            const response = await axios.post('/api/admin/login', {
                admin_id: adminId,
                password,
                adminCode
            });

            // Store admin data in state and session storage
            setAdmin(response.data.admin);
            sessionStorage.setItem('adminData', JSON.stringify(response.data.admin));

            // Ensure the cookie is set client-side too as a fallback
            Cookies.set('adminToken', response.data.token, {
                expires: 7,
                path: '/',
                sameSite: 'lax'
            });

            // Don't redirect here - just return success
            return { success: true };
        } catch (error) {
            console.error('Admin login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        } finally {
            setLoading(false);
        }
    };

    const adminLogout = async () => {
        try {
            // Flag to prevent refresh attempts during logout
            sessionStorage.setItem('adminLoggingOut', 'true');

            // Make the API request first, while we still have the token
            await axios.post('/api/admin/logout');
            console.log('Admin logout API request successful');
        } catch (error) {
            // Don't throw an error if the API request fails
            console.error('Admin logout API request failed:', error);
        } finally {
            // Always clear state regardless of API success
            setAdmin(null);
            Cookies.remove('adminToken');
            sessionStorage.removeItem('adminData');

            // Use router.push in a setTimeout to ensure state updates first
            setTimeout(() => {
                router.push('/login/admin');
                // Clear the logout flag after navigation
                setTimeout(() => {
                    sessionStorage.removeItem('adminLoggingOut');
                }, 500);
            }, 0);
        }
    };

    const refreshAdminToken = async () => {
        try {
            // Check if we're in the process of logging out
            if (sessionStorage.getItem('adminLoggingOut') === 'true') {
                console.log('Skipping token refresh during logout process');
                return false;
            }

            const response = await axios.post('/api/admin/refresh-token');

            if (response.data.success) {
                setAdmin(response.data.admin);
                sessionStorage.setItem('adminData', JSON.stringify(response.data.admin));
                return true;
            }
            return false;
        } catch (error) {
            // Only log the error during refresh, don't throw
            console.error('Failed to refresh admin token:', error);
            return false;
        }
    };

    return (
        <AdminAuthContext.Provider value={{
            admin,
            loading,
            authInitialized,
            isAuthenticated: !!admin,
            adminLogin,
            adminLogout,
            refreshAdminToken
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};