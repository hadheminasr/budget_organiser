import jwt from "jsonwebtoken";
import { User } from "../models/User.js"; 

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.token; 
    if (!token) {
      return res.status(401).json({ ok: false, message: "Not authenticated (no token)" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({ ok: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.clearCookie("token");
      return res.status(401).json({ ok: false, message: "Token expired" });
    }

    res.clearCookie("token");
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
};
