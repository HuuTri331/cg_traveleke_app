'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import {
  bookingApi,
  AdminBookingItem,
  AdminBookingDetail,
  ActivityLogItem,
} from '@/services/api/booking.api';
import { formatCurrency } from '@/lib/utils';
import { getSocket, REALTIME_EVENTS } from '@/lib/socket';
import {
  CalendarCheck,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  LogIn,
  CheckCheck,
  Ban,
  Clock,
  User,
  Phone,
  Mail,
  Building2,
  BedDouble,
  History,
  AlertCircle,
  FileText,
  ShieldAlert,
  UserCheck,
  Sparkles,
  Award,
  ShieldCheck,
  Check,
  Star,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'warning' | 'info' | 'brand' | 'success' | 'danger' | 'neutral';
  }
> = {
  PENDING: {
    label: 'Chờ Duyệt',
    variant: 'warning',
  },
  CONFIRMED: {
    label: 'Đã Xác Nhận',
    variant: 'info',
  },
  CHECKED_IN: {
    label: 'Đã Nhận Phòng',
    variant: 'brand',
  },
  COMPLETED: {
    label: 'Hoàn Thành',
    variant: 'success',
  },
  REJECTED: {
    label: 'Từ Chối',
    variant: 'danger',
  },
  CANCELLED: {
    label: 'Đã Huỷ',
    variant: 'neutral',
  },
};

export default function BookingsPage() {
  // Tab chính: Bookings list vs Activity logs
  const [mainTab, setMainTab] = useState<'bookings' | 'activity_logs'>('bookings');

  // Bookings list states
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState({
    page: 1,
    perPage: 15,
    total: 0,
    totalPages: 1,
  });

  // Activity logs states
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');

  // Modals
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<AdminBookingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Status Change Dialog
  const [statusActionModal, setStatusActionModal] = useState<{
    isOpen: boolean;
    booking: AdminBookingItem | null;
    nextStatus: string;
    statusLabel: string;
    note: string;
    submitting: boolean;
  }>({
    isOpen: false,
    booking: null,
    nextStatus: '',
    statusLabel: '',
    note: '',
    submitting: false,
  });

  // Alert message
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Phân công lại nhân viên Modal State
  const [reassignModal, setReassignModal] = useState<{
    isOpen: boolean;
    booking: AdminBookingItem | null;
    availableStaff: any[];
    selectedStaffId: string;
    note: string;
    loading: boolean;
    submitting: boolean;
    roomInfo: any | null;
    canReassign: boolean;
  }>({
    isOpen: false,
    booking: null,
    availableStaff: [],
    selectedStaffId: '',
    note: '',
    loading: false,
    submitting: false,
    roomInfo: null,
    canReassign: true,
  });

  const openReassignModal = async (booking: AdminBookingItem) => {
    // Ràng buộc nghiệp vụ nghiêm ngặt: Nếu khách đã nhận phòng thì chặn ngay
    if (
      booking.status === 'CHECKED_IN' ||
      booking.status === 'COMPLETED' ||
      booking.status === 'CANCELLED' ||
      booking.status === 'REJECTED'
    ) {
      setActionNotice({
        type: 'error',
        message: 'Khách hàng đã nhận phòng hoặc đơn đặt phòng đã hoàn tất/hủy - Không thể phân công lại người phụ trách!',
      });
      return;
    }

    setReassignModal({
      isOpen: true,
      booking,
      availableStaff: [],
      selectedStaffId: booking.handledBy || '',
      note: '',
      loading: true,
      submitting: false,
      roomInfo: null,
      canReassign: true,
    });

    try {
      const data = await bookingApi.getAvailableStaff(booking.id);
      setReassignModal((prev) => ({
        ...prev,
        availableStaff: data.staff || [],
        roomInfo: data.roomInfo || null,
        canReassign: data.canReassign ?? true,
        loading: false,
      }));
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.response?.data?.message || 'Không thể lấy danh sách nhân viên khả dụng.',
      });
      setReassignModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmReassign = async () => {
    if (!reassignModal.booking || !reassignModal.selectedStaffId) return;
    try {
      setReassignModal((prev) => ({ ...prev, submitting: true }));
      const res = await bookingApi.reassignStaff(reassignModal.booking.id, {
        staffUserId: reassignModal.selectedStaffId,
        note: reassignModal.note.trim() || undefined,
      });

      setActionNotice({
        type: 'success',
        message: res.message || 'Đã phân công lại người phụ trách thành công!',
      });

      setReassignModal((prev) => ({ ...prev, isOpen: false }));
      fetchBookings();
      if (isDetailModalOpen && selectedBookingDetail?.id === reassignModal.booking.id) {
        handleOpenDetail(reassignModal.booking.id);
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Lỗi khi phân công lại nhân viên.',
      });
    } finally {
      setReassignModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // ==========================================
  // FETCH BOOKINGS
  // ==========================================
  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const res = await bookingApi.getAll({
        page,
        perPage: 15,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchTerm.trim() || undefined,
      });
      setBookings(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách bookings:', err);
      setActionNotice({
        type: 'error',
        message: err.message || 'Không thể tải danh sách đơn đặt phòng.',
      });
    } finally {
      setLoadingBookings(false);
    }
  }, [page, statusFilter, searchTerm]);

  // ==========================================
  // FETCH ACTIVITY LOGS
  // ==========================================
  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const res = await bookingApi.getActivityLogs(60);
      setActivityLogs(res.data || []);
    } catch (err: any) {
      console.error('Lỗi tải nhật ký vận hành:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === 'bookings') {
      fetchBookings();
    } else {
      fetchActivityLogs();
    }
  }, [mainTab, fetchBookings, fetchActivityLogs]);

  // Lắng nghe sự kiện Realtime để đồng bộ hoá danh sách Booking tự động
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      fetchBookings();
      if (mainTab === 'activity_logs') {
        fetchActivityLogs();
      }
    };

    socket.on(REALTIME_EVENTS.BOOKING_CREATED, handleRealtimeUpdate);
    socket.on(REALTIME_EVENTS.BOOKING_STATUS_CHANGED, handleRealtimeUpdate);

    return () => {
      socket.off(REALTIME_EVENTS.BOOKING_CREATED, handleRealtimeUpdate);
      socket.off(REALTIME_EVENTS.BOOKING_STATUS_CHANGED, handleRealtimeUpdate);
    };
  }, [fetchBookings, fetchActivityLogs, mainTab]);

  // ==========================================
  // XEM CHI TIẾT BOOKING
  // ==========================================
  const handleOpenDetail = async (bookingId: string) => {
    try {
      setLoadingDetail(true);
      setIsDetailModalOpen(true);
      const res = await bookingApi.getOne(bookingId);
      setSelectedBookingDetail(res.data);
    } catch (err: any) {
      console.error('Lỗi tải chi tiết booking:', err);
      setActionNotice({
        type: 'error',
        message: err.message || 'Không thể tải thông tin chi tiết đơn.',
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  // ==========================================
  // ĐỔI TRẠNG THÁI BOOKING
  // ==========================================
  const openStatusChangeDialog = (booking: AdminBookingItem, nextStatus: string, label: string) => {
    setStatusActionModal({
      isOpen: true,
      booking,
      nextStatus,
      statusLabel: label,
      note: '',
      submitting: false,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusActionModal.booking) return;
    try {
      setStatusActionModal((prev) => ({ ...prev, submitting: true }));
      await bookingApi.updateStatus(statusActionModal.booking.id, {
        status: statusActionModal.nextStatus,
        note: statusActionModal.note.trim() || undefined,
      });

      setActionNotice({
        type: 'success',
        message: `Đã cập nhật trạng thái đơn ${statusActionModal.booking.bookingCode} thành "${statusActionModal.statusLabel}" thành công!`,
      });

      setStatusActionModal({
        isOpen: false,
        booking: null,
        nextStatus: '',
        statusLabel: '',
        note: '',
        submitting: false,
      });

      // Reload
      fetchBookings();
      if (isDetailModalOpen && selectedBookingDetail) {
        handleOpenDetail(selectedBookingDetail.id);
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái:', err);
      setActionNotice({
        type: 'error',
        message: err.message || 'Không thể cập nhật trạng thái đơn.',
      });
      setStatusActionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Filtered activity logs
  const filteredLogs = activityLogs.filter((l) => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      l.bookingCode?.toLowerCase().includes(q) ||
      l.customerName?.toLowerCase().includes(q) ||
      l.hotelName?.toLowerCase().includes(q) ||
      l.operatorName?.toLowerCase().includes(q) ||
      l.note?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        pageTitle="Quản Lý Đơn Đặt Khách Sạn"
        items={[{ label: 'Bookings & Giám Sát Vận Hành' }]}
      />

      {/* Action Notice */}
      {actionNotice && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-medium border ${
            actionNotice.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs underline hover:opacity-80 cursor-pointer ml-3"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Đơn Đặt Phòng & Giám Sát Vận Hành
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dành cho nhân viên lễ tân, quản trị viên và chủ khách sạn theo dõi vận hành
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`h-4 w-4 ${loadingBookings || loadingLogs ? 'animate-spin' : ''}`} />}
              onClick={() => {
                if (mainTab === 'bookings') fetchBookings();
                else fetchActivityLogs();
              }}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Primary Tabs (Bookings vs Activity Log) */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 px-5 dark:border-gray-800 dark:bg-gray-900/40">
          <button
            onClick={() => setMainTab('bookings')}
            className={`flex items-center gap-2 border-b-2 py-3.5 px-4 text-xs font-bold transition-colors cursor-pointer ${
              mainTab === 'bookings'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Danh Sách Đơn Đặt Phòng</span>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-2xs font-extrabold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {meta.total}
            </span>
          </button>

          <button
            onClick={() => setMainTab('activity_logs')}
            className={`flex items-center gap-2 border-b-2 py-3.5 px-4 text-xs font-bold transition-colors cursor-pointer ${
              mainTab === 'activity_logs'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Nhật Ký Giám Sát Vận Hành (Activity Logs)</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-2xs font-extrabold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              Mới
            </span>
          </button>
        </div>

        {/* TAB 1: DANH SÁCH BOOKINGS */}
        {mainTab === 'bookings' && (
          <div>
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 bg-white px-5 py-2.5 dark:border-gray-800 dark:bg-gray-900/20 overflow-x-auto">
              {[
                { key: 'ALL', label: 'Tất cả trạng thái' },
                { key: 'PENDING', label: 'Chờ duyệt' },
                { key: 'CONFIRMED', label: 'Đã xác nhận' },
                { key: 'CHECKED_IN', label: 'Đã nhận phòng' },
                { key: 'COMPLETED', label: 'Hoàn thành' },
                { key: 'REJECTED', label: 'Đã từ chối' },
                { key: 'CANCELLED', label: 'Đã huỷ' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/30 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPage(1);
                      fetchBookings();
                    }
                  }}
                  placeholder="Tìm theo mã đơn (BK...), tên khách, SĐT, email..."
                  className="h-9 w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              <div className="text-xs text-gray-500">
                Tìm thấy <span className="font-bold text-gray-800 dark:text-gray-200">{meta.total}</span> đơn
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-850/60 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Mã Đơn / Ngày Tạo</th>
                    <th className="px-5 py-3.5">Khách Hàng</th>
                    <th className="px-5 py-3.5">Khách Sạn & Số Khách</th>
                    <th className="px-5 py-3.5">Phụ Trách (Lễ Tân)</th>
                    <th className="px-5 py-3.5">Lịch Lưu Trú</th>
                    <th className="px-5 py-3.5">Tổng Tiền</th>
                    <th className="px-5 py-3.5">Trạng Thái</th>
                    <th className="px-5 py-3.5 text-right">Hành Động Xử Lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loadingBookings ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-gray-400">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
                        Đang tải dữ liệu đơn đặt phòng...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-gray-500">
                        <CalendarCheck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        Không tìm thấy đơn đặt phòng nào phù hợp điều kiện lọc.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => {
                      const cfg = STATUS_CONFIG[b.status] || {
                        label: b.status,
                        variant: 'neutral',
                      };

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          {/* Mã đơn */}
                          <td className="px-5 py-3.5">
                            <div className="font-mono font-bold text-brand-600 dark:text-brand-400">
                              {b.bookingCode}
                            </div>
                            <div className="text-xs-plus text-gray-400 mt-0.5">
                              {new Date(b.createdAt).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </div>
                          </td>

                          {/* Khách hàng */}
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {b.contactName}
                            </div>
                            <div className="text-xs-plus text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span>{b.contactPhone}</span>
                            </div>
                            <div className="text-xs-plus text-gray-400 truncate max-w-[160px]">
                              {b.contactEmail}
                            </div>
                          </td>

                          {/* Khách sạn */}
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {b.hotelName || 'Khách sạn liên kết'}
                            </div>
                            <div className="text-xs-plus text-gray-500 mt-0.5">
                              {b.requestedRoomCount} phòng • {b.totalGuests} khách
                            </div>
                          </td>

                          {/* Phụ trách (Lễ Tân) */}
                          <td className="px-5 py-3.5">
                            {b.handledByName ? (
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                                  <span className="truncate max-w-[130px]">{b.handledByName}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span
                                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-2xs font-bold ${
                                      b.assignmentType === 'AUTO'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    }`}
                                  >
                                    {b.assignmentType === 'AUTO' ? (
                                      <>
                                        <Sparkles className="h-2.5 w-2.5" />
                                        Tự Động
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-2.5 w-2.5" />
                                        Chỉ Định
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs-plus text-gray-400 italic">Chưa phân công</span>
                            )}
                          </td>

                          {/* Lưu trú */}
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-gray-700 dark:text-gray-300">
                              {new Date(b.checkInAt).toLocaleDateString('vi-VN')} →{' '}
                              {new Date(b.checkOutAt).toLocaleDateString('vi-VN')}
                            </div>
                          </td>

                          {/* Tổng tiền */}
                          <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                            {formatCurrency(Number(b.estimatedTotal))}
                          </td>

                          {/* Trạng thái */}
                          <td className="px-5 py-3.5">
                            <Badge variant={cfg.variant} dot>
                              {cfg.label}
                            </Badge>
                          </td>

                          {/* Hành động */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Xem chi tiết */}
                              <button
                                onClick={() => handleOpenDetail(b.id)}
                                title="Xem chi tiết đơn"
                                className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-xs-plus font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Chi tiết</span>
                              </button>

                              {/* Đổi nhân sự phụ trách */}
                              <button
                                onClick={() => openReassignModal(b)}
                                disabled={
                                  b.status === 'CHECKED_IN' ||
                                  b.status === 'COMPLETED' ||
                                  b.status === 'CANCELLED' ||
                                  b.status === 'REJECTED'
                                }
                                title={
                                  b.status === 'CHECKED_IN'
                                    ? 'Khách đã nhận phòng - Không thể đổi người phụ trách'
                                    : b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'REJECTED'
                                    ? 'Đơn đặt phòng đã kết thúc - Không thể đổi người phụ trách'
                                    : 'Phân công lại nhân viên phụ trách đơn'
                                }
                                className={`flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs-plus font-semibold transition-all cursor-pointer ${
                                  b.status === 'CHECKED_IN' ||
                                  b.status === 'COMPLETED' ||
                                  b.status === 'CANCELLED' ||
                                  b.status === 'REJECTED'
                                    ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400 dark:border-gray-800'
                                    : 'border-purple-200 bg-purple-50/60 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40'
                                }`}
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Đổi Phụ Trách</span>
                              </button>

                              {/* PENDING: Xác nhận hoặc Từ chối */}
                              {b.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => openStatusChangeDialog(b, 'CONFIRMED', 'Xác Nhận')}
                                    title="Xác nhận đơn"
                                    className="flex h-8 items-center gap-1 rounded-lg bg-green-600 px-2.5 text-xs-plus font-bold text-white hover:bg-green-700 shadow-xs cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Xác nhận</span>
                                  </button>
                                  <button
                                    onClick={() => openStatusChangeDialog(b, 'REJECTED', 'Từ Chối')}
                                    title="Từ chối đơn"
                                    className="flex h-8 items-center gap-1 rounded-lg bg-red-600 px-2.5 text-xs-plus font-bold text-white hover:bg-red-700 shadow-xs cursor-pointer"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span>Từ chối</span>
                                  </button>
                                </>
                              )}

                              {/* CONFIRMED: Check-in hoặc Huỷ */}
                              {b.status === 'CONFIRMED' && (
                                <>
                                  <button
                                    onClick={() => openStatusChangeDialog(b, 'CHECKED_IN', 'Nhận Phòng')}
                                    title="Khách làm thủ tục nhận phòng"
                                    className="flex h-8 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs-plus font-bold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
                                  >
                                    <LogIn className="h-3.5 w-3.5" />
                                    <span>Nhận phòng</span>
                                  </button>
                                  <button
                                    onClick={() => openStatusChangeDialog(b, 'CANCELLED', 'Huỷ Đơn')}
                                    title="Huỷ đơn đặt phòng"
                                    className="flex h-8 items-center gap-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 px-2.5 text-xs-plus font-bold cursor-pointer"
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                    <span>Huỷ</span>
                                  </button>
                                </>
                              )}

                              {/* CHECKED_IN: Hoàn thành / Trả phòng */}
                              {b.status === 'CHECKED_IN' && (
                                <button
                                  onClick={() => openStatusChangeDialog(b, 'COMPLETED', 'Hoàn Thành / Trả Phòng')}
                                  title="Khách trả phòng & hoàn tất giao dịch"
                                  className="flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-xs-plus font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                                >
                                  <CheckCheck className="h-3.5 w-3.5" />
                                  <span>Trả phòng</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <Pagination
                meta={meta}
                onPageChange={(newPage) => {
                  setPage(newPage);
                }}
              />
            )}
          </div>
        )}

        {/* TAB 2: NHẬT KÝ GIÁM SÁT VẬN HÀNH (Activity Log / Audit Trail) */}
        {mainTab === 'activity_logs' && (
          <div>
            <div className="border-b border-gray-200 px-5 py-3.5 dark:border-gray-800 bg-amber-50/40 dark:bg-amber-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Lịch sử ghi vết vận hành: Ai thay đổi trạng thái, lúc mấy giờ, lý do ghi chú gì
                </span>
              </div>

              <div className="relative flex-1 max-w-sm">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Lọc nhật ký theo mã đơn, nhân viên..."
                  className="h-8 w-full rounded-lg border border-gray-300 bg-white py-1 pl-9 pr-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-850/60 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Thời Gian</th>
                    <th className="px-5 py-3.5">Mã Đơn & Khách Hàng</th>
                    <th className="px-5 py-3.5">Khách Sạn</th>
                    <th className="px-5 py-3.5">Người Thực Hiện</th>
                    <th className="px-5 py-3.5">Thay Đổi Trạng Thái</th>
                    <th className="px-5 py-3.5">Ghi Chú Vận Hành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-gray-400">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-500" />
                        Đang tải nhật ký vận hành...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-gray-500">
                        Chưa có dữ liệu nhật ký vận hành.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        {/* Thời gian */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-400 font-mono">
                          <div className="font-semibold text-gray-800 dark:text-gray-200">
                            {new Date(log.changedAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-xs-plus text-gray-400">
                            {new Date(log.changedAt).toLocaleDateString('vi-VN')}
                          </div>
                        </td>

                        {/* Mã đơn & Khách hàng */}
                        <td className="px-5 py-3.5">
                          <div className="font-mono font-bold text-brand-600 dark:text-brand-400">
                            {log.bookingCode}
                          </div>
                          <div className="text-xs-plus text-gray-600 dark:text-gray-300">
                            Khách: {log.customerName}
                          </div>
                        </td>

                        {/* Khách sạn */}
                        <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                          {log.hotelName || 'Khách sạn liên kết'}
                        </td>

                        {/* Người thực hiện */}
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <span>{log.operatorName || 'Hệ thống'}</span>
                          </div>
                          <div className="text-2xs text-gray-400">
                            {log.operatorRole ? `Vai trò: ${log.operatorRole}` : log.operatorEmail}
                          </div>
                        </td>

                        {/* Chuyển trạng thái */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {log.oldStatus && (
                              <>
                                <Badge size="sm" variant={STATUS_CONFIG[log.oldStatus]?.variant || 'neutral'}>
                                  {STATUS_CONFIG[log.oldStatus]?.label || log.oldStatus}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                              </>
                            )}
                            <Badge size="sm" variant={STATUS_CONFIG[log.newStatus]?.variant || 'neutral'}>
                              {STATUS_CONFIG[log.newStatus]?.label || log.newStatus}
                            </Badge>
                          </div>
                        </td>

                        {/* Ghi chú */}
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 italic max-w-xs">
                          {log.note || <span className="text-gray-400">Không có ghi chú thêm</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CHI TIẾT ĐƠN ĐẶT PHÒNG + TIMELINE VẬN HÀNH */}
      {/* ======================================================== */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi Tiết Đơn Đặt Phòng: ${selectedBookingDetail?.bookingCode || ''}`}
        subtitle="Thông tin khách đặt, phòng lưu trú và dòng thời gian xử lý đơn"
        maxWidth="3xl"
      >
        {loadingDetail ? (
          <div className="py-12 text-center text-xs text-gray-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
            Đang tải thông tin chi tiết đơn...
          </div>
        ) : selectedBookingDetail ? (
          <div className="space-y-5 text-xs">
            {/* Top overview banner */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-850/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs-plus uppercase tracking-wider font-semibold text-gray-400">
                  Mã đơn lưu trú
                </p>
                <p className="text-base font-black text-brand-600 dark:text-brand-400 font-mono">
                  {selectedBookingDetail.bookingCode}
                </p>
                <p className="text-xs-plus text-gray-400 mt-0.5">
                  Ngày đặt:{' '}
                  {new Date(selectedBookingDetail.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Tình trạng:</span>
                <Badge
                  variant={STATUS_CONFIG[selectedBookingDetail.status]?.variant || 'neutral'}
                  dot
                >
                  {STATUS_CONFIG[selectedBookingDetail.status]?.label || selectedBookingDetail.status}
                </Badge>
              </div>
            </div>

            {/* Grid 2 cột: Khách hàng & Cơ sở lưu trú */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Thông tin khách hàng */}
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 space-y-2.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400">
                  <User className="h-4 w-4 text-brand-500" />
                  Người Liên Hệ & Đặt Phòng
                </h4>
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-100">
                    {selectedBookingDetail.contactName}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    <span>{selectedBookingDetail.contactPhone}</span>
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" />
                    <span>{selectedBookingDetail.contactEmail}</span>
                  </p>
                </div>

                {selectedBookingDetail.specialRequest && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Yêu cầu đặc biệt:
                    </span>
                    <p className="text-gray-600 dark:text-gray-300 italic mt-0.5">
                      "{selectedBookingDetail.specialRequest}"
                    </p>
                  </div>
                )}
              </div>

              {/* Thông tin khách sạn & phòng */}
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 space-y-2.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400">
                  <Building2 className="h-4 w-4 text-brand-500" />
                  Khách Sạn & Phòng Đặt
                </h4>
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-100">
                    {selectedBookingDetail.hotelName || 'Khách sạn liên kết'}
                  </p>
                  <p className="text-xs-plus text-gray-400">
                    {selectedBookingDetail.hotelAddress}
                  </p>
                  <p className="font-semibold text-brand-600 dark:text-brand-400 mt-1 flex items-center gap-1">
                    <BedDouble className="h-3 w-3" />
                    <span>{selectedBookingDetail.roomName || 'Phòng tiêu chuẩn'}</span>
                  </p>
                  <p className="text-gray-500 mt-0.5">
                    Số lượng: {selectedBookingDetail.requestedRoomCount} phòng • {selectedBookingDetail.totalGuests} khách
                  </p>
                  <p className="text-gray-500 mt-0.5 font-medium">
                    Nhận phòng: {new Date(selectedBookingDetail.checkInAt).toLocaleDateString('vi-VN')} →{' '}
                    Trả phòng: {new Date(selectedBookingDetail.checkOutAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Thông tin nhân viên phụ trách phục vụ / lễ tân */}
            <div className="rounded-xl border border-purple-200 p-4 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-900/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  <UserCheck className="h-4 w-4" />
                  Nhân Sự Phụ Trách Phục Vụ / Lễ Tân
                </h4>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold ${
                    selectedBookingDetail.assignmentType === 'AUTO'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  {selectedBookingDetail.assignmentType === 'AUTO'
                    ? 'Tự Động Phân Công Ngầm'
                    : 'Quản Trị Viên Chỉ Định Thủ Công'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    <User className="h-4 w-4 text-brand-500" />
                    <span>{selectedBookingDetail.handledByName || 'Chưa có nhân viên phụ trách'}</span>
                  </p>
                  {selectedBookingDetail.handledByEmail && (
                    <p className="text-xs-plus text-gray-500 dark:text-gray-400 mt-0.5">
                      Email: {selectedBookingDetail.handledByEmail}
                    </p>
                  )}
                  {selectedBookingDetail.assignmentNote && (
                    <p className="text-xs-plus text-purple-800 dark:text-purple-300 italic bg-white/80 dark:bg-gray-800/80 p-2.5 rounded-xl border border-purple-100 dark:border-purple-800/40 mt-2 flex items-start gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
                      <span>{selectedBookingDetail.assignmentNote}</span>
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      selectedBookingDetail.status === 'CHECKED_IN' ||
                      selectedBookingDetail.status === 'COMPLETED' ||
                      selectedBookingDetail.status === 'CANCELLED' ||
                      selectedBookingDetail.status === 'REJECTED'
                    }
                    onClick={() => openReassignModal(selectedBookingDetail)}
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                    Phân Công Lại
                  </Button>
                </div>
              </div>

              {selectedBookingDetail.status === 'CHECKED_IN' && (
                <p className="text-xs-plus text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Khách hàng đã nhận phòng (CHECKED_IN) - Theo quy định vận hành, không thể thay đổi nhân viên phụ trách.</span>
                </p>
              )}
            </div>

            {/* Chi tiết giá & thanh toán */}
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/20">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-gray-600 dark:text-gray-400">Tổng tiền ước tính:</span>
                <span className="text-base font-black text-brand-600 dark:text-brand-400">
                  {formatCurrency(Number(selectedBookingDetail.estimatedTotal))}
                </span>
              </div>
            </div>

            {/* Lịch sử thay đổi trạng thái (Audit Trail / Status Logs) */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
                <History className="h-4 w-4 text-amber-500" />
                Lịch Sử Trạng Thái Vận Hành (Activity Log)
              </h4>

              {selectedBookingDetail.statusLogs && selectedBookingDetail.statusLogs.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                  {selectedBookingDetail.statusLogs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500 dark:border-gray-900" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <Badge size="sm" variant={STATUS_CONFIG[log.newStatus]?.variant || 'neutral'}>
                            {STATUS_CONFIG[log.newStatus]?.label || log.newStatus}
                          </Badge>
                          {log.oldStatus && (
                            <span className="text-xs-plus text-gray-400">
                              (từ {STATUS_CONFIG[log.oldStatus]?.label || log.oldStatus})
                            </span>
                          )}
                        </div>
                        <span className="text-xs-plus text-gray-400">
                          {new Date(log.changedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs-plus text-gray-500 dark:text-gray-400 mt-1">
                        Thực hiện bởi: <span className="font-semibold text-gray-700 dark:text-gray-300">{log.changedByName || 'Hệ thống'}</span>
                      </p>
                      {log.note && (
                        <p className="text-xs-plus text-gray-600 dark:text-gray-300 italic bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700 mt-1">
                          "{log.note}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  Chưa có lịch sử thay đổi trạng thái nào được ghi nhận cho đơn này.
                </div>
              )}
            </div>

            {/* Quick Actions inside modal */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
              {selectedBookingDetail.status === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      openStatusChangeDialog(selectedBookingDetail, 'CONFIRMED', 'Xác Nhận');
                    }}
                  >
                    Xác Nhận Đơn
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      openStatusChangeDialog(selectedBookingDetail, 'REJECTED', 'Từ Chối');
                    }}
                  >
                    Từ Chối Đơn
                  </Button>
                </>
              )}

              {selectedBookingDetail.status === 'CONFIRMED' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openStatusChangeDialog(selectedBookingDetail, 'CHECKED_IN', 'Nhận Phòng');
                  }}
                >
                  Khách Làm Thủ Tục Nhận Phòng (Check-in)
                </Button>
              )}

              {selectedBookingDetail.status === 'CHECKED_IN' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openStatusChangeDialog(selectedBookingDetail, 'COMPLETED', 'Hoàn Thành / Trả Phòng');
                  }}
                >
                  Làm Thủ Tục Trả Phòng (Check-out)
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: XÁC NHẬN CẬP NHẬT TRẠNG THÁI + GHI CHÚ VẬN HÀNH */}
      {/* ======================================================== */}
      <Modal
        isOpen={statusActionModal.isOpen}
        onClose={() =>
          !statusActionModal.submitting &&
          setStatusActionModal((prev) => ({ ...prev, isOpen: false }))
        }
        title={`Cập Nhật Trạng Thái: ${statusActionModal.statusLabel}`}
        subtitle={`Đơn đặt phòng: ${statusActionModal.booking?.bookingCode}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-700 dark:text-gray-300">
            Bạn đang chuyển trạng thái đơn hàng{' '}
            <strong className="font-mono text-brand-600 dark:text-brand-400">
              {statusActionModal.booking?.bookingCode}
            </strong>{' '}
            thành{' '}
            <Badge size="sm" variant={STATUS_CONFIG[statusActionModal.nextStatus]?.variant || 'neutral'}>
              {statusActionModal.statusLabel}
            </Badge>
            .
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ghi chú / Lý do vận hành (Lưu vào nhật ký Audit Trail):
            </label>
            <textarea
              rows={3}
              value={statusActionModal.note}
              onChange={(e) =>
                setStatusActionModal((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="Ví dụ: Đã gọi điện cho khách xác nhận, khách đã chuyển khoản cọc,..."
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              disabled={statusActionModal.submitting}
              onClick={() =>
                setStatusActionModal((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Huỷ bỏ
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={statusActionModal.submitting}
              onClick={handleConfirmStatusChange}
            >
              Xác Nhận Thay Đổi
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: PHÂN CÔNG LẠI NHÂN VIÊN PHỤ TRÁCH (REASSIGN) */}
      {/* ======================================================== */}
      <Modal
        isOpen={reassignModal.isOpen}
        onClose={() => !reassignModal.submitting && setReassignModal((prev) => ({ ...prev, isOpen: false }))}
        title="Phân Công Lại Nhân Viên Phụ Trách Đơn Hàng"
        subtitle={`Đơn đặt phòng: ${reassignModal.booking?.bookingCode}`}
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          {/* Thông tin phòng & phân hạng */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 dark:border-gray-800 dark:bg-gray-850/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                Cơ sở: <span className="font-bold text-gray-900 dark:text-white">{reassignModal.booking?.hotelName}</span>
              </p>
              <p className="text-xs-plus text-gray-500 mt-0.5">
                Khách đặt: <span className="font-semibold text-gray-800 dark:text-gray-200">{reassignModal.booking?.contactName}</span> • Phòng:{' '}
                <span className="font-semibold text-brand-600 dark:text-brand-400">{reassignModal.roomInfo?.name || 'Phòng đặt'}</span>
              </p>
            </div>
            {reassignModal.roomInfo && (
              <Badge variant={reassignModal.roomInfo.isVip ? 'brand' : 'neutral'} className="inline-flex items-center gap-1">
                {reassignModal.roomInfo.isVip ? (
                  <>
                    <Star className="h-3 w-3 fill-current" />
                    <span>Phân Hạng Cao Cấp / VIP</span>
                  </>
                ) : (
                  'Phân Hạng Tiêu Chuẩn'
                )}
              </Badge>
            )}
          </div>

          {/* Cảnh báo nếu khách đã nhận phòng */}
          {!reassignModal.canReassign && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-bold">Không Thể Điều Chỉnh Phân Công</p>
                <p className="text-xs-plus mt-0.5">
                  Đơn đặt phòng này khách đã nhận phòng (CHECKED_IN) hoặc đã hoàn tất/hủy. Theo quy tắc vận hành, chỉ được phép thay đổi người phụ trách khi khách chưa tới nhận phòng.
                </p>
              </div>
            </div>
          )}

          {/* Danh sách ứng viên nhân viên */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Chọn Nhân Viên Lễ Tân / Phục Vụ Mới:
            </label>

            {reassignModal.loading ? (
              <div className="py-8 text-center text-xs text-gray-400">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-brand-500" />
                Đang tải danh sách nhân sự khách sạn...
              </div>
            ) : reassignModal.availableStaff.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                Không tìm thấy nhân viên khả dụng cho khách sạn này.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {reassignModal.availableStaff.map((st: any) => {
                  const isSelected = String(reassignModal.selectedStaffId) === String(st.staffUserId);
                  return (
                    <div
                      key={st.staffUserId}
                      onClick={() =>
                        reassignModal.canReassign &&
                        setReassignModal((prev) => ({ ...prev, selectedStaffId: String(st.staffUserId) }))
                      }
                      className={`rounded-xl border p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-900/20 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-4 w-4 rounded-full border items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-brand-600 bg-brand-600 text-white'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{st.staffName}</span>
                              {st.staffRole === 'MANAGER' && (
                                <span className="text-2xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                                  Trưởng Bộ Phận
                                </span>
                              )}
                              {st.recommended && (
                                <span className="text-2xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.2 rounded font-extrabold flex items-center gap-0.5">
                                  <Sparkles className="h-2.5 w-2.5" /> Phù hợp nhất
                                </span>
                              )}
                            </div>
                            <div className="text-xs-plus text-gray-500 dark:text-gray-400 mt-0.5">
                              Level {st.maxSkillLevel}/5 • {st.maxYearsExp} năm KN • Đã phục vụ: {st.completedCount} đơn thành công
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 text-xs-plus text-gray-500">
                          Đang phụ trách: <span className="font-bold text-gray-800 dark:text-gray-200">{st.activeLoad}</span> đơn
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Lý do phân công lại (Lưu Audit Trail):
            </label>
            <textarea
              rows={2}
              value={reassignModal.note}
              onChange={(e) => setReassignModal((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Ví dụ: Đổi nhân viên có chuyên môn tiếng Anh theo yêu cầu khách, thay ca trực,..."
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              disabled={reassignModal.submitting}
              onClick={() => setReassignModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Đóng
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!reassignModal.canReassign || !reassignModal.selectedStaffId || reassignModal.loading}
              isLoading={reassignModal.submitting}
              onClick={handleConfirmReassign}
            >
              Xác Nhận Phân Công Lại
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
