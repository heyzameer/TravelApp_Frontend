import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import { fetchActivities, deleteActivity } from '../../../features/activities/activitySlice';
import { Plus, Trash2, Clock, Users } from 'lucide-react';
// Using Ticket for Activity icon placeholder or Bike/Compass if available. 
// Lucide has 'Tent', 'Compass', 'Bike'. Let's use 'Compass' or generic 'Ticket'.
// Renaming import to avoid error:
import { Compass } from 'lucide-react';
import ConfirmModal from '../../../components/common/ConfirmModal';

const ActivityList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { propertyId } = useParams<{ propertyId: string }>();
    const { activities, loading } = useSelector((state: RootState) => state.activities);

    useEffect(() => {
        if (propertyId) {
            dispatch(fetchActivities(propertyId));
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
            title: 'Delete Activity',
            message: 'Are you sure you want to delete this activity? This will remove it from the list of available activities for this property.',
            onConfirm: async () => {
                await dispatch(deleteActivity(id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Compass className="text-purple-600" />
                    Activities
                </h1>
                <button
                    onClick={() => navigate('add')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                    <Plus size={20} />
                    Add Activity
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Compass className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No activities yet</h3>
                    <p className="text-gray-500 mb-4">Add activities like Trekking, Yoga, or City Tours.</p>
                    <button
                        onClick={() => navigate('add')}
                        className="text-purple-600 font-medium hover:underline"
                    >
                        Create your first activity
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity) => (
                        <div key={activity._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{activity.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {activity.duration} mins</span>
                                        <span className="flex items-center gap-1"><Users size={14} /> Max {activity.maxParticipants}</span>
                                    </div>
                                </div>
                                <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                                    ₹{activity.pricePerPerson}
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>

                            {activity.availableTimeSlots && activity.availableTimeSlots.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Slots</p>
                                    <div className="flex flex-wrap gap-2">
                                        {activity.availableTimeSlots.map(slot => (
                                            <span key={slot} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {slot}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => handleDelete(activity._id)}
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

export default ActivityList;
