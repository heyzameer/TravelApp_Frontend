import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Upload, MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import destinationService from '../../services/destinationService';
import type { PlaceToVisit } from '../../services/destinationService';
import uploadService from '../../services/uploadService';

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
import PlaceFormModal from '../../components/destinations/PlaceFormModal';

import { toast } from 'react-hot-toast';
import ConfirmDialogManager from '../../utils/confirmDialog';

const DestinationFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // In strict route paths like /new, id will be undefined. 
    // If route was /:id, id would be "new".
    // Checking if id exists and is not 'new' is safer.
    const isEditMode = !!id && id !== 'new';

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        coverImage: '',
        images: [] as string[],
        coordinates: { lat: 0, lng: 0 },
        trending: false,
        isActive: true
    });

    const [places, setPlaces] = useState<PlaceToVisit[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showPlaceModal, setShowPlaceModal] = useState(false);
    const [editingPlace, setEditingPlace] = useState<PlaceToVisit | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pincode, setPincode] = useState('');
    const [searching, setSearching] = useState(false);
    const [mapPosition, setMapPosition] = useState<[number, number]>([
        formData.coordinates.lat || 15.2993,
        formData.coordinates.lng || 74.1240
    ]);

    // Update map position when formData loads from API
    useEffect(() => {
        if (formData.coordinates.lat && formData.coordinates.lng) {
            setMapPosition([formData.coordinates.lat, formData.coordinates.lng]);
        }
    }, [formData.coordinates.lat, formData.coordinates.lng]);

    // Sync map position back to formData
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            coordinates: { lat: mapPosition[0], lng: mapPosition[1] }
        }));
    }, [mapPosition]);

    const handlePincodeSearch = async () => {
        if (!pincode || pincode.length < 5) return;

        try {
            setSearching(true);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=india&format=json`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setMapPosition(newPos);
            } else {
                toast.error('Location not found for this pincode');
            }
        } catch (error) {
            console.error('Error searching pincode:', error);
            toast.error('Error searching for location');
        } finally {
            setSearching(false);
        }
    };

    const handleCoordinateChange = (field: 'lat' | 'lng', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        setMapPosition(prev => {
            const newPos: [number, number] = field === 'lat' ? [numValue, prev[1]] : [prev[0], numValue];
            return newPos;
        });
    };

    useEffect(() => {
        if (isEditMode && id) {
            fetchDestination();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditMode]);

    const fetchDestination = async () => {
        try {
            setLoading(true);
            const destination = await destinationService.getDestinationById(id!);
            setFormData({
                name: destination.name,
                description: destination.description,
                coverImage: destination.coverImage,
                images: destination.images,
                coordinates: destination.coordinates,
                trending: destination.trending,
                isActive: destination.isActive
            });
            setPlaces(destination.placesToVisit);
        } catch (error) {
            console.error('Error fetching destination:', error);
            toast.error('Failed to load destination details');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'gallery') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const imageUrl = await uploadService.uploadImage(file);

            if (type === 'cover') {
                setFormData({ ...formData, coverImage: imageUrl });
            } else {
                setFormData({ ...formData, images: [...formData.images, imageUrl] });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        else if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters';

        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';

        if (!formData.coverImage) newErrors.coverImage = 'Cover image is required';

        if (mapPosition[0] === 0 && mapPosition[1] === 0) {
            newErrors.location = 'Please set a valid location on the map';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        try {
            setLoading(true);
            if (isEditMode) {
                await destinationService.updateDestination(id!, formData);
                toast.success('Destination updated successfully');
            } else {
                // Include places for new destinations
                await destinationService.createDestination({ ...formData, placesToVisit: places });
                toast.success('Destination created successfully');
            }
            navigate('/admin/destinations');
        } catch (error) {
            console.error('Error saving destination:', error);
            toast.error('Failed to save destination');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlace = () => {
        setEditingPlace(null);
        setShowPlaceModal(true);
    };

    const handleEditPlace = (place: PlaceToVisit) => {
        setEditingPlace(place);
        setShowPlaceModal(true);
    };

    const handleSavePlace = async (placeData: Omit<PlaceToVisit, '_id' | 'slug'>) => {
        if (!isEditMode) {
            // For new destinations, just add to local state
            setPlaces([...places, { ...placeData, _id: Date.now().toString(), slug: '' }]);
            setShowPlaceModal(false);
            return;
        }

        try {
            if (editingPlace && editingPlace._id) {
                await destinationService.updatePlaceToVisit(id!, editingPlace._id, placeData);
                toast.success('Place updated successfully');
            } else {
                await destinationService.addPlaceToVisit(id!, placeData);
                toast.success('Place added successfully');
            }
            fetchDestination();
            setShowPlaceModal(false);
        } catch (error) {
            console.error('Error saving place:', error);
            toast.error('Failed to save place');
        }
    };

    const handleDeletePlace = async (placeId: string) => {
        const confirmed = await ConfirmDialogManager.getInstance().confirm(
            'Are you sure you want to delete this place? This action cannot be undone.',
            {
                title: 'Delete Place',
                confirmText: 'Delete',
                type: 'delete'
            }
        );

        if (!confirmed) return;

        if (!isEditMode) {
            setPlaces(places.filter(p => p._id !== placeId));
            toast.success('Place removed');
            return;
        }

        try {
            await destinationService.removePlaceToVisit(id!, placeId);
            fetchDestination();
            toast.success('Place deleted successfully');
        } catch (error) {
            console.error('Error deleting place:', error);
            toast.error('Failed to delete place');
        }
    };

    if (loading && isEditMode) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/admin/destinations')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft size={20} />
                Back to Destinations
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {isEditMode ? 'Edit Destination' : 'Create New Destination'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Destination Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: '' });
                                }}
                                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}

                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData({ ...formData, description: e.target.value });
                                    if (errors.description) setErrors({ ...errors, description: '' });
                                }}
                                rows={4}
                                className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}

                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>

                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <MapPin size={18} />
                                Location (Pincode or Map)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Pincode Search</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter Pincode"
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handlePincodeSearch}
                                            disabled={searching}
                                            className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
                                        >
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={mapPosition[0]}
                                        onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={mapPosition[1]}
                                        onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}

                            <div className="h-64 rounded-lg overflow-hidden border border-gray-300 relative">
                                <MapContainer
                                    center={mapPosition}
                                    zoom={10}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                                    <MapController center={mapPosition} />
                                </MapContainer>
                                <div className="absolute bottom-2 left-2 z-[400] bg-white/90 px-2 py-1 rounded text-[10px] text-gray-600 border border-gray-200 focus:outline-none">
                                    Click on map to adjust position
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.trending}
                                    onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">Trending</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Images</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cover Image *
                            </label>
                            {formData.coverImage ? (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, coverImage: '' })}
                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                                    <Upload size={32} className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click to upload cover image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            handleImageUpload(e, 'cover');
                                            if (errors.coverImage) setErrors({ ...errors, coverImage: '' });
                                        }}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                            {errors.coverImage && <p className="text-red-500 text-xs mt-1">{errors.coverImage}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gallery Images
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                                        <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                                    <Plus size={24} className="text-gray-400" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'gallery')}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Places to Visit */}
                {isEditMode && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Places to Visit</h2>
                            <button
                                type="button"
                                onClick={handleAddPlace}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                <Plus size={20} />
                                Add Place
                            </button>
                        </div>

                        <div className="space-y-3">
                            {places.map((place) => (
                                <div key={place._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{place.name}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-1">{place.description}</p>
                                        {place.category && (
                                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                {place.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleEditPlace(place)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePlace(place._id!)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {places.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No places added yet</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Saving...' : isEditMode ? 'Update Destination' : 'Create Destination'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/destinations')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {showPlaceModal && (
                <PlaceFormModal
                    place={editingPlace}
                    onSave={handleSavePlace}
                    onClose={() => setShowPlaceModal(false)}
                />
            )}
        </div>
    );
};

export default DestinationFormPage;
