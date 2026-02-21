import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Upload, X, MapPin, Trash2, Clock, Calendar, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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

interface PlaceFormModalProps {
    place: PlaceToVisit | null;
    onSave: (place: Omit<PlaceToVisit, '_id' | 'slug'>) => void;
    onClose: () => void;
}

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

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const PlaceFormModal: React.FC<PlaceFormModalProps> = ({ place, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: place?.name || '',
        description: place?.description || '',
        images: place?.images || [],
        coordinates: place?.coordinates || { lat: 15.2993, lng: 74.1240 }, // Default to Goa
        category: place?.category || '',
        entryFee: place?.entryFee || 0,
        timings: place?.timings || '',
        bestTimeToVisit: place?.bestTimeToVisit || ''
    });

    // Parsed states for improved UI
    const [selectedMonths, setSelectedMonths] = useState<string[]>(
        place?.bestTimeToVisit ? place.bestTimeToVisit.split(', ').filter(Boolean) : []
    );

    // Default timings
    const [openTime, setOpenTime] = useState('09:00');
    const [closeTime, setCloseTime] = useState('18:00');
    const [is24Hours, setIs24Hours] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [pincode, setPincode] = useState('');
    const [mapPosition, setMapPosition] = useState<[number, number]>([
        formData.coordinates.lat,
        formData.coordinates.lng
    ]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handlePincodeSearch = async () => {
        if (!pincode || pincode.length < 5) return;

        try {
            setSearching(true);
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
            const response = await fetch(`${apiBase}/geocode/pincode?pincode=${encodeURIComponent(pincode)}&country=india`);
            const json = await response.json();
            const data = json.data;

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setMapPosition(newPos);
            } else {
                alert('Location not found for this pincode');
            }
        } catch (error) {
            console.error('Error searching pincode:', error);
            alert('Error searching for location');
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
        setFormData(prev => ({
            ...prev,
            coordinates: { lat: mapPosition[0], lng: mapPosition[1] }
        }));
    }, [mapPosition]);

    // Update formData when derived states change
    useEffect(() => {
        const timings = is24Hours ? 'Open 24 Hours' : `${formatTime(openTime)} - ${formatTime(closeTime)}`;
        setFormData(prev => ({
            ...prev,
            bestTimeToVisit: selectedMonths.join(', '),
            timings
        }));
    }, [selectedMonths, openTime, closeTime, is24Hours]);

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const imageUrl = await uploadService.uploadImage(file);
            setFormData({ ...formData, images: [...formData.images, imageUrl] });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const toggleMonth = (month: string) => {
        setSelectedMonths(prev =>
            prev.includes(month)
                ? prev.filter(m => m !== month)
                : [...prev, month]
        );
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Place name is required';
        else if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters';

        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';

        if (!formData.category) newErrors.category = 'Please select a category';

        if (mapPosition[0] === 0 && mapPosition[1] === 0) {
            newErrors.location = 'Please set a valid location on the map';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {place ? 'Edit Place' : 'Add Place to Visit'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Place Name *
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
                                    rows={3}
                                    className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => {
                                            setFormData({ ...formData, category: e.target.value });
                                            if (errors.category) setErrors({ ...errors, category: '' });
                                        }}
                                        className={`w-full px-4 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                    >
                                        <option value="">Select category</option>
                                        <option value="Temple">Temple</option>
                                        <option value="Beach">Beach</option>
                                        <option value="Museum">Museum</option>
                                        <option value="Viewpoint">Viewpoint</option>
                                        <option value="Park">Park</option>
                                        <option value="Monument">Monument</option>
                                        <option value="Waterfall">Waterfall</option>
                                        <option value="Fort">Fort</option>
                                        <option value="Adventure">Adventure</option>
                                        <option value="Nature">Nature</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Entry Fee (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.entryFee}
                                        onChange={(e) => setFormData({ ...formData, entryFee: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Improved Timings Input */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock size={16} /> Timings
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="24hours"
                                            checked={is24Hours}
                                            onChange={(e) => setIs24Hours(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor="24hours" className="text-sm text-gray-700">Open 24 Hours</label>
                                    </div>

                                    {!is24Hours && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500 uppercase font-bold">Opens</span>
                                                <input
                                                    type="time"
                                                    value={openTime}
                                                    onChange={(e) => setOpenTime(e.target.value)}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <span className="self-end mb-2 text-gray-400">-</span>
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500 uppercase font-bold">Closes</span>
                                                <input
                                                    type="time"
                                                    value={closeTime}
                                                    onChange={(e) => setCloseTime(e.target.value)}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                        Preview: <span className="font-medium text-gray-900">{is24Hours ? 'Open 24 Hours' : `${formatTime(openTime)} - ${formatTime(closeTime)}`}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Improved Best Time to Visit Input */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar size={16} /> Best Time to Visit (Select Months)
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {MONTHS.map(month => (
                                        <button
                                            key={month}
                                            type="button"
                                            onClick={() => toggleMonth(month)}
                                            className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${selectedMonths.includes(month)
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                }`}
                                        >
                                            {month.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Selected: <span className="font-medium text-gray-900">
                                        {selectedMonths.length > 0 ? selectedMonths.join(', ') : 'None'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <MapPin size={20} />
                                Location
                            </h3>
                        </div>

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
                            <div className="absolute bottom-2 left-2 z-[400] bg-white/90 px-2 py-1 rounded text-[10px] text-gray-600 border border-gray-200">
                                Click on map to adjust position
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Images</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="relative h-24 rounded-lg overflow-hidden">
                                    <img src={img} alt={`Place ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors bg-gray-50 hover:bg-white">
                                <Upload size={20} className="text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">Add Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-sm"
                        >
                            {uploading ? 'Uploading...' : place ? 'Update Place' : 'Add Place'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlaceFormModal;
