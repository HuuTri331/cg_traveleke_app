'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { homeApi } from '@/services/api/home.api';

import Header from '@/components/common/HeaderCommon';
import Footer from '@/components/common/FooterCommon';

import TravelOptions from '@/components/home/TravelOptions';
import TravelDestinations from '@/components/home/TravelDestinations';
import TravelokeLayout from '@/components/home/TravelokeLayout';

import backgroundImage from '@/assets/image/background.png';
import all from '@/assets/image/all.png';
import arouipelago from '@/assets/image/arouipelago.png';
import bw from '@/assets/image/bw.png';
import ihg from '@/assets/image/ihg.png';
import marriott from '@/assets/image/marriott.png';
import banner from '@/assets/image/banner.png';
import banner2 from '@/assets/image/banner2.png';

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const result = await homeApi.getHomeData();

        setData(result);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu homepage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-white shadow-md">
        <Header />
      </div>

      
      <div
        className="h-[400px] flex-grow bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage.src})`,
        }}
      >
        <div className="flex h-full flex-col items-center text-white">
          <h1 className="m-10 text-3xl font-bold">
            Từ Đông Nam Á Đến Thế Giới, Trong Tầm Tay Bạn
          </h1>

          <p className="m-5 mt-2 text-lg">
            Tìm kiếm địa điểm, khách sạn và dịch vụ của bạn
          </p>

          {/* TRUSTED BY */}
          <div className="mt-6 flex items-center justify-center space-x-6 rounded-lg p-4">
            <span className="mr-4 font-bold text-white">
              Trusted by
            </span>

            <Image
              src={all}
              alt="Accor"
              className="rounded p-2 hover:bg-gray-100"
            />

            <Image
              src={arouipelago}
              alt="Archipelago"
              className="rounded p-2 hover:bg-gray-100"
            />

            <Image
              src={bw}
              alt="Best Western"
              className="rounded p-2 hover:bg-gray-100"
            />

            <Image
              src={ihg}
              alt="IHG"
              className="rounded p-2 hover:bg-gray-100"
            />

            <Image
              src={marriott}
              alt="Marriott"
              className="rounded p-2 hover:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* BANNER */}
      <div className="mt-8 flex justify-center">
        <div className="space-y-16">
          {/* BANNER 1 */}
          <div className="relative flex items-center justify-center">
            <div className="absolute left-2 top-2 z-10 rounded-md shadow-md">
              <h2 className="text-lg font-bold text-gray-800">
                Săn Vé Máy Bay Tết
              </h2>
            </div>

            <Image
              src={banner}
              alt="Săn vé máy bay Tết"
              className="w-full rounded-lg"
            />
          </div>

          {/* BANNER 2 */}
          <div className="relative flex items-center justify-center">
            <div className="absolute left-2 top-2 z-10 rounded-md shadow-md">
              <h2 className="text-lg font-bold text-gray-800">
                Ưu đãi dành cho bạn mới
              </h2>
            </div>

            <Image
              src={banner2}
              alt="Ưu đãi dành cho bạn mới"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="mt-16 bg-white shadow-md">
        <TravelOptions />
      </div>

      <div className="mt-16 bg-white shadow-md">
        <TravelDestinations />
      </div>

      <div className="mt-16 bg-white shadow-md">
        <TravelokeLayout />
      </div>

      {/* API TEST */}
      {loading ? (
        <div className="py-10 text-center">
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="mx-auto my-10 hidden max-w-7xl">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      <div className="mt-16 bg-white shadow-md">
        <Footer/>
      </div>
    </>
  );
}