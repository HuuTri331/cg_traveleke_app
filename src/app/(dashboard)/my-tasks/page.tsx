'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Play,
  CheckCircle,
  FileCheck,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  guestWorkApi,
  GuestWorkTaskItem,
  WorkTaskStatus,
  WorkTaskPriority,
} from '@/services/api/guest-work.api';
import { Button } from '@/components/ui/Button';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<GuestWorkTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const statusParam = filterStatus === 'ALL' ? undefined : (filterStatus as WorkTaskStatus);
      const res = await guestWorkApi.getMyTasks(statusParam);
      setTasks(res);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Không thể tải danh sách nhiệm vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (taskId: string) => {
    setActionLoading(taskId);
    setActionError(null);
    setActionSuccess(null);
    try {
      await guestWorkApi.acceptTask(taskId);
      setActionSuccess(`Đã tiếp nhận nhiệm vụ #${taskId}`);
      await fetchTasks();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Không thể tiếp nhận nhiệm vụ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (taskId: string) => {
    setActionLoading(taskId);
    setActionError(null);
    setActionSuccess(null);
    try {
      await guestWorkApi.startTask(taskId);
      setActionSuccess(`Bắt đầu thực hiện nhiệm vụ #${taskId}`);
      await fetchTasks();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Không thể bắt đầu nhiệm vụ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (taskId: string) => {
    const note = window.prompt('Nhập minh chứng / ghi chú hoàn tất nhiệm vụ:');
    if (note === null) return;

    setActionLoading(taskId);
    setActionError(null);
    setActionSuccess(null);
    try {
      await guestWorkApi.completeTask(taskId, {
        evidenceRef: note.trim() || 'Hoàn tất trên Dashboard',
      });
      setActionSuccess(`Nhiệm vụ #${taskId} đã được đánh dấu hoàn thành`);
      await fetchTasks();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Không thể hoàn tất nhiệm vụ');
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityBadge = (priority: WorkTaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">Cao</span>;
      case 'NORMAL':
        return <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Bình thường</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">Thấp</span>;
    }
  };

  const getStatusBadge = (status: WorkTaskStatus) => {
    switch (status) {
      case 'CREATED':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Mới tạo</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">Được phân công</span>;
      case 'ACCEPTED':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Đã nhận việc</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Đang thực hiện</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Chờ nghiệm thu</span>;
      case 'VERIFIED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Đã nghiệm thu</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-blue-600" />
            Nhiệm vụ phục vụ của tôi (Đợt 4)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Điều phối và theo dõi các nhiệm vụ phục vụ khách lưu trú, cam kết thời hạn SLA và minh chứng nghiệm thu
          </p>
        </div>

        <Button onClick={fetchTasks} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </Button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {actionError}
        </div>
      )}

      {/* Bộ lọc trạng thái */}
      <div className="flex flex-wrap gap-2 pt-2 border-b border-gray-200 pb-3">
        {[
          { label: 'Tất cả', value: 'ALL' },
          { label: 'Cần nhận việc (ASSIGNED)', value: 'ASSIGNED' },
          { label: 'Đang làm (IN_PROGRESS)', value: 'IN_PROGRESS' },
          { label: 'Chờ nghiệm thu (COMPLETED)', value: 'COMPLETED' },
          { label: 'Đã nghiệm thu (VERIFIED)', value: 'VERIFIED' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilterStatus(tab.value)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterStatus === tab.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách nhiệm vụ */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 text-sm">Đang tải danh sách nhiệm vụ...</div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl">
          <p className="text-sm text-gray-600 font-medium">Hiện tại bạn không có nhiệm vụ nào trong danh sách này.</p>
          <p className="text-xs text-gray-400 mt-1">Các yêu cầu từ khách lưu trú sẽ tự động được gán theo lượt phân công.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const isAssigned = task.status === 'ASSIGNED';
            const isAccepted = task.status === 'ACCEPTED';
            const isInProgress = task.status === 'IN_PROGRESS';
            const isCompleted = task.status === 'COMPLETED';

            const now = new Date();
            const resDue = task.responseSlaDueAt ? new Date(task.responseSlaDueAt) : null;
            const isResponseLate = resDue && now > resDue && !task.firstResponseAt;

            return (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-500">#{task.id}</span>
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      {task.title || `Nhiệm vụ: ${task.type}`}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Đơn đặt phòng:</span>
                      <span className="font-medium text-gray-900">#{task.bookingId}</span>
                    </div>
                    {task.responseSlaDueAt && (
                      <div className="flex justify-between items-center">
                        <span>Hạn phản hồi (SLA):</span>
                        <span className={`font-medium ${isResponseLate ? 'text-red-600' : 'text-gray-700'}`}>
                          {new Date(task.responseSlaDueAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                  {isAssigned && (
                    <Button
                      size="sm"
                      onClick={() => handleAccept(task.id)}
                      disabled={actionLoading === task.id}
                    >
                      Nhận việc
                    </Button>
                  )}

                  {isAccepted && (
                    <Button
                      size="sm"
                      onClick={() => handleStart(task.id)}
                      disabled={actionLoading === task.id}
                      className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Bắt đầu làm
                    </Button>
                  )}

                  {isInProgress && (
                    <Button
                      size="sm"
                      onClick={() => handleComplete(task.id)}
                      disabled={actionLoading === task.id}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Báo hoàn tất
                    </Button>
                  )}

                  {isCompleted && (
                    <span className="text-xs text-gray-500 italic">Đang chờ Quản lý nghiệm thu</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

