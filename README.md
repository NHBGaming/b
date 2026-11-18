# SOLIS OPTIQUE — Trang Web Mắt Kính Thời Trang Độc Lập

Website thương mại điện tử mắt kính thời trang tích hợp **VR 360° Showroom**, **AR thử kính trực tiếp**, **Chatbot AI (Gemini)**, **Framer Motion** và giỏ hàng lưu trữ cục bộ.

## 1. Mở ngay dưới dạng web riêng (Không cần cài đặt)
Sau khi nhấn **Share / Deploy** trong Google AI Studio, bạn có thể gửi trực tiếp link web độc lập này cho khách hàng (không hiển thị trình chỉnh sửa):
- `https://ais-pre-itnpt5c7wjo2sdsaodycra-614745091970.asia-east1.run.app`

## 2. Tự host trên máy chủ / tên miền riêng

### Yêu cầu
- Node.js `>= 22.18`
- Khóa API Gemini (`GEMINI_API_KEY`) để dùng tính năng Chatbot tư vấn AI.

### Chạy trên máy cá nhân (Local)
```bash
npm install
cp .env.example .env
# Điền GEMINI_API_KEY=... vào file .env
npm run dev
```
Truy cập `http://localhost:3000`.

### Chạy bản Production độc lập
```bash
npm install
npm run build
NODE_ENV=production GEMINI_API_KEY=your_key_here npm start
```

### Deploy nhanh lên Render / Railway / Google Cloud Run
- **Build Command:** `npm install && npm run build`
- **Start Command:** `NODE_ENV=production node server.ts`
- **Environment Variable:** `GEMINI_API_KEY` (và `PORT=3000` nếu nền tảng yêu cầu)
- Hoặc sử dụng sẵn `Dockerfile` đi kèm để triển khai container trực tiếp.
