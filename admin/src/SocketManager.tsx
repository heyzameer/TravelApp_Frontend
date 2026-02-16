
import React, { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { socketService } from './services/socketService';
import { updatePartnerInStore } from './store/slices/partnersSlice';
import type { PartnerUser } from './types';
import { toast } from 'react-hot-toast';

const SocketManager: React.FC = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Connect to socket
        socketService.connect();

        // Event handlers
        const handlePartnerAadhaarSubmitted = (data: Record<string, unknown>) => {
            console.log('Socket: Aadhaar submitted', data);
            toast.success(`New document uploaded by ${(data.partnerName as string) || 'Unknown Partner'}`);
            dispatch(updatePartnerInStore(data.partner as PartnerUser));
        };

        const handleVerificationApproved = (data: Record<string, unknown>) => {
            console.log('Socket: Verification approved', data);
            // toast.success(`Verification approved for ${data.partnerName}`);
            dispatch(updatePartnerInStore(data.partner as PartnerUser));
        };

        const handleVerificationRejected = (data: Record<string, unknown>) => {
            console.log('Socket: Verification rejected', data);
            // toast.error(`Verification rejected for ${data.partnerName}`);
            dispatch(updatePartnerInStore(data.partner as PartnerUser));
        };

        // Attach listeners
        socketService.onPartnerAadhaarSubmitted(handlePartnerAadhaarSubmitted);
        socketService.onPartnerVerificationApproved(handleVerificationApproved);
        socketService.onPartnerVerificationRejected(handleVerificationRejected);

        // Cleanup
        return () => {
            socketService.offPartnerAadhaarSubmitted(handlePartnerAadhaarSubmitted);
            socketService.offPartnerVerificationApproved(handleVerificationApproved);
            socketService.offPartnerVerificationRejected(handleVerificationRejected);
            socketService.disconnect();
        };
    }, [dispatch]);

    return null;
};

export default SocketManager;
