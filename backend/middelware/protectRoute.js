import jwt from "jsonwebtoken";
import { User } from "../models/User.js"; 

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.token; // adapte "token" si ton cookie a un autre nom
    if (!token) {
      return res.status(401).json({ ok: false, message: "Not authenticated (no token)" });
    }

    // ✅ verify check signature + exp (expiration) automatically
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ (optionnel mais clair) check exp manuellement aussi
    if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
      // tu peux aussi nettoyer le cookie
      res.clearCookie("token");
      return res.status(401).json({ ok: false, message: "Token expired" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.clearCookie("token");
      return res.status(401).json({ ok: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    // ✅ distinguer l'expiration vs autre erreur
    if (err.name === "TokenExpiredError") {
      res.clearCookie("token");
      return res.status(401).json({ ok: false, message: "Token expired" });
    }

    res.clearCookie("token");
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
};
