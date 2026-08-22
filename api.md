Trang Danh sách Khách sạn (/hotels):

Gọi GET /api/hotels?page=1&search=...&status=... đổ dữ liệu vào HotelTable.
Nút Thêm mới: Mở HotelCreateModal gửi POST /api/hotels.
Nút Chỉnh sửa: Mở HotelEditModal gửi PATCH /api/hotels/:id.
Nút Quản lý Album ảnh: Mở HotelGalleryModal, cho phép upload kéo thả nhiều file (POST /api/hotels/:id/images/upload), chọn ảnh đại diện (PATCH .../primary), xóa ảnh (DELETE ...).
Trang Danh sách Phòng (/rooms):

Dropdown chọn Khách sạn: Chọn khách sạn nào thì gọi GET /api/rooms?hotelId={selectedHotelId}.
Nút Thêm phòng: Mở RoomCreateModal gửi POST /api/rooms.
Nút Đổi trạng thái/giá: Gửi PATCH /api/rooms/:id.
Nút Quản lý Album ảnh phòng: Mở RoomGalleryModal (tối đa 5 ảnh).
Cấu trúc File Services trên Frontend Next.js:

src/services/api/client.ts: Cấu hình Axios BaseURL http://localhost:3001/api.
src/services/api/hotels.api.ts: Gom toàn bộ hàm gọi API khách sạn.
src/services/api/rooms.api.ts: Gom toàn bộ hàm gọi API phòng.