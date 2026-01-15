import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Định nghĩa tính cách và luật lệ cho AI
const SYSTEM_INSTRUCTION = `
Bạn là Trợ lý Âm nhạc (AI DJ) của hệ thống MusicApp.
Nhiệm vụ của bạn:
1. Gợi ý bài hát dựa trên cảm xúc hoặc yêu cầu của người dùng.
2. QUAN TRỌNG: Chỉ được gợi ý các bài hát có trong "Danh sách nhạc hiện có" dưới đây. Tuyệt đối không bịa ra bài hát không có trong hệ thống.
3. Nếu người dùng hỏi bài hát không có trong danh sách, hãy khéo léo xin lỗi và gợi ý bài khác có phong cách tương tự đang có trong hệ thống.
4. Phong cách trả lời: Thân thiện, ngắn gọn, chuyên nghiệp, sử dụng icon âm nhạc (🎵, 🎧, 🎸) hợp lý.
5. Khi nhắc đến tên bài hát, hãy để trong dấu ngoặc kép, ví dụ: "Tên Bài Hát" - Ca sĩ.

Danh sách nhạc hiện có trong Database:
`;

export const askGemini = async (messages, songList = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    // 1. Tạo Context dữ liệu nhạc từ DB gửi sang
    // Chỉ lấy Tên và Ca sĩ để tiết kiệm Token
    const musicContext =
      songList.length > 0
        ? songList
            .map((s) => `- Bài: "${s.title}" - Ca sĩ: ${s.artist}`)
            .join("\n")
        : "(Hiện chưa có dữ liệu bài hát nào trong hệ thống)";

    // 2. Ghép Prompt hệ thống
    const systemMessage = {
      role: "user", // Dùng role user để giả lập System Prompt cho chắc chắn
      parts: [
        {
          text:
            SYSTEM_INSTRUCTION +
            musicContext +
            "\n\n--- BẮT ĐẦU HỘI THOẠI ---\n",
        },
      ],
    };

    // 3. Format lịch sử chat
    const formattedHistory = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // 4. Đưa System Message lên đầu tiên để AI "học" trước khi trả lời
    const fullHistory = [systemMessage, ...formattedHistory];

    // 5. Tách tin nhắn cuối cùng làm prompt kích hoạt
    const lastMessage = fullHistory.pop();
    const prompt = lastMessage.parts[0].text;

    const chat = model.startChat({
      history: fullHistory,
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;

    return response.text();
  } catch (err) {
    console.error("❌ Gemini Service Error:", err);
    return "Xin lỗi, hệ thống AI đang bảo trì một chút (Quá số lượt truy cập quá tải). Bạn quay lại sau nhé! 🎧";
  }
};
