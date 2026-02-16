import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import destinationService from '../../services/destinationService';
import type { PlaceToVisit } from '../../services/destinationService';
import uploadService from '../../services/uploadService';
import PlaceFormModal from '../../components/destinations/PlaceFormModal';

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
            alert('Failed to load destination');
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
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.coverImage) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            if (isEditMode) {
                await destinationService.updateDestination(id!, formData);
            } else {
                // Include places for new destinations
                await destinationService.createDestination({ ...formData, placesToVisit: places });
            }
            navigate('/admin/destinations');
        } catch (error) {
            console.error('Error saving destination:', error);
            alert('Failed to save destination');
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
            } else {
                await destinationService.addPlaceToVisit(id!, placeData);
            }
            fetchDestination();
            setShowPlaceModal(false);
        } catch (error) {
            console.error('Error saving place:', error);
            alert('Failed to save place');
        }
    };

    const handleDeletePlace = async (placeId: string) => {
        if (!window.confirm('Are you sure you want to delete this place?')) return;

        if (!isEditMode) {
            setPlaces(places.filter(p => p._id !== placeId));
            return;
        }

        try {
            await destinationService.removePlaceToVisit(id!, placeId);
            fetchDestination();
        } catch (error) {
            console.error('Error deleting place:', error);
            alert('Failed to delete place');
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
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitude *
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.coordinates.lat}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitude *
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.coordinates.lng}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
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
                                        onChange={(e) => handleImageUpload(e, 'cover')}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            )}
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
