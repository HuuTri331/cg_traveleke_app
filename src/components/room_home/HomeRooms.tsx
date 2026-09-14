'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';

import Header from '@/components/common/HeaderCommon';
import Footer from '@/components/common/FooterCommon';

import { homeRoomApi } from '@/services/api/home-room.api';
import {
  Room,
  RoomSearchParams,
} from '@/types/room';

interface HomeRoomsProps {
  hotelId?: string;
}

const BACKEND_URL = 'http://localhost:3001';

const PLACEHOLDER_IMAGE =
  '/images/room-placeholder.png';

const DEFAULT_LIMIT = 12;

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

export default function HomeRooms({
  hotelId,
}: HomeRoomsProps) {
  const router = useRouter();
  const { isCustomerAuthenticated } = useCustomerAuth();

  // ============================================================
  // ROOM DATA
  // ============================================================

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // ============================================================
  // SEARCH FORM
  // ============================================================

  const [keyword, setKeyword] =
    useState('');

  const [minPrice, setMinPrice] =
    useState('');

  const [maxPrice, setMaxPrice] =
    useState('');

  const [maxAdults, setMaxAdults] =
    useState('');

  const [maxChildren, setMaxChildren] =
    useState('');

  const [bedType, setBedType] =
    useState('');

  const [minRating, setMinRating] =
    useState('');

  // ============================================================
  // PARAMS ĐANG ĐƯỢC ÁP DỤNG
  // ============================================================

  const [searchParams, setSearchParams] =
    useState<RoomSearchParams>({
      page: 1,
      limit: DEFAULT_LIMIT,
      status: 'AVAILABLE',
    });

  // ============================================================
  // PAGINATION
  // ============================================================

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(0);

  const [total, setTotal] =
    useState(0);

  // ============================================================
  // FETCH SEARCH ROOM
  // ============================================================

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError('');

        const params: RoomSearchParams = {
          ...searchParams,

          page,

          limit: DEFAULT_LIMIT,

          status: 'AVAILABLE',
        };

        // Nếu trang phòng đang thuộc 1 khách sạn cụ thể
        if (hotelId) {
          params.hotelId =
            Number(hotelId);
        }

        const result =
          await homeRoomApi.searchRooms(
            params,
          );

        setRooms(
          Array.isArray(result?.data)
            ? result.data
            : [],
        );

        setTotal(
          result?.meta?.total ?? 0,
        );

        setTotalPages(
          result?.meta?.totalPages ?? 0,
        );
      } catch (error) {
        console.error(
          'Lỗi tìm kiếm phòng:',
          error,
        );

        setError(
          'Không thể tải danh sách phòng.',
        );

        setRooms([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [
    hotelId,
    page,
    searchParams,
  ]);

  // ============================================================
  // SUBMIT SEARCH
  // ============================================================

  const handleSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      minPrice &&
      maxPrice &&
      Number(minPrice) >
        Number(maxPrice)
    ) {
      setError(
        'Giá tối thiểu không được lớn hơn giá tối đa.',
      );

      return;
    }

    setError('');

    const params: RoomSearchParams = {
      keyword:
        keyword.trim() || undefined,

      minPrice: minPrice
        ? Number(minPrice)
        : undefined,

      maxPrice: maxPrice
        ? Number(maxPrice)
        : undefined,

      maxAdults: maxAdults
        ? Number(maxAdults)
        : undefined,

      maxChildren:
        maxChildren !== ''
          ? Number(maxChildren)
          : undefined,

      bedType:
        bedType.trim() || undefined,

      minRating: minRating
        ? Number(minRating)
        : undefined,

      status: 'AVAILABLE',

      page: 1,

      limit: DEFAULT_LIMIT,
    };

    setPage(1);

    setSearchParams(params);
  };

  // ============================================================
  // RESET SEARCH
  // ============================================================

  const handleReset = () => {
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    setMaxAdults('');
    setMaxChildren('');
    setBedType('');
    setMinRating('');

    setPage(1);

    setSearchParams({
      page: 1,
      limit: DEFAULT_LIMIT,
      status: 'AVAILABLE',
    });

    setError('');
  };

  // ============================================================
  // PAGE CHANGE
  // ============================================================

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((current) =>
        current - 1,
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((current) =>
        current + 1,
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleBookRoom = (room: Room) => {
    const bookingData = {
      hotelId: room.hotelId || hotelId || null,
      hotelName: (room as any).hotel?.name || 'Khách sạn',
      hotelAddress: (room as any).hotel?.address || '',
      hotelStar: (room as any).hotel?.starRating || 5,
      hotelImage: (room as any).hotel?.images?.[0]?.imageUrl || getImageUrl(room.images?.[0]?.imageUrl),
      roomId: room.id,
      roomName: room.name,
      roomPrice: room.pricePerNight,
      bedCount: room.bedCount || 1,
      bedType: room.bedType || 'Tiêu chuẩn',
      maxAdults: room.maxAdults || 2,
      availableRooms: room.availableRooms || 1,
      checkInTime: '14:00:00',
      checkOutTime: '12:00:00',
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('traveleke_pending_order', JSON.stringify(bookingData));
    }

    const targetUrl = `/process-order?roomId=${room.id}${room.hotelId || hotelId ? `&hotelId=${room.hotelId || hotelId}` : ''}`;
    if (!isCustomerAuthenticated) {
      router.push(`/customer-login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <>
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="sticky top-0 z-50 w-full bg-white shadow-md">
        <Header />
      </div>

      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-7xl px-4 py-10">
          {/* ================================================== */}
          {/* TITLE */}
          {/* ================================================== */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {hotelId
                ? 'Danh sách phòng của khách sạn'
                : 'Tìm kiếm phòng'}
            </h1>

            <p className="mt-2 text-gray-500">
              Tìm phòng phù hợp với
              nhu cầu và ngân sách của
              bạn.
            </p>
          </div>

          {/* ================================================== */}
          {/* SEARCH FORM */}
          {/* ================================================== */}

          <form
            onSubmit={handleSearch}
            className="mb-10 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* KEYWORD */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Từ khóa
                </label>

                <input
                  type="text"
                  value={keyword}
                  onChange={(e) =>
                    setKeyword(
                      e.target.value,
                    )
                  }
                  placeholder="Tên phòng, loại giường..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* MIN PRICE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Giá từ
                </label>

                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(
                      e.target.value,
                    )
                  }
                  placeholder="500000"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* MAX PRICE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Giá đến
                </label>

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(
                      e.target.value,
                    )
                  }
                  placeholder="2000000"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* BED TYPE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Loại giường
                </label>

                <input
                  type="text"
                  value={bedType}
                  onChange={(e) =>
                    setBedType(
                      e.target.value,
                    )
                  }
                  placeholder="Giường Đôi"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ADULTS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Người lớn
                </label>

                <input
                  type="number"
                  min="1"
                  value={maxAdults}
                  onChange={(e) =>
                    setMaxAdults(
                      e.target.value,
                    )
                  }
                  placeholder="2"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* CHILDREN */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Trẻ em
                </label>

                <input
                  type="number"
                  min="0"
                  value={maxChildren}
                  onChange={(e) =>
                    setMaxChildren(
                      e.target.value,
                    )
                  }
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* RATING */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Đánh giá tối thiểu
                </label>

                <select
                  value={minRating}
                  onChange={(e) =>
                    setMinRating(
                      e.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Tất cả
                  </option>

                  <option value="5">
                    5 sao
                  </option>

                  <option value="4">
                    Từ 4 sao
                  </option>

                  <option value="3">
                    Từ 3 sao
                  </option>

                  <option value="2">
                    Từ 2 sao
                  </option>

                  <option value="1">
                    Từ 1 sao
                  </option>
                </select>
              </div>
            </div>

            {/* BUTTON */}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Đang tìm...'
                  : 'Tìm kiếm'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Đặt lại
              </button>
            </div>
          </form>

          {/* ================================================== */}
          {/* RESULT SUMMARY */}
          {/* ================================================== */}

          {!loading &&
            !error &&
            rooms.length > 0 && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  Tìm thấy{' '}
                  <strong className="text-gray-900">
                    {total}
                  </strong>{' '}
                  phòng phù hợp.
                </p>

                {totalPages > 0 && (
                  <p className="text-sm text-gray-500">
                    Trang {page} /{' '}
                    {totalPages}
                  </p>
                )}
              </div>
            )}

          {/* ================================================== */}
          {/* LOADING */}
          {/* ================================================== */}

          {loading && (
            <div className="rounded-xl bg-white py-16 text-center shadow-sm">
              <p className="text-gray-500">
                Đang tìm kiếm phòng...
              </p>
            </div>
          )}

          {/* ================================================== */}
          {/* ERROR */}
          {/* ================================================== */}

          {!loading && error && (
            <div className="rounded-xl bg-red-50 px-4 py-10 text-center text-red-600">
              {error}
            </div>
          )}

          {/* ================================================== */}
          {/* EMPTY */}
          {/* ================================================== */}

          {!loading &&
            !error &&
            rooms.length === 0 && (
              <div className="rounded-xl border bg-white py-16 text-center text-gray-500">
                Không tìm thấy phòng phù
                hợp với điều kiện tìm
                kiếm.
              </div>
            )}

          {/* ================================================== */}
          {/* ROOM LIST */}
          {/* ================================================== */}

          {!loading &&
            !error &&
            rooms.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rooms.map((room) => (
                    <article
                      key={room.id}
                      className="overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* IMAGE */}

                      <div className="relative">
                        <img
                          src={getImageUrl(
                            room.coverImageUrl,
                          )}
                          alt={room.name}
                          className="h-56 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              PLACEHOLDER_IMAGE;
                          }}
                        />

                        {/* STATUS */}

                        {room.status && (
                          <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-600 shadow">
                            {room.status}
                          </span>
                        )}

                        {/* RATING */}

                        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-semibold text-yellow-600 shadow">
                          ⭐{' '}
                          {Number(
                            room.rating,
                          ).toFixed(1)}
                        </span>
                      </div>

                      {/* CONTENT */}

                      <div className="p-5">
                        <h2 className="text-xl font-bold text-gray-900">
                          {room.name}
                        </h2>

                        {room.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                            {
                              room.description
                            }
                          </p>
                        )}

                        {/* ROOM INFO */}

                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-gray-600">
                          {room.bedType && (
                            <div className="rounded-lg bg-gray-50 p-3">
                              <p className="text-xs text-gray-400">
                                Giường
                              </p>

                              <p className="mt-1 font-medium">
                                🛏{' '}
                                {
                                  room.bedType
                                }
                              </p>
                            </div>
                          )}

                          {room.roomSize && (
                            <div className="rounded-lg bg-gray-50 p-3">
                              <p className="text-xs text-gray-400">
                                Diện tích
                              </p>

                              <p className="mt-1 font-medium">
                                📐{' '}
                                {
                                  room.roomSize
                                }{' '}
                                m²
                              </p>
                            </div>
                          )}

                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-400">
                              Người lớn
                            </p>

                            <p className="mt-1 font-medium">
                              👤{' '}
                              {
                                room.maxAdults
                              }
                            </p>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-400">
                              Trẻ em
                            </p>

                            <p className="mt-1 font-medium">
                              👶{' '}
                              {
                                room.maxChildren
                              }
                            </p>
                          </div>
                        </div>

                        {/* AVAILABLE */}

                        <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                          Còn{' '}
                          <strong>
                            {
                              room.availableRooms
                            }
                          </strong>{' '}
                          phòng
                        </div>

                        {/* CHECK IN / OUT */}

                        <div className="mt-4 flex justify-between text-sm text-gray-500">
                          <span>
                            Nhận phòng:{' '}
                            {
                              room.checkInTime
                            }
                          </span>

                          <span>
                            Trả phòng:{' '}
                            {
                              room.checkOutTime
                            }
                          </span>
                        </div>

                        {/* PRICE */}

                        <div className="mt-5 border-t pt-4">
                          <p className="text-sm text-gray-500">
                            Giá mỗi đêm
                          </p>

                          <div className="mt-1 flex items-end justify-between gap-3">
                            <p className="text-2xl font-bold text-red-600">
                              {Number(
                                room.pricePerNight,
                              ).toLocaleString(
                                'vi-VN',
                              )}{' '}
                              ₫
                            </p>

                            <span className="text-sm text-gray-400">
                              / đêm
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBookRoom(room)}
                          className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
                        >
                          Đặt phòng
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* ============================================ */}
                {/* PAGINATION */}
                {/* ============================================ */}

                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={
                        handlePreviousPage
                      }
                      disabled={page <= 1}
                      className="rounded-xl border bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Trang trước
                    </button>

                    <span className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm">
                      {page} /{' '}
                      {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={
                        handleNextPage
                      }
                      disabled={
                        page >=
                        totalPages
                      }
                      className="rounded-xl border bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Trang sau →
                    </button>
                  </div>
                )}
              </>
            )}
        </section>
      </main>

      {/* ====================================================== */}
      {/* FOOTER */}
      {/* ====================================================== */}

      <div className="mt-16 bg-white shadow-md">
        <Footer />
      </div>
    </>
  );
}