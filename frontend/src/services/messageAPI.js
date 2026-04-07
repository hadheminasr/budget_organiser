import axios from "axios";

const BASE = "/api/messages";

export const fetchTemplates = async () => {
  const res = await axios.get(`${BASE}/templates`, { withCredentials: true });
  return res.data.templates;
};

export const sendMessage = async (data) => {
  const res = await axios.post(BASE, data, { withCredentials: true });
  return res.data.message;
};

export const fetchAllMessages = async () => {
  const res = await axios.get(BASE, { withCredentials: true });
  return res.data.messages;
};

export const fetchMessagesForAccount = async (accountId) => {
  const res = await axios.get(`${BASE}/account/${accountId}`, { withCredentials: true });
  return res.data.messages;
};

export const fetchUnreadCount = async (accountId) => {
  const res = await axios.get(`${BASE}/unread/${accountId}`, { withCredentials: true });
  return res.data.count;
};

export const markAsRead = async (messageId) => {
  await axios.put(`${BASE}/read/${messageId}`, {}, { withCredentials: true });
};