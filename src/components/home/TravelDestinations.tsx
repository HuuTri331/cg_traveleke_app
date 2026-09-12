'use client';

import React, { useState } from 'react';
import Image, { StaticImageData } from 'next/image';

import vietnamImage from '@/assets/image/background.png';
import danangImage from '@/assets/image/background.png';

type Destination = {
  title: string;
  airline: string;
  date: string;
  originalPrice?: string;
  discountedPrice: string;
  img: StaticImageData;
};

type CountryName = 'Việt Nam' | 'Thái Lan';

const destinationsByCountry: Record<CountryName, Destination[]> = {
  'Việt Nam': [
    {
      title: 'Hà Nội - TP HCM',
      airline: 'Vietravel Airlines',
      date: '30 Tháng 12 2024',
      originalPrice: '1.326.410 VND',
      discountedPrice: '1.307.430 VND',
      img: vietnamImage,
    },
    {
      title: 'Hà Nội - TP HCM',
      airline: 'Vietravel Airlines',
      date: '30 Tháng 12 2024',
      originalPrice: '1.326.410 VND',
      discountedPrice: '1.307.430 VND',
      img: vietnamImage,
    },
    {
      title: 'Hà Nội - TP HCM',
      airline: 'Vietravel Airlines',
      date: '30 Tháng 12 2024',
      originalPrice: '1.326.410 VND',
      discountedPrice: '1.307.430 VND',
      img: vietnamImage,
    },
    {
      title: 'Hà Nội - TP HCM',
      airline: 'Vietravel Airlines',
      date: '30 Tháng 12 2024',
      originalPrice: '1.326.410 VND',
      discountedPrice: '1.307.430 VND',
      img: vietnamImage,
    },
    {
      title: 'Hà Nội - TP HCM',
      airline: 'Vietravel Airlines',
      date: '30 Tháng 12 2024',
      originalPrice: '1.326.410 VND',
      discountedPrice: '1.307.430 VND',
      img: vietnamImage,
    },
    {
      title: 'Hà Nội - TP HCM',
      airline: 'Vietravel Airlines',
      date: '30 Tháng 12 2024',
      originalPrice: '1.326.410 VND',
      discountedPrice: '1.307.430 VND',
      img: vietnamImage,
    },
  ],

  'Thái Lan': [
    {
      title: 'Bangkok - Phuket',
      airline: 'Thai Airways',
      date: '10 Tháng 1 2024',
      originalPrice: '2.500.000 VND',
      discountedPrice: '2.200.000 VND',
      img: danangImage,
    },
  ],
};

export default function TravelDestinations() {
  const itemsPerPage = 4;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCountry, setSelectedCountry] =
    useState<CountryName>('Việt Nam');

  const destinations = destinationsByCountry[selectedCountry];

  const handleNext = () => {
    if (currentIndex + itemsPerPage < destinations.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleCountryClick = (country: CountryName) => {
    setSelectedCountry(country);
    setCurrentIndex(0);
  };

  return (
    <section className="container relative mx-auto px-4 py-8 lg:px-32">
      <h2 className="mb-4 text-2xl font-bold text-blue-500">
        Top Điểm đến được yêu thích
      </h2>

      {/* Chọn quốc gia */}
      <div className="mb-6 flex gap-4">
        {(Object.keys(destinationsByCountry) as CountryName[]).map(
          (country) => (
            <button
              key={country}
              type="button"
              onClick={() => handleCountryClick(country)}
              className={`rounded-full px-4 py-2 transition ${
                country === selectedCountry
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {country}
            </button>
          ),
        )}
      </div>

      {/* Slider */}
      <div className="relative flex items-center justify-center">
        {/* Previous */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-blue-500 shadow-lg transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹
        </button>

        <div className="w-full overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${
                (currentIndex / itemsPerPage) * 100
              }%)`,
            }}
          >
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="shrink-0 px-2"
                style={{
                  minWidth: `${100 / itemsPerPage}%`,
                }}
              >
                <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl">
                  {/* Image */}
                  <div className="relative h-48 w-full">
                    <Image
                      src={destination.img}
                      alt={destination.title}
                      fill
                      className="object-cover"
                    />

                    <span className="absolute left-2 top-2 rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">
                      MỘT CHIỀU
                    </span>
                  </div>

                  {/* Nội dung */}
                  <div className="p-4 pb-8">
                    <h3 className="text-sm font-bold text-gray-800">
                      {destination.title}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {destination.airline}
                    </p>

                    <p className="text-xs text-gray-500">
                      {destination.date}
                    </p>

                    {destination.originalPrice && (
                      <p className="mt-2 text-xs text-gray-400 line-through">
                        {destination.originalPrice}
                      </p>
                    )}

                    <p className="mt-1 text-lg font-bold text-orange-500">
                      {destination.discountedPrice}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={handleNext}
          disabled={
            currentIndex + itemsPerPage >= destinations.length
          }
          className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-blue-600 shadow-lg transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </section>
  );
}