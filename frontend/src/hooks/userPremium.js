// src/hooks/usePremium.js
import { useEffect, useState } from "react";
import { getPremiumCoach } from "../services/premiumAPI";

export const usePremium = (accountId) => {
  const [premiumData, setPremiumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPremiumCoach = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getPremiumCoach(accountId);

      if (!result.success) {
        throw new Error(result.message || "Erreur lors du chargement du coach premium");
      }

      setPremiumData(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Erreur inconnue lors du chargement du coach premium"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchPremiumCoach();
    }
  }, [accountId]);

  return {
    premiumData,
    loading,
    error,
    refetch: fetchPremiumCoach,
  };
};