// backend/service/ActivityLogService.js
import { ActivityLog } from "../models/ActivityLog.js";

export const ActivityLogService = {
  async log(accountId, userId, username, action, entity, entityId, details) {
    try {
      const now = new Date();
      await ActivityLog.create({
        IdAccount: accountId,
        userId,
        username,
        action,
        entity,
        entityId,
        details,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      });
    } catch (err) {
      console.error("ActivityLog error:", err.message); // ← silencieux, ne bloque pas
    }
  },

  
  async getLogs(accountId, filters = {}) {
    const query = { IdAccount: accountId };
    if (filters.userId) query.userId = filters.userId;
    if (filters.entity) query.entity = filters.entity;
    if (filters.month)  query.month  = filters.month;
    return ActivityLog.find(query).sort({ createdAt: -1 }).limit(100);
  }
};