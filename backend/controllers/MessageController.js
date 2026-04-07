import { MessageService } from "../service/index.js";
import { TEMPLATES } from "../utils/MessageTemplates.js";

export const sendMessage = async (req, res) => {
  try {
    const message = await MessageService.sendMessage(req.body);
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const messages = await MessageService.getAllMessages();
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessagesForAccount = async (req, res) => {
  try {
    const messages = await MessageService.getMessagesForAccount(
      req.params.accountId
    );
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await MessageService.markAsRead(req.params.messageId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const countUnread = async (req, res) => {
  try {
    const count = await MessageService.countUnread(req.params.accountId);
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTemplates = async (req, res) => {
  res.json({ success: true, templates: TEMPLATES });
};