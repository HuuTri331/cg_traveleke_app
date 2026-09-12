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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {hotels.map(
                  (hotel) => (
                    <div
                      key={
                        hotel.id
                      }
                      className="
                        flex
                        h-full
                        flex-col
                        overflow-hidden
                        rounded-xl
                        border
                        bg-white
                        shadow-sm
                        transition
                        hover:shadow-lg
                      "
                    >
                      {/* IMAGE */}
                      <div className="overflow-hidden">
                        <img
                          src={getImageUrl(
                            hotel.coverImageUrl,
                          )}
                          alt={
                            hotel.name
                          }
                          className="
                            h-52
                            w-full
                            object-cover
                            transition
                            duration-300
                            hover:scale-105
                          "
                          onError={(
                            event,
                          ) => {
                            event.currentTarget.src =
                              PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>

                      {/* INFO */}
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-xl font-semibold">
                          {
                            hotel.name
                          }
                        </h3>

                        {/* STAR */}
                        <p className="mt-2 text-yellow-500">
                          {'★'.repeat(
                            hotel.starRating ??
                              0,
                          )}

                          <span className="ml-2 text-sm text-gray-500">
                            {hotel.starRating
                              ? `${hotel.starRating} sao`
                              : 'Chưa xếp hạng'}
                          </span>
                        </p>

                        {/* ADDRESS */}
                        {hotel.address && (
                          <p className="mt-3 text-sm text-gray-600">
                            📍{' '}
                            {
                              hotel.address
                            }
                          </p>
                        )}

                        {/* CHECK IN */}
                        {hotel.checkInTime && (
                          <p className="mt-3 text-sm text-gray-600">
                            Check-in:{' '}
                            {
                              hotel.checkInTime
                            }
                          </p>
                        )}

                        {/* CHECK OUT */}
                        {hotel.checkOutTime && (
                          <p className="text-sm text-gray-600">
                            Check-out:{' '}
                            {
                              hotel.checkOutTime
                            }
                          </p>
                        )}

                        {/* STATUS */}
                        <div className="mt-4">
                          <span
                            className={`
                              inline-block
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-semibold

                              ${
                                hotel.status ===
                                'ACTIVE'
                                  ? 'bg-green-100 text-green-700'
                                  : ''
                              }

                              ${
                                hotel.status ===
                                'DRAFT'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : ''
                              }

                              ${
                                hotel.status ===
                                'INACTIVE'
                                  ? 'bg-gray-100 text-gray-700'
                                  : ''
                              }
                            `}
                          >
                            {
                              hotel.status
                            }
                          </span>
                        </div>

                        {/* DESCRIPTION */}
                        {hotel.description && (
                          <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                            {
                              hotel.description
                            }
                          </p>
                        )}

                        {/* XEM PHÒNG */}
                        <Link
                          href={`/hotels_home/${hotel.id}`}
                          className="
                            mt-auto
                            flex
                            w-full
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-600
                            px-4
                            py-3
                            pt-3
                            font-semibold
                            text-white
                            transition
                            hover:bg-blue-700
                          "
                        >
                          Xem phòng
                        </Link>
                      </div>
                    </div>
                  ),
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