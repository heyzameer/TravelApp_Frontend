import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Eye, Trash2, UserCheck, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAllPartners, updatePartner, deletePartner, sendPartnerEmail } from '../../../../store/slices/partnersSlice';
import EmailNotificationModal from '../../components/EmailNotificationModal';
import ReusableTable from '../../../../components/shared/ReusableTable';
import type { ColumnConfig } from '../../../../components/shared/ReusableTable';

const PartnersList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { partners, isLoading, error } = useAppSelector((state) => state.partners);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [selectedPartnerForStatus, setSelectedPartnerForStatus] = useState<{ id: string; email: string; currentStatus: boolean } | null>(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    useEffect(() => {
        dispatch(fetchAllPartners());
    }, [dispatch]);

    const handleStatusToggle = (id: string, currentStatus: boolean, email: string) => {
        setSelectedPartnerForStatus({ id, email, currentStatus });
        setIsEmailModalOpen(true);
    };

    const handleEmailSubmit = async (subject: string, message: string) => {
        if (!selectedPartnerForStatus) return;

        setIsSendingEmail(true);
        try {
            // 1. Send Email
            await dispatch(sendPartnerEmail({
                email: selectedPartnerForStatus.email,
                subject,
                message
            })).unwrap();

            toast.success('Email sent successfully');

            // 2. Update Status
            const newStatus = !selectedPartnerForStatus.currentStatus;
            await dispatch(updatePartner({
                partnerId: selectedPartnerForStatus.id,
                partnerData: { isActive: newStatus }
            })).unwrap();

            toast.success(newStatus ? 'Partner activated' : 'Partner deactivated');

            // 3. Close Modal and Reset
            setIsEmailModalOpen(false);
            setSelectedPartnerForStatus(null);
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to complete operation');
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this partner?')) {
            try {
                await dispatch(deletePartner(id)).unwrap();
                toast.success('Partner deleted successfully');
            } catch (err) {
                toast.error('Failed to delete partner');
            }
        }
    };

    const handleViewPartner = (id: string) => {
        navigate(`/admin/partners/${id}`);
    };

    const filteredPartners = partners.filter(partner =>
        partner.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.phone?.includes(searchTerm) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log('Filtered Partners:', filteredPartners);
    console.log('Partner:', partners);

    const totalRevenue = partners.reduce((sum, partner) => sum + (partner.totalAmount || 0), 0);
    const activePartners = partners.filter(p => p.isActive).length;

    // Column configuration for ReusableTable
    const columns: ColumnConfig<typeof partners[0]>[] = [
        {
            header: '#',
            key: 'index',
            render: (_, index) => <span className="text-gray-600 font-medium">{index + 1}</span>
        },
        {
            header: 'Partner',
            key: 'partner',
            render: (partner) => (
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 flex-shrink-0 border-2 border-white shadow-md">
                            <img
                                src={partner.profilePicture || partner.profileImage || '/profile3.png'}
                                alt={partner.fullName}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/profile3.png'; }}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${partner.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{partner.fullName}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Contact',
            key: 'contact',
            render: (partner) => (
                <div className="space-y-1">
                    <p className="text-sm text-gray-800">{partner.email}</p>
                    <p className="text-sm text-gray-500">{partner.phone}</p>
                </div>
            )
        },
        {
            header: 'Bookings',
            key: 'bookings',
            render: (partner) => (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                    {partner.totalOrders || 0}
                </span>
            )
        },
        {
            header: 'Revenue',
            key: 'revenue',
            render: (partner) => (
                <span className="text-emerald-600 font-bold">₹{partner.totalAmount?.toFixed(2) || 0}</span>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (partner) => {
                const partnerId = partner._id || partner.id || partner.partnerId;
                return (
                    <label
                        onClick={(e) => e.stopPropagation()}
                        className="relative inline-flex items-center cursor-pointer group"
                    >
                        <input
                            type="checkbox"
                            checked={partner.isActive}
                            onChange={() => handleStatusToggle(partnerId, partner.isActive, partner.email)}
                            onClick={(e) => e.stopPropagation()}
                            className="sr-only peer"
                        />
                        <div className={`w-14 h-7 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-green-500 bg-gradient-to-r from-gray-300 to-gray-400 shadow-inner`}>
                            <div className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${partner.isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                        </div>
                    </label>
                );
            }
        },
        {
            header: 'Actions',
            key: 'actions',
            render: (partner) => {
                const partnerId = partner._id || partner.id || partner.partnerId;
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewPartner(partnerId);
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all hover:scale-110"
                            title="View Details"
                        >
                            <Eye size={18} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Optional: Open edit modal
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
                            title="Edit"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(partnerId);
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                );
            }
        }
    ];

    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="bg-gray-200 rounded-2xl p-4 w-16 h-16"></div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div>
                <div className="mb-8 animate-pulse">
                    <div className="h-10 bg-gray-300 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200 animate-pulse">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="h-12 bg-gray-200 rounded-xl w-80"></div>
                        </div>
                    </div>

                    <ReusableTable
                        columns={columns}
                        data={[]}
                        isLoading={true}
                        keyExtractor={() => ''}
                        emptyMessage="No partners found"
                    />
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
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Partners</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => dispatch(fetchAllPartners())}
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
                    Property Owners
                </h1>
                <p className="text-gray-600">Manage your verified property partners</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Total Owners</p>
                            <p className="text-3xl font-bold text-gray-800">{partners.length}</p>
                            <p className="text-green-600 text-sm mt-1 font-semibold">{activePartners} Active</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4">
                            <UserCheck className="text-white" size={28} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-800">₹{totalRevenue.toFixed(2) || 0}</p>
                            <p className="text-blue-600 text-sm mt-1 font-semibold">From all partners</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4">
                            <TrendingUp className="text-white" size={28} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Available Points</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {partners.reduce((sum, p) => sum + (p.availablePoints || 0), 0)}
                            </p>
                            <p className="text-emerald-600 text-sm mt-1 font-semibold">Total Distributed</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4">
                            <DollarSign className="text-white" size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header with Search */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Partner Directory</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {filteredPartners.length} {filteredPartners.length === 1 ? 'partner' : 'partners'} found
                            </p>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search partners..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="py-3 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full md:w-80 transition-all"
                            />
                            <Search size={20} className="absolute top-3.5 left-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <ReusableTable
                    columns={columns}
                    data={filteredPartners}
                    isLoading={false}
                    onRowClick={(partner) => {
                        const partnerId = partner._id || partner.id || partner.partnerId;
                        handleViewPartner(partnerId);
                    }}
                    keyExtractor={(partner) => partner._id || partner.id || partner.partnerId}
                    emptyMessage="No partners found"
                />
            </div>
            <EmailNotificationModal
                isOpen={isEmailModalOpen}
                onClose={() => {
                    setIsEmailModalOpen(false);
                    setSelectedPartnerForStatus(null);
                }}
                onSubmit={handleEmailSubmit}
                partnerEmail={selectedPartnerForStatus?.email || ''}
                isSending={isSendingEmail}
            />
        </div>
    );
};

export default PartnersList;
