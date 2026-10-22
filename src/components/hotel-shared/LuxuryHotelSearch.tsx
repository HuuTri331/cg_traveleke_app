'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, Search, ChevronDown, Check } from 'lucide-react';
import {
  getDefaultBookingDates,
  buildBookingQueryString,
  BookingQueryParams,
} from './BookingContextQuery';

interface LuxuryHotelSearchProps {
  mode?: 'hero' | 'compact';
  initialKeyword?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialRoomCount?: number;
  initialGuests?: number;
  onSearch?: (params: BookingQueryParams) => void;
  className?: string;
}

export default function LuxuryHotelSearch({
  mode = 'hero',
  initialKeyword = '',
  initialCheckIn,
  initialCheckOut,
  initialRoomCount = 1,
  initialGuests = 2,
  onSearch,
  className = '',
}: LuxuryHotelSearchProps) {
  const router = useRouter();
  const defaults = getDefaultBookingDates();

  const [keyword, setKeyword] = useState(initialKeyword);
  const [checkInDate, setCheckInDate] = useState(() => {
    if (initialCheckIn) {
      const d = new Date(initialCheckIn);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    return defaults.checkInDateStr;
  });

  const [checkOutDate, setCheckOutDate] = useState(() => {
    if (initialCheckOut) {
      const d = new Date(initialCheckOut);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    return defaults.checkOutDateStr;
  });

  const [roomCount, setRoomCount] = useState(initialRoomCount);
  const [totalGuests, setTotalGuests] = useState(initialGuests);
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const guestDropdownRef = useRef<HTMLDivElement>(null);

  // Sync with initial props when they change
  useEffect(() => {
    if (initialKeyword !== undefined) setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    if (initialCheckIn) {
      const d = new Date(initialCheckIn);
      if (!isNaN(d.getTime())) setCheckInDate(d.toISOString().split('T')[0]);
    }
  }, [initialCheckIn]);

  useEffect(() => {
    if (initialCheckOut) {
      const d = new Date(initialCheckOut);
      if (!isNaN(d.getTime())) setCheckOutDate(d.toISOString().split('T')[0]);
    }
  }, [initialCheckOut]);

  useEffect(() => {
    if (initialRoomCount) setRoomCount(initialRoomCount);
  }, [initialRoomCount]);

  useEffect(() => {
    if (initialGuests) setTotalGuests(initialGuests);
  }, [initialGuests]);

  // Click outside to close guest dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(e.target as Node)) {
        setIsGuestMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateChange = (type: 'in' | 'out', val: string) => {
    if (type === 'in') {
      setCheckInDate(val);
      // Ensure checkout is at least day after checkin
      if (new Date(val) >= new Date(checkOutDate)) {
        const next = new Date(val);
        next.setDate(next.getDate() + 1);
        setCheckOutDate(next.toISOString().split('T')[0]);
      }
    } else {
      if (new Date(val) <= new Date(checkInDate)) {
        const prev = new Date(val);
        prev.setDate(prev.getDate() - 1);
        setCheckInDate(prev.toISOString().split('T')[0]);
      }
      setCheckOutDate(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inDateObj = new Date(checkInDate);
    inDateObj.setHours(14, 0, 0, 0);
    const outDateObj = new Date(checkOutDate);
    outDateObj.setHours(12, 0, 0, 0);

    const queryParams: BookingQueryParams = {
      keyword: keyword.trim() || undefined,
      checkInAt: inDateObj.toISOString(),
      checkOutAt: outDateObj.toISOString(),
      roomCount,
      totalGuests,
    };

    if (onSearch) {
      onSearch(queryParams);
    } else {
      const queryStr = buildBookingQueryString(queryParams);
      router.push(`/hotels_home${queryStr}`);
    }
  };

  const isHero = mode === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full rounded-2xl bg-white border border-[#1E4752]/15 transition-all ${
        isHero
          ? 'shadow-2xl shadow-[#1E4752]/10 p-4 sm:p-6 lg:p-7'
          : 'shadow-md shadow-[#1E4752]/5 p-3 sm:p-4'
      } ${className}`}
    >
      <div
        className={`grid gap-3 sm:gap-4 ${
          isHero
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-12 items-end'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 items-end'
        }`}
      >
        {/* 1. Destination / Keyword */}
        <div className={isHero ? 'lg:col-span-4' : 'lg:col-span-3'}>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1E4752] mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#E8A700]" />
            <span>Điểm đến / Khách sạn</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Thành phố, địa danh hoặc tên khách sạn..."
              className="w-full h-12 px-3.5 bg-white border border-[#1E4752]/15 rounded-xl text-sm font-semibold text-[#1E4752] placeholder-[#1E4752]/40 focus:outline-none focus:border-[#E8A700] focus:ring-1 focus:ring-[#E8A700] transition-colors"
            />
          </div>
        </div>

        {/* 2. Check-in Date */}
        <div className={isHero ? 'lg:col-span-2' : 'lg:col-span-2'}>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1E4752] mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#E8A700]" />
            <span>Nhận phòng</span>
          </label>
          <input
            type="date"
            value={checkInDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleDateChange('in', e.target.value)}
            className="w-full h-12 px-3 bg-white border border-[#1E4752]/15 rounded-xl text-sm font-semibold text-[#1E4752] focus:outline-none focus:border-[#E8A700] focus:ring-1 focus:ring-[#E8A700] transition-colors cursor-pointer"
          />
        </div>

        {/* 3. Check-out Date */}
        <div className={isHero ? 'lg:col-span-2' : 'lg:col-span-2'}>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1E4752] mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#E8A700]" />
            <span>Trả phòng</span>
          </label>
          <input
            type="date"
            value={checkOutDate}
            min={checkInDate}
            onChange={(e) => handleDateChange('out', e.target.value)}
            className="w-full h-12 px-3 bg-white border border-[#1E4752]/15 rounded-xl text-sm font-semibold text-[#1E4752] focus:outline-none focus:border-[#E8A700] focus:ring-1 focus:ring-[#E8A700] transition-colors cursor-pointer"
          />
        </div>

        {/* 4. Guests & Rooms Selector */}
        <div className={`relative ${isHero ? 'lg:col-span-2' : 'lg:col-span-3'}`} ref={guestDropdownRef}>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1E4752] mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#E8A700]" />
            <span>Khách & Phòng</span>
          </label>
          <button
            type="button"
            onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
            className="w-full h-12 px-3.5 bg-white border border-[#1E4752]/15 rounded-xl text-sm font-semibold text-[#1E4752] flex items-center justify-between hover:border-[#1E4752]/30 focus:outline-none focus:border-[#E8A700] transition-colors cursor-pointer"
          >
            <span className="truncate">
              {totalGuests} khách, {roomCount} phòng
            </span>
            <ChevronDown className="w-4 h-4 text-[#1E4752]/50 shrink-0 ml-1" />
          </button>

          {/* Guest & Room Dropdown Popover */}
          {isGuestMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-[#1E4752]/15 p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="space-y-4">
                {/* Guests Counter */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#1E4752]">Số lượng khách</p>
                    <p className="text-xs text-[#1E4752]/60">Người lớn & trẻ em</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={totalGuests <= 1}
                      onClick={() => setTotalGuests((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-full border border-[#1E4752]/20 text-[#1E4752] font-bold hover:bg-[#1E4752]/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-extrabold text-[#1E4752]">
                      {totalGuests}
                    </span>
                    <button
                      type="button"
                      disabled={totalGuests >= 10}
                      onClick={() => setTotalGuests((prev) => Math.min(10, prev + 1))}
                      className="w-8 h-8 rounded-full border border-[#1E4752]/20 text-[#1E4752] font-bold hover:bg-[#1E4752]/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="h-px bg-[#1E4752]/10" />

                {/* Rooms Counter */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#1E4752]">Số lượng phòng</p>
                    <p className="text-xs text-[#1E4752]/60">Phòng cần đặt</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={roomCount <= 1}
                      onClick={() => setRoomCount((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-full border border-[#1E4752]/20 text-[#1E4752] font-bold hover:bg-[#1E4752]/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-extrabold text-[#1E4752]">
                      {roomCount}
                    </span>
                    <button
                      type="button"
                      disabled={roomCount >= 5}
                      onClick={() => setRoomCount((prev) => Math.min(5, prev + 1))}
                      className="w-8 h-8 rounded-full border border-[#1E4752]/20 text-[#1E4752] font-bold hover:bg-[#1E4752]/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsGuestMenuOpen(false)}
                    className="w-full py-2 bg-[#1E4752] hover:bg-[#1E4752]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-[#E8A700]" />
                    <span>Áp dụng</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Search Action CTA */}
        <div className={isHero ? 'lg:col-span-2' : 'lg:col-span-2'}>
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#E8A700] hover:bg-[#E8A700]/90 text-[#1E4752] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Tìm kiếm</span>
          </button>
        </div>
      </div>
    </form>
  );
}
