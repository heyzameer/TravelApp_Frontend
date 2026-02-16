import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../../../services/admin';

import type { PartnerUser } from '../../../../types';

type ExtendedPartner = PartnerUser;

interface PartnerListProps {
  onViewPartner: (partnerId: string) => void;
}

const PartnerList: React.FC<PartnerListProps> = ({ onViewPartner }) => {
  const [partners, setPartners] = useState<ExtendedPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const partnersData = await adminService.getAllPartners();

      // Filter only fully verified partners and normalize status field
      const verifiedPartners = (partnersData || []).filter((partner) =>
        partner.bankDetailsCompleted === true &&
        partner.personalDocumentsCompleted === true &&
        partner.vehicleDetailsCompleted === true
      ).map((partner) => ({
        ...partner,
        // No need to map status here if we use isActive
      })) as ExtendedPartner[];

      setPartners(verifiedPartners);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to fetch partners');
      setLoading(false);
    }
  };

  const handleStatusToggle = async (partner: ExtendedPartner) => {
    // Get the ID that backend expects (_id)
    const backendId = partner._id || partner.id || partner.partnerId;
    const currentStatus = partner.isActive;
    const newStatus = !currentStatus;

    // Optimistically update UI
    setPartners(prev => prev.map(p => {
      const pId = p._id || p.id || p.partnerId;
      if (pId === backendId) {
        return { ...p, isActive: newStatus };
      }
      return p;
    }));

    try {
      // Send request with _id in the payload
      const payload = {
        _id: backendId,
        isActive: newStatus
      };

      await adminService.updatePartner(backendId, payload);
      toast.success('Partner status updated');
    } catch (err) {
      console.error('Error updating status:', err);

      // Revert optimistic update on failure
      setPartners(prev => prev.map(p => {
        const pId = p._id || p.id || p.partnerId;
        if (pId === backendId) {
          return { ...p, isActive: currentStatus };
        }
        return p;
      }));

      toast.error('Failed to update status');
    }
  };

  const handleView = (partnerId: string) => {
    onViewPartner(partnerId);
  };

  const filteredPartners = partners.filter(partner =>
    partner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone.includes(searchTerm)
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <h2 className="text-lg font-semibold text-gray-800">Partner Management</h2>
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </span>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Partner</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Total Orders</th>
              <th className="py-3 px-4">Completed</th>
              <th className="py-3 px-4">Cancelled</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Points</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.map((partner) => {
              const displayStatus = partner.isActive;
              return (
                <tr key={partner._id || partner.id || partner.partnerId} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {partner.profileImage ? (
                        <img
                          src={partner.profileImage}
                          alt={partner.fullName}
                          className="w-8 h-8 rounded-full border border-gray-200 mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <span className="text-gray-600 text-sm">
                            {partner.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium">{partner.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm">{partner.email}</div>
                      <div className="text-xs text-gray-500">{partner.phone}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{partner.totalOrders || 0}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="text-green-600">{partner.completedOrders || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className="text-red-600">{partner.canceledOrders || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">₹{(partner.totalAmount || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm">{partner.availablePoints || 0}</td>
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={displayStatus}
                        onChange={() => handleStatusToggle(partner)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-3">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View details"
                        onClick={() => handleView(partner.partnerId)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 transition-colors"
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

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPartners.length)} of {filteredPartners.length} partners
          </span>
          <div className="flex space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerList;