'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { hotelStaffApi, HotelStaffItem } from '@/services/api/hotel-staff.api';
import { hotelsApi } from '@/services/api/hotels.api';
import { usersApi } from '@/services/api/users.api';
import { Hotel } from '@/types/hotel';
import { UserProfile } from '@/types/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  Users,
  Building2,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Phone,
  Mail,
} from 'lucide-react';

const STAFF_ROLE_MAP: Record<string, { label: string; variant: 'brand' | 'info' | 'success' | 'warning' }> = {
  QUAN_LY: { label: 'Quản Lý Khách Sạn', variant: 'brand' },
  LE_TAN: { label: 'Lễ Tân Khách Sạn', variant: 'info' },
  BUONG_PHONG: { label: 'Buồng Phòng', variant: 'warning' },
  KE_TOAN: { label: 'Kế Toán / Thu Ngân', variant: 'success' },
};

export default function HotelStaffPage() {
  const { isAdmin } = useAuth();
  const [assignments, setAssignments] = useState<HotelStaffItem[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [staffUsers, setStaffUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotelFilter, setSelectedHotelFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    hotelId: '',
    staffUserId: '',
    staffRole: 'LE_TAN',
  });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<HotelStaffItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [assignmentsRes, hotelsRes, usersRes] = await Promise.all([
        hotelStaffApi.getAll(),
        hotelsApi.getAll({ perPage: 100 }),
        usersApi.getAllStaff().catch(() => []),
      ]);
      setAssignments(assignmentsRes.data || []);
      setHotels(hotelsRes.data || []);
      setStaffUsers(usersRes || []);
    } catch (err: any) {
      console.error('Lỗi tải danh sách phân công:', err);
      setNotice({
        type: 'error',
        message: err.message || 'Không thể tải dữ liệu phân công nhân sự.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle assign staff
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.hotelId || !assignForm.staffUserId) {
      setNotice({
        type: 'error',
        message: 'Vui lòng chọn khách sạn và nhân viên được phân công.',
      });
      return;
    }

    try {
      setSubmitting(true);
      await hotelStaffApi.assign({
        hotelId: assignForm.hotelId,
        staffUserId: assignForm.staffUserId,
        staffRole: assignForm.staffRole,
      });

      setNotice({
        type: 'success',
        message: 'Phân công nhân viên vào khách sạn thành công!',
      });
      setIsAssignModalOpen(false);
      setAssignForm({ hotelId: '', staffUserId: '', staffRole: 'LE_TAN' });
      fetchData();
    } catch (err: any) {
      console.error('Lỗi phân công nhân viên:', err);
      setNotice({
        type: 'error',
        message: err.message || 'Không thể phân công nhân viên.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle remove assignment
  const handleRemove = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await hotelStaffApi.remove(deleteTarget.id);
      setNotice({
        type: 'success',
        message: `Đã gỡ phân công của nhân viên ${deleteTarget.staffName} khỏi ${deleteTarget.hotelName}.`,
      });
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      console.error('Lỗi gỡ phân công:', err);
      setNotice({
        type: 'error',
        message: err.message || 'Không thể gỡ phân công.',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filtered assignments
  const filteredAssignments = assignments.filter((item) => {
    if (selectedHotelFilter !== 'ALL' && item.hotelId !== selectedHotelFilter) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.staffName?.toLowerCase().includes(q) ||
      item.staffEmail?.toLowerCase().includes(q) ||
      item.hotelName?.toLowerCase().includes(q) ||
      item.staffRole?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Phân Công Nhân Sự Khách Sạn"
        items={[{ label: 'Quản Lý Hệ Thống' }, { label: 'Phân Công Khách Sạn' }]}
      />

      {/* Notice alert */}
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
          <button
            onClick={() => setNotice(null)}
            className="text-xs underline hover:opacity-80 cursor-pointer ml-3"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Danh Sách Nhân Viên Phụ Trách Khách Sạn
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Phân quyền vận hành, lễ tân và quản lý cho từng cơ sở lưu trú
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchData}
            >
              Làm mới
            </Button>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAssignModalOpen(true)}
              >
                Phân Công Mới
              </Button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên nhân viên, email, khách sạn..."
              className="h-9 w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-500 shrink-0">Lọc khách sạn:</span>
            <select
              value={selectedHotelFilter}
              onChange={(e) => setSelectedHotelFilter(e.target.value)}
              className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="ALL">Tất cả khách sạn</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-850/60 text-gray-500 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Nhân Viên Phụ Trách</th>
                <th className="px-5 py-3.5">Khách Sạn Được Giao</th>
                <th className="px-5 py-3.5">Vai Trò Phụ Trách</th>
                <th className="px-5 py-3.5">Ngày Phân Công</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
                {isAdmin && <th className="px-5 py-3.5 text-right">Hành Động</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải danh sách phân công nhân viên...
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-gray-500">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    Chưa có phân công nào hoặc không tìm thấy kết quả phù hợp.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => {
                  const roleConfig = STAFF_ROLE_MAP[a.staffRole] || {
                    label: a.staffRole,
                    variant: 'info',
                  };

                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Nhân viên */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
                            {a.staffName ? a.staffName.slice(0, 2) : 'NV'}
                          </div>
                          <span>{a.staffName || 'Nhân viên'}</span>
                        </div>
                        <div className="text-xs-plus text-gray-400 mt-1 flex items-center gap-3">
                          {a.staffPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {a.staffPhone}
                            </span>
                          )}
                          {a.staffEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {a.staffEmail}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Khách sạn */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          <span>{a.hotelName || 'Khách sạn liên kết'}</span>
                        </div>
                        <div className="text-xs-plus text-gray-400 truncate max-w-xs mt-0.5">
                          {a.hotelAddress}
                        </div>
                      </td>

                      {/* Vai trò */}
                      <td className="px-5 py-3.5">
                        <Badge variant={roleConfig.variant}>
                          {roleConfig.label}
                        </Badge>
                      </td>

                      {/* Ngày phân công */}
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                        {new Date(a.assignedAt).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-3.5">
                        <Badge variant={a.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                          {a.status === 'ACTIVE' ? 'Đang Hoạt Động' : a.status}
                        </Badge>
                      </td>

                      {/* Hành động */}
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setDeleteTarget(a)}
                            title="Gỡ phân công nhân viên"
                            className="flex h-8 items-center gap-1 rounded-lg border border-red-200 px-2.5 text-xs-plus font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer ml-auto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Gỡ</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Phân Công Mới */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => !submitting && setIsAssignModalOpen(false)}
        title="Phân Công Nhân Viên Phụ Trách Khách Sạn"
        subtitle="Chọn nhân viên và cơ sở lưu trú để chỉ định nhiệm vụ vận hành"
        maxWidth="lg"
      >
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          {/* Chọn Khách Sạn */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Chọn Khách Sạn <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={assignForm.hotelId}
              onChange={(e) => setAssignForm((prev) => ({ ...prev, hotelId: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            >
              <option value="">-- Chọn khách sạn lưu trú --</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.address})
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Nhân Viên */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Chọn Nhân Viên <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={assignForm.staffUserId}
              onChange={(e) => setAssignForm((prev) => ({ ...prev, staffUserId: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            >
              <option value="">-- Chọn tài khoản nhân viên --</option>
              {staffUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Vai Trò */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Vai Trò Phụ Trách
            </label>
            <select
              value={assignForm.staffRole}
              onChange={(e) => setAssignForm((prev) => ({ ...prev, staffRole: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            >
              <option value="QUAN_LY">Quản Lý Khách Sạn (Hotel Manager)</option>
              <option value="LE_TAN">Lễ Tân Khách Sạn (Receptionist)</option>
              <option value="BUONG_PHONG">Bộ Phận Buồng Phòng (Housekeeping)</option>
              <option value="KE_TOAN">Kế Toán / Thu Ngân (Cashier)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => setIsAssignModalOpen(false)}
            >
              Huỷ
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={submitting}
              type="submit"
            >
              Lưu Phân Công
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Xác Nhận Gỡ Phân Công"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-700 dark:text-gray-300">
            Bạn có chắc chắn muốn gỡ phân công của nhân viên{' '}
            <strong className="text-gray-900 dark:text-white">
              {deleteTarget?.staffName}
            </strong>{' '}
            khỏi khách sạn{' '}
            <strong className="text-gray-900 dark:text-white">
              {deleteTarget?.hotelName}
            </strong>
            ?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              Huỷ
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleting}
              onClick={handleRemove}
            >
              Xác Nhận Gỡ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
