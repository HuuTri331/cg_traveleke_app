'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  approvalsApi,
  ApprovalRequestItem,
  ApprovalRequestType,
  ApprovalStatus,
} from '@/services/api/approvals.api';
import { hotelsApi } from '@/services/api/hotels.api';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  DollarSign,
  FileText,
  User,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';

const REQUEST_TYPE_MAP: Record<ApprovalRequestType, { label: string; badge: string }> = {
  REFUND: { label: 'Hoàn Tiền Khách', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  DISCOUNT: { label: 'Giảm Giá / Chiết Khấu', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  RATE_OVERRIDE: { label: 'Điều Chỉnh Giá Phòng', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  SERVICE_RECOVERY: { label: 'Bồi Thường Dịch Vụ', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' },
  COMPLIMENTARY: { label: 'Tặng Dịch Vụ Miễn Phí', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
};

const STATUS_MAP: Record<ApprovalStatus, { label: string; variant: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  PENDING: { label: 'Chờ Quản Lý Duyệt', variant: 'warning' },
  APPROVED: { label: 'Đã Phê Duyệt', variant: 'success' },
  REJECTED: { label: 'Bị Từ Chối', variant: 'danger' },
  CANCELLED: { label: 'Đã Hủy', variant: 'neutral' },
  EXECUTED: { label: 'Đã Thực Thi', variant: 'brand' },
};

export default function ApprovalsPage() {
  const { user, isAdmin } = useAuth();

  const [requests, setRequests] = useState<ApprovalRequestItem[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    hotelId: '',
    bookingId: '',
    serviceRequestId: '',
    requestType: 'REFUND' as ApprovalRequestType,
    requestedAmount: 0,
    reason: '',
    evidenceNotes: '',
  });

  // Decide Modal
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestItem | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [decisionNote, setDecisionNote] = useState('');
  const [isDecideModalOpen, setIsDecideModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [res, hotelsRes] = await Promise.all([
        approvalsApi.getAll(),
        hotelsApi.getAll({ perPage: 100 }),
      ]);
      setRequests(res.data || []);
      setHotels(hotelsRes.data || []);
      if (hotelsRes.data?.length > 0 && !createForm.hotelId) {
        setCreateForm((prev) => ({ ...prev, hotelId: String(hotelsRes.data[0].id) }));
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách phê duyệt:', err);
    } finally {
      setLoading(false);
    }
  }, [createForm.hotelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Submit create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await approvalsApi.create({
        hotelId: createForm.hotelId,
        bookingId: createForm.bookingId ? Number(createForm.bookingId) : undefined,
        serviceRequestId: createForm.serviceRequestId ? Number(createForm.serviceRequestId) : undefined,
        requestType: createForm.requestType,
        requestedAmount: Number(createForm.requestedAmount),
        reason: createForm.reason,
        evidenceNotes: createForm.evidenceNotes || undefined,
      });

      setNotice({ type: 'success', message: 'Tạo đề xuất phê duyệt thành công! Chờ quản lý xét duyệt.' });
      setIsCreateModalOpen(false);
      setCreateForm((prev) => ({
        ...prev,
        bookingId: '',
        serviceRequestId: '',
        requestedAmount: 0,
        reason: '',
        evidenceNotes: '',
      }));
      fetchData();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Không thể tạo đề xuất phê duyệt.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit decision
  const handleDecide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      setSubmitting(true);
      await approvalsApi.decide(selectedRequest.id, {
        decision,
        decisionNote: decisionNote || undefined,
      });

      setNotice({
        type: 'success',
        message: `Đã ${decision === 'APPROVED' ? 'phê duyệt' : 'từ chối'} đề xuất #${selectedRequest.id} thành công!`,
      });
      setIsDecideModalOpen(false);
      fetchData();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Không thể thực hiện xét duyệt.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        pageTitle="Xét Duyệt Hạn Mức & Bồi Thường Tài Chính"
        items={[{ label: 'Vận Hành & Tài Chính' }, { label: 'Xét Duyệt Hạn Mức' }]}
      />

      {/* Notice */}
      {notice && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-medium border ${
            notice.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-xs underline hover:opacity-80">
            Đóng
          </button>
        </div>
      )}

      {/* Top Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Hàng Đợi Xét Duyệt (Maker-Checker & Hạn Mức)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tuân thủ nguyên tắc phân quyền (Section 02.5, 20.1): Lễ tân đề xuất, Quản lý khách sạn xét duyệt theo hạn mức
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Tạo Đề Xuất
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchData}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-5 py-3 bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Trạng thái:</span>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-2xs font-bold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {st === 'ALL' ? 'Tất Cả' : STATUS_MAP[st as ApprovalStatus]?.label || st}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Mã</th>
                <th className="py-3 px-4 font-semibold">Khách Sạn</th>
                <th className="py-3 px-4 font-semibold">Loại Yêu Cầu</th>
                <th className="py-3 px-4 font-semibold">Số Tiền Đề Xuất</th>
                <th className="py-3 px-4 font-semibold">Người Đề Xuất</th>
                <th className="py-3 px-4 font-semibold">Lý Do</th>
                <th className="py-3 px-4 font-semibold">Trạng Thái</th>
                <th className="py-3 px-4 font-semibold">Người Duyệt</th>
                <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    Đang tải danh sách yêu cầu xét duyệt...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    Không có đề xuất phê duyệt nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const typeCfg = REQUEST_TYPE_MAP[r.requestType] || { label: r.requestType, badge: '' };
                  const isRequester = String(user?.id) === String(r.requesterStaffId);
                  const canDecide = (isAdmin || user?.role === 'EMPLOYEE') && !isRequester && r.status === 'PENDING';

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">#{r.id}</td>
                      <td className="py-3 px-4">{r.hotelName || `#${r.hotelId}`}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-2xs ${typeCfg.badge}`}>
                          {typeCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {r.requestedAmount ? formatCurrency(Number(r.requestedAmount)) : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {r.requesterName || `#${r.requesterStaffId}`}
                        {isRequester && <span className="ml-1 text-2xs text-brand-600 font-bold">(Bạn)</span>}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-gray-600 dark:text-gray-400" title={r.reason}>
                        {r.reason}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={STATUS_MAP[r.status]?.variant || 'neutral'}>
                          {STATUS_MAP[r.status]?.label || r.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {r.approverName || (r.approverStaffId ? `#${r.approverStaffId}` : '-')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canDecide ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:bg-green-50 border-green-200"
                              onClick={() => {
                                setSelectedRequest(r);
                                setDecision('APPROVED');
                                setDecisionNote('');
                                setIsDecideModalOpen(true);
                              }}
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 border-red-200"
                              onClick={() => {
                                setSelectedRequest(r);
                                setDecision('REJECTED');
                                setDecisionNote('');
                                setIsDecideModalOpen(true);
                              }}
                            >
                              Từ Chối
                            </Button>
                          </div>
                        ) : isRequester && r.status === 'PENDING' ? (
                          <span className="text-2xs text-gray-400 italic">Maker-checker: Không tự duyệt</span>
                        ) : (
                          <span className="text-2xs text-gray-400">Đã chốt</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Đề Xuất Phê Duyệt Tài Chính / Dịch Vụ"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Khách Sạn Áp Dụng <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={createForm.hotelId}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, hotelId: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            >
              <option value="">-- Chọn khách sạn --</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Loại Đề Xuất <span className="text-red-500">*</span>
              </label>
              <select
                value={createForm.requestType}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    requestType: e.target.value as any,
                  }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
              >
                <option value="REFUND">Hoàn Tiền Khách (Refund)</option>
                <option value="DISCOUNT">Giảm Giá / Chiết Khấu (Discount)</option>
                <option value="RATE_OVERRIDE">Điều Chỉnh Giá Phòng (Rate Override)</option>
                <option value="SERVICE_RECOVERY">Bồi Thường Dịch Vụ (Service Recovery)</option>
                <option value="COMPLIMENTARY">Tặng Dịch Vụ Miễn Phí (Complimentary)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Số Tiền Đề Xuất (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={createForm.requestedAmount}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, requestedAmount: Number(e.target.value) }))}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mã Đơn Booking (Nếu có)
              </label>
              <input
                type="text"
                placeholder="ID đơn booking..."
                value={createForm.bookingId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, bookingId: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mã Yêu Cầu Dịch Vụ (Nếu có)
              </label>
              <input
                type="text"
                placeholder="ID service request..."
                value={createForm.serviceRequestId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, serviceRequestId: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Lý Do Đề Xuất <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={createForm.reason}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="VD: Khách phàn nàn máy lạnh kêu to, đề xuất giảm 200.000đ bồi thường..."
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Bằng Chứng / Ghi Chú Kèm Theo
            </label>
            <textarea
              rows={2}
              value={createForm.evidenceNotes}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, evidenceNotes: e.target.value }))}
              placeholder="Ghi chú đối soát hoặc hình ảnh chứng cứ..."
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Gửi Đề Xuất
            </Button>
          </div>
        </form>
      </Modal>

      {/* Decide Modal */}
      <Modal
        isOpen={isDecideModalOpen}
        onClose={() => setIsDecideModalOpen(false)}
        title={decision === 'APPROVED' ? 'Phê Duyệt Đề Xuất Tài Chính' : 'Từ Chối Đề Xuất'}
        maxWidth="md"
      >
        <form onSubmit={handleDecide} className="space-y-4 text-xs">
          <p className="text-gray-700 dark:text-gray-300">
            {decision === 'APPROVED' ? (
              <span>
                Bạn sắp phê duyệt đề xuất #{selectedRequest?.id} với số tiền{' '}
                <strong className="text-emerald-600 font-mono">
                  {formatCurrency(Number(selectedRequest?.requestedAmount || 0))}
                </strong>
                . Thao tác này sẽ ghi nhận vào sổ kế toán và kích hoạt điều chỉnh tương ứng.
              </span>
            ) : (
              <span>Bạn sắp từ chối đề xuất #{selectedRequest?.id}. Yêu cầu sẽ bị đóng lại.</span>
            )}
          </p>

          <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-850 text-gray-600 dark:text-gray-400">
            <strong>Lý do từ nhân viên đề xuất:</strong> {selectedRequest?.reason}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ghi Chú Xét Duyệt Của Quản Lý (Audit Trail)
            </label>
            <textarea
              rows={2}
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="Ghi chú lý do duyệt hoặc lý do từ chối..."
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" size="sm" onClick={() => setIsDecideModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant={decision === 'APPROVED' ? 'primary' : 'danger'}
              size="sm"
              type="submit"
              isLoading={submitting}
            >
              {decision === 'APPROVED' ? 'Xác Nhận Phê Duyệt' : 'Xác Nhận Từ Chối'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
