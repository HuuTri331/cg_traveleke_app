'use client';

import Link from 'next/link';
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import Header from '@/components/common/HeaderCommon';
import Footer from '@/components/common/FooterCommon';
import { MapPin, Star } from 'lucide-react';

import { hotelSearchApi } from '@/services/api/hotel-search.api';

import type {
  HotelSearchItem,
  HotelSearchMeta,
  HotelStatus,
} from '@/types/hotel-search';

const BACKEND_URL = 'http://localhost:3001';

const PLACEHOLDER_IMAGE =
  '/images/hotel-placeholder.png';

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

export default function HotelsHomePage() {
  const [keyword, setKeyword] =
    useState('');

  const [starRating, setStarRating] =
    useState<number | undefined>();

  const [status, setStatus] =
    useState<HotelStatus | undefined>(
      'ACTIVE',
    );

  const [hotels, setHotels] = useState<
    HotelSearchItem[]
  >([]);

  const [meta, setMeta] =
    useState<HotelSearchMeta | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  // ============================================================
  // SEARCH HOTEL
  // ============================================================

  const searchHotels = useCallback(
    async (
      searchKeyword = '',
      selectedStarRating?: number,
      selectedStatus?: HotelStatus,
      page = 1,
    ) => {
      try {
        setLoading(true);
        setError('');

        const result =
          await hotelSearchApi.search({
            keyword:
              searchKeyword.trim() ||
              undefined,

            starRating:
              selectedStarRating,

            status:
              selectedStatus,

            page,

            perPage: 9,
          });

        setHotels(result.data);
        setMeta(result.meta);
      } catch (error) {
        console.error(
          'Lỗi tìm kiếm khách sạn:',
          error,
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            'Không thể tải danh sách khách sạn.',
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ============================================================
  // LOAD HOTEL LẦN ĐẦU
  // ============================================================

  useEffect(() => {
    void searchHotels(
      '',
      undefined,
      'ACTIVE',
      1,
    );
  }, [searchHotels]);

  // ============================================================
  // SUBMIT SEARCH
  // ============================================================

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    void searchHotels(
      keyword,
      starRating,
      status,
      1,
    );
  };

  // ============================================================
  // RESET SEARCH
  // ============================================================

  const handleReset = () => {
    setKeyword('');
    setStarRating(undefined);
    setStatus('ACTIVE');

    void searchHotels(
      '',
      undefined,
      'ACTIVE',
      1,
    );
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handlePreviousPage = () => {
    if (
      !meta ||
      meta.page <= 1
    ) {
      return;
    }

    void searchHotels(
      keyword,
      starRating,
      status,
      meta.page - 1,
    );
  };

  const handleNextPage = () => {
    if (
      !meta ||
      meta.page >=
        meta.totalPages
    ) {
      return;
    }

    void searchHotels(
      keyword,
      starRating,
      status,
      meta.page + 1,
    );
  };

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <Header />
      </header>

      <main>
        {/* =====================================================
            SEARCH HOTEL
        ===================================================== */}

        <section className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <h1 className="mb-6 text-3xl font-bold">
              Tìm khách sạn
            </h1>

            <form
              onSubmit={
                handleSubmit
              }
              className="
                grid
                grid-cols-1
                gap-3
                rounded-xl
                bg-white
                p-5
                shadow-sm
                md:grid-cols-4
              "
            >
              {/* KEYWORD */}
              <input
                type="text"
                value={keyword}
                onChange={(
                  event,
                ) =>
                  setKeyword(
                    event.target
                      .value,
                  )
                }
                placeholder="Tên khách sạn hoặc địa chỉ..."
                className="
                  rounded-lg
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  focus:border-blue-500
                "
              />

              {/* STAR RATING */}
              <select
                value={
                  starRating ??
                  ''
                }
                onChange={(
                  event,
                ) => {
                  const value =
                    event.target
                      .value;

                  setStarRating(
                    value
                      ? Number(
                          value,
                        )
                      : undefined,
                  );
                }}
                className="
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-3
                  outline-none
                  focus:border-blue-500
                "
              >
                <option value="">
                  Tất cả số sao
                </option>

                <option value="1">
                  1 sao
                </option>

                <option value="2">
                  2 sao
                </option>

                <option value="3">
                  3 sao
                </option>

                <option value="4">
                  4 sao
                </option>

                <option value="5">
                  5 sao
                </option>
              </select>

              {/* STATUS */}
              <select
                value={
                  status ?? ''
                }
                onChange={(
                  event,
                ) => {
                  const value =
                    event.target
                      .value;

                  setStatus(
                    value
                      ? (value as HotelStatus)
                      : undefined,
                  );
                }}
                className="
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-3
                  outline-none
                  focus:border-blue-500
                "
              >
                <option value="">
                  Tất cả trạng thái
                </option>

                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="DRAFT">
                  DRAFT
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>
              </select>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={
                  loading
                }
                className="
                  rounded-lg
                  bg-blue-600
                  px-6
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? 'Đang tìm...'
                  : 'Tìm kiếm'}
              </button>

              {/* RESET */}
              <button
                type="button"
                onClick={
                  handleReset
                }
                disabled={
                  loading
                }
                className="
                  rounded-lg
                  border
                  border-gray-300
                  px-6
                  py-3
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-100
                  disabled:opacity-50
                  md:col-span-4
                  md:justify-self-start
                "
              >
                Xóa bộ lọc
              </button>
            </form>
          </div>
        </section>

        {/* =====================================================
            HOTEL LIST
        ===================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              Khách sạn
            </h2>

            {meta &&
              !error && (
                <p className="text-gray-500">
                  Tìm thấy{' '}
                  <strong>
                    {meta.total}
                  </strong>{' '}
                  khách sạn
                </p>
              )}
          </div>

          {/* LOADING */}
          {loading && (
            <p className="py-10 text-center text-gray-500">
              Đang tải danh sách khách sạn...
            </p>
          )}

          {/* ERROR */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            hotels.length ===
              0 && (
              <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
                Không tìm thấy
                khách sạn phù
                hợp.
              </div>
            )}

          {/* HOTEL GRID */}
          {!loading &&
            !error &&
            hotels.length >
              0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hotels.map(
                  (hotel, idx) => {
                    const discountRate = [15, 25, 34, 10, 39, 45][idx % 6];
                    const basePrice = 320000 + (idx * 85000);
                    const origPrice = Math.round(basePrice / (1 - discountRate / 100));
                    const score = (8.2 + (idx % 12) * 0.1).toFixed(1);
                    const reviewCount = 80 + idx * 35;
                    const locationText = hotel.address ? hotel.address.split(',')[0].trim() : 'Ward 4';

                    return (
                      <Link
                        key={hotel.id}
                        href={`/hotels_home/${hotel.id}`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                      >
                        {/* IMAGE */}
                        <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                          <img
                            src={getImageUrl(
                              hotel.coverImageUrl,
                            )}
                            alt={hotel.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />

                          {/* Top-left location pill */}
                          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-[#1a4b75]/85 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                            <MapPin className="h-3.5 w-3.5 text-white shrink-0" />
                            <span className="truncate max-w-[140px]">{locationText}</span>
                          </div>

                          {/* Bottom-right discount tag */}
                          <div className="absolute bottom-0 right-0 rounded-tl-lg bg-[#ff5e1f] px-2.5 py-1 text-xs font-bold text-white shadow-md">
                            Save {discountRate}%
                          </div>
                        </div>

                        {/* INFO */}
                        <div className="flex flex-1 flex-col p-4">
                          {/* Hotel Name */}
                          <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-[#0194f3] transition-colors">
                            {hotel.name}
                          </h3>

                          {/* STAR */}
                          <div className="mt-1 flex items-center gap-0.5 text-xs text-yellow-400">
                            {Array.from({
                              length: hotel.starRating ?? 3,
                            }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>

                          {/* REVIEWS */}
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                            <span className="font-bold text-[#0194f3]">
                              {score}/10
                            </span>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-500">
                              {reviewCount} đánh giá
                            </span>
                          </div>

                          {/* ADDRESS */}
                          {hotel.address && (
                            <p className="mt-2 line-clamp-1 text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                              <span>{hotel.address}</span>
                            </p>
                          )}

                          {/* PRICE & BUTTON */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-end justify-between gap-2">
                            <div>
                              <p className="text-xs text-gray-400 line-through">
                                {new Intl.NumberFormat('vi-VN').format(origPrice)} VND
                              </p>
                              <p className="text-lg font-bold text-[#ff5e1f]">
                                {new Intl.NumberFormat('vi-VN').format(basePrice)} VND
                              </p>
                            </div>

                            <span className="rounded-xl bg-[#0194f3] group-hover:bg-[#0080d4] text-white font-bold px-4 py-2 text-xs transition-colors shadow-xs">
                              Xem phòng
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            )}

          {/* =====================================================
              PAGINATION
          ===================================================== */}

          {meta &&
            !error &&
            meta.totalPages >
              1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={
                    handlePreviousPage
                  }
                  disabled={
                    loading ||
                    meta.page <=
                      1
                  }
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-5
                    py-2
                    font-medium
                    transition
                    hover:bg-gray-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  ← Trang trước
                </button>

                <span className="rounded-lg bg-gray-100 px-4 py-2">
                  Trang{' '}
                  <strong>
                    {meta.page}
                  </strong>{' '}
                  /{' '}
                  {
                    meta.totalPages
                  }
                </span>

                <button
                  type="button"
                  onClick={
                    handleNextPage
                  }
                  disabled={
                    loading ||
                    meta.page >=
                      meta.totalPages
                  }
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-5
                    py-2
                    font-medium
                    transition
                    hover:bg-gray-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Trang sau →
                </button>
              </div>
            )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 bg-white shadow-md">
        <Footer />
      </footer>
    </>
  );
}