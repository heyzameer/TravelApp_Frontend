"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { ShieldCheck, CreditCard, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
    return (
        <ProtectedRoute>
            <div className="pt-24 pb-12 bg-slate-50 min-h-screen font-sans">
                <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">Secure Checkout</h1>

                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
                                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                        Payment Method
                                    </h2>
                                    <div className="flex gap-2">
                                        <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-500">VISA</div>
                                        <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-500">MC</div>
                                        <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-500">UPI</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 sm:p-5 border-2 border-primary bg-indigo-50/50 rounded-2xl relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-bold text-slate-800">Credit / Debit Card</span>
                                            <div className="h-5 w-5 rounded-full border-4 border-primary bg-white" />
                                        </div>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Card Number (e.g., 4532 1234 5678 9010)"
                                                defaultValue=""
                                                maxLength={19}
                                                className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY (e.g., 12/25)"
                                                    defaultValue=""
                                                    maxLength={5}
                                                    className="p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="CVV (e.g., 123)"
                                                    defaultValue=""
                                                    maxLength={3}
                                                    className="p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Cardholder Name"
                                                defaultValue=""
                                                className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-5 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
                                        <span className="font-bold text-slate-600">UPI / Net Banking</span>
                                        <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-400 text-sm justify-center">
                                <Lock className="h-3 w-3" />
                                Payments are secure and encrypted
                            </div>
                        </div>

                        <div className="w-full lg:w-96">
                            <div className="bg-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-200 sticky top-28">
                                <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center opacity-90">
                                        <span className="text-sm sm:text-base">Heritage Homestay Coorg</span>
                                        <span className="font-bold font-mono text-sm sm:text-base">₹3,500</span>
                                    </div>
                                    <div className="flex justify-between items-center opacity-90">
                                        <span className="text-sm">1 Night × 2 Guests</span>
                                        <span className="font-bold font-mono text-sm">₹3,500</span>
                                    </div>
                                    <div className="flex justify-between items-center opacity-90">
                                        <span className="text-sm">Service Fee</span>
                                        <span className="font-bold font-mono text-sm">₹0</span>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/20">
                                    <div className="flex justify-between items-center text-xl font-bold mb-8">
                                        <span>Total</span>
                                        <span className="font-mono underline decoration-indigo-300">₹3,500</span>
                                    </div>
                                    <button className="w-full bg-white text-primary py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg">
                                        Pay Now
                                    </button>
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-xs opacity-75 justify-center">
                                    <ShieldCheck className="h-4 w-4" />
                                    NatureStay Payment Protection
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
