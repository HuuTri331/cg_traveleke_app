'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import {
  promotionsApi,
  BookingBenefitFolioResponse,
} from '@/services/api/promotions.api';
import { servicesApi, ServiceRequest } from '@/services/api/services.api';
import { Button } from '@/components/ui/Button';

interface BookingBenefitPanelProps {
  bookingId: string | number;
  mode: 'STAFF' | 'CUSTOMER';
}

export function BookingBenefitPanel({ bookingId, mode }: BookingBenefitPanelProps) {
  const [folio, setFolio] = useState<BookingBenefitFolioResponse | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [serviceReqId, setServiceReqId] = useState('');
  const [reason, setReason] = useState('');
  const [payoutReceiptRef, setPayoutReceiptRef] = useState('');
  const [refundChannel, setRefundChannel] = useState<'VNPAY_PROVIDER' | 'BANK_TRANSFER_PROOF' | 'CASH_RECEIPT'>('VNPAY_PROVIDER');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadFolio = async () => {
    try {
      setLoading(true);
      const [data, reqs] = await Promise.all([
        promotionsApi.getBookingFolio(bookingId),
        mode === 'STAFF'
          ? servicesApi.getRequestsByBooking(Number(bookingId)).catch(() => [])
          : Promise.resolve([]),
      ]);
      setFolio(data);
      setServiceRequests(Array.isArray(reqs) ? reqs : []);
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
    if (mode !== 'CUSTOMER') {
      setNotice({
        type: 'error',
        text: 'Chỉ chính khách hàng sở hữu đơn đặt phòng mới được xác nhận đồng ý chuyển tiền hoàn thành tín dụng dịch vụ.',
      });
      return;
    }
    try {
      setSubmitting(true);
      await promotionsApi.acceptRoomAdjustmentAsCredit(bookingId, accountId, {
        channel: 'CUSTOMER_APP',
        termsVersion: 'v1.0',
      });
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
    if (!serviceReqId.trim()) {
      setNotice({ type: 'error', text: 'Bắt buộc chọn phiếu yêu cầu dịch vụ hợp lệ của đơn đặt phòng trước khi cấn trừ.' });
      return;
    }
    const amt = redeemAmount ? Number(redeemAmount) : undefined;
    try {
      setSubmitting(true);
      const res = await promotionsApi.redeemBenefit({
        bookingId: String(bookingId),
        serviceRequestId: serviceReqId.trim(),
        requestedAmount: amt && amt > 0 ? amt : undefined,
        idempotencyKey: `redeem_${bookingId}_${serviceReqId.trim()}_${amt || 'full'}`,
        reason: reason.trim() || `Cấn trừ phiếu dịch vụ #${serviceReqId.trim()}`,
      });
      setRedeemAmount('');
      setServiceReqId('');
      setReason('');
      setNotice({
        type: 'success',
        text: `Đã cấn trừ ${Number(res.redeemedAmount || 0).toLocaleString('vi-VN')}đ cho phiếu DV #${res.serviceRequestId}. Khách cần trả thêm: ${Number(res.remainingServicePayable || 0).toLocaleString('vi-VN')}đ`,
      });
      await loadFolio();
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Không thể cấn trừ dịch vụ' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettleRefund = async (accountId: string) => {
    if (refundChannel !== 'VNPAY_PROVIDER' && !payoutReceiptRef.trim()) {
      setNotice({ type: 'error', text: 'Vui lòng nhập mã chứng từ chi / biên lai hoàn tiền trước khi tất toán.' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await promotionsApi.settleRefund(bookingId, accountId, {
        idempotencyKey: `settle_${bookingId}_${accountId}`,
        channel: refundChannel,
        payoutReceiptRef: payoutReceiptRef.trim() || undefined,
        reason: 'Tất toán hoàn tiền chênh lệch giảm giá phòng',
      });
      setNotice({
        type: 'success',
        text:
          res.status === 'SUCCEEDED'
            ? `Đã hoàn trả thành công ${Number(res.settledRefundAmount || 0).toLocaleString('vi-VN')}đ!`
            : `Đã tạo lệnh hoàn tiền (${res.status}) số tiền ${Number(res.reservedRefundAmount || 0).toLocaleString('vi-VN')}đ, đang chờ cổng thanh toán đối soát.`,
      });
      setPayoutReceiptRef('');
      await loadFolio();
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Không thể tất toán hoàn tiền' });
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-white border border-amber-100 dark:bg-gray-900 dark:border-gray-800">
              <span className="text-2xs text-gray-500 block">Tổng đơn ghi nhận trên VNPay:</span>
              <span className="text-sm font-black text-gray-900 dark:text-white">
                {Number(folio.originalEstimatedTotal || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-amber-200 dark:bg-gray-900 dark:border-amber-900">
              <span className="text-2xs text-amber-700 block">Chờ hoàn tiền (Chưa đồng ý cấn trừ):</span>
              <span className="text-sm font-black text-amber-700">
                {Number(folio.adjustmentRefundableWithoutConsent ?? folio.refundReceivableAmount ?? 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 dark:bg-gray-900 dark:border-emerald-900">
              <span className="text-2xs text-emerald-700 block">Số dư dùng được cho Dịch Vụ:</span>
              <span className="text-sm font-black text-emerald-700">
                {Number(folio.availableServiceCredit || 0).toLocaleString('vi-VN')} ₫
                {folio.availableQuota > 0 ? ` • ${folio.availableQuota} suất gói` : ''}
              </span>
              {Number(folio.refundableButOffsetPermitted || 0) > 0 && (
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  (Cùng khoản giảm giá phòng đã đồng ý cấn trừ hoặc hoàn phần dư)
                </span>
              )}
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-indigo-200 dark:bg-gray-900 dark:border-indigo-900">
              <span className="text-2xs text-indigo-700 block">Tổng nghĩa vụ quyền lợi ròng:</span>
              <span className="text-sm font-black text-indigo-700">
                {Number(folio.totalOutstandingLiability ?? folio.refundReceivableAmount ?? 0).toLocaleString('vi-VN')} ₫
              </span>
              {Number(folio.pendingRefundSettlementAmount || 0) > 0 && (
                <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                  Đang xử lý hoàn: {Number(folio.pendingRefundSettlementAmount).toLocaleString('vi-VN')} ₫
                </span>
              )}
            </div>
          </div>

          {folio.accounts?.map((acc) => (
            <div
              key={acc.id}
              className="p-2.5 rounded-lg bg-white/90 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {acc.note || `Quyền lợi #${acc.id}`} ({acc.benefitKind}) — <span className="text-indigo-600">{acc.status}</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  Đã cấp: <strong>{Number(acc.grantedAmount).toLocaleString('vi-VN')}đ</strong> • Đã dùng:{' '}
                  <strong>{Number(acc.redeemedAmount).toLocaleString('vi-VN')}đ</strong> • Đã hoàn:{' '}
                  <strong>{Number(acc.refundedAmount || 0).toLocaleString('vi-VN')}đ</strong> • Còn lại:{' '}
                  <strong className="text-emerald-700">{Number(acc.availableAmount).toLocaleString('vi-VN')}đ</strong>
                  {acc.availableQuota > 0 ? ` (${acc.availableQuota}/${acc.grantedQuota} suất)` : ''}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {mode === 'CUSTOMER' &&
                  acc.benefitKind === 'ROOM_PRICE_ADJUSTMENT' &&
                  !acc.customerAcceptedCredit &&
                  Number(acc.availableAmount) > 0 && (
                    <Button size="sm" onClick={() => handleAcceptConsent(acc.id)} disabled={submitting}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Đồng ý dùng tiền hoàn để cấn trừ dịch vụ
                    </Button>
                  )}
                {mode === 'STAFF' &&
                  acc.benefitKind === 'ROOM_PRICE_ADJUSTMENT' &&
                  !acc.customerAcceptedCredit &&
                  Number(acc.availableAmount) > 0 && (
                    <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-[11px] font-medium">
                      Chờ khách hàng xác nhận đồng ý trên ứng dụng
                    </span>
                  )}
                {mode === 'STAFF' &&
                  acc.benefitKind === 'ROOM_PRICE_ADJUSTMENT' &&
                  acc.status === 'APPROVED' &&
                  Number(acc.availableAmount) > 0 && (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={refundChannel}
                        onChange={(e) => setRefundChannel(e.target.value as any)}
                        className="px-2 py-1 rounded border border-gray-300 bg-white text-[11px]"
                      >
                        <option value="VNPAY_PROVIDER">Hoàn qua VNPay</option>
                        <option value="BANK_TRANSFER_PROOF">Chuyển khoản (Có UNC)</option>
                        <option value="CASH_RECEIPT">Tiền mặt (Có phiếu chi)</option>
                      </select>
                      {refundChannel !== 'VNPAY_PROVIDER' && (
                        <input
                          type="text"
                          value={payoutReceiptRef}
                          onChange={(e) => setPayoutReceiptRef(e.target.value)}
                          placeholder="Mã UNC/Phiếu chi *"
                          className="px-2 py-1 rounded border border-gray-300 bg-white text-[11px] w-32"
                        />
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleSettleRefund(acc.id)} disabled={submitting}>
                        Tất Toán Hoàn {Number(acc.availableAmount).toLocaleString('vi-VN')}đ
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {mode === 'STAFF' && (Number(folio.availableServiceCredit) > 0 || Number(folio.availableQuota) > 0) && (
            <form onSubmit={handleRedeem} className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-2">
              <select
                required
                value={serviceReqId}
                onChange={(e) => {
                  const val = e.target.value;
                  setServiceReqId(val);
                  const found = serviceRequests.find((r) => String(r.id) === val);
                  if (found) setRedeemAmount(String(Math.round(Number(found.totalPrice || 0))));
                }}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs min-w-[230px]"
              >
                <option value="">-- Chọn phiếu dịch vụ của booking * --</option>
                {serviceRequests
                  .filter((r) => r.status !== 'CANCELLED' && r.status !== 'FAILED')
                  .map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      #{r.id} - {r.serviceName} ({Number(r.totalPrice).toLocaleString('vi-VN')}đ - {r.status})
                    </option>
                  ))}
              </select>
              <input
                type="number"
                min={1000}
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Số tiền cấn trừ (Mặc định theo phiếu)"
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs w-44"
              />
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ghi chú đối soát (VD: Giặt ủi phòng 302)"
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs flex-1 min-w-[160px]"
              />
              <Button size="sm" type="submit" disabled={submitting || !serviceReqId}>
                Cấn Trừ Phiếu Dịch Vụ
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
