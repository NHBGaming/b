import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const SYSTEM_INSTRUCTION = `Bạn là Chuyên viên Tư vấn Khúc xạ & Phong cách của thương hiệu mắt kính thời trang thủ công SOLIS OPTIQUE (Việt Nam).
Hãy trả lời bằng tiếng Việt tự nhiên, lịch sự, súc tích (tối đa 3–5 câu ngắn hoặc gạch đầu dòng gọn gàng) và bám sát danh mục sản phẩm thực tế sau:

1. Moncada Tortoise Square (SKU: SO-2601) — Kính mát Acetate Mazzucchelli Ý — Giá: 3.450.000 ₫ — Kích thước: 52 □ 20 — 145 (34g). Hợp mặt tròn, trái xoan. Màu: Đồi mồi sẫm, Đen tuyền, Nâu hổ phách.
2. Sabae Brushed Round (SKU: SO-2602) — Gọng cận Beta-Titanium Nhật Bản siêu nhẹ — Giá: 4.200.000 ₫ — Kích thước: 48 □ 21 — 145 (13g). Hợp mặt vuông, trái tim, trái xoan. Màu: Vàng champagne, Bạc xước mờ, Xám titan.
3. Aeron Double-Bridge Aviator (SKU: SO-2603) — Kính mát cầu đôi Titanium & Thép y tế — Giá: 3.850.000 ₫ — Kích thước: 55 □ 17 — 146 (22g). Hợp mặt vuông, trái xoan, trái tim. Màu: Xám súng & Ô-liu, Đen nhám.
4. Céleste Ivory Cat-Eye (SKU: SO-2604) — Kính mát mắt mèo Acetate ngà trong — Giá: 3.290.000 ₫ — Kích thước: 51 □ 19 — 142 (29g). Hợp mặt tròn, vuông, trái xoan. Màu: Ngà trong suốt, Hồng phấn khói, Đen cổ điển.
5. Koto Crystal Geometric (SKU: SO-2605) — Gọng cận đa giác Acetate Takiron Nhật Bản — Giá: 2.650.000 ₫ — Kích thước: 50 □ 20 — 145 (26g). Hợp mặt tròn, trái xoan, trái tim. Màu: Xám pha lê, Trắng ngà trong, Xanh rêu trong.
6. Atelier Crown Panto (SKU: SO-2606) — Gọng cận Crown Panto Acetate 8mm phay thủ công — Giá: 3.150.000 ₫ — Kích thước: 47 □ 22 — 145 (28g). Hợp mặt vuông, trái tim, trái xoan. Màu: Đồi mồi mật ong, Đen vân gỗ.

Tùy chọn tròng kính:
- Kính mát: Tròng phân cực UV400 (tiêu chuẩn) hoặc Tròng mát có độ cận/loạn 1.60 (+750.000 ₫).
- Gọng cận: Gọng & tròng mẫu (tiêu chuẩn), Tròng lọc ánh sáng xanh 1.60 (+650.000 ₫), Tròng đổi màu siêu mỏng 1.67 (+1.250.000 ₫).

Chính sách & Showroom:
- Miễn phí giao hàng toàn quốc đơn từ 2.000.000 ₫, đổi trả 14 ngày, bảo hành 24 tháng, vệ sinh siêu âm & cân chỉnh miễn phí trọn đời.
- Showroom TP.HCM: 42 Xuân Thủy (Thảo Điền) & 118 Lý Tự Trọng (Q.1).
- Showroom Hà Nội: 27 Nhà Chung (Hoàn Kiếm). Giờ mở cửa: 09:30 – 21:00 hàng ngày.
- Website có tích hợp tính năng Thử kính AR trực tiếp bằng camera và Xem Showroom VR 360° / 3D cận cảnh — hãy gợi ý khách dùng thử tính năng AR/VR ngay trên trang nếu phù hợp.`;

interface ChatMessageInput {
  role: 'user' | 'model';
  text: string;
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'solis-optique' });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const body = req.body as {
        messages?: ChatMessageInput[];
        currentProduct?: string;
      };
      const messages = Array.isArray(body?.messages) ? body.messages : [];
      if (messages.length === 0) {
        res.status(400).json({ error: 'Vui lòng nhập nội dung câu hỏi.' });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Chưa cấu hình GEMINI_API_KEY trong bảng Secrets. Vui lòng thiết lập khóa API để kích hoạt trợ lý tư vấn AI.',
        });
        return;
      }

      const contents = messages.slice(-12).map((msg) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(msg.text || '').slice(0, 2000) }],
      }));

      const contextNote = body.currentProduct
        ? `\n\n[Ngữ cảnh hiện tại: Khách hàng đang xem mẫu kính "${body.currentProduct}".]`
        : '';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + contextNote,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({ error: 'Trợ lý AI chưa phản hồi được nội dung, vui lòng thử lại.' });
        return;
      }

      res.json({ reply: replyText });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Lỗi kết nối đến dịch vụ AI.';
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: number }).status) || 500
          : 500;
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error:
          status === 403 || status === 400
            ? 'Khóa GEMINI_API_KEY không hợp lệ hoặc chưa đủ quyền. Vui lòng kiểm tra trong Settings > Secrets.'
            : status === 429
            ? 'Hệ thống đang quá tải lượt hỏi, vui lòng thử lại sau vài giây.'
            : `Không thể xử lý yêu cầu tư vấn (${message}).`,
      });
    }
  });

  const distDir = path.resolve(__dirname, 'dist');
  const serveBuiltDist = () => {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build directory not found. Run "npm run build" first.');
      }
    });
  };

  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch {
      serveBuiltDist();
    }
  } else {
    serveBuiltDist();
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOLIS OPTIQUE server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
