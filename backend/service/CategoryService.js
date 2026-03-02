import { Category } from "../models/Category.js";

export const CategoryService={

     
async addCategory(data, AccountId, userId) {
  const { name, color } = data;

  return Category.create({
    name,
    color,
    AccountId,
    createdBy: userId,  
    isDefault: false,
  });
},
async UpdateCategory  (updates, IdCategory){
    const category= await Category.findByIdAndUpdate(IdCategory,{$set: updates},{new:true}).select("-password");
    if (!category){
      throw new error ("Category not found")
    }
    return category;

  },
  async DeleteCategory (IdCategory){
    const category= await Category.findByIdAndDelete(IdCategory);
    if (!category){
      throw new error ("Category not found")
    }
    return true;

  },
  async getAllCategories (AccountId){
    const categories= await Category.find({AccountId});
    if (!categories){
      throw new error ("no Categories yet")
    }
    return categories
  }
}


 