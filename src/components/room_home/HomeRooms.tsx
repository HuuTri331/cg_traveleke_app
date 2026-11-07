'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';

import Header from '@/components/common/HeaderCommon';
import Footer from '@/components/common/FooterCommon';
import { Maximize2, Star, BedDouble, User, Users, Check } from 'lucide-react';

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
    <div className="luxury-site min-h-screen bg-white text-[#1E4752]">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <Header />

      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-7xl px-4 py-10">
          {/* ================================================== */}
          {/* TITLE */}
          {/* ================================================== */}

          <div className="lux-fade-up mb-8 border-b border-[#1E4752]/10 pb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E8A700]/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#1E4752] mb-2">
              Traveleke Curated Collection
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1E4752]">
              {hotelId
                ? 'Danh sách phòng của khách sạn'
                : 'Khám phá bộ sưu tập phòng nghỉ'}
            </h1>

            <p className="mt-2 text-sm font-medium text-[#1E4752]/75">
              Tìm phòng phù hợp với
              nhu cầu và ngân sách của
              quý khách.
            </p>
          </div>

          {/* ================================================== */}
          {/* SEARCH FORM */}
          {/* ================================================== */}

          <form
            onSubmit={handleSearch}
            className="lux-fade-up lux-delay-1 mb-10 rounded-3xl border border-[#1E4752]/15 bg-white p-6 shadow-[0_14px_38px_rgba(30,71,82,0.06)]"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* KEYWORD */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1E4752]/80">
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
                  className="w-full rounded-xl border border-[#1E4752]/20 bg-white px-4 py-3 text-sm font-medium text-[#1E4752] outline-none transition focus:border-[#E8A700] focus:ring-2 focus:ring-[#E8A700]/20"
                />
              </div>

              {/* MIN PRICE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1E4752]/80">
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
                  className="tabular-nums w-full rounded-xl border border-[#1E4752]/20 bg-white px-4 py-3 text-sm font-medium text-[#1E4752] outline-none transition focus:border-[#E8A700] focus:ring-2 focus:ring-[#E8A700]/20"
                />
              </div>

              {/* MAX PRICE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1E4752]/80">
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
                  className="tabular-nums w-full rounded-xl border border-[#1E4752]/20 bg-white px-4 py-3 text-sm font-medium text-[#1E4752] outline-none transition focus:border-[#E8A700] focus:ring-2 focus:ring-[#E8A700]/20"
                />
              </div>

              {/* BED TYPE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1E4752]/80">
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
                  className="w-full rounded-xl border border-[#1E4752]/20 bg-white px-4 py-3 text-sm font-medium text-[#1E4752] outline-none transition focus:border-[#E8A700] focus:ring-2 focus:ring-[#E8A700]/20"
                />
              </div>

              {/* ADULTS */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1E4752]/80">
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
                  className="tabular-nums w-full rounded-xl border border-[#1E4752]/20 bg-white px-4 py-3 text-sm font-medium text-[#1E4752] outline-none transition focus:border-[#E8A700] focus:ring-2 focus:ring-[#E8A700]/20"
                />
              </div>

              {/* CHILDREN */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1E4752]/80">
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
                  className="tabular-nums w-full rounded-xl border border-[#1E4752]/20 bg-white px-4 py-3 text-sm font-medium text-[#1E4752] outline-none transition focus:border-[#E8A700] focus:ring-2 focus:ring-[#E8A700]/20"
                />
              </div>

              {/* RATING */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#1E4752]/80">
                  Đánh giá tối thiểu
                </label>

                <select
                  value={minRating}
                  onChange={(e) =>
                    setMinRating(
                      e.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-[#1E4752]/20 bg-white px-4 py-3 text-sm font-medium text-[#1E4752] outline-none transition focus:border-[#E8A700] focus:ring-2 focus:ring-[#E8A700]/20"
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
                className="lux-press rounded-xl bg-[#E8A700] px-6 py-3 text-sm font-extrabold text-[#1E4752] transition hover:bg-[#E8A700]/90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {loading
                  ? 'Đang tìm...'
                  : 'Tìm kiếm phòng'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="lux-press rounded-xl border border-[#1E4752]/25 bg-white px-6 py-3 text-sm font-bold text-[#1E4752] transition hover:bg-[#1E4752]/5 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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
                <p className="text-sm font-medium text-[#1E4752]/80">
                  Tìm thấy{' '}
                  <strong className="font-extrabold text-[#1E4752] tabular-nums">
                    {total}
                  </strong>{' '}
                  phòng phù hợp.
                </p>

                {totalPages > 0 && (
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1E4752]/65 tabular-nums">
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
            <div className="rounded-3xl border border-[#1E4752]/10 bg-white py-16 text-center shadow-xs">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#1E4752]/15 border-t-[#E8A700]" />
              <p className="text-sm font-semibold text-[#1E4752]/75">
                Đang tìm kiếm phòng...
              </p>
            </div>
          )}

          {/* ================================================== */}
          {/* ERROR */}
          {/* ================================================== */}

          {!loading && error && (
            <div className="rounded-2xl border border-[#1E4752]/20 bg-[#E8A700]/15 px-4 py-8 text-center text-sm font-semibold text-[#1E4752]">
              {error}
            </div>
          )}

          {/* ================================================== */}
          {/* EMPTY */}
          {/* ================================================== */}

          {!loading &&
            !error &&
            rooms.length === 0 && (
              <div className="rounded-3xl border border-[#1E4752]/15 bg-white py-16 text-center text-sm font-semibold text-[#1E4752]/75">
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
                  {rooms.map((room) => {
                    const priceNum = parseFloat(room.pricePerNight) || 0;

                    return (
                      <article
                        key={room.id}
                        className="lux-card-hover group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1E4752]/15 bg-white shadow-xs"
                      >
                        {/* IMAGE */}
                        <div className="relative h-56 w-full overflow-hidden bg-[#1E4752]/5">
                          <img
                            src={getImageUrl(
                              room.coverImageUrl,
                            )}
                            alt={room.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src =
                                PLACEHOLDER_IMAGE;
                            }}
                          />

                          {/* Top-left Specs Badge */}
                          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#1E4752] px-3 py-1 text-xs font-bold text-white shadow-xs tabular-nums">
                            <Maximize2 className="h-3.5 w-3.5 text-[#E8A700]" />
                            <span>{room.roomSize ? `${room.roomSize} m²` : '18 m²'}</span>
                          </div>

                          {/* Top-right Rating */}
                          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-[#1E4752] shadow-xs border border-[#1E4752]/10 tabular-nums">
                            <Star className="h-3.5 w-3.5 fill-[#E8A700] text-[#E8A700]" />
                            <span>{Number(room.rating || 4.5).toFixed(1)}</span>
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex flex-1 flex-col justify-between p-5">
                          <div>
                            <h2 className="font-display text-lg font-bold text-[#1E4752] transition-colors line-clamp-1">
                              {room.name}
                            </h2>

                            {room.description && (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#1E4752]/75">
                                {room.description}
                              </p>
                            )}

                            {/* ROOM INFO */}
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#1E4752]">
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E4752]/15 bg-[#1E4752]/5 px-2.5 py-1 font-semibold">
                                <BedDouble className="h-3.5 w-3.5 text-[#1E4752]" />
                                <span>{room.bedCount} {room.bedType || 'giường'}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E4752]/15 bg-[#1E4752]/5 px-2.5 py-1 font-semibold">
                                <User className="h-3.5 w-3.5 text-[#1E4752]" />
                                <span>{room.maxAdults} người lớn</span>
                              </span>
                              {Number(room.maxChildren) > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E4752]/15 bg-[#1E4752]/5 px-2.5 py-1 font-semibold">
                                  <Users className="h-3.5 w-3.5 text-[#1E4752]" />
                                  <span>{room.maxChildren} trẻ em</span>
                                </span>
                              )}
                            </div>

                            {/* CANCELLATION */}
                            <p className="mt-2.5 flex items-center gap-1 text-xs font-bold text-[#1E4752]">
                              <Check className="h-3.5 w-3.5 text-[#E8A700]" />
                              <span>Miễn phí huỷ phòng</span>
                            </p>
                          </div>

                          {/* PRICE & ACTION */}
                          <div className="mt-4 border-t border-[#1E4752]/10 pt-3 flex items-end justify-between gap-2">
                            <div>
                              <div className="flex items-baseline gap-1 tabular-nums">
                                <span className="text-xl font-black text-[#1E4752]">
                                  {new Intl.NumberFormat('vi-VN').format(priceNum)}
                                </span>
                                <span className="text-xs font-extrabold text-[#E8A700]">
                                  VND
                                </span>
                              </div>
                              <p className="text-xs text-[#1E4752]/65">/ phòng / đêm</p>
                              {room.availableRooms <= 5 && room.availableRooms > 0 && (
                                <p className="text-xs font-extrabold text-[#1E4752] mt-0.5">
                                  Chỉ còn {room.availableRooms} phòng!
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleBookRoom(room)}
                              className="lux-press rounded-xl bg-[#E8A700] hover:bg-[#E8A700]/90 px-5 py-2.5 text-xs font-extrabold text-[#1E4752] shadow-xs transition-colors cursor-pointer"
                            >
                              Đặt ngay
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
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
                      className="lux-press rounded-xl border border-[#1E4752]/20 bg-white px-5 py-3 text-sm font-bold text-[#1E4752] transition hover:bg-[#1E4752]/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      ← Trang trước
                    </button>

                    <span className="tabular-nums rounded-xl bg-[#1E4752] px-5 py-3 text-sm font-bold text-white shadow-xs">
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
                      className="lux-press rounded-xl border border-[#1E4752]/20 bg-white px-5 py-3 text-sm font-bold text-[#1E4752] transition hover:bg-[#1E4752]/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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

      <div className="mt-16 bg-white border-t border-[#1E4752]/10">
        <Footer />
      </div>
    </div>
  );
}