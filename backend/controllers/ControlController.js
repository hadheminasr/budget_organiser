import { ControleService } from "../service/index.js";



export async function getGestionControle(req, res) {
  try {
    const { status, badge, search } = req.query;
    const data = await ControleService({ status, badge, search });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erreur getGestionControle:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}