import { VueGlobale } from "../service/index.js";

export const getVueGlobale = async (req, res) => {
  try {
    const result = await VueGlobale.getAll();

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Erreur getVueGlobale :", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Erreur serveur",
    });
  }
};