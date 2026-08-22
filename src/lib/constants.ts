export interface LocationOption {
  id: number;
  code: string;
  name: string;
  type: string;
}

export interface HotelTypeOption {
  id: number;
  code: string;
  name: string;
  description: string;
}

export const LOCATIONS: LocationOption[] = [
  { id: 1, code: 'HCM', name: 'TP. Hồ Chí Minh', type: 'CITY' },
  { id: 2, code: 'HN', name: 'Hà Nội', type: 'CITY' },
  { id: 3, code: 'DN', name: 'Đà Nẵng', type: 'CITY' },
];

export const HOTEL_TYPES: HotelTypeOption[] = [
  { id: 1, code: 'HOTEL', name: 'Khách sạn', description: 'Cơ sở lưu trú dạng khách sạn' },
  { id: 2, code: 'RESORT', name: 'Khu nghỉ dưỡng', description: 'Khu nghỉ dưỡng có nhiều dịch vụ' },
  { id: 3, code: 'HOMESTAY', name: 'Homestay', description: 'Mô hình lưu trú gần gũi địa phương' },
  { id: 4, code: 'HOSTEL', name: 'Hostel', description: 'Lưu trú tiết kiệm hoặc phòng tập thể' },
  { id: 5, code: 'VILLA', name: 'Biệt thự', description: 'Biệt thự dành cho nhóm hoặc gia đình' },
];

export const HOTEL_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Bản nháp (DRAFT)', color: 'warning' },
  { value: 'ACTIVE', label: 'Đang hoạt động (ACTIVE)', color: 'success' },
  { value: 'INACTIVE', label: 'Tạm ngưng (INACTIVE)', color: 'danger' },
] as const;

export const ROOM_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Còn phòng (AVAILABLE)', color: 'success' },
  { value: 'UNAVAILABLE', label: 'Hết phòng (UNAVAILABLE)', color: 'danger' },
  { value: 'MAINTENANCE', label: 'Đang bảo trì (MAINTENANCE)', color: 'warning' },
] as const;

export const BED_TYPES = [
  'Giường Đơn',
  'Giường Đôi',
  'Giường Queen',
  'Giường King',
  '2 Giường Đơn',
  'Giường Tầng',
];
