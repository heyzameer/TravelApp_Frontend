import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white z-50" suppressHydrationWarning>
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin absolute inset-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={24} className="text-emerald-500 animate-pulse" />
                </div>
            </div>
            <p className="mt-4 text-emerald-600 font-bold animate-pulse">Loading your experience...</p>
        </div>
    );
}
