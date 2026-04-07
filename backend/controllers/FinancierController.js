import { FinancierService } from "../service/index.js";

export async function getFinancier(req, res) {
  try {
    const data = await FinancierService();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erreur getFinancier:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}