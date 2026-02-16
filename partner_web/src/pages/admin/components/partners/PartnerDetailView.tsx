import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Search, Package, Truck, CheckCircle, CreditCard, Filter } from 'lucide-react';
import { adminService } from '../../../../services/admin';
import { toast } from 'react-hot-toast';
import type { PartnerUser, Order } from '../../../../types';

const STATUS_COLORS = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Out For Delivery': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Delivered: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
}

interface PartnerDetailViewProps {
  partnerId: string;
  onBack: () => void;
}

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, bgColor, iconBgColor, iconColor }) => (
  <div className={`${bgColor} rounded-lg p-5 shadow-sm transition-all hover:shadow-md`}>
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-3xl font-bold">{value}</h3>
        <p className="text-gray-700 font-medium mt-1">{title}</p>
      </div>
      <div className={`rounded-full ${iconBgColor} p-3`}>
        <div className={`${iconColor}`}>{icon}</div>
      </div>
    </div>
  </div>
);

// OrderItem Component
const OrderItem: React.FC<{ order: Order }> = ({ order }) => {
  const statusStyle = STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] ||
    { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };

  // Status icon based on order status
  const getStatusIcon = () => {
    switch (order.status) {
      case 'Pending':
        return <Package size={16} />;
      case 'Out For Delivery':
        return <Truck size={16} />;
      case 'Delivered':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>;
      default:
        return <Package size={16} />;
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group">
      {/* Left status indicator bar */}
      <div className={`absolute left-0 top-0 w-1 h-full ${statusStyle.bg.replace('bg-', 'bg-')}` +
        (statusStyle.bg.includes('amber') ? ' bg-amber-500' :
          statusStyle.bg.includes('blue') ? ' bg-blue-500' :
            statusStyle.bg.includes('green') ? ' bg-green-500' :
              statusStyle.bg.includes('red') ? ' bg-red-500' : ' bg-gray-500')
      }></div>

      {/* Card content with padding compensating for the status bar */}
      <div className="p-5 pl-6">
        {/* Top section with Order ID, status, date, amount */}
        <div className="flex flex-col sm:flex-row justify-between mb-5 pb-4 border-b border-gray-100">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">Order</span>
              <h3 className="text-base font-bold text-gray-800">#{order._id}</h3>
            </div>
            <p className="text-gray-500 text-xs">
              {new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })} | {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusStyle.bg} ${statusStyle.text} text-xs font-semibold`}>
              {getStatusIcon()}
              <span>{order.status}</span>
            </div>

            <div className="text-right">
              <p className="text-gray-900 font-bold text-lg">₹{order.totalAmount.toFixed(2)}</p>
              <div className="flex items-center justify-end gap-1 mt-1 text-gray-600 text-xs">
                <CreditCard size={12} />
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery details */}
        <div className="grid sm:grid-cols-7 gap-4">
          <div className="sm:col-span-4">
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

              <div className="relative z-10 mb-6">
                <div className="flex items-start">
                  <div className="absolute left-[-22px] p-1 rounded-full bg-indigo-100 border-2 border-white">
                    <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                  </div>
                  <div className="pl-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pickup</p>
                    <p className="font-medium text-gray-800 mt-1">{order.pickupAddress?.street || 'No address'}</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-start">
                  <div className="absolute left-[-22px] p-1 rounded-full bg-red-100 border-2 border-white">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  </div>
                  <div className="pl-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dropoff</p>
                    <p className="font-medium text-gray-800 mt-1">{order.dropoffAddress?.street || 'No address'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-3 bg-gray-50 p-3 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">Delivery Details</h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-medium text-gray-800">{order.distance} km</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Est. Time</p>
                <p className="font-medium text-gray-800">{order.estimatedTime}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium text-gray-800">{order.deliveryType}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Card Component
const ProfileCard: React.FC<{ partner: PartnerUser }> = ({ partner }) => (
  <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm transition-all hover:shadow-md">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex items-center gap-5">
        {partner.profileImage ? (
          <img
            src={partner.profileImage}
            alt={partner.fullName}
            className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <span className="text-2xl font-bold">
              {partner.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{partner.fullName}</h3>
          <p className="text-gray-600">
            Joined {new Date(partner.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="md:ml-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-l-2 border-indigo-100 pl-6">
          <h4 className="text-indigo-800 font-semibold mb-2 flex items-center gap-2">
            Contact Information
          </h4>
          <p className="text-gray-700">{partner.email}</p>
          <p className="text-gray-700">{partner.mobileNumber}</p>
        </div>

        <div className="border-l-2 border-indigo-100 pl-6">
          <h4 className="text-indigo-800 font-semibold mb-2 flex items-center gap-2">
            Vehicle Information
          </h4>
          <p className="text-gray-700">Type: {partner.vehicleType}</p>
          <p className="text-gray-700">Reg #: {partner.registrationNumber}</p>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
const PartnerDetailView: React.FC<PartnerDetailViewProps> = ({ partnerId, onBack }) => {
  const [partner, setPartner] = useState<PartnerUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    outForDelivery: 0,
    completed: 0,
    orderAmount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);

  const fetchPartnerData = useCallback(async () => {
    try {
      setLoading(true);
      const partnerRes = await adminService.getPartnerById(partnerId);
      setPartner(partnerRes);

      const ordersRes = await adminService.getAllBookings();
      // Filter orders where driverId matches partnerId. Ensure types are compatible.
      const partnerOrders = (ordersRes as unknown as Order[]).filter(o => o.driverId === partnerId);
      setOrders(partnerOrders);

      // Calculate stats using the updated Order types
      const pending = partnerOrders.filter(o => o.status === 'Pending').length;
      const outForDelivery = partnerOrders.filter(o => o.status === 'Out For Delivery').length;
      const completed = partnerOrders.filter(o => o.status === 'Delivered').length;
      const totalAmount = partnerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setStats({
        pending,
        outForDelivery,
        completed,
        orderAmount: totalAmount
      });
    } catch (error) {
      console.error('Error fetching partner data:', error);
      toast.error('Failed to fetch partner data');
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  const handleFilter = () => {
    toast.success('Filters applied');
    setFiltersVisible(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 font-medium">Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Partner Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the partner details you're looking for.</p>
          <button
            onClick={onBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o =>
    o._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Partner Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <ProfileCard partner={partner} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<Package size={22} />}
            bgColor="bg-amber-50"
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
          />
          <StatsCard
            title="Out for Delivery"
            value={stats.outForDelivery}
            icon={<Truck size={22} />}
            bgColor="bg-blue-50"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle size={22} />}
            bgColor="bg-green-50"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatsCard
            title="Total Amount"
            value={`₹${stats.orderAmount.toFixed(2)}`}
            icon={<CreditCard size={22} />}
            bgColor="bg-indigo-50"
            iconBgColor="bg-indigo-100"
            iconColor="text-indigo-600"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">
              Orders <span className="text-sm font-normal text-gray-500 ml-1">({filteredOrders.length})</span>
            </h2>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <input
                  type="text"
                  placeholder="Search by Order ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 w-full sm:w-64"
                />
                <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
              </div>

              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center gap-2"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {filtersVisible && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setFiltersVisible(false)}
                  className="bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFilter}
                  className="bg-indigo-600 text-white py-2 px-4 rounded-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderItem key={order._id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Orders found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailView;
