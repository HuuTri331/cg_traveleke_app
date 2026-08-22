'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { RoomTable } from '@/features/rooms/components/RoomTable';
import { RoomCreateModal } from '@/features/rooms/components/RoomCreateModal';
import { RoomEditModal } from '@/features/rooms/components/RoomEditModal';
import { RoomDetailModal } from '@/features/rooms/components/RoomDetailModal';
import { RoomGalleryModal } from '@/features/rooms/components/RoomGalleryModal';
import { useRooms } from '@/features/rooms/hooks/useRooms';
import { Room, RoomStatus } from '@/types/room';
import { roomsApi } from '@/services/api/rooms.api';

export default function RoomsPage() {
  const {
    rooms,
    hotels,
    loading,
    meta,
    selectedHotelId,
    setSelectedHotelId,
    search,
    setSearch,
    status,
    setStatus,
    currentPage,
    setCurrentPage,
    refresh,
    showSuccessToast,
    showErrorToast,
  } = useRooms();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleOpenDetail = (room: Room) => {
    setSelectedRoom(room);
    setDetailModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setSelectedRoom(room);
    setEditModalOpen(true);
  };

  const handleOpenGallery = (room: Room) => {
    setSelectedRoom(room);
    setGalleryModalOpen(true);
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`Bạn có chắc muốn xóa phòng "${room.name}" không?`)) return;
    try {
      await roomsApi.remove(room.id);
      showSuccessToast('Đã xóa phòng', `Phòng "${room.name}" đã được xóa khỏi hệ thống.`);
      refresh();
    } catch (err: any) {
      showErrorToast('Lỗi xóa phòng', err.message);
    }
  };

  const handleToggleStatus = async (room: Room, nextStatus: RoomStatus) => {
    try {
      await roomsApi.update(room.id, { status: nextStatus });
      showSuccessToast(
        'Đã đổi trạng thái',
        `Phòng "${room.name}" đã chuyển sang trạng thái ${nextStatus}.`
      );
      refresh();
    } catch (err: any) {
      showErrorToast('Lỗi cập nhật trạng thái', err.message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        pageTitle="Quản Lý Phòng Khách Sạn"
        items={[{ label: 'Danh Sách Phòng' }]}
      />

      {/* Main Table Card */}
      <RoomTable
        rooms={rooms}
        hotels={hotels}
        loading={loading}
        meta={meta}
        selectedHotelId={selectedHotelId}
        onHotelChange={setSelectedHotelId}
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onPageChange={setCurrentPage}
        onOpenCreate={() => setCreateModalOpen(true)}
        onOpenEdit={handleOpenEdit}
        onOpenDetail={handleOpenDetail}
        onOpenGallery={handleOpenGallery}
        onDeleteRoom={handleDeleteRoom}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create Modal */}
      <RoomCreateModal
        hotels={hotels}
        defaultHotelId={selectedHotelId}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={refresh}
      />

      {/* Edit Modal */}
      <RoomEditModal
        room={selectedRoom}
        hotels={hotels}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={refresh}
      />

      {/* Detail Modal */}
      <RoomDetailModal
        room={selectedRoom}
        hotels={hotels}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onEdit={() => setEditModalOpen(true)}
        onOpenGallery={() => setGalleryModalOpen(true)}
      />

      {/* Gallery Modal */}
      <RoomGalleryModal
        room={selectedRoom}
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
