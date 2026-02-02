import type { Address, ApiResponse, User } from "../types";
import api from "./api";

class UserService {
  async editProfile(data: FormData): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/profile`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }

  addAddress = async (addressData: Address): Promise<Address> => {
    const response = await api.post<ApiResponse<Address>>('/users/addresses', addressData);
    return response.data.data;
  }

  getAddresses = async (): Promise<Address[]> => {
    const response = await api.get<ApiResponse<Address[]>>('/users/addresses');
    return response.data.data;
  }

  getAddress = async (addressId: string): Promise<Address> => {
    const response = await api.get<ApiResponse<Address>>(`/users/addresses/${addressId}`);
    return response.data.data;
  }

  updateAddress = async (addressId: string, addressData: Address): Promise<Address> => {
    const response = await api.put<ApiResponse<Address>>(`/users/addresses/${addressId}`, addressData);
    return response.data.data;
  }

  deleteAddress = async (addressId: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/users/addresses/${addressId}`);
  }

  setDefaultAddress = async (addressId: string): Promise<Address> => {
    const response = await api.put<ApiResponse<Address>>(`/users/addresses/${addressId}/set-default`);
    return response.data.data;
  }
}

export const userService = new UserService();