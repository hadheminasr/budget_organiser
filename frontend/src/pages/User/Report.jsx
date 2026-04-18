// Report.jsx — version mise à jour avec section BI analytique
import { useTranslation } from "react-i18next";
import { useReport } from "../../hooks/UseReport";
import { useState } from "react";

import ReportKpis         from "../../components/UserComponents/Report/Report/ReportKpis";
import ReportComparison   from "../../components/UserComponents/Report/Report/ReportComparison";
import ReportLineChart    from "../../components/UserComponents/Report/Report/ReportLineChart";
import ReportHistoryTable from "../../components/UserComponents/Report/Report/ReportHistoryTable";
import CategoryAnalysis   from "../../components/UserComponents/Report/Report/CategoryAnalysis";
import GoalsProgress      from "../../components/UserComponents/Report/Report/GoalsProgress";

// ── Nouveau bloc BI analytique ────────────────────────────────────────────────
import BISynthese from "../../components/UserComponents/Report/BI/BISynthese";

export default function Report() {
  const { t }    = useTranslation();
  const { data, loading, error } = useReport();
  const locale   = t("common.locale");
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
      <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl">{error}</div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full flex flex-col gap-6">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div>
        <h1 className="font-medium text-xl text-gray-900">
          Rapport mensuel
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Bilan de{" "}
          {new Date(data.reportMonth + "-01").toLocaleDateString(locale, {
            month: "long",
            year:  "numeric",
          })}
        </p>
      </div>

      {/* ── KPIs EXISTANTS ─────────────────────────────────────── */}
      <ReportKpis data={data} locale={locale} />

      {/* ── PLUS GROSSE DÉPENSE ────────────────────────────────── */}
      {data.plusGrosseDepense && (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
          <p className="text-[11px] text-gray-400 mb-1">Plus grosse dépense</p>
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-gray-900">
              {data.plusGrosseDepense.category}
            </span>
            <span className="font-medium text-[#E24B4A]">
              −{data.plusGrosseDepense.amount.toLocaleString(locale)} DT
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION BI ANALYTIQUE — synthèse intelligente du mois
          Alimentée par data.bi (cf. useReport hook enrichi)
      ══════════════════════════════════════════════════════════ */}
      {data.bi && (
        <BISynthese data={data.bi} locale={locale} />
      )}

      
      {/* ── LINE CHART (existant) ───────────────────────────────── */}
      <ReportLineChart data={data.lineChart} locale={locale} />

      {/* ── TABLEAU HISTORIQUE (existant) ───────────────────────── */}
      <ReportHistoryTable data={data.historiqueTable} locale={locale} />

      {/* ── ANALYSE PAR CATÉGORIE (existant) ────────────────────── */}
      <CategoryAnalysis
        categoriesHistorique={data.categoriesHistorique}
        locale={locale}
        selectedCat={selectedCat}
        setSelectedCat={setSelectedCat}
      />

      {/* ── OBJECTIFS (existant) ────────────────────────────────── */}
      <GoalsProgress goalsWidget={data.goalsWidget} locale={locale} />

    </div>
  );
}