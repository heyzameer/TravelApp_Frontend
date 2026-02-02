"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Menu, X, TreePine, LogOut, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setShowProfileDropdown(false);
    };

    // Hide navbar on auth pages
    if (pathname?.startsWith('/auth')) return null;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
            }`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary p-2 rounded-lg">
                        <TreePine className="h-6 w-6 text-white" />
                    </div>
                    <span className={`text-2xl font-bold tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}>
                        NatureStay
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className={`font-medium transition-colors ${scrolled ? "text-slate-600 hover:text-primary" : "text-white/90 hover:text-white"}`}>
                        Home
                    </Link>
                    <Link href="/destinations" className={`font-medium transition-colors ${scrolled ? "text-slate-600 hover:text-primary" : "text-white/90 hover:text-white"}`}>
                        Destinations
                    </Link>
                    <Link href="/stays" className={`font-medium transition-colors ${scrolled ? "text-slate-600 hover:text-primary" : "text-white/90 hover:text-white"}`}>
                        Stays
                    </Link>
                    <Link href="/adventures" className={`font-medium transition-colors ${scrolled ? "text-slate-600 hover:text-primary" : "text-white/90 hover:text-white"}`}>
                        Adventures
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all ${scrolled
                                    ? "bg-slate-100 text-slate-700 hover:bg-primary hover:text-white"
                                    : "bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-primary"
                                    }`}
                            >
                                {user.profilePicture ? (
                                    <div className="relative h-8 w-8">
                                        <Image
                                            src={user.profilePicture}
                                            alt={user.fullName}
                                            className="rounded-full object-cover border-2 border-white/50"
                                            fill
                                        />
                                    </div>
                                ) : (
                                    <UserCircle className="h-8 w-8" />
                                )}
                                <span className="hidden lg:inline max-w-[120px] truncate">{user.fullName}</span>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileDropdown && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="font-bold text-slate-900 truncate">{user.fullName}</p>
                                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700"
                                        onClick={() => setShowProfileDropdown(false)}
                                    >
                                        <UserCircle className="h-5 w-5 text-primary" />
                                        <span className="font-medium">My Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 w-full"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/auth/login" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${scrolled
                            ? "bg-slate-100 text-slate-700 hover:bg-primary hover:text-white"
                            : "bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-primary"
                            }`}>
                            <User className="h-4 w-4" />
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 rounded-lg"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? (
                        <X className={scrolled ? "text-slate-900" : "text-white"} />
                    ) : (
                        <Menu className={scrolled ? "text-slate-900" : "text-white"} />
                    )}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 md:hidden shadow-xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col gap-4">
                        {isAuthenticated && user && (
                            <div className="pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    {user.profilePicture ? (
                                        <div className="relative h-12 w-12">
                                            <Image
                                                src={user.profilePicture}
                                                alt={user.fullName}
                                                className="rounded-full object-cover border-2 border-primary/20"
                                                fill
                                            />
                                        </div>
                                    ) : (
                                        <UserCircle className="h-12 w-12 text-primary" />
                                    )}
                                    <div>
                                        <p className="font-bold text-slate-900">{user.fullName}</p>
                                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 text-primary font-medium py-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <UserCircle className="h-4 w-4" />
                                    View Profile
                                </Link>
                            </div>
                        )}

                        <Link href="/" className="text-slate-600 font-medium py-2" onClick={() => setIsOpen(false)}>Home</Link>
                        <Link href="/destinations" className="text-slate-600 font-medium py-2" onClick={() => setIsOpen(false)}>Destinations</Link>
                        <Link href="/stays" className="text-slate-600 font-medium py-2" onClick={() => setIsOpen(false)}>Stays</Link>
                        <Link href="/adventures" className="text-slate-600 font-medium py-2" onClick={() => setIsOpen(false)}>Adventures</Link>

                        <hr className="border-slate-100" />

                        {isAuthenticated && user ? (
                            <button
                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                className="bg-red-500 text-white text-center py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <LogOut className="h-5 w-5" />
                                Logout
                            </button>
                        ) : (
                            <Link href="/auth/login" className="bg-primary text-white text-center py-4 rounded-xl font-bold" onClick={() => setIsOpen(false)}>
                                Login / Sign Up
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
