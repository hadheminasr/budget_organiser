import {CategoryService} from "../service/index.js";
export const AddCategory=async(req,res)=>{
    const {AccountId}=req.params;
    const userId = req.user._id;
    const data= req.body;
    console.log("body dans controller:", req.body);
    try{
        const  category=await CategoryService.addCategory(data,AccountId,userId);
        res.status(200).json({sucess:true,category});

    }catch(error){
        console.error("error in add category", error.message);
        res.status(500).json({sucess:false,message:"server error"})
    }
    };
    export const UpdateCategory = async (req, res)=>{
        const {IdCategory} = req.params;
        const updates = req.body ;
        try{
            const Category = await CategoryService.UpdateCategory(updates,IdCategory);
            res.status(200).json({sucess:true,Category});
        }catch(error){
            console.error("error in update Category");
            res.status(500).json({sucess:false,message:"ghalta"})
        }
    
    
    }
    
    export const DeleteCategory = async (req,res)=>{
        const {IdCategory} = req.params;
        try{
            const Category = await CategoryService.DeleteCategory(IdCategory);
            res.status(200).json({sucess:true,message:"Category deleted with sucess"});
        }catch(error){
            console.error("error in delete Category");
            res.status(500).json({sucess:false,message:error.message})
        }
    
    }
    
    export const getAllCategories = async (req,res)=>{
        const {AccountId} = req.params;
        try{
            const Categories = await CategoryService.getAllCategories(  AccountId);
            res.status(200).json({sucess:true,Categories});
        }catch(error){
            console.error("error in get atll  Categories");
            res.status(500).json({sucess:false,message:error.message})
        }
    
    }
