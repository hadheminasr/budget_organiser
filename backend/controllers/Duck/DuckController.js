// controllers/vaultController.js
import { getDuckState } from "../../service/index.js";

// GET /api/duck/:accountId
// Appelé par le dashboard au chargement — retourne l'état actuel du duck.
export async function getDuck(req, res) {
  try {
    const { accountId } = req.params;
    if (!accountId) {
      return res.status(400).json({ success: false, message: "accountId requis" });
    }
    const duck = await getDuckState(accountId);
    return res.status(200).json({ success: true, data: duck });
  } catch (err) {
    console.error("[Duck] getDuck error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Ajouter dans ton router ───────────────────────────────────────────────────
// import { getDuck } from "../controllers/duckController.js";
// router.get("/duck/:accountId", authMiddleware, getDuck);