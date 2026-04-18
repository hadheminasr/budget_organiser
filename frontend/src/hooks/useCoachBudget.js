import { useCallback, useEffect, useState } from "react";
import { coachBudgetAPI } from "../services/coachBudgetAPI";

export function useCoachBudget(accountId) {
  const [coachData, setCoachData] = useState(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [errorCoach, setErrorCoach] = useState("");

  const fetchCoachBudget = useCallback(async () => {
    if (!accountId) return;

    setLoadingCoach(true);
    setErrorCoach("");

    try {
      const res = await coachBudgetAPI.getCoachBudget(accountId);
      setCoachData(res.data ?? null);
    } catch (err) {
      setErrorCoach(
        err?.response?.data?.message ||
          "Erreur lors du chargement du Coach Budget"
      );
      setCoachData(null);
    } finally {
      setLoadingCoach(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchCoachBudget();
  }, [fetchCoachBudget]);

  return {
    coachData,
    loadingCoach,
    errorCoach,
    fetchCoachBudget,
  };
}