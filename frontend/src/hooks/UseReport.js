import { useState, useEffect } from "react";
import { fetchReport } from "../services/reportAPI";
import { useAuth } from "../context/AuthContext";

export const useReport = () => {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!user?.accountId) return;
    const load = async () => {
      try {
        const res = await fetchReport(user.accountId);
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.accountId]);

  return { data, loading, error };
};