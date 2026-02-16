import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import destinationService from '../../services/destinationService';
import type { Destination } from '../../services/destinationService';
import { useNavigate } from 'react-router-dom';

const DestinationsPage: React.FC = () => {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            setLoading(true);
            const data = await destinationService.getAdminDestinations();
            setDestinations(data);
        } catch (error) {
            console.error('Error fetching destinations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this destination?`)) return;

        try {
            await destinationService.updateDestination(id, { isActive: !currentStatus });
            fetchDestinations();
        } catch (error) {
            console.error('Error toggling destination status:', error);
        }
    };

    const handleToggleTrending = async (id: string, currentStatus: boolean) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'remove from' : 'add to'} trending?`)) return;

        try {
            await destinationService.updateDestination(id, { trending: !currentStatus });
            fetchDestinations();
        } catch (error) {
            console.error('Error toggling trending status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this destination?')) {
            try {
                await destinationService.deleteDestination(id);
                fetchDestinations();
            } catch (error) {
                console.error('Error deleting destination:', error);
            }
        }
    };

    const filteredDestinations = destinations.filter(dest =>
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
                <button
                    onClick={() => navigate('/admin/destinations/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={20} />
                    Add Destination
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((destination) => (
                    <div key={destination._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                        <div className="relative h-48">
                            <img
                                src={destination.coverImage || '/placeholder-destination.jpg'}
                                alt={destination.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                                {destination.trending && (
                                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
                                        Trending
                                    </span>
                                )}
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${destination.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                    }`}>
                                    {destination.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{destination.name}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{destination.description}</p>

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <MapPin size={16} />
                                <span>{destination.coordinates.lat.toFixed(4)}, {destination.coordinates.lng.toFixed(4)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                <ImageIcon size={16} />
                                <span>{destination.placesToVisit.length} places to visit</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/admin/destinations/edit/${destination._id}`)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleToggleActive(destination._id, destination.isActive)}
                                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded transition text-sm ${destination.isActive
                                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                >
                                    {destination.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(destination._id)}
                                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <button
                                onClick={() => handleToggleTrending(destination._id, destination.trending)}
                                className={`w-full mt-2 px-3 py-2 rounded transition text-sm ${destination.trending
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                {destination.trending ? '⭐ Remove from Trending' : '⭐ Mark as Trending'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredDestinations.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No destinations found</p>
                    <button
                        onClick={() => navigate('/admin/destinations/new')}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Create Your First Destination
                    </button>
                </div>
            )}
        </div>
    );
};

export default DestinationsPage;
