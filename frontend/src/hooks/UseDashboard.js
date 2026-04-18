import { useState, useEffect } from "react";
import { fetchDashboardData } from "../services/accountAPI";

export const useDashboard = (accountId) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!accountId) return;
    const load = async () => {
      try {
        const res = await fetchDashboardData(accountId);
        console.log("RES DASHBOARD =", res);
        setData(res);
        console.log("TYPE RES =", typeof res);
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
