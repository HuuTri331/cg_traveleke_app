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

  useEffect(() => {
    const fetchBookings =
      async () => {
        try {
          setLoading(true);
          setError('');

          /*
           * Tạm thời userId = 1.
           *
           * Sau này lấy từ
           * tài khoản đăng nhập.
           */
          const data =
            await bookingApi.getHistory(
              '1',
            );

          setBookings(
            Array.isArray(data)
              ? data
              : [],
          );
        } catch (error) {
          console.error(
            'Lỗi lấy lịch sử booking:',
            error,
          );

          setError(
            'Không thể tải lịch sử đặt phòng.',
          );
        } finally {
          setLoading(false);
        }
      };

    fetchBookings();
  }, []);

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

                      <div className="mt-6 border-t pt-5">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">
                            Tổng tiền
                          </span>

                          <span className="text-xl font-bold text-red-600">
                            {Number(
                              booking.estimatedTotal,
                            ).toLocaleString(
                              'vi-VN',
                            )}{' '}
                            ₫
                          </span>
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
      <div className="mt-16 bg-white shadow-md">
              <Footer/>
      </div>
    </main>
  );
}

function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleString('vi-VN');
}

function BookingStatus({
  status,
}: {
  status: string;
}) {
  const statusName: Record<
    string,
    string
  > = {
    PENDING: 'Chờ xác nhận',

    CONFIRMED:
      'Đã xác nhận',

    REJECTED: 'Đã từ chối',

    CHECKED_IN:
      'Đã nhận phòng',

    COMPLETED:
      'Hoàn thành',

    CANCELLED:
      'Đã hủy',
  };

  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
      {statusName[status] ??
        status}
    </span>
  );
}