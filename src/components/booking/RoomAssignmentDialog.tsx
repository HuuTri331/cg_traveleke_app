'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  AllocateUnitsPayload,
  AllocationReceipt,
  roomUnitsApi,
  RoomUnitDto,
} from '@/services/api/room-units.api';

interface RoomAssignmentDialogProps {
  bookingId: string;
  expectedBookingVersion?: number;
  requiredCount?: number;
  allowedToAssign?: boolean;
  onSuccess?: (receipt?: AllocationReceipt) => void;
  onClose: () => void;
}

export default function RoomAssignmentDialog({
  bookingId,
  expectedBookingVersion = 1,
  requiredCount = 1,
  allowedToAssign = true,
  onSuccess,
  onClose,
}: RoomAssignmentDialogProps) {
  const [candidates, setCandidates] = useState<RoomUnitDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [commandId, setCommandId] = useState<string>(() => `alloc_${bookingId}_${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadBookingAndRoomCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const list = await roomUnitsApi.getBookingCandidates(bookingId);
      setCandidates(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.userMessage || 'Không thể tải danh sách phòng vật lý khả dụng.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void reloadBookingAndRoomCandidates();
  }, [reloadBookingAndRoomCandidates]);

  const toggleUnit = (unitId: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId];
      // Tạo commandId mới khi người dùng thay đổi lựa chọn phòng; giữ nguyên khi retry cùng lựa chọn
      setCommandId(`alloc_${bookingId}_${next.slice().sort().join('-')}_${Date.now()}`);
      return next;
    });
  };

  const saveAllocation = async (payload: AllocateUnitsPayload) => {
    setSaving(true);
    setError(null);
    try {
      const receipt = await roomUnitsApi.allocate(bookingId, payload);
      await reloadBookingAndRoomCandidates();
      onSuccess?.(receipt);
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        await reloadBookingAndRoomCandidates();
        setError('Phòng vừa được người khác nhận hoặc booking đã thay đổi. Vui lòng chọn lại.');
      } else {
        setError('Không thể giao phòng. Kiểm tra dữ liệu rồi thử lại.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!allowedToAssign || selectedIds.length !== requiredCount) return;
    await saveAllocation({
      unitIds: selectedIds,
      commandId,
      expectedBookingVersion,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Gán phòng vật lý cho Booking #{bookingId}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            Đóng
          </button>
        </div>

        <p className="mb-3 text-sm text-slate-600">
          Số lượng phòng vật lý cần chọn: <strong>{requiredCount}</strong> (Đã chọn:{' '}
          {selectedIds.length})
        </p>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="py-6 text-center text-sm text-slate-500">
            Đang tải danh sách phòng vật lý khả dụng...
          </div>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {candidates.map((unit) => {
              const checked = selectedIds.includes(String(unit.id));
              return (
                <label
                  key={unit.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                    checked ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      Phòng #{unit.roomNumber} {unit.floor ? `(Tầng ${unit.floor})` : ''}
                    </div>
                    <div className="text-xs text-slate-500">
                      Buồng phòng: {unit.housekeepingState} | Vận hành: {unit.operationalStatus}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleUnit(String(unit.id))}
                    className="h-4 w-4"
                  />
                </label>
              );
            })}
            {candidates.length === 0 && (
              <div className="py-4 text-center text-sm text-slate-500">
                Không có phòng vật lý trống cho kỳ lưu trú này.
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!allowedToAssign || saving || selectedIds.length !== requiredCount}
            onClick={handleAssign}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Xác nhận phân phòng'}
          </button>
        </div>
      </div>
    </div>
  );
}
