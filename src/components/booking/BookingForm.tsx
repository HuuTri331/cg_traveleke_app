'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import Footer from '@/components/common/FooterCommon';
import { bookingApi } from '@/services/api/booking.api';

interface BookingFormProps {
  roomId: string;
}

interface BookingFormData {
  checkInAt: string;
  checkOutAt: string;
  totalGuests: number;
  roomCount: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequest: string;
}

const initialForm: BookingFormData = {
  checkInAt: '',
  checkOutAt: '',
  totalGuests: 1,
  roomCount: 1,
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  specialRequest: '',
};

export default function BookingForm({
  roomId,
}: BookingFormProps) {
  const router = useRouter();

  const [form, setForm] =
    useState<BookingFormData>(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const updateForm = (
    field: keyof BookingFormData,
    value: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError('');
  };

  const validateForm = () => {
    const {
      checkInAt,
      checkOutAt,
      totalGuests,
      roomCount,
      contactName,
      contactEmail,
      contactPhone,
      specialRequest,
    } = form;

    if (!checkInAt || !checkOutAt) {
      return 'Vui lòng chọn ngày nhận và trả phòng.';
    }

    const checkIn = new Date(checkInAt);
    const checkOut = new Date(checkOutAt);
    const now = new Date();

    if (checkIn < now) {
      return 'Ngày nhận phòng không được nhỏ hơn thời gian hiện tại.';
    }

    if (checkOut <= checkIn) {
      return 'Ngày trả phòng phải sau ngày nhận phòng.';
    }

    if (totalGuests < 1) {
      return 'Số khách phải lớn hơn hoặc bằng 1.';
    }

    if (roomCount < 1) {
      return 'Số phòng phải lớn hơn hoặc bằng 1.';
    }

    if (contactName.trim().length < 2) {
      return 'Họ và tên phải có ít nhất 2 ký tự.';
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(contactEmail)) {
      return 'Email không hợp lệ.';
    }

    const phoneRegex =
      /^(0[3|5|7|8|9][0-9]{8}|\+84[3|5|7|8|9][0-9]{8})$/;

    if (!phoneRegex.test(contactPhone)) {
      return 'Số điện thoại không hợp lệ.';
    }

    if (specialRequest.length > 500) {
      return 'Yêu cầu đặc biệt không được vượt quá 500 ký tự.';
    }

    return '';
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await bookingApi.create({
        roomId,

        // Tạm thời dùng userId = 1.
        // Sau này lấy từ JWT.
        userId: '1',

        ...form,

        contactName:
          form.contactName.trim(),

        contactEmail:
          form.contactEmail.trim(),

        contactPhone:
          form.contactPhone.trim(),

        specialRequest:
          form.specialRequest.trim(),
      });

      router.push('/booking-history');
    } catch (err: any) {
      const message =
        err?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message ||
              'Không thể đặt phòng.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">
            Đặt phòng
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Room ID: {roomId}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            {/* Ngày nhận / trả phòng */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Ngày nhận phòng">
                <input
                  type="datetime-local"
                  value={form.checkInAt}
                  onChange={(e) =>
                    updateForm(
                      'checkInAt',
                      e.target.value,
                    )
                  }
                  required
                  className={inputClass}
                />
              </FormField>

              <FormField label="Ngày trả phòng">
                <input
                  type="datetime-local"
                  value={form.checkOutAt}
                  onChange={(e) =>
                    updateForm(
                      'checkOutAt',
                      e.target.value,
                    )
                  }
                  required
                  className={inputClass}
                />
              </FormField>
            </div>

            {/* Khách / phòng */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Số khách">
                <input
                  type="number"
                  min={1}
                  value={form.totalGuests}
                  onChange={(e) =>
                    updateForm(
                      'totalGuests',
                      Number(e.target.value),
                    )
                  }
                  required
                  className={inputClass}
                />
              </FormField>

              <FormField label="Số phòng">
                <input
                  type="number"
                  min={1}
                  value={form.roomCount}
                  onChange={(e) =>
                    updateForm(
                      'roomCount',
                      Number(e.target.value),
                    )
                  }
                  required
                  className={inputClass}
                />
              </FormField>
            </div>

            {/* Họ tên */}
            <FormField label="Họ và tên">
              <input
                type="text"
                value={form.contactName}
                onChange={(e) =>
                  updateForm(
                    'contactName',
                    e.target.value,
                  )
                }
                minLength={2}
                maxLength={150}
                required
                className={inputClass}
              />
            </FormField>

            {/* Email */}
            <FormField label="Email">
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  updateForm(
                    'contactEmail',
                    e.target.value,
                  )
                }
                required
                className={inputClass}
              />
            </FormField>

            {/* Điện thoại */}
            <FormField label="Số điện thoại">
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) =>
                  updateForm(
                    'contactPhone',
                    e.target.value,
                  )
                }
                placeholder="0901234567"
                maxLength={12}
                required
                className={inputClass}
              />
            </FormField>

            {/* Yêu cầu */}
            <FormField label="Yêu cầu đặc biệt">
              <textarea
                value={form.specialRequest}
                onChange={(e) =>
                  updateForm(
                    'specialRequest',
                    e.target.value,
                  )
                }
                rows={4}
                maxLength={500}
                placeholder="Ví dụ: phòng tầng cao, phòng không hút thuốc..."
                className={inputClass}
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {form.specialRequest.length}/500
              </p>
            </FormField>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading
                ? 'Đang đặt phòng...'
                : 'Xác nhận đặt phòng'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-16 bg-white shadow-md">
              <Footer/>
      </div>
    </main>
  );
}

/* ==============================
   COMPONENT DÙNG CHUNG
================================ */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500';