import express from "express";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/me", getCurrentUser);
router.put("/update", updateCurrentUser);
router.put("/change-password", changeCurrentUserPassword);

export default router;
