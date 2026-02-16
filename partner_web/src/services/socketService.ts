import { io, Socket } from 'socket.io-client';
import type { SocketVerificationApprovedEvent, SocketVerificationRejectedEvent } from '../types';

class SocketService {
    private socket: Socket | null = null;
    private readonly SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    /**
     * Initialize socket connection with authentication token
     */
    connect(token: string): void {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        this.socket = io(this.SOCKET_URL, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    /**
     * Disconnect socket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Listen for partner verification approved event
     */
    onVerificationApproved(callback: (data: SocketVerificationApprovedEvent) => void): void {
        if (!this.socket) {
            console.warn('Socket not connected. Call connect() first.');
            return;
        }
        this.socket.on('PARTNER_VERIFICATION_APPROVED', callback);
    }

    /**
     * Listen for partner verification rejected event
     */
    onVerificationRejected(callback: (data: SocketVerificationRejectedEvent) => void): void {
        if (!this.socket) {
            console.warn('Socket not connected. Call connect() first.');
            return;
        }
        this.socket.on('PARTNER_VERIFICATION_REJECTED', callback);
    }

    /**
     * Remove all listeners for a specific event
     */
    off(event: string): void {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    /**
     * Remove all listeners
     */
    removeAllListeners(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Get socket instance (for advanced usage)
     */
    getSocket(): Socket | null {
        return this.socket;
    }
}

export const socketService = new SocketService();
