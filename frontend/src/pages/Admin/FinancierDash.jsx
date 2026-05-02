// FinancierDash.jsx — vue Financier & Catégories (admin BI)
import { useFinancier } from "../../hooks/useFinancier";
import FinancierKpis          from "../../components/Financier/FinancierKpis";
import WaterfallBudget        from "../../components/Financier/WaterfallBudget";
import ExecRateChart          from "../../components/Financier/ExecRateChart";
import DonutCategories        from "../../components/Financier/DonutCategories";
import EvolutionDepensesChart from "../../components/Financier/EvolutionDepensesChart";
import DistributionScores     from "../../components/Financier/DistributionScores";
import VarianceCategories     from "../../components/Financier/VarianceCategories";

export default function FinancierDash() {
  const { data, loading, error } = useFinancier();

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Chargement...</div>
  );
  if (error) return (
    <div className="text-[#A32D2D] text-sm p-4 bg-[#FCEBEB] rounded-xl border border-[#F7C1C1]">{error}</div>
  );
  if (!data) return null;

  const { kpis, top5Categories, budgetVsReel, distributionScores,
          evolutionMois, waterfallItems, varianceParCategorie } = data;

  return (
    <div className="flex flex-col gap-5">
      <FinancierKpis kpis={kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WaterfallBudget items={waterfallItems} />
        <ExecRateChart   data={budgetVsReel} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DonutCategories        data={top5Categories} total={kpis.totalDepensePlateforme} />
        <EvolutionDepensesChart data={evolutionMois} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DistributionScores  data={distributionScores} />
        <VarianceCategories  data={varianceParCategorie} />
      </div>
    </div>
  );
}