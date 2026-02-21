import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../../services/admin';
import { Search, Eye, Clock, Building, AlertCircle, Loader2, User, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PropertyApplication {
    _id: string;
    propertyId: string;
    propertyName: string;
    propertyType: string;
    address: {
        city: string;
        state: string;
    };
    pricePerNight?: number;
    submittedForVerificationAt?: string;
    partnerId?: {
        fullName: string;
        email: string;
    };
}

const PropertyApplications: React.FC = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<PropertyApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminService.getAllPropertyApplications();
            const data = response.data || response;
            setApplications((data.properties as unknown as PropertyApplication[]) || (data as unknown as PropertyApplication[]) || []);
        } catch (err: unknown) {
            console.error('Failed to fetch property applications:', err);
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Failed to load applications');
            toast.error('Failed to load property applications');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewApplication = (propertyId: string) => {
        navigate(`/admin/properties/${propertyId}/verify`);
    };

    const filteredApplications = applications.filter(app =>
        app.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.partnerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
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
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Applications</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchApplications}
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
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Property Applications
                </h1>
                <p className="text-gray-600">Review and verify pending property submissions</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-md">
                <button
                    onClick={() => navigate('/admin/properties')}
                    className="flex-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                    All Properties
                </button>
                <button
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg shadow-sm"
                >
                    Applications
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Pending Applications</p>
                            <p className="text-3xl font-bold text-gray-800">{applications.length}</p>
                            <p className="text-yellow-600 text-sm mt-1 font-semibold">Awaiting Review</p>
                        </div>
                        <div className="bg-yellow-50 rounded-2xl p-4">
                            <Clock className="text-yellow-600" size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Applications Queue</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'} found
                            </p>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search applications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="py-3 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full md:w-80 transition-all"
                            />
                            <Search size={20} className="absolute top-3.5 left-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {filteredApplications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building className="mx-auto text-gray-300 mb-4" size={64} />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Applications</h3>
                        <p className="text-gray-500">All property submissions have been reviewed</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredApplications.map((application) => (
                            <div
                                key={application._id}
                                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => handleViewApplication(application._id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <Building className="text-blue-600" size={24} />
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{application.propertyName}</h3>
                                                <p className="text-sm text-gray-500 uppercase tracking-wider">
                                                    {application.propertyType} • {application.address.city}, {application.address.state}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-gray-600">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <User size={13} className="text-gray-400 shrink-0" />
                                                    <span className="font-semibold">Partner:</span>
                                                    <span className="font-medium text-gray-800">
                                                        {application.partnerId?.fullName || <span className="text-red-500 italic">Not populated</span>}
                                                    </span>
                                                </div>
                                                {application.partnerId?.email && (
                                                    <div className="flex items-center gap-2 ml-0.5">
                                                        <Mail size={12} className="text-gray-400 shrink-0" />
                                                        <span className="text-xs text-gray-500">{application.partnerId.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {application.pricePerNight !== undefined && application.pricePerNight > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">Min Price:</span>
                                                    <span className="text-emerald-600 font-bold">₹{application.pricePerNight.toLocaleString('en-IN')}/night</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">Price:</span>
                                                    <span className="text-gray-400 italic text-xs">No rooms configured</span>
                                                </div>
                                            )}
                                            {application.submittedForVerificationAt && (
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-gray-400" />
                                                    <span>Submitted {new Date(application.submittedForVerificationAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewApplication(application._id);
                                        }}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                                    >
                                        <Eye size={18} />
                                        Review
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyApplications;
