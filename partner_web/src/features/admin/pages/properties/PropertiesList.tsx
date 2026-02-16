import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAllProperties, togglePropertyStatus, deleteProperty } from '../../../../store/slices/propertiesSlice';

import { Search, Plus, Edit2, Trash2, Eye, MapPin, Home, Star, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { type Property } from '../../../../types';

const PropertiesList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { properties, isLoading, error } = useAppSelector((state) => state.properties);
    const [searchTerm, setSearchTerm] = useState('');

    const getImageUrl = (img: string | { url: string }) => {
        if (!img) return '';
        if (typeof img === 'string') return img;
        return img.url;
    };

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        dispatch(fetchAllProperties());
    }, [dispatch]);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        try {
            // Mapping isActive to isAvailable if needed by backend, assuming slice handles simple boolean pass
            // Slice togglePropertyStatus takes { propertyId, isActive }
            await dispatch(togglePropertyStatus({ propertyId: id, isActive: newStatus })).unwrap();
            toast.success(newStatus ? 'Property activated' : 'Property deactivated');
        } catch {
            toast.error('Failed to update property status');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Property',
            message: 'Are you sure you want to delete this property? This will remove all associated rooms, packages, and bookings.',
            onConfirm: async () => {
                try {
                    await dispatch(deleteProperty(id)).unwrap();
                    toast.success('Property deleted successfully');
                } catch {
                    toast.error('Failed to delete property');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleViewProperty = (id: string) => {
        navigate(`/admin/properties/${id}`);
    };

    const handleEditProperty = (id: string) => {
        navigate(`/admin/properties/${id}/edit`);
    };

    const filteredProperties = (properties as Property[]).filter((property) =>
        property.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.state?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeProperties = properties.filter((p) => p.isActive).length;
    const totalProperties = properties.length;
    // const averageRating = properties.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalProperties || 0;

    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    );

    if (isLoading) {
        return (
            <div>
                <div className="mb-8 animate-pulse">
                    <div className="h-10 bg-gray-300 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-md w-full text-center">
                    <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Properties</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => dispatch(fetchAllProperties())}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Properties
                    </h1>
                    <p className="text-gray-600">Manage all listed properties</p>
                </div>
                <button
                    onClick={() => navigate('/admin/properties/add')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                >
                    <Plus size={20} />
                    Add Property
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Total Properties</p>
                            <p className="text-3xl font-bold text-gray-800">{totalProperties}</p>
                            <p className="text-blue-600 text-sm mt-1 font-semibold">In System</p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-4">
                            <Home className="text-blue-600" size={28} />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Active</p>
                            <p className="text-3xl font-bold text-gray-800">{activeProperties}</p>
                            <p className="text-green-600 text-sm mt-1 font-semibold">Live on platform</p>
                        </div>
                        <div className="bg-green-50 rounded-2xl p-4">
                            <MapPin className="text-green-600" size={28} />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Pending Approval</p>
                            <p className="text-3xl font-bold text-gray-800">{totalProperties - activeProperties}</p>
                            <p className="text-yellow-600 text-sm mt-1 font-semibold">Requires Review</p>
                        </div>
                        <div className="bg-yellow-50 rounded-2xl p-4">
                            <AlertCircle className="text-yellow-600" size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Property Directory</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
                            </p>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search properties..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="py-3 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full md:w-80 transition-all"
                            />
                            <Search size={20} className="absolute top-3.5 left-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                            <tr>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Owner</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price/Night</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(filteredProperties as Property[]).map((property) => {
                                const propertyId = property._id;
                                const isActive = property.isActive;
                                return (
                                    <tr
                                        key={propertyId}
                                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer"
                                        onClick={() => handleViewProperty(propertyId)}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(property.images?.[0]) || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=200'}
                                                        alt={property.propertyName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=200' }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{property.propertyName || 'Untitled Property'}</p>
                                                    <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                                                        <Star size={12} fill="currentColor" />
                                                        <span>{property.rating || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1 text-gray-600 text-sm">
                                                <span className="truncate max-w-[150px]">{property.address?.city}, {property.address?.state}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-gray-800 text-sm font-medium">
                                                Owner
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-emerald-600 font-bold">
                                                -
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <label
                                                onClick={(e) => e.stopPropagation()}
                                                className="relative inline-flex items-center cursor-pointer group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isActive}
                                                    onChange={() => handleToggleStatus(propertyId, isActive)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-14 h-7 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-green-500 bg-gradient-to-r from-gray-300 to-gray-400 shadow-inner`}>
                                                    <div className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                                                </div>
                                            </label>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewProperty(propertyId);
                                                    }}
                                                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all hover:scale-110"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditProperty(propertyId);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(propertyId);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredProperties.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No properties found</p>
                    </div>
                )}
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                variant="danger"
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default PropertiesList;
