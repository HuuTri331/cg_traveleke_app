'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  UserCheck,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usersApi } from '@/services/api/users.api';
import { UserProfile, CreateStaffDto, UpdateStaffDto } from '@/types/auth';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export default function StaffManagementPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'EMPLOYEE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserProfile | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateStaffDto>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'EMPLOYEE',
    gender: 'MALE',
  });

  const [editForm, setEditForm] = useState<UpdateStaffDto>({
    fullName: '',
    phone: '',
    gender: 'MALE',
    password: '',
  });

  const [newRole, setNewRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');
  const [submitting, setSubmitting] = useState(false);

  // Fetch staff list
  const fetchStaffList = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const data = await usersApi.getAllStaff();
      setStaffList(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        error('Lỗi nạp dữ liệu', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin, error]);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  // Handle Create Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.email.trim()) {
      error('Lỗi', 'Vui lòng nhập họ tên và email');
      return;
    }

    setSubmitting(true);
    try {
      await usersApi.createStaff({
        ...createForm,
        password: createForm.password?.trim() ? createForm.password.trim() : undefined,
      });
      success('Thành công', `Đã tạo tài khoản nhân viên "${createForm.fullName}".`);
      setShowCreateModal(false);
      setCreateForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'EMPLOYEE',
        gender: 'MALE',
      });
      fetchStaffList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error('Tạo tài khoản thất bại', err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Staff
  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setSubmitting(true);
    try {
      await usersApi.updateStaff(selectedStaff.id, {
        fullName: editForm.fullName?.trim() || undefined,
        phone: editForm.phone?.trim() || undefined,
        gender: editForm.gender,
        password: editForm.password?.trim() || undefined,
      });
      success('Thành công', `Đã cập nhật thông tin nhân viên "${selectedStaff.fullName}".`);
      setShowEditModal(false);
      setSelectedStaff(null);
      fetchStaffList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error('Cập nhật thất bại', err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Role Change
  const handleChangeRole = async () => {
    if (!selectedStaff) return;
    setSubmitting(true);
    try {
      await usersApi.assignRole(selectedStaff.id, { role: newRole });
      success('Thành công', `Đã đổi vai trò của "${selectedStaff.fullName}" thành ${newRole}.`);
      setShowRoleModal(false);
      setSelectedStaff(null);
      fetchStaffList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error('Đổi vai trò thất bại', err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Toggle (Active / Blocked)
  const handleToggleStatus = async (staff: UserProfile) => {
    if (staff.id === currentUser?.id) {
      info('Cảnh báo', 'Bạn không thể tự khoá tài khoản của mình.');
      return;
    }

    const nextStatus = staff.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const actionLabel = nextStatus === 'BLOCKED' ? 'khoá' : 'mở khoá';

    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} tài khoản "${staff.fullName}"?`)) return;

    try {
      await usersApi.updateStatus(staff.id, { status: nextStatus });
      success('Thành công', `Đã ${actionLabel} tài khoản "${staff.fullName}".`);
      fetchStaffList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error('Lỗi', err.message);
      }
    }
  };

  // Handle Delete Staff
  const handleDeleteStaff = async (staff: UserProfile) => {
    if (staff.id === currentUser?.id) {
      info('Cảnh báo', 'Bạn không thể tự xóa tài khoản của mình.');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${staff.fullName}"?`)) return;

    try {
      await usersApi.deleteStaff(staff.id);
      success('Thành công', `Đã xóa tài khoản "${staff.fullName}".`);
      fetchStaffList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error('Xóa thất bại', err.message);
      }
    }
  };

  // If not admin, block access
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm text-center my-12 max-w-lg mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4 ring-4 ring-amber-500/20">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quyền Truy Cập Bị Giới Hạn</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
          Trang Quản Lý Nhân Sự chỉ dành riêng cho tài khoản có vai trò <strong>Quản Trị Viên (ADMIN)</strong>.
        </p>
        <button
          onClick={() => (window.location.href = '/hotels')}
          className="mt-6 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
        >
          Quay lại danh sách khách sạn
        </button>
      </div>
    );
  }

  // Filter staff list
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery));
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Quản Lý Nhân Viên & Phân Quyền
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Xem danh sách, phân công vai trò và quản lý tài khoản nhân sự hệ thống
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStaffList}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 transition-colors shadow-xs cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Thêm Nhân Viên Mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-brand-500 transition-all font-medium"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 shrink-0">Vai trò:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'EMPLOYEE')}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs text-gray-800 dark:text-gray-200 focus:outline-hidden focus:border-brand-500 font-medium"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản Trị Viên (Admin)</option>
            <option value="EMPLOYEE">Nhân Viên (Employee)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 shrink-0">Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'BLOCKED')}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs text-gray-800 dark:text-gray-200 focus:outline-hidden focus:border-brand-500 font-medium"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="BLOCKED">Đang bị khoá</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Nhân sự</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Vai trò (Role)</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Lần đăng nhập</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh sách nhân viên...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Không tìm thấy nhân viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isCurrent = staff.id === currentUser?.id;
                  const isStaffAdmin = staff.role === 'ADMIN';

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs uppercase shrink-0',
                              isStaffAdmin
                                ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
                                : 'bg-gradient-to-tr from-brand-600 to-indigo-500'
                            )}
                          >
                            {staff.fullName ? staff.fullName.slice(0, 2) : 'NV'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{staff.fullName}</span>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-500/30">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {staff.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {staff.phone || 'Chưa cập nhật'}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border',
                            isStaffAdmin
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30'
                          )}
                        >
                          {isStaffAdmin ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                          )}
                          {isStaffAdmin ? 'Quản Trị Viên (Admin)' : 'Nhân Viên (Employee)'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold',
                            staff.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              staff.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                            )}
                          />
                          {staff.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khoá'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-[11px]">
                        {staff.lastLoginAt
                          ? new Date(staff.lastLoginAt).toLocaleString('vi-VN')
                          : 'Chưa từng đăng nhập'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit info */}
                          <button
                            onClick={() => {
                              setSelectedStaff(staff);
                              setEditForm({
                                fullName: staff.fullName,
                                phone: staff.phone || '',
                                gender: staff.gender || 'MALE',
                                password: '',
                              });
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Change role */}
                          <button
                            onClick={() => {
                              setSelectedStaff(staff);
                              setNewRole(staff.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN');
                              setShowRoleModal(true);
                            }}
                            disabled={isCurrent}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Phân lại vai trò"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>

                          {/* Toggle status (Lock/Unlock) */}
                          <button
                            onClick={() => handleToggleStatus(staff)}
                            disabled={isCurrent}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer',
                              staff.status === 'ACTIVE'
                                ? 'text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-800'
                            )}
                            title={staff.status === 'ACTIVE' ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
                          >
                            {staff.status === 'ACTIVE' ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </button>

                          {/* Delete staff */}
                          <button
                            onClick={() => handleDeleteStaff(staff)}
                            disabled={isCurrent}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Xóa nhân viên"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/30">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Tạo Tài Khoản Nhân Viên Mới
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cấp tài khoản truy cập vào bảng điều khiển
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Họ và tên nhân viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email đăng nhập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="nhanvien@traveleke.vn"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              {/* Phone & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Vai trò (Role)
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value as 'EMPLOYEE' | 'ADMIN' })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 font-medium"
                  >
                    <option value="EMPLOYEE">Nhân Viên (Vận hành)</option>
                    <option value="ADMIN">Quản Trị Viên (Toàn quyền)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Mật khẩu khởi tạo
                </label>
                <input
                  type="text"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Để trống để tự động gán mặc định là 123456789"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-brand-500"
                />
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Nếu để trống, mật khẩu mặc định sẽ là <strong>123456789</strong>.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/30">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Chỉnh Sửa Nhân Viên
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cập nhật thông tin cho {selectedStaff.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="0912345678"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Đổi mật khẩu mới (Nếu không đổi hãy để trống)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE CHANGE MODAL */}
      {showRoleModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-4 ring-amber-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Phân Lại Quyền / Vai Trò
                </h3>
                <p className="text-xs text-gray-500">{selectedStaff.fullName}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Chọn vai trò mới cho nhân sự này trong hệ thống:
            </p>

            <div className="space-y-3 mb-6">
              <label
                onClick={() => setNewRole('EMPLOYEE')}
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer',
                  newRole === 'EMPLOYEE'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 dark:border-indigo-500/40 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                )}
              >
                <UserCheck className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Nhân Viên (Employee)
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Quản lý khách sạn, phòng, duyệt đơn đặt phòng. Không được tạo thêm nhân viên.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setNewRole('ADMIN')}
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer',
                  newRole === 'ADMIN'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 dark:border-amber-500/40 ring-2 ring-amber-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                )}
              >
                <ShieldCheck className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Quản Trị Viên (Admin)
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Toàn bộ quyền hệ thống, quản lý nhân viên, đổi vai trò và cài đặt.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleChangeRole}
                disabled={submitting}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Đang cập nhật...' : 'Xác Nhận Đổi Vai Trò'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
