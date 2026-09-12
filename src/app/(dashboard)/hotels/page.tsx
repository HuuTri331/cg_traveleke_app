'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { HotelTable } from '@/features/hotels/components/HotelTable';
import { HotelCreateModal } from '@/features/hotels/components/HotelCreateModal';
import { HotelEditModal } from '@/features/hotels/components/HotelEditModal';
import { HotelGalleryModal } from '@/features/hotels/components/HotelGalleryModal';
import { HotelDetailModal } from '@/features/hotels/components/HotelDetailModal';
import { RoomDetailModal } from '@/features/rooms/components/RoomDetailModal';
import { RoomCreateModal } from '@/features/rooms/components/RoomCreateModal';
import { useHotels } from '@/features/hotels/hooks/useHotels';
import { Hotel, HotelStatus } from '@/types/hotel';
import { Room } from '@/types/room';
import { hotelsApi } from '@/services/api/hotels.api';

export default function HotelsPage() {
  const {
    hotels,
    loading,
    meta,
    search,
    setSearch,
    status,
    setStatus,
    locationId,
    setLocationId,
    hotelTypeId,
    setHotelTypeId,
    currentPage,
    setCurrentPage,
    refresh,
    showSuccessToast,
    showErrorToast,
  } = useHotels();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Room view inside hotel
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomDetailOpen, setRoomDetailOpen] = useState(false);
  const [roomCreateOpen, setRoomCreateOpen] = useState(false);
  const [roomCreateHotelId, setRoomCreateHotelId] = useState<number | ''>('');

  const handleOpenEdit = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setEditModalOpen(true);
  };

  const handleOpenGallery = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setGalleryModalOpen(true);
  };

  const handleOpenDetail = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setDetailModalOpen(true);
  };

  const handleViewRoomDetail = (room: Room) => {
    setSelectedRoom(room);
    setRoomDetailOpen(true);
  };

  const handleAddRoomForHotel = (hotelId: string) => {
    setRoomCreateHotelId(Number(hotelId));
    setRoomCreateOpen(true);
  };

  const handleToggleStatus = async (hotel: Hotel, nextStatus: HotelStatus) => {
    try {
      await hotelsApi.update(hotel.id, { status: nextStatus });
      showSuccessToast(
        'Đã đổi trạng thái',
        `Khách sạn "${hotel.name}" đã được chuyển sang trạng thái ${nextStatus}.`
      );
      refresh();
    } catch (err: any) {
      showErrorToast('Lỗi cập nhật trạng thái', err.message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb & Title */}
      <Breadcrumb
        pageTitle="Quản Lý Khách Sạn"
        items={[{ label: 'Danh Sách Khách Sạn' }]}
      />

      {/* Main Table Card */}
      <HotelTable
        hotels={hotels}
        loading={loading}
        meta={meta}
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        locationId={locationId}
        onLocationChange={setLocationId}
        hotelTypeId={hotelTypeId}
        onHotelTypeChange={setHotelTypeId}
        onPageChange={setCurrentPage}
        onOpenCreate={() => setCreateModalOpen(true)}
        onOpenEdit={handleOpenEdit}
        onOpenGallery={handleOpenGallery}
        onOpenDetail={handleOpenDetail}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create Modal */}
      <HotelCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={refresh}
      />

      {/* Edit Modal */}
      <HotelEditModal
        hotel={selectedHotel}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={refresh}
      />

      {/* Gallery Modal */}
      <HotelGalleryModal
        hotel={selectedHotel}
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        onSuccess={refresh}
      />

      {/* Hotel Detail Modal (With rooms list & room detail inspector) */}
      <HotelDetailModal
        hotel={selectedHotel}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onEdit={() => selectedHotel && handleOpenEdit(selectedHotel)}
        onOpenGallery={() => selectedHotel && handleOpenGallery(selectedHotel)}
        onViewRoomDetail={handleViewRoomDetail}
        onAddRoomForHotel={handleAddRoomForHotel}
      />

      {/* Room Detail Modal triggered from Hotel Detail */}
      <RoomDetailModal
        room={selectedRoom}
        hotels={hotels}
        isOpen={roomDetailOpen}
        onClose={() => setRoomDetailOpen(false)}
        onEdit={() => {
          setRoomDetailOpen(false);
        }}
        onOpenGallery={() => {
          setRoomDetailOpen(false);
        }}
      />

      {/* Room Create Modal triggered directly for this hotel */}
      <RoomCreateModal
        hotels={hotels}
        defaultHotelId={roomCreateHotelId}
        isOpen={roomCreateOpen}
        onClose={() => setRoomCreateOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
