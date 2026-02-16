import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "../../store/hooks";
import { partnerRegister } from "../../store/slices/authSlice";
import { partnerAuthService } from "../../services/partnerAuth";

const PartnerRegister: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dispatch(partnerRegister(formData)).unwrap();

            // After successful registration (tokens stored), trigger OTP flow
            await partnerAuthService.requestLoginOtp(formData.email);
            toast.success("Registration successful! sending OTP...");

            navigate("/partner/verify-otp", { state: { email: formData.email } });
        } catch (error) {
            console.error("Partner registration error:", error);
            const errorMessage = (error as string) || "Registration failed. Please try again.";
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
                        src="/homestay.png"
                        alt="homestay-register"
                        className="w-4/5 max-h-[80%] object-cover rounded-xl "
                    />
                </div>
            </div>

            {/* Right side with form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Partner Registration</h1>
                        <p className="text-gray-500 mt-2">Join us and list your property</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="fullName" className="block text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="1234567890"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="8+ characters required"
                                minLength={8}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register as Partner"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link to="/partner/login" className="text-red-500 hover:text-red-600 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PartnerRegister;
