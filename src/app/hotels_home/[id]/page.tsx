import type { Metadata } from 'next';
import HotelDetailPage from '@/components/hotels_home/HotelDetailPage';
import { hotelDetailApi } from '@/services/api/hotel-detail.api';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const hotel = await hotelDetailApi.getHotelDetail(id);
    if (hotel?.name) {
      return {
        title: `${hotel.name} - Đặt phòng giá tốt tại Traveleke`,
        description:
          hotel.description ||
          `Đặt phòng tại ${hotel.name}, ${hotel.address}. Cam kết giá tốt nhất, xác nhận ngay tức thì tại Traveleke.`,
      };
    }
  } catch {
    // Fallback if backend is not reachable during build
  }

  return {
    title: 'Chi tiết khách sạn - Traveleke',
    description: 'Thông tin chi tiết giá phòng, tiện ích và hình ảnh khách sạn tại Traveleke.',
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <HotelDetailPage hotelId={id} />;
}