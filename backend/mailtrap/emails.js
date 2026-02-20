
import { mailtrapClient,sender } from "./mailtrap.js"
import {VERIFICATION_EMAIL_TEMPLATE,PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} from "./emailTemplates.js";
export const sendVerificationEmail = async (email,verififactionToken)=>{
    const recipient = [{email}]
    try{
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            subject:"verifier votre email",
            html:VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verififactionToken),
            category:"Email Verification"
        })
           console.log("verification Email sent successfully",response);
    }catch(error){
        console.error("Error sending verification email",error);
    }
}

export const sendWelcomeEmail = async (email,name)=>{
    const recipient = [{email}]
    try {
        const response=await mailtrapClient.send({
            from:sender,
            to:recipient,
            template_uuid:"a2d8f80b-517e-4d59-853e-6c05d69dae90",
            template_variables:{
                company_info_name:"Budget Organiser",
                name:name
            }
        });
    console.log("welcome Email sent successfully",response);
    }catch(error){
        console.error(`Error sending welcome email` ,error);
        throw new Error (`Error sending welcome email email:${error}`);
    }
}
export const sendResetPasswordEmail = async (email,resetURL) => {
    const recipient = [{ email }];
    try {
        const response=await mailtrapClient.send({
            from: sender,
            to: recipient,  
            subject:"Reset Your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset",
        })
    }catch(error){
        console.error("Error sending password reset email", error);
    }}
export const sendResetSucessEmail = async (email,resetURL) => {
    const recipient = [{ email }];
    try {
        const response=await mailtrapClient.send({
            from: sender,
            to: recipient,  
            subject:" Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset ",
        });
        console.log  ("password reset success Email sent successfully",response);
    }catch(error){
        console.error("Error sending password reset success email", error);
        res.status(400).json({success:false,message:error.message});
    }
}