import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  const userSocket = new Map(); // userId: socketId
  const userActivities = new Map(); // userId: activity

  io.on("connection", (socket) => {
    socket.on("user_connected", (userId) => {
      userSocket.set(userId, socket.id);
      userActivities.set(userId, "Idle");

      // broadcast to all sockets that this user logged in
      io.emit("user_connected", userId);

      socket.emit("users_online", Array.from(userSocket.keys()));

      io.emit("activities", Array.from(userActivities.entries()));
    });

    socket.on("update_activity", ({ userId, activity }) => {
      console.log("activity updated", userId, activity);
      userActivities.set(userId, activity);
      io.emit("activity_updated", { userId, activity });
    });

    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, content } = data;
        const message = await Message.create({
          senderId,
          receiverId,
          content,
        });

        // send to receiver in realtime if online
        const receiverSocketId = userSocket.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }

        socket.emit("message_sent", message);
      } catch (error) {
        console.log("message error:", error);
        socket.emit("message_error", error.message);
      }
    });

    socket.on("disconnect", () => {
      let disconnectedUserId;
      for (const [userId, socketId] of userSocket.entries()) {
        // find disconected user
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
