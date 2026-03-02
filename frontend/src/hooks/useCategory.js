import { useState, useEffect } from "react";
import { fetchCategories } from "../services/categoryAPI";
import { useAuth } from "../context/AuthContext";

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!user?.accountId) { setLoading(false); return; }
    const load = async () => {
      try {
        const data = await fetchCategories(user.accountId);
        setCategories(data);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.accountId]);

  return { categories, loading, error, setCategories };
};