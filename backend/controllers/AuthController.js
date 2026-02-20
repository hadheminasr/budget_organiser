import { AuthService } from "../service/index.js";

export const AuthController = {
  async signup(req, res) {
    try {
      const data = await AuthService.signup(req.body, res);
      return res.status(201).json({
        success: true,
        message: data.message,
        user: data.user,
        account: data.account,
      });
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async verifyEmail(req, res) {
    try {
      const data = await AuthService.verifyEmail(req.body);
      return res.status(200).json({
        success: true,
        message: data.message,
        user: data.user,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async login(req, res) {
    try {
      const data = await AuthService.login(req.body, res);
      return res.status(200).json({
        success: true,
        message: data.message,
        user: data.user,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax", // ou "strict" selon ton choix
        secure: false,   // true seulement en https
    });
    return res.status(200).json({ success: true, message: "logged out successfully" });
    },

    /*try {
      const data = await AuthService.logout(res);
      return res.status(200).json({ success: true, message: data.message });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },*/

  async forgotPassword(req, res) {
    try {
      const data = await AuthService.forgotPassword(req.body);
      return res.status(200).json({ success: true, message: data.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async resetPassword(req, res) {
    try {
      const token = req.params.token;
      const newPassword = req.body.newPassword;

      const data = await AuthService.resetPassword({ token, newPassword });
      return res.status(200).json({ success: true, message: data.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async checkAuth(req, res) {
    try {
      const data = await AuthService.checkAuth(req.userId);
      return res.status(200).json({ success: true, user: data.user });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
