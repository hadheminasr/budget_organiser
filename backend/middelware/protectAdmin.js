import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protectAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.token; 

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("role");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    req.user = user; 
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
