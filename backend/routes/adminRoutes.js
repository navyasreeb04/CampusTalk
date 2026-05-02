import express from "express";
import {
  getDashboardData,
  getPlacementStats,
  getTopSkillsOffered,
  getTopSkillsRequired,
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/dashboard", getDashboardData);
router.get("/dashboard/top-skills-required", getTopSkillsRequired);
router.get("/dashboard/top-skills-offered", getTopSkillsOffered);
router.get("/dashboard/placement-stats", getPlacementStats);

export default router;
