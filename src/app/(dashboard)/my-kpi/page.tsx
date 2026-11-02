'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  FileText,
  Star,
  RefreshCw,
} from 'lucide-react';
import { staffKpiApi, StaffKpiPeriodScoreItem } from '@/services/api/staff-kpi.api';
import { hotelStaffApi } from '@/services/api/hotel-staff.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const METRIC_NAMES: Record<string, string> = {
  FIRST_RESPONSE_SLA: 'Tốc độ phản hồi ban đầu (First Response SLA)',
  PRE_ARRIVAL_PREP: 'Liên hệ chuẩn bị trước nhận phòng (Pre-Arrival)',
  CHECKIN_CHECKOUT_PROCESS: 'Chuẩn hóa quy trình Check-in & Check-out',
  SERVICE_REQUEST_SLA: 'Thời gian xử lý dịch vụ phòng (Service SLA)',
  COMPLAINT_RESOLUTION: 'Giải quyết phản ánh & Khiếu nại (Resolution)',
  COMPLIANCE_ACCURACY: 'Tuân thủ quy trình & Bằng chứng xác thực',
  GUEST_RATING: 'Điểm đánh giá từ khách hàng (Guest Rating)',
  MANAGER_EVALUATION: 'Đánh giá & Điều chỉnh của Quản lý (Manager Eval)',
};

export default function MyKpiPage() {
  const { user } = useAuth();
  const [periodKey, setPeriodKey] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [hotelId, setHotelId] = useState<string>('');
  const [myHotels, setMyHotels] = useState<Array<{ hotelId: string; hotelName: string }>>([]);
  const [kpiData, setKpiData] = useState<StaffKpiPeriodScoreItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadUserHotels = async () => {
      try {
        const res = await hotelStaffApi.getAll();
        if (res.data && Array.isArray(res.data)) {
          const matched = res.data.filter(
            (s: any) => String(s.staffUserId) === String(user?.id) && s.status === 'ACTIVE',
          );
          if (matched.length > 0) {
            const list = matched.map((m: any) => ({
              hotelId: String(m.hotelId),
              hotelName: m.hotelName || `Khách sạn #${m.hotelId}`,
            }));
            setMyHotels(list);
            setHotelId(list[0].hotelId);
            return;
          }
        }
      } catch {
        // Fallback
      }
      setHotelId('');
    };
    loadUserHotels();
  }, [user?.id]);

  useEffect(() => {
    if (hotelId) {
      fetchKpi();
    }
  }, [periodKey, hotelId]);

  const fetchKpi = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await staffKpiApi.getMyKpi(hotelId, periodKey);
      setKpiData(res);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể tải dữ liệu điểm KPI');
      setKpiData(null);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            Bảng điểm KPI & Chất lượng phục vụ của tôi (Đợt 5)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Đo lường công bằng theo thang 100 điểm, bảo vệ nhân viên qua cơ chế tái cân bằng trọng số khi thiếu dữ liệu
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="month"
              value={periodKey}
              onChange={(e) => setPeriodKey(e.target.value)}
              className="outline-none text-sm font-medium text-gray-700 bg-transparent"
            />
          </div>

          <Button onClick={fetchKpi} variant="outline" size="sm" className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-gray-500 text-sm">Đang tính toán và tải điểm KPI...</div>
      ) : !kpiData ? (
        <div className="p-12 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl">
          <p className="text-sm text-gray-600 font-medium">Chưa có bản ghi điểm KPI cho chu kỳ {periodKey}.</p>
          <p className="text-xs text-gray-400 mt-1">Hệ thống sẽ tự động tổng hợp khi có dữ liệu nhiệm vụ hoặc đánh giá từ khách.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
                kpiData.sampleCount === 0
                  ? 'text-gray-600 bg-gray-50 border-gray-200'
                  : getScoreColor(Number(kpiData.totalScore))
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider">Tổng điểm chuẩn hóa</span>
                <Award className="w-5 h-5" />
              </div>
              <div className="mt-3">
                {kpiData.sampleCount === 0 ? (
                  <>
                    <div className="text-xl font-black text-gray-700">
                      CHƯA ĐỦ DỮ LIỆU / N/A
                    </div>
                    <div className="text-xs mt-1 font-medium text-gray-500">
                      Chưa phát sinh tác vụ hoặc đánh giá có chứng cứ trong kỳ
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-black">
                      {kpiData.totalScore} <span className="text-sm font-semibold">/ 100</span>
                    </div>
                    <div className="text-xs mt-1 font-medium opacity-80">
                      Trạng thái kỳ:{' '}
                      {kpiData.status === 'APPROVED'
                        ? 'Đã duyệt'
                        : kpiData.sampleCount < 3
                        ? 'Tạm tính / Mẫu ít (PROVISIONAL)'
                        : 'Dự thảo (Draft)'}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center text-gray-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Độ phủ dữ liệu (Coverage)</span>
                <Layers className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-gray-900">{kpiData.coverageRatio}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  Tỷ trọng các tiêu chí có phát sinh nghiệp vụ thực tế
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center text-gray-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Tổng số mẫu đánh giá</span>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-gray-900">{kpiData.sampleCount}</span>
                  {kpiData.sampleCount < 3 && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded">
                      Mẫu nhỏ (&lt;3)
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Nhiệm vụ, sự kiện và phản hồi của khách
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900">
                Phân rã chi tiết 8 tiêu chí năng lực (Đợt 5 Policy)
              </h2>
              <span className="text-xs text-gray-500">Phiên bản chính sách: {kpiData.policyVersion}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Tiêu chí đánh giá</th>
                    <th className="px-3 py-3 text-center">Trọng số</th>
                    <th className="px-3 py-3 text-center">Đạt được</th>
                    <th className="px-3 py-3 text-center">Tỷ lệ mẫu</th>
                    <th className="px-4 py-3">Trạng thái dữ liệu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kpiData.metrics && kpiData.metrics.map((metric) => (
                    <tr key={metric.id || metric.metricCode} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900">
                          {METRIC_NAMES[metric.metricCode] || metric.metricCode}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{metric.metricCode}</div>
                      </td>
                      <td className="px-3 py-3.5 text-center font-semibold text-gray-700">
                        {metric.weight}đ
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {metric.eligible ? (
                          <span className="font-bold text-blue-600">{metric.score}đ</span>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-center text-xs text-gray-600">
                        {metric.eligible ? `${metric.numerator} / ${metric.denominator}` : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {metric.eligible ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Đủ dữ liệu tính điểm ({metric.evidenceCount} chứng cứ)
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">
                            {metric.noDataReason || 'Không phát sinh nghiệp vụ trong kỳ (tái cân bằng trọng số)'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

