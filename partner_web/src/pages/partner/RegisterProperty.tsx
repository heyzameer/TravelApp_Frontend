import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { partnerAuthService } from "../../services/partnerAuth";
import { locationService } from "../../services/locationService";
import type { Destination, Property } from "../../types";
import {
    Upload, X, Camera, Loader2, MapPin, Building, AlertCircle
} from "lucide-react";
import { CategorizedImageUpload } from "../../components/property/CategorizedImageUpload";

interface FormErrors {
    [key: string]: string;
}

interface RegisterPropertyProps {
    propertyId?: string;
    onCancel?: () => void;
}

interface FileState {
    ownershipProof: File | null;
    ownerKYC: File | null;
    gstCertificate: File | null;
    panCard: File | null;
    coverImage: File | null;
}

interface CategorizedImage {
    file: File | null;
    preview: string;
    category: string;
    label: string;
}

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RefreshCw } from "lucide-react";

// Fix for default marker icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker: React.FC<{ position: [number, number]; setPosition: (pos: [number, number]) => void }> = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const RegisterProperty: React.FC<RegisterPropertyProps> = ({ propertyId, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [initialFetchLoading, setInitialFetchLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // Form States
    const [formData, setFormData] = useState({
        propertyName: "",
        propertyType: "hotel",
        description: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        gstNumber: "",
        panNumber: "",
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        upiId: "",
        destinationId: "",
        coordinates: { lat: 12.9716, lng: 77.5946 } // Default to Bangalore
    });

    // File States
    const [files, setFiles] = useState<FileState>({
        ownershipProof: null,
        ownerKYC: null,
        gstCertificate: null,
        panCard: null,
        coverImage: null
    });

    // Categorized Images State
    const [categorizedImages, setCategorizedImages] = useState<CategorizedImage[]>([]);

    // Previews
    const [previews, setPreviews] = useState<Record<string, string | undefined>>({});

    // Destinations State
    const [destinations, setDestinations] = useState<Destination[]>([]);

    const fetchDestinations = useCallback(async () => {
        try {
            const data = await locationService.getAllDestinations();
            setDestinations(data);
        } catch (error) {
            console.error("Failed to fetch destinations", error);
            toast.error("Failed to load destinations");
        }
    }, []);

    const fetchPropertyForEdit = useCallback(async () => {
        try {
            setInitialFetchLoading(true);
            const properties = await partnerAuthService.getPartnerProperties();
            const property = properties.find((p: Property) => p._id === propertyId);

            if (property) {
                setFormData({
                    propertyName: property.propertyName || "",
                    propertyType: property.propertyType || "hotel",
                    description: property.description || "",
                    street: property.address?.street || "",
                    city: property.address?.city || "",
                    state: property.address?.state || "",
                    pincode: property.address?.pincode || "",
                    country: property.address?.country || "India",
                    gstNumber: property.taxDocuments?.gstNumber || "",
                    panNumber: property.taxDocuments?.panNumber || "",
                    accountHolderName: property.bankingDetails?.accountHolderName || "",
                    accountNumber: property.bankingDetails?.accountNumber || "",
                    ifscCode: property.bankingDetails?.ifscCode || "",
                    upiId: property.bankingDetails?.upiId || "",
                    destinationId: property.destinationId ? (typeof property.destinationId === 'string' ? property.destinationId : property.destinationId._id) : "",
                    coordinates: {
                        lat: property.location?.coordinates[1] || 12.9716,
                        lng: property.location?.coordinates[0] || 77.5946
                    }
                });
                setPreviews({
                    ownershipProof: property.ownershipDocuments?.ownershipProof,
                    ownerKYC: property.ownershipDocuments?.ownerKYC,
                    gstCertificate: property.taxDocuments?.gstCertificate,
                    panCard: property.taxDocuments?.panCard,
                    coverImage: property.coverImage
                });

                // Existing images are handled differently now. 
                // Since we are changing structure, we might need a migration or just show them using the new component if compatible.
                // For now, let's load them if they match the new structure, or default to 'Others'
                if (property.images && property.images.length > 0) {
                    const loadedImages = property.images.map((img: string | { url: string; category?: string; label?: string }) => ({
                        file: null, // No file object for existing images
                        preview: typeof img === 'string' ? img : img.url,
                        category: typeof img === 'string' ? 'Others' : (img.category || 'Others'),
                        label: typeof img === 'string' ? '' : (img.label || '')
                    }));
                    setCategorizedImages(loadedImages);
                }
            }
        } catch (error) {
            toast.error("Failed to load property for editing");
            console.error(error);
        } finally {
            setInitialFetchLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        if (propertyId) {
            fetchPropertyForEdit();
        }
        fetchDestinations();
    }, [propertyId, fetchPropertyForEdit, fetchDestinations]);

    const fetchCoordinatesFromPincode = useCallback(async (pincode: string) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&country=India`);
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setFormData(prev => ({
                    ...prev,
                    coordinates: { lat, lng: lon }
                }));
                toast.success(`Map updated to pincode area: ${pincode}`);
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
        }
    }, []);

    // Auto-fetch coordinates when pincode changes
    useEffect(() => {
        if (formData.pincode.length === 6 && /^\d+$/.test(formData.pincode)) {
            fetchCoordinatesFromPincode(formData.pincode);
        }
    }, [formData.pincode, fetchCoordinatesFromPincode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files && e.target.files[0]) {
            if (field === 'images') {
                // 'images' field doesn't exist in FileState anymore, handled by categorizedImages
            } else {
                const file = e.target.files[0];
                setFiles((prev) => ({ ...prev, [field]: file }));
                setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
            }
            // Clear error when file is selected
            if (errors[field]) {
                setErrors(prev => ({ ...prev, [field]: "" }));
            }
        }
    };



    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Basic Details Validation
        if (!formData.propertyName.trim()) newErrors.propertyName = "Property name is required";
        if (!formData.description.trim() || formData.description.length < 20) {
            newErrors.description = "Description must be at least 20 characters";
        }

        // Address Validation
        if (!formData.street.trim()) newErrors.street = "Street address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = "Valid 6-digit pincode required";
        }

        // Document Validation - in edit mode, existing previews are enough
        if (!files.ownershipProof && !previews.ownershipProof) newErrors.ownershipProof = "Ownership proof is required";
        if (!files.ownerKYC && !previews.ownerKYC) newErrors.ownerKYC = "Owner KYC is required";

        // Tax Validation
        if (!formData.gstNumber.trim()) newErrors.gstNumber = "GST number is required";
        if (!formData.panNumber.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
            newErrors.panNumber = "Valid PAN number required (e.g., ABCDE1234F)";
        }
        if (!files.gstCertificate && !previews.gstCertificate) newErrors.gstCertificate = "GST certificate is required";
        if (!files.panCard && !previews.panCard) newErrors.panCard = "PAN card is required";

        // Banking Validation
        if (!formData.accountHolderName.trim()) newErrors.accountHolderName = "Account holder name is required";
        if (!formData.accountNumber.trim() || !/^\d{9,18}$/.test(formData.accountNumber)) {
            newErrors.accountNumber = "Valid account number required (9-18 digits)";
        }
        if (!formData.ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
            newErrors.ifscCode = "Valid IFSC code required (e.g., SBIN0001234)";
        }

        // Images Validation
        if (!files.coverImage && !previews.coverImage) newErrors.coverImage = "Cover image is required";
        if (categorizedImages.length === 0) {
            newErrors.images = "At least one property image is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix all validation errors");
            return;
        }

        setLoading(true);
        try {
            const propertyData = {
                propertyName: formData.propertyName,
                propertyType: formData.propertyType,
                description: formData.description,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    country: formData.country
                },
                location: {
                    type: "Point" as const,
                    coordinates: [formData.coordinates.lng, formData.coordinates.lat] as [number, number]
                },
                destinationId: formData.destinationId
            };

            let currentPropertyId = propertyId;

            if (propertyId) {
                await partnerAuthService.updatePropertyDetails(propertyId, propertyData);
            } else {
                const res = await partnerAuthService.createProperty(propertyData);
                currentPropertyId = res._id;
            }

            if (!currentPropertyId) throw new Error("Failed to get property ID");

            // Step 2: Upload ownership documents (only if new files selected)
            if (files.ownershipProof || files.ownerKYC) {
                const ownershipFd = new FormData();
                if (files.ownershipProof) ownershipFd.append('ownershipProof', files.ownershipProof);
                if (files.ownerKYC) ownershipFd.append('ownerKYC', files.ownerKYC);
                await partnerAuthService.uploadPropertyOwnership(currentPropertyId, ownershipFd);
            }

            // Step 3: Upload tax documents
            const taxFd = new FormData();
            taxFd.append('gstNumber', formData.gstNumber);
            taxFd.append('panNumber', formData.panNumber.toUpperCase());
            if (files.gstCertificate) taxFd.append('gstCertificate', files.gstCertificate);
            if (files.panCard) taxFd.append('panCard', files.panCard);
            await partnerAuthService.uploadPropertyTax(currentPropertyId, taxFd);

            // Step 4: Update banking details
            await partnerAuthService.updatePropertyBanking(currentPropertyId, {
                accountHolderName: formData.accountHolderName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode.toUpperCase(),
                upiId: formData.upiId
            });

            // Step 5: Upload images
            const imagesToUpload = categorizedImages.filter(img => img.file); // Only new files
            const metadata = imagesToUpload.map(img => ({
                category: img.category,
                label: img.label
            }));

            if (files.coverImage || imagesToUpload.length > 0) {
                const imagesFd = new FormData();
                if (files.coverImage) imagesFd.append('coverImage', files.coverImage);

                imagesToUpload.forEach(img => {
                    if (img.file) imagesFd.append('images', img.file);
                });

                // Append metadata as stringified JSON
                imagesFd.append('imageMetadata', JSON.stringify(metadata));

                await partnerAuthService.uploadPropertyImages(currentPropertyId, imagesFd);
            }

            toast.success(propertyId ? "Property updated successfully!" : "Property registered successfully! Submitted for verification.");

            if (onCancel) {
                setTimeout(onCancel, 1500);
            } else {
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to save property");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (initialFetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {propertyId ? 'Edit Property' : 'Register Property'}
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">
                        {propertyId ? 'Make changes to your property details' : 'Fill in all details to list your property on NatureStay'}
                    </p>
                </div>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold transition-colors"
                    >
                        <X size={20} />
                        CANCEL {propertyId ? 'EDIT' : ''}
                    </button>
                )}
            </div>

            {/* Basic Details Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Building className="text-slate-900" size={24} />
                    Property Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="propertyName" className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Property Name *
                        </label>
                        <input
                            type="text"
                            name="propertyName"
                            value={formData.propertyName}
                            onChange={handleInputChange}
                            placeholder="e.g. Grand Palace Hotel"
                            className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold ${errors.propertyName ? 'border-red-500' : 'border-transparent'}`}
                        />
                        {errors.propertyName && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.propertyName}
                            </p>
                        )}
                    </div>

                    <div id="propertyType" className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Property Type *
                        </label>
                        <select
                            name="propertyType"
                            value={formData.propertyType}
                            onChange={handleInputChange}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                        >
                            <option value="hotel">Hotel</option>
                            <option value="resort">Resort</option>
                            <option value="villa">Villa</option>
                            <option value="apartment">Apartment</option>
                            <option value="homestay">Homestay</option>
                        </select>
                    </div>

                    <div id="description" className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Description * (min 20 characters)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Describe your property&apos;s best features..."
                            className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium ${errors.description ? 'border-red-500' : 'border-transparent'} `}
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.description}
                            </p>
                        )}
                    </div>

                </div>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <MapPin className="text-slate-900" size={24} />
                    Location & Address
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="street" className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Street Address *
                        </label>
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            placeholder="123 Main Street"
                            className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium ${errors.street ? 'border-red-500' : 'border-transparent'} `}
                        />
                        {errors.street && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.street}
                            </p>
                        )}
                    </div>

                    <div id="city" className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center justify-between">
                            <span>Destination (City) *</span>
                            <button
                                type="button"
                                onClick={fetchDestinations}
                                className="text-red-600 hover:text-red-700 transition"
                                title="Refresh Destinations"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={(e) => {
                                const selectedName = e.target.value;
                                const selectedDest = destinations.find(d => d.name === selectedName);
                                setFormData(prev => ({
                                    ...prev,
                                    city: selectedName,
                                    destinationId: selectedDest?._id || ""
                                }));
                                if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                            }}
                            className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold ${errors.city ? 'border-red-500' : 'border-transparent'} `}
                        >
                            <option value="">Select Destination</option>
                            {destinations.map((dest) => (
                                <option key={dest._id} value={dest.name}>
                                    {dest.name}
                                </option>
                            ))}
                        </select>
                        {errors.city && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.city}
                            </p>
                        )}
                    </div>

                    <div id="state" className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">
                            State *
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Karnataka"
                            className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold ${errors.state ? 'border-red-500' : 'border-transparent'} `}
                        />
                        {errors.state && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.state}
                            </p>
                        )}
                    </div>

                    <div id="pincode" className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">
                            Pincode *
                        </label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="560001"
                            maxLength={6}
                            className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold ${errors.pincode ? 'border-red-500' : 'border-transparent'} `}
                        />
                        {errors.pincode && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.pincode}
                            </p>
                        )}
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-red-500" />
                        Pin Exact Location *
                    </label>
                    <div className="h-80 rounded-2xl overflow-hidden border-2 border-gray-100 z-0 relative shadow-inner">
                        <MapContainer
                            center={[formData.coordinates.lat, formData.coordinates.lng]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationMarker
                                position={[formData.coordinates.lat, formData.coordinates.lng]}
                                setPosition={(pos) => setFormData(prev => ({ ...prev, coordinates: { lat: pos[0], lng: pos[1] } }))}
                            />
                            <MapUpdater center={[formData.coordinates.lat, formData.coordinates.lng]} />
                        </MapContainer>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mt-3 flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-md">Lat: {formData.coordinates.lat.toFixed(6)}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-md">Lng: {formData.coordinates.lng.toFixed(6)}</span>
                    </p>
                </div>
            </div>

            {/* Ownership Documents Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Ownership Documents</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="ownershipProof" className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Ownership Proof *
                        </label>
                        <div className={`relative aspect-video rounded-3xl border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden hover:border-slate-300 transition-colors group ${errors.ownershipProof ? 'border-red-500' : 'border-slate-100'} `}>
                            {previews.ownershipProof ? (
                                <img src={previews.ownershipProof} className="w-full h-full object-cover" alt="Proof" />
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm"><Upload className="text-gray-400" /></div>
                                    <span className="text-xs font-black text-gray-400">UPLOAD DOCUMENT</span>
                                </div>
                            )}
                            <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'ownershipProof')} />
                        </div>
                        {errors.ownershipProof && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.ownershipProof}
                            </p>
                        )}
                    </div>

                    <div id="ownerKYC" className="space-y-4">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">
                            Owner KYC (PAN/Aadhaar) *
                        </label>
                        <div className={`relative aspect-video rounded-3xl border-4 border-dashed bg-gray-50 flex items-center justify-center overflow-hidden hover:border-red-200 transition-colors group ${errors.ownerKYC ? 'border-red-500' : 'border-gray-100'} `}>
                            {previews.ownerKYC ? (
                                <img src={previews.ownerKYC} className="w-full h-full object-cover" alt="KYC" />
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm"><Upload className="text-gray-400" /></div>
                                    <span className="text-xs font-black text-gray-400">UPLOAD DOCUMENT</span>
                                </div>
                            )}
                            <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'ownerKYC')} />
                        </div>
                        {errors.ownerKYC && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.ownerKYC}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Tax Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="gstNumber" className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            GST Number *
                        </label>
                        <input
                            type="text"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleInputChange}
                            placeholder="22AAAAA0000A1Z5"
                            className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold ${errors.gstNumber ? 'border-red-500' : 'border-transparent'} `}
                        />
                        {errors.gstNumber && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.gstNumber}
                            </p>
                        )}
                    </div>

                    <div id="panNumber" className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            PAN Number *
                        </label>
                        <input
                            type="text"
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={handleInputChange}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            className={`w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold uppercase transition-all ${errors.panNumber ? 'border-red-500' : 'border-transparent'}`}
                        />
                        {errors.panNumber && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.panNumber}
                            </p>
                        )}
                    </div>

                    <div id="gstCertificate" className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            GST Certificate *
                        </label>
                        <div className={`relative aspect-video rounded-3xl border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden hover:border-slate-300 transition-colors group ${errors.gstCertificate ? 'border-red-500' : 'border-slate-100'}`}>
                            {previews.gstCertificate ? (
                                <img src={previews.gstCertificate} className="w-full h-full object-cover" alt="GST" />
                            ) : (
                                <Upload className="text-gray-400" />
                            )}
                            <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'gstCertificate')} />
                        </div>
                        {errors.gstCertificate && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.gstCertificate}
                            </p>
                        )}
                    </div>

                    <div id="panCard" className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            PAN Card *
                        </label>
                        <div className={`relative aspect-video rounded-3xl border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden hover:border-slate-300 transition-colors group ${errors.panCard ? 'border-red-500' : 'border-slate-100'}`}>
                            {previews.panCard ? (
                                <img src={previews.panCard} className="w-full h-full object-cover" alt="PAN" />
                            ) : (
                                <Upload className="text-gray-400" />
                            )}
                            <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'panCard')} />
                        </div>
                        {errors.panCard && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.panCard}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Banking Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="accountHolderName" className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Account Holder Name *
                        </label>
                        <input
                            type="text"
                            name="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className={`w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all ${errors.accountHolderName ? 'border-red-500' : 'border-transparent'}`}
                        />
                        {errors.accountHolderName && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.accountHolderName}
                            </p>
                        )}
                    </div>

                    <div id="accountNumber" className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Account Number *
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            placeholder="123456789012"
                            className={`w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all ${errors.accountNumber ? 'border-red-500' : 'border-transparent'}`}
                        />
                        {errors.accountNumber && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.accountNumber}
                            </p>
                        )}
                    </div>

                    <div id="ifscCode" className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            IFSC Code *
                        </label>
                        <input
                            type="text"
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={handleInputChange}
                            placeholder="SBIN0001234"
                            maxLength={11}
                            className={`w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold uppercase transition-all ${errors.ifscCode ? 'border-red-500' : 'border-transparent'}`}
                        />
                        {errors.ifscCode && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.ifscCode}
                            </p>
                        )}
                    </div>

                    <div id="upiId" className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            UPI ID (Optional)
                        </label>
                        <input
                            type="text"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleInputChange}
                            placeholder="user@paytm"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Property Gallery</h2>

                <div className="space-y-6">
                    <div id="coverImage" className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Cover Image *
                        </label>
                        <div className={`relative aspect-[21/9] rounded-[40px] border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden hover:border-slate-300 transition-colors group ${errors.coverImage ? 'border-red-500' : 'border-slate-100'}`}>
                            {previews.coverImage ? (
                                <img src={previews.coverImage} className="w-full h-full object-cover" alt="Cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <Camera className="text-slate-300" size={40} />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload Cover Photo</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'coverImage')} />
                        </div>
                        {errors.coverImage && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.coverImage}
                            </p>
                        )}
                    </div>

                    <div id="images" className="space-y-4">
                        <CategorizedImageUpload
                            images={categorizedImages}
                            onChange={setCategorizedImages}
                            error={errors.images}
                        />
                    </div>
                </div>
                {errors.images && (
                    <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.images}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-12 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold uppercase tracking-wider text-lg shadow-xl shadow-blue-200/50 hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            Submitting...
                        </>
                    ) : (
                        'Submit Property for Verification'
                    )}
                </button>
                <p className="text-center text-gray-500 text-sm mt-4 font-medium">
                    Your property will be reviewed by our admin team before going live
                </p>
            </div>
        </form>
    );
};

export default RegisterProperty;
