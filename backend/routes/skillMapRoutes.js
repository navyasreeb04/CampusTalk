import express from "express";
import { createSkillPost, getSkillPosts } from "../controllers/skillMapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", createSkillPost);
router.get("/", getSkillPosts);

export default router;

