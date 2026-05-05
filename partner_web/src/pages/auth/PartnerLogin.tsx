import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { partnerAuthService } from "../../services/partnerAuth";

const PartnerLogin: React.FC = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await partnerAuthService.requestLoginOtp(email);
            toast.success("OTP sent to your email!");
            navigate("/partner/verify-otp", { state: { email } });
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error("Partner login request error:", err);
            const errorMessage = err.response?.data?.message || "Failed to send OTP. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{
                backgroundImage: "url('/bg-professional.png')",
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 mx-4 transform transition-all hover:scale-[1.01]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Partner Portal</h1>
                    <p className="text-gray-500 mt-2 text-sm font-medium">Access your dashboard to manage properties</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder-gray-400 text-gray-800"
                            placeholder="partner@example.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3.5 px-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5 duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending OTP...
                            </span>
                        ) : (
                            "Get OTP"
                        )}
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-semibold">Or</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEmail("dummy@letsgoto.in");
                            setTimeout(() => {
                                const form = document.querySelector('form');
                                if (form) form.requestSubmit();
                            }, 100);
                        }}
                        className="w-full py-3 px-4 bg-white border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all transform hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Use Dummy Credential
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/partner/register"
                            className="text-red-600 hover:text-red-700 font-bold hover:underline transition-all"
                        >
                            Register Now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PartnerLogin;
