import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import SharedCard from "../../../SharedComponents/SharedCard";
import CategoriesDistributionHistogram from "./CategoriesDistributionHistogram";
import Top10ComptesActiviteBar from "./Top10ComptesActiviteBar";
import FunnelComptes from "./FunnelComptes";

// icons (si tu utilises lucide-react)
import { ShieldCheck, ShieldX, Activity, AlertTriangle,Target,Tags,ArrowLeftRight} from "lucide-react";

export default function ActiviteComportement() {
  // 1) data backend (stats)
  const [stats, setStats] = useState(null);

  // 2) loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 3) filtre table (drill-down)
  // all | dormant7 | active7
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        // ⚠️ adapte l’URL à ta route
        const res = await axios.get(
          "http://localhost:5000/api/admin/ActiviteComportement",
          { withCredentials: true }
        );

        // back => { success:true, stats:{...} }
        setStats(res.data?.stats || null);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /**
   *  useMemo : on calcule une "vue" du tableau selon filterMode
   *  - évite de recalculer à chaque render inutilement
   *  - utile quand tu as des filtres / tri / grosses listes
   */
  const tableRows = useMemo(() => {
    if (!stats) return [];

    // 1) si "dormant7" => on affiche directement stats.dormant (déjà renvoyé par le backend)
    if (filterMode === "dormant7") return stats.dormant || [];

    // 2) si "active7" => tu peux soit:
    // - re-fetch les comptes depuis une route backend (best)
    // - ou afficher uniquement les IDs (moins UX)
    // Ici: on fait simple => afficher une ligne avec ID (ou tu ajoutes une route /comptes?ids=...)
    if (filterMode === "active7") {
      return (stats.activeNowIds || []).map((id) => ({
        _id: id,
        nomCompte: "—",
        nbUsers: "—",
        isBlocked: false,
        createdAt: null,
      }));
    }

    // 3) sinon "all" => on affiche au minimum dormant + actives (pas parfait)
    // Best practice: une route backend "GET /comptes" pour tous les comptes
    // Ici: simple => on affiche dormant (car on a la liste), sinon vide.
    return stats.dormant || [];
  }, [stats, filterMode]);

  // ----- UI states -----
  if (loading) return <div>Loading Activité & Comportement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!stats) return <div>Aucune donnée.</div>;

  /**
   * KPI actionnable : Taux actifs 7j + variation
   * - rateNow : ex 25%
   * - pctChange : ex -10% (par rapport semaine passée)
   * - Si pctChange === null => on affiche "Nouveau" ou "Pas de comparaison"
   */
  const actionTitle = "Taux comptes actifs (7j)";
  const actionValue = `${stats.rateNow}%`;

  const changeText =
    stats.pctChange === null
      ? "Pas de comparaison"
      : `${stats.pctChange > 0 ? "+" : ""}${stats.pctChange}% vs semaine passée`;

  const changeType =
    stats.pctChange === null ? "neutral" : stats.pctChange > 0 ? "positive" : "negative";

  return (
    <div className="space-y-6">
      {/* ------------------ KPI CARDS ------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Activité & Comportement</h1>
        {/* KPI normal 1: comptes actifs (non bloqués) */}
        <SharedCard
         title="moyenne opération par compte"
         value={stats.moyOperations}
         icon={ArrowLeftRight}
         iconColor="amber"

         />
         <SharedCard
         title="% Comptes qui utilisent categories personnalisé"
         value={stats.pctPersoCat}
         icon={Tags}
         iconColor="emerald"
         
         />
         <SharedCard
         title="% Comptes qui utilisent objectifs"
         value={stats.pctObjectifs}
         icon={Target}
         iconColor="blue"
         
         />
         
        <SharedCard
          title="Comptes actifs"
          value={stats.comptesActifs}
          icon={ShieldCheck}
          iconColor="emerald"
          change={`Activité 7j: ${stats.activeNow} comptes`}
          changeType="neutral"
          onClick={() => setFilterMode("active7")} // drilldown: comptes actifs sur 7j
        />

        {/* KPI normal 2: comptes bloqués */}
        <SharedCard
          title="Comptes bloqués"
          value={stats.comptesInActifs}
          icon={ShieldX}
          iconColor="red"
          change="Voir les comptes bloqués"
          changeType="neutral"
          // Ici, si tu veux drilldown bloqués, il faut une route backend qui renvoie les bloqués.
          // onClick={() => setFilterMode("blocked")}
        />

        {/* KPI actionnable */}
        <SharedCard
          title={actionTitle}
          value={actionValue}
          icon={Activity}
          iconColor="rose"
          change={changeText}
          changeType={changeType}
          // ✅ ACTION : clic => afficher les comptes dormants (à relancer/coacher)
          onClick={() => setFilterMode("dormant7")}
        />
      </div>

      {/* ------------------ FILTER BAR (simple) ------------------ */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Filtre :</span>
        <button
          className={`px-3 py-1 rounded-md text-sm border ${
            filterMode === "all" ? "bg-gray-100" : "bg-white"
          }`}
          onClick={() => setFilterMode("all")}
        >
          Tous
        </button>
        <button
          className={`px-3 py-1 rounded-md text-sm border ${
            filterMode === "active7" ? "bg-gray-100" : "bg-white"
          }`}
          onClick={() => setFilterMode("active7")}
        >
          Actifs (7j)
        </button>
        <button
          className={`px-3 py-1 rounded-md text-sm border ${
            filterMode === "dormant7" ? "bg-gray-100" : "bg-white"
          }`}
          onClick={() => setFilterMode("dormant7")}
        >
          Dormants (7j)
        </button>
      </div>

      {/* ------------------ TABLE ------------------ 
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {filterMode === "dormant7"
              ? "Comptes dormants (à relancer)"
              : filterMode === "active7"
              ? "Comptes actifs (IDs)"
              : "Liste des comptes"}
          </h2>

          {filterMode === "dormant7" && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-md">
              <AlertTriangle className="w-4 h-4" />
              Action suggérée : envoyer un coaching / notification
            </div>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Nom compte</th>
              <th className="py-2">Nb Users</th>
              <th className="py-2">Bloqué</th>
              <th className="py-2">Créé le</th>
              <th className="py-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr>
                <td className="py-3 text-gray-500" colSpan={5}>
                  Aucune donnée à afficher.
                </td>
              </tr>
            ) : (
              tableRows.map((c) => (
                <tr key={c._id} className="border-b last:border-b-0">
                  <td className="py-2">{c.nomCompte || "—"}</td>
                  <td className="py-2">{c.nbUsers ?? "—"}</td>
                  <td className="py-2">{c.isBlocked ? "Oui" : "Non"}</td>
                  <td className="py-2">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-2 text-gray-500">{c._id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        
       ------------------ EXPLICATION SOUTENANCE (résumé) ------------------ 
      <div className="text-xs text-gray-500">
        <p>
          <b>KPI normal</b> = montre l’état (actifs/bloqués).{" "}
          <b>KPI actionnable</b> = taux actifs 7j + variation + clic ⇒ drill-down (liste dormants).
        </p>
      </div>
    */}
    
        <div className="bg-white rounded-xl border p-4">
            <h2 className="text-lg font-semibold mb-2">Categories Distribution Histogram</h2>
                < CategoriesDistributionHistogram/>
        </div>

        <div className="bg-white rounded-xl border p-4">
            <h2 className="text-lg font-semibold mb-2">Top 10 Comptes Activite Bar</h2>
                < Top10ComptesActiviteBar/>
        </div>

        <div className="bg-white rounded-xl border p-4">
            <h2 className="text-lg font-semibold mb-2">Funnel Comptes</h2>
                < FunnelComptes/>
        </div>
    </div>
);
}
