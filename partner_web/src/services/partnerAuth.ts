import api from './api';
import type {
    ApiResponse, User, Property, VerificationStatusResponse,
    DocumentUrls, PropertyOnboardingStatus, PartnerRegistrationData, PartnerProfile,
    VerificationResponse
} from '../types';

class PartnerAuthService {
    private readonly TOKEN_KEY = 'authToken';
    private readonly REFRESH_TOKEN_KEY = 'refreshToken';

    async registerPartner(data: PartnerRegistrationData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        const response = await api.post<ApiResponse<{
            user: User;
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

    async verifyLoginOtp(email: string, otp: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        const response = await api.post<ApiResponse<{
            user: User;
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

    async verifyAdhar(formData: FormData): Promise<VerificationResponse> {
        const response = await api.post<ApiResponse<VerificationResponse>>('/partner/verify-adhar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    }

    async getAadhaarDocuments(): Promise<DocumentUrls> {
        const response = await api.get<ApiResponse<DocumentUrls>>('/partner/aadhaar-documents');
        return response.data.data;
    }

    async createProperty(data: Partial<Property>): Promise<Property> {
        const response = await api.post<ApiResponse<{ property: Property }>>('/properties', data);
        return response.data.data.property;
    }

    async getPartnerProperties(): Promise<Property[]> {
        const response = await api.get<ApiResponse<{ properties: Property[] }>>('/properties/partner-properties');
        return response.data.data.properties || [];
    }

    async getPropertyOnboardingStatus(id: string): Promise<PropertyOnboardingStatus> {
        const response = await api.get<ApiResponse<PropertyOnboardingStatus>>(`/properties/${id}/onboarding-status`);
        return response.data.data;
    }

    async updatePropertyDetails(id: string, data: Partial<Property>): Promise<Property> {
        const response = await api.patch<ApiResponse<{ property: Property }>>(`/properties/${id}/details`, data);
        return response.data.data.property;
    }

    async uploadPropertyOwnership(id: string, formData: FormData): Promise<Property> {
        const response = await api.patch<ApiResponse<{ property: Property }>>(`/properties/${id}/ownership`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data.property;
    }

    async uploadPropertyTax(id: string, formData: FormData): Promise<Property> {
        const response = await api.patch<ApiResponse<{ property: Property }>>(`/properties/${id}/tax`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data.property;
    }

    async updatePropertyBanking(id: string, data: Partial<Property['bankingDetails']>): Promise<Property> {
        const response = await api.patch<ApiResponse<{ property: Property }>>(`/properties/${id}/banking`, data);
        return response.data.data.property;
    }

    async uploadPropertyImages(id: string, formData: FormData): Promise<Property> {
        const response = await api.patch<ApiResponse<{ property: Property }>>(`/properties/${id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data.property;
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
