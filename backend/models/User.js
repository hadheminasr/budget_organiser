import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required : true,
        

    }, 
    name:{
        type: String,
        
    },
    familyName:{
        type: String,
        
    },
    isActive:{
        type:Boolean,
        required:true,
        default:true,
    },
    lastLogin: {
			type: Date,
			default: Date.now,
        },
    role:{
        type:String,
        
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    resetPasswordToken : String , 
    resetPasswordeExpriresAt : Date,
    verificationToken: String,
    verificationTokenExpiresAt:Date,

},{timestamp : true});
export const User = mongoose.model('User',userSchema);