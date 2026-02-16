import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative font-sans text-white px-4"
            style={{
                backgroundImage: "url('/bg-professional.png')",
            }}
        >
            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-4xl animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-2xl leading-tight">
                    Grow Your Business with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">TravelHub Partners</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-200 mb-12 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                    Manage your properties, track bookings, and reach millions of travelers worldwide. The ultimate platform for hospitality professionals.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                        to="/partner/login"
                        className="px-10 py-4 bg-white text-gray-900 font-bold rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-100 transform transition-all hover:-translate-y-1 active:scale-95 duration-300 w-full sm:w-auto text-lg"
                    >
                        Partner Login
                    </Link>

                    <Link
                        to="/partner/register"
                        className="px-10 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-full shadow-xl hover:shadow-red-500/30 transform transition-all hover:-translate-y-1 active:scale-95 duration-300 w-full sm:w-auto text-lg ring-4 ring-white/10"
                    >
                        List Your Property
                    </Link>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                        <div className="text-red-400 text-3xl mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Real-time Analytics</h3>
                        <p className="text-gray-300 text-sm">Track your performance with detailed insights on bookings, revenue, and guest demographics.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                        <div className="text-red-400 text-3xl mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Easy Management</h3>
                        <p className="text-gray-300 text-sm">Effortlessly manage availability, pricing, and reservations from a single intuitive dashboard.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                        <div className="text-red-400 text-3xl mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Maximize Revenue</h3>
                        <p className="text-gray-300 text-sm">Optimize your pricing strategy and increase occupancy rates with our smart tools.</p>
                    </div>
                </div>

                <div className="mt-16 text-sm text-gray-400 font-medium">
                    &copy; {new Date().getFullYear()} TravelHub Partner Network. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
