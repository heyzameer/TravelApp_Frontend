
import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import type { AadhaarStatus } from '../../../types';

interface VerificationStatusBadgeProps {
    status: AadhaarStatus;
    showIcon?: boolean;
    className?: string;
}

const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({
    status,
    showIcon = true,
    className = ''
}) => {
    const getStatusConfig = (status: AadhaarStatus) => {
        switch (status) {
            case 'approved':
                return {
                    color: 'text-green-700 bg-green-50 border-green-200',
                    icon: CheckCircle,
                    label: 'Verified'
                };
            case 'rejected':
                return {
                    color: 'text-red-700 bg-red-50 border-red-200',
                    icon: XCircle,
                    label: 'Rejected'
                };
            case 'manual_review':
                return {
                    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
                    icon: Clock,
                    label: 'Pending Review'
                };
            case 'not_submitted':
            default:
                return {
                    color: 'text-gray-600 bg-gray-50 border-gray-200',
                    icon: AlertCircle,
                    label: 'Not Submitted'
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color} ${className}`}
        >
            {showIcon && <Icon size={14} />}
            {config.label}
        </span>
    );
};

export default VerificationStatusBadge;
