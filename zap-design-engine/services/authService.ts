/**
 * Core API Service
 * Handles GET, POST, PUT, DELETE with automatic token injection
 */

import { STORAGE_KEYS } from '../constants/storage';

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL || '';

const getHeaders = (customHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept-Language': 'vi',
        'X-Language': 'vi',
        'Accept': 'application/json',
        ...customHeaders,
    };

    // Auto-inject token from localStorage or Cookies if exists
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // API trả về PascalCase "Message" theo format của bạn
        const errorMessage = errorData.Message || errorData.message || `API Error: ${response.status}`;
        throw new Error(errorMessage);
    }
    return response.json();
};

export const authService = {
    get: async <T>(endpoint: string, headers: Record<string, string> = {}): Promise<T> => {
        const response = await fetch(`${getBaseUrl()}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(headers),
            mode: 'cors',
            credentials: 'omit',
        });
        return handleResponse(response);
    },

    post: async <T>(endpoint: string, body: any, headers: Record<string, string> = {}): Promise<T> => {
        const response = await fetch(`${getBaseUrl()}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(headers),
            body: JSON.stringify(body),
            mode: 'cors',
            credentials: 'omit',
        });
        return handleResponse(response);
    },

    put: async <T>(endpoint: string, body: any, headers: Record<string, string> = {}): Promise<T> => {
        const response = await fetch(`${getBaseUrl()}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(headers),
            body: JSON.stringify(body),
            mode: 'cors',
            credentials: 'omit',
        });
        return handleResponse(response);
    },

    delete: async <T>(endpoint: string, headers: Record<string, string> = {}): Promise<T> => {
        const response = await fetch(`${getBaseUrl()}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(headers),
            mode: 'cors',
            credentials: 'omit',
        });
        return handleResponse(response);
    },
};
