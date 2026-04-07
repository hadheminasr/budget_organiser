import { useFinancier } from "../../hooks/useFinancier";
import FinancierKpis from "../../components/FinancierComponents/FinancierKpis";
import Top5CategoriesDepensesChart from "../../components/FinancierComponents/Top5CategoriesDepensesChart";
import BudgetVsReelChart from "../../components/FinancierComponents/BudgetVsReelChart";
import EvolutionDepensesMoisChart from "../../components/FinancierComponents/EvolutionDepensesMoisChart";
import DistributionScoresChart from "../../components/FinancierComponents/DistributionScoresChart";

export default function FinancierDash() {
  const { data, loading, error } = useFinancier();

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

  const {
    kpis,
    top5Categories,
    budgetVsReel,
    distributionScores,
    evolutionMois,
  } = data;

  return (
    <div className="flex flex-col gap-6">
      <FinancierKpis kpis={kpis} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Top5CategoriesDepensesChart data={top5Categories} />
        <BudgetVsReelChart data={budgetVsReel} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <EvolutionDepensesMoisChart data={evolutionMois} />
        <DistributionScoresChart data={distributionScores} />
      </div>
    </div>
  );
}