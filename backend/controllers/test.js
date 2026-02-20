import {User} from '../models/User.js';
import { Account } from '../models/Account.js';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendWelcomeEmail,sendVerificationEmail } from './../mailtrap/emails.js';
import { sendResetPasswordEmail,sendResetSucessEmail } from '../mailtrap/emails.js';
export const signup = async (req , res) => {
    const {email, password,name,familyName,role,sharedCode}=req.body;
    try{
        if(!email || !password || !name || !familyName ){
            throw new Error("all fieldss are required");
        }
        const userAlreadyExists = await User.findOne({email});
        if (userAlreadyExists){
            return res.status(400).json({success:false, message : "User already exists"})
        }
        const hashedPassword=await bcryptjs.hash(password,10);
        const verificationToken=Math.floor(100000 + Math.random() * 900000).toString();
        const newUser= await User.create({
            email,
            password:hashedPassword,
            name, 
            familyName,
            role,
            verificationToken,
            verificationTokenExpiresAt:Date.now()+24*60*60*1000, 
        });
        const code = sharedCode?.trim();
        let account = null;
        if (code) {
            account = await Account.findOne({ Sharingcode: code });
            if (!account) throw new Error("Shared code invalid");
            if (account.isBlocked) throw new Error("This account is blocked");
            const alreadyMember = account.Users.some(
                (u) => u.toString() === newUser._id.toString()
            );
            if (!alreadyMember) {
                const updatedAccount = await Account.findOneAndUpdate(
  { Sharingcode: code },
  [
    { $set: { Users: { $setUnion: ["$Users", [newUser._id]] } } },
    { $set: { nbUsers: { $size: "$Users" } } },
  ],
  { new: true }
);
            }
        }
        else{
            const accountName = `Account of ${newUser.name}`;
            account = await Account.create({
                nameAccount: accountName ,
                solde: 0,
                nbUsers: 1,
                Users: [newUser._id],
                isBlocked: false,
                });

        }
        //JWT 
        generateTokenAndSetCookie(res,newUser._id);
        await sendVerificationEmail(newUser.email,verificationToken);
        const safeUser = await User.findById(newUser._id).select("-password");
        return res.status(201).json({
        sucess: true,
        message: "Signup successful + account created",
        user: safeUser,
        account,
        });
        }
        catch(error){
            res.status(400).json({sucess:false,message:error.message})

        }
    }
export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log("error in login ", error);
        res.status(500).json({ success: false, message:  error.message });
    }
};
export const login = async (req , res) => {
    const{email,password}=req.body;
    try{
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false,message:"Invalid credentials"});
        }

        const isPasswordValid= await bcryptjs.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false,message:"Invalid credentials"});
        }
        generateTokenAndSetCookie (res,user._id);
        user.lastLogin = new Date();
        await user.save();
        res.status(200).json({success:true,
                            message:"logged in successfully",
                            user:{
                                ...user._doc,
                                password:undefined
                            }});
                        
    } catch (error) {
  console.log("LOGIN ERROR:", error.message);
  console.log(error);
  return res.status(500).json({ success: false, message: error.message });
}


}
export const logout = async (req , res) => {
    res.clearCookie("token")
    res.status(200).json({sucess:true,message:"logged out successfully"});
}
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User with this email does not exist" });
        }  
        // Generate reset token
                const resetToken = crypto.randomBytes(20).toString("hex");
                const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
        
                user.resetPasswordToken = resetToken;
                user.resetPasswordeExpriresAt = resetTokenExpiresAt;
        
                await user.save();

        await sendResetPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        res.status(200).json({ success: true, message: "Password reset email sent successfully" });
    }catch(error){
        console.error("Error in forgot password", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
export const resettPassword = async (req, res) => {
   try { 
    const { token } = req.params;
    const { newPassword } = req.body;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordeExpriresAt: { $gt: Date.now() },

    });
    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired password reset token" });

    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordeExpriresAt = undefined;
    await user.save();
    res.status(200).json({ success: true, message: "Password has been reset successfully" });
    }catch(error){
    console.error("Error in reset password", error);
    res.status(500).json({ success: false, message: "Server error" });
    }
}
export const checkAuth = async (req, res) => {
    try{
        const user = await User.findById(req.userId).select("-password");//pour ne pas selectionner le mdp
        if (!user){
            return res.status(400).json({success:false,message:"User not found"});

        }
        res.status(200).json({success:true, user});

    }catch(error){
        console.error("Error in checkAuth",error);
        res.status(500).json({success:false,message:"Server error"});
    }
};