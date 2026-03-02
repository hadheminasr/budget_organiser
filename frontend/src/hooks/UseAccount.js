// src/hooks/useAccount.js
import { useState, useEffect } from "react";
import { fetchMyAccount } from "../services/accountAPI";

export const useAccount = (accountId) => {
  const [account, setAccount] = useState(null);   
  const [loading, setLoading] = useState(true);   
  const [error, setError]     = useState(null); 

  useEffect(() => {
    if (!accountId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMyAccount(accountId); 
        setAccount(data);                            
      } catch (err) {
        setError(err.response?.data?.message || "Erreur");
      } finally {
        setLoading(false); 
      }
    };

    load();
  }, [accountId]);

  return { account, loading, error, setAccount };
};