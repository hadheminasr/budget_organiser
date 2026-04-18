import useVueGlobale from "../../hooks/useVueGlobale";
import VueGlobaleKpis from "../../components/VueGlobaleComponents/VueGlobaleKpis";
import HeatmapJourHeure7j from "../../components/VueGlobaleComponents/HeatmapJourHeure7j";
import HealthRadarChart from "../../components/VueGlobaleComponents/HealthRadarChart";
import CategoryTreemapChart from "../../components/VueGlobaleComponents/CategoryTreemapChart";
import BudgetFlowChart from "../../components/VueGlobaleComponents/BudgetFlowChart";
import InsightsCard from "../../components/VueGlobaleComponents/InsightsCard";

export default function VueGlobale() {
  const { kpis, charts, insights, loading, error } = useVueGlobale();

  const activityHeatmap = charts?.activityHeatmap ?? [];
  const healthRadar = charts?.healthRadar ?? [];
  const categoryTreemap = charts?.categoryTreemap ?? [];
  const budgetFlow = charts?.budgetFlow ?? [];
  const collaborationScatter = charts?.collaborationScatter ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        Chargement de la vue globale...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800">Vue globale</h1>
        <p className="text-sm text-slate-500">
          Vue d’ensemble de la santé, de l’activité et de la collaboration sur la plateforme.
        </p>
      </div>

      {/* KPIs */}
      <VueGlobaleKpis kpis={kpis} />

      {/* Bloc 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <HeatmapJourHeure7j data={activityHeatmap} />
        <HealthRadarChart data={healthRadar} />
      </div>

      {/* Bloc 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CategoryTreemapChart data={categoryTreemap} />
        <BudgetFlowChart data={budgetFlow} />
      </div>

      {/* Bloc 3*/}
      <InsightsCard insights={insights} />
    </div>
  );
}