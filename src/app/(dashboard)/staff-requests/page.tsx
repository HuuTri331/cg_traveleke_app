'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarClock,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  User,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  staffAvailabilityApi,
  StaffAbsenceRequestItem,
  AbsenceRequestType,
} from '@/services/api/staff-availability.api';
import { hotelStaffApi } from '@/services/api/hotel-staff.api';

export default function StaffRequestsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [requests, setRequests] = useState<StaffAbsenceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hotelId, setHotelId] = useState<string>('');
  const [hotelName, setHotelName] = useState<string>('');

  // Form State
  const [requestType, setRequestType] = useState<AbsenceRequestType>('LATE_ARRIVAL');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [expectedArrivalAt, setExpectedArrivalAt] = useState('');
  const [reason, setReason] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // Withdraw Modal State
  const [withdrawModalItem, setWithdrawModalItem] = useState<StaffAbsenceRequestItem | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');

  // Tải danh sách đơn
  const fetchMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await staffAvailabilityApi.getMyRequests();
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể tải danh sách đơn');
    } finally {
      setLoading(false);
    }
  }, [error]);

  // Lấy khách sạn hiện tại của nhân viên
  useEffect(() => {
    const fetchUserHotel = async () => {
      try {
        const staffRes = await hotelStaffApi.getAll();
        if (staffRes.data && Array.isArray(staffRes.data)) {
          const myRelation = staffRes.data.find(
            (s: any) => String(s.staffUserId) === String(user?.id) && s.status === 'ACTIVE',
          );
          if (myRelation) {
            setHotelId(String(myRelation.hotelId));
            setHotelName(myRelation.hotelName || `Khách sạn #${myRelation.hotelId}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch staff hotel relation', err);
      }
    };

    fetchUserHotel();
    fetchMyRequests();
  }, [user, fetchMyRequests]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) {
      error('Bạn chưa được gán vào khách sạn nào đang hoạt động');
      return;
    }
    if (!startAt || !endAt || !reason.trim()) {
      error('Vui lòng điền đầy đủ thời gian và lý do vắng mặt');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await staffAvailabilityApi.submitRequest({
        hotelId,
        requestType,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        expectedArrivalAt: expectedArrivalAt ? new Date(expectedArrivalAt).toISOString() : undefined,
        reason: reason.trim(),
        contactInfo: contactInfo.trim() || undefined,
      });

      if (res.success) {
        success('Nộp đơn xin phép thành công, đang chờ Quản lý phê duyệt.');
        setIsCreateModalOpen(false);
        // Reset form
        setRequestType('LATE_ARRIVAL');
        setStartAt('');
        setEndAt('');
        setExpectedArrivalAt('');
        setReason('');
        setContactInfo('');
        fetchMyRequests();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawModalItem) return;
    try {
      setIsSubmitting(true);
      const res = await staffAvailabilityApi.withdrawRequest(withdrawModalItem.id, {
        reason: withdrawReason.trim() || undefined,
        expectedVersion: withdrawModalItem.version,
      });

      if (res.success) {
        success(res.message || 'Thao tác rút đơn thành công');
        setWithdrawModalItem(null);
        setWithdrawReason('');
        fetchMyRequests();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Không thể rút đơn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấp thuận
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Từ chối
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            Đã tự rút đơn
          </span>
        );
      case 'REVOCATION_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Đang xin thu hồi
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Đã thu hồi
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const getRequestTypeName = (type: string) => {
    switch (type) {
      case 'LATE_ARRIVAL':
        return 'Đi Muộn';
      case 'EARLY_LEAVE':
        return 'Về Sớm';
      case 'SHORT_ABSENCE':
        return 'Vắng Mặt Ngắn Hạn';
      case 'LEAVE':
      default:
        return 'Nghỉ Làm';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5 text-blue-400 font-medium text-sm mb-1">
            <CalendarClock className="w-4 h-4" />
            <span>Nghiệp Vụ Lễ Tân & Khả Dụng Vận Hành</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Đơn Xin Nghỉ & Báo Đi Muộn Của Tôi
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gửi đơn xin vắng mặt có thời hạn để hệ thống tự động loại trừ khỏi việc phân công booking trong khoảng thời gian đã được quản lý phê duyệt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchMyRequests}
            disabled={loading}
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo Đơn Mới
          </Button>
        </div>
      </div>

      {/* Thông tin nơi làm việc */}
      {hotelName && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-300">
          <Info className="w-4 h-4 text-blue-400" />
          <span>
            Khách sạn công tác: <strong className="text-white">{hotelName}</strong>
          </span>
        </div>
      )}

      {/* Danh sách các đơn */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Lịch Sử Đơn Xin Phép
          </h3>
          <span className="text-xs text-zinc-400">
            Tổng cộng: <strong className="text-zinc-200">{requests.length}</strong> đơn
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 opacity-50" />
            Đang tải dữ liệu đơn xin phép...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-30 text-zinc-400" />
            <p className="text-base text-zinc-300 font-medium">Bạn chưa gửi đơn xin nghỉ hoặc đi muộn nào</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              Khi cần nghỉ phép, đi muộn hoặc vắng mặt giữa ca, hãy bấm "Tạo Đơn Mới" để thông báo tới Quản lý khách sạn.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Loại Đơn</th>
                  <th className="py-3 px-4">Thời Gian Vắng Mặt</th>
                  <th className="py-3 px-4">Lý Do</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Ghi Chú Phê Duyệt</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {requests.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {getRequestTypeName(item.requestType)}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        Tạo lúc: {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-zinc-200">
                        {new Date(item.startAt).toLocaleString('vi-VN')}
                      </div>
                      <div className="text-xs text-zinc-500">
                        đến: {new Date(item.endAt).toLocaleString('vi-VN')}
                      </div>
                      {item.expectedArrivalAt && item.requestType === 'LATE_ARRIVAL' && (
                        <div className="text-xs text-amber-400/90 mt-1">
                          Dự kiến đến: {new Date(item.expectedArrivalAt).toLocaleTimeString('vi-VN')}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-zinc-200 line-clamp-2">{item.reason}</p>
                      {item.contactInfo && (
                        <span className="text-xs text-zinc-400 block mt-1">
                          Liên hệ: {item.contactInfo}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(item.status)}</td>

                    <td className="py-4 px-4 max-w-xs text-xs text-zinc-400">
                      {item.decisionNote ? (
                        <div className="bg-zinc-800/50 p-2 rounded-lg border border-zinc-700/50">
                          <p className="text-zinc-300 italic">"{item.decisionNote}"</p>
                          {item.decidedAt && (
                            <span className="text-[10px] text-zinc-500 block mt-1">
                              {new Date(item.decidedAt).toLocaleString('vi-VN')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      {item.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWithdrawModalItem(item)}
                          className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                        >
                          Rút Đơn
                        </Button>
                      )}
                      {item.status === 'APPROVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWithdrawModalItem(item)}
                          className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                        >
                          Xin Thu Hồi
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo Đơn Mới */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Đơn Xin Phép Vắng Mặt / Đi Muộn"
        subtitle="Hệ thống sẽ chuyển đơn tới Quản lý khách sạn để phê duyệt khoảng thời gian không khả dụng"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <Select
            label="Loại Đơn Xin Phép *"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as AbsenceRequestType)}
            options={[
              { value: 'LATE_ARRIVAL', label: 'Xin Đi Muộn (Báo thời gian đến dự kiến)' },
              { value: 'LEAVE', label: 'Xin Nghỉ Phép (Cả ngày hoặc nhiều ngày)' },
              { value: 'EARLY_LEAVE', label: 'Xin Về Sớm' },
              { value: 'SHORT_ABSENCE', label: 'Vắng Mặt Tạm Thời Giữa Ca' },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Thời Điểm Bắt Đầu *"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
            <Input
              label="Thời Điểm Kết Thúc *"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
            />
          </div>

          {requestType === 'LATE_ARRIVAL' && (
            <Input
              label="Thời Điểm Dự Kiến Đến Quầy"
              type="datetime-local"
              value={expectedArrivalAt}
              onChange={(e) => setExpectedArrivalAt(e.target.value)}
              helperText="Nếu để trống, hệ thống sẽ mặc định tính bằng thời điểm kết thúc vắng mặt"
            />
          )}

          <Textarea
            label="Lý Do Vắng Mặt *"
            placeholder="Nêu rõ lý do (ví dụ: việc gia đình, khám bệnh, sự cố giao thông...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
          />

          <Input
            label="Thông Tin Liên Lạc Khẩn Cấp (Tùy chọn)"
            placeholder="Số điện thoại hoặc phương thức liên hệ khi cần"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi Đơn Xin Phép'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Rút Đơn */}
      <Modal
        isOpen={Boolean(withdrawModalItem)}
        onClose={() => setWithdrawModalItem(null)}
        title={
          withdrawModalItem?.status === 'APPROVED'
            ? 'Yêu Cầu Thu Hồi Đơn Đã Duyệt'
            : 'Xác Nhận Rút Đơn Xin Phép'
        }
        subtitle={
          withdrawModalItem?.status === 'APPROVED'
            ? 'Đơn này đã được Quản lý duyệt. Yêu cầu thu hồi cần được Quản lý chấp thuận để khôi phục trạng thái sẵn sàng.'
            : 'Bạn có chắc chắn muốn hủy đơn xin phép này khi đang chờ duyệt không?'
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Lý Do Rút / Thu Hồi (Tùy chọn)"
            placeholder="Ví dụ: Đã sắp xếp được việc, có thể đi làm đúng giờ..."
            value={withdrawReason}
            onChange={(e) => setWithdrawReason(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setWithdrawModalItem(null)}
              disabled={isSubmitting}
            >
              Đóng
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-medium"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Rút Đơn'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
