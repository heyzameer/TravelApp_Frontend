import api from "./api";
import type { ApiResponse, User, PartnerUser, Booking, Property, VehicleType } from "../types";

class AdminService {
    async getAllUsers(pagination?: { page: number; limit: number }, filter?: { role?: string; status?: string }): Promise<{ users: User[]; pagination: { page: number; limit: number; total: number } }> {
        const params = {
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            ...filter
        };

        const response = await api.get<ApiResponse<{ users: { data: User[] }; pagination: { page: number; limit: number; total: number } }>>('/admin/users', { params });
        return {
            users: response.data.data.users.data,
            pagination: response.data.data.pagination
        };
    }

    async getUserById(userId: string): Promise<User> {
        const response = await api.get<ApiResponse<{ user: User }>>(`/admin/users/${userId}`);
        return response.data.data.user;
    }

    async updateUser(userId: string, userData: Partial<User>): Promise<User> {
        const response = await api.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}`, userData);
        return response.data.data.user;
    }

    async deleteUser(userId: string): Promise<void> {
        await api.delete<ApiResponse<void>>(`/admin/users/${userId}`);
    }

    async getAllPartners(): Promise<PartnerUser[]> {
        const response = await api.get<ApiResponse<{ partners: { data: PartnerUser[] } }>>('/admin/partners');
        return response.data.data.partners.data;
    }

    async getAllPartnersRequest(): Promise<PartnerUser[]> {
        const response = await api.get<ApiResponse<{ partners: PartnerUser[] }>>('/admin/partners/requests');
        return response.data.data.partners;
    }

    async getPartnerById(partnerId: string): Promise<PartnerUser> {
        const response = await api.get<ApiResponse<{ partner: PartnerUser }>>(`/admin/partners/${partnerId}`);
        return response.data.data.partner;
    }

    async updatePartner(partnerId: string, partnerData: Partial<PartnerUser>): Promise<PartnerUser> {
        const response = await api.put<ApiResponse<{ partner: PartnerUser }>>(`/admin/partners/${partnerId}`, partnerData);
        return response.data.data.partner;
    }

    async deletePartner(partnerId: string): Promise<void> {
        await api.delete<ApiResponse<void>>(`/admin/partners/${partnerId}`);
    }

    async getAllBookings(): Promise<Booking[]> {
        const response = await api.get<ApiResponse<{ bookings: Booking[] }>>('/admin/bookings');
        return response.data.data.bookings;
    }

    async getBookingById(bookingId: string): Promise<Booking> {
        const response = await api.get<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${bookingId}`);
        return response.data.data.booking;
    }

    async updateBooking(bookingId: string, bookingData: Partial<Booking>): Promise<Booking> {
        const response = await api.put<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${bookingId}`, bookingData);
        return response.data.data.booking;
    }

    async deleteBooking(bookingId: string): Promise<void> {
        await api.delete<ApiResponse<void>>(`/admin/bookings/${bookingId}`);
    }

    async getAllProperties(): Promise<Property[]> {
        const response = await api.get<ApiResponse<{ properties: Property[] }>>('/admin/properties');
        return response.data.data.properties;
    }

    async getPropertyById(propertyId: string): Promise<Property> {
        const response = await api.get<ApiResponse<{ property: Property }>>(`/admin/properties/${propertyId}`);
        return response.data.data.property;
    }

    async updateProperty(propertyId: string, propertyData: Partial<Property>): Promise<Property> {
        const response = await api.put<ApiResponse<{ property: Property }>>(`/admin/properties/${propertyId}`, propertyData);
        return response.data.data.property;
    }

    async deleteProperty(propertyId: string): Promise<void> {
        await api.delete<ApiResponse<void>>(`/admin/properties/${propertyId}`);
    }

    async createProperty(propertyData: Partial<Property>): Promise<Property> {
        const response = await api.post<ApiResponse<{ property: Property }>>('/admin/properties', propertyData);
        return response.data.data.property;
    }

    async getVehicles(): Promise<VehicleType[]> {
        const response = await api.get<ApiResponse<{ vehicles: VehicleType[] }>>('/admin/vehicles');
        return response.data.data.vehicles;
    }

    async uploadVehicleImage(data: FormData): Promise<{ success: boolean; imageUrl: string }> {
        const response = await api.post<ApiResponse<{ imageUrl: string }>>('/admin/vehicles/upload', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return {
            success: response.data.success,
            imageUrl: response.data.data.imageUrl
        };
    }
}

export const adminService = new AdminService();