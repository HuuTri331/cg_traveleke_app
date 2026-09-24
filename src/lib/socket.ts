'use client';

import { io, Socket } from 'socket.io-client';

/**
 * Socket.IO Client Configuration & Singleton Manager
 * Tuân thủ kiến trúc Realtime cho Next.js 16 App Router:
 * 1. Singleton connection, tránh tạo socket mới mỗi lần re-render component.
 * 2. Tự động reconnect với backoff strategy.
 * 3. Hỗ trợ Room Multiplexing: hotel:<hotelId>, user:<userId>, staff:notifications.
 */

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
    : 'http://localhost:3001');

let socketInstance: Socket | null = null;

export const REALTIME_EVENTS = {
  BOOKING_CREATED: 'booking.created',
  BOOKING_STATUS_CHANGED: 'booking.status_changed',
  SERVICE_REQUESTED: 'service.requested',
  SYSTEM_NOTIFICATION: 'system.notification',
} as const;

export interface RealtimeBookingCreated {
  id: string;
  bookingCode: string;
  hotelId: string | number;
  hotelName?: string;
  userId?: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  checkInAt: string;
  checkOutAt: string;
  roomName?: string;
  roomCount: number;
  estimatedTotal: string;
  createdAt: string;
}

export interface RealtimeBookingStatusChanged {
  id: string;
  bookingCode: string;
  hotelId: string | number;
  userId?: string | null;
  oldStatus: string;
  newStatus: string;
  changedAt: string;
  note?: string;
  changedByName?: string;
}

export interface RealtimeServiceRequested {
  id: number;
  bookingId: string | number;
  hotelId?: string | number;
  serviceName: string;
  quantity: number;
  totalPrice: number;
  note?: string;
  requestedAt: string;
}

export interface RealtimeSystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  data?: Record<string, any>;
}

/**
 * Trả về Socket.IO client singleton instance an toàn cho browser runtime
 */
export function getSocket(): Socket | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚡ [Realtime] Connected to Traveleke WebSocket server:', socketInstance?.id);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚡ [Realtime] Disconnected from WebSocket server. Reason:', reason);
      }
    });

    socketInstance.on('connect_error', (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚡ [Realtime] Connection error:', error.message);
      }
    });
  }

  return socketInstance;
}

/**
 * Helper đăng ký tham gia phòng khách sạn (Dành cho Lễ tân & Quản lý)
 */
export function subscribeHotelRoom(hotelId: string | number) {
  const socket = getSocket();
  if (socket && hotelId) {
    socket.emit('subscribe:hotel', { hotelId });
  }
}

/**
 * Helper đăng ký tham gia kênh nhân viên nội bộ
 */
export function subscribeStaffChannel() {
  const socket = getSocket();
  if (socket) {
    socket.emit('subscribe:staff');
  }
}

/**
 * Helper đăng ký tham gia phòng người dùng cá nhân (Dành cho Khách hàng)
 */
export function subscribeUserRoom(userId: string | number) {
  const socket = getSocket();
  if (socket && userId) {
    socket.emit('subscribe:user', { userId });
  }
}
