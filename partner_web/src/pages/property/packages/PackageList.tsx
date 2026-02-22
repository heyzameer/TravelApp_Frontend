import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import { fetchPackages, deletePackage } from '../../../features/packages/packageSlice';
import { Plus, Trash2, Package as PackageIcon, Calendar, Users, Utensils, Compass, ArrowLeft } from 'lucide-react';
import ConfirmModal from '../../../components/common/ConfirmModal';

const PackageList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { propertyId } = useParams<{ propertyId: string }>();
    const { packages, loading } = useSelector((state: RootState) => state.packages);

    useEffect(() => {
        if (propertyId) {
            dispatch(fetchPackages(propertyId));
        }
    }, [dispatch, propertyId]);

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

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Package',
            message: 'Are you sure you want to delete this package? This will remove the package deal from your property.',
            onConfirm: async () => {
                await dispatch(deletePackage(id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(`/partner/property/${propertyId}`)}
                        className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-4">
                            <div className="p-2 bg-green-50 rounded-xl">
                                <PackageIcon className="text-green-600" size={24} />
                            </div>
                            Packages
                        </h1>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1 ml-1">
                            Curated holiday deals
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('add')}
                    className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-gray-200 active:scale-95"
                >
                    <Plus size={20} />
                    Create Package
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                </div>
            ) : packages.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <PackageIcon className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No packages yet</h3>
                    <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">Create special offers combining rooms, meals, and activities to attract more guests.</p>
                    <button
                        onClick={() => navigate('add')}
                        className="text-green-600 font-black text-sm uppercase tracking-widest hover:underline"
                    >
                        Create your first package
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg) => (
                        <div key={pkg._id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase group-hover:text-green-600 transition-colors">
                                            {pkg.packageName}
                                        </h3>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-green-500" /> {pkg.numberOfNights} NIGHTS</span>
                                            <span className="flex items-center gap-1.5"><Users size={12} className="text-green-500" /> {pkg.minPersons}-{pkg.maxPersons} PERS</span>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-black shadow-sm">
                                        ₹{pkg.packagePricePerPerson}/p
                                    </div>
                                </div>

                                <p className="text-gray-500 font-medium text-sm mb-6 line-clamp-2 leading-relaxed italic">
                                    "{pkg.description}"
                                </p>

                                <div className="space-y-3 mb-8">
                                    {pkg.mealPlanId && (
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-700 bg-orange-50/50 px-3 py-2 rounded-xl border border-orange-100/50">
                                            <Utensils size={14} className="text-orange-500" />
                                            <span>
                                                {typeof pkg.mealPlanId === 'object' ? pkg.mealPlanId.name : 'Meal Plan Included'}
                                            </span>
                                        </div>
                                    )}
                                    {pkg.includedActivities && pkg.includedActivities.length > 0 && (
                                        <div className="flex items-start gap-3 text-xs font-bold text-gray-700 bg-purple-50/50 px-3 py-2 rounded-xl border border-purple-100/50">
                                            <Compass size={14} className="text-purple-500 mt-0.5" />
                                            <div className="flex flex-wrap gap-2">
                                                {pkg.includedActivities.map((act, idx) => (
                                                    <span key={idx} className="bg-white text-purple-700 px-2 py-0.5 rounded-lg border border-purple-100">
                                                        {typeof act.activityId === 'object' ? act.activityId.name : 'Activity'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-50">
                                    <button
                                        onClick={() => handleDelete(pkg._id)}
                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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

export default PackageList;
