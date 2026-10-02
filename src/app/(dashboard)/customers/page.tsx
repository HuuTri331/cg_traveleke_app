'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Eye,
  UserCheck,
  ShieldAlert,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usersApi } from '@/services/api/users.api';
import { UserProfile } from '@/types/auth';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

const BACKEND_URL = 'http://localhost:3001';

const getAvatarUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

export default function CustomersManagementPage() {
  const { user: currentUser } = useAuth();
  const { success, error, info } = useToast();

  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');

  // Modal detail state
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Fetch customers
  const fetchCustomers = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await usersApi.getAllCustomers();
      setCustomers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        error('Lỗi nạp dữ liệu', err.message);
      } else {
        error('Lỗi', 'Không thể tải danh sách khách hàng.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [error]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle Toggle Customer Status (ACTIVE <-> BLOCKED)
  const handleToggleStatus = async (customer: UserProfile) => {
    const nextStatus = customer.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const actionLabel = nextStatus === 'BLOCKED' ? 'khoá' : 'mở khoá';

    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} tài khoản khách hàng "${customer.fullName}" không?`)) {
      return;
    }

    setStatusUpdatingId(customer.id);
    try {
      await usersApi.updateCustomerStatus(customer.id, { status: nextStatus });
      success('Thành công', `Đã ${actionLabel} tài khoản khách hàng thành công.`);
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, status: nextStatus } : c))
      );
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error('Thao tác thất bại', err.message);
      }
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.fullName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.phone && c.phone.includes(query)) ||
        (c.address && c.address.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === 'ALL' || c.status === statusFilter;

      const matchesVerified =
        verifiedFilter === 'ALL' ||
        (verifiedFilter === 'VERIFIED' && c.isEmailVerified) ||
        (verifiedFilter === 'UNVERIFIED' && !c.isEmailVerified);

      return matchesSearch && matchesStatus && matchesVerified;
    });
  }, [customers, searchQuery, statusFilter, verifiedFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === 'ACTIVE').length;
    const blocked = customers.filter((c) => c.status === 'BLOCKED').length;
    const verified = customers.filter((c) => c.isEmailVerified).length;
    return { total, active, blocked, verified };
  }, [customers]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Chưa có dữ liệu';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Quản Lý Khách Hàng
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Theo dõi lượng khách hàng, hồ sơ cá nhân và quản lý tài khoản đặt phòng trong hệ thống
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchCustomers(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <RefreshCw className={cn('h-4 w-4 text-blue-600 dark:text-blue-400', refreshing && 'animate-spin')} />
          Làm mới
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Tổng Khách Hàng</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{metrics.total}</span>
            <span className="text-xs font-semibold text-gray-400">tài khoản</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Đã Xác Thực Email</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">{metrics.verified}</span>
            <span className="text-xs font-semibold text-gray-400">chính chủ</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Đang Hoạt Động</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{metrics.active}</span>
            <span className="text-xs font-semibold text-gray-400">bình thường</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Tài Khoản Bị Khóa</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">{metrics.blocked}</span>
            <span className="text-xs font-semibold text-gray-400">đang bị chặn</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo họ tên, email, số điện thoại, địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="BLOCKED">Đã khóa</option>
          </select>

          {/* Email verification filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value as any)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">Tất cả email</option>
            <option value="VERIFIED">Đã xác thực</option>
            <option value="UNVERIFIED">Chưa xác thực</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Đang nạp danh sách khách hàng...
            </span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-3">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Không tìm thấy khách hàng nào
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              {searchQuery
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.'
                : 'Chưa có khách hàng nào đăng ký trong hệ thống.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/75 dark:bg-gray-900/40 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-4">Khách Hàng</th>
                  <th className="px-5 py-4">Liên Hệ</th>
                  <th className="px-5 py-4">Thông Tin Cá Nhân</th>
                  <th className="px-5 py-4">Xác Thực</th>
                  <th className="px-5 py-4">Trạng Thái</th>
                  <th className="px-5 py-4">Ngày Đăng Ký</th>
                  <th className="px-5 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCustomers.map((customer) => {
                  const avatarUrl = getAvatarUrl(customer.avatarUrl);
                  const isUpdating = statusUpdatingId === customer.id;

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-750 transition"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={customer.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              customer.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white hover:text-blue-600 transition">
                              {customer.fullName}
                            </div>
                            <div className="text-xs text-gray-400">ID: #{customer.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                            <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[200px]">{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Personal Info */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                            <span className="font-semibold text-gray-400">Giới tính:</span>
                            <span>
                              {customer.gender === 'MALE'
                                ? 'Nam'
                                : customer.gender === 'FEMALE'
                                ? 'Nữ'
                                : 'Chưa cập nhật'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{formatDate(customer.dateOfBirth)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email Verified Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {customer.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Đã xác thực
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                            <XCircle className="h-3.5 w-3.5" />
                            Chưa xác thực
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {customer.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-950/40 px-2.5 py-1 text-xs font-bold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/40 px-2.5 py-1 text-xs font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                            Đã khóa
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(customer.createdAt)}
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition"
                            title="Xem chi tiết khách hàng"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(customer)}
                            disabled={isUpdating}
                            className={cn(
                              'rounded-lg p-2 transition',
                              customer.status === 'ACTIVE'
                                ? 'text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400'
                            )}
                            title={customer.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {isUpdating ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                            ) : customer.status === 'ACTIVE' ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </button>
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

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700/70 pb-5">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
                {getAvatarUrl(selectedCustomer.avatarUrl) ? (
                  <img
                    src={getAvatarUrl(selectedCustomer.avatarUrl)!}
                    alt={selectedCustomer.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  selectedCustomer.fullName.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCustomer.fullName}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                    Khách Hàng (CUSTOMER)
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-bold',
                      selectedCustomer.status === 'ACTIVE'
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                    )}
                  >
                    {selectedCustomer.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Information List */}
            <div className="mt-5 space-y-3.5 text-sm">
              <div className="flex items-start justify-between rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>Email:</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedCustomer.email}
                  </span>
                  {selectedCustomer.isEmailVerified && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="Đã xác thực" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <span>Số điện thoại:</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedCustomer.phone || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span>Ngày sinh & Giới tính:</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(selectedCustomer.dateOfBirth)} (
                  {selectedCustomer.gender === 'MALE'
                    ? 'Nam'
                    : selectedCustomer.gender === 'FEMALE'
                    ? 'Nữ'
                    : 'Chưa rõ'}
                  )
                </span>
              </div>

              <div className="flex items-start justify-between rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium shrink-0">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>Địa chỉ:</span>
                </div>
                <span className="font-semibold text-right text-gray-900 dark:text-white max-w-[280px]">
                  {selectedCustomer.address || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <span>Đăng nhập lần cuối:</span>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {formatDateTime(selectedCustomer.lastLoginAt)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => handleToggleStatus(selectedCustomer)}
                disabled={statusUpdatingId === selectedCustomer.id}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition',
                  selectedCustomer.status === 'ACTIVE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {selectedCustomer.status === 'ACTIVE' ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Khóa tài khoản
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    Mở khóa tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
