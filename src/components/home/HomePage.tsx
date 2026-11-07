'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/common/HeaderCommon';
import Footer from '@/components/common/FooterCommon';

import LuxuryHero from '@/components/home/LuxuryHero';
import LuxuryHotelSearch from '@/components/hotel-shared/LuxuryHotelSearch';
import LuxuryTrustStrip from '@/components/home/LuxuryTrustStrip';
import LuxuryIntroSection from '@/components/home/LuxuryIntroSection';
import HotelDealsSection from '@/components/home/HotelDealsSection';
import TopMonthHotelsSection from '@/components/home/TopMonthHotelsSection';
import TravelokeLayout from '@/components/home/TravelokeLayout';
import TravelDestinations from '@/components/home/TravelDestinations';
import RecentlyViewedHotels from '@/components/home/RecentlyViewedHotels';

import { homeApi } from '@/services/api/home.api';

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

  const bannerTitle = data?.banners?.[0]?.title;
  const bannerSubtitle = data?.banners?.[0]?.subtitle;

  return (
    <div className="luxury-site flex flex-col min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 w-full bg-white shadow-xs">
        <Header />
      </div>

      <main className="flex-1">
        {/* 1. Cinematic Luxury Hero */}
        <div className="relative">
          <LuxuryHero
            bannerTitle={bannerTitle}
            bannerSubtitle={bannerSubtitle}
          />

          {/* 2. Floating Search Bar Overlapping Bottom of Hero */}
          <div className="relative max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 -mt-20 z-20">
            <LuxuryHotelSearch mode="hero" />
          </div>
        </div>

        {/* 3. Hotel Strengths Gallery & 01-06 Room Quality Highlights (Directly Below Search Bar) */}
        <LuxuryTrustStrip />

        {/* 4. Editorial Brand Story & Pillars */}
        <LuxuryIntroSection />

        {/* 5. Curated Hotel Deals (Real Data Only) */}
        <div className="border-t border-[#1E4752]/8 bg-white">
          <HotelDealsSection />
        </div>

        {/* 6. Top Hotels of the Month (Real Analytics Data) */}
        <div className="border-t border-[#1E4752]/8 bg-[#1E4752]/2">
          <TopMonthHotelsSection />
        </div>

        {/* 7. Traveleke Hotel Strengths & Room Quality Showcase */}
        <div className="bg-white">
          <TravelDestinations />
        </div>

        {/* 9. Recently Viewed Hotels */}
        <div className="border-t border-[#1E4752]/8 bg-white">
          <RecentlyViewedHotels />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}