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
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Tìm khách sạn
      </h1>

      {/* SEARCH + FILTER */}
      <form
        onSubmit={handleSubmit}
        className="
          mb-8
          flex
          flex-col
          gap-3
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

        {/* SEARCH BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="
            rounded-lg
            bg-blue-600
            px-6
            py-3
            font-semibold
            text-white
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
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
            rounded-lg
            border
            border-red-200
            bg-red-50
            p-4
            text-red-600
          "
        >
          {error}
        </div>
      )}

      {/* TOTAL */}
      {meta && !error && (
        <div className="mb-4 text-gray-600">
          Tìm thấy{' '}
          <strong>{meta.total}</strong>{' '}
          khách sạn
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="py-8 text-center text-gray-500">
          Đang tải dữ liệu...
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        hotels.length === 0 && (
          <div
            className="
              rounded-lg
              border
              p-8
              text-center
              text-gray-500
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
                overflow-hidden
                rounded-xl
                border
                bg-white
                shadow-sm
                transition
                hover:shadow-md
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
              <div className="flex-1 p-5">
                <h2 className="text-xl font-bold">
                  {hotel.name}
                </h2>

                <p className="mt-2 text-gray-600">
                  {hotel.address}
                </p>

                {/* STAR */}
                <div className="mt-3">
                  {hotel.starRating ? (
                    <span className="font-medium text-yellow-600">
                      {'★'.repeat(
                        hotel.starRating,
                      )}{' '}
                      {hotel.starRating} sao
                    </span>
                  ) : (
                    <span className="text-gray-500">
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
                      text-gray-600
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
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-2
                font-medium
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              ← Trang trước
            </button>

            {/* CURRENT PAGE */}
            <div
              className="
                rounded-lg
                bg-gray-100
                px-4
                py-2
                text-gray-700
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
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-2
                font-medium
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Trang sau →
            </button>
          </div>
        )}
    </main>
  );
}