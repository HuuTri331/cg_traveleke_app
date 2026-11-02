'use client';

import React, { useState } from 'react';
import { ShieldAlert, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  bookingCoverageApi,
  CoverageTaskType,
} from '@/services/api/booking-coverage.api';

interface TemporaryCoverageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  hotelId: string | number;
  availableStaffList: Array<{ id: string | number; fullName: string; role?: string }>;
  onSuccess: () => void;
}

export function TemporaryCoverageDialog({
  isOpen,
  onClose,
  bookingId,
  hotelId,
  availableStaffList,
  onSuccess,
}: TemporaryCoverageDialogProps) {
  const [delegateStaffId, setDelegateStaffId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(120); // Mặc định 2 giờ
  const [taskType, setTaskType] = useState<CoverageTaskType>('CHECK_IN');
  const [includeServiceTasks, setIncludeServiceTasks] = useState(true);
  const [reason, setReason] = useState('');
  const [commandId] = useState(() => `cov_${bookingId}_${Date.now()}`);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateStaffId) {
      setErrorMsg('Vui lòng chọn nhân viên nhận ủy quyền hỗ trợ');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const now = new Date();
    const endAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const allowedTaskTypes: CoverageTaskType[] = Array.from(
      new Set([
        taskType,
        ...(includeServiceTasks ? (['ALL_SERVICE_TASKS', 'CHECK_IN'] as CoverageTaskType[]) : []),
      ]),
    );

    try {
      await bookingCoverageApi.createTemporary(bookingId, {
        delegateStaffUserId: delegateStaffId,
        startAt: now.toISOString(),
        endAt: endAt.toISOString(),
        allowedTaskTypes,
        reason: reason.trim() || 'Hỗ trợ nghiệp vụ tạm thời theo khoảng thời gian',
        commandId,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          'Không thể thiết lập ủy quyền hỗ trợ tạm thời',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ủy quyền hỗ trợ tạm thời">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <p className="font-semibold mb-1">Quy định ủy quyền tạm thời (Đợt 3):</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Thời lượng ủy quyền: từ 15 phút đến tối đa 24 giờ.</li>
            <li>Nhân viên nhận hỗ trợ không rơi vào khoảng nghỉ/đi muộn đã duyệt.</li>
            <li>Sau khi hết hạn, quyền tự động thu hồi và hoàn trả về người phụ trách chính.</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn nhân sự hỗ trợ <span className="text-red-500">*</span>
          </label>
          <select
            value={delegateStaffId}
            onChange={(e) => setDelegateStaffId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">-- Chọn nhân viên trong khách sạn --</option>
            {availableStaffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.fullName} {st.role ? `(${st.role})` : ''} - #{st.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thời lượng ủy quyền
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '30 phút', mins: 30 },
              { label: '1 giờ', mins: 60 },
              { label: '2 giờ', mins: 120 },
              { label: '4 giờ', mins: 240 },
            ].map((preset) => (
              <button
                key={preset.mins}
                type="button"
                onClick={() => setDurationMinutes(preset.mins)}
                className={`py-1.5 text-xs font-medium rounded border ${
                  durationMinutes === preset.mins
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Thời lượng tùy chỉnh (phút, tối đa 1440):</span>
            <input
              type="number"
              min={15}
              max={1440}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phạm vi công việc được ủy quyền
          </label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as CoverageTaskType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="ALL_SERVICE_TASKS">Toàn bộ tác vụ phục vụ (Khuyên dùng)</option>
            <option value="CHECK_IN">Chỉ hỗ trợ đón tiếp & Check-in</option>
            <option value="CHECK_OUT">Chỉ hỗ trợ làm thủ tục Check-out</option>
            <option value="SERVICE_RESPONSE">Chỉ hỗ trợ xử lý yêu cầu dịch vụ</option>
            <option value="COMPLAINT_HANDLE">Chỉ hỗ trợ giải quyết khiếu nại</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lý do ủy quyền
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: Đang bận đón đoàn khách lớn tại sảnh, nhờ hỗ trợ check-in phòng 304..."
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang kích hoạt...' : 'Kích hoạt ủy quyền'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

