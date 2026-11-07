'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { hotelSearchApi } from '@/services/api/hotel-search.api';
import {
  HotelSearchItem,
  HotelSearchMeta,
  HotelStatus,
} from '@/types/hotel-search';
import { Star } from 'lucide-react';

const BACKEND_URL = 'http://localhost:3001';

const PLACEHOLDER_IMAGE =
  '/images/room-placeholder.png';

const getHotelImageUrl = (
  imageUrl: string | null,
) => {
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE;
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  return `${BACKEND_URL}${imageUrl}`;
};

export default function HotelSearchPage() {
  const [keyword, setKeyword] = useState('');

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
    useState<HotelSearchMeta | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState('');

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

            perPage: 10,
          });

        setHotels(result.data);
        setMeta(result.meta);
      } catch (error) {
        console.error(
          'Lỗi search hotel:',
          error,
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            'Không thể tìm kiếm khách sạn.',
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void searchHotels(
      '',
      undefined,
      'ACTIVE',
      1,
    );
  }, [searchHotels]);

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

  const handlePreviousPage = () => {
    if (!meta || meta.page <= 1) {
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
      meta.page >= meta.totalPages
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
    <div className="luxury-site min-h-screen bg-white text-[#1E4752]">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="lux-fade-up mb-8 border-b border-[#1E4752]/10 pb-6">
          <span className="inline-block rounded-full bg-[#E8A700]/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#1E4752] mb-2">
            Traveleke Hospitality Directory
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1E4752]">
            Tìm kiếm khách sạn
          </h1>
          <p className="mt-1.5 text-sm font-medium text-[#1E4752]/75">
            Khám phá các khách sạn & khu nghỉ dưỡng tiêu chuẩn cao trên toàn quốc
          </p>
        </div>

        {/* SEARCH + FILTER */}
        <form
          onSubmit={handleSubmit}
          className="
            lux-fade-up lux-delay-1
            mb-8
            flex
            flex-col
            gap-3
            rounded-3xl
            border
            border-[#1E4752]/15
            bg-white
            p-5
            shadow-[0_14px_38px_rgba(30,71,82,0.06)]
            md:flex-row
          "
        >
          {/* KEYWORD */}
          <input
            type="text"
            value={keyword}
            onChange={(event) =>
              setKeyword(event.target.value)
            }
            placeholder="Nhập tên khách sạn hoặc địa chỉ..."
            className="
              flex-1
              rounded-xl
              border
              border-[#1E4752]/20
              bg-white
              px-4
              py-3
              text-sm
              font-medium
              text-[#1E4752]
              outline-none
              focus:border-[#E8A700]
              focus:ring-2
              focus:ring-[#E8A700]/20
              transition
            "
          />

          {/* STAR RATING */}
          <select
            value={starRating ?? ''}
            onChange={(event) => {
              const value =
                event.target.value;

              setStarRating(
                value
                  ? Number(value)
                  : undefined,
              );
            }}
            className="
              rounded-xl
              border
              border-[#1E4752]/20
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-[#1E4752]
              outline-none
              focus:border-[#E8A700]
              focus:ring-2
              focus:ring-[#E8A700]/20
              transition
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
            value={status ?? ''}
            onChange={(event) => {
              const value =
                event.target.value;

              setStatus(
                value
                  ? (value as HotelStatus)
                  : undefined,
              );
            }}
            className="
              rounded-xl
              border
              border-[#1E4752]/20
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-[#1E4752]
              outline-none
              focus:border-[#E8A700]
              focus:ring-2
              focus:ring-[#E8A700]/20
              transition
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

          {/* SEARCH BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              lux-press
              rounded-xl
              bg-[#E8A700]
              px-6
              py-3
              text-sm
              font-extrabold
              text-[#1E4752]
              hover:bg-[#E8A700]/90
              disabled:cursor-not-allowed
              disabled:opacity-50
              cursor-pointer
              shadow-xs
            "
          >
            {loading
              ? 'Đang tìm...'
              : 'Tìm kiếm'}
          </button>
        </form>

      {/* ERROR */}
      {error && (
        <div
          className="
            mb-4
            rounded-2xl
            border
            border-[#1E4752]/20
            bg-[#E8A700]/15
            p-4
            text-sm
            font-semibold
            text-[#1E4752]
          "
        >
          {error}
        </div>
      )}

      {/* TOTAL */}
      {meta && !error && (
        <div className="mb-4 text-sm font-medium text-[#1E4752]/80">
          Tìm thấy{' '}
          <strong className="font-extrabold text-[#1E4752] tabular-nums">{meta.total}</strong>{' '}
          khách sạn
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="py-12 text-center text-sm font-semibold text-[#1E4752]/75">
          Đang tải dữ liệu...
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        hotels.length === 0 && (
          <div
            className="
              rounded-3xl
              border
              border-[#1E4752]/15
              bg-white
              p-10
              text-center
              text-sm
              font-semibold
              text-[#1E4752]/75
            "
          >
            Không tìm thấy khách sạn phù
            hợp.
          </div>
        )}

      {/* HOTEL LIST */}
      {!loading && (
        <div className="space-y-4">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="
                lux-card-hover
                overflow-hidden
                rounded-3xl
                border
                border-[#1E4752]/15
                bg-white
                shadow-xs
                md:flex
              "
            >
              {/* HOTEL IMAGE */}
              <div
                className="
                  h-56
                  w-full
                  shrink-0
                  md:h-auto
                  md:w-72
                "
              >
                <img
                  src={getHotelImageUrl(
                    hotel.coverImageUrl,
                  )}
                  alt={hotel.name}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                  onError={(event) => {
                    event.currentTarget.src =
                      PLACEHOLDER_IMAGE;
                  }}
                />
              </div>

              {/* HOTEL INFORMATION */}
              <div className="flex-1 p-6">
                <h2 className="font-display text-xl font-bold text-[#1E4752]">
                  {hotel.name}
                </h2>

                <p className="mt-2 text-sm text-[#1E4752]/75">
                  {hotel.address}
                </p>

                {/* STAR */}
                <div className="mt-3">
                  {hotel.starRating ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-[#E8A700]">
                        {Array.from({ length: hotel.starRating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-[#E8A700] text-[#E8A700]" />
                        ))}
                      </div>
                      <span className="font-bold text-xs text-[#1E4752] tabular-nums">
                        {hotel.starRating} sao
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-[#1E4752]/55">
                      Chưa xếp hạng
                    </span>
                  )}
                </div>

                {/* DESCRIPTION */}
                {hotel.description && (
                  <p
                    className="
                      mt-3
                      line-clamp-2
                      text-sm
                      text-[#1E4752]/75
                    "
                  >
                    {hotel.description}
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
                      font-extrabold
                      ${
                        hotel.status ===
                        'ACTIVE'
                          ? 'bg-[#1E4752] text-white'
                          : ''
                      }
                      ${
                        hotel.status ===
                        'DRAFT'
                          ? 'bg-[#E8A700]/20 text-[#1E4752]'
                          : ''
                      }
                      ${
                        hotel.status ===
                        'INACTIVE'
                          ? 'bg-[#1E4752]/10 text-[#1E4752]/75'
                          : ''
                      }
                    `}
                  >
                    {hotel.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {meta &&
        !error &&
        meta.totalPages > 1 && (
          <div
            className="
              mt-8
              flex
              items-center
              justify-center
              gap-4
            "
          >
            {/* PREVIOUS */}
            <button
              type="button"
              onClick={
                handlePreviousPage
              }
              disabled={
                loading ||
                meta.page <= 1
              }
              className="
                lux-press
                rounded-xl
                border
                border-[#1E4752]/20
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-[#1E4752]
                hover:bg-[#1E4752]/5
                disabled:cursor-not-allowed
                disabled:opacity-50
                cursor-pointer
              "
            >
              ← Trang trước
            </button>

            {/* CURRENT PAGE */}
            <div
              className="
                tabular-nums
                rounded-xl
                bg-[#1E4752]
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
              "
            >
              Trang{' '}
              <strong>
                {meta.page}
              </strong>{' '}
              / {meta.totalPages}
            </div>

            {/* NEXT */}
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
                lux-press
                rounded-xl
                border
                border-[#1E4752]/20
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-[#1E4752]
                hover:bg-[#1E4752]/5
                disabled:cursor-not-allowed
                disabled:opacity-50
                cursor-pointer
              "
            >
              Trang sau →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}