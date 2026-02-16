/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import type { User, PartnerUser, Property, Booking } from "../types";

class AdminService {
    async getDashboardStats(params?: { months: number }): Promise<Record<string, any>> {
        const response = await api.get('/admin/stats', { params });
        return response.data;
    }

    async getAllUsers(pagination?: { page: number; limit: number }, filter?: { role?: string; status?: string }): Promise<any> {
        const params = {
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            ...filter
        };

        const response = await api.get('/admin/users', { params })
        console.log("AdminService getAllUsers response:", response);
        return response.data;
    }

    async getUserById(userId: string): Promise<any> {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    }

    async updateUser(userId: string, userData: Partial<User>): Promise<any> {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data;
    }

    async deleteUser(userId: string): Promise<void> {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    }

    async getAllPartners(filter?: { aadharStatus?: string; search?: string; page?: number; limit?: number }): Promise<any> {
        const response = await api.get('/admin/partners', { params: filter });
        return response.data;
    }

    async getAllPartnersRequest(): Promise<any> {
        const response = await api.get('/admin/partners/requests');
        return response.data;
    }

    async getPartnerById(partnerId: string): Promise<any> {
        const response = await api.get(`/admin/partners/${partnerId}`);
        return response.data;
    }

    async updatePartner(partnerId: string, partnerData: Partial<PartnerUser>): Promise<any> {
        const response = await api.put(`/admin/partners/${partnerId}`, partnerData);
        return response.data;
    }

    async deletePartner(partnerId: string): Promise<void> {
        const response = await api.delete(`/admin/partners/${partnerId}`);
        return response.data;
    }

    async getPartnerVerificationDetails(partnerId: string): Promise<any> {
        const response = await api.get(`/admin/partners/${partnerId}/verification-details`);
        return response.data;
    }

    async verifyPartnerAadhaar(partnerId: string, action: 'approve' | 'reject', reason?: string): Promise<any> {
        const response = await api.patch(`/admin/partners/${partnerId}/verify`, {
            documentType: 'aadhar',
            status: action === 'approve' ? 'approved' : 'rejected',
            rejectionReason: reason
        });
        return response.data;
    }

    async getAllBookings(): Promise<any> {
        const response = await api.get('/admin/bookings');
        return response.data;
    }

    async getBookingById(bookingId: string): Promise<any> {
        const response = await api.get(`/admin/bookings/${bookingId}`);
        return response.data;
    }

    async updateBooking(bookingId: string, bookingData: Partial<Booking>): Promise<any> {
        const response = await api.put(`/admin/bookings/${bookingId}`, bookingData);
        return response.data;
    }

    async deleteBooking(bookingId: string): Promise<any> {
        const response = await api.delete(`/admin/bookings/${bookingId}`);
        return response.data;
    }

    async getAllProperties(): Promise<any> {
        const response = await api.get('/admin/properties');
        return response.data;
    }

    async getAllPropertyApplications(pagination?: { page: number; limit: number }): Promise<any> {
        const params = {
            page: pagination?.page || 1,
            limit: pagination?.limit || 10
        };
        const response = await api.get('/admin/properties/applications', { params });
        return response.data;
    }

    async getPropertyById(propertyId: string): Promise<any> {
        const response = await api.get(`/admin/properties/${propertyId}`);
        return response.data;
    }

    async updateProperty(propertyId: string, propertyData: Partial<Property>): Promise<any> {
        const response = await api.put(`/admin/properties/${propertyId}`, propertyData);
        return response.data;
    }

    async deleteProperty(propertyId: string): Promise<any> {
        const response = await api.delete(`/admin/properties/${propertyId}`);
        return response.data;
    }

    async updatePropertyDocumentStatus(propertyId: string, section: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<any> {
        const response = await api.patch(`/admin/properties/${propertyId}/document-status`, {
            section,
            status,
            rejectionReason
        });
        return response.data;
    }

    async verifyProperty(propertyId: string, status: 'verified' | 'rejected' | 'suspended', rejectionReason?: string): Promise<any> {
        const response = await api.patch(`/admin/properties/${propertyId}/verify`, {
            status,
            rejectionReason
        });
        return response.data;
    }
    async createProperty(propertyData: Partial<Property>): Promise<any> {
        const response = await api.post('/admin/properties', propertyData);
        return response.data;
    }

    async sendPartnerEmail(emailData: { email: string; subject: string; message: string }): Promise<void> {
        const response = await api.post('/admin/partners/send-email', emailData);
        return response.data;
    }
}

export const adminService = new AdminService();