import bcrypt from "bcryptjs";
import User from "../models/User.js";

const normalizePhone = (phone = "") => phone.replace(/\s+/g, "").trim();

const mapUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role,
});

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ user: mapUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    if (!name?.trim() || !email?.trim()) {
      res.status(400);
      throw new Error("Name and email are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = normalizePhone(phone);

    const existingEmailUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user },
    });

    if (existingEmailUser) {
      res.status(400);
      throw new Error("Email already in use by another user");
    }

    if (normalizedPhone) {
      const existingPhoneUser = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: req.user },
      });

      if (existingPhoneUser) {
        res.status(400);
        throw new Error("Phone number already in use");
      }
    }

    const user = await User.findById(req.user);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.phone = normalizedPhone || undefined;
    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: mapUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const changeCurrentUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400);
      throw new Error("Current password, new password, and confirm password are required");
    }

    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error("New password and confirm password do not match");
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const user = await User.findById(req.user);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    if (currentPassword === newPassword) {
      res.status(400);
      throw new Error("New password must be different from current password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
