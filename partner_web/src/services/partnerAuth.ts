import api from './api';
import type { ApiResponse, PartnerRegistrationData, PartnerProfile, VerificationStatusResponse } from '../types';

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

    async verifyAdhar(formData: FormData): Promise<ApiResponse<any>> {
        const response = await api.post<ApiResponse<any>>('/partner/verify-adhar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async getAadhaarDocuments(): Promise<any> {
        const response = await api.get<ApiResponse<any>>('/partner/aadhaar-documents');
        return response.data.data;
    }

    async createProperty(data: any): Promise<any> {
        const response = await api.post<ApiResponse<any>>('/properties', data);
        return response.data.data.property || response.data.data;
    }

    async getPartnerProperties(): Promise<any[]> {
        const response = await api.get<ApiResponse<any[]>>('/properties/partner-properties');
        const data = response.data.data as any;
        return data.properties || (Array.isArray(data) ? data : []);
    }

    async getPropertyOnboardingStatus(id: string): Promise<any> {
        const response = await api.get<ApiResponse<any>>(`/properties/${id}/onboarding-status`);
        return response.data.data.status || response.data.data;
    }

    async updatePropertyDetails(id: string, data: any): Promise<any> {
        const response = await api.patch<ApiResponse<any>>(`/properties/${id}/details`, data);
        return response.data.data.property || response.data.data;
    }

    async uploadPropertyOwnership(id: string, formData: FormData): Promise<any> {
        const response = await api.patch<ApiResponse<any>>(`/properties/${id}/ownership`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data.property || response.data.data;
    }

    async uploadPropertyTax(id: string, formData: FormData): Promise<any> {
        const response = await api.patch<ApiResponse<any>>(`/properties/${id}/tax`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data.property || response.data.data;
    }

    async updatePropertyBanking(id: string, data: any): Promise<any> {
        const response = await api.patch<ApiResponse<any>>(`/properties/${id}/banking`, data);
        return response.data.data.property || response.data.data;
    }

    async uploadPropertyImages(id: string, formData: FormData): Promise<any> {
        const response = await api.patch<ApiResponse<any>>(`/properties/${id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data.property || response.data.data;
    }

    async getVerificationStatus(): Promise<VerificationStatusResponse> {
        const response = await api.get<ApiResponse<VerificationStatusResponse>>('/partner/verification-status');
        return response.data.data;
    }

    async getProfilePicture(): Promise<string> {
        const response = await api.get<ApiResponse<string>>('/partner/profile-picture');
        return response.data.data;
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
