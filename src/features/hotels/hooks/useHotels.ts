'use client';

import { useState, useEffect, useCallback } from 'react';
import { hotelsApi } from '@/services/api/hotels.api';
import { Hotel, HotelStatus, QueryHotelParams } from '@/types/hotel';
import { PaginationMeta } from '@/types/common';
import { useToast } from '@/components/ui/Toast';

export function useHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<HotelStatus | ''>('');
  const [hotelTypeId, setHotelTypeId] = useState<number | ''>('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      const params: QueryHotelParams = {
        page: currentPage,
        perPage: 10,
      };

      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (hotelTypeId) params.hotelTypeId = Number(hotelTypeId);
      if (locationId) params.locationId = Number(locationId);

      const res = await hotelsApi.getAll(params);
      setHotels(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      showErrorToast('Lỗi nạp danh sách khách sạn', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status, hotelTypeId, locationId, showErrorToast]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const refresh = () => {
    fetchHotels();
  };

  return {
    hotels,
    loading,
    meta,
    search,
    setSearch,
    status,
    setStatus,
    hotelTypeId,
    setHotelTypeId,
    locationId,
    setLocationId,
    currentPage,
    setCurrentPage,
    refresh,
    showSuccessToast,
    showErrorToast,
  };
}
