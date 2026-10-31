'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  guestStaffReviewsApi,
  EligibleReviewTarget,
  ReviewStage,
} from '@/services/api/guest-staff-reviews.api';

interface StaffRatingFormProps {
  bookingId: string | number;
  onSuccess?: () => void;
}

const STAGE_LABELS: Record<ReviewStage, string> = {
  PRE_ARRIVAL: 'Chăm sóc trước nhận phòng (Pre-Arrival)',
  CHECK_IN: 'Đón tiếp & Làm thủ tục Nhận phòng (Check-In)',
  IN_STAY: 'Phục vụ dịch vụ trong kỳ lưu trú (In-Stay)',
  CHECK_OUT: 'Thủ tục Trả phòng & Tạm biệt (Check-Out)',
};

export function StaffRatingForm({ bookingId, onSuccess }: StaffRatingFormProps) {
  const [targets, setTargets] = useState<EligibleReviewTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<EligibleReviewTarget | null>(null);
  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchTargets();
  }, [bookingId]);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const res = await guestStaffReviewsApi.getEligibleTargets(bookingId);
      setTargets(res);
      // Mặc định chọn mục đầu tiên chưa được review
      const firstUnreviewed = res.find((t) => !t.alreadyReviewed);
      if (firstUnreviewed) {
        setSelectedTarget(firstUnreviewed);
      } else if (res.length > 0) {
        setSelectedTarget(res[0]);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể tải danh sách nhân viên phục vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await guestStaffReviewsApi.submitReview({
        bookingId: String(bookingId),
        staffUserId: selectedTarget.staffUserId,
        stage: selectedTarget.stage,
        stars,
        comment: comment.trim() || undefined,
      });

      setSuccessMsg('Cảm ơn quý khách đã gửi đánh giá chất lượng phục vụ!');
      setComment('');
      await fetchTargets();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Đang tải thông tin nhân sự phục vụ chuyến đi của bạn...
      </div>
    );
  }

  if (targets.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 text-center">
        Chưa có dữ liệu nhân sự được phân công phục vụ cho đơn đặt phòng này.
      </div>
    );
  }

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-base font-semibold text-gray-900">
          Đánh giá chất lượng phục vụ nhân viên (Đợt 5)
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Ý kiến của quý khách là tiêu chuẩn vàng giúp đội ngũ khách sạn nâng cao chất lượng phục vụ.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Chọn giai đoạn phục vụ
        </label>
        <div className="space-y-2">
          {targets.map((t) => {
            const isSelected =
              selectedTarget?.stage === t.stage && selectedTarget?.staffUserId === t.staffUserId;
            return (
              <button
                key={`${t.staffUserId}_${t.stage}`}
                type="button"
                onClick={() => setSelectedTarget(t)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">{STAGE_LABELS[t.stage]}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Nhân sự phụ trách: #{t.staffUserId}
                  </div>
                </div>
                {t.alreadyReviewed ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    Đã đánh giá
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Chờ đánh giá
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedTarget && !selectedTarget.alreadyReviewed && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Mức độ hài lòng ({stars} / 5 sao)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setStars(starVal)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      starVal <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Nhận xét chi tiết (tùy chọn)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về thái độ phục vụ, tốc độ hỗ trợ của nhân viên..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Đang gửi đánh giá...' : 'Gửi đánh giá nhân viên'}
          </Button>
        </form>
      )}
    </div>
  );
}

