import { ActiviteService } from "../service/index.js";

export async function getActivite(req, res) {
  try {
    const data = await ActiviteService();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erreur getActivite:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}