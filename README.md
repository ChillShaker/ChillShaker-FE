# Bar Table Booking System

Hệ thống đặt bàn trực tuyến cho quán bar với giao diện người dùng hiện đại và trải nghiệm mượt mà.

## Tính năng chính

- **Quản lý tài khoản**
  - Đăng ký/Đăng nhập với email hoặc Google
  - Xác thực OTP
  - Quản lý thông tin cá nhân
  - Lịch sử đặt bàn

- **Đặt bàn**
  - Chọn ngày giờ và loại bàn (Bar Counter, Lounge, VIP Booth, Party Bar)
  - Đặt bàn kèm menu hoặc đồ uống
  - Thanh toán đặt cọc trực tuyến
  - Theo dõi trạng thái đặt bàn realtime

- **Tính năng khác**
  - Xem thông tin chi tiết quán bar
  - Khám phá menu và đồ uống đa dạng
  - Tìm kiếm và lọc đồ uống
  - Giao diện responsive trên mọi thiết bị

## Công nghệ sử dụng

- React + Vite
- Material-UI cho UI components
- Axios cho HTTP requests
- WebSocket cho realtime updates
- JWT cho authentication
- Styled-components cho styling

## Cài đặt

1. Clone repository

```bash
git clone https://github.com/ChillShaker/ChillShaker-FE.git
```

2. Cài đặt dependencies

```bash
npm install
```

3. Tạo file .env và cấu hình các biến môi trường

```env
VITE_BASE_URL=http://localhost:8080/api/v1
VITE_DEFAULT_BAR_ID=b94f3dfb-3e7a-4b73-b9c4-123456789abc
```

4. Chạy dự án

```bash
npm run dev
```

5. Truy cập trang chủ

```bash
http://localhost:5173
```