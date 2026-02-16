
import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(): void {
        if (this.socket?.connected) return;

        // Extract base URL from API URL (remove /api/v1)
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        const socketUrl = apiUrl.replace(/\/api\/v1\/?$/, '');

        console.log('Connecting to Socket.IO server at:', socketUrl);

        const token = localStorage.getItem('authToken');

        this.socket = io(socketUrl, {
            withCredentials: true, // This handles cookies
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: {
                token
            }
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('Socket disconnected:', reason);
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public isConnected(): boolean {
        return !!this.socket?.connected;
    }

    // Event listeners
    public onPartnerAadhaarSubmitted(callback: (data: Record<string, unknown>) => void): void {
        this.socket?.on('PARTNER_AADHAAR_SUBMITTED', callback);
    }

    public onPartnerVerificationApproved(callback: (data: Record<string, unknown>) => void): void {
        this.socket?.on('PARTNER_VERIFICATION_APPROVED', callback);
    }

    public onPartnerVerificationRejected(callback: (data: Record<string, unknown>) => void): void {
        this.socket?.on('PARTNER_VERIFICATION_REJECTED', callback);
    }

    public offPartnerAadhaarSubmitted(callback: (data: Record<string, unknown>) => void): void {
        this.socket?.off('PARTNER_AADHAAR_SUBMITTED', callback);
    }

    public offPartnerVerificationApproved(callback: (data: Record<string, unknown>) => void): void {
        this.socket?.off('PARTNER_VERIFICATION_APPROVED', callback);
    }

    public offPartnerVerificationRejected(callback: (data: Record<string, unknown>) => void): void {
        this.socket?.off('PARTNER_VERIFICATION_REJECTED', callback);
    }
}

export const socketService = SocketService.getInstance();
