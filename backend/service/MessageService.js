import { Message } from "../models/Message.js";
import { Account } from "../models/Account.js";
import { Operation } from "../models/Operation.js";

export const MessageService = {

  // ── envoyer un message
  async sendMessage(data) {
    const { to, subject, content, type, accountId } = data;

    const message = await Message.create({
      to,
      subject,
      content,
      type,
      accountId: accountId ?? null,
    });

    return message;
  },

  // ── récupérer tous les messages envoyés (côté admin)
  async getAllMessages() {
    const messages = await Message.find()
      .populate("accountId", "nameAccount")
      .sort({ createdAt: -1 });
    return messages;
  },

  // ── récupérer les messages d'un compte spécifique
  async getMessagesForAccount(accountId) {
    const now = new Date();
    const il30Jours = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // opérations des 30 derniers jours
    const opsRecentes = await Operation.find({
      IdAccount: accountId,
      archived:  false,
      date:      { $gte: il30Jours }
    }).lean();

    const estDormant  = opsRecentes.length === 0;
    const badges      = estDormant ? ["dormants"] : [];

    // messages ciblés pour ce compte
    // + messages broadcast (all / dormants si dormant / etc.)
    const messages = await Message.find({
      $or: [
        { accountId: accountId },
        { to: "all" },
        ...(estDormant ? [{ to: "dormants" }] : []),
      ]
    }).sort({ createdAt: -1 });

    return messages;
  },

  // ── marquer comme lu
  async markAsRead(messageId) {
    await Message.findByIdAndUpdate(messageId, { isRead: true });
  },

  // ── compter non lus pour un compte
  async countUnread(accountId) {
    const now = new Date();
    const il30Jours = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const opsRecentes = await Operation.find({
      IdAccount: accountId,
      archived:  false,
      date:      { $gte: il30Jours }
    }).lean();

    const estDormant = opsRecentes.length === 0;

    const count = await Message.countDocuments({
      isRead: false,
      $or: [
        { accountId: accountId },
        { to: "all" },
        ...(estDormant ? [{ to: "dormants" }] : []),
      ]
    });

    return count;
  },

  // ── récupérer les templates
  getTemplates() {
    const { TEMPLATES } = require("../utils/MessageTemplates.js");
    return TEMPLATES;
  }
};