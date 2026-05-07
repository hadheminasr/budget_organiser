import { transporter, sender } from "./mailtrap.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const html = VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationToken
    );

    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Verify your email",
      html,
    });

    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const html = WELCOME_EMAIL_TEMPLATE.replace("{name}", name);

    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Welcome to Budget Organizer",
      html,
    });

    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};

export const sendResetPasswordEmail  = async (email, resetURL) => {
  try {
    const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);

    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Reset your password",
      html,
    });

    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log("Password reset success email sent successfully");
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    throw new Error(`Error sending password reset success email: ${error.message}`);
  }
};