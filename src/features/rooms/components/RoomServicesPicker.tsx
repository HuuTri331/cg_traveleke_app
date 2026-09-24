'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { servicesApi, ServiceCategory, RoomService } from '@/services/api/services.api';
import {
  Check,
  Sparkles,
  Plus,
  CheckSquare,
  Square,
  Search,
  ShieldCheck,
  Shirt,
  Utensils,
  Heart,
  Car,
  Star,
  Wifi,
  Baby,
  UtensilsCrossed,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  HOUSEKEEPING: Sparkles,
  LAUNDRY: Shirt,
  FOOD_BEVERAGE: Utensils,
  SPA_WELLNESS: Heart,
  TRANSPORT: Car,
  CONCIERGE: Star,
  TECH_SUPPORT: Wifi,
  CHILDCARE: Baby,
  FOODFAST: UtensilsCrossed,
};

function formatPrice(val: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

export interface RoomServicesPickerProps {
  selectedServiceIds: number[];
  onChange: (ids: number[]) => void;
  defaultCheckComplimentary?: boolean;
}

export function RoomServicesPicker({
  selectedServiceIds,
  onChange,
  defaultCheckComplimentary = false,
}: RoomServicesPickerProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<RoomService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<number | 'ALL'>('ALL');
  const [hasInitializedDefaults, setHasInitializedDefaults] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [cats, svcs] = await Promise.all([
          servicesApi.getCategories(true),
          servicesApi.getRoomServices(),
        ]);
        if (!mounted) return;
        setCategories(cats.filter((c) => c.status === 'ACTIVE'));
        setServices(svcs.filter((s) => s.status === 'ACTIVE'));

        // Nếu là tạo phòng mới và chưa có dịch vụ nào được chọn, tự động tích chọn toàn bộ dịch vụ MIỄN PHÍ mặc định
        if (defaultCheckComplimentary && !hasInitializedDefaults && selectedServiceIds.length === 0) {
          const freeIds = svcs
            .filter((s) => s.status === 'ACTIVE' && s.isComplimentary)
            .map((s) => s.id);
          onChange(freeIds);
          setHasInitializedDefaults(true);
        }
      } catch (err) {
        console.error('Failed to load room services in picker:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [defaultCheckComplimentary, hasInitializedDefaults, onChange, selectedServiceIds.length]);

  const selectedSet = useMemo(() => new Set(selectedServiceIds), [selectedServiceIds]);

  const toggleService = (id: number) => {
    const next = new Set(selectedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(Array.from(next));
  };

  const selectAllFree = () => {
    const freeIds = services.filter((s) => s.isComplimentary).map((s) => s.id);
    const next = new Set([...selectedServiceIds, ...freeIds]);
    onChange(Array.from(next));
  };

  const selectAll = () => {
    onChange(services.map((s) => s.id));
  };

  const deselectAll = () => {
    onChange([]);
  };

  // Lọc dịch vụ theo search và category
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat =
        selectedCategoryTab === 'ALL' || s.categoryId === selectedCategoryTab;
      return matchSearch && matchCat;
    });
  }, [services, searchQuery, selectedCategoryTab]);

  // Nhóm dịch vụ theo category
  const groupedByCategory = useMemo(() => {
    const map = new Map<number, { category: ServiceCategory; items: RoomService[] }>();

    for (const s of filteredServices) {
      const cat = categories.find((c) => c.id === s.categoryId) || {
        id: s.categoryId,
        code: 'OTHER',
        name: 'Dịch vụ khác',
        description: null,
        icon: 'Sparkles',
        sortOrder: 99,
        status: 'ACTIVE' as const,
        createdAt: '',
      };

      if (!map.has(s.categoryId)) {
        map.set(s.categoryId, { category: cat, items: [] });
      }
      map.get(s.categoryId)!.items.push(s);
    }

    return Array.from(map.values());
  }, [filteredServices, categories]);

  const freeCount = services.filter((s) => selectedSet.has(s.id) && s.isComplimentary).length;
  const paidCount = services.filter((s) => selectedSet.has(s.id) && !s.isComplimentary).length;

  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent mb-2" />
        <p>Đang tải danh mục và dịch vụ phòng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50 p-4">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-200/80 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white text-xs shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Dịch vụ & Tiện ích kèm theo phòng
            </label>
          </div>
          <p className="text-xs-plus text-gray-500 dark:text-gray-400 mt-0.5">
            Dịch vụ miễn phí mặc định có sẵn & Dịch vụ thu thêm phí (Add-on)
          </p>
        </div>

        {/* Counter badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs-plus font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            {freeCount} Miễn phí
          </span>
          <span className="inline-flex items-center gap-1 text-xs-plus font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
            <Plus className="h-3 w-3 text-violet-600" />
            {paidCount} Thu phí
          </span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={selectAllFree}
            className="flex items-center gap-1.5 text-xs-plus font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Chọn tất cả dịch vụ miễn phí</span>
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs-plus font-semibold px-2 py-1 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
          >
            Chọn tất cả
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs-plus font-semibold px-2 py-1 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-rose-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
          >
            Bỏ chọn hết
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm dịch vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategoryTab('ALL')}
          className={cn(
            'text-xs-plus font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer',
            selectedCategoryTab === 'ALL'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50',
          )}
        >
          Tất cả ({services.length})
        </button>
        {categories.map((cat) => {
          const count = services.filter((s) => s.categoryId === cat.id).length;
          if (count === 0) return null;
          const isSelected = selectedCategoryTab === cat.id;
          const CatIcon = CATEGORY_ICONS[cat.code] || Package;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryTab(cat.id)}
              className={cn(
                'text-xs-plus font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5',
                isSelected
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50',
              )}
            >
              <CatIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{cat.name}</span>
              <span className="opacity-70 text-2xs">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Grouped Services List */}
      <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
        {groupedByCategory.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
            Không tìm thấy dịch vụ nào phù hợp.
          </div>
        ) : (
          groupedByCategory.map(({ category, items }) => {
            const CatIcon = CATEGORY_ICONS[category.code] || Package;
            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <CatIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{category.name}</span>
                  <span className="text-2xs text-gray-400 font-normal">({items.length} dịch vụ)</span>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((svc) => {
                  const isChecked = selectedSet.has(svc.id);
                  return (
                    <div
                      key={svc.id}
                      onClick={() => toggleService(svc.id)}
                      className={cn(
                        'flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-left',
                        isChecked
                          ? svc.isComplimentary
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                            : 'bg-violet-50/80 dark:bg-violet-950/20 border-violet-300 dark:border-violet-800/80 shadow-xs'
                          : 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600',
                      )}
                    >
                      {/* Checkbox Icon */}
                      <div
                        className={cn(
                          'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border mt-0.5 transition-colors',
                          isChecked
                            ? svc.isComplimentary
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-violet-500 border-violet-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                        )}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {svc.name}
                          </span>
                          {svc.isComplimentary ? (
                            <span className="shrink-0 text-2xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              Miễn phí
                            </span>
                          ) : (
                            <span className="shrink-0 text-2xs font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                              {formatPrice(svc.basePrice)}/{svc.unit || 'lần'}
                            </span>
                          )}
                        </div>

                        {svc.description && (
                          <p className="text-xs-plus text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {svc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
