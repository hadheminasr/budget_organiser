import mongoose from "mongoose";
const CategorySchema=new mongoose.Schema({
    
    name:{type:String,required:true},
    normalizedGroup: {
    type: String,
    enum: [
      "HOUSING",
      "FOOD_HOME",
      "EATING_OUT",
      "TRANSPORT",
      "HEALTH_BEAUTY",
      "CHILDREN",
      "ENTERTAINMENT",
      "SHOPPING",
      "SMOKING_ALCOHOL_CAFE",
      "BILLS",
      "SAVINGS",
      "OTHER",
    ],
    default: "OTHER",
    required: true,
  },
    color:{type:String,default:"#000000"},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDefault:{type:Boolean,default:false},
    AccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    budget:     { type: Number, default: 0 },
    icon: { type: String, default: "🏷️" }

})
export const Category=mongoose.model("Category",CategorySchema);