import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, CheckCircle, Filter, ChevronDown, Award, Sparkles, Building2, X, Edit2, Send, Quote } from 'lucide-react';
import { partnerReviewService, type PartnerReview } from '../../services/partnerReviewService';
import { partnerAuthService } from '../../services/partnerAuth';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { type Property } from '../../types';

interface PartnerReviewsListProps {
    propertyId?: string;
}

export const PartnerReviewsList: React.FC<PartnerReviewsListProps> = ({ propertyId: initialPropertyId }) => {
    const [reviews, setReviews] = useState<PartnerReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialPropertyId || '');
    const [filterNeedsResponse, setFilterNeedsResponse] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        totalPages: 0,
        avgRating: 0,
        totalReviews: 0,
        verifiedReviews: 0,
        needsResponse: 0
    });

    // Modal States
    const [selectedReview, setSelectedReview] = useState<PartnerReview | null>(null);
    const [isResponding, setIsResponding] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProperties = async () => {
        try {
            const props = await partnerAuthService.getPartnerProperties();
            setProperties(props);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await partnerReviewService.getPartnerReviews(
                page,
                10,
                selectedPropertyId || undefined,
                filterNeedsResponse
            );
            setReviews(response.data.reviews);
            setStats({
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages,
                avgRating: response.data.stats.avgRating || 0,
                totalReviews: response.data.stats.totalReviews || 0,
                verifiedReviews: response.data.stats.verifiedReviews || 0,
                needsResponse: response.data.stats.needsResponse || 0
            });

            // Update selected review if it's currently open
            if (selectedReview) {
                const updated = response.data.reviews.find((r: PartnerReview) => r._id === selectedReview._id);
                if (updated) setSelectedReview(updated);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [page, selectedPropertyId, filterNeedsResponse, selectedReview]);

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleAddResponse = async () => {
        if (!selectedReview) return;
        if (!responseText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        try {
            setIsSubmitting(true);
            await partnerReviewService.addResponse(selectedReview._id, responseText);
            toast.success('Response submitted successfully!');
            setIsResponding(false);
            setResponseText('');
            fetchReviews();
        } catch (error) {
            console.error('Error adding response:', error);
            toast.error('Failed to submit response');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openResponseModal = (review: PartnerReview, edit = false) => {
        setSelectedReview(review);
        setIsResponding(true);
        setResponseText(edit ? (review.partnerResponse?.responseText || '') : '');
    };

    const RatingStars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={`${i < Math.round(rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                        }`}
                />
            ))}
        </div>
    );

    if (loading && page === 1 && reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Star className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={20} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Curating Guest Feedback...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Guest Sentiment
                        <Sparkles className="text-amber-400" size={24} />
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Manage and respond to guest experiences across your portfolio.</p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                    <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Live Feedback Active</span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Portfolio Rating', value: stats.avgRating.toFixed(1), icon: Award, color: 'blue', sub: 'Out of 5.0' },
                    { label: 'Total Stories', value: stats.totalReviews, icon: MessageSquare, color: 'purple', sub: 'Across properties' },
                    { label: 'Verified Stays', value: stats.verifiedReviews, icon: CheckCircle, color: 'emerald', sub: 'Confirmed guests' },
                    { label: 'Needs Attention', value: stats.needsResponse, icon: Filter, color: 'orange', sub: 'Action required' },
                ].map((item: { label: string; value: string | number; icon: React.ElementType; color: string; sub: string }, idx: number) => (
                    <div key={idx} className={`bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group border-b-4 border-b-${item.color}-500/20`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 bg-${item.color}-50 rounded-2xl flex items-center justify-center text-${item.color}-600`}>
                                    <item.icon size={24} />
                                </div>
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.sub}</div>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{item.label}</p>
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{item.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={selectedPropertyId}
                            onChange={(e) => { setSelectedPropertyId(e.target.value); setPage(1); }}
                            className="pl-11 pr-10 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer min-w-[220px]"
                        >
                            <option value="">All Properties</option>
                            {properties.map((p: Property) => (
                                <option key={p._id} value={p._id}>{p.propertyName}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>

                    <button
                        onClick={() => { setFilterNeedsResponse(!filterNeedsResponse); setPage(1); }}
                        className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 ${filterNeedsResponse
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-100'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <Filter size={16} />
                        Needs Response
                        {stats.needsResponse > 0 && !filterNeedsResponse && (
                            <span className="w-5 h-5 bg-orange-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse ml-1">
                                {stats.needsResponse}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                    <CheckCircle className="text-blue-600" size={16} />
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">{stats.totalReviews} Reviews Found</span>
                </div>
            </div>

            {/* Reviews Grid */}
            {reviews.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 rounded-full mb-6">
                        <MessageSquare size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Pristine Feedback Loop</h3>
                    <p className="text-slate-500 font-medium">No reviews match your current filters. Check back soon!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review: PartnerReview) => (
                        <div
                            key={review._id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group"
                        >
                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left Side: User & Meta */}
                                    <div className="lg:w-1/4 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                {review.userId?.fullName ? review.userId.fullName.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 leading-none mb-1">{review.userId?.fullName || 'Anonymous User'}</h4>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {review.isVerified && (
                                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit">
                                                    <CheckCircle size={14} />
                                                    Verified Stay
                                                </div>
                                            )}
                                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Property</p>
                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{review.propertyId?.propertyName}</p>
                                            </div>
                                            {review.tripType && (
                                                <div className="flex items-center gap-2 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 w-fit">
                                                    <Sparkles size={14} />
                                                    {review.tripType} Trip
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Center: Content */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-baseline gap-3">
                                                <RatingStars rating={review.overallRating} size={24} />
                                                <span className="text-2xl font-black text-slate-900">{review.overallRating.toFixed(1)}</span>
                                            </div>

                                            {/* Breakdown Mini Stats */}
                                            <div className="flex gap-4">
                                                {[
                                                    { label: 'Clean', val: review.cleanlinessRating },
                                                    { label: 'Service', val: review.serviceRating },
                                                    { label: 'Value', val: review.valueForMoneyRating }
                                                ].map((r, i) => r.val && (
                                                    <div key={i} className="text-center group/stat">
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/stat:text-blue-500 transition-colors">{r.label}</div>
                                                        <div className="text-xs font-bold text-slate-800">{r.val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {review.title && (
                                            <h3 className="text-xl font-black text-slate-900 mt-4 tracking-tight leading-snug">&ldquo;{review.title}&rdquo;</h3>
                                        )}

                                        <p className="text-slate-600 font-medium leading-relaxed text-lg italic">
                                            {review.reviewText}
                                        </p>

                                        {review.images && review.images.length > 0 && (
                                            <div className="flex flex-wrap gap-3 pt-2">
                                                {review.images.map((img: { url: string }, i: number) => (
                                                    <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md hover:scale-105 transition-transform cursor-pointer ring-1 ring-slate-100">
                                                        <img src={img.url} className="w-full h-full object-cover" alt="Review" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Interaction Button */}
                                    <div className="lg:w-1/4 flex flex-col justify-center items-center lg:items-end">
                                        {!review.partnerResponse ? (
                                            <button
                                                onClick={() => openResponseModal(review)}
                                                className="px-8 py-4 bg-orange-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-xl transition-all flex items-center gap-3 active:scale-95 group/btn"
                                            >
                                                <MessageSquare size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                                Add Story Reply
                                            </button>
                                        ) : (
                                            <div className="text-right space-y-3">
                                                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    Replied {format(new Date(review.partnerResponse.respondedAt), 'MMM dd')}
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedReview(review)}
                                                        className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Read More"
                                                    >
                                                        <Quote size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => openResponseModal(review, true)}
                                                        className="p-3 bg-slate-50 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                                                        title="Edit Reply"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Response Modal */}
            {isResponding && selectedReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="relative p-10">
                            <button
                                onClick={() => { setIsResponding(false); setSelectedReview(null); }}
                                className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-[1.5rem] flex items-center justify-center transform -rotate-6">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Sentiment Hub</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Responding to {selectedReview.userId?.fullName || 'Guest'}</p>
                                </div>
                            </div>

                            {/* Review Content Recap */}
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 relative">
                                <Quote className="absolute top-4 right-4 text-slate-100" size={40} />
                                <div className="flex items-center gap-2 mb-3">
                                    <RatingStars rating={selectedReview.overallRating} size={16} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedReview.overallRating}.0 Rating</span>
                                </div>
                                <p className="text-slate-600 font-medium italic leading-relaxed line-clamp-3">
                                    &ldquo;{selectedReview.reviewText}&rdquo;
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Your Response Message</label>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${responseText.length > 500 ? 'text-red-500' : 'text-slate-300'}`}>
                                        {responseText.length}/1000
                                    </span>
                                </div>
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="Thank the guest, address their feedback, and invite them back..."
                                    className="w-full p-8 bg-slate-50 border-2 border-transparent rounded-[2.5rem] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 focus:bg-white outline-none font-medium transition-all text-slate-800 placeholder:text-slate-300 text-lg resize-none"
                                    rows={6}
                                />
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button
                                    onClick={() => { setIsResponding(false); setSelectedReview(null); }}
                                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    Later
                                </button>
                                <button
                                    onClick={handleAddResponse}
                                    disabled={isSubmitting || !responseText.trim()}
                                    className="flex-[2] py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                                    Broadcast Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Read More Modal */}
            {selectedReview && !isResponding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="relative p-10">
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                                    {selectedReview.userId?.fullName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedReview.userId?.fullName || 'Guest'}</h3>
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Verified</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <RatingStars rating={selectedReview.overallRating} size={20} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{format(new Date(selectedReview.createdAt), 'MMM dd, yyyy')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                                <div className="space-y-4">
                                    {selectedReview.title && (
                                        <h4 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">&ldquo;{selectedReview.title}&rdquo;</h4>
                                    )}
                                    <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
                                        {selectedReview.reviewText}
                                    </p>
                                </div>

                                {selectedReview.images && selectedReview.images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedReview.images.map((img: { url: string }, i: number) => (
                                            <img key={i} src={img.url} className="w-full h-48 object-cover rounded-[2rem] border-4 border-white shadow-lg shadow-slate-200" alt="Review" />
                                        ))}
                                    </div>
                                )}

                                {selectedReview.partnerResponse && (
                                    <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border-2 border-blue-100/50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                                                        <Quote size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Your Collective Voice</p>
                                                        <p className="text-[9px] font-bold text-blue-400 capitalize">{format(new Date(selectedReview.partnerResponse.respondedAt), 'MMMM dd, yyyy')}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setIsResponding(true); setResponseText(selectedReview.partnerResponse?.responseText || ''); }}
                                                    className="p-3 text-blue-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>
                                            <p className="text-blue-900 font-bold leading-relaxed text-lg">
                                                {selectedReview.partnerResponse.responseText}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10">
                                <button
                                    onClick={() => setSelectedReview(null)}
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                                >
                                    Dismiss Sentiment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Pagination */}
            {stats.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                        onClick={() => setPage((p: number) => p - 1)}
                        disabled={page === 1}
                        className="px-6 py-3 bg-white border border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 disabled:opacity-30 transition-all hover:bg-slate-50 shadow-sm"
                    >
                        Prev
                    </button>
                    <div className="flex items-center gap-2">
                        {[...Array(stats.totalPages)].map((_, i: number) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-12 h-12 rounded-[1rem] font-black text-xs transition-all ${page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110 ring-4 ring-blue-50' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPage((p: number) => p + 1)}
                        disabled={page === stats.totalPages}
                        className="px-6 py-3 bg-white border border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 disabled:opacity-30 transition-all hover:bg-slate-50 shadow-sm"
                    >
                        Next
                    </button>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};
