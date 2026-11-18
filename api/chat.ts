import { GoogleGenAI, ThinkingLevel } from '@google/genai';

interface ChatMessageInput {
  role: 'user' | 'model';
  text: string;
}

interface VercelRequestLike {
  method?: string;
  body?: {
    messages?: ChatMessageInput[];
    currentProduct?: string;
  };
}

interface VercelResponseLike {
  status: (code: number) => { json: (payload: unknown) => void };
}

const SYSTEM_INSTRUCTION = `Bạn là Chuyên viên Tư vấn Khúc xạ & Phong cách của thương hiệu mắt kính thời trang thủ công SOLIS OPTIQUE (Việt Nam).
Hãy trả lời bằng tiếng Việt tự nhiên, lịch sự, súc tích (tối đa 3–5 câu ngắn hoặc gạch đầu dòng gọn gàng) và bám sát danh mục sản phẩm thực tế:
1. Moncada Tortoise Square (3.450.000 ₫, Kính mát Acetate Ý, 52 □ 20 — 145, 34g) — Hợp mặt tròn, trái xoan.
2. Sabae Brushed Round (4.200.000 ₫, Gọng cận Beta-Titanium Nhật, 48 □ 21 — 145, 13g) — Hợp mặt vuông, trái tim, trái xoan.
3. Aeron Double-Bridge Aviator (3.850.000 ₫, Kính mát cầu đôi Titanium, 55 □ 17 — 146, 22g) — Hợp mặt vuông, trái xoan, trái tim.
4. Céleste Ivory Cat-Eye (3.290.000 ₫, Kính mát mắt mèo Acetate ngà, 51 □ 19 — 142, 29g) — Hợp mặt tròn, vuông, trái xoan.
5. Koto Crystal Geometric (2.650.000 ₫, Gọng cận đa giác Acetate Nhật, 50 □ 20 — 145, 26g) — Hợp mặt tròn, trái xoan, trái tim.
6. Atelier Crown Panto (3.150.000 ₫, Gọng cận Crown Panto Acetate 8mm, 47 □ 22 — 145, 28g) — Hợp mặt vuông, trái tim, trái xoan.
Tròng nâng cấp: Tròng râm có độ (+750.000 ₫), Lọc ánh sáng xanh 1.60 (+650.000 ₫), Đổi màu 1.67 (+1.250.000 ₫).
Showroom: 42 Xuân Thủy & 118 Lý Tự Trọng (TP.HCM); 27 Nhà Chung (Hà Nội). Mở cửa 09:30–21:00.`;

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({
      error: 'Chưa cấu hình GEMINI_API_KEY trong Environment Variables trên Vercel.',
    });
    return;
  }

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (messages.length === 0) {
    res.status(400).json({ error: 'Vui lòng nhập nội dung câu hỏi.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contents = messages.slice(-12).map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(msg.text || '').slice(0, 2000) }],
    }));

    const contextNote = req.body?.currentProduct
      ? `\n\n[Ngữ cảnh: Khách đang xem "${req.body.currentProduct}".]`
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

    const reply = response.text?.trim();
    if (!reply) {
      res.status(502).json({ error: 'Trợ lý AI chưa phản hồi được nội dung.' });
      return;
    }

    res.status(200).json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi kết nối dịch vụ AI.';
    res.status(500).json({ error: `Không thể xử lý yêu cầu tư vấn (${message}).` });
  }
}
