import { GoalService} from "../service/GoalService.js";
export const getGoalStats = async (req, res) => {
    try {
        const stats = await GoalService.getGoalStats();
        console.log("BODY BEFORE VALIDATE:", req.body);

        return res.status(200).json({ success: true, stats });
    } catch (error) {
        console.error("Error in getGoalStats", error);
        return res.status(500).json({ success: false, message: "server error" });
    }
};
export const AddGoal = async (req, res) => {
    try {
        const { accountId } = req.params;      
        const userId = req.user._id;           
        const createdGoal = await GoalService.addGoal(req.body, accountId, userId);
        return res.status(201).json({
            sucess: true,
            message: "Goal created successfully",
            createdGoal,
        });
    } catch (error) {
        console.error("AddGoal error:", error.message); 
        return res.status(400).json({ success: false, message: error.message });
    }   
};

export const getGoalsByAccount= async (req,res)=>{
    try  {
    const {accountId}= req.params;
    const Goal = await GoalService.getGoalsByAccount(accountId);
    return res.status(200).json({success:true,Goal})
}catch (error){
    return res.status(400).json({ sucess: false, message: error.message });
}

};

export const UpdateGoal = async (req,res)=>{
    const {goalId}=req.params;
    const userId = req.user._id;
    const updates=req.body;
    try{
        const updatedGoal=await GoalService.UpdateGoal(goalId,updates,userId);
        return res.status(200).json({success:true,updatedGoal});

    }catch (error){
        return res.status(400).json({ sucess: false, message: error.message });
    }
};

export const DeleteGoal = async (req,res)=>{
    const {goalId}=req.params;
    const userId    = req.user._id;        
    const AccountId = req.user.accountId;
    try{
        await GoalService.deleteGoal(goalId,userId,AccountId); // ← modifié pour passer userId et AccountId
        return res.status(200).json({success:true,message:"Goal deleted with success"});
    }catch (error){
        return res.status(400).json({ sucess: false, message: error.message });
    }

}