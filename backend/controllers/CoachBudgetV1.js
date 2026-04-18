import { coachBudgetV1Service } from "../service/index.js";

export const getCoachBudgetData = async (req, res) => {
  try {
    const { accountId } = req.params;

    const coachData = await coachBudgetV1Service.generateCoachData(accountId);

    return res.status(200).json({
      success: true,
      data: coachData,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Erreur lors de la génération des conseils budget",
    });
  }
};