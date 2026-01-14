import React, { useState, useEffect } from 'react';
import { Search, Edit2, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EditPartnerModal from './EditPartnerModal';
import { adminService } from '../../../../services/admin';

interface Partner {
  partnerId: string;
  _id?: string; // Added _id for backend compatibility
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  status: boolean;
  isActive?: boolean; // Added isActive field
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalAmount?: number;
  availablePoints?: number;
  bankDetailsCompleted: boolean;
  personalDocumentsCompleted: boolean;
  vehicleDetailsCompleted: boolean;
}

interface PartnerListProps {
  onViewPartner: (partnerId: string) => void;
}

const PartnerList: React.FC<PartnerListProps> = ({ onViewPartner }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await adminService.getAllPartners();
      console.log('Fetched partners:', response.data.partners.data);

      // Filter only fully verified partners and normalize status field
      const verifiedPartners = (response.data.partners.data || []).filter((partner: Partner) =>
        partner.bankDetailsCompleted === true &&
        partner.personalDocumentsCompleted === true &&
        partner.vehicleDetailsCompleted === true
      ).map((partner: Partner) => ({
        ...partner,
        // Ensure status reflects isActive if it exists
        status: partner.isActive !== undefined ? partner.isActive : partner.status
      }));

      console.log('Verified partners:', verifiedPartners);
      setPartners(verifiedPartners);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to fetch partners');
      setLoading(false);
    }
  };

  const handleStatusToggle = async (partner: Partner) => {
    // Get the ID that backend expects (_id)
    const backendId = partner._id || partner.id || partner.partnerId;
    const currentStatus = partner.isActive !== undefined ? partner.isActive : partner.status;
    const newStatus = !currentStatus;

    // Optimistically update UI
    setPartners(prev => prev.map(p => {
      const pId = p._id || p.id || p.partnerId;
      if (pId === backendId) {
        return { ...p, status: newStatus, isActive: newStatus };
      }
      return p;
    }));

    try {
      // Send request with _id in the payload
      const payload = { 
        _id: backendId,
        isActive: newStatus 
      };
      
      console.log('Sending status update:', payload);
      const response = await adminService.updatePartner(backendId, payload);

      // Update with response from backend
      if (response && response.partner) {
        const updatedPartner = response.partner;
        const apiStatus = updatedPartner.isActive !== undefined 
          ? updatedPartner.isActive 
          : updatedPartner.status;

        setPartners(prev => prev.map(p => {
          const pId = p._id || p.id || p.partnerId;
          if (pId === backendId) {
            return { 
              ...p, 
              ...updatedPartner,
              status: apiStatus,
              isActive: apiStatus
            };
          }
          return p;
        }));
      }

      toast.success(newStatus ? 'Partner activated' : 'Partner deactivated');
    } catch (error) {
      console.error('Error updating partner status:', error);
      
      // Revert optimistic update on failure
      setPartners(prev => prev.map(p => {
        const pId = p._id || p.id || p.partnerId;
        if (pId === backendId) {
          return { ...p, status: currentStatus, isActive: currentStatus };
        }
        return p;
      }));
      
      toast.error('Failed to update partner status. Please try again.');
    }
  };

  const handleView = (partnerId: string) => {
    onViewPartner(partnerId);
  };

  const filteredPartners = partners.filter(partner =>
    partner.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone?.includes(searchTerm) ||
    partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 md:mb-0">
          Verified Partners <span className="text-gray-500 font-normal">({partners.length})</span>
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Name, Email or Phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <th className="py-3 px-4 text-left">Sl No</th>
              <th className="py-3 px-4 text-left">Partner Name</th>
              <th className="py-3 px-4 text-left">Contact Info</th>
              <th className="py-3 px-4 text-left">Total Bookings</th>
              <th className="py-3 px-4 text-left">Completed</th>
              <th className="py-3 px-4 text-left">Canceled</th>
              <th className="py-3 px-4 text-left">Total Amount</th>
              <th className="py-3 px-4 text-left">Points</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((partner, index) => {
              const displayStatus = partner.isActive !== undefined ? partner.isActive : partner.status;
              
              return (
                <tr key={partner.partnerId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {partner.profileImage ? (
                        <img
                          src={partner.profileImage || '/profile3.png'}
                          alt={partner.fullName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <span className="text-gray-600 text-sm">
                            {partner.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {partner.fullName}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm">{partner.email}</div>
                      <div className="text-sm text-gray-500">{partner.phone}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{partner.totalOrders || 0}</td>
                  <td className="py-3 px-4">
                    <span className="text-green-600">{partner.completedOrders || 0}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-red-600">{partner.canceledOrders || 0}</span>
                  </td>
                  <td className="py-3 px-4">₹{(partner.totalAmount || 0).toFixed(2)}</td>
                  <td className="py-3 px-4">{partner.availablePoints || 0}</td>
                  <td className="py-3 px-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={displayStatus}
                        onChange={() => handleStatusToggle(partner)}
                        className="hidden"
                        title="Toggle partner status"
                      />
                      <span
                        className={`w-10 h-5 flex items-center rounded-full p-1 ${
                          displayStatus ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            displayStatus ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        ></span>
                      </span>
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit user"
                        onClick={() => {
                          setSelectedPartner(partner);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="text-green-500 hover:text-green-700 transition-colors"
                        title="View details"
                        onClick={() => handleView(partner.partnerId)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete partner"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnerList;