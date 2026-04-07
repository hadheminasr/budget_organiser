import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../hooks/UseDashboard";
import { useState } from "react";
import SharedCard from "../../SharedComponents/SharedCard";
import { Wallet, TrendingDown, Target, StickyNote } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

import NewMonthModal from "../../components/NewModal";

export default function UserDash() {
  const { user }  = useAuth();
  const { t }     = useTranslation();
  const { data, loading, error } = useDashboard(user?.accountId);
  const [showResetModal, setShowResetModal] = useState(false);
  
  /*const isOwner = account?.createdBy?._id === user?._id?.toString()
               || account?.createdBy      === user?._id?.toString();*/


  if (loading) return (
    <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
      {t("common.loading")}
    </div>
  );

  if (error) return (
    <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl">{error}</div>
  );

  if (!data) return null;

  // données pour les graphiques
  const pieData = data.byCategory.map(cat => ({
    name:  cat.info?.name  ?? "Autre",
    value: cat.total,
    color: cat.info?.color ?? "#D7A4A6",
  }));

  const barData = data.byCategory.map(cat => ({
    name:    cat.info?.name   ?? "Autre",
    budget:  cat.info?.budget ?? 0,
    depense: cat.total,
  }));

  const locale = t("common.locale");

  return (
    <div className="w-full flex flex-col gap-6">
      {/* BANNER nouveau mois */}
      {data.lastResetMonth !== new Date().toISOString().slice(0, 7) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-amber-700">
              🗓️ Nouveau mois disponible
            </p>
            <p className="text-xs text-amber-500 mt-0.5">
              Initialisez votre budget pour ce mois
            </p>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 bg-amber-400 text-white text-xs font-bold rounded-xl hover:bg-amber-500 transition cursor-pointer">
            Commencer
          </button>
        </div>
      )
      }
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SharedCard
          title="Budget total du mois"
          value={`${data.solde.toLocaleString(locale)} DT`}
          change="inclut salaire + économies reportées"
          changeType="neutral"
          icon={Wallet}
          iconColor="rose"
        />
        <SharedCard
          title="Montant budgété"
          value={`${data.totalBudgets.toLocaleString(locale)} DT`}
          change="répartis sur vos catégories"
          changeType="neutral"
          icon={Wallet}
          iconColor="amber"
        />
        <SharedCard
          title="Réserve restante"
          value={`${data.reste.toLocaleString(locale)} DT`}
          change="encore disponible après budgets et objectifs"
          changeType={data.reste > 0 ? "positive" : "negative"}
          icon={Wallet}
          iconColor="emerald"
        />
        <SharedCard
          title="Objectifs actifs"
          value={data.goals.length}
          changeType="positive"
          icon={Target}
          iconColor="emerald"
        />
        <SharedCard
          title="Notes en attente"
          value={data.pendingNotes}
          change="notes à compléter"
          changeType={data.pendingNotes > 0 ? "negative" : "positive"}
          icon={StickyNote}
          iconColor="blue"
        />
      </div>

      {/* GRAPHIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Donut — répartition dépenses */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
          <h2 className="font-bold text-sm text-rose-900 mb-4">
            Répartition des dépenses
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `${v.toLocaleString(locale)} DT`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart — budget vs réel */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
          <h2 className="font-bold text-sm text-rose-900 mb-4">
            Budget vs Dépenses réelles
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => `${v.toLocaleString(locale)} DT`}
              />
              <Legend />
              <Bar dataKey="budget"  name="Budget"  fill="#f9a8d4" radius={[4,4,0,0]} />
              <Bar dataKey="depense" name="Dépensé" fill="#D7A4A6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* OBJECTIFS mini barres */}
      {data.goals.length > 0 && (
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
          <h2 className="font-bold text-sm text-rose-900 mb-4">
            Progression des objectifs
          </h2>
          <div className="flex flex-col gap-4">
            {data.goals.map(goal => {
              const percent = Math.min(100,
                ((goal.currentAmount ?? 0) / goal.targetAmount) * 100
              );
              return (
                <div key={goal._id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-rose-900">
                      {goal.icon} {goal.name}
                    </span>
                    <span className="text-pink-400">
                      {(goal.currentAmount ?? 0).toLocaleString(locale)} /
                      {goal.targetAmount.toLocaleString(locale)} DT
                    </span>
                  </div>
                  <div className="h-2.5 bg-pink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${percent}%`, backgroundColor: "#D7A4A6" }}
                    />
                  </div>
                  <p className="text-[10px] text-pink-300 mt-1 text-right">
                    {percent.toFixed(0)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
        {showResetModal && (
        <NewMonthModal
          onClose={() => setShowResetModal(false)}
          onSuccess={() => window.location.reload()}
          soldeActuel={data.solde ?? 0}
        />
      )}

    </div>
  );


}