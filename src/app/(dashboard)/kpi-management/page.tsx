'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Building,
  User,
  Sliders,
  Check,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import {
  staffKpiApi,
  StaffKpiPeriodScoreItem,
} from '@/services/api/staff-kpi.api';
import { hotelsApi } from '@/services/api/hotels.api';
import { hotelStaffApi } from '@/services/api/hotel-staff.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';

export default function KpiManagementPage() {
  const { user, isAdmin } = useAuth();
  const [hotelId, setHotelId] = useState<string>('');
  const [hotelOptions, setHotelOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [periodKey, setPeriodKey] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [scores, setScores] = useState<StaffKpiPeriodScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal điều chỉnh / Rubric 10đ của Quản lý
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [metricCode, setMetricCode] = useState<string>('MANAGER_EVALUATION');
  const [delta, setDelta] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [evidenceRef, setEvidenceRef] = useState<string>('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    const loadManagedHotels = async () => {
      try {
        if (isAdmin) {
          const res = await hotelsApi.getAll({ perPage: 100 });
          if (res.data && res.data.length > 0) {
            const list = res.data.map((h: any) => ({ id: String(h.id), name: h.name }));
            setHotelOptions(list);
            setHotelId(list[0].id);
            return;
          }
        }
        const staffRes = await hotelStaffApi.getAll();
        if (staffRes.data && Array.isArray(staffRes.data)) {
          const myManaged = staffRes.data.filter(
            (s: any) =>
              String(s.staffUserId) === String(user?.id) &&
              s.status === 'ACTIVE' &&
              (isAdmin || s.staffRole === 'MANAGER'),
          );
          const listSource = myManaged.length > 0 ? myManaged : staffRes.data.filter((s: any) => String(s.staffUserId) === String(user?.id));
          if (listSource.length > 0) {
            const list = listSource.map((s: any) => ({
              id: String(s.hotelId),
              name: s.hotelName || `Khách sạn #${s.hotelId}`,
            }));
            setHotelOptions(list);
            setHotelId(list[0].id);
            return;
          }
        }
      } catch {
        // Fallback
      }
      setHotelId('');
    };
    loadManagedHotels();
  }, [user?.id, isAdmin]);

  useEffect(() => {
    if (hotelId) {
      fetchScores();
    }
  }, [hotelId, periodKey]);

  const fetchScores = async () => {
    try {
      setLoading(true);
      setActionError(null);
      const res = await staffKpiApi.getHotelKpis(hotelId, periodKey);
      setScores(res);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Không thể tải danh sách KPI khách sạn');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (staffId?: string) => {
    try {
      setActionError(null);
      setActionSuccess(null);
      await staffKpiApi.recalculateKpi(hotelId, periodKey, staffId);
      setActionSuccess(
        staffId
          ? `Đã tính toán lại điểm KPI cho nhân sự #${staffId}`
          : `Đã tính toán lại toàn bộ điểm KPI cho kỳ ${periodKey}`,
      );
      await fetchScores();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Không thể tính lại điểm KPI');
    }
  };

  const handleApprovePeriod = async () => {
    const confirmApprove = window.confirm(
      `Bạn có chắc chắn muốn phê duyệt toàn bộ bảng điểm KPI kỳ ${periodKey} của khách sạn này không?`,
    );
    if (!confirmApprove) return;

    try {
      setActionError(null);
      setActionSuccess(null);
      const res = await staffKpiApi.approvePeriod(hotelId, periodKey, 'Phê duyệt định kỳ hàng tháng');
      setActionSuccess(res.message);
      await fetchScores();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Không thể phê duyệt kỳ KPI');
    }
  };

  const handleOpenAdjustModal = (staffId: string) => {
    setSelectedStaffId(staffId);
    setDelta(1);
    setAdjustReason('');
    setAdjustModalOpen(true);
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustReason.trim()) {
      alert('Vui lòng nhập lý do điều chỉnh điểm');
      return;
    }

    try {
      setAdjusting(true);
      await staffKpiApi.requestAdjustment(hotelId, {
        staffUserId: selectedStaffId,
        periodKey,
        metricCode,
        delta: Number(delta),
        reason: adjustReason.trim(),
      });
      setActionSuccess(`Đã điều chỉnh ${delta > 0 ? '+' : ''}${delta} điểm cho nhân sự #${selectedStaffId}`);
      setAdjustModalOpen(false);
      await fetchScores();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể điều chỉnh điểm');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-blue-600" />
            Quản lý & Phê duyệt KPI Nhân viên (Đợt 5)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bảng điều hành đánh giá năng lực, phê duyệt kỳ KPI và điều chỉnh điểm kèm minh chứng kiểm toán
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="month"
              value={periodKey}
              onChange={(e) => setPeriodKey(e.target.value)}
              className="outline-none text-sm font-medium text-gray-700 bg-transparent"
            />
          </div>

          <Button
            onClick={() => handleRecalculate()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Tính lại kỳ này
          </Button>

          <Button
            onClick={handleApprovePeriod}
            size="sm"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4" />
            Phê duyệt kỳ KPI
          </Button>
        </div>
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

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">
            Danh sách điểm nhân sự kỳ {periodKey} ({scores.length} nhân viên)
          </span>
          <Button onClick={fetchScores} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Đang tải bảng xếp hạng KPI...</div>
        ) : scores.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            Chưa có nhân viên nào phát sinh dữ liệu KPI trong kỳ này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Nhân sự</th>
                  <th className="px-3 py-3 text-center">Tổng điểm (100đ)</th>
                  <th className="px-3 py-3 text-center">Độ phủ dữ liệu</th>
                  <th className="px-3 py-3 text-center">Số mẫu đánh giá</th>
                  <th className="px-3 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scores.map((sc) => (
                  <tr key={sc.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        Nhân viên #{sc.staffUserId}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Tính lúc: {new Date(sc.calculatedAt).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {sc.sampleCount === 0 ? (
                        <span className="px-2 py-1 text-xs font-bold text-gray-500 bg-gray-100 rounded-md">
                          CHƯA ĐỦ DỮ LIỆU / N/A
                        </span>
                      ) : (
                        <>
                          <span className="text-lg font-black text-blue-600">{sc.totalScore}</span>
                          <span className="text-xs text-gray-400 ml-1">/ 100</span>
                        </>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-700">
                      {sc.sampleCount === 0 ? 'N/A' : `${sc.coverageRatio}%`}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-medium text-gray-900">{sc.sampleCount}</span>
                        {sc.sampleCount === 0 ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 rounded">
                            Chưa có mẫu
                          </span>
                        ) : sc.sampleCount < 3 ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                            PROVISIONAL (&lt;3)
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {sc.status === 'APPROVED' ? (
                        <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          Đã duyệt
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          Dự thảo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecalculate(sc.staffUserId)}
                        title="Tính lại cho nhân sự này"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAdjustModal(sc.staffUserId)}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Điều chỉnh điểm Quản lý"
                      >
                        <Sliders className="w-3.5 h-3.5 mr-1" />
                        Điều chỉnh
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal điều chỉnh điểm */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Điều chỉnh điểm KPI nhân viên #${selectedStaffId}`}
      >
        <form onSubmit={handleSubmitAdjustment} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
            <strong>Quy tắc khách quan (Đợt 5):</strong> Quản lý chỉ đánh giá trong phạm vi Rubric 10 điểm hoặc xác minh ngoại lệ có bằng chứng; tuyệt đối không nhập đè trực tiếp 70% điểm hệ thống hoặc 20% điểm đánh giá sao của khách hàng.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hạng mục xác minh / Rubric Quản lý (10 điểm)
            </label>
            <select
              value={metricCode}
              onChange={(e) => setMetricCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="MANAGER_EVALUATION">Rubric đánh giá của Quản lý (Tối đa 10đ)</option>
              <option value="COMPLIANCE_ACCURACY">Xác minh tuân thủ checklist / quy trình kèm chứng cứ</option>
              <option value="COMPLAINT_RESOLUTION">Xác minh sự cố khách quan ngoài tầm kiểm soát</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức điểm điều chỉnh (Delta)
            </label>
            <div className="flex items-center gap-3">
              {[-3, -2, -1, 1, 2, 3, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDelta(val)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                    delta === val
                      ? val > 0
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do & Căn cứ điều chỉnh <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              required
              placeholder="Ví dụ: Nhân viên có hành động dũng cảm cứu hộ khách hoặc được khách gửi thư khen thưởng..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAdjustModalOpen(false)}
              disabled={adjusting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={adjusting}>
              {adjusting ? 'Đang lưu...' : 'Lưu điều chỉnh'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

