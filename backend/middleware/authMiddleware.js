import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id;
    req.userDoc = await User.findById(decoded.id).select("-password");

    if (!req.userDoc) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.userDoc?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

export const studentOnly = (req, res, next) => {
  if (req.userDoc?.role === "admin") {
    return res.status(403).json({ message: "Admins cannot access CampusBoard" });
  }

  next();
};
