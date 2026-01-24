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
        } catch (error: any) {
            console.error("Partner login request error:", error);
            const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            {/* Left side with image */}
            <div className="hidden lg:flex lg:w-1/2 bg-white p-8 items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src="https://static.vecteezy.com/system/resources/previews/021/645/952/non_2x/homestay-icon-style-vector.jpg"
                        alt="homestay-login"
                        className="w-4/5 max-h-[80%] object-cover rounded-xl "
                    />
                </div>
            </div>

            {/* Right side with form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Partner Sign In</h1>
                        <p className="text-gray-500 mt-2">Enter your email to receive an OTP</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="partner@example.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={loading}
                        >
                            {loading ? "Sending OTP..." : "Get OTP"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/partner/register" className="text-red-500 hover:text-red-600 font-medium">
                                Register Now
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PartnerLogin;
