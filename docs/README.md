# TỦ SÁCH TÀI LIỆU KIẾN TRÚC FRONTEND – CG TRAVELEKE APP
> **Hệ thống Quản lý & Đặt phòng Khách sạn Traveleke (Giao diện Người dùng & Dashboard)**  
> **Nền tảng & Công nghệ:** Next.js 16 (App Router), React 19.2, Tailwind CSS 4, Socket.IO Client, TypeScript

---

## 📌 DANH MỤC TÀI LIỆU KIẾN TRÚC FRONTEND

| STT | Tài liệu chuyên đề | File tài liệu chi tiết | Trọng tâm nội dung & Giá trị thực tế |
| :---: | :--- | :--- | :--- |
| **1** | **Giải bài toán Realtime: So sánh Socket.IO & Pusher** | [`GIAI_BAI_TOAN_REALTIME_NEXTJS_SOCKETIO_VA_PUSHER.md`](./GIAI_BAI_TOAN_REALTIME_NEXTJS_SOCKETIO_VA_PUSHER.md) | • Phân tích bài toán kết nối bền vững (Persistent Connection) trên nền tảng Next.js Serverless.<br>• So sánh toàn diện Managed Realtime (Pusher) vs Self-hosted (Socket.IO).<br>• Kiến trúc tách rời EventEmitter, Handshake Authentication và Rooms.<br>• Giải pháp đã hoàn thiện và kiểm thử thực tế trong dự án Traveleke. |

---

## 🏗️ TỔNG QUAN KIẾN TRÚC REALTIME PHÍA CLIENT (NEXT.JS 16)

```text
    ┌─────────────────────────────────────────────────────────────┐
    │                 NEXT.JS 16 APP ROUTER                       │
    ├─────────────────────────────────────────────────────────────┤
    │ 1. ROOT LAYOUT (src/app/layout.tsx)                         │
    │    └── ToastProvider                                        │
    │        └── RealtimeProvider (Quản lý kết nối & Thông báo)   │
    │                                                             │
    │ 2. SINGLETON SOCKET MANAGER (src/lib/socket.ts)             │
    │    • Khởi tạo duy nhất 1 Socket connection toàn ứng dụng    │
    │    • Tự động nạp Access Token trong quá trình Handshake     │
    │    • Tự động Reconnect với Exponential Backoff              │
    │                                                             │
    │ 3. GIAO DIỆN LỄ TÂN & KHÁCH HÀNG                            │
    │    • Màn hình Lễ tân (/bookings): Tự động nạp đơn mới       │
    │    • Lịch sử Khách hàng (/booking-history): Đổi trạng thái  │
    │    • Header Dashboard: Đèn báo Realtime Live & Chuông alert │
    └─────────────────────────────────────────────────────────────┘
```

---

## 🎯 GIÁ TRỊ VẬN HÀNH
1. **Khách hàng**: Trải nghiệm đặt phòng tức thời, đồng bộ trạng thái thẻ đặt phòng tự động mà không cần F5.
2. **Lễ tân**: Nhận cảnh báo đơn mới và yêu cầu dịch vụ ngay lập tức, phục vụ khách chu đáo và không bỏ sót đơn.
3. **Quản lý**: Kiểm soát 100% dữ liệu, không lo chi phí tăng vọt của dịch vụ đám mây bên thứ ba.
