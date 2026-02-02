import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import { fetchPackages, deletePackage } from '../../../features/packages/packageSlice';
import { Plus, Trash2, Package as PackageIcon, Calendar, Users, Utensils, Compass } from 'lucide-react';

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

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            await dispatch(deletePackage(id));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <PackageIcon className="text-green-600" />
                    Packages
                </h1>
                <button
                    onClick={() => navigate('add')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                >
                    <Plus size={20} />
                    Create Package
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : packages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <PackageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No packages yet</h3>
                    <p className="text-gray-500 mb-4">Create special offers combining rooms, meals, and activities.</p>
                    <button
                        onClick={() => navigate('add')}
                        className="text-green-600 font-medium hover:underline"
                    >
                        Create your first package
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{pkg.packageName}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {pkg.numberOfNights} Nights</span>
                                        <span className="flex items-center gap-1"><Users size={14} /> {pkg.minPersons}-{pkg.maxPersons} Persons</span>
                                    </div>
                                </div>
                                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                    ₹{pkg.packagePricePerPerson}/p
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                            <div className="space-y-2 mb-4">
                                {pkg.mealPlanId && (
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Utensils size={14} className="text-orange-500" />
                                        <span>
                                            {typeof pkg.mealPlanId === 'object' ? pkg.mealPlanId.name : 'Meal Plan Included'}
                                        </span>
                                    </div>
                                )}
                                {pkg.includedActivities && pkg.includedActivities.length > 0 && (
                                    <div className="flex items-start gap-2 text-sm text-gray-700">
                                        <Compass size={14} className="text-purple-500 mt-1" />
                                        <div className="flex flex-wrap gap-1">
                                            {pkg.includedActivities.map((act, idx) => (
                                                <span key={idx} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">
                                                    {typeof act.activityId === 'object' ? act.activityId.name : 'Activity'} ({act.sessionsIncluded})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => handleDelete(pkg._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PackageList;
