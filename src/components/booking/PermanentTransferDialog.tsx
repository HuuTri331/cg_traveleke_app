'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { bookingCoverageApi, TaskHandoverDecisionPayload } from '@/services/api/booking-coverage.api';
import { guestWorkApi, GuestWorkTaskItem } from '@/services/api/guest-work.api';

interface PermanentTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  currentHandlerId?: string | number | null;
  expectedAssignmentVersion?: number;
  availableStaffList: Array<{ id: string | number; fullName: string; role?: string }>;
  onSuccess: () => void;
}

const REASON_CODE_OPTIONS = [
  { value: 'EMPLOYMENT_ENDED', label: 'Nhân sự nghỉ việc hẳn / Rời biên chế khách sạn' },
  { value: 'ROLE_CHANGED', label: 'Nhân sự chuyển bộ phận / Không còn giữ vai trò Lễ tân' },
  { value: 'ADMIN_OVERRIDE', label: 'Điều chuyển đặc biệt bởi Quản trị viên (Admin Override)' },
];

export function PermanentTransferDialog({
  isOpen,
  onClose,
  bookingId,
  currentHandlerId,
  expectedAssignmentVersion,
  availableStaffList,
  onSuccess,
}: PermanentTransferDialogProps) {
  const [toStaffUserId, setToStaffUserId] = useState('');
  const [reasonCode, setReasonCode] = useState('EMPLOYMENT_ENDED');
  const [reason, setReason] = useState('');
  const [commandId] = useState(() => `trans_${bookingId}_${Date.now()}`);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openTasks, setOpenTasks] = useState<GuestWorkTaskItem[]>([]);
  const [taskDecisionsMap, setTaskDecisionsMap] = useState<
    Record<string, { action: 'HANDOVER' | 'CONTINUE'; leaseUntil: string; reason: string }>
  >({});

  useEffect(() => {
    if (!isOpen || !bookingId) return;
    let mounted = true;
    guestWorkApi
      .getTasksForBooking(bookingId)
      .then((tasks) => {
        if (!mounted) return;
        const inProgress = (Array.isArray(tasks) ? tasks : []).filter((t) =>
          ['ACCEPTED', 'IN_PROGRESS'].includes(t.status),
        );
        setOpenTasks(inProgress);
        const defaults: Record<string, { action: 'HANDOVER' | 'CONTINUE'; leaseUntil: string; reason: string }> = {};
        const defaultLease = new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16);
        for (const t of inProgress) {
          defaults[String(t.id)] = {
            action: 'HANDOVER',
            leaseUntil: defaultLease,
            reason: 'Bàn giao sang người phụ trách mới khi chuyển chủ đơn',
          };
        }
        setTaskDecisionsMap(defaults);
      })
      .catch(() => {
        if (mounted) setOpenTasks([]);
      });
    return () => {
      mounted = false;
    };
  }, [isOpen, bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toStaffUserId) {
      setErrorMsg('Vui lòng chọn nhân viên tiếp nhận trách nhiệm chính');
      return;
    }
    if (!reasonCode) {
      setErrorMsg('Vui lòng chọn mã lý do bàn giao');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Bắt buộc phải nhập lý do bàn giao trách nhiệm chính');
      return;
    }

    const taskDecisions: TaskHandoverDecisionPayload[] = [];
    for (const t of openTasks) {
      const dec = taskDecisionsMap[String(t.id)];
      if (!dec || !dec.reason.trim()) {
        setErrorMsg(`Vui lòng chọn phương án xử lý và lý do cho nhiệm vụ đang dở dang #${t.id}`);
        return;
      }
      taskDecisions.push({
        taskId: String(t.id),
        action: dec.action,
        leaseUntil: dec.action === 'CONTINUE' && dec.leaseUntil ? new Date(dec.leaseUntil).toISOString() : undefined,
        reason: dec.reason.trim(),
      });
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await bookingCoverageApi.permanentTransfer(bookingId, {
        toStaffUserId,
        reasonCode,
        reason: reason.trim(),
        expectedAssignmentVersion,
        commandId,
        taskDecisions: taskDecisions.length > 0 ? taskDecisions : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          'Không thể bàn giao trách nhiệm chính đơn đặt phòng',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bàn giao trách nhiệm chính (Permanent Transfer)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Lưu ý quan trọng khi chuyển giao chính:</span>
          </div>
          <p>
            Hành động này sẽ cập nhật nhân sự phụ trách chính thức của đơn đặt phòng.
            Tất cả các ủy quyền tạm thời đang hoạt động sẽ được tự động kết thúc.
            Lịch sử phục vụ và KPI trước đó của nhân sự cũ vẫn được bảo lưu trọn vẹn.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhân sự tiếp nhận phụ trách chính <span className="text-red-500">*</span>
          </label>
          <select
            value={toStaffUserId}
            onChange={(e) => setToStaffUserId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">-- Chọn nhân sự tiếp quản --</option>
            {availableStaffList
              .filter((st) => String(st.id) !== String(currentHandlerId))
              .map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} {st.role ? `(${st.role})` : ''} - #{st.id}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phân loại lý do bàn giao <span className="text-red-500">*</span>
          </label>
          <select
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {REASON_CODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.value})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lý do bàn giao chi tiết <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Ví dụ: Nhân sự nghỉ việc hoặc chuyển bộ phận công tác..."
            rows={3}
          />
        </div>

        {openTasks.length > 0 && (
          <div className="space-y-2 border border-indigo-200 bg-indigo-50/40 rounded-lg p-3">
            <p className="text-xs font-bold text-indigo-900">
              Quyết định bàn giao cho {openTasks.length} nhiệm vụ đang thực hiện (ACCEPTED / IN_PROGRESS):
            </p>
            {openTasks.map((t) => {
              const dec = taskDecisionsMap[String(t.id)] || {
                action: 'HANDOVER' as const,
                leaseUntil: '',
                reason: '',
              };
              return (
                <div key={t.id} className="bg-white border border-gray-200 rounded p-2.5 space-y-2 text-xs">
                  <div className="font-semibold text-gray-800">
                    #{t.id} — {t.title || t.type} ({t.status})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={dec.action}
                      onChange={(e) =>
                        setTaskDecisionsMap((prev) => ({
                          ...prev,
                          [String(t.id)]: { ...dec, action: e.target.value as 'HANDOVER' | 'CONTINUE' },
                        }))
                      }
                      className="px-2 py-1.5 border border-gray-300 rounded text-xs"
                    >
                      <option value="HANDOVER">HANDOVER — Bàn giao cho chủ đơn mới</option>
                      <option value="CONTINUE">CONTINUE — Người đang làm giữ lease hoàn tất</option>
                    </select>
                    {dec.action === 'CONTINUE' && (
                      <input
                        type="datetime-local"
                        value={dec.leaseUntil}
                        onChange={(e) =>
                          setTaskDecisionsMap((prev) => ({
                            ...prev,
                            [String(t.id)]: { ...dec, leaseUntil: e.target.value },
                          }))
                        }
                        className="px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                    )}
                  </div>
                  <input
                    type="text"
                    value={dec.reason}
                    onChange={(e) =>
                      setTaskDecisionsMap((prev) => ({
                        ...prev,
                        [String(t.id)]: { ...dec, reason: e.target.value },
                      }))
                    }
                    placeholder="Lý do xử lý nhiệm vụ này..."
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang chuyển giao...' : 'Xác nhận bàn giao'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

