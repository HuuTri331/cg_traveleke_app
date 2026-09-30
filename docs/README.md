# TỦ SÁCH TÀI LIỆU KIẾN TRÚC FRONTEND – CG TRAVELEKE APP
> **Hệ thống Quản lý & Đặt phòng Khách sạn Traveleke (Giao diện Người dùng & Dashboard)**  
> **Nền tảng & Công nghệ:** Next.js 16 (App Router), React 19.2, Tailwind CSS 4, Socket.IO Client, TypeScript

---

## 📌 DANH MỤC TÀI LIỆU KIẾN TRÚC FRONTEND

| STT | Tài liệu chuyên đề | File tài liệu chi tiết | Trọng tâm nội dung & Giá trị thực tế |
| :---: | :--- | :--- | :--- |
| **1** | **Giải bài toán Realtime: So sánh Socket.IO & Pusher** | [`GIAI_BAI_TOAN_REALTIME_NEXTJS_SOCKETIO_VA_PUSHER.md`](./GIAI_BAI_TOAN_REALTIME_NEXTJS_SOCKETIO_VA_PUSHER.md) | • Phân tích bài toán kết nối bền vững (Persistent Connection) trên nền tảng Next.js Serverless.<br>• So sánh toàn diện Managed Realtime (Pusher) vs Self-hosted (Socket.IO).<br>• Kiến trúc tách rời EventEmitter, Handshake Authentication và Rooms.<br>• Giải pháp đã hoàn thiện và kiểm thử thực tế trong dự án Traveleke. |
| **2** | **Tự động hóa Design Tokens & Tối ưu hóa Tailwind CSS v4** | [`KIEN_TRUC_DESIGN_TOKENS_VA_TOI_UU_TAILWIND_V4.md`](./KIEN_TRUC_DESIGN_TOKENS_VA_TOI_UU_TAILWIND_V4.md) | • Thiết kế Design Tokens JSON theo chuẩn W3C DTCG làm Single Source of Truth.<br>• Pipeline Node.js tự động chuyển đổi tokens thành theme CSS `@theme` của Tailwind v4.<br>• Rà soát và xóa bỏ 100% arbitrary hex values trên toàn bộ component giao diện.<br>• Triệt tiêu Dynamic Class Interpolation và kiểm soát việc lạm dụng `@apply`. |
| **3** | **Tối ưu CSS Critical Rendering Path & Inlined Critical CSS** | [`KIEN_TRUC_CSS_CRITICAL_RENDERING_PATH_VA_INLINED_CRITICAL_CSS.md`](./KIEN_TRUC_CSS_CRITICAL_RENDERING_PATH_VA_INLINED_CRITICAL_CSS.md) | • Khắc phục triệt để hiện tượng CSS Render-blocking trên Critical Rendering Path.<br>• Engine PostCSS AST tự động trích xuất Critical CSS cho vùng Above-The-Fold.<br>• Bảo toàn 100% Cascade Layers, Theme Variables và Preflight trong Tailwind v4.<br>• Chiến lược Cookie-based Caching phân biệt First-visit (siêu nhanh) và Repeat-visit (siêu nhẹ). |

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
