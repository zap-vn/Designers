import { authService } from '../authService';
import { STORAGE_KEYS } from '../../constants/storage';

export interface LoginRequest {
    UserName: string;
    Password: string;
    MerchantName: string;
    IsRemember: boolean;
}

export interface LoginResponse {
    MerchantName: string;
    AccessToken: string;
    Acronym: string;
    Avatar: string;
    Color: string;
    ExpiresIn: number;
    FullName: string;
    RefreshToken: string;
    Role: string;
    UpdateDate: string;
    UserGuid: string;
    Permissions: any[];
    Screens: any[];
}

/**
 * Login API Service
 * Calls the core authService.post to perform login
 */
export const loginApi = {
    loginV4: async (payload: LoginRequest): Promise<LoginResponse> => {
        const endpoint = process.env.NEXT_PUBLIC_API_LOGIN_V4 || 'api/v1/authentication/loginV4';

        const data = await authService.post<LoginResponse>(endpoint, payload);

        // Success handling: Store token if needed
        if (data.AccessToken && typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.AccessToken);
        }

        return data;
    }
};
