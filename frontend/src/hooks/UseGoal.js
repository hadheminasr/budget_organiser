import { useState, useEffect } from "react";
import { fetchGoals } from "../services/goalAPI";
import { useAuth } from "../context/AuthContext";

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!user?.accountId) { setLoading(false); return; }
    const load = async () => {
      try {
        const data = await fetchGoals(user.accountId);
        setGoals(data);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.accountId]);

  return { goals, loading, error, setGoals };
};