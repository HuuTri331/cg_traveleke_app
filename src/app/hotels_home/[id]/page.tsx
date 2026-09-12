import HomeRooms from '@/components/room_home/HomeRooms';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({
  params,
}: PageProps) {
  const { id } = await params;

  return <HomeRooms hotelId={id} />;
}