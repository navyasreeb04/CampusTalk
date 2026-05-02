import express from "express";
import {
  createPost,
  getMyFeed,
  getPosts,
  getTrendingPosts,
  toggleLikePost,
} from "../controllers/postController.js";
import { uploadPostImage } from "../middleware/uploadMiddleware.js";
import { protect, studentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(studentOnly);
router.post("/", uploadPostImage.single("image"), createPost);
router.get("/", getPosts);
router.get("/myfeed", getMyFeed);
router.get("/trending", getTrendingPosts);
router.put("/:id/like", toggleLikePost);

export default router;
