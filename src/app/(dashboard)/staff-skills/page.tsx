'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  X,
  Star,
  StarOff,
  CheckCircle2,
  AlertTriangle,
  Users,
  Award,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usersApi } from '@/services/api/users.api';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { staffSkillsApi, SkillCategory, StaffSkill, SkillStats } from '@/services/api/staff-skills.api';
import { UserProfile } from '@/types/auth';

// ============================================================
// LEVEL CONFIGURATION
// ============================================================
const LEVEL_CONFIG = [
  { level: 1, label: 'Cơ bản', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', ring: 'ring-gray-300' },
  { level: 2, label: 'Trung cấp', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', ring: 'ring-blue-300' },
  { level: 3, label: 'Thành thạo', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', ring: 'ring-emerald-300' },
  { level: 4, label: 'Chuyên gia', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10', ring: 'ring-violet-300' },
  { level: 5, label: 'Xuất sắc', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', ring: 'ring-amber-300' },
];

function getLevelConfig(level: number) {
  return LEVEL_CONFIG[Math.min(Math.max(level, 1), 5) - 1];
}

// ============================================================
// STAR RATING COMPONENT
// ============================================================
function StarRating({
  level,
  interactive = false,
  onChange,
}: {
  level: number;
  interactive?: boolean;
  onChange?: (level: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || level;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={cn(
            'transition-transform',
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
          )}
        >
          {s <= display ? (
            <Star
              className={cn(
                'h-4 w-4',
                s <= level
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-amber-200 text-amber-200',
              )}
            />
          ) : (
            <StarOff className="h-4 w-4 text-gray-300 dark:text-gray-600" />
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// MODAL: Thêm / Sửa Kỹ Năng Nhân Viên
// ============================================================
function SkillModal({
  skill,
  userId,
  categories,
  onClose,
  onSaved,
}: {
  skill?: StaffSkill | null;
  userId: number;
  categories: SkillCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { success, error } = useToast();
  const [form, setForm] = useState({
    skillId: skill?.skillId ?? (categories[0]?.id ?? 0),
    level: skill?.level ?? 1,
    yearsExp: skill?.yearsExp ?? '',
    certificate: skill?.certificate ?? '',
    note: skill?.note ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skillId) { error('Lỗi', 'Vui lòng chọn kỹ năng'); return; }

    setSubmitting(true);
    try {
      await staffSkillsApi.upsertSkill(userId, {
        skillId: Number(form.skillId),
        level: form.level,
        yearsExp: form.yearsExp ? Number(form.yearsExp) : undefined,
        certificate: form.certificate || undefined,
        note: form.note || undefined,
      });
      success('Thành công', `Đã ${skill ? 'cập nhật' : 'thêm'} kỹ năng`);
      onSaved();
      onClose();
    } catch (err: unknown) {
      error('Lỗi', err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const levelCfg = getLevelConfig(form.level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {skill ? 'Cập nhật kỹ năng' : 'Thêm kỹ năng mới'}
              </h3>
              <p className="text-xs text-gray-500">Hồ sơ năng lực nhân viên</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Danh mục kỹ năng <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.skillId}
              onChange={(e) => setForm({ ...form, skillId: Number(e.target.value) })}
              disabled={!!skill}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mức độ thành thạo
            </label>
            <div className="flex items-center gap-3">
              <StarRating level={form.level} interactive onChange={(l) => setForm({ ...form, level: l })} />
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-lg', levelCfg.bg, levelCfg.color)}>
                {form.level}/5 – {levelCfg.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Số năm kinh nghiệm
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.yearsExp}
                onChange={(e) => setForm({ ...form, yearsExp: e.target.value })}
                placeholder="VD: 2.5"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Chứng chỉ
              </label>
              <input
                type="text"
                value={form.certificate}
                onChange={(e) => setForm({ ...form, certificate: e.target.value })}
                placeholder="Tên chứng chỉ..."
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ghi chú
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              placeholder="Ghi chú về kỹ năng này..."
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              Hủy bỏ
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer">
              {submitting ? 'Đang lưu...' : skill ? 'Cập nhật' : 'Thêm Kỹ Năng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// STAFF SKILL CARD
// ============================================================
function StaffSkillCard({
  staff,
  skills,
  skillCategories,
  isAdmin,
  onAddSkill,
  onEditSkill,
  onRemoveSkill,
  onVerify,
}: {
  staff: UserProfile;
  skills: StaffSkill[];
  skillCategories: SkillCategory[];
  isAdmin: boolean;
  onAddSkill: (staffId: number) => void;
  onEditSkill: (staffId: number, skill: StaffSkill) => void;
  onRemoveSkill: (staffId: number, skillId: number) => void;
  onVerify: (entryId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const avgLevel = skills.length > 0 ? skills.reduce((s, sk) => s + sk.level, 0) / skills.length : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0',
            staff.role === 'ADMIN'
              ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
              : 'bg-gradient-to-tr from-brand-600 to-indigo-500',
          )}>
            {staff.fullName?.slice(0, 2).toUpperCase() ?? 'NV'}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{staff.fullName}</div>
            <div className="text-xs-plus text-gray-400 truncate">{staff.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Avg level badge */}
          {skills.length > 0 && (
            <div className="text-center hidden sm:block">
              <div className="text-xs font-black text-gray-900 dark:text-white">{avgLevel.toFixed(1)}</div>
              <div className="text-2xs text-gray-400">avg level</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs font-black text-gray-900 dark:text-white">{skills.length}</div>
            <div className="text-2xs text-gray-400">kỹ năng</div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Skill chips preview */}
      {!expanded && skills.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((sk) => {
            const cfg = getLevelConfig(sk.level);
            const cat = skillCategories.find((c) => c.id === sk.skillId);
            return (
              <span key={sk.id} className={cn('text-2xs font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                {cat?.name ?? 'Kỹ năng'} {'★'.repeat(sk.level)}
              </span>
            );
          })}
          {skills.length > 4 && (
            <span className="text-2xs text-gray-400 px-2 py-0.5">+{skills.length - 4} khác</span>
          )}
        </div>
      )}

      {/* Expanded Skill List */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          {skills.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              Nhân viên này chưa có kỹ năng nào được gán.
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {skills.map((sk) => {
                const cfg = getLevelConfig(sk.level);
                const cat = skillCategories.find((c) => c.id === sk.skillId);
                return (
                  <div key={sk.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{cat?.name}</span>
                        {sk.verifiedAt && (
                          <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" aria-label="Đã xác nhận" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating level={sk.level} />
                        <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded-md', cfg.bg, cfg.color)}>
                          {cfg.label}
                        </span>
                        {sk.yearsExp && (
                          <span className="text-2xs text-gray-400 flex items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {sk.yearsExp} năm
                          </span>
                        )}
                        {sk.certificate && (
                          <span className="text-2xs text-blue-500 truncate max-w-[120px]">📜 {sk.certificate}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isAdmin && !sk.verifiedAt && (
                        <button
                          onClick={() => onVerify(sk.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          title="Xác nhận kỹ năng"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onEditSkill(Number(staff.id), sk)}
                        className="p-1 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        title="Sửa kỹ năng"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveSkill(Number(staff.id), sk.skillId)}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        title="Xoá kỹ năng"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => onAddSkill(Number(staff.id))}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm kỹ năng cho nhân viên này
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function StaffSkillsPage() {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skillMap, setSkillMap] = useState<Record<string, StaffSkill[]>>({});
  const [stats, setStats] = useState<SkillStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modalStaffId, setModalStaffId] = useState<number | null>(null);
  const [modalSkill, setModalSkill] = useState<StaffSkill | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [staff, cats, st] = await Promise.all([
        usersApi.getAllStaff(),
        staffSkillsApi.getCategories(),
        staffSkillsApi.getStats(),
      ]);
      setStaffList(staff);
      setSkillCategories(cats);
      setStats(st);

      // Fetch skills for each staff
      const map: Record<string, StaffSkill[]> = {};
      await Promise.all(
        staff.map(async (s: UserProfile) => {
          try {
            map[String(s.id)] = await staffSkillsApi.getSkillsByUser(Number(s.id));
          } catch {
            map[String(s.id)] = [];
          }
        }),
      );
      setSkillMap(map);
    } catch (err: unknown) {
      error('Lỗi tải dữ liệu', err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAddSkill = (staffId: number) => {
    setModalStaffId(staffId);
    setModalSkill(null);
    setShowModal(true);
  };

  const handleEditSkill = (staffId: number, skill: StaffSkill) => {
    setModalStaffId(staffId);
    setModalSkill(skill);
    setShowModal(true);
  };

  const handleRemoveSkill = async (staffId: number, skillId: number) => {
    if (!confirm('Xoá kỹ năng này khỏi hồ sơ nhân viên?')) return;
    try {
      await staffSkillsApi.removeSkill(staffId, skillId);
      success('Đã xoá', 'Kỹ năng đã được xoá khỏi hồ sơ');
      fetchAll();
    } catch (err: unknown) {
      error('Lỗi', err instanceof Error ? err.message : 'Không thể xoá kỹ năng');
    }
  };

  const handleVerify = async (entryId: number) => {
    try {
      await staffSkillsApi.verifySkill(entryId);
      success('Đã xác nhận', 'Kỹ năng đã được xác nhận bởi Admin');
      fetchAll();
    } catch (err: unknown) {
      error('Lỗi', err instanceof Error ? err.message : 'Không thể xác nhận');
    }
  };

  const filteredStaff = staffList.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Hồ Sơ Năng Lực Nhân Sự
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Skill map & thang năng lực 1-5 cho từng nhân viên
            </p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-xs cursor-pointer"
          title="Làm mới"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Danh mục kỹ năng', value: stats.totalSkillCategories, icon: Award, color: 'amber' },
            { label: 'NV có hồ sơ', value: stats.staffWithSkills, icon: Users, color: 'blue' },
            { label: 'Avg Level', value: stats.averageSkillLevel, icon: TrendingUp, color: 'emerald' },
            { label: 'Kỹ năng hot', value: stats.topSkill ?? '–', icon: Zap, color: 'violet', isText: true },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs"
            >
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl mb-3',
                item.color === 'amber' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                item.color === 'blue' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                item.color === 'emerald' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                item.color === 'violet' && 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
              )}>
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <p className={cn(
                'font-black text-gray-900 dark:text-white',
                (item as { isText?: boolean }).isText ? 'text-sm leading-snug' : 'text-2xl',
              )}>
                {item.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhân viên theo tên hoặc email..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải hồ sơ năng lực...</span>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Users className="h-12 w-12 text-gray-300" />
          <p className="text-sm">Không tìm thấy nhân viên nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStaff.map((s) => (
            <StaffSkillCard
              key={s.id}
              staff={s}
              skills={skillMap[String(s.id)] ?? []}
              skillCategories={skillCategories}
              isAdmin={isAdmin}
              onAddSkill={handleAddSkill}
              onEditSkill={handleEditSkill}
              onRemoveSkill={handleRemoveSkill}
              onVerify={handleVerify}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && modalStaffId !== null && (
        <SkillModal
          skill={modalSkill}
          userId={modalStaffId}
          categories={skillCategories}
          onClose={() => { setShowModal(false); setModalStaffId(null); setModalSkill(null); }}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
