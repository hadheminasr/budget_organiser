// backend/controllers/ActivityLogController.js
import { ActivityLogService } from "../service/ActivityLogService.js";

export const getLogs = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId, entity, month } = req.query;
    const logs = await ActivityLogService.getLogs(accountId, { userId, entity, month });
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};