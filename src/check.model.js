// check_models.js
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("Đang kiểm tra Key:", API_KEY ? "Đã có Key" : "Chưa có Key");

fetch(URL)
  .then((res) => res.json())
  .then((data) => {
    if (data.error) {
      console.error("❌ LỖI API:", data.error.message);
    } else {
      console.log("✅ DANH SÁCH MODEL KHẢ DỤNG:");
      // Lọc ra các model có thể generateContent
      const models = data.models
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name);
      console.log(models);
    }
  })
  .catch((err) => console.error("Lỗi kết nối:", err));