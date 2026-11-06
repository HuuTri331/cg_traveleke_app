'use client';

import React, { useEffect, useState } from 'react';
import { roomUnitsApi, RoomUnitDto } from '@/services/api/room-units.api';

export default function RoomBoardPage() {
  const [hotelId, setHotelId] = useState<string>('1');
  const [units, setUnits] = useState<RoomUnitDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadUnits = async (targetHotelId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomUnitsApi.listHotelRoomUnits(targetHotelId);
      setUnits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.userMessage || 'Không thể tải sơ đồ phòng vật lý (Room Board).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits(hotelId);
  }, [hotelId]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sơ đồ phòng vật lý (Physical Room Rack)
          </h1>
          <p className="text-sm text-slate-600">
            Tách biệt Loại phòng thương mại (Room Type) và Phòng vật lý (Room Unit #101, #102...)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            placeholder="Hotel ID"
            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => loadUnits(hotelId)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">
          Đang tải danh sách phòng vật lý...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {units.map((u) => (
            <div
              key={u.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">
                  Phòng #{u.roomNumber}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    u.housekeepingState === 'READY'
                      ? 'bg-emerald-100 text-emerald-800'
                      : u.housekeepingState === 'CLEAN'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {u.housekeepingState}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-600">
                <div>Loại phòng ID: #{u.roomTypeId}</div>
                <div>Tầng: {u.floor || '—'}</div>
                <div>Trạng thái vận hành: {u.operationalStatus}</div>
              </div>
            </div>
          ))}
          {units.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Khách sạn chưa khai báo phòng vật lý thực tế (không tự sinh số phòng ảo).
            </div>
          )}
        </div>
      )}
    </div>
  );
}
