"use client";

import Link from "next/link";
import { TreePine, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="text-center max-w-lg mx-auto">
                <div className="relative mb-8 inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <div className="bg-white p-6 rounded-3xl shadow-xl relative z-10 rotate-12 transform hover:rotate-0 transition-all duration-300">
                        <TreePine className="h-20 w-20 text-primary" />
                    </div>
                </div>

                <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tight">404</h1>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Lost in the Woods?</h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    The path you're looking for seems to have grown over. Don't worry, even the best explorers get lost sometimes.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
                    >
                        <Home className="h-5 w-5" />
                        Back Home
                    </Link>
                    <Link
                        href="/destinations"
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-bold transition-all hover:border-slate-300 hover:-translate-y-1"
                    >
                        <CompassIcon className="h-5 w-5" />
                        Explore Destinations
                    </Link>
                </div>
            </div>
        </div>
    );
}

function CompassIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    );
}
