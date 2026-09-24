'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  getSocket,
  REALTIME_EVENTS,
  RealtimeBookingCreated,
  RealtimeBookingStatusChanged,
  RealtimeServiceRequested,
  RealtimeSystemNotification,
  subscribeHotelRoom,
  subscribeStaffChannel,
  subscribeUserRoom,
} from '@/lib/socket';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';
import { useToast } from '@/components/ui/Toast';

export interface RealtimeAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  category: 'booking' | 'service' | 'system';
  read: boolean;
  data?: any;
}

interface RealtimeContextValue {
  isConnected: boolean;
  notifications: RealtimeAppNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã nhận phòng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
  REJECTED: 'Bị từ chối',
};

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<RealtimeAppNotification[]>([]);
  const { user: staffUser, isAuthenticated: isStaffAuth } = useAuth();
  const { customer, isCustomerAuthenticated } = useCustomerAuth();
  const { showToast } = useToast();

  const addNotification = useCallback(
    (notif: Omit<RealtimeAppNotification, 'id' | 'read'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newNotif: RealtimeAppNotification = {
        ...notif,
        id,
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
    },
    [],
  );

  // Khởi tạo kết nối & lắng nghe trạng thái kết nối
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // Tham gia Room theo vai trò Nhân viên / Lễ tân / Quản lý
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isStaffAuth || !staffUser) return;

    subscribeStaffChannel();

    if ((staffUser as any).hotelId) {
      subscribeHotelRoom((staffUser as any).hotelId);
    }
  }, [isStaffAuth, staffUser]);

  // Tham gia Room theo vai trò Khách hàng cá nhân
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isCustomerAuthenticated || !customer?.id) return;

    subscribeUserRoom(customer.id);
  }, [isCustomerAuthenticated, customer]);

  // Lắng nghe sự kiện Realtime nghiệp vụ
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // 1. Sự kiện ĐẶT PHÒNG MỚI (Lễ tân & Quản lý)
    const handleBookingCreated = (payload: RealtimeBookingCreated) => {
      const title = `🛎️ Đơn đặt phòng mới: #${payload.bookingCode}`;
      const message = `Khách ${payload.contactName} vừa đặt ${payload.roomName || 'phòng'} (${payload.roomCount} phòng).`;

      addNotification({
        title,
        message,
        type: 'info',
        timestamp: payload.createdAt || new Date().toISOString(),
        category: 'booking',
        data: payload,
      });

      // Chỉ hiển thị popup toast nếu đang là nhân viên / lễ tân
      if (isStaffAuth) {
        showToast(title, message, 'info');
      }
    };

    // 2. Sự kiện CẬP NHẬT TRẠNG THÁI BOOKING (Khách hàng & Lễ tân)
    const handleBookingStatusChanged = (payload: RealtimeBookingStatusChanged) => {
      const newStatusText = STATUS_LABELS[payload.newStatus] || payload.newStatus;
      const isCustomerSelf =
        customer?.id && String(customer.id) === String(payload.userId);

      const title = isCustomerSelf
        ? `Đơn #${payload.bookingCode} của bạn đã chuyển sang "${newStatusText}"`
        : `Đơn #${payload.bookingCode}: ${STATUS_LABELS[payload.oldStatus] || payload.oldStatus} ➔ ${newStatusText}`;

      const message = payload.note
        ? `Ghi chú: ${payload.note}`
        : `Thời gian: ${new Date(payload.changedAt).toLocaleTimeString('vi-VN')}`;

      const toastType =
        payload.newStatus === 'CONFIRMED' || payload.newStatus === 'CHECKED_IN'
          ? 'success'
          : payload.newStatus === 'CANCELLED' || payload.newStatus === 'REJECTED'
            ? 'error'
            : 'info';

      addNotification({
        title,
        message,
        type: toastType,
        timestamp: payload.changedAt || new Date().toISOString(),
        category: 'booking',
        data: payload,
      });

      // Hiển thị toast thông báo
      showToast(title, message, toastType);
    };

    // 3. Sự kiện YÊU CẦU DỊCH VỤ PHÒNG (Lễ tân)
    const handleServiceRequested = (payload: RealtimeServiceRequested) => {
      const title = `🛎️ Yêu cầu dịch vụ mới: ${payload.serviceName}`;
      const message = `Đơn #${payload.bookingId} - Số lượng: ${payload.quantity}${payload.note ? ` (${payload.note})` : ''}`;

      addNotification({
        title,
        message,
        type: 'info',
        timestamp: payload.requestedAt || new Date().toISOString(),
        category: 'service',
        data: payload,
      });

      if (isStaffAuth) {
        showToast(title, message, 'info');
      }
    };

    // 4. Sự kiện THÔNG BÁO HỆ THỐNG
    const handleSystemNotification = (payload: RealtimeSystemNotification) => {
      addNotification({
        title: payload.title,
        message: payload.message,
        type: payload.type,
        timestamp: payload.timestamp || new Date().toISOString(),
        category: 'system',
        data: payload.data,
      });

      const toastType = payload.type === 'warning' ? 'error' : payload.type;
      showToast(payload.title, payload.message, toastType);
    };

    // Đăng ký listeners
    socket.on(REALTIME_EVENTS.BOOKING_CREATED, handleBookingCreated);
    socket.on(REALTIME_EVENTS.BOOKING_STATUS_CHANGED, handleBookingStatusChanged);
    socket.on(REALTIME_EVENTS.SERVICE_REQUESTED, handleServiceRequested);
    socket.on(REALTIME_EVENTS.SYSTEM_NOTIFICATION, handleSystemNotification);

    // DỌN DẸP BẮT BUỘC KHI UNMOUNT THEO ĐÚNG CHUẨN NEXT.JS 16
    return () => {
      socket.off(REALTIME_EVENTS.BOOKING_CREATED, handleBookingCreated);
      socket.off(REALTIME_EVENTS.BOOKING_STATUS_CHANGED, handleBookingStatusChanged);
      socket.off(REALTIME_EVENTS.SERVICE_REQUESTED, handleServiceRequested);
      socket.off(REALTIME_EVENTS.SYSTEM_NOTIFICATION, handleSystemNotification);
    };
  }, [addNotification, customer, isStaffAuth, showToast]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      isConnected,
      notifications,
      unreadCount,
      markAllAsRead,
      clearNotifications,
    }),
    [isConnected, notifications, unreadCount, markAllAsRead, clearNotifications],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}
