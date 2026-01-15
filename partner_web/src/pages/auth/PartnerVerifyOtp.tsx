import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "../../store/hooks";
import { partnerLoginVerify } from "../../store/slices/authSlice";
import { partnerAuthService } from "../../services/partnerAuth";

const PartnerVerifyOtp: React.FC = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate("/partner/login");
            return;
        }

        const timer = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dispatch(partnerLoginVerify({ email, otp })).unwrap();
            toast.success("Login successful!");
            navigate("/partner/dashboard");
        } catch (error: any) {
            console.error("Partner OTP verification error:", error);
            const errorMessage = error || "Invalid OTP. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;

        try {
            await partnerAuthService.requestLoginOtp(email);
            toast.success("New OTP sent!");
            setResendTimer(30);
        } catch (error: any) {
            toast.error("Failed to resend OTP.");
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            <div className="hidden lg:flex lg:w-1/2 bg-white p-8 items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src="/homestay-vector.avif"
                        alt="homestay-verify"
                        className="w-4/5 max-h-[80%] object-cover rounded-xl "
                    />
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Verify OTP</h1>
                        <p className="text-gray-500 mt-2">We've sent a 6-digit code to {email}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="otp" className="block text-gray-700 mb-2">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify & Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Didn't receive the code?{" "}
                            <button
                                onClick={handleResendOtp}
                                className={`font-medium ${resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:text-red-600"}`}
                                disabled={resendTimer > 0}
                            >
                                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerVerifyOtp;
