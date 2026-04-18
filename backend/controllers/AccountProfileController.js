import { accountProfileService } from "../service/index.js";

export const getAccountProfile = async (req, res) => {
  try {
    const { accountId } = req.params;

    const profile = await accountProfileService.getAccountProfileByAccountId(accountId);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur lors de la récupération du profil du compte",
    });
  }
};

export const createAccountProfile = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id;

    const profile = await accountProfileService.createAccountProfile(accountId, userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Profil du compte créé avec succès",
      profile,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur lors de la création du profil du compte",
    });
  }
};

export const updateAccountProfile = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id;

    const profile = await accountProfileService.updateAccountProfile(accountId, userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Profil du compte mis à jour avec succès",
      profile,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour du profil du compte",
    });
  }
};