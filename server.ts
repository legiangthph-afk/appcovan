import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(apiKey),
    app: "VƯỜN SAO TRI THỨC 3A5 - CÔ KIỀU THỊ VÂN",
  });
});

// Endpoint: AI Soạn bài cho Cô Vân (Differentiated Grade 3 Lesson/Quiz Generator)
app.post("/api/gemini/create-lesson", async (req, res) => {
  const { subject, topic, objective, questionCount = 5, format = "Trắc nghiệm" } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: "Chưa cấu hình API Key trên máy chủ. Đang sử dụng chế độ ngân hàng bài tập ngoại tuyến phong phú.",
      fallback: true,
    });
  }

  try {
    const prompt = `
Bạn là Trợ lý Sư phạm Tiểu học chuyên môn cao dành cho Cô Kiều Thị Vân, giáo viên chủ nhiệm lớp 3A5 Trường Tiểu học Ngô Thì Nhậm, Hà Nội.
Hãy tạo bộ bài tập lớp 3 theo Chương trình GDPT 2018 với thông tin sau:
- Môn học: ${subject}
- Bài học / Chủ đề: ${topic}
- Mục tiêu cần đạt: ${objective || "Nắm vững kiến thức trọng tâm và vận dụng thực tiễn"}
- Hình thức: ${format}
- Số lượng câu hỏi mỗi mức độ: ${questionCount} câu

Yêu cầu phân hóa 3 mức độ (đặt tên tích cực, khích lệ trẻ):
1. "Mầm Xanh" (Mức cơ bản, nhận biết và thông hiểu kiến thức căn bản)
2. "Vươn Lên" (Mức vận dụng, rèn kỹ năng và liên hệ)
3. "Bứt Phá" (Mức vận dụng cao, tư duy sáng tạo, mở rộng)

Trả về ĐÚNG định dạng JSON với cấu trúc:
{
  "subject": "${subject}",
  "topic": "${topic}",
  "tiers": [
    {
      "tierName": "Mầm Xanh (Cơ bản)",
      "tierDescription": "Giúp các em củng cố kiến thức nền tảng",
      "questions": [
        {
          "id": "mx_1",
          "question": "Nội dung câu hỏi rõ ràng, phù hợp lứa tuổi lớp 3...",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correctAnswer": "A",
          "explanation": "Giải thích sư phạm dễ hiểu, ấm áp của Cô Vân"
        }
      ]
    },
    {
      "tierName": "Vươn Lên (Vận dụng)",
      "tierDescription": "Rèn luyện kỹ năng thực hành và kết nối",
      "questions": [...]
    },
    {
      "tierName": "Bứt Phá (Tư duy cao)",
      "tierDescription": "Thử thách trí tuệ và khơi nguồn sáng tạo",
      "questions": [...]
    }
  ]
}
Chỉ trả về JSON thuần túy, không có thẻ markdown bao quanh.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch {
      // Clean up markdown block if present
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xử lý AI";
    res.status(500).json({ error: message, fallback: true });
  }
});

// Endpoint: Chatbot Bạn Sao Thông Thái dành cho học sinh lớp 3
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history = [] } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: "Chưa kích hoạt AI trực tuyến. Sử dụng ngân hàng hỏi đáp thông thái ngoại tuyến.",
      fallback: true,
    });
  }

  try {
    const systemInstruction = `
Bạn là "Bạn Sao Thông Thái" ⭐ - người bạn học tập AI siêu đáng yêu, thân thiện và thông minh của các bạn nhỏ lớp 3A5 (cô giáo chủ nhiệm là Cô Kiều Thị Vân, trường Tiểu học Ngô Thì Nhậm, Hà Nội).

Quy tắc giao tiếp bắt buộc:
1. Xưng hô: "Bạn Sao Thông Thái" hoặc "tớ", gọi học sinh là "bạn nhỏ", "bạn ơi" hoặc "ngôi sao sáng 3A5".
2. Ngôn ngữ: Trong sáng, ấm áp, tích cực, ngắn gọn, phù hợp trình độ nhận thức học sinh lớp 3 (8-9 tuổi).
3. Phương pháp sư phạm gợi mở: KHÔNG ĐƯỢC làm hộ bài hoặc đưa ngay đáp án cuối cùng. Hãy gợi ý từng bước, đặt câu hỏi nhỏ để bạn tự tìm ra câu trả lời.
4. Khi học sinh hỏi về kiến thức (Toán, Tiếng Việt, TNXH...): giải thích bằng ví dụ gần gũi trong đời sống, kèm lời khen ngợi tinh thần ham học hỏi.
5. Luôn nhắc nhở an toàn: Luôn hỏi ý kiến cô Vân hoặc bố mẹ khi khám phá thế giới mạng, không chia sẻ thông tin cá nhân.
6. Nếu không rõ hoặc câu hỏi ngoài phạm vi học đường: Trả lời chân thật, không bịa nguồn, khuyên bạn nhỏ trao đổi thêm với Cô Vân trên lớp.
`;

    // Format chat contents
    const contents = [
      ...history.map((h: { sender: string; text: string }) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "Bạn Sao Thông Thái luôn đồng hành cùng bạn nhé! ⭐" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi kết nối AI";
    res.status(500).json({ error: message, fallback: true });
  }
});

async function startServer() {
  // Mount Vite development middlewares in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
