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
        return res.status(400).json({ sucess: false, message: error.message });
    }   
};