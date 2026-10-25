'use client';

import React, { useState } from 'react';
import {
  LogIn,
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { bookingPresenceApi } from '@/services/api/booking-presence.api';
import { AdminBookingItem, AdminBookingDetail } from '@/services/api/booking.api';

interface LateCheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AdminBookingItem | AdminBookingDetail | null;
  onSuccess: (updatedBooking: any) => void;
}

export function LateCheckInDialog({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: LateCheckInDialogProps) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!booking) return null;

  const isFromNoShow = booking.status === 'NO_SHOW';
  const now = new Date();
  const checkInDate = new Date(booking.checkInAt);
  const checkOutDate = new Date(booking.checkOutAt);
  const isExpired = now >= checkOutDate;

  // Số phút đến muộn
  const lateMinutes =
    now.getTime() > checkInDate.getTime()
      ? Math.floor((now.getTime() - checkInDate.getTime()) / 60000)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await bookingPresenceApi.confirmArrival(booking.id, {
        note: note.trim() || undefined,
      });
      onSuccess(res.booking);
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'Không thể thực hiện xác nhận nhận phòng. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isFromNoShow
          ? `Tiếp Nhận Khách Đến Muộn (Recovery) - ${booking.bookingCode}`
          : `Xác Nhận Nhận Phòng Tại Quầy - ${booking.bookingCode}`
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner cảnh báo nghiệp vụ */}
        {isFromNoShow ? (
          <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3.5 dark:border-purple-800 dark:bg-purple-950/30 text-xs">
            <p className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4 text-purple-600 shrink-0" />
              Khôi phục nhận phòng sau khi khách bị No-Show
            </p>
            <p className="text-purple-700 dark:text-purple-300 mt-1">
              Đơn đặt phòng này đã được bảo lưu an toàn (hold COMMITTED). Xác nhận tại đây
              sẽ kích hoạt quyền nhận phòng cho khách mà không làm mất số liệu lịch sử No-Show.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/30 text-xs">
            <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              Xác nhận khách có mặt thực tế tại quầy lễ tân
            </p>
            <p className="text-emerald-700 dark:text-emerald-300 mt-1">
              Thời gian nhận phòng thực tế sẽ được ghi nhận tại thời điểm hiện tại và lưu vào nhật ký hiện diện.
            </p>
          </div>
        )}

        {/* Thông tin đơn đặt */}
        <div className="rounded-xl border border-gray-200 p-3.5 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-850/50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Khách hàng:</span>
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-brand-500" />
              {booking.contactName} ({booking.contactPhone})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Kỳ lưu trú đã đặt:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {checkInDate.toLocaleDateString('vi-VN')} → {checkOutDate.toLocaleDateString('vi-VN')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Thời gian đến muộn:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {lateMinutes > 0 ? `${lateMinutes} phút (Trễ)` : 'Đúng giờ'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Hạn chót bảo lưu:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {checkOutDate.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Cảnh báo nếu đã quá hạn trả phòng */}
        {isExpired && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Đã quá thời hạn lưu trú!</p>
              <p className="mt-0.5">
                Kỳ đặt phòng đã kết thúc vào lúc {checkOutDate.toLocaleString('vi-VN')}. Theo quy tắc nghiệp vụ,
                không thể thực hiện nhận phòng vào kỳ đã kết thúc. Vui lòng hỗ trợ khách tạo đơn đặt phòng mới.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Ghi Chú Vận Hành Lễ Tân
          </label>
          <Textarea
            rows={2}
            placeholder={
              isFromNoShow
                ? 'Khách giải thích lý do đến muộn (chuyến bay trễ, kẹt xe...), đã kiểm tra giấy tờ tùy thân...'
                : 'Đã kiểm tra CCCD/Hộ chiếu, giao chìa khóa phòng...'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={submitting}
            onClick={onClose}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
            disabled={isExpired || submitting}
          >
            {isFromNoShow ? (
              <>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Xác Nhận Khôi Phục & Nhận Phòng
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-1.5" />
                Xác Nhận Nhận Phòng
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
