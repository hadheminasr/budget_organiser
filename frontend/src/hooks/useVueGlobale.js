import { useEffect, useState } from "react";
import { fetchVueGlobale } from "../services/VueGlobaleAPI";

export default function useVueGlobale() {
  const [data, setData] = useState({
    kpis: null,
    charts: null,
    insights: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    //isMounted est une sécurité pour éviter un setState après que la page est quittéee
    //ce qui peut arriver si la requête prend du temps et que l'utilisateur navigue ailleurs
    //Cela évite des erreurs de type "Can't perform a React state update on an unmounted component"
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await fetchVueGlobale();

        if (!isMounted) return;

        setData({
          kpis: result?.kpis ?? null,
          charts: result?.charts ?? null,
          insights: result?.insights ?? [],
        });
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Erreur lors du chargement de la vue globale"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    //cleanup
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    kpis: data.kpis,
    charts: data.charts,
    insights: data.insights,
    loading,
    error,
  };
}