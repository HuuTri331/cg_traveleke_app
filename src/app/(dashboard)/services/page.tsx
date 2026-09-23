'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  Package,
  Tag,
  DollarSign,
  WifiOff,
  Star,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import {
  servicesApi,
  ServiceCategory,
  RoomService,
  ServiceStats,
} from '@/services/api/services.api';

// ============================================================
// LEVEL LABELS & ICON MAP
// ============================================================
const ICON_OPTIONS = [
  { value: 'Sparkles', label: '✨ Dọn Phòng' },
  { value: 'WashingMachine', label: '👕 Giặt Ủi' },
  { value: 'UtensilsCrossed', label: '🍽️ Ăn Uống Tại Phòng' },
  { value: 'Heart', label: '💆 Spa & Massage' },
  { value: 'Car', label: '🚗 Vận Chuyển' },
  { value: 'Star', label: '⭐ Hỗ Trợ Đặc Biệt' },
  { value: 'Wifi', label: '📶 Hỗ Trợ Kỹ Thuật' },
  { value: 'Baby', label: '👶 Chăm Sóc Trẻ Em' },
];

function formatTitleCase(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function slugifyCategoryCode(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCategoryIcon(icon: string | null): string {
  const map: Record<string, string> = {
    Sparkles: '✨',
    WashingMachine: '👕',
    UtensilsCrossed: '🍽️',
    Heart: '💆',
    Car: '🚗',
    Star: '⭐',
    Wifi: '📶',
    Baby: '👶',
    Hotel: '🏨',
    Shield: '🛡️',
  };
  return map[icon ?? ''] ?? '🔧';
}

// ============================================================
// MODAL: Tạo / Sửa Danh Mục Dịch Vụ
// ============================================================
function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category?: ServiceCategory | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { success, error } = useToast();
  const [form, setForm] = useState({
    code: category?.code ?? '',
    name: category?.name ?? '',
    description: category?.description ?? '',
    icon: category?.icon ?? 'Sparkles',
    sortOrder: category?.sortOrder ?? 0,
    status: category?.status ?? 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedName = formatTitleCase(form.name);
    const formattedCode = form.code.trim().toUpperCase() || slugifyCategoryCode(formattedName);

    if (!formattedName || !formattedCode) {
      error('Lỗi', 'Vui lòng nhập mã và tên danh mục');
      return;
    }
    setSubmitting(true);
    try {
      if (category?.id) {
        await servicesApi.updateCategory(category.id, {
          name: formattedName,
          description: form.description?.trim() || undefined,
          icon: form.icon,
          sortOrder: form.sortOrder,
          status: form.status as 'ACTIVE' | 'INACTIVE',
        });
        success('Cập nhật thành công', `Đã cập nhật danh mục "${formattedName}"`);
      } else {
        await servicesApi.createCategory({
          code: formattedCode,
          name: formattedName,
          description: form.description?.trim() || undefined,
          icon: form.icon,
          sortOrder: form.sortOrder,
        });
        success('Tạo thành công', `Đã tạo danh mục "${formattedName}"`);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      error('Lỗi', err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white shadow-md shadow-violet-500/30">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {category?.id ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {category?.id ? `Cập nhật thông tin danh mục` : 'Tạo nhóm dịch vụ phòng mới'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mã danh mục <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '') })}
                disabled={!!category?.id}
                placeholder="VD: HOUSEKEEPING"
                spellCheck={false}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 disabled:opacity-50 font-mono tracking-wider"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Biểu tượng
              </label>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tên danh mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  name: val,
                  code: !category?.id && (!prev.code || prev.code === slugifyCategoryCode(prev.name)) ? slugifyCategoryCode(val) : prev.code,
                }));
              }}
              onBlur={() => setForm((prev) => ({ ...prev, name: formatTitleCase(prev.name) }))}
              placeholder="VD: Dọn Phòng & Vệ Sinh"
              spellCheck={false}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              spellCheck={false}
              placeholder="Mô tả ngắn về nhóm dịch vụ này..."
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 resize-none font-normal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            {category?.id && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Đang lưu...' : category?.id ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// MODAL: Tạo / Sửa Dịch Vụ Phòng
// ============================================================
function RoomServiceModal({
  service,
  categories,
  onClose,
  onSaved,
}: {
  service?: RoomService | null;
  categories: ServiceCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { success, error } = useToast();
  const [form, setForm] = useState({
    categoryId: service?.categoryId ?? (categories[0]?.id ?? 0),
    name: service?.name ?? '',
    description: service?.description ?? '',
    unit: service?.unit ?? 'lần',
    basePrice: service?.basePrice ?? 0,
    isComplimentary: service?.isComplimentary ?? false,
    maxQuantity: service?.maxQuantity ?? '',
    status: service?.status ?? 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedName = formatTitleCase(form.name);
    if (!formattedName) {
      error('Lỗi', 'Vui lòng nhập tên dịch vụ');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        categoryId: Number(form.categoryId),
        name: formattedName,
        description: form.description?.trim() || undefined,
        unit: form.unit.trim() || 'lần',
        basePrice: form.isComplimentary ? 0 : Number(form.basePrice),
        isComplimentary: form.isComplimentary,
        maxQuantity: form.maxQuantity ? Number(form.maxQuantity) : undefined,
      };
      if (service?.id) {
        await servicesApi.updateRoomService(service.id, { ...payload, status: form.status as 'ACTIVE' | 'INACTIVE' });
        success('Cập nhật thành công', `Đã cập nhật dịch vụ "${formattedName}"`);
      } else {
        await servicesApi.createRoomService(payload);
        success('Tạo thành công', `Đã thêm dịch vụ "${formattedName}"`);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      error('Lỗi', err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {service?.id ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gán dịch vụ cho phòng hoặc toàn khách sạn
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Danh mục <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryIcon(cat.icon)} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tên dịch vụ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() => setForm((prev) => ({ ...prev, name: formatTitleCase(prev.name) }))}
              placeholder="VD: Dọn Phòng Buổi Sáng, Giặt Ủi Theo Kg..."
              spellCheck={false}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mô tả dịch vụ
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              spellCheck={false}
              placeholder="Mô tả chi tiết về dịch vụ..."
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Đơn vị tính
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="lần, ngày, giờ..."
                spellCheck={false}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['lần', 'giờ', 'ngày', 'phần', 'kg'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setForm({ ...form, unit: u })}
                    className={cn(
                      'text-2xs px-1.5 py-0.5 rounded border transition-colors cursor-pointer',
                      form.unit === u
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-100',
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Giá (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                disabled={form.isComplimentary}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 disabled:opacity-40"
              />
              <div className="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                {form.isComplimentary ? 'Miễn phí' : formatPrice(form.basePrice || 0)}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tối đa / lần
              </label>
              <input
                type="number"
                min={1}
                value={form.maxQuantity}
                onChange={(e) => setForm({ ...form, maxQuantity: e.target.value })}
                placeholder="Không giới hạn"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setForm({ ...form, isComplimentary: !form.isComplimentary, basePrice: 0 })}
                className={cn(
                  'relative w-10 h-5.5 rounded-full transition-colors',
                  form.isComplimentary ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                    form.isComplimentary ? 'translate-x-4.5' : 'translate-x-0',
                  )}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Dịch vụ miễn phí (Complimentary)
              </span>
            </label>
          </div>

          {service?.id && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ACTIVE">Đang cung cấp</option>
                <option value="INACTIVE">Tạm ngưng</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Đang lưu...' : service?.id ? 'Lưu Thay Đổi' : 'Thêm Dịch Vụ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function ServicesManagementPage() {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  // Data
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [roomServices, setRoomServices] = useState<RoomService[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'categories' | 'services'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'ALL'>('ALL');

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editCategory, setEditCategory] = useState<ServiceCategory | null>(null);
  const [editService, setEditService] = useState<RoomService | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, svcs, st] = await Promise.all([
        servicesApi.getCategories(true),
        servicesApi.getRoomServices(),
        servicesApi.getStats(),
      ]);
      setCategories(cats);
      setRoomServices(svcs);
      setStats(st);
    } catch (err: unknown) {
      error('Lỗi tải dữ liệu', err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDeleteCategory = async (cat: ServiceCategory) => {
    if (!confirm(`Xoá danh mục "${cat.name}"? Tất cả dịch vụ thuộc danh mục này sẽ bị ảnh hưởng.`)) return;
    try {
      await servicesApi.deleteCategory(cat.id);
      success('Đã xoá', `Danh mục "${cat.name}" đã được xoá`);
      fetchAll();
    } catch (err: unknown) {
      error('Lỗi', err instanceof Error ? err.message : 'Không thể xoá');
    }
  };

  const handleDeleteService = async (svc: RoomService) => {
    if (!confirm(`Xoá dịch vụ "${svc.name}"?`)) return;
    try {
      await servicesApi.deleteRoomService(svc.id);
      success('Đã xoá', `Dịch vụ "${svc.name}" đã được xoá`);
      fetchAll();
    } catch (err: unknown) {
      error('Lỗi', err instanceof Error ? err.message : 'Không thể xoá');
    }
  };

  // Filter logic
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredServices = roomServices.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || s.categoryId === categoryFilter;
    return matchSearch && matchCat;
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm text-center my-12 max-w-lg mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4 ring-4 ring-amber-500/20">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quyền Truy Cập Bị Giới Hạn</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
          Trang Quản Lý Dịch Vụ chỉ dành cho tài khoản <strong>Quản Trị Viên (ADMIN)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Quản Lý Dịch Vụ Phòng
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Danh mục & dịch vụ cung cấp trong hệ thống khách sạn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-xs cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
          <button
            onClick={() => {
              if (activeTab === 'categories') {
                setEditCategory(null);
                setShowCategoryModal(true);
              } else {
                setEditService(null);
                setShowServiceModal(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{activeTab === 'categories' ? 'Thêm Danh Mục' : 'Thêm Dịch Vụ'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Danh mục', value: stats.totalCategories, icon: Tag, color: 'violet' },
            { label: 'Dịch vụ', value: stats.totalServices, icon: Package, color: 'emerald' },
            { label: 'Yêu cầu', value: stats.totalRequests, icon: Layers, color: 'blue' },
            { label: 'Đang chờ', value: stats.pendingRequests, icon: AlertTriangle, color: 'amber' },
            { label: 'Hoàn thành', value: stats.completedRequests, icon: CheckCircle2, color: 'green' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs"
            >
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl mb-3',
                item.color === 'violet' && 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                item.color === 'emerald' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                item.color === 'blue' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                item.color === 'amber' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                item.color === 'green' && 'bg-green-500/10 text-green-600 dark:text-green-400',
              )}>
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Switcher & Search */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('categories')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === 'categories'
                  ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              )}
            >
              <Tag className="h-3.5 w-3.5" />
              Danh mục ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === 'services'
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              )}
            >
              <Package className="h-3.5 w-3.5" />
              Dịch vụ ({roomServices.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'categories' ? 'Tìm danh mục...' : 'Tìm dịch vụ...'}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-all font-medium"
            />
          </div>

          {/* Category filter (only for services tab) */}
          {activeTab === 'services' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{getCategoryIcon(c.icon)} {c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 font-bold uppercase tracking-wider text-2xs">
                <tr>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Mã</th>
                  <th className="px-6 py-4">Số dịch vụ</th>
                  <th className="px-6 py-4">Thứ tự</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải danh mục...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Không tìm thấy danh mục nào.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const svcCount = roomServices.filter((s) => s.categoryId === cat.id).length;
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-lg">
                              {getCategoryIcon(cat.icon)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">{cat.name}</div>
                              {cat.description && (
                                <p className="text-xs-plus text-gray-400 mt-0.5 max-w-[200px] truncate">{cat.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs-plus bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-gray-600 dark:text-gray-300 font-mono">
                            {cat.code}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300">
                            <Package className="h-3 w-3 text-gray-400" />
                            {svcCount} dịch vụ
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{cat.sortOrder}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold',
                            cat.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                          )}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', cat.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400')} />
                            {cat.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ẩn'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setEditCategory(cat); setShowCategoryModal(true); }}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              title="Xoá"
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
      )}

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 font-bold uppercase tracking-wider text-2xs">
                <tr>
                  <th className="px-6 py-4">Dịch vụ</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Đơn vị</th>
                  <th className="px-6 py-4">Giá</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải dịch vụ...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <WifiOff className="h-10 w-10 text-gray-300" />
                        <p>Không tìm thấy dịch vụ nào phù hợp.</p>
                        <button
                          onClick={() => { setEditService(null); setShowServiceModal(true); }}
                          className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
                        >
                          + Thêm dịch vụ mới
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((svc) => {
                    const cat = categories.find((c) => c.id === svc.categoryId);
                    return (
                      <tr key={svc.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{svc.name}</div>
                          {svc.description && (
                            <p className="text-xs-plus text-gray-400 mt-0.5 max-w-[220px] truncate">{svc.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {cat && (
                            <span className="inline-flex items-center gap-1 text-xs-plus font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full">
                              {getCategoryIcon(cat.icon)} {cat.name}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{svc.unit}</td>
                        <td className="px-6 py-4">
                          {svc.isComplimentary ? (
                            <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <Star className="h-3 w-3" /> Miễn phí
                            </span>
                          ) : (
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                              {formatPrice(Number(svc.basePrice))}
                            </span>
                          )}
                          {svc.maxQuantity && (
                            <p className="text-2xs text-gray-400 mt-0.5">Tối đa: {svc.maxQuantity}/{svc.unit}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold',
                            svc.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                          )}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', svc.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400')} />
                            {svc.status === 'ACTIVE' ? 'Đang cung cấp' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setEditService(svc); setShowServiceModal(true); }}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(svc)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              title="Xoá"
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
      )}

      {/* MODALS */}
      {showCategoryModal && (
        <CategoryModal
          category={editCategory}
          onClose={() => { setShowCategoryModal(false); setEditCategory(null); }}
          onSaved={fetchAll}
        />
      )}
      {showServiceModal && (
        <RoomServiceModal
          service={editService}
          categories={categories.filter((c) => c.status === 'ACTIVE')}
          onClose={() => { setShowServiceModal(false); setEditService(null); }}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
