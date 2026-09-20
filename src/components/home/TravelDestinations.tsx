'use client';

import React, { useState } from 'react';

type Destination = {
  title: string;
  airline: string;
  date: string;
  originalPrice?: string;
  discountedPrice: string;
  imgUrl: string;
  tag?: string;
};

type RegionTab =
  | 'Tất cả'
  | 'TP. Hồ Chí Minh'
  | 'Hà Nội'
  | 'Đà Nẵng'
  | 'Phú Quốc'
  | 'Đà Lạt'
  | 'Nha Trang';

const DESTINATIONS: Record<RegionTab, Destination[]> = {
  'Tất cả': [
    {
      title: 'Hà Nội - TP. Hồ Chí Minh',
      airline: 'Vietravel Airlines',
      date: 'Khởi hành 30/12/2024',
      originalPrice: '1.326.410 VND',
      discountedPrice: '1.307.430 VND',
      imgUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
    {
      title: 'TP. Hồ Chí Minh - Đà Nẵng',
      airline: 'Vietnam Airlines',
      date: 'Khởi hành 05/01/2025',
      originalPrice: '1.580.000 VND',
      discountedPrice: '1.250.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
    {
      title: 'Hà Nội - Phú Quốc',
      airline: 'Vietjet Air',
      date: 'Khởi hành 12/01/2025',
      originalPrice: '1.950.000 VND',
      discountedPrice: '1.499.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
    {
      title: 'TP. Hồ Chí Minh - Đà Lạt',
      airline: 'Bamboo Airways',
      date: 'Khởi hành 18/01/2025',
      originalPrice: '1.100.000 VND',
      discountedPrice: '890.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
    {
      title: 'Hà Nội - Nha Trang',
      airline: 'Vietnam Airlines',
      date: 'Khởi hành 20/01/2025',
      originalPrice: '1.750.000 VND',
      discountedPrice: '1.390.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
    {
      title: 'TP. Hồ Chí Minh - Quy Nhơn',
      airline: 'Vietjet Air',
      date: 'Khởi hành 22/01/2025',
      originalPrice: '1.200.000 VND',
      discountedPrice: '950.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
  ],
  'TP. Hồ Chí Minh': [
    {
      title: 'Hà Nội - TP. Hồ Chí Minh',
      airline: 'Vietravel Airlines',
      date: 'Khởi hành 30/12/2024',
      originalPrice: '1.326.410 VND',
      discountedPrice: '1.307.430 VND',
      imgUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
    {
      title: 'Đà Nẵng - TP. Hồ Chí Minh',
      airline: 'Bamboo Airways',
      date: 'Khởi hành 08/01/2025',
      originalPrice: '1.450.000 VND',
      discountedPrice: '1.180.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
  ],
  'Hà Nội': [
    {
      title: 'TP. Hồ Chí Minh - Hà Nội',
      airline: 'Vietnam Airlines',
      date: 'Khởi hành 02/01/2025',
      originalPrice: '1.600.000 VND',
      discountedPrice: '1.320.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
    {
      title: 'Phú Quốc - Hà Nội',
      airline: 'Vietjet Air',
      date: 'Khởi hành 15/01/2025',
      originalPrice: '1.850.000 VND',
      discountedPrice: '1.450.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
  ],
  'Đà Nẵng': [
    {
      title: 'TP. Hồ Chí Minh - Đà Nẵng',
      airline: 'Vietnam Airlines',
      date: 'Khởi hành 05/01/2025',
      originalPrice: '1.580.000 VND',
      discountedPrice: '1.250.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
    {
      title: 'Hà Nội - Đà Nẵng',
      airline: 'Bamboo Airways',
      date: 'Khởi hành 10/01/2025',
      originalPrice: '1.350.000 VND',
      discountedPrice: '1.090.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
  ],
  'Phú Quốc': [
    {
      title: 'Hà Nội - Phú Quốc',
      airline: 'Vietjet Air',
      date: 'Khởi hành 12/01/2025',
      originalPrice: '1.950.000 VND',
      discountedPrice: '1.499.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
  ],
  'Đà Lạt': [
    {
      title: 'TP. Hồ Chí Minh - Đà Lạt',
      airline: 'Bamboo Airways',
      date: 'Khởi hành 18/01/2025',
      originalPrice: '1.100.000 VND',
      discountedPrice: '890.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
  ],
  'Nha Trang': [
    {
      title: 'Hà Nội - Nha Trang',
      airline: 'Vietnam Airlines',
      date: 'Khởi hành 20/01/2025',
      originalPrice: '1.750.000 VND',
      discountedPrice: '1.390.000 VND',
      imgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      tag: 'MỘT CHIỀU',
    },
  ],
};

const TABS: RegionTab[] = [
  'Tất cả',
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Phú Quốc',
  'Đà Lạt',
  'Nha Trang',
];

export default function TravelDestinations() {
  const [selectedTab, setSelectedTab] = useState<RegionTab>('Tất cả');
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = DESTINATIONS[selectedTab] || DESTINATIONS['Tất cả'];
  const itemsPerPage = 4;

  const handleNext = () => {
    if (currentIndex + itemsPerPage < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(Math.max(0, items.length - itemsPerPage));
    }
  };

  const handleTabClick = (tab: RegionTab) => {
    setSelectedTab(tab);
    setCurrentIndex(0);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold text-gray-900">
          Top Điểm Đến Được Yêu Thích
        </h2>
      </div>

      {/* Modern Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none mb-6">
        {TABS.map((tab) => {
          const isActive = tab === selectedTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0194f3] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Cards Slider / Carousel */}
      <div className="relative">
        {/* Previous Button (Clean floating circle) */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-xl border border-gray-100 hover:bg-gray-50 hover:text-[#0194f3] transition-all cursor-pointer"
            title="Trước đó"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.slice(currentIndex, currentIndex + itemsPerPage).map((dest, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                <img
                  src={dest.imgUrl}
                  alt={dest.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
                  }}
                />

                {/* Badge Tag */}
                {dest.tag && (
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white shadow-sm tracking-wide">
                    {dest.tag}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-[#0194f3] transition-colors">
                    {dest.title}
                  </h3>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <span>✈️</span>
                    <span>{dest.airline}</span>
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                    <span>📅</span>
                    <span>{dest.date}</span>
                  </p>
                </div>

                {/* Price */}
                <div className="mt-3 pt-2.5 border-t border-gray-100">
                  {dest.originalPrice && (
                    <p className="text-xs text-gray-400 line-through">
                      {dest.originalPrice}
                    </p>
                  )}
                  <p className="text-lg font-black text-[#ff5e1f]">
                    {dest.discountedPrice}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button (Clean floating circle) */}
        {items.length > itemsPerPage && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-xl border border-gray-100 hover:bg-gray-50 hover:text-[#0194f3] transition-all cursor-pointer"
            title="Tiếp theo"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}