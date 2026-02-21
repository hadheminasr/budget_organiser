import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import SharedCard from "../../../SharedComponents/SharedCard";
 export default function GestionCompte(){
    const [stats,setStats]=useState([null]);
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);
    useEffect(()=>{
        const fetchData=async()=>{
            try{
                setError("");
                setLoading(true);
                const res=axios.get("http://localhost:5000/api/admin/financierCategories",{withCredentials: true });
                setStats(res.data?.stats || null);
            } catch(error){
                setError(e?.response?.data?.message || e.message || "Erreur serveur");

            } finally{
                setLoading(false)
            };
        };

        fetchData();
        }, []);
    }
    //useMemo
    const tabrows = useMemo(()=>{
        if(!stats) return [];
        return [
            {
                title : "taux d'activité régulié "


            },
            {
                title:"santé moyen"


            },
            {
                title:"% comptes avec solde négatifs "
            },
            {
                title:"% comptes en alerte"
            }

        ]

    })
    /*return [
          {
            title: "Comptes totaux",
            value: stats.nbComptes,
            icon: Wallet,
            iconColor: "rose",
          },
          {
            title: "Comptes actifs",
            value: stats.compteActifs,
            icon: ShieldCheck,
            iconColor: "emerald",
          },
          {
            title: "Comptes bloqués",
            value: stats.compteInactifs,
            icon: ShieldOff,
            iconColor: "red",
          },
          {
            title: "Comptes partagés",
            value: `${Number(stats.comptePartage ?? 0).toFixed(1)}%`,
            icon: Share2,
            iconColor: "amber",
            change: "≥ 2 utilisateurs",
            changeType: "neutral",
          },
          {
            title: "Utilisateurs",
            value: stats.nbUsers,
            icon: Users,
            iconColor: "blue",
            change: `${stats.newUsers ?? 0} nouveaux (7j)`,
            changeType: (stats.newUsers ?? 0) > 0 ? "positive" : "neutral",
          },
          {
            title: "Objectifs actifs",
            value: stats.objectifActifs,
            icon: Target,
            iconColor: "blue",
            change: `${Number(stats.objectifAtteints ?? 0).toFixed(0)}% atteints`,
            changeType: (stats.objectifAtteints ?? 0) > 50 ? "positive" : "neutral",
          },
        ];
      }, [stats]);*/ 
    if (loading ) return <div>loading Gestion & Controle</div>
    if (error) return <div style={{ color: "red" }}> {error}</div>
    if (!stats) return <div >aucune donnees</div>
    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion & Controle</h1>
    
          {/* GRID KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi, idx) => (
              <SharedCard key={idx} {...kpi} />
            ))}
          </div>
        </div>
    )

{/* 

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
