import {CategoryService} from "../service/index.js";
export const AddCategory=async(req,res)=>{
    try{
        const  category=await CategoryService.addCategory(req.body);
        res.status(200).json({sucess:true,category});

    }catch(error){
        console.error("error in add category ")
        res.status(500).json({sucess:false,message:"server error"})
    }
};