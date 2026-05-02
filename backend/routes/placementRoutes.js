import express from "express";
import {
  createPlacementComment,
  createPlacementPost,
  getPlacementComments,
  getPlacementPosts,
  togglePlacementLike,
} from "../controllers/placementController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", createPlacementPost);
router.get("/", getPlacementPosts);
router.put("/:id/like", togglePlacementLike);
router.post("/:id/comment", createPlacementComment);
router.get("/:id/comments", getPlacementComments);

export default router;

