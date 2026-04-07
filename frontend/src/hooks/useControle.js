import { useState, useEffect, useCallback } from "react";
import { fetchControle } from "../services/controleAPI";

export const useControle = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filters, setFilters] = useState({ status: "", badge: "", search: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchControle(filters);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, filters, setFilters, reload: load };
};