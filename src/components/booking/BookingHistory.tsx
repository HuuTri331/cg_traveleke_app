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
import { bookingPresenceApi } from '@/services/api/booking-presence.api';
import { cancellationApi } from '@/services/api/cancellation.api';
import {
  guestConversationsApi,
  GuestMessageItem,
} from '@/services/api/guest-conversations.api';
import { StaffRatingForm } from '@/components/booking/StaffRatingForm';
import { BookingBenefitPanel } from '@/components/promotions/BookingBenefitPanel';
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

  const [lateNoticeModal, setLateNoticeModal] = useState<{
    isOpen: boolean;
    booking: BookingHistoryType | null;
    expectedArrivalAt: string;
    note: string;
    submitting: boolean;
  }>({
    isOpen: false,
    booking: null,
    expectedArrivalAt: '',
    note: '',
    submitting: false,
  });

  // Đợt 5: Modal đánh giá nhân viên phục vụ theo từng giai đoạn (1-5 sao)
  const [ratingModalBooking, setRatingModalBooking] = useState<BookingHistoryType | null>(null);

  // Đợt 4: Modal liên hệ khách sạn / gửi yêu cầu hỗ trợ gắn với booking
  const [supportModal, setSupportModal] = useState<{
    isOpen: boolean;
    booking: BookingHistoryType | null;
    messages: GuestMessageItem[];
    loading: boolean;
    body: string;
    sending: boolean;
  }>({
    isOpen: false,
    booking: null,
    messages: [],
    loading: false,
    body: '',
    sending: false,
  });

  const handleOpenSupportModal = async (booking: BookingHistoryType) => {
    setSupportModal({
      isOpen: true,
      booking,
      messages: [],
      loading: true,
      body: '',
      sending: false,
    });
    try {
      const msgs = await guestConversationsApi.getMessages(booking.id);
      setSupportModal((prev) => ({
        ...prev,
        messages: Array.isArray(msgs) ? msgs : [],
        loading: false,
      }));
    } catch {
      setSupportModal((prev) => ({
        ...prev,
        messages: [],
        loading: false,
      }));
    }
  };

  const handleSendCustomerMessage = async () => {
    if (!supportModal.booking || !supportModal.body.trim()) return;
    try {
      setSupportModal((prev) => ({ ...prev, sending: true }));
      await guestConversationsApi.sendMessage(supportModal.booking.id, {
        body: supportModal.body.trim(),
        clientMsgId: `cust_msg_${supportModal.booking.id}_${Date.now()}`,
      });
      const msgs = await guestConversationsApi.getMessages(supportModal.booking.id);
      setSupportModal((prev) => ({
        ...prev,
        messages: Array.isArray(msgs) ? msgs : [],
        body: '',
        sending: false,
      }));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể gửi tin nhắn hỗ trợ.');
      setSupportModal((prev) => ({ ...prev, sending: false }));
    }
  };

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

  const handleSubmitLateNotice = async () => {
    if (!lateNoticeModal.booking || !lateNoticeModal.expectedArrivalAt) return;
    try {
      setLateNoticeModal((prev) => ({ ...prev, submitting: true }));
      await bookingPresenceApi.recordLateArrivalNotice(lateNoticeModal.booking.id, {
        expectedArrivalAt: new Date(lateNoticeModal.expectedArrivalAt).toISOString(),
        note: lateNoticeModal.note.trim() || undefined,
      });
      alert('Đã gửi thông báo dự kiến đến muộn tới lễ tân khách sạn thành công!');
      setLateNoticeModal({
        isOpen: false,
        booking: null,
        expectedArrivalAt: '',
        note: '',
        submitting: false,
      });
      const data = await bookingApi.getHistory();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Không thể gửi thông báo.');
      setLateNoticeModal((prev) => ({ ...prev, submitting: false }));
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

                      {/* P2-02: Hiển thị lễ tân / bộ phận hiện hành đang chịu trách nhiệm hỗ trợ đơn đặt phòng */}
                      {booking.responsibleContact && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs text-emerald-900">
                          <div>
                            <span className="font-semibold">
                              Đầu mối phụ trách hiện tại:{' '}
                            </span>
                            <span className="font-bold">
                              {booking.responsibleContact.publicName}
                            </span>{' '}
                            <span className="text-emerald-700">
                              ({booking.responsibleContact.roleLabel} • {booking.responsibleContact.supportGroup})
                            </span>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                            {booking.responsibleContact.status === 'AVAILABLE'
                              ? 'Đang trực hỗ trợ'
                              : 'Tổng đài điều phối 24/7'}
                          </span>
                        </div>
                      )}

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

                      {/* BANNERS FOR PRESENCE (NO_SHOW, CLOSED_NO_SHOW, CHECKED_IN) */}
                      {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') &&
                        booking.paymentStatus === 'PAID' &&
                        !booking.actualCheckInAt &&
                        new Date() < new Date(booking.checkOutAt) && (
                          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-blue-900 text-xs flex items-center gap-1.5">
                                <span>⏰</span> Kế hoạch nhận phòng
                              </h4>
                              {booking.lateArrivalExpectedAt ? (
                                <p className="text-xs text-blue-800">
                                  Bạn đã báo dự kiến đến lúc: <strong>{formatDate(booking.lateArrivalExpectedAt)}</strong>
                                  {booking.lateArrivalNote ? ` ("${booking.lateArrivalNote}")` : ''}.
                                </p>
                              ) : (
                                <p className="text-xs text-blue-800">
                                  Nếu bạn dự kiến đến muộn sau giờ nhận phòng tiêu chuẩn, hãy gửi thông báo để khách sạn chuẩn bị chu đáo nhất.
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setLateNoticeModal({
                                  isOpen: true,
                                  booking,
                                  expectedArrivalAt: toLocalDatetimeInput(booking.lateArrivalExpectedAt || booking.checkInAt),
                                  note: booking.lateArrivalNote || '',
                                  submitting: false,
                                });
                              }}
                              className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                            >
                              {booking.lateArrivalExpectedAt ? 'Cập nhật giờ đến' : 'Báo dự kiến đến muộn'}
                            </button>
                          </div>
                        )}

                      {booking.status === 'NO_SHOW' && (
                        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-amber-900 text-sm flex items-center gap-1.5">
                                <span>🏨</span> Khách sạn đang tiếp tục giữ phòng cho bạn
                              </h4>
                              <p className="text-xs text-amber-800 leading-relaxed">
                                Đơn đặt phòng của bạn đã thanh toán và được bảo đảm suất phòng cho đến hạn trả phòng (<strong>{formatDate(booking.checkOutAt)}</strong>). Khi đến khách sạn, bạn chỉ cần xuất trình mã <strong>{booking.bookingCode}</strong> tại quầy lễ tân để làm thủ tục nhận phòng.
                              </p>
                              {booking.lateArrivalExpectedAt && (
                                <p className="mt-2 text-xs text-amber-950 bg-amber-100/80 rounded-md p-2 border border-amber-200">
                                  ⏰ Bạn đã thông báo dự kiến đến lúc: <strong>{formatDate(booking.lateArrivalExpectedAt)}</strong>
                                  {booking.lateArrivalNote ? ` ("${booking.lateArrivalNote}")` : ''}
                                </p>
                              )}
                            </div>
                            {new Date() < new Date(booking.checkOutAt) && (
                              <button
                                onClick={() => {
                                  setLateNoticeModal({
                                    isOpen: true,
                                    booking,
                                    expectedArrivalAt: toLocalDatetimeInput(booking.lateArrivalExpectedAt),
                                    note: booking.lateArrivalNote || '',
                                    submitting: false,
                                  });
                                }}
                                className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition"
                              >
                                {booking.lateArrivalExpectedAt ? 'Cập nhật giờ đến' : 'Báo dự kiến đến muộn'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {booking.status === 'CLOSED_NO_SHOW' && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                          Đơn đặt phòng này đã kết thúc kỳ lưu trú mà không có lượt nhận phòng tại quầy lễ tân.
                        </div>
                      )}

                      {booking.status === 'CHECKED_IN' && booking.actualCheckInAt && (
                        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-800 flex items-center gap-2">
                          <span>✓</span>
                          <span>Đã nhận phòng thực tế lúc: <strong>{formatDate(booking.actualCheckInAt)}</strong></span>
                        </div>
                      )}

                      <div className="mt-6 border-t pt-5 space-y-4">
                        {booking.paymentStatus === 'PAID' && (
                          <BookingBenefitPanel bookingId={booking.id} mode="CUSTOMER" />
                        )}
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

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xl font-bold text-red-600 mr-2">
                              {Number(booking.estimatedTotal).toLocaleString('vi-VN')} ₫
                            </span>

                            {/* Đợt 4: Nút Liên hệ khách sạn / Yêu cầu hỗ trợ */}
                            {booking.status !== 'CANCELLED' &&
                              booking.status !== 'REJECTED' &&
                              booking.status !== 'PAYMENT_EXPIRED' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenSupportModal(booking)}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition cursor-pointer"
                                >
                                  💬 Liên hệ / Hỗ trợ
                                </button>
                              )}

                            {/* Đợt 5: Nút Đánh giá 1-5 sao nhân viên thực tế phục vụ */}
                            {(booking.status === 'CONFIRMED' ||
                              booking.status === 'CHECKED_IN' ||
                              booking.status === 'COMPLETED' ||
                              booking.paymentStatus === 'PAID') && (
                              <button
                                type="button"
                                onClick={() => setRatingModalBooking(booking)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                              >
                                ★ Đánh giá nhân viên
                              </button>
                            )}

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

      {/* MODAL BÁO DỰ KIẾN ĐẾN MUỘN (ARRIVAL INTENT) */}
      {lateNoticeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>⏰</span> Báo Dự Kiến Đến Muộn
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Mã đơn: <strong className="font-mono">{lateNoticeModal.booking?.bookingCode || lateNoticeModal.booking?.id}</strong>
            </p>

            <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-blue-800 border border-blue-200 leading-relaxed">
              Khách sạn luôn giữ phòng cho bạn trong toàn bộ kỳ lưu trú đã thanh toán. Thông báo này giúp lễ tân chuẩn bị phòng chu đáo nhất khi bạn tới nhận phòng.
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Thời gian dự kiến bạn sẽ tới khách sạn <span className="text-red-500">*</span>:
                </label>
                <input
                  type="datetime-local"
                  value={lateNoticeModal.expectedArrivalAt}
                  min={lateNoticeModal.booking ? toLocalDatetimeInput(lateNoticeModal.booking.checkInAt) : undefined}
                  max={lateNoticeModal.booking ? toLocalDatetimeInput(lateNoticeModal.booking.checkOutAt) : undefined}
                  onChange={(e) => setLateNoticeModal((prev) => ({ ...prev, expectedArrivalAt: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ghi chú cho quầy lễ tân (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={lateNoticeModal.note}
                  onChange={(e) => setLateNoticeModal((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Ví dụ: Chuyến bay bị delay 2 tiếng, tôi sẽ tới nhận phòng khoảng nửa đêm..."
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={lateNoticeModal.submitting}
                onClick={() => setLateNoticeModal((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!lateNoticeModal.expectedArrivalAt || lateNoticeModal.submitting}
                onClick={handleSubmitLateNotice}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {lateNoticeModal.submitting ? 'Đang gửi...' : 'Gửi Thông Báo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐÁNH GIÁ NHÂN VIÊN PHỤC VỤ THEO GIAI ĐOẠN (ĐỢT 5) */}
      {ratingModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Đánh Giá Nhân Viên Phục Vụ (1–5 Sao)
                </h3>
                <p className="text-xs text-gray-500">
                  Mã đơn: <strong className="font-mono">{ratingModalBooking.bookingCode || ratingModalBooking.id}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRatingModalBooking(null)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
            <StaffRatingForm bookingId={ratingModalBooking.id} />
          </div>
        </div>
      )}

      {/* MODAL LIÊN HỆ KHÁCH SẠN / YÊU CẦU HỖ TRỢ (ĐỢT 4 - KHÔNG DÙNG APP CHAT RIÊNG) */}
      {supportModal.isOpen && supportModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  💬 Liên Hệ Khách Sạn / Yêu Cầu Hỗ Trợ
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Đơn đặt phòng: <strong className="font-mono">{supportModal.booking.bookingCode || supportModal.booking.id}</strong> • {supportModal.booking.hotelName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupportModal((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 max-h-64 overflow-y-auto space-y-2.5 rounded-xl bg-gray-50 p-3 border border-gray-200">
              {supportModal.loading ? (
                <p className="text-xs text-gray-400 text-center py-6">Đang tải lịch sử trao đổi...</p>
              ) : supportModal.messages.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">
                  Chưa có tin nhắn nào. Hãy gửi yêu cầu hỗ trợ hoặc lời nhắn cho quầy lễ tân bên dưới.
                </p>
              ) : (
                supportModal.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl text-xs ${
                      m.senderRole === 'CUSTOMER'
                        ? 'bg-blue-600 text-white ml-8'
                        : 'bg-white border border-gray-200 text-gray-800 mr-8'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between text-[11px] mb-1 ${
                        m.senderRole === 'CUSTOMER' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      <span className="font-semibold">
                        {m.senderRole === 'CUSTOMER' ? 'Bạn' : 'Lễ tân khách sạn'}
                      </span>
                      <span>{formatDate(m.sentAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={supportModal.body}
                onChange={(e) => setSupportModal((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Nhập yêu cầu hỗ trợ (VD: Cần thêm khăn tắm, hỏi thông tin nhận phòng...)"
                className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="button"
                disabled={supportModal.sending || !supportModal.body.trim()}
                onClick={handleSendCustomerMessage}
                className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {supportModal.sending ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
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

function toLocalDatetimeInput(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
    NO_SHOW: {
      label: 'Chưa nhận phòng (Đang giữ phòng)',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
    },
    CLOSED_NO_SHOW: {
      label: 'Hết hạn nhận phòng (Vắng mặt)',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
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