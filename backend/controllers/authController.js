import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  createOtpRecord,
  getOtpMeta,
  isOtpMatch,
  sendPasswordResetOtp,
} from "../services/otpService.js";

const ADMIN_SIGNUP_PASSCODE = process.env.ADMIN_PASSCODE || "admin";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const normalizePhone = (phone = "") => phone.replace(/\s+/g, "").trim();

const buildAuthResponse = (user) => ({
  token: generateToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
  },
});

const clearResetOtp = (user) => {
  user.resetOTP = null;
  user.resetOTPExpiry = null;
  user.resetOTPChannel = null;
  user.resetOTPTarget = null;
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, roleIntent, adminPasscode } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = normalizePhone(phone);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    if (normalizedPhone) {
      const existingPhoneUser = await User.findOne({ phone: normalizedPhone });

      if (existingPhoneUser) {
        res.status(400);
        throw new Error("Phone number already in use");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const wantsAdminAccess = roleIntent === "admin";

    if (wantsAdminAccess && adminPasscode !== ADMIN_SIGNUP_PASSCODE) {
      res.status(403);
      throw new Error("Invalid admin passcode");
    }

    const role = wantsAdminAccess ? "admin" : "student";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone || undefined,
      password: hashedPassword,
      role,
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password, loginMode } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (loginMode === "admin" && user.role !== "admin") {
      res.status(403);
      throw new Error("This account is not registered as an admin");
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

const getUserByResetIdentifier = async ({ email, phone }) => {
  if (email) {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  if (phone) {
    return User.findOne({ phone: normalizePhone(phone) });
  }

  return null;
};

export const sendForgotPasswordOTP = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      res.status(400);
      throw new Error("Email or phone is required");
    }

    const user = await getUserByResetIdentifier({ email, phone });

    if (!user) {
      res.status(404);
      throw new Error("No account found with the provided identifier");
    }

    const channel = email ? "email" : "phone";
    const target = email ? user.email : user.phone;
    const { otp, hashedOtp, otpExpiry } = createOtpRecord();

    user.resetOTP = hashedOtp;
    user.resetOTPExpiry = otpExpiry;
    user.resetOTPChannel = channel;
    user.resetOTPTarget = target;

    try {
      await user.save();
      await sendPasswordResetOtp({ channel, target, otp, req });
    } catch (deliveryError) {
      clearResetOtp(user);
      await user.save();
      throw deliveryError;
    }

    res.json({
      message: `OTP sent to your ${channel === "email" ? "email" : "phone"}`,
      deliveryMethod: channel,
      ...getOtpMeta(),
    });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOTP = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;

    if ((!email && !phone) || !otp) {
      res.status(400);
      throw new Error("Identifier and OTP are required");
    }

    const user = await getUserByResetIdentifier({ email, phone });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!user.resetOTP || !user.resetOTPExpiry) {
      res.status(400);
      throw new Error("No OTP request found. Please request a new OTP");
    }

    const normalizedTarget = email ? email.toLowerCase().trim() : normalizePhone(phone);

    if (user.resetOTPTarget !== normalizedTarget) {
      res.status(400);
      throw new Error("OTP request does not match this identifier");
    }

    if (Date.now() > new Date(user.resetOTPExpiry).getTime()) {
      clearResetOtp(user);
      await user.save();
      res.status(400);
      throw new Error("OTP has expired. Please request a new one");
    }

    if (!isOtpMatch(otp, user.resetOTP)) {
      res.status(401);
      throw new Error("Invalid OTP");
    }

    res.json({
      message: "OTP verified successfully",
      valid: true,
      expiresAt: user.resetOTPExpiry,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, phone, otp, newPassword, confirmPassword } = req.body;

    if ((!email && !phone) || !otp || !newPassword || !confirmPassword) {
      res.status(400);
      throw new Error("All fields are required");
    }

    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error("New password and confirm password do not match");
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const user = await getUserByResetIdentifier({ email, phone });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!user.resetOTP || !user.resetOTPExpiry) {
      res.status(400);
      throw new Error("No OTP request found. Please request a new OTP");
    }

    const normalizedTarget = email ? email.toLowerCase().trim() : normalizePhone(phone);

    if (user.resetOTPTarget !== normalizedTarget) {
      res.status(400);
      throw new Error("OTP request does not match this identifier");
    }

    if (Date.now() > new Date(user.resetOTPExpiry).getTime()) {
      clearResetOtp(user);
      await user.save();
      res.status(400);
      throw new Error("Session expired. Please start the password reset process again");
    }

    if (!isOtpMatch(otp, user.resetOTP)) {
      res.status(401);
      throw new Error("Invalid OTP");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    clearResetOtp(user);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
