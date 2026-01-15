import api from "./api";

class AdminService {
    // Add admin-specific methods here


    async getAllUsers(pagination?: { page: number; limit: number }, filter?: { role?: string; status?: string }): Promise<any> {
        // Build query string
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

    async updateUser(userId: string, userData: any): Promise<any> {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data;
    }

    async deleteUser(userId: string): Promise<any> {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    }

    async getAllPartners(): Promise<any> {
        const response = await api.get('/admin/partners');
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

    async updatePartner(partnerId: string, partnerData: any): Promise<any> {
        const response = await api.put(`/admin/partners/${partnerId}`, partnerData);
        return response.data;
    }

    async deletePartner(partnerId: string): Promise<any> {
        const response = await api.delete(`/admin/partners/${partnerId}`);
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

    async updateBooking(bookingId: string, bookingData: any): Promise<any> {
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

    async getPropertyById(propertyId: string): Promise<any> {
        const response = await api.get(`/admin/properties/${propertyId}`);
        return response.data;
    }

    async updateProperty(propertyId: string, propertyData: any): Promise<any> {
        const response = await api.put(`/admin/properties/${propertyId}`, propertyData);
        return response.data;
    }

    async deleteProperty(propertyId: string): Promise<any> {
        const response = await api.delete(`/admin/properties/${propertyId}`);
        return response.data;
    }
    async createProperty(propertyData: any): Promise<any> {
        const response = await api.post('/admin/properties', propertyData);
        return response.data;
    }

    async sendPartnerEmail(emailData: { email: string; subject: string; message: string }): Promise<any> {
        const response = await api.post('/admin/partners/send-email', emailData);
        return response.data;
    }
}

export const adminService = new AdminService();