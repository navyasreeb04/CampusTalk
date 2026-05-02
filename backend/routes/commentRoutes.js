import express from "express";
import {
  createComment,
  getCommentsByPost,
} from "../controllers/commentController.js";
import { protect, studentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(studentOnly);
router.post("/:postId", createComment);
router.get("/:postId", getCommentsByPost);

export default router;
