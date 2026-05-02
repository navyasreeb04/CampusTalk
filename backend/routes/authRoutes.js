import express from "express";
import {
  loginUser,
  registerUser,
  resetPassword,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
} from "../controllers/authController.js";
import {
  changeCurrentUserPassword,
  updateCurrentUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateCurrentUser);
router.put("/change-password", protect, changeCurrentUserPassword);
router.post("/forgot-password", sendForgotPasswordOTP);
router.post("/verify-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);
router.post("/forgot-password/send-otp", sendForgotPasswordOTP);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOTP);
router.post("/forgot-password/reset", resetPassword);

export default router;
