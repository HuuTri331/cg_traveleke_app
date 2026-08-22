'use client';

import { useState, useEffect, useCallback } from 'react';
import { roomsApi } from '@/services/api/rooms.api';
import { hotelsApi } from '@/services/api/hotels.api';
import { Room, RoomStatus, QueryRoomParams } from '@/types/room';
import { Hotel } from '@/types/hotel';
import { PaginationMeta } from '@/types/common';
import { useToast } from '@/components/ui/Toast';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotelId, setSelectedHotelId] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<RoomStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });

  const { error: showErrorToast, success: showSuccessToast } = useToast();

  // Load hotels list for filter and dropdown
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await hotelsApi.getAll({ perPage: 100 });
        setHotels(res.data);
      } catch (err: any) {
        console.error('Lỗi nạp danh sách khách sạn:', err);
      }
    };
    fetchHotels();
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params: QueryRoomParams = {
        page: currentPage,
        perPage: 10,
      };

      if (selectedHotelId) params.hotelId = Number(selectedHotelId);
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;

      const res = await roomsApi.getAll(params);
      setRooms(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorToast('Lỗi nạp danh sách phòng', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedHotelId, search, status, showErrorToast]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
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
    refresh: fetchRooms,
    showSuccessToast,
    showErrorToast,
  };
}
