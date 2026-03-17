import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => {
        const stored = localStorage.getItem('authTokens');
        return stored ? JSON.parse(stored) : null;
    });
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('authTokens');
        if (stored) {
            try {
                const tokens = JSON.parse(stored);
                return jwtDecode(tokens.access);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(true);

    const loginUser = async (email, password) => {
        try {
            // Use raw axios to avoid interceptor attaching old tokens
            const response = await axios.post('/api/auth/jwt/create/', { email, password });
            if (response.status === 200) {
                setAuthTokens(response.data);
                setUser(jwtDecode(response.data.access));
                localStorage.setItem('authTokens', JSON.stringify(response.data));
                return { success: true };
            }
        } catch (error) {
            console.error("Login failed:", error);
            const detail = error.response?.data?.detail;
            const nonFieldErrors = error.response?.data?.non_field_errors;

            let errorMessage = "Login failed";
            if (detail) {
                errorMessage = detail;
            } else if (nonFieldErrors) {
                errorMessage = Array.isArray(nonFieldErrors)
                    ? nonFieldErrors.join(' ')
                    : nonFieldErrors;
            }

            return { success: false, error: errorMessage };
        }
    };

    const registerUser = async (email, username, password, re_password) => {
        try {
            await axios.post('/api/auth/users/', { email, username, password, re_password });
            return { success: true };
        } catch (error) {
            console.error("Registration failed:", error);
            return { success: false, error: error.response?.data || "Registration failed" };
        }
    };

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    }, []);

    const updateToken = useCallback(async () => {
        if (!authTokens?.refresh) {
            logoutUser();
            return;
        }

        try {
            // Use raw axios to avoid interceptor loop
            const response = await axios.post('/api/auth/jwt/refresh/', {
                refresh: authTokens.refresh,
            });

            if (response.status === 200) {
                // Merge: refresh response only returns `access`, keep existing `refresh`
                const newTokens = {
                    ...authTokens,
                    access: response.data.access,
                };
                setAuthTokens(newTokens);
                setUser(jwtDecode(newTokens.access));
                localStorage.setItem('authTokens', JSON.stringify(newTokens));
            } else {
                logoutUser();
            }
        } catch (error) {
            console.error("Token refresh failed", error);
            logoutUser();
        }
    }, [authTokens, logoutUser]);

    useEffect(() => {
        if (loading) {
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        if (authTokens) {
            try {
                const decoded = jwtDecode(authTokens.access);
                const isExpired = decoded.exp < Date.now() / 1000;

                if (isExpired) {
                    updateToken();
                } else {
                    // Refresh 2 minutes before expiry
                    const timeUntilExpiry = (decoded.exp * 1000) - Date.now() - (1000 * 60 * 2);

                    if (timeUntilExpiry > 0) {
                        const timer = setTimeout(() => {
                            updateToken();
                        }, timeUntilExpiry);
                        return () => clearTimeout(timer);
                    } else {
                        updateToken();
                    }
                }
            } catch (e) {
                console.error("JWT decode failed:", e);
                logoutUser();
            }
        }
    }, [authTokens, updateToken, logoutUser]);

    const contextData = {
        user,
        authTokens,
        loginUser,
        registerUser,
        logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
