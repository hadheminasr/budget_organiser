import mongoose from "mongoose";
const OperationSchema = new mongoose.Schema(
    {
        amount:{type:Number,required:true},
        date:{type:Date,default:Date.now},
        IdAccount:{type:mongoose.Schema.Types.ObjectId,ref:"Account"},
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        IdCategory:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
        description:{type:String},
        archived: { type: Boolean, default: false },
        month:{ type: String, default: null },
    },{ timestamps: true }
);
export const Operation=mongoose.model("Operation",OperationSchema);
//IdCategory:{type:mongoose.Schema.Types.ObjectId,ref:"Category"}