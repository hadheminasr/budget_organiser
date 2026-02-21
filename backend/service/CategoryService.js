import { Category } from "../models/Category.js";

export const CategoryService={

     async addCathegorie (data){
      return Category.create ({data})
    },
} 