
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchPartnerRequests } from '../../../../store/slices/partnersSlice';
import ReusableTable from '../../../../components/shared/ReusableTable';
import type { ColumnConfig } from '../../../../components/shared/ReusableTable';
import VerificationStatusBadge from '../../components/VerificationStatusBadge';

const PartnerRequests: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { partnerRequests, isLoading, error } = useAppSelector((state) => state.partners);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchPartnerRequests());
    }, [dispatch]);

    // Use a secondary filter if searchTerm is present
    const filteredRequests = partnerRequests.filter(partner =>
        partner.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewRequest = (id: string) => {
        navigate(`/admin/partners/${id}/verify`);
    };

    const columns: ColumnConfig<typeof partnerRequests[0]>[] = [
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
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-200">
                        <img
                            src={partner.profilePicture || partner.profileImage || '/profile3.png'}
                            alt={partner.fullName}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/profile3.png'; }}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{partner.fullName}</p>
                        <p className="text-xs text-gray-500">{partner.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Submitted',
            key: 'submitted',
            render: (partner) => (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock size={14} />
                    <span>{new Date(partner.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (partner) => (
                <VerificationStatusBadge status={partner.personalDocuments?.aadharStatus || 'not_submitted'} />
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            render: (partner) => {
                const partnerId = partner._id || partner.id || partner.partnerId;
                return (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewRequest(partnerId);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Eye size={16} />
                        Review
                    </button>
                );
            }
        }
    ];

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">Failed to load requests: {error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Partner Applications</h1>
                <p className="text-gray-600">Review and verify new partner registrations</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                    </div>
                </div>

                <ReusableTable
                    columns={columns}
                    data={filteredRequests}
                    isLoading={isLoading}
                    onRowClick={(partner) => {
                        const partnerId = partner._id || partner.id || partner.partnerId;
                        handleViewRequest(partnerId);
                    }}
                    keyExtractor={(partner) => partner._id || partner.id || partner.partnerId}
                    emptyMessage="No pending partner applications found."
                />
            </div>
        </div>
    );
};

export default PartnerRequests;
