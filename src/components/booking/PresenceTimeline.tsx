'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LogOut,
  Ban,
  BellRing,
  User,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  bookingPresenceApi,
  BookingPresenceEventItem,
  PresenceEventType,
} from '@/services/api/booking-presence.api';

interface PresenceTimelineProps {
  bookingId: string;
}

export function PresenceTimeline({ bookingId }: PresenceTimelineProps) {
  const [events, setEvents] = useState<BookingPresenceEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await bookingPresenceApi.getTimeline(bookingId);
        if (isMounted) {
          setEvents(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch presence timeline', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (bookingId) {
      fetchTimeline();
    }

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-brand-500" />
        Đang tải dòng thời gian hiện diện...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-gray-400 italic">
        Chưa có sự kiện hiện diện nào được ghi nhận cho đơn này.
      </div>
    );
  }

  const getEventBadge = (type: PresenceEventType) => {
    switch (type) {
      case 'ARRIVAL_CONFIRMED':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
          title: 'Nhận Phòng Tại Quầy (Check-In)',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
          textColor: 'text-emerald-700 dark:text-emerald-300',
        };
      case 'LATE_CHECK_IN_RECOVERED':
        return {
          icon: <RotateCcw className="h-4 w-4 text-purple-500" />,
          title: 'Khôi Phục Nhận Phòng Muộn (Late Check-In Recovery)',
          bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
          textColor: 'text-purple-700 dark:text-purple-300',
        };
      case 'NO_SHOW_MARKED':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
          title: 'Đánh Dấu Khách Vắng Mặt (No-Show)',
          bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
          textColor: 'text-amber-700 dark:text-amber-300',
        };
      case 'DEPARTURE_CONFIRMED':
        return {
          icon: <LogOut className="h-4 w-4 text-blue-500" />,
          title: 'Trả Phòng Hoàn Tất (Check-Out)',
          bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-700 dark:text-blue-300',
        };
      case 'NO_SHOW_CLOSED':
        return {
          icon: <Ban className="h-4 w-4 text-gray-500" />,
          title: 'Đóng Kỳ No-Show (Hết Thời Gian Lưu Trú)',
          bgColor: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700',
          textColor: 'text-gray-700 dark:text-gray-300',
        };
      case 'LATE_ARRIVAL_NOTICED':
        return {
          icon: <BellRing className="h-4 w-4 text-indigo-500" />,
          title: 'Khách Báo Dự Kiến Đến Muộn (Arrival Intent)',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
          textColor: 'text-indigo-700 dark:text-indigo-300',
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-gray-500" />,
          title: type,
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-700',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800 space-y-4">
        {events.map((ev) => {
          const badge = getEventBadge(ev.eventType);
          return (
            <div key={ev.id} className="relative">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xs">
                {badge.icon}
              </div>

              {/* Event Content Card */}
              <div className={`rounded-xl border p-3.5 text-xs transition-all ${badge.bgColor}`}>
                <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-black/5 dark:border-white/5">
                  <span className={`font-bold ${badge.textColor}`}>
                    {badge.title}
                  </span>
                  <span className="text-2xs text-gray-500 dark:text-gray-400 font-medium">
                    {new Date(ev.occurredAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center gap-3 text-2xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      {ev.actorType === 'SYSTEM' ? (
                        <>
                          <ShieldCheck className="h-3 w-3 text-purple-500" />
                          Hệ Thống Tự Động
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 text-brand-500" />
                          Nhân Sự #{ev.actorId || 'N/A'}
                        </>
                      )}
                    </span>

                    {ev.lateMinutes !== null && ev.lateMinutes !== undefined && ev.lateMinutes > 0 && (
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        • Muộn {ev.lateMinutes} phút
                      </span>
                    )}

                    <span className="font-mono text-gray-400">
                      [{ev.fromStatus} → {ev.toStatus}]
                    </span>
                  </div>

                  {ev.reason && (
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic bg-white/60 dark:bg-gray-850/60 p-2 rounded-lg border border-black/5 dark:border-white/5">
                      {ev.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
