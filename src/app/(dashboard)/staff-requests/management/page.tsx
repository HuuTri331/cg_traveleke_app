'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Building2,
  Filter,
  User,
  Calendar,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  staffAvailabilityApi,
  StaffAbsenceRequestItem,
  AbsenceRequestStatus,
} from '@/services/api/staff-availability.api';
import { hotelsApi } from '@/services/api/hotels.api';
import { Hotel } from '@/types/hotel';

export default function StaffRequestsManagementPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [requests, setRequests] = useState<StaffAbsenceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal State
  const [decisionModalItem, setDecisionModalItem] = useState<StaffAbsenceRequestItem | null>(null);
  const [decisionAction, setDecisionAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // D1-07: Xem Booking / Task bị ảnh hưởng khi nhân sự vắng mặt
  const [impactModal, setImpactModal] = useState<{
    isOpen: boolean;
    staffName: string;
    loading: boolean;
    affectedBookings: any[];
    affectedTasks: any[];
  }>({
    isOpen: false,
    staffName: '',
    loading: false,
    affectedBookings: [],
    affectedTasks: [],
  });

  // D1-07: Modal Xác nhận vắng mặt khẩn cấp tạm thời (Emergency Unavailable)
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyStaffId, setEmergencyStaffId] = useState('');
  const [emergencyEndAt, setEmergencyEndAt] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [submittingEmergency, setSubmittingEmergency] = useState(false);

  const handleOpenImpact = async (item: StaffAbsenceRequestItem) => {
    setImpactModal({
      isOpen: true,
      staffName: item.staffName || `Nhân viên #${item.staffUserId}`,
      loading: true,
      affectedBookings: [],
      affectedTasks: [],
    });
    try {
      const res = await staffAvailabilityApi.getRequestImpact(item.id);
      if (res.success && res.data) {
        setImpactModal((prev) => ({
          ...prev,
          loading: false,
          affectedBookings: res.data.affectedBookings || [],
          affectedTasks: res.data.affectedTasks || [],
        }));
      } else {
        setImpactModal((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      setImpactModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotelId || !emergencyStaffId.trim() || !emergencyEndAt || !emergencyReason.trim()) {
      error('Vui lòng điền đầy đủ mã nhân viên, thời gian kết thúc và lý do khẩn cấp');
      return;
    }
    try {
      setSubmittingEmergency(true);
      const res = await staffAvailabilityApi.createEmergencyUnavailable({
        hotelId: selectedHotelId,
        staffUserId: emergencyStaffId.trim(),
        endAt: new Date(emergencyEndAt).toISOString(),
        reason: emergencyReason.trim(),
      });
      success(res.message || 'Đã xác nhận vắng mặt khẩn cấp có thời hạn');
      setEmergencyModalOpen(false);
      setEmergencyStaffId('');
      setEmergencyReason('');
      if (res.data && (res.data.affectedBookings?.length > 0 || res.data.affectedTasks?.length > 0)) {
        setImpactModal({
          isOpen: true,
          staffName: `Nhân viên #${emergencyStaffId}`,
          loading: false,
          affectedBookings: res.data.affectedBookings || [],
          affectedTasks: res.data.affectedTasks || [],
        });
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tạo xác nhận vắng mặt khẩn cấp');
    } finally {
      setSubmittingEmergency(false);
    }
  };

  // Load danh sách khách sạn
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await hotelsApi.getAll({ perPage: 100 });
        if (res.data && Array.isArray(res.data)) {
          setHotels(res.data);
          if (res.data.length > 0) {
            setSelectedHotelId(String(res.data[0].id));
          }
        }
      } catch (err) {
        console.error('Failed to load hotels', err);
      }
    };
    fetchHotels();
  }, []);

  // Load danh sách đơn xin phép theo khách sạn đã chọn
  const fetchHotelRequests = useCallback(async () => {
    if (!selectedHotelId) return;
    try {
      setLoading(true);
      const filterStatus = statusFilter !== 'ALL' ? (statusFilter as AbsenceRequestStatus) : undefined;
      const res = await staffAvailabilityApi.getHotelRequests(selectedHotelId, filterStatus);
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải danh sách đơn của khách sạn');
    } finally {
      setLoading(false);
    }
  }, [selectedHotelId, statusFilter, error]);

  useEffect(() => {
    fetchHotelRequests();
  }, [fetchHotelRequests]);

  const handleOpenDecision = (item: StaffAbsenceRequestItem, action: 'APPROVE' | 'REJECT') => {
    setDecisionModalItem(item);
    setDecisionAction(action);
    setReviewNote(action === 'APPROVE' ? 'Đồng ý chấp thuận đơn vắng mặt' : 'Từ chối yêu cầu vắng mặt');
  };

  const handleConfirmDecision = async () => {
    if (!decisionModalItem) return;
    try {
      setIsSubmitting(true);
      const res = await staffAvailabilityApi.decideRequest(decisionModalItem.id, {
        decision: decisionAction,
        reviewNote: reviewNote.trim() || undefined,
        expectedVersion: decisionModalItem.version,
      });

      if (res.success) {
        success(res.message || 'Xử lý quyết định thành công');
        setDecisionModalItem(null);
        setReviewNote('');
        fetchHotelRequests();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể thực hiện phê duyệt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấp thuận
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Từ chối
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            Nhân viên đã rút
          </span>
        );
      case 'REVOCATION_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Yêu cầu thu hồi
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Đã hủy/thu hồi
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const getRequestTypeName = (type: string) => {
    switch (type) {
      case 'LATE_ARRIVAL':
        return 'Đi Muộn';
      case 'EARLY_LEAVE':
        return 'Về Sớm';
      case 'SHORT_ABSENCE':
        return 'Vắng Ngắn Hạn';
      case 'LEAVE':
      default:
        return 'Nghỉ Làm';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-900/20 to-blue-950/40 border border-emerald-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Thẩm Quyền Quản Lý Khách Sạn (Hotel Manager)</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Xét Duyệt Đơn Nghỉ & Báo Đi Muộn Nhân Viên
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Phê duyệt hoặc từ chối khoảng thời gian vắng mặt của lễ tân. Khi chấp thuận, hệ thống tự động khóa tạm thời khả dụng nhận việc tự động của nhân viên.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchHotelRequests}
          disabled={loading}
          className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-2 min-w-[280px]">
          <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <Select
            label=""
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            options={hotels.map((h) => ({
              value: String(h.id),
              label: `${h.name} (#${h.id})`,
            }))}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          <Select
            label=""
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'PENDING', label: 'Chờ duyệt (PENDING)' },
              { value: 'REVOCATION_REQUESTED', label: 'Yêu cầu thu hồi' },
              { value: 'APPROVED', label: 'Đã chấp thuận' },
              { value: 'REJECTED', label: 'Đã từ chối' },
              { value: 'WITHDRAWN', label: 'Đã tự rút' },
            ]}
            className="w-full"
          />
        </div>

        <div className="ml-auto text-xs text-zinc-400">
          Tìm thấy: <strong className="text-white">{requests.length}</strong> đơn
        </div>
      </div>

      {/* Table danh sách đơn */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-zinc-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 opacity-50" />
            Đang tải dữ liệu đơn xét duyệt...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <FileCheck2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
            <p className="text-base text-zinc-300 font-medium">Không có đơn xin phép nào theo bộ lọc</p>
            <p className="text-xs text-zinc-500 mt-1">
              Các đơn xin nghỉ hoặc báo đi muộn từ nhân viên sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Nhân Viên</th>
                  <th className="py-3 px-4">Loại Đơn</th>
                  <th className="py-3 px-4">Thời Gian Vắng Mặt</th>
                  <th className="py-3 px-4">Lý Do</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Ghi Chú Phê Duyệt</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {requests.map((item) => {
                  const isSelf = String(item.staffUserId) === String(user?.id);
                  const isPending =
                    item.status === 'PENDING' || item.status === 'REVOCATION_REQUESTED';

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-xs">
                            {item.staffName ? item.staffName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-zinc-200">
                              {item.staffName || `Staff #${item.staffUserId}`}
                            </span>
                            <span className="text-xs text-zinc-500">{item.staffEmail}</span>
                          </div>
                        </div>
                        {isSelf && (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Đơn của chính bạn
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {getRequestTypeName(item.requestType)}
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-1">
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-zinc-200 text-xs">
                          {new Date(item.startAt).toLocaleString('vi-VN')}
                        </div>
                        <div className="text-xs text-zinc-500">
                          đến: {new Date(item.endAt).toLocaleString('vi-VN')}
                        </div>
                        {item.expectedArrivalAt && item.requestType === 'LATE_ARRIVAL' && (
                          <div className="text-xs text-amber-400 mt-1">
                            Dự kiến đến: {new Date(item.expectedArrivalAt).toLocaleTimeString('vi-VN')}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 max-w-xs text-xs">
                        <p className="text-zinc-300 line-clamp-2">{item.reason}</p>
                        {item.contactInfo && (
                          <span className="text-zinc-500 block mt-1">
                            SĐT: {item.contactInfo}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">{getStatusBadge(item.status)}</td>

                      <td className="py-4 px-4 max-w-xs text-xs text-zinc-400">
                        {item.decisionNote ? (
                          <div className="bg-zinc-800/40 p-2 rounded border border-zinc-800">
                            <p className="text-zinc-300 italic">"{item.decisionNote}"</p>
                            {item.decidedAt && (
                              <span className="text-[10px] text-zinc-500 block mt-1">
                                {new Date(item.decidedAt).toLocaleString('vi-VN')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenImpact(item)}
                            className="text-xs px-2.5 py-1"
                            title="Quét các Booking / Tác vụ của nhân viên này trùng khoảng vắng mặt"
                          >
                            Xem tác động
                          </Button>
                          {isPending ? (
                            isSelf ? (
                              <span className="text-xs text-zinc-500 italic">
                                Không thể tự duyệt
                              </span>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenDecision(item, 'APPROVE')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1"
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDecision(item, 'REJECT')}
                                  className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs px-2.5 py-1"
                                >
                                  Từ chối
                                </Button>
                              </>
                            )
                          ) : (
                            <span className="text-xs text-zinc-500">Đã giải quyết</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Phê Duyệt / Từ Chối */}
      <Modal
        isOpen={Boolean(decisionModalItem)}
        onClose={() => setDecisionModalItem(null)}
        title={
          decisionAction === 'APPROVE'
            ? 'Phê Duyệt Đơn Xin Phép'
            : 'Từ Chối Đơn Xin Phép'
        }
        subtitle={
          decisionAction === 'APPROVE'
            ? 'Khi phê duyệt, hệ thống sẽ tự động tạo khoảng vắng mặt (Availability Block) để không tự động phân công booking cho nhân viên này trong khoảng thời gian đã duyệt.'
            : 'Nêu rõ lý do từ chối để nhân viên nắm được thông tin.'
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
            <p>
              Nhân viên: <strong className="text-white">{decisionModalItem?.staffName}</strong>
            </p>
            <p>
              Loại đơn:{' '}
              <strong className="text-white">
                {decisionModalItem && getRequestTypeName(decisionModalItem.requestType)}
              </strong>
            </p>
            <p>
              Khoảng thời gian:{' '}
              <span className="text-zinc-300">
                {decisionModalItem &&
                  `${new Date(decisionModalItem.startAt).toLocaleString('vi-VN')} đến ${new Date(
                    decisionModalItem.endAt,
                  ).toLocaleString('vi-VN')}`}
              </span>
            </p>
          </div>

          <Textarea
            label="Ghi Chú Phê Duyệt / Lý Do *"
            placeholder="Nhập ghi chú phản hồi..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setDecisionModalItem(null)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDecision}
              disabled={isSubmitting}
              className={
                decisionAction === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-medium'
                  : 'bg-rose-600 hover:bg-rose-500 text-white font-medium'
              }
            >
              {isSubmitting
                ? 'Đang xử lý...'
                : decisionAction === 'APPROVE'
                ? 'Xác Nhận Phê Duyệt'
                : 'Xác Nhận Từ Chối'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Cảnh báo Booking & Tác vụ bị ảnh hưởng khi nhân sự nghỉ (D1-07 / PR-2) */}
      <Modal
        isOpen={impactModal.isOpen}
        onClose={() => setImpactModal((prev) => ({ ...prev, isOpen: false }))}
        title={`Cảnh Báo Tác Động Khi Vắng Mặt - ${impactModal.staffName}`}
        subtitle="Danh sách các đơn đặt phòng và nhiệm vụ đang mở của nhân sự này trong khoảng vắng mặt để Quản lý chọn Hỗ trợ tạm thời (A→B) hoặc Chuyển giao hoàn toàn."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {impactModal.loading ? (
            <p className="text-center py-6 text-zinc-400">Đang quét các booking và tác vụ bị ảnh hưởng...</p>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-amber-400 mb-2">
                  1. Đơn đặt phòng trùng khoảng nghỉ ({impactModal.affectedBookings.length})
                </h4>
                {impactModal.affectedBookings.length === 0 ? (
                  <p className="text-zinc-400 italic">Không có booking nào bị ảnh hưởng trong khoảng thời gian này.</p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {impactModal.affectedBookings.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white">
                            #{b.bookingCode || b.id} - {b.contactName} ({b.status})
                          </div>
                          <div className="text-zinc-400 text-[11px]">
                            Check-in: {new Date(b.checkInAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                        <a
                          href="/bookings"
                          className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500"
                        >
                          Mở Booking (Ủy quyền B / Bàn giao)
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-teal-400 mb-2">
                  2. Tác vụ phục vụ đang mở ({impactModal.affectedTasks.length})
                </h4>
                {impactModal.affectedTasks.length === 0 ? (
                  <p className="text-zinc-400 italic">Không có tác vụ đang mở nào bị tồn đọng.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {impactModal.affectedTasks.map((t: any) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white">
                            Task #{t.id}: {t.title || t.type} ({t.status})
                          </div>
                          <div className="text-zinc-400 text-[11px]">Booking #{t.bookingId}</div>
                        </div>
                        <a
                          href="/bookings"
                          className="px-2.5 py-1 rounded bg-amber-600 text-white font-semibold hover:bg-amber-500"
                        >
                          Xử lý bàn giao
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
