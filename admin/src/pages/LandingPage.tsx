import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative font-sans text-white"
            style={{
                backgroundImage: "url('/bg-professional.png')",
            }}
        >
            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-2xl px-6 animate-fade-in-up">
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight drop-shadow-lg">
                    TravelHub <span className="text-red-500">Admin</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-10 font-light drop-shadow-md">
                    Manage your travel platform with ease and precision.
                </p>

                <Link
                    to="/admin"
                    className="inline-block px-10 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-full shadow-2xl transform transition-transform hover:scale-105 active:scale-95 duration-300 ring-4 ring-red-500/20"
                >
                    Access Dashboard
                </Link>

                <div className="mt-16 text-sm text-gray-400 font-medium">
                    &copy; {new Date().getFullYear()} TravelHub. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
