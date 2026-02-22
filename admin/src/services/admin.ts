import api from "./api";
import type { User, PartnerUser, Property, Booking, ApiResponse } from "../types";

class AdminService {
    async getDashboardStats(params?: { months: number }): Promise<ApiResponse<unknown>> {
        const response = await api.get<ApiResponse<unknown>>('/admin/stats', { params });
        return response.data;
    }

    async getAnalyticsData(range?: string): Promise<ApiResponse<unknown>> {
        const response = await api.get<ApiResponse<unknown>>('/admin/analytics', { params: { range } });
        return response.data;
    }

    async getSettings(): Promise<ApiResponse<unknown>> {
        const response = await api.get<ApiResponse<unknown>>('/admin/settings');
        return response.data;
    }

    async updateSettings(settingsData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
        const response = await api.put<ApiResponse<unknown>>('/admin/settings', settingsData);
        return response.data;
    }

    async getAllUsers(pagination?: { page: number; limit: number }, filter?: { role?: string; status?: string }): Promise<ApiResponse<{ users: User[], total: number }>> {
        const params = {
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            ...filter
        };

        const response = await api.get<ApiResponse<{ users: User[], total: number }>>('/admin/users', { params })
        console.log("AdminService getAllUsers response:", response);
        return response.data;
    }

    async getUserById(userId: string): Promise<ApiResponse<User>> {
        const response = await api.get<ApiResponse<User>>(`/admin/users/${userId}`);
        return response.data;
    }

    async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
        const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}`, userData);
        return response.data;
    }

    async deleteUser(userId: string): Promise<void> {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    }

    async getAllPartners(filter?: { aadharStatus?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ partners: PartnerUser[], total: number }>> {
        const response = await api.get<ApiResponse<{ partners: PartnerUser[], total: number }>>('/admin/partners', { params: filter });
        return response.data;
    }

    async getAllPartnersRequest(): Promise<ApiResponse<PartnerUser[]>> {
        const response = await api.get<ApiResponse<PartnerUser[]>>('/admin/partners/requests');
        return response.data;
    }

    async getPartnerById(partnerId: string): Promise<ApiResponse<PartnerUser>> {
        const response = await api.get<ApiResponse<PartnerUser>>(`/admin/partners/${partnerId}`);
        return response.data;
    }

    async updatePartner(partnerId: string, partnerData: Partial<PartnerUser>): Promise<ApiResponse<PartnerUser>> {
        const response = await api.put<ApiResponse<PartnerUser>>(`/admin/partners/${partnerId}`, partnerData);
        return response.data;
    }

    async deletePartner(partnerId: string): Promise<ApiResponse<void>> {
        const response = await api.delete<ApiResponse<void>>(`/admin/partners/${partnerId}`);
        return response.data;
    }

    async getPartnerVerificationDetails(partnerId: string): Promise<ApiResponse<unknown>> {
        const response = await api.get<ApiResponse<unknown>>(`/admin/partners/${partnerId}/verification-details`);
        return response.data;
    }

    async verifyPartnerAadhaar(partnerId: string, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<unknown>> {
        const response = await api.patch<ApiResponse<unknown>>(`/admin/partners/${partnerId}/verify`, {
            documentType: 'aadhar',
            status: action === 'approve' ? 'approved' : 'rejected',
            rejectionReason: reason
        });
        return response.data;
    }

    async getAllBookings(): Promise<ApiResponse<Booking[]>> {
        const response = await api.get<ApiResponse<Booking[]>>('/admin/bookings');
        return response.data;
    }

    async getBookingById(bookingId: string): Promise<ApiResponse<Booking>> {
        const response = await api.get<ApiResponse<Booking>>(`/admin/bookings/${bookingId}`);
        return response.data;
    }

    async updateBooking(bookingId: string, bookingData: Partial<Booking>): Promise<ApiResponse<Booking>> {
        const response = await api.put<ApiResponse<Booking>>(`/admin/bookings/${bookingId}`, bookingData);
        return response.data;
    }

    async deleteBooking(bookingId: string): Promise<ApiResponse<void>> {
        const response = await api.delete<ApiResponse<void>>(`/admin/bookings/${bookingId}`);
        return response.data;
    }

    async processRefund(bookingId: string, approved: boolean, note?: string): Promise<ApiResponse<unknown>> {
        const response = await api.patch<ApiResponse<unknown>>(`/admin/bookings/${bookingId}/refund`, { approved, note });
        return response.data;
    }

    async getAllProperties(): Promise<ApiResponse<Property[]>> {
        const response = await api.get<ApiResponse<Property[]>>('/admin/properties');
        return response.data;
    }

    async getAllPropertyApplications(pagination?: { page: number; limit: number }): Promise<ApiResponse<{ properties: Property[], total: number }>> {
        const params = {
            page: pagination?.page || 1,
            limit: pagination?.limit || 10
        };
        const response = await api.get<ApiResponse<{ properties: Property[], total: number }>>('/admin/properties/applications', { params });
        return response.data;
    }

    async getPropertyById(propertyId: string): Promise<ApiResponse<Property>> {
        const response = await api.get<ApiResponse<Property>>(`/admin/properties/${propertyId}`);
        return response.data;
    }

    async updateProperty(propertyId: string, propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
        const response = await api.put<ApiResponse<Property>>(`/admin/properties/${propertyId}`, propertyData);
        return response.data;
    }

    async deleteProperty(propertyId: string): Promise<ApiResponse<void>> {
        const response = await api.delete<ApiResponse<void>>(`/admin/properties/${propertyId}`);
        return response.data;
    }

    async updatePropertyDocumentStatus(propertyId: string, section: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<ApiResponse<unknown>> {
        const response = await api.patch<ApiResponse<unknown>>(`/admin/properties/${propertyId}/document-status`, {
            section,
            status,
            rejectionReason
        });
        return response.data;
    }

    async verifyProperty(propertyId: string, status: 'verified' | 'rejected' | 'suspended', rejectionReason?: string): Promise<ApiResponse<unknown>> {
        const response = await api.patch<ApiResponse<unknown>>(`/admin/properties/${propertyId}/verify`, {
            status,
            rejectionReason
        });
        return response.data;
    }
    async createProperty(propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
        const response = await api.post<ApiResponse<Property>>('/admin/properties', propertyData);
        return response.data;
    }

    async sendPartnerEmail(emailData: Record<string, unknown> | FormData): Promise<void> {
        const isFormData = emailData instanceof FormData;
        const response = await api.post('/admin/partners/send-email', emailData, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
        });
        return response.data;
    }

    async sendGuestEmail(formData: FormData): Promise<void> {
        const response = await api.post('/admin/users/send-email', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    async login(credentials: Record<string, unknown>): Promise<ApiResponse<unknown>> {
        const response = await api.post<ApiResponse<unknown>>('/admin/login', credentials);
        return response.data;
    }

    async verify2FA(email: string, otp: string): Promise<ApiResponse<unknown>> {
        const response = await api.post<ApiResponse<unknown>>('/admin/verify-2fa', { email, otp });
        return response.data;
    }

    async changePassword(passwords: Record<string, string>): Promise<ApiResponse<void>> {
        const response = await api.post<ApiResponse<void>>('/admin/change-password', passwords);
        return response.data;
    }

    async getLoginHistory(): Promise<ApiResponse<{ history: unknown[] }>> {
        const response = await api.get<ApiResponse<{ history: unknown[] }>>('/admin/login-history');
        return response.data;
    }

    async clearLoginHistory(): Promise<ApiResponse<void>> {
        const response = await api.delete<ApiResponse<void>>('/admin/login-history');
        return response.data;
    }

    async logoutOtherSessions(): Promise<ApiResponse<void>> {
        const response = await api.post<ApiResponse<void>>('/admin/logout-sessions');
        return response.data;
    }
}

export const adminService = new AdminService();