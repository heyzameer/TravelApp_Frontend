import api from './api';
import type { ApiResponse, PartnerRegistrationData, PartnerProfile } from '../types';

class PartnerAuthService {
    private readonly TOKEN_KEY = 'authToken';
    private readonly REFRESH_TOKEN_KEY = 'refreshToken';

    async registerPartner(data: PartnerRegistrationData): Promise<any> {
        const response = await api.post<ApiResponse<{
            user: any;
            accessToken: string;
            refreshToken: string;
        }>>('/partner/register-partner', data);

        const { user, accessToken, refreshToken } = response.data.data;
        this.setTokens(accessToken, refreshToken);
        return { user, accessToken, refreshToken };
    }

    async requestLoginOtp(email: string): Promise<ApiResponse<void>> {
        const response = await api.post<ApiResponse<void>>('/partner/request-login-otp', { email });
        return response.data;
    }

    async verifyLoginOtp(email: string, otp: string): Promise<any> {
        const response = await api.post<ApiResponse<{
            user: any;
            accessToken: string;
            refreshToken: string;
        }>>('/partner/verify-login-otp', { email, otp });

        const { user, accessToken, refreshToken } = response.data.data;
        this.setTokens(accessToken, refreshToken);
        return { user, accessToken, refreshToken };
    }

    async getPartnerProfile(): Promise<PartnerProfile> {
        const response = await api.get<ApiResponse<PartnerProfile>>('/partner/profile');
        return response.data.data;
    }

    async registerProperty(formData: FormData): Promise<any> {
        const response = await api.post<ApiResponse<any>>('/partners/register-prop', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    private setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    clearTokens(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
}

export const partnerAuthService = new PartnerAuthService();
