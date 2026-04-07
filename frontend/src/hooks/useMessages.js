import { useState, useEffect, useCallback } from "react";
import { fetchMessagesForAccount, fetchUnreadCount, markAsRead } from "../services/messageAPI";
import { useAuth } from "../context/AuthContext";

export const useMessages = () => {
  const { user } = useAuth();

  const [messages,    setMessages]    = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading,     setLoading]     = useState(false);

  // ── charger les messages
  const loadMessages = useCallback(async () => {
    if (!user?.accountId) return;
    setLoading(true);
    try {
      const msgs  = await fetchMessagesForAccount(user.accountId);
      const count = await fetchUnreadCount(user.accountId);
      setMessages(msgs);
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.accountId]);

  // ── charger au montage + toutes les 60 secondes
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 60000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // ── marquer comme lu
  const handleMarkRead = async (messageId) => {
    try {
      await markAsRead(messageId);
      setMessages(prev =>
        prev.map(m => m._id === messageId ? { ...m, isRead: true } : m)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return {
    messages,
    unreadCount,
    loading,
    loadMessages,
    handleMarkRead,
  };
};