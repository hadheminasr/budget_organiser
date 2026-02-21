import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import SharedCard from "../../../SharedComponents/SharedCard";
import { TrendingDown, TrendingUp, Tags, Wallet, Percent } from "lucide-react";
import ParetoTopCategories from "./paretoCategories";
import DepenseVsRevenuTimeline from "./DepenseVsRevenuTimeline.jsx";
import DepensesParCategorieBar from "./DepensesParCategorieBar.jsx";
import DonutRepartitionCategories from "./DonutRepartitionCategories.jsx";
export default function FinancierCategorie() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/admin/financierCategories",
          { withCredentials: true }
        );

        setStats(res.data?.stats || null);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // helpers
  const fmtMoney = (n) =>
    new Intl.NumberFormat("fr-TN", { maximumFractionDigits: 0 }).format(n);

  const depMoMText = useMemo(() => {
    if (!stats) return "";
    if (stats.depMoM === null || stats.depMoM === undefined) return "Pas de comparaison";
    return `${stats.depMoM > 0 ? "+" : ""}${stats.depMoM}% vs ${stats.prevMonth}`;
  }, [stats]);

  const revMoMText = useMemo(() => {
    if (!stats) return "";
    if (stats.revMoM === null || stats.revMoM === undefined) return "Pas de comparaison";
    return `${stats.revMoM > 0 ? "+" : ""}${stats.revMoM}% vs ${stats.prevMonth}`;
  }, [stats]);

  const depMoMType = useMemo(() => {
    if (!stats || stats.depMoM === null || stats.depMoM === undefined) return "neutral";
    return stats.depMoM > 0 ? "negative" : "positive"; // dépenses qui augmentent = moins bien
  }, [stats]);

  const revMoMType = useMemo(() => {
    if (!stats || stats.revMoM === null || stats.revMoM === undefined) return "neutral";
    return stats.revMoM > 0 ? "positive" : "negative"; // revenus qui augmentent = mieux
  }, [stats]);

  if (loading) return <div>Loading Financier & Catégories...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!stats) return <div>Aucune donnée.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Financier & Catégories</h1>
        {/* Dépenses totales */}
        <SharedCard
          title={`Dépenses (${stats.month})`}
          value={`${fmtMoney(stats.depTotal)} DT`}
          icon={TrendingDown}
          iconColor="red"
          change={depMoMText}
          changeType={depMoMType}
        />

        {/* Revenus totaux */}
        <SharedCard
          title={`Revenus (${stats.month})`}
          value={`${fmtMoney(stats.revTotal)} DT`}
          icon={TrendingUp}
          iconColor="emerald"
          change={revMoMText}
          changeType={revMoMType}
        />

        {/* Catégorie #1 */}
        <SharedCard
          title="Catégorie n°1 (dépenses)"
          value={stats.topCategorie?.label || "—"}
          icon={Tags}
          iconColor="blue"
          change={
            stats.topCategorie
              ? `${fmtMoney(stats.topCategorie.total)} DT • ${stats.topCategorie.count} ops`
              : ""
          }
          changeType="neutral"
        />

        {/* Moyenne depense par compte */}
        <SharedCard
          title="Moyenne dépenses / compte"
          value={`${fmtMoney(stats.avgDepenseParCompte)} DT`}
          icon={Wallet}
          iconColor="amber"
          change="Mesure d'engagement"
          changeType="neutral"
        />

        {/* MoM Dépenses (KPI “actionnable”) */}
        <SharedCard
          title="Variation MoM Dépenses"
          value={
            stats.depMoM === null || stats.depMoM === undefined
              ? "—"
              : `${stats.depMoM > 0 ? "+" : ""}${stats.depMoM}%`
          }
          icon={Percent}
          iconColor="rose"
          change={`Comparaison ${stats.prevMonth} → ${stats.month}`}
          changeType={depMoMType}
        />

        {/* MoM Revenus */}
        <SharedCard
          title="Variation MoM Revenus"
          value={
            stats.revMoM === null || stats.revMoM === undefined
              ? "—"
              : `${stats.revMoM > 0 ? "+" : ""}${stats.revMoM}%`
          }
          icon={Percent}
          iconColor="emerald"
          change={`Comparaison ${stats.prevMonth} → ${stats.month}`}
          changeType={revMoMType}
        />
      </div>

      {/* Petite note BI  */}
      <div className="text-xs text-gray-500">
        <b>Interprétation admin :</b> suivre la dépense totale, détecter la catégorie dominante,
        mesurer l’engagement (moyenne/compte) et comparer le mois courant au précédent (MoM).
        Si <i>“Non classée”</i> domine, c’est un signal de qualité de données à corriger (catégorie obligatoire).
      </div>
      <div className="space-y-6">
            {/* ParetoTopCategories */}
            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-2">Pareto Top Categories</h2>
              <ParetoTopCategories />
            </div>

            {/* DepenseVsRevenuTimeline */}
            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-2">Depense Vs Revenu Timeline</h2>
              <DepenseVsRevenuTimeline />
            </div>

            {/* DepensesParCategorieBar */}
            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-2">Depenses Par Categorie Bar</h2>
              < DepensesParCategorieBar/>
            </div>

            {/* DonutRepartitionCategories*/}
            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-2">Donut Repartition Categories</h2>
              <DonutRepartitionCategories />
            </div>
        </div>
    </div>
  );
}

