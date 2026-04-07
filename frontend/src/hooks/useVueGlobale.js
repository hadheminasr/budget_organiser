// src/hooks/useVueGlobale.js
import { useEffect, useState } from "react";
import { fetchVueGlobale } from "../services/VueGlobaleAPI";

export const useVueGlobale = () => {
  const [kpisData, setKpisData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVueGlobale = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchVueGlobale();

        setKpisData(data?.kpis ?? null);
        setChartsData(data?.charts ?? null);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    loadVueGlobale();
  }, []);

  return {
    kpisData,
    chartsData,
    loading,
    error,
    setKpisData,
    setChartsData,
  };
};