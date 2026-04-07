import { useActivite } from "../../hooks/useActivite";
import ActiviteKpis from "../../components/Activite&Comportement/ActiviteKpis";
import DistributionActiviteChart from "../../components/Activite&Comportement/DistributionActiviteChart";
import EvolutionActiviteSemaineChart from "../../components/Activite&Comportement/EvolutionActiviteSemaineChart";
import ActiviteQuotidienneChart from "../../components/Activite&Comportement/ActiviteQuotidienneChart";

export default function ActiviteComportement() {
  const { data, loading, error } = useActivite();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4 bg-red-50 rounded-xl">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { kpis, distributionActivite, opsParJour, opsParSemaine } = data;

  return (
    <div className="flex flex-col gap-6">
      <ActiviteKpis kpis={kpis} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DistributionActiviteChart data={distributionActivite} />
        <EvolutionActiviteSemaineChart data={opsParSemaine} />
      </div>

      <ActiviteQuotidienneChart data={opsParJour} />
    </div>
  );
}