import { useState, useEffect } from "react";
import { fetchFinancier } from "../services/financierAPI";

export const useFinancier = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchFinancier();
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { data, loading, error };
};