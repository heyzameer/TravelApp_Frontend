export interface User {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    role: 'customer' | 'partner' | 'admin';
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    wishlist?: string[];
    // Partner specific fields (optional as they might be merged or separate)
    partnerId?: string;
    verificationStatus?: {
        personalInformation: boolean;
        personalDocuments: boolean;
        vehicalDocuments: boolean;
        bankingDetails: boolean;
    };
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
    timestamp: string;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterCredentials {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
}

export interface VerifyOtpCredentials {
    email?: string; // For partner login flow
    code?: string; // For user register verification flow
    otp?: string; // For partner login flow
    type?: string;
}
