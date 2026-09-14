import BookingForm from '@/components/booking/BookingForm';

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function Page({
  params,
}: PageProps) {
  const { roomId } = await params;

  return (
    <BookingForm roomId={roomId} />
  );
}