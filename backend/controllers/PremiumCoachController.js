// backend/controllers/PremiumCoachController.js

import { buildPremiumCoach } from "../service/premiumCoach/premiumCoachOrchestrator.js";

export const getPremiumCoach = async (req, res) => {
  try {
    const { accountId } = req.params;

    const data = await buildPremiumCoach(accountId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors du chargement du coach premium",
    });
  }
};