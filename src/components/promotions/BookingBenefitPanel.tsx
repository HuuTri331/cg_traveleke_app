'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import {
  promotionsApi,
  BookingBenefitFolioResponse,
} from '@/services/api/promotions.api';
import { Button } from '@/components/ui/Button';

interface BookingBenefitPanelProps {
  bookingId: string | number;
  mode: 'STAFF' | 'CUSTOMER';
}

export function BookingBenefitPanel({ bookingId, mode }: BookingBenefitPanelProps) {
  const [folio, setFolio] = useState<BookingBenefitFolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [serviceReqId, setServiceReqId] = useState('');
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadFolio = async () => {
    try {
      setLoading(true);
      const data = await promotionsApi.getBookingFolio(bookingId);
      setFolio(data);
    } catch {
      setFolio(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) loadFolio();
  }, [bookingId]);

  const handleEvaluate = async () => {
    try {
      setSubmitting(true);
      await promotionsApi.evaluateBookingBenefits(bookingId);
      setNotice({ type: 'success', text: 'Đã quét và cập nhật quyền lợi khuyến mãi theo đêm cho đơn đặt phòng!' });
      await loadFolio();
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Không thể quét quyền lợi khuyến mãi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptConsent = async (accountId: string) => {
    try {
      setSubmitting(true);
      await promotionsApi.acceptRoomAdjustmentAsCredit(bookingId, accountId);
      setNotice({
        type: 'success',
        text: 'Đã xác nhận đồng ý dùng khoản giảm giá phòng để cấn trừ dịch vụ tại khách sạn!',
      });
      await loadFolio();
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Không thể xác nhận đồng ý cấn trừ' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(redeemAmount);
    if (!amt || amt <= 0) return;
    try {
      setSubmitting(true);
      const res = await promotionsApi.redeemBenefit({
        bookingId: String(bookingId),
        requestedAmount: amt,
        serviceRequestId: serviceReqId.trim() || undefined,
        idempotencyKey: `redeem_${bookingId}_${Date.now()}`,
        reason: reason.trim() || 'Cấn trừ dịch vụ tại quầy',
      });
      setRedeemAmount('');
      setServiceReqId('');
      setReason('');
      setNotice({
        type: 'success',
        text: `Đã cấn trừ ${Number(res.redeemedAmount || amt).toLocaleString('vi-VN')}đ. Khách cần trả thêm: ${Number(res.remainingServicePayable || 0).toLocaleString('vi-VN')}đ`,
      });
      await loadFolio();
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Không thể cấn trừ dịch vụ' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 text-xs text-gray-500">
        Đang tải sổ quyền lợi khuyến mãi & đối soát...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20 p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-600" />
          Sổ Quyền Lợi Khuyến Mãi, Hoàn Tiền & Cấn Trừ Dịch Vụ (INV-P03 / INV-P12)
        </h4>
        <div className="flex items-center gap-2">
          {mode === 'STAFF' && (
            <Button size="sm" variant="outline" disabled={submitting} onClick={handleEvaluate}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Quét Ưu Đãi Đêm Lưu Trú
            </Button>
          )}
          <button type="button" onClick={loadFolio} className="text-2xs font-semibold text-amber-700 hover:underline">
            Làm mới
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{notice.text}</span>
        </div>
      )}

      {folio && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-lg bg-white border border-amber-100 dark:bg-gray-900 dark:border-gray-800">
              <span className="text-2xs text-gray-500 block">Tiền phòng gốc (Giữ nguyên trên VNPay):</span>
              <span className="text-sm font-black text-gray-900 dark:text-white">
                {Number(folio.originalEstimatedTotal || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-amber-200 dark:bg-gray-900 dark:border-amber-900">
              <span className="text-2xs text-amber-700 block">Tiền giảm giá phòng phải hoàn (Không hết hạn):</span>
              <span className="text-sm font-black text-amber-700">
                {Number(folio.refundReceivableAmount || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 dark:bg-gray-900 dark:border-emerald-900">
              <span className="text-2xs text-emerald-700 block">Số dư khả dụng cấn trừ dịch vụ:</span>
              <span className="text-sm font-black text-emerald-700">
                {Number(folio.availableServiceCredit || 0).toLocaleString('vi-VN')} ₫
                {folio.availableQuota > 0 ? ` • ${folio.availableQuota} suất gói` : ''}
              </span>
            </div>
          </div>

          {folio.accounts?.map((acc) => (
            <div
              key={acc.id}
              className="p-2.5 rounded-lg bg-white/90 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {acc.note || `Quyền lợi #${acc.id}`} ({acc.benefitKind})
                </div>
                <div className="text-[11px] text-gray-500">
                  Đã cấp: <strong>{Number(acc.grantedAmount).toLocaleString('vi-VN')}đ</strong> • Đã dùng:{' '}
                  <strong>{Number(acc.redeemedAmount).toLocaleString('vi-VN')}đ</strong> • Còn lại:{' '}
                  <strong className="text-emerald-700">{Number(acc.availableAmount).toLocaleString('vi-VN')}đ</strong>
                </div>
              </div>
              {acc.benefitKind === 'ROOM_PRICE_ADJUSTMENT' && !acc.customerAcceptedCredit && Number(acc.availableAmount) > 0 && (
                <Button size="sm" onClick={() => handleAcceptConsent(acc.id)} disabled={submitting}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Đồng ý dùng tiền hoàn để cấn trừ dịch vụ
                </Button>
              )}
            </div>
          ))}

          {mode === 'STAFF' && Number(folio.availableServiceCredit) > 0 && (
            <form onSubmit={handleRedeem} className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={1000}
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Số tiền dịch vụ (VD: 200000)"
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs w-44"
              />
              <input
                type="text"
                value={serviceReqId}
                onChange={(e) => setServiceReqId(e.target.value)}
                placeholder="Mã yêu cầu DV (Tùy chọn)"
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs w-40"
              />
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nội dung (VD: Giặt ủi phòng 302)"
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs flex-1 min-w-[160px]"
              />
              <Button size="sm" type="submit" disabled={submitting || !redeemAmount}>
                Cấn Trừ Dịch Vụ
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
