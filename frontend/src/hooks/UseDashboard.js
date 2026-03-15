import { useState, useEffect } from "react";
import { fetchDashboardData } from "../services/DashboardAPI";

export const useDashboard = (accountId) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!accountId) return;
    const load = async () => {
      try {
        const res = await fetchDashboardData(accountId);
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accountId]);

  return { data, loading, error };
};
