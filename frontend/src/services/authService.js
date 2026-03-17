import api from '../api';

/**
 * Authentication API service.
 * Centralizes all auth-related API calls.
 */

export const sendVerificationCode = async (email) => {
    const response = await api.post('auth/send-verification/', { email });
    return response.data;
};

export const verifyEmail = async (email, code) => {
    const response = await api.post('auth/verify-email/', { email, code });
    return response.data;
};

export const requestPasswordReset = async (email) => {
    const response = await api.post('auth/request-password-reset/', { email });
    return response.data;
};

export const resetPassword = async (email, code, new_password) => {
    const response = await api.post('auth/reset-password/', { email, code, new_password });
    return response.data;
};
