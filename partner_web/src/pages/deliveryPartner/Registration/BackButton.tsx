import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
    onClick: () => void;
    className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4 ${className}`}
        >
            <ChevronLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">Back</span>
        </button>
    );
};
