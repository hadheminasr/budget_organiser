import { OperationService } from "../service/OperationService.js";
export const AddOperation=async(req,res)=>{
   try{
        const operation=await OperationService.AddOperation(req.body);
        res.status(200).json({sucess:true,operation});

    }catch(error){
        console.error("error in add operation ",error)
        res.status(500).json({sucess:false,message:"server error"})
    }; 
}