'use client';
import Header from '@/components/common/HeaderCommon';
import Footer from '@/components/common/FooterCommon';

import {
  useEffect,
  useState,
} from 'react';

import {
  bookingApi,
  BookingHistory as BookingHistoryType,
} from '@/services/api/booking.api';
import { cancellationApi } from '@/services/api/cancellation.api';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';
import { getSocket, REALTIME_EVENTS, RealtimeBookingStatusChanged } from '@/lib/socket';

const BACKEND_URL =
  'http://localhost:3001';

const PLACEHOLDER_IMAGE =
  '/images/room-placeholder.png';

const getImageUrl = (
  url?: string | null,
) => {
  if (!url) {
    return PLACEHOLDER_IMAGE;
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `${BACKEND_URL}${url}`;
};

export default function BookingHistory() {
  const { customer } = useCustomerAuth();
  const [
    bookings,
    setBookings,
  ] = useState<
    BookingHistoryType[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    booking: BookingHistoryType | null;
    reason: string;
    submitting: boolean;
  }>({
    isOpen: false,
    booking: null,
    reason: '',
    submitting: false,
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await bookingApi.getHistory();

        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi lấy lịch sử booking:', error);
        setError('Không thể tải lịch sử đặt phòng.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [customer?.id]);

  // Lắng nghe sự kiện Realtime cập nhật trạng thái đơn đặt phòng tức thì
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (customer?.id) {
      socket.emit('subscribe:user', { userId: customer.id });
    }

    const handleStatusChanged = (payload: RealtimeBookingStatusChanged) => {
      setBookings((prev) =>
        prev.map((item) => {
          if (
            (item.bookingCode && item.bookingCode === payload.bookingCode) ||
            String(item.id) === String(payload.id)
          ) {
            return {
              ...item,
              status: payload.newStatus,
            };
          }
          return item;
        }),
      );
    };

    const handlePaymentChanged = (payload: { bookingId: string; bookingCode: string; status: string }) => {
      setBookings((prev) =>
        prev.map((item) => {
          if (
            (item.bookingCode && item.bookingCode === payload.bookingCode) ||
            String(item.id) === String(payload.bookingId)
          ) {
            return {
              ...item,
              paymentStatus: payload.status,
              status: payload.status === 'PAID' ? 'PENDING' : item.status,
            };
          }
          return item;
        }),
      );
    };

    socket.on(REALTIME_EVENTS.BOOKING_STATUS_CHANGED, handleStatusChanged);
    socket.on('payment.status_changed', handlePaymentChanged);

    return () => {
      socket.off(REALTIME_EVENTS.BOOKING_STATUS_CHANGED, handleStatusChanged);
      socket.off('payment.status_changed', handlePaymentChanged);
    };
  }, [customer?.id]);

  const handleRetryPayment = async (bookingId: string) => {
    setRetryingId(bookingId);
    try {
      const res = await bookingApi.retryPayment(bookingId);
      const paymentUrl = res.paymentUrl || res.data?.paymentUrl;
      if (paymentUrl) {
        window.location.assign(paymentUrl);
      } else {
        alert('Không nhận được liên kết thanh toán mới.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      alert(msg || 'Không thể tạo phiên thanh toán mới.');
    } finally {
      setRetryingId(null);
    }
  };

  const handleOpenCancelModal = (booking: BookingHistoryType) => {
    if (new Date() >= new Date(booking.checkInAt)) {
      alert('Đơn đã đến hoặc qua giờ nhận phòng nên không thể yêu cầu hủy/hoàn.');
      return;
    }
    setCancelModal({
      isOpen: true,
      booking,
      reason: '',
      submitting: false,
    });
  };

  const handleSubmitCancel = async () => {
    if (!cancelModal.booking || !cancelModal.reason.trim()) return;
    try {
      setCancelModal((prev) => ({ ...prev, submitting: true }));
      await cancellationApi.requestCancellation({
        bookingId: cancelModal.booking.id,
        reason: cancelModal.reason.trim(),
      });
      alert('Đã gửi yêu cầu hủy và hoàn tiền thành công. Quản lý khách sạn sẽ xét duyệt.');
      setCancelModal({
        isOpen: false,
        booking: null,
        reason: '',
        submitting: false,
      });
      // Refresh
      const data = await bookingApi.getHistory();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Không thể gửi yêu cầu hủy đơn.');
      setCancelModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        Đang tải lịch sử đặt phòng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="sticky top-0 z-50 w-full bg-white shadow-md">
              <Header />
       </div>
      <section className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Lịch sử đặt phòng
          </h1>

          <p className="mt-2 text-gray-500">
            Xem lại những phòng bạn
            đã đặt.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            Bạn chưa có lịch sử đặt
            phòng.
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(
              (booking) => (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="grid md:grid-cols-[280px_1fr]">
                    {/* ẢNH PHÒNG */}
                    <img
                      src={getImageUrl(
                        booking.roomImage,
                      )}
                      alt={
                        booking.roomName ??
                        'Room'
                      }
                      className="h-full min-h-56 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          PLACEHOLDER_IMAGE;
                      }}
                    />

                    {/* THÔNG TIN */}
                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Mã đặt phòng
                          </p>

                          <h2 className="text-xl font-bold">
                            {
                              booking.bookingCode
                            }
                          </h2>
                        </div>

                        <BookingStatus
                          status={
                            booking.status
                          }
                        />
                      </div>

                      <div className="mt-5">
                        <h3 className="text-lg font-semibold">
                          {booking.hotelName ??
                            'Khách sạn'}
                        </h3>

                        {booking.hotelAddress && (
                          <p className="text-sm text-gray-500">
                            {
                              booking.hotelAddress
                            }
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        <p className="font-semibold">
                          {booking.roomName ??
                            `Room ${booking.roomId}`}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-gray-500">
                            Nhận phòng
                          </p>

                          <p className="font-medium">
                            {formatDate(
                              booking.checkInAt,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Trả phòng
                          </p>

                          <p className="font-medium">
                            {formatDate(
                              booking.checkOutAt,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Số khách
                          </p>

                          <p className="font-medium">
                            {
                              booking.totalGuests
                            }{' '}
                            người
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Số phòng
                          </p>

                          <p className="font-medium">
                            {
                              booking.requestedRoomCount
                            }{' '}
                            phòng
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 border-t pt-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-sm font-medium">Thanh toán:</span>
                            {booking.paymentStatus === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                ✓ Đã thanh toán {booking.vnpTransactionNo ? `(#${booking.vnpTransactionNo})` : ''}
                              </span>
                            ) : booking.status === 'PAYMENT_PENDING' || booking.paymentStatus === 'PENDING' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                ⏳ Chờ thanh toán (15 phút)
                              </span>
                            ) : booking.status === 'PAYMENT_EXPIRED' || booking.paymentStatus === 'EXPIRED' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                                ✕ Hết hạn thanh toán
                              </span>
                            ) : booking.status === 'PAYMENT_REVIEW' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                                ⚠ Cần đối soát / Hoàn tiền
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">Chưa ghi nhận</span>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-xl font-bold text-red-600">
                              {Number(booking.estimatedTotal).toLocaleString('vi-VN')} ₫
                            </span>

                            {booking.paymentStatus === 'PAID' &&
                              (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                <button
                                  onClick={() => handleOpenCancelModal(booking)}
                                  disabled={new Date() >= new Date(booking.checkInAt)}
                                  title={
                                    new Date() >= new Date(booking.checkInAt)
                                      ? 'Đơn đã đến hoặc qua giờ nhận phòng nên không thể yêu cầu hủy/hoàn'
                                      : 'Gửi yêu cầu hủy và hoàn tiền'
                                  }
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition ${
                                    new Date() >= new Date(booking.checkInAt)
                                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                      : 'border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer'
                                  }`}
                                >
                                  Yêu cầu hủy
                                </button>
                              )}

                            {(booking.status === 'PAYMENT_PENDING' ||
                              booking.paymentStatus === 'PENDING' ||
                              booking.status === 'PAYMENT_EXPIRED' ||
                              booking.paymentStatus === 'EXPIRED') && (
                              <button
                                onClick={() => handleRetryPayment(booking.id)}
                                disabled={retryingId === booking.id}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-xs transition"
                              >
                                {retryingId === booking.id
                                  ? 'Đang xử lý...'
                                  : booking.status === 'PAYMENT_EXPIRED' || booking.paymentStatus === 'EXPIRED'
                                  ? 'Thanh toán lại'
                                  : 'Thanh toán ngay'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* MODAL YÊU CẦU HỦY & HOÀN TIỀN */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Yêu Cầu Hủy Đơn & Hoàn Tiền
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Mã đơn: <strong className="font-mono">{cancelModal.booking?.bookingCode || cancelModal.booking?.id}</strong>
            </p>

            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              Lưu ý: Yêu cầu của bạn sẽ được gửi tới khách sạn để duyệt hoàn tiền theo chính sách. Số tiền hoàn sẽ được hoàn qua cổng thanh toán VNPay.
            </div>

            <div className="mt-4 space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Lý do hủy đặt phòng <span className="text-red-500">*</span>:
              </label>
              <textarea
                rows={3}
                value={cancelModal.reason}
                onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Nhập lý do chi tiết..."
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={cancelModal.submitting}
                onClick={() => setCancelModal((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!cancelModal.reason.trim() || cancelModal.submitting}
                onClick={handleSubmitCancel}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelModal.submitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-16 bg-white shadow-md">
        <Footer />
      </div>
    </main>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('vi-VN');
}

function BookingStatus({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string }
  > = {
    PAYMENT_PENDING: {
      label: 'Chờ thanh toán VNPay',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    PENDING: {
      label: 'Đang chờ khách sạn duyệt',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    CONFIRMED: {
      label: 'Khách sạn đã xác nhận',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    REJECTED: {
      label: 'Đã từ chối',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
    },
    CHECKED_IN: {
      label: 'Đã nhận phòng',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
    },
    COMPLETED: {
      label: 'Hoàn thành',
      bg: 'bg-teal-50',
      text: 'text-teal-700',
    },
    CANCELLED: {
      label: 'Đã hủy',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
    },
    PAYMENT_EXPIRED: {
      label: 'Hết hạn thanh toán',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
    },
    PAYMENT_REVIEW: {
      label: 'Cần kiểm tra hoàn tiền',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
    },
  };

  const config = statusConfig[status] ?? {
    label: status,
    bg: 'bg-gray-50',
    text: 'text-gray-700',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}