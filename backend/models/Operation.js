import mongoose from "mongoose";
const OperationSchema = new mongoose.Schema(
    {
        amount:{type:Number,required:true},
        date:{type:Date,default:Date.now},
        type:{type:String,enum:['depense','revenue'],required:true},
        IdCompte:{type:mongoose.Schema.Types.ObjectId,ref:"Compte"},
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        IdCategory:{type:mongoose.Schema.Types.ObjectId,ref:"Category"}
    },{ timestamps: true }
);
export const Operation=mongoose.model("Operation",OperationSchema);