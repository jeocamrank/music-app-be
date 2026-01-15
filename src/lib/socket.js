import { Server } from "socket.io";
import { Message } from "../models/message.model.js";
import { Song } from "../models/song.model.js"; // <--- 1. IMPORT MODEL SONG
import { askGemini } from "../services/ai.service.js";

const AI_ID = "AI_ASSISTANT";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  const userSocket = new Map();
  const userActivities = new Map();

  io.on("connection", (socket) => {
    /* ================= USER CONNECT (GIỮ NGUYÊN) ================= */
    socket.on("user_connected", (userId) => {
      userSocket.set(userId, socket.id);
      userActivities.set(userId, "Idle");
      io.emit("user_connected", userId);
      socket.emit("users_online", Array.from(userSocket.keys()));
      io.emit("activities", Array.from(userActivities.entries()));
    }); /* ================= ACTIVITY (GIỮ NGUYÊN) ================= */

    socket.on("update_activity", ({ userId, activity }) => {
      userActivities.set(userId, activity);
      io.emit("activity_updated", { userId, activity });
    }); /* ================= SEND MESSAGE ================= */

    socket.on("send_message", async ({ senderId, receiverId, content }) => {
      try {
        if (!content?.trim()) return; /* ===== SAVE USER MESSAGE ===== */

        const userMessage = await Message.create({
          senderId,
          receiverId,
          content,
        });

        socket.emit(
          "message_sent",
          userMessage
        ); /* ================= AI CHAT (CẬP NHẬT ĐOẠN NÀY) ================= */

        if (receiverId === AI_ID) {
          // A. Lấy lịch sử chat
          let history = await Message.find({
            $or: [
              { senderId: senderId, receiverId: AI_ID },
              { senderId: AI_ID, receiverId: senderId },
            ],
          })
            .sort({ createdAt: -1 })
            .limit(20);

          history = history.reverse(); // B. 👇 LẤY DỮ LIỆU NHẠC TỪ DATABASE 👇 // Chỉ lấy trường 'title' và 'artist' để nhẹ dữ liệu // Giới hạn 50 bài mới nhất (hoặc random tùy bạn) để AI tham khảo

          const songs = await Song.find({})
            .select("title artist")
            .sort({ createdAt: -1 })
            .limit(50); // C. Gửi cả Lịch sử + Danh sách nhạc sang AI Service

          const aiReply = await askGemini(history, songs);

          const aiMessage = await Message.create({
            senderId: AI_ID,
            receiverId: senderId,
            content: aiReply,
          });

          socket.emit("receive_message", aiMessage);
          return;
        } /* ================= USER ↔ USER (GIỮ NGUYÊN) ================= */

        const receiverSocketId = userSocket.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", userMessage);
        }
      } catch (error) {
        console.error("message error:", error);
        socket.emit("message_error", error.message);
      }
    }); /* ================= DISCONNECT (GIỮ NGUYÊN) ================= */

    socket.on("disconnect", () => {
      let disconnectedUserId;
      for (const [userId, socketId] of userSocket.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSocket.delete(userId);
          userActivities.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        io.emit("user_disconnected", disconnectedUserId);
      }
    });
  });
};
