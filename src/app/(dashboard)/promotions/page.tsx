'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  PauseCircle,
  AlertTriangle,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { hotelsApi } from '@/services/api/hotels.api';
import { hotelStaffApi } from '@/services/api/hotel-staff.api';
import {
  promotionsApi,
  PromotionCampaignItem,
  BookingBenefitFolioResponse,
} from '@/services/api/promotions.api';

export default function PromotionsManagementPage() {
  const { user, isAdmin } = useAuth();
  const [hotelId, setHotelId] = useState<string>('');
  const [hotelOptions, setHotelOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [campaigns, setCampaigns] = useState<PromotionCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [stayStartDate, setStayStartDate] = useState('2026-11-05');
  const [stayEndDate, setStayEndDate] = useState('2026-11-07');
  const [discountType, setDiscountType] = useState<'FIXED_AMOUNT' | 'PERCENT'>('FIXED_AMOUNT');
  const [discountValue, setDiscountValue] = useState<number>(120000);
  const [benefitKind, setBenefitKind] = useState<'ROOM_PRICE_ADJUSTMENT' | 'SERVICE_BENEFIT_CREDIT'>('ROOM_PRICE_ADJUSTMENT');
  const [existingBookingsEligible, setExistingBookingsEligible] = useState(true);
  const [retroactiveMode, setRetroactiveMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sổ đối chiếu quyền lợi & cấn trừ theo Booking ID
  const [inspectBookingId, setInspectBookingId] = useState('');
  const [folio, setFolio] = useState<BookingBenefitFolioResponse | null>(null);

  useEffect(() => {
    const loadHotels = async () => {
      try {
        if (isAdmin) {
          const res = await hotelsApi.getAll({ perPage: 100 });
          if (res.data?.length) {
            const list = res.data.map((h: any) => ({ id: String(h.id), name: h.name }));
            setHotelOptions(list);
            setHotelId(list[0].id);
            return;
          }
        }
        const staffRes = await hotelStaffApi.getAll();
        if (staffRes.data && Array.isArray(staffRes.data)) {
          const matched = staffRes.data.filter(
            (s: any) => String(s.staffUserId) === String(user?.id) && s.status === 'ACTIVE',
          );
          if (matched.length > 0) {
            const list = matched.map((m: any) => ({
              id: String(m.hotelId),
              name: m.hotelName || `Khách sạn #${m.hotelId}`,
            }));
            setHotelOptions(list);
            setHotelId(list[0].id);
          }
        }
      } catch {
        // Ignore
      }
    };
    loadHotels();
  }, [user?.id, isAdmin]);

  useEffect(() => {
    if (hotelId) {
      fetchCampaigns();
    } else {
      setLoading(false);
    }
  }, [hotelId]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const list = await promotionsApi.getHotelCampaigns(hotelId);
      setCampaigns(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Không thể tải danh sách chiến dịch' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId || !code.trim() || !name.trim()) return;
    try {
      setSubmitting(true);
      const res = await promotionsApi.createCampaign({
        hotelId,
        code: code.trim(),
        name: name.trim(),
        targetScope: 'ALL_ROOMS',
        stayStartDate,
        stayEndDate,
        discountType,
        discountValue: Number(discountValue),
        benefitKind,
        existingBookingsEligible,
        retroactiveMode,
      });
      setCreateOpen(false);
      setCode('');
      setName('');
      const warnCount = res.conflictWarnings?.length || 0;
      setNotice({
        type: 'success',
        text:
          warnCount > 0
            ? `Đã lưu bản nháp nhưng phát hiện ${warnCount} cảnh báo trùng phạm vi/ngày. Vui lòng kiểm tra trước khi kích hoạt.`
            : 'Đã tạo bản nháp chương trình khuyến mãi thành công!',
      });
      await fetchCampaigns();
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Không thể tạo chương trình' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await promotionsApi.activateCampaign(id);
      setNotice({ type: 'success', text: `Đã kích hoạt chiến dịch #${id} và quét quyền lợi các đơn hợp lệ!` });
      await fetchCampaigns();
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Chặn kích hoạt do xung đột chồng chương trình' });
    }
  };

  const handlePause = async (id: string) => {
    try {
      await promotionsApi.pauseCampaign(id, 'Tạm dừng cấp mới từ Dashboard');
      setNotice({ type: 'success', text: `Đã tạm dừng chiến dịch #${id} (giữ nguyên các quyền lợi đã cấp).` });
      await fetchCampaigns();
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Không thể tạm dừng chiến dịch' });
    }
  };

  const handleInspectBooking = async () => {
    if (!inspectBookingId.trim()) return;
    try {
      const data = await promotionsApi.getBookingFolio(inspectBookingId.trim());
      setFolio(data);
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Không thể tra cứu sổ quyền lợi booking' });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-600" />
            Quản Lý Khuyến Mãi, Giá Đêm & Sổ Quyền Lợi Khách Hàng
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Ngăn giảm chồng cùng dòng tiền phòng/dịch vụ, tính giá theo từng đêm [checkIn, checkOut), bảo toàn số tiền VNPay đã thu và hạch toán cấn trừ/hoàn tiền minh bạch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hotelOptions.length > 0 && (
            <select
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white"
            >
              {hotelOptions.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} (#{h.id})
                </option>
              ))}
            </select>
          )}
          <Button size="sm" onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Tạo Chương Trình Mới
          </Button>
          <Button size="sm" variant="outline" onClick={fetchCampaigns}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="underline ml-3">
            Đóng
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-900">Danh Sách Chương Trình Khuyến Mãi</h2>
          <span className="text-xs text-gray-500">Chính sách: EXCLUSIVE (Chống giảm chồng)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Mã & Tên Chương Trình</th>
                <th className="px-3 py-3">Đêm áp dụng [start, end)</th>
                <th className="px-3 py-3">Mức giảm</th>
                <th className="px-3 py-3">Bản chất quyền lợi</th>
                <th className="px-3 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    Đang tải chương trình khuyến mãi...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    Chưa có chương trình khuyến mãi nào tại cơ sở này.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-[11px] font-mono text-indigo-600">{c.code}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-gray-700">
                      [{c.stayStartDate}, {c.stayEndExclusiveDate})
                    </td>
                    <td className="px-3 py-3 font-bold text-emerald-700">
                      {c.discountType === 'PERCENT'
                        ? `${c.discountValue}% / đêm`
                        : `${Number(c.discountValue).toLocaleString('vi-VN')}đ / đêm`}
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        {c.benefitKind}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-gray-100 text-gray-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {c.status === 'DRAFT' && (
                        <Button size="sm" onClick={() => handleActivate(c.id)}>
                          Duyệt & Kích Hoạt
                        </Button>
                      )}
                      {c.status === 'ACTIVE' && (
                        <Button size="sm" variant="outline" onClick={() => handlePause(c.id)}>
                          Tạm dừng cấp mới
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              Tra Cứu Sổ Quyền Lợi Hậu Thanh Toán & Lịch Sử Cấn Trừ Dịch Vụ (INV-P03 / INV-P14)
            </h3>
            <p className="text-xs text-gray-500">
              Kiểm tra khoản giảm giá phát sinh sau VNPay PAID (không sửa số tiền giao dịch gốc) và lịch sử cấn trừ dịch vụ giặt ủi/spa.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inspectBookingId}
              onChange={(e) => setInspectBookingId(e.target.value)}
              placeholder="Nhập ID Booking..."
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            />
            <Button size="sm" onClick={handleInspectBooking}>
              Xem Sổ Quyền Lợi
            </Button>
          </div>
        </div>

        {folio && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-gray-500">Tiền phòng gốc (Không đổi trên VNPay):</span>
              <div className="text-lg font-black text-gray-900 mt-1">
                {folio.originalEstimatedTotal.toLocaleString('vi-VN')} ₫
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-amber-800">Tiền giảm giá phòng phải hoàn (Không tự hết hạn):</span>
              <div className="text-lg font-black text-amber-700 mt-1">
                {folio.refundReceivableAmount.toLocaleString('vi-VN')} ₫
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800">Số dư khả dụng cấn trừ dịch vụ:</span>
              <div className="text-lg font-black text-emerald-700 mt-1">
                {folio.availableServiceCredit.toLocaleString('vi-VN')} ₫
              </div>
            </div>
          </div>
        )}
      </div>
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Tạo Chương Trình Khuyến Mãi Khách Sạn">
        <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mã chương trình *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: NOV_05_07"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tên chương trình *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Ưu đãi đêm 05–07/11"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Từ đêm (Inclusive) *</label>
              <input
                type="date"
                required
                value={stayStartDate}
                onChange={(e) => setStayStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Đến đêm cuối (Inclusive) *</label>
              <input
                type="date"
                required
                value={stayEndDate}
                onChange={(e) => setStayEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Hình thức giảm</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="FIXED_AMOUNT">Số tiền cố định / đêm (VND)</option>
                <option value="PERCENT">Theo phần trăm (%)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Giá trị giảm *</label>
              <input
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Bản chất quyền lợi khi đơn đã PAID</label>
            <select
              value={benefitKind}
              onChange={(e) => setBenefitKind(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ROOM_PRICE_ADJUSTMENT">Giảm giá phòng thật (Hoàn tiền hoặc cấn trừ khi khách đồng ý)</option>
              <option value="SERVICE_BENEFIT_CREDIT">Tặng tín dụng dịch vụ (Voucher chi tiêu dịch vụ nội bộ)</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={existingBookingsEligible}
                onChange={(e) => setExistingBookingsEligible(e.target.checked)}
              />
              <span>Áp dụng cho cả booking đã đặt trước</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={retroactiveMode}
                onChange={(e) => setRetroactiveMode(e.target.checked)}
              />
              <span>Cho phép hồi tố đêm đã qua</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu Bản Nháp'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


