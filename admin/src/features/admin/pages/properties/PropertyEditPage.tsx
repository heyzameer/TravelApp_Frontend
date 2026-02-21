
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building, MapPin, AlertCircle, Loader2, RefreshCw, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchPropertyById, updateProperty } from '../../../../store/slices/propertiesSlice';
import { toast } from 'react-hot-toast';
import destinationService, { type Destination } from '../../../../services/destinationService';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const PropertyEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedProperty, isLoading, error } = useAppSelector((state) => state.properties);

    const [isSaving, setIsSaving] = useState(false);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [fetchingDestinations, setFetchingDestinations] = useState(false);
    const [pincodeSearch, setPincodeSearch] = useState('');
    const [searchingPincode, setSearchingPincode] = useState(false);

    const [formData, setFormData] = useState<{
        propertyName: string;
        propertyType: 'hotel' | 'homestay' | 'apartment' | 'resort' | 'villa';
        description: string;
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
        destinationId: string;
    }>({
        propertyName: '',
        propertyType: 'hotel',
        description: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        location: {
            type: 'Point',
            coordinates: [77.5946, 12.9716]
        },
        destinationId: ''
    });

    const [mapPosition, setMapPosition] = useState<[number, number]>([12.9716, 77.5946]); // [lat, lng]

    useEffect(() => {
        if (id) {
            dispatch(fetchPropertyById(id));
        }
        fetchDestinations();
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedProperty) {
            setFormData({
                propertyName: selectedProperty.propertyName || '',
                propertyType: selectedProperty.propertyType || 'hotel',
                description: selectedProperty.description || '',
                address: {
                    street: selectedProperty.address?.street || '',
                    city: selectedProperty.address?.city || '',
                    state: selectedProperty.address?.state || '',
                    pincode: selectedProperty.address?.pincode || '',
                    country: selectedProperty.address?.country || 'India'
                },
                location: {
                    type: 'Point',
                    coordinates: selectedProperty.location?.coordinates || [77.5946, 12.9716]
                },
                destinationId: selectedProperty.destinationId
                    ? (typeof selectedProperty.destinationId === 'string'
                        ? selectedProperty.destinationId
                        : selectedProperty.destinationId._id)
                    : ''
            });

            if (selectedProperty.location?.coordinates) {
                setMapPosition([selectedProperty.location.coordinates[1], selectedProperty.location.coordinates[0]]);
            }
        }
    }, [selectedProperty]);

    const fetchDestinations = async () => {
        try {
            setFetchingDestinations(true);
            const data = await destinationService.getAllDestinations();
            setDestinations(data);
        } catch (err) {
            console.error('Failed to fetch destinations', err);
        } finally {
            setFetchingDestinations(false);
        }
    };

    const handlePincodeSearch = async () => {
        if (!pincodeSearch || pincodeSearch.length < 5) return;

        try {
            setSearchingPincode(true);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincodeSearch}&country=india&format=json`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setMapPosition(newPos);
                toast.success('Map position updated');
            } else {
                toast.error('Location not found for this pincode');
            }
        } catch (error) {
            console.error('Error searching pincode:', error);
            toast.error('Error searching for location');
        } finally {
            setSearchingPincode(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.') as [keyof typeof formData, string];
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent] as Record<string, unknown>),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setIsSaving(true);
        try {
            const updatedData = {
                ...formData,
                location: {
                    ...formData.location,
                    coordinates: [mapPosition[1], mapPosition[0]] as [number, number] // [lng, lat]
                }
            };

            await dispatch(updateProperty({ propertyId: id, propertyData: updatedData })).unwrap();
            toast.success('Property updated successfully');
            navigate(`/admin/properties/${id}`);
        } catch (err: unknown) {
            const errorMessage = typeof err === 'string' ? err : (err as Error)?.message || 'Failed to update property';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !selectedProperty) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (error || (!selectedProperty && !isLoading)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <div className="bg-red-50 p-8 rounded-3xl text-center max-w-md">
                    <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                    <p className="text-red-600 text-xl font-bold mb-2">Error loading property</p>
                    <p className="text-red-500 mb-6">{error || 'Property not found'}</p>
                    <button
                        onClick={() => navigate('/admin/properties')}
                        className="px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                    >
                        Back to Properties
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <button
                onClick={() => navigate(`/admin/properties/${id}`)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium transition-colors"
            >
                <ArrowLeft size={18} />
                Back to Details
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Edit Property</h1>
                    <p className="text-gray-500 mt-2 font-medium">Update property details and settings</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/admin/properties/${id}`)}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <Building size={24} className="text-blue-600" />
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Property Name</label>
                            <input
                                type="text"
                                name="propertyName"
                                value={formData.propertyName}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-800 transition-all"
                                placeholder="Enter property name"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Property Type</label>
                            <select
                                name="propertyType"
                                value={formData.propertyType}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-800 transition-all appearance-none"
                            >
                                <option value="hotel">Hotel</option>
                                <option value="homestay">Homestay</option>
                                <option value="apartment">Apartment</option>
                                <option value="resort">Resort</option>
                                <option value="villa">Villa</option>
                            </select>
                        </div>

                        <div className="space-y-3 md:col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none font-medium text-gray-700 transition-all resize-none"
                                placeholder="Describe the property..."
                            />
                        </div>
                    </div>
                </div>



                {/* Location & Address */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <MapPin size={24} className="text-blue-600" />
                        Location & Address
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                            <input
                                type="text"
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-800 transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                                Destination
                                <button type="button" onClick={fetchDestinations} className="text-blue-600 hover:text-blue-700">
                                    <RefreshCw size={14} className={fetchingDestinations ? 'animate-spin' : ''} />
                                </button>
                            </label>
                            <select
                                name="destinationId"
                                value={formData.destinationId}
                                onChange={(e) => {
                                    const destId = e.target.value;
                                    const dest = destinations.find(d => d._id === destId);
                                    setFormData(prev => ({
                                        ...prev,
                                        destinationId: destId,
                                        address: {
                                            ...prev.address,
                                            city: dest?.name || prev.address.city
                                        }
                                    }));
                                }}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-800 transition-all appearance-none"
                            >
                                <option value="">Select Destination</option>
                                {destinations.map(dest => (
                                    <option key={dest._id} value={dest._id}>{dest.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">City (mapped from destination)</label>
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                readOnly
                                className="w-full px-6 py-4 bg-gray-100 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">State</label>
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-800 transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="address.pincode"
                                    value={formData.address.pincode}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        setPincodeSearch(e.target.value);
                                    }}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-800 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={handlePincodeSearch}
                                    disabled={searchingPincode}
                                    className="px-6 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {searchingPincode ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Precise Map Location (Drag marker or click)</label>
                        <div className="h-96 rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner relative z-10">
                            <MapContainer
                                center={mapPosition}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                                <MapController center={mapPosition} />
                            </MapContainer>
                            <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-gray-600 shadow-xl border border-white">
                                Lat: {mapPosition[0].toFixed(6)} | Lng: {mapPosition[1].toFixed(6)}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PropertyEditPage;
