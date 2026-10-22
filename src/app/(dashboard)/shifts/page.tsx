'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { shiftsApi, StaffShiftItem, ShiftHandoverItem } from '@/services/api/shifts.api';
import { hotelsApi } from '@/services/api/hotels.api';
import { usersApi } from '@/services/api/users.api';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  ArrowRight,
  DollarSign,
  UserCheck,
  Building2,
  FileText,
  Calendar,
  AlertTriangle,
  History,
} from 'lucide-react';

const SHIFT_TYPE_MAP: Record<string, string> = {
  MORNING: 'Ca Sáng (06:00 - 14:00)',
  AFTERNOON: 'Ca Chiều (14:00 - 22:00)',
  NIGHT: 'Ca Đêm (22:00 - 06:00)',
  CUSTOM: 'Ca Tùy Chỉnh',
};

const SHIFT_STATUS_MAP: Record<
  string,
  { label: string; variant: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
> = {
  SCHEDULED: { label: 'Đã Lên Lịch', variant: 'info' },
  OPEN: { label: 'Đang Trực Ca', variant: 'brand' },
  HANDOVER_PENDING: { label: 'Chờ Tiếp Nhận Giao Ca', variant: 'warning' },
  CLOSED: { label: 'Đã Đóng Ca', variant: 'success' },
};

export default function ShiftsPage() {
  const { user, isAdmin } = useAuth();

  const [activeShift, setActiveShift] = useState<StaffShiftItem | null>(null);
  const [myShifts, setMyShifts] = useState<StaffShiftItem[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [startForm, setStartForm] = useState({
    hotelId: '',
    shiftType: 'MORNING' as 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM',
    plannedStartTime: '06:00',
    plannedEndTime: '14:00',
    openingCashFloat: 1000000,
    notes: '',
  });

  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [endForm, setEndForm] = useState({
    closingCashActual: 1000000,
    notes: '',
  });

  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverForm, setHandoverForm] = useState({
    receiverStaffId: '',
    handoverNotes: '',
    pendingItems: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [activeRes, myShiftsRes, hotelsRes, usersRes] = await Promise.all([
        shiftsApi.getActiveShift().catch(() => ({ data: null })),
        shiftsApi.getMyShifts().catch(() => ({ data: [] })),
        hotelsApi.getAll({ perPage: 100 }).catch(() => ({ data: [] })),
        usersApi.getAllStaff().catch(() => []),
      ]);

      setActiveShift(activeRes.data);
      setMyShifts(myShiftsRes.data || []);
      setHotels(hotelsRes.data || []);
      setStaffUsers(usersRes || []);

      if (hotelsRes.data?.length > 0 && !startForm.hotelId) {
        setStartForm((prev) => ({ ...prev, hotelId: String(hotelsRes.data[0].id) }));
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu ca trực:', err);
    } finally {
      setLoading(false);
    }
  }, [startForm.hotelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Bắt đầu ca
  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const today = new Date().toISOString().split('T')[0];
      const startIso = `${today}T${startForm.plannedStartTime}:00`;
      const endIso = `${today}T${startForm.plannedEndTime}:00`;

      await shiftsApi.startShift({
        hotelId: startForm.hotelId,
        shiftType: startForm.shiftType,
        plannedStartTime: startIso,
        plannedEndTime: endIso,
        openingCashFloat: Number(startForm.openingCashFloat),
        notes: startForm.notes || undefined,
      });

      setNotice({ type: 'success', message: 'Bắt đầu ca trực thành công!' });
      setIsStartModalOpen(false);
      fetchData();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Không thể bắt đầu ca trực.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Đóng ca
  const handleEndShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    try {
      setSubmitting(true);
      await shiftsApi.endShift(activeShift.id, {
        closingCashActual: Number(endForm.closingCashActual),
        notes: endForm.notes || undefined,
      });

      setNotice({ type: 'success', message: 'Đóng ca trực thành công!' });
      setIsEndModalOpen(false);
      fetchData();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Không thể đóng ca trực.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Bàn giao ca
  const handleHandoverShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    try {
      setSubmitting(true);
      await shiftsApi.handoverShift(activeShift.id, {
        receiverStaffId: handoverForm.receiverStaffId,
        handoverNotes: handoverForm.handoverNotes,
        pendingItems: handoverForm.pendingItems ? { summary: handoverForm.pendingItems } : undefined,
      });

      setNotice({ type: 'success', message: 'Đã gửi biên bản bàn giao ca cho nhân viên tiếp nhận!' });
      setIsHandoverModalOpen(false);
      fetchData();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Không thể tạo biên bản bàn giao ca.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        pageTitle="Quản Lý Ca Làm Việc & Bàn Giao Quỹ"
        items={[{ label: 'Vận Hành Lễ Tân' }, { label: 'Ca Trực & Bàn Giao' }]}
      />

      {/* Notice */}
      {notice && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-medium border ${
            notice.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-xs underline hover:opacity-80">
            Đóng
          </button>
        </div>
      )}

      {/* Active Shift Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${activeShift ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {activeShift ? 'Ca Trực Hiện Tại Của Bạn' : 'Chưa Có Ca Trực Đang Mở'}
                </h3>
                {activeShift && (
                  <Badge variant={SHIFT_STATUS_MAP[activeShift.status]?.variant || 'neutral'}>
                    {SHIFT_STATUS_MAP[activeShift.status]?.label || activeShift.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeShift
                  ? `Khách sạn: ${activeShift.hotelName || `#${activeShift.hotelId}`} | ${SHIFT_TYPE_MAP[activeShift.shiftType] || activeShift.shiftType}`
                  : 'Bắt đầu ca trực để ghi nhận điểm danh, mở quỹ tiền mặt và phục vụ khách hàng.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeShift ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={() => setIsHandoverModalOpen(true)}
                >
                  Bàn Giao Ca
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Square className="h-4 w-4" />}
                  onClick={() => setIsEndModalOpen(true)}
                >
                  Kết Thúc Ca
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play className="h-4 w-4" />}
                onClick={() => setIsStartModalOpen(true)}
              >
                Bắt Đầu Ca Trực
              </Button>
            )}
          </div>
        </div>

        {activeShift && (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-850">
              <span className="text-2xs text-gray-400">Thời gian bắt đầu thực tế:</span>
              <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                {activeShift.actualStartTime ? new Date(activeShift.actualStartTime).toLocaleTimeString() : 'N/A'}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-850">
              <span className="text-2xs text-gray-400">Quỹ tiền mặt đầu ca (Float):</span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                {formatCurrency(Number(activeShift.openingCashFloat || 0))}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-850">
              <span className="text-2xs text-gray-400">Kế hoạch ca kết thúc:</span>
              <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                {activeShift.plannedEndTime ? new Date(activeShift.plannedEndTime).toLocaleTimeString() : 'N/A'}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-850">
              <span className="text-2xs text-gray-400">Ghi chú ca:</span>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5 truncate">
                {activeShift.notes || 'Không có ghi chú'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* My Shifts History Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Lịch Sử Ca Trực Của Bạn</h3>
          </div>
          <span className="text-xs text-gray-500">{myShifts.length} ca làm việc</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Khách Sạn</th>
                <th className="py-3 px-4 font-semibold">Loại Ca</th>
                <th className="py-3 px-4 font-semibold">Trạng Thái</th>
                <th className="py-3 px-4 font-semibold">Bắt Đầu Thực Tế</th>
                <th className="py-3 px-4 font-semibold">Kết Thúc Thực Tế</th>
                <th className="py-3 px-4 font-semibold">Quỹ Đầu Ca</th>
                <th className="py-3 px-4 font-semibold">Quỹ Cuối Ca</th>
                <th className="py-3 px-4 font-semibold">Chênh Lệch Quỹ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Đang tải danh sách ca trực...
                  </td>
                </tr>
              ) : myShifts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Bạn chưa có lịch sử ca trực nào.
                  </td>
                </tr>
              ) : (
                myShifts.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50">
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {s.hotelName || `#${s.hotelId}`}
                    </td>
                    <td className="py-3 px-4">{SHIFT_TYPE_MAP[s.shiftType] || s.shiftType}</td>
                    <td className="py-3 px-4">
                      <Badge variant={SHIFT_STATUS_MAP[s.status]?.variant || 'neutral'}>
                        {SHIFT_STATUS_MAP[s.status]?.label || s.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {s.actualStartTime ? new Date(s.actualStartTime).toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {s.actualEndTime ? new Date(s.actualEndTime).toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono">{formatCurrency(Number(s.openingCashFloat || 0))}</td>
                    <td className="py-3 px-4 font-mono">
                      {s.closingCashActual ? formatCurrency(Number(s.closingCashActual)) : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {s.cashVariance ? (
                        <span className={Number(s.cashVariance) === 0 ? 'text-green-600' : 'text-red-500'}>
                          {Number(s.cashVariance) > 0 ? '+' : ''}
                          {formatCurrency(Number(s.cashVariance))}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Shift Modal */}
      <Modal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="Bắt Đầu Ca Trực Mới"
        maxWidth="lg"
      >
        <form onSubmit={handleStartShift} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Khách Sạn Trực Ca <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={startForm.hotelId}
              onChange={(e) => setStartForm((prev) => ({ ...prev, hotelId: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            >
              <option value="">-- Chọn khách sạn --</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Loại Ca Làm Việc
            </label>
            <select
              value={startForm.shiftType}
              onChange={(e) =>
                setStartForm((prev) => ({
                  ...prev,
                  shiftType: e.target.value as any,
                }))
              }
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            >
              <option value="MORNING">Ca Sáng (06:00 - 14:00)</option>
              <option value="AFTERNOON">Ca Chiều (14:00 - 22:00)</option>
              <option value="NIGHT">Ca Đêm (22:00 - 06:00)</option>
              <option value="CUSTOM">Ca Tùy Chỉnh</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Giờ Bắt Đầu Dự Kiến
              </label>
              <input
                type="time"
                value={startForm.plannedStartTime}
                onChange={(e) => setStartForm((prev) => ({ ...prev, plannedStartTime: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Giờ Kết Thúc Dự Kiến
              </label>
              <input
                type="time"
                value={startForm.plannedEndTime}
                onChange={(e) => setStartForm((prev) => ({ ...prev, plannedEndTime: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Quỹ Tiền Mặt Đầu Ca (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              min={0}
              step={10000}
              value={startForm.openingCashFloat}
              onChange={(e) => setStartForm((prev) => ({ ...prev, openingCashFloat: Number(e.target.value) }))}
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ghi Chú</label>
            <textarea
              rows={2}
              value={startForm.notes}
              onChange={(e) => setStartForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Ghi chú khi mở ca..."
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" size="sm" onClick={() => setIsStartModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Bắt Đầu Ca
            </Button>
          </div>
        </form>
      </Modal>

      {/* End Shift Modal */}
      <Modal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        title="Kết Thúc Ca Trực & Đối Soát Quỹ"
        maxWidth="md"
      >
        <form onSubmit={handleEndShift} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tiền Mặt Thực Tế Cuối Ca (Kiểm Đếm Két) <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              min={0}
              step={10000}
              value={endForm.closingCashActual}
              onChange={(e) => setEndForm((prev) => ({ ...prev, closingCashActual: Number(e.target.value) }))}
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ghi Chú Bàn Giao / Giải Trình Chênh Lệch
            </label>
            <textarea
              rows={3}
              value={endForm.notes}
              onChange={(e) => setEndForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Ghi chú bàn giao két, công việc tồn đọng..."
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" size="sm" onClick={() => setIsEndModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" size="sm" type="submit" isLoading={submitting}>
              Đóng Ca Trực
            </Button>
          </div>
        </form>
      </Modal>

      {/* Handover Modal */}
      <Modal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        title="Lập Biên Bản Bàn Giao Ca Trực"
        maxWidth="lg"
      >
        <form onSubmit={handleHandoverShift} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nhân Viên Nhận Ca Tiếp Theo <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={handoverForm.receiverStaffId}
              onChange={(e) => setHandoverForm((prev) => ({ ...prev, receiverStaffId: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            >
              <option value="">-- Chọn nhân viên lễ tân ca sau --</option>
              {staffUsers
                .filter((u) => String(u.id) !== String(user?.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nội Dung Bàn Giao Ca <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={handoverForm.handoverNotes}
              onChange={(e) => setHandoverForm((prev) => ({ ...prev, handoverNotes: e.target.value }))}
              placeholder="Tình hình khách lưu trú, khách sắp nhận phòng, tiền mặt còn lại..."
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Công Việc Tồn Đọng Cần Ca Sau Xử Lý
            </label>
            <textarea
              rows={2}
              value={handoverForm.pendingItems}
              onChange={(e) => setHandoverForm((prev) => ({ ...prev, pendingItems: e.target.value }))}
              placeholder="VD: Phòng 204 yêu cầu dọn bù, khách phòng 301 xin check-out muộn..."
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" size="sm" onClick={() => setIsHandoverModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Gửi Biên Bản Bàn Giao
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
