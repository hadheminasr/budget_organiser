import { useState, useEffect } from "react";
import { fetchMyShareInfo } from "../services/shareAPI";
import { useAuth } from "../context/AuthContext";

export const useShare = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!user?.accountId) { setLoading(false); return; }
    const load = async () => {
      try {
        const data = await fetchMyShareInfo(user.accountId);
        setAccount(data);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.accountId]); 

  return { account, loading, error, setAccount };
};