'use client';

import React, { useEffect, useState } from 'react';
import {
  deskBoardApi,
  TodayBoardCardDto,
  TodayDeskBoardResponse,
} from '@/services/api/desk-board.api';

export default function TodayFrontDeskPage() {
  const [hotelId, setHotelId] = useState<string>('1');
  const [board, setBoard] = useState<TodayDeskBoardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = async (targetHotelId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await deskBoardApi.getTodayBoard(targetHotelId);
      setBoard(data);
    } catch (err: any) {
      setError(err?.userMessage || 'Không thể tải Bảng điều hành lễ tân trong ngày (Today Board).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard(hotelId);
  }, [hotelId]);

  const renderSection = (title: string, items: TodayBoardCardDto[]) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-bold text-slate-900">
        {title} ({items.length})
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={`${title}-${item.bookingId}`}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs"
          >
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <span>Booking #{item.bookingId}</span>
              <span>{item.roomReadiness}</span>
            </div>
            <div className="mt-1 text-slate-600">
              Phòng: {item.assignedRoomNumbers.join(', ') || 'Chưa gán'} | Người phụ trách hiệu lực:{' '}
              {item.currentEffectiveExecutorId || 'Chưa phân công'}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-3 text-center text-xs text-slate-400">Không có bản ghi</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bảng điều hành lễ tân hôm nay (Today Front Desk Board)
          </h1>
          <p className="text-sm text-slate-600">
            Ngày nghiệp vụ khách sạn: {board?.businessDate || '—'} ({board?.ianaTimezone || 'Asia/Ho_Chi_Minh'})
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadBoard(hotelId)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu Today Board...</div>
      ) : (
        board && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {renderSection('Khách sắp đến (Arrivals)', board.arrivals)}
            {renderSection('Khách đang ở (In-House)', board.inHouse)}
            {renderSection('Khách sắp trả (Departures)', board.departures)}
            {renderSection('Ngoại lệ / Cảnh báo (Exceptions)', board.exceptions)}
          </div>
        )
      )}
    </div>
  );
}
