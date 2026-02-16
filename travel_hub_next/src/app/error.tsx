'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Contextual Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-6">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong!</h2>
                <p className="text-gray-500 mb-8 font-medium">
                    We encountered an unexpected error. Don&apos;t worry, our team has been notified.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Try again
                    </button>
                    <Link href="/" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors">
                        Go back home
                    </Link>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-xl text-left overflow-auto max-h-48">
                        <p className="text-xs font-mono text-red-600 break-words">{error.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
