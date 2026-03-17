import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
    baseURL: 'https://stick-gen-boundary-alloy.trycloudflare.com/api/',
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
    (config) => {
        // Skip auth header for refresh requests to avoid loops
        if (config.url && config.url.includes('auth/jwt/refresh')) {
            return config;
        }

        if (!config.headers.Authorization) {
            const tokens = localStorage.getItem('authTokens')
                ? JSON.parse(localStorage.getItem('authTokens'))
                : null;

            if (tokens?.access) {
                try {
                    const decoded = jwtDecode(tokens.access);
                    const isExpired = decoded.exp < Date.now() / 1000;
                    if (!isExpired) {
                        config.headers.Authorization = `JWT ${tokens.access}`;
                    }
                } catch (e) {
                    // Invalid token, skip
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const tokens = localStorage.getItem('authTokens')
                ? JSON.parse(localStorage.getItem('authTokens'))
                : null;

            if (tokens?.refresh) {
                try {
                    // Use fresh axios instance to avoid infinite loops
                    const refreshResponse = await axios.post('https://stick-gen-boundary-alloy.trycloudflare.com/api/auth/jwt/refresh/', {
                        refresh: tokens.refresh,
                    });

                    if (refreshResponse.status === 200) {
                        // Merge: keep existing refresh token
                        const newTokens = {
                            ...tokens,
                            access: refreshResponse.data.access,
                        };
                        localStorage.setItem('authTokens', JSON.stringify(newTokens));

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `JWT ${newTokens.access}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    localStorage.removeItem('authTokens');
                    window.location.href = '/login';
                }
            } else {
                localStorage.removeItem('authTokens');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
