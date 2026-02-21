import crypto from "crypto";
import bcryptjs from "bcryptjs";

import { User } from "../models/User.js";
import { Account } from "../models/Account.js";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../mailtrap/emails.js";

export const AuthService = {
  async signup({ email, password, name, familyName, role, sharedCode }, res) {
    if (!email || !password || !name || !familyName) {
      const err = new Error("all fields are required");
      err.status = 400;
      throw err;
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      const err = new Error("User already exists");
      err.status = 400;
      throw err;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      familyName,
      role,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    // A vereifier dans le sprint 3 cette if
    const code = sharedCode?.trim();
    let account = null;

    if (code) {
      account = await Account.findOne({ Sharingcode: code });
      if (!account) {
        const err = new Error("Shared code invalid");
        err.status = 400;
        throw err;
      }
      if (account.isBlocked) {
        const err = new Error("This account is blocked");
        err.status = 403;
        throw err;
      }
      await Account.updateOne(
        { _id: account._id },
        { $addToSet: { Users: newUser._id } }
      );
      const updated = await Account.findById(account._id).select("Users nbUsers");
      updated.nbUsers = updated.Users.length;
      await updated.save();
    } else {
      const accountName = `Account of ${newUser.name}`;
      account = await Account.create({
        nameAccount: accountName,
        solde: 0,
        nbUsers: 1,
        Users: [newUser._id],
        isBlocked: false,
        createdBy: newUser._id,
      });
    }
    generateTokenAndSetCookie(res, newUser._id);
    await sendVerificationEmail(newUser.email, verificationToken);

    const safeUser = await User.findById(newUser._id).select("-password");

    return {
      user: safeUser,
      account,
      message: "Signup successful + account created",
    };
  },

  async verifyEmail({ code }) {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      const err = new Error("Invalid or expired verification code");
      err.status = 400;
      throw err;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    await sendWelcomeEmail(user.email, user.name);

    return { user: user, message: "Email verified successfully" };
  },

  async login({ email, password }, res) {
    if (!email || !password) {
      const err = new Error("email and password are required");
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Invalid credentials");
      err.status = 400;
      throw err;
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      const err = new Error("Invalid credentials");
      err.status = 400;
      throw err;
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    return { user: user, message: "logged in successfully" };
  },

  async logout(res) {
    res.clearCookie("token");
    return { message: "logged out successfully" };
  },

  async forgotPassword({ email }) {
    if (!email) {
      const err = new Error("email is required");
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("User with this email does not exist");
      err.status = 400;
      throw err;
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    
    user.resetPasswordToken = resetToken;
    user.resetPasswordeExpriresAt = resetTokenExpiresAt; 
    await user.save();

    await sendResetPasswordEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    return { message: "Password reset email sent successfully" };
  },

  async resetPassword({ token, newPassword }) {
    if (!newPassword) {
      const err = new Error("newPassword is required");
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordeExpriresAt: { $gt: Date.now() }, 
    });

    if (!user) {
      const err = new Error("Invalid or expired password reset token");
      err.status = 400;
      throw err;
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordeExpriresAt = undefined;
    await user.save();

    return { message: "Password has been reset successfully" };
  },

  async checkAuth(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const err = new Error("User not found");
      err.status = 400;
      throw err;
    }
    return { user: user };
  },
};
