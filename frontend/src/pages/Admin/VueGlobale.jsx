import OperationParJour from "../../components/VueGlobaleComponents/OperationParJour.jsx";
import Top5CategoriesBarChart from "../../components/VueGlobaleComponents/Top5CategoriesBarChart.jsx";
import DepensesVsRevenusDonut from "../../components/VueGlobaleComponents/DepensesVsRevenus.jsx";
import HeatmapJourHeure from "../../components/VueGlobaleComponents/HeatmapJourHeure7j.jsx";
import SharedCard from "../../SharedComponents/SharedCard.jsx";
import { useMemo } from "react";
import { Users, Wallet, ShieldCheck, ShieldOff, Share2, Target } from "lucide-react";
import { useVueGlobale } from "../../hooks/useVueGlobale.js";

export default function VueGlobal() {
 
  const { kpisData, chartsData, loading, error } = useVueGlobale();

  const kpis = useMemo(() => {
    if (!kpisData) return [];

    return [
      {
        title: "Comptes totaux",
        value: kpisData.nbComptes,
        icon: Wallet,
        iconColor: "rose",
      },
      {
        title: "Comptes actifs",
        value: kpisData.comptesActifs,
        icon: ShieldCheck,
        iconColor: "emerald",
      },
      {
        title: "Comptes bloqués",
        value: kpisData.comptesBloques,
        icon: ShieldOff,
        iconColor: "red",
      },
      {
        title: "Comptes partagés",
        value: `${Number(kpisData.pctComptesPartages ?? 0).toFixed(1)}%`,
        icon: Share2,
        iconColor: "amber",
        change: "≥ 2 utilisateurs",
        changeType: "neutral",
      },
      {
        title: "Utilisateurs",
        value: kpisData.nbUsers,
        icon: Users,
        iconColor: "blue",
        change: `${kpisData.newUsers7j ?? 0} nouveaux (7j)`,
        changeType: (kpisData.newUsers7j ?? 0) > 0 ? "positive" : "neutral",
      },
      {
        title: "Objectifs actifs",
        value: kpisData.objectifsActifs,
        icon: Target,
        iconColor: "blue",
        change: `${Number(kpisData.pctObjectifsAtteints ?? 0).toFixed(0)}% atteints`,
        changeType: (kpisData.pctObjectifsAtteints ?? 0) > 50 ? "positive" : "neutral",
      },
    ];
  }, [kpisData]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!kpisData || !chartsData) return <div>Aucune donnée.</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Vue Globale</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <SharedCard key={idx} {...kpi} />
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-2">Opérations par jour (7j)</h2>
          <OperationParJour data={chartsData?.operationsParJour7j} />
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-2">Top 5 catégories (dépenses, 7j)</h2>
          <Top5CategoriesBarChart data={chartsData?.top5CategoriesDepenses7j} />
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-2">Dépenses vs Revenus (7j)</h2>
          <DepensesVsRevenusDonut data={chartsData?.depensesVsRevenus7j} />
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-2">Heatmap Jour × Heure (7j)</h2>
          <HeatmapJourHeure data={chartsData?.heatmapJourHeure7j} />
        </div>
      </div>
    </div>
  );
}