# SOLIS OPTIQUE — Trang Web Mắt Kính Thời Trang Độc Lập

Website thương mại điện tử mắt kính thời trang tích hợp **VR 360° Showroom**, **AR thử kính trực tiếp**, **Chatbot AI (Gemini)**, **Framer Motion** và giỏ hàng lưu trữ cục bộ.

---

## Cách tạo link web riêng từ GitHub (3 lựa chọn miễn phí)

### Cách 1: Tạo link trực tiếp trên GitHub Pages (`https://<ten-github>.github.io/<ten-repo>/`)
Dự án đã cấu hình sẵn GitHub Actions (`.github/workflows/deploy-pages.yml`) và đường dẫn ảnh động theo tên repo.
1. Tải dự án này từ Google AI Studio (**Download / Export**) và đưa toàn bộ lên một repository GitHub mới (đặt nhánh chính là `main`).
2. Trên GitHub, vào **Settings → Pages**.
3. Tại mục **Build and deployment → Source**, chọn **GitHub Actions**.
4. Chờ khoảng 1 phút để Action chạy xong — GitHub sẽ cấp cho bạn link web riêng dạng `https://<ten-github>.github.io/<ten-repo>/`.

*(Lưu ý: GitHub Pages chỉ chạy web tĩnh nên phần Giao diện, Giỏ hàng, VR 360° và AR Camera hoạt động bình thường; riêng Chatbot AI Gemini cần máy chủ ở Cách 2 hoặc Cách 3).*

---

### Cách 2: Kết nối GitHub với Vercel (`https://<ten-web>.vercel.app`) — *Chạy đủ cả Chatbot AI*
Dự án đã có sẵn `api/chat.ts` và `vercel.json` cho Vercel:
1. Đưa mã nguồn lên GitHub.
2. Đăng nhập **vercel.com** bằng tài khoản GitHub → bấm **Add New → Project** → chọn repo vừa tạo.
3. Trong mục **Environment Variables**, thêm:
   - `GEMINI_API_KEY` = *(khóa API Gemini của bạn)*
4. Bấm **Deploy** → nhận link web riêng dạng `https://solis-optique.vercel.app` (chạy 24/7, không ngủ sau 15 phút, gắn tên miền `.vn`/`.com` miễn phí).

---

### Cách 3: Kết nối GitHub với Render.com (`https://<ten-web>.onrender.com`)
Dự án đã có sẵn `render.yaml` (đặt sẵn máy chủ Singapore):
1. Đưa mã nguồn lên GitHub.
2. Đăng nhập **render.com** → **New → Blueprint** (hoặc **Web Service**) → chọn repo GitHub.
3. Thêm biến môi trường `GEMINI_API_KEY`.
4. Bấm **Apply / Deploy** để nhận link web riêng miễn phí.

---

## Chạy thử trên máy cá nhân (Local)
```bash
npm install
cp .env.example .env
# Điền GEMINI_API_KEY=... vào file .env
npm run dev
```
Truy cập `http://localhost:3000`.
