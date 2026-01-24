export const UserRole = {
  CUSTOMER: 'customer',
  DELIVERY_PARTNER: 'delivery_partner',
  ADMIN: 'admin',
  PARTNER: 'partner',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface ErrorResponse {
  response: {
    data: {
      message: string;
      errors?: string[];
      statusCode?: number;
    };
  };
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  permissions: string[];
  isEmailVerified: boolean;
  profilePicture?: string;
  dateOfBirth?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  loyaltyPoints?: number;
  walletBalance?: number;
  bookings?: Booking[]; // Changed from order to bookings
  totalBookings?: number; // For admin display
  totalAmount?: number; // For admin display

  // Partner specific fields
  isVerified?: boolean;
  aadhaarVerified?: boolean;
  aadharStatus?: 'not_submitted' | 'pending' | 'manual_review' | 'verified' | 'rejected' | 'approved';
  aadharRejectionReason?: string;
  personalDocuments?: {
    aadharFront?: string;
    aadharBack?: string;
    profilePicture?: string;
    aadharStatus?: string;
    aadharRejectionReason?: string;
    [key: string]: any;
  };
}

export interface VerificationStatusResponse {
  aadharStatus: 'not_submitted' | 'manual_review' | 'approved' | 'rejected';
  isVerified: boolean;
  canAddProperty: boolean;
  documents: {
    aadharFront: boolean;
    aadharBack: boolean;
    profilePicture: boolean;
  };
}

export interface DocumentUrls {
  aadharFront?: string;
  aadharBack?: string;
  profilePicture?: string;
}

export interface SocketVerificationApprovedEvent {
  partnerId: string;
  email: string;
}

export interface SocketVerificationRejectedEvent {
  partnerId: string;
  email: string;
  reason: string;
}
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type SignInFormErrors = {
  email?: string;
  password?: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}
export type SignUpFormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
};

export interface PasswordResetCredentials {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetFormErrors {
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export interface DriverRegistrationData {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  profilePicture?: File;
  vehicleType?: string;
  registrationNumber?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  // Document files
  aadharFront?: File;
  aadharBack?: File;
  panFront?: File;
  panBack?: File;
  licenseFront?: File;
  licenseBack?: File;
  insuranceDocument?: File;
  pollutionDocument?: File;
}

export interface DocumentItem {
  id: string;
  title: string;
  isCompleted: boolean;
  formComponent: React.FC<unknown>;
}

export interface PartnerUser {
  _id: string;
  partnerId: string;
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  profilePicture?: string;
  profileImage?: string;

  personalDocuments: {
    aadharFront: string;
    aadharBack: string;
    panFront: string;
    panBack: string;
    licenseFront: string;
    licenseBack: string;
    aadharStatus: 'pending' | 'approved' | 'rejected';
    panStatus: 'pending' | 'approved' | 'rejected';
    licenseStatus: 'pending' | 'approved' | 'rejected';
  };

  vehicalDocuments: {
    vehicleType: string;
    registrationNumber: string;
    insuranceDocument: string;
    pollutionDocument: string;
    insuranceStatus: 'pending' | 'approved' | 'rejected';
    pollutionStatus: 'pending' | 'approved' | 'rejected';
  };

  bankingDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
    bankingStatus: 'pending' | 'approved' | 'rejected';
  };

  isAvailable: boolean;
  isActive: boolean;
  isVerified: boolean;
  status: 'pending' | 'verified' | 'rejected';

  hasPendingRequest: boolean;

  bankDetailsCompleted: boolean;
  personalDocumentsCompleted: boolean;
  vehicleDetailsCompleted: boolean;

  totalOrders: number;
  ongoingOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalAmount?: number;
  availablePoints?: number;

  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface PartnerRegistrationData {
  fullName: string;
  email: string;
  password?: string;
  phone: string;
}

export interface PartnerProfile {
  partnerId: string;
  fullName: string;
  email: string;
  phone: string;
  personalDocuments: {
    aadharStatus: string;
    [key: string]: any;
  };
  status: string;
  totalOrders: number;
}

export interface PropertyRegistrationForm {
  name: string;
  email: string;
  phone: string;
  password?: string;
  propertyName: string;
  propertyAddress: string;
  description?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  additionalContact?: string;
  idDocument?: File;
  businessLicense?: File;
  propertyPhotos?: File[];
  otherDocuments?: File[];
}


export interface OrderDetails {
  pickupAddress: {
    addressId: string;
    street: string;
    latitude?: number;
    longitude?: number;
  } | null;
  dropoffAddress: {
    addressId: string;
    street: string;
    latitude?: number;
    longitude?: number;
  } | null;
  vehicleId: string | null;
  deliveryType: "normal" | "express" | null;
  paymentMethod: PaymentMethod | null;
  distance: number;
  price: number;
  basePrice: number;
  deliveryPrice: number;
  commission: number;
  gstAmount: number;
  estimatedTime: string;
  effectiveDistance: number;
}

export interface DriverTracking {
  driverId: string;
  driverName: string;
  profileImage?: string;
  vehicle: string;
  location: { latitude: number; longitude: number };
  estimatedArrival: string;
  distance: number;
  phone?: string;
}

export interface OtpStatus {
  pickupOtp: string | null;
  dropoffOtp: string | null;
  pickupVerified: boolean;
  dropoffVerified: boolean;
}

export interface vehicle {
  id: string;
  name: string;
  pricePerKm: number;
  maxWeight: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export type OrderStatus =
  | "created"
  | "finding_driver"
  | "driver_assigned"
  | "driver_arrived"
  | "picked_up"
  | "completed"
  | null

export interface PricingConfig {
  deliveryMultipliers: {
    normal: number;
    express: number;
  };
  taxRates: {
    gst: number;
    commission: number;
  };
  minimumDistance: number;
}

export type PaymentMethod = 'stripe' | 'wallet' | 'cash' | 'upi';

export interface EditProfileFormData {
  fullName: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  profileImage?: string;
}

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  street: string;
  isDefault: boolean;
  streetNumber?: string;
  buildingNumber?: string;
  floorNumber?: string;
  contactName?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddressResponse {
  addresses: Address[];
  address: Address | null;
}

export interface Property {
  _id: string;
  propertyName: string;
  propertyType: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  maxGuests: number;
  images: string[];
  coverImage?: string;
  ownerId: string;

  // Onboarding Flags
  propertyDetailsCompleted: boolean;
  ownershipDocumentsCompleted: boolean;
  taxDocumentsCompleted: boolean;
  bankingDetailsCompleted: boolean;
  imagesUploaded: boolean;
  onboardingCompleted: boolean;

  // Verification
  isVerified: boolean;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';

  ownershipDocuments?: {
    ownershipProof?: string;
    ownerKYC?: string;
    ownershipProofStatus: string;
    ownerKYCStatus: string;
    rejectionReason?: string;
  };
  taxDocuments?: {
    gstNumber?: string;
    panNumber?: string;
    gstCertificate?: string;
    panCard?: string;
    taxStatus: string;
    rejectionReason?: string;
  };
  bankingDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    bankingStatus: string;
    rejectionReason?: string;
  };
}

export interface PropertyOnboardingStatus {
  step: number;
  isComplete: boolean;
  progress: number;
  nextStep: string;
  completedSteps: {
    details: boolean;
    ownership: boolean;
    tax: boolean;
    banking: boolean;
    images: boolean;
  };
}

export interface Booking {
  id: string;
  createdAt: string;
  propertyId?: string;
  propertyName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  // Legacy fields for backward compatibility
  pickupAddress?: Address;
  dropoffAddress?: Address;
  totalAmount: number;
  status: string;
  estimatedTime?: string;
  distance?: number;
  paymentMethod?: string;
  vehicleName?: string;
  driverId?: string;
  driverName?: string;
  driver?: Driver;
}

interface Driver {
  fullName: string;
  mobileNumber: number;
}