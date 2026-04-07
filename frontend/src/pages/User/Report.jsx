import { useTranslation } from "react-i18next";
import { useReport } from "../../hooks/UseReport";
import { useState } from "react";

import ReportKpis from "../../components/UserComponents/Report/Report/ReportKpis";
import ReportComparison from "../../components/UserComponents/Report/Report/ReportComparison";
import ReportLineChart from "../../components/UserComponents/Report/Report/ReportLineChart";
import ReportHistoryTable from "../../components/UserComponents/Report/Report/ReportHistoryTable";
import CategoryAnalysis from "../../components/UserComponents/Report/Report/CategoryAnalysis";
import GoalsProgress from "../../components/UserComponents/Report/Report/GoalsProgress";

export default function Report() {
  const { t } = useTranslation();
  const { data, loading, error } = useReport();
  const locale = t("common.locale");

  const [selectedCat, setSelectedCat] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
        {t("common.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* HEADER */}
      <div>
        <h1 className="font-bold text-xl text-rose-900">
          📊 Rapport mensuel
        </h1>
        <p className="text-xs text-pink-300 mt-0.5">
          Bilan de {new Date(data.reportMonth + "-01").toLocaleDateString(
            locale,
            { month: "long", year: "numeric" }
          )}
        </p>
      </div>

      {/* KPI */}
      <ReportKpis data={data} locale={locale} />

      {/* PLUS GROSSE DÉPENSE */}
      {data.plusGrosseDepense && (
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm px-5 py-4">
          <p className="text-xs text-pink-300 mb-1">Plus grosse dépense</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-rose-900">
              {data.plusGrosseDepense.category}
            </span>
            <span className="font-bold text-red-400">
              -{data.plusGrosseDepense.amount.toLocaleString(locale)} DT
            </span>
          </div>
        </div>
      )}

      {/* COMPARAISON */}
      <ReportComparison comparaison={data.comparaison} locale={locale} />

      {/* LINE CHART */}
      <ReportLineChart data={data.lineChart} locale={locale} />

      {/* TABLEAU HISTORIQUE */}
      <ReportHistoryTable data={data.historiqueTable} locale={locale} />

      {/* ANALYSE PAR CATÉGORIE */}
      <CategoryAnalysis
        categoriesHistorique={data.categoriesHistorique}
        locale={locale}
        selectedCat={selectedCat}
        setSelectedCat={setSelectedCat}
      />

      {/* OBJECTIFS */}
      <GoalsProgress goalsWidget={data.goalsWidget} locale={locale} />
    </div>
  );
}