import express from "express";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { connectDB } from "./lib/db.js";
import fileUpload from "express-fileupload";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statsRoutes from "./routes/stat.route.js";
import playlistRoutes from "./routes/playlist.route.js";
// import { verifyFirebaseToken } from "./middleware/verifyFirebaseToken.middleware.js";
import "./firebase/firebaseAdmin.js";
import cors from "cors";
import { initializeSocket } from "./lib/socket.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT;

const httpSever = createServer(app);
initializeSocket(httpSever);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json()); // to parse req.body
// app.use(verifyFirebaseToken); // to verify firebase token
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"),
    createParentPath: true,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  })
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/playlist", playlistRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

httpSever.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});
