import { OperationService } from "../service/OperationService.js";
export const AddOperation=async(req,res)=>{
    const {AccountId}=req.params;
    const userId = req.user._id;//a verifier f test est ce que kaad yetsava l usner li logged in walla 
    const data= req.body;
    console.log(userId);
   try{
        const operation=await OperationService.AddOperation(data,userId,AccountId);
        res.status(200).json({sucess:true,operation});

    }catch(error){
        console.error("error in add operation ",error)
        res.status(500).json({sucess:false,message:error.message})
    }; 
}

export const UpdateOperation = async (req, res)=>{
    const {IdOperation} = req.params;
    const updates = req.body ;
    try{
        const operation = await OperationService.UpdateOperation(updates,IdOperation);
        res.status(200).json({sucess:true,operation});
    }catch(error){
        console.error("error in update operation");
        res.status(500).json({sucess:false,message:error.message})
    }


}

export const DeleteOperation = async (req,res)=>{
    const {IdOperation} = req.params;
    try{
        const operation = await OperationService.DeleteOperation(IdOperation);
        res.status(200).json({sucess:true,message:"operation deleted with sucess"});
    }catch(error){
        console.error("error in delete operation");
        res.status(500).json({sucess:false,message:error.message})
    }

}

export const getAllOperations = async (req,res)=>{
    const {AccountId} = req.params;
    try{
        const operations = await OperationService.getAllOperations(AccountId);
        res.status(200).json({sucess:true,operations});
    }catch(error){
        console.error("error in get atll  operations");
        res.status(500).json({sucess:false,message:error.message})
    }

}

export const getOperationsGroupedByCategory = async (req, res) => {
  const { AccountId } = req.params;
  try {
    const groups = await OperationService.getOperationsGroupedByCategory(AccountId);
    res.status(200).json({ sucess: true, groups });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};