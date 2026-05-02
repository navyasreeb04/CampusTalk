import express from "express";
import {
  getChatById,
  sendMessage,
  startChat,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/start", startChat);
router.post("/message", sendMessage);
router.get("/:chatId", getChatById);

export default router;

