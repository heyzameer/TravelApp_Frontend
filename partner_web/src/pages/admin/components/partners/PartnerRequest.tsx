import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { adminService } from '../../../../services/admin';
import type { PartnerUser } from '../../../../types';

interface PartnerRequestProps {
  onViewPartner: (partnerId: string) => void;
}

const PartnerRequest: React.FC<PartnerRequestProps> = ({ onViewPartner }) => {
  const [requests, setRequests] = useState<PartnerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await adminService.getAllPartnersRequest()
      console.log('Fetched partner requests:', response);

      // Filter partners that are not fully verified
      const pendingPartners = (response || []).filter((partner: PartnerUser) =>
        !partner.bankDetailsCompleted ||
        !partner.personalDocumentsCompleted ||
        !partner.vehicleDetailsCompleted
      );

      setRequests(pendingPartners);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching partner requests:', err);
      setError('Failed to fetch partner requests');
      setLoading(false);
    }
  };

  const handleView = (partnerId: string) => {
    onViewPartner(partnerId);
  };

  const filteredRequests = requests.filter(request =>
    request.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.mobileNumber?.includes(searchTerm)
  );


  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 md:mb-0">
          New Joining Request <span className="text-gray-500 font-normal">({requests.length})</span>
        </h2>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by Name or Phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            aria-label="Search partners"
          />
          <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <th className="py-3 px-4 text-left">Sl.No</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Contact Info</th>
              <th className="py-3 px-4 text-left">Request Date</th>
              <th className="py-3 px-4 text-left">Bank Details</th>
              <th className="py-3 px-4 text-left">Documents</th>
              <th className="py-3 px-4 text-left">Vehicle Details</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request, index) => (
              <tr key={request._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {request.profileImage && (
                      <img
                        src={request.profileImage}
                        alt={request.fullName}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    {request.fullName}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div>{request.email}</div>
                    <div className="text-sm text-gray-500">{request.mobileNumber}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {new Date(request.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${request.bankDetailsCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {request.bankDetailsCompleted ? 'Completed' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${request.personalDocumentsCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {request.personalDocumentsCompleted ? 'Completed' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${request.vehicleDetailsCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {request.vehicleDetailsCompleted ? 'Completed' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-3">
                    <button
                      className="text-green-500 hover:text-green-700"
                      title="View details"
                      onClick={() => handleView(request._id)}
                      aria-label={`View details for ${request.fullName}`}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnerRequest;