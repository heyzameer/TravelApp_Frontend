"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { consumerApi } from "@/services/consumerApi";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
    propertyId: string;
    className?: string;
    size?: number;
    variant?: 'over-image' | 'solid';
}

export default function WishlistButton({
    propertyId,
    className = "",
    size = 20,
    variant = 'over-image'
}: WishlistButtonProps) {
    const { user, isAuthenticated, checkAuth } = useAuth();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user?.wishlist) {
            setIsWishlisted(user.wishlist.includes(propertyId));
        }
    }, [user, propertyId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        setIsLoading(true);
        try {
            await consumerApi.toggleWishlist(propertyId);
            // Refresh auth state to update user wishlist
            await checkAuth();
        } catch (error) {
            console.error("Failed to toggle wishlist", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getHeartStyles = () => {
        if (isWishlisted) {
            return "fill-red-500 text-red-500";
        }

        if (variant === 'over-image') {
            return "text-white drop-shadow-md hover:text-red-200";
        }

        return "text-slate-400 hover:text-red-300";
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`transition-all active:scale-90 ${className}`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={size}
                className={`${getHeartStyles()} transition-all duration-300`}
            />
        </button>
    );
}
