
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Building, DollarSign,
    Star, Bed, ShieldCheck, Calendar,
    MessageSquare, Trash2, Edit2, ExternalLink
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchPropertyById, togglePropertyStatus, deleteProperty } from '../../../../store/slices/propertiesSlice';
import { toast } from 'react-hot-toast';
import VerificationStatusBadge from '../../components/VerificationStatusBadge';

const PropertyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedProperty, isLoading, error } = useAppSelector((state) => state.properties);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchPropertyById(id));
        }
    }, [dispatch, id]);

    const handleToggleStatus = async () => {
        if (!selectedProperty || !id) return;
        setIsActionLoading(true);
        try {
            await dispatch(togglePropertyStatus({
                propertyId: id,
                isActive: !selectedProperty.isActive
            })).unwrap();
            toast.success(selectedProperty.isActive ? 'Property deactivated' : 'Property activated');
        } catch (err: unknown) {
            toast.error((typeof err === 'string' ? err : '') || 'Failed to update status');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            setIsActionLoading(true);
            try {
                await dispatch(deleteProperty(id)).unwrap();
                toast.success('Property deleted successfully');
                navigate('/admin/properties');
            } catch (err: unknown) {
                toast.error((typeof err === 'string' ? err : '') || 'Failed to delete property');
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    if (isLoading && !selectedProperty) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !selectedProperty) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <div className="bg-red-50 p-6 rounded-2xl text-center max-w-md">
                    <p className="text-red-600 text-lg font-bold mb-4">Error loading property details</p>
                    <p className="text-red-500 text-sm mb-6">{error || 'Property not found'}</p>
                    <button
                        onClick={() => navigate('/admin/properties')}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-red-200 hover:bg-red-50 rounded-xl text-red-600 font-bold transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                        Back to Properties
                    </button>
                </div>
            </div>
        );
    }

    const {
        propertyName,
        propertyType,
        description,
        address,
        pricePerNight,
        maxGuests,
        totalRooms,
        verificationStatus,
        isActive,
        coverImage,
        images,
        rating,
        reviewsCount,
        amenities,
        partner,
        createdAt
    } = selectedProperty;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Header & Breadcrumbs */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/properties')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Directory
                </button>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{propertyName}</h1>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <VerificationStatusBadge status={verificationStatus === 'verified' ? 'approved' : verificationStatus === 'pending' ? 'manual_review' : verificationStatus as any} />
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                {isActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600">
                            <span className="flex items-center gap-1.5 capitalize font-medium">
                                <Building size={18} className="text-gray-400" />
                                {propertyType}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                                <MapPin size={18} className="text-gray-400" />
                                {address?.city}, {address?.state}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                                <Calendar size={18} className="text-gray-400" />
                                Listed on {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleToggleStatus}
                            disabled={isActionLoading}
                            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm border ${isActive
                                ? 'bg-white text-orange-600 border-orange-100 hover:bg-orange-50'
                                : 'bg-white text-green-600 border-green-100 hover:bg-green-50'
                                }`}
                        >
                            {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                            onClick={() => navigate(`/admin/properties/${id}/edit`)}
                            className="bg-white text-blue-600 border border-blue-100 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-sm"
                        >
                            <Edit2 size={18} />
                            Edit
                        </button>
                        {verificationStatus === 'pending' && (
                            <button
                                onClick={() => navigate(`/admin/properties/${id}/verify`)}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                            >
                                <ShieldCheck size={18} />
                                Verify Now
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={isActionLoading}
                            className="bg-white text-red-600 border border-red-100 px-4 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-all shadow-sm"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Media Gallery Card */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="aspect-[21/9] relative group">
                            <img
                                src={coverImage || images?.[0]?.url || '/hero-prop.jpg'}
                                alt={propertyName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-700 shadow-xl border border-white">
                                Primary Cover
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Property Photos</h3>
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                    {images?.length || 0} Total Images
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images?.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden cursor-pointer border border-gray-100 group relative">
                                        <img src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <ExternalLink size={24} className="text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* About Content */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            About this property
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-lg mb-8">
                            {description}
                        </p>

                        <div className="border-t border-gray-50 pt-8">
                            <h4 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-widest text-[11px]">Amenities & Features</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                                {amenities?.map((amenity, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-gray-700">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="font-medium">{amenity}</span>
                                    </div>
                                )) || <p className="text-gray-400 italic">No amenities listed</p>}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon={<Star className="text-yellow-500" />} label="Overall Rating" value={`${rating || 0} / 5`} sub={`${reviewsCount || 0} Verified Reviews`} />
                        <StatCard icon={<Bed className="text-purple-600" />} label="Accommodation" value={`${totalRooms} Rooms`} sub={`${maxGuests} Max Guests`} />
                        <StatCard icon={<DollarSign className="text-emerald-600" />} label="Pricing" value={`₹${pricePerNight}`} sub="Average per night" />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Partner Card */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 mb-6 shadow-lg">
                                <div className="w-full h-full rounded-full bg-white overflow-hidden p-0.5">
                                    {partner?.profilePicture ? (
                                        <img src={partner.profilePicture} alt="Partner" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-3xl">
                                            {partner?.fullName?.charAt(0) || 'P'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">{partner?.fullName || 'Unknown Partner'}</h4>
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-6">Verified Partner</p>

                            <div className="w-full space-y-3 mb-6">
                                <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all border border-gray-100 text-sm">
                                    Contact Owner
                                </button>
                                <button
                                    onClick={() => navigate(`/admin/partners/${selectedProperty.partnerId}`)}
                                    className="w-full py-3 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-xl transition-all border border-blue-50 border-dashed text-sm"
                                >
                                    View Partner Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin size={20} className="text-blue-600" />
                            Location
                        </h3>
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6">
                            <p className="text-gray-800 font-bold mb-2 leading-tight">{address?.street}</p>
                            <p className="text-sm text-gray-500 font-medium">{address?.city}, {address?.state} - {address?.pincode}</p>
                            <p className="text-sm text-gray-500 mt-1">{address?.country}</p>
                        </div>
                        <button className="w-full py-4 bg-blue-600 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <ExternalLink size={18} />
                            OPEN IN GOOGLE MAPS
                        </button>
                    </div>

                    {/* Engagement / Performance Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 shadow-xl text-white">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <MessageSquare size={20} />
                            Quick Message
                        </h3>
                        <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                            Need update from the partner about this property or documents?
                        </p>
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl backdrop-blur-md transition-all border border-white/10">
                            Send Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub: string }> = ({ icon, label, value, sub }) => (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm text-center md:text-left">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-inner">
            {icon}
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
        <p className="text-xs font-bold text-blue-500">{sub}</p>
    </div>
);

export default PropertyDetail;
