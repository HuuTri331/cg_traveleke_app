import HotelDetailPage from '@/components/hotels_home/HotelDetailPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <HotelDetailPage hotelId={id} />;
}