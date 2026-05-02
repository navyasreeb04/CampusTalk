import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import placementRoutes from "./routes/placementRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import skillMapRoutes from "./routes/skillMapRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "uploads");

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = new Set([
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ]);

      const configuredOrigins = (process.env.CLIENT_URL || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      configuredOrigins.forEach((item) => allowedOrigins.add(item));

      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS blocked for this origin"));
    },
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

app.get("/api/health", (req, res) => {
  res.json({ message: "CampusTalk backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/skillmap", skillMapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
