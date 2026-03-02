import { useState, useEffect } from "react";
import { fetchOperations } from "../services/operationAPI";
import { useAuth } from "../context/AuthContext";

export const useOperations = () => {
  const { user } = useAuth();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!user?.accountId) { setLoading(false); return; }
    const load = async () => {
      try {
        const data = await fetchOperations(user.accountId);
        setOperations(data);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.accountId]);

  return { operations, loading, error, setOperations };
};