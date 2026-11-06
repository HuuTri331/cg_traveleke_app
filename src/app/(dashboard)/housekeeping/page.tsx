'use client';

import React, { useEffect, useState } from 'react';
import { deskBoardApi } from '@/services/api/desk-board.api';

export default function HousekeepingBoardPage() {
  const [hotelId, setHotelId] = useState<string>('1');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async (targetHotelId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await deskBoardApi.listHousekeepingTasks(targetHotelId);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.userMessage || 'Không thể tải bảng công việc Buồng phòng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(hotelId);
  }, [hotelId]);

  const handleAction = async (taskId: string, action: 'start' | 'complete' | 'inspect') => {
    setError(null);
    const cmdId = `hk_${action}_${taskId}_${Date.now()}`;
    try {
      if (action === 'start') {
        await deskBoardApi.startHousekeepingTask(taskId, cmdId);
      } else if (action === 'complete') {
        await deskBoardApi.completeHousekeepingTask(taskId, cmdId, { towelsReplaced: true });
      } else {
        await deskBoardApi.inspectHousekeepingTask(taskId, {
          approved: true,
          commandId: cmdId,
        });
      }
      await loadTasks(hotelId);
    } catch (err: any) {
      setError(err?.userMessage || 'Thao tác buồng phòng bị từ chối (kiểm tra 4-eyes hoặc trạng thái phòng).');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Điều phối Buồng phòng (DIRTY → CLEAN → INSPECTED READY)
          </h1>
          <p className="text-sm text-slate-600">
            Tách biệt độc lập với KPI lễ tân (GuestWorkTask); áp dụng nghiệm thu 4-eyes
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadTasks(hotelId)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Tải lại
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">Đang tải danh sách dọn phòng...</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  Task #{task.id} — Phòng vật lý ID #{task.unitId} ({task.kind})
                </div>
                <div className="text-xs text-slate-500">
                  Trạng thái: <strong>{task.status}</strong> | Hạn SLA:{' '}
                  {task.dueAt ? new Date(task.dueAt).toLocaleString('vi-VN') : '—'}
                </div>
              </div>
              <div className="flex gap-2">
                {task.status === 'OPEN' && (
                  <button
                    type="button"
                    onClick={() => handleAction(String(task.id), 'start')}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Bắt đầu dọn
                  </button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    onClick={() => handleAction(String(task.id), 'complete')}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Báo dọn xong (CLEAN)
                  </button>
                )}
                {task.status === 'CLEANED' && (
                  <button
                    type="button"
                    onClick={() => handleAction(String(task.id), 'inspect')}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Nghiệm thu (4-Eyes → READY)
                  </button>
                )}
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Không có công việc dọn phòng nào đang mở.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
