import OperationParJour from "./OperationParJour.jsx";
import Top5CategoriesBarChart from "./Top5CategoriesBarChart.jsx";
import DepensesVsRevenusDonut from "./DepensesVsRevenus.jsx";
import HeatmapJourHeure from "./HeatmapJourHeure7j.jsx";
import SharedCard from "../../../SharedComponents/SharedCard.jsx";
import { useMemo, useEffect, useState } from "react";
import axios from "axios";
import { Users, Wallet, ShieldCheck, ShieldOff, Share2, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext"; 
import { useNavigate } from "react-router-dom";

export default function VueGlobal() {
  const [kpisData, setKpisData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
	const [user,setUser]=useState(null);
	const [isAuthenticated,setIsAuthenticated]=useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

const handleLogout = async () => {
  await logout();
  navigate("/login", { replace: true });
};

  useEffect(() => {
    const fetchVueGlobale = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          "http://localhost:5000/api/admin/KPI/VueGlobale",
          { withCredentials: true }
        );
        const payload = res.data?.data;
        setKpisData(payload?.kpis ?? null);
        setChartsData(payload?.charts ?? null);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchVueGlobale();
  }, []);
  const kpis = useMemo(() => {
    if (!kpisData) return [];
    return [
      { title: "Comptes totaux", value: kpisData.nbComptes, icon: Wallet, iconColor: "rose" },
      { title: "Comptes actifs", value: kpisData.comptesActifs, icon: ShieldCheck, iconColor: "emerald" },
      { title: "Comptes bloqués", value: kpisData.comptesBloques, icon: ShieldOff, iconColor: "red" },
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
  

	/*const handleLogout = async () => {
  try {
    setIsLoading(true);
    setError("");

    await axios.post(
      "http://localhost:5000/api/auth/logout",
      {},
      { withCredentials: true }
    );

    setUser(null);
    setIsAuthenticated(false);
  } catch (err) {
    setError(err?.response?.data?.message || "Error logging out");
  } finally {
    setIsLoading(false);
  }
};*/


  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!kpisData || !chartsData) return <div>Aucune donnée.</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Vue Globale</h1>
      {/* GRID KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <SharedCard key={idx} {...kpi} />
        ))}
      </div>
      <div className="space-y-6">
        {/* 1) Courbe opérations par jour */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-2">Opérations par jour (7j)</h2>
          <OperationParJour data={chartsData.operationsParJour7j} />
        </div>
        {/* 2) Top 5 catégories */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-2">Top 5 catégories (dépenses, 7j)</h2>
          <Top5CategoriesBarChart data={chartsData.top5CategoriesDepenses7j} />
        </div>
        {/* 3) Donut dépenses vs revenus */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-2">Dépenses vs Revenus (7j)</h2>
          <DepensesVsRevenusDonut data={chartsData.depensesVsRevenus7j} />
        </div>
        {/* 4) Heatmap */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-2">Heatmap Jour × Heure (7j)</h2>
          <HeatmapJourHeure data={chartsData.heatmapJourHeure7j} />
        </div>
        <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                >
                  Logout
          </motion.button>
      </div>
    </div>
  );
}
