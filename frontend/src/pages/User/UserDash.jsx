// Orchestrateur — contient uniquement : banner, KPIs live, imports des composants
import { useAuth }        from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useDashboard }   from "../../hooks/UseDashboard";
import { useCoachBudget } from "../../hooks/useCoachBudget";
import { useState }       from "react";
import NewMonthModal      from "../../components/NewModal";
import SharedKpiLive      from "../../SharedComponents/SharedKpiLive";
import DashCoachBloc      from "../../components/UserComponents/Dash/DashCoashBloc";
import DashCategoryBar    from "../../components/UserComponents/Dash/DashCategoryBar";
import DashDonutChart     from "../../components/UserComponents/Dash/DashDonutChart";
import DashProjectionArea from "../../components/UserComponents/Dash/DashProjectionArea";
import DashGoalsProgress  from "../../components/UserComponents/Dash/DashGoalsProgress";

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);

export default function UserDash() {
  const { user }  = useAuth();
  const isGerant = user?.role === "gérant";
  const { t }     = useTranslation();
  const { data, loading, error }                = useDashboard(user?.accountId);
  const { coachData, loadingCoach, errorCoach } = useCoachBudget(user?.accountId);
  const [showResetModal, setShowResetModal]     = useState(false);

  const locale = t("common.locale");

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-sm text-gray-400">
      {t("common.loading")}
    </div>
  );

  if (error) return (
    <div className="text-[#A32D2D] text-sm p-4 bg-[#FCEBEB] rounded-xl border border-[#F7C1C1]">
      {error}
    </div>
  );

  if (!data) return null;

  //Calculs pour les KPIs live 
  const totalBudget = data.totalBudgets ?? 0;
  const consumed= data.totalDepense ?? 0;
  const remaining= data.reste?? 0;
  const consumedPct = totalBudget > 0 ? Math.round((consumed / totalBudget) * 100) : 0;

  const today         = new Date().getDate();
  const daysInMonth   = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const avgPerDay     = today > 0 ? Math.round(consumed / today) : 0;
  const projected     = Math.round(avgPerDay * daysInMonth);
  const projectedOver = projected > totalBudget;

  return (
    <div className="w-full flex flex-col gap-5">

      {/* BANNER NOUVEAU MOIS */}
      {isGerant && data.lastResetMonth !== new Date().toISOString().slice(0, 7) && (
        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#FAEEDA] border border-[#FAC775]">
          <div className="flex items-center gap-2.5">
            <span className="text-[#854F0B]"><IconCalendar /></span>
            <div>
              <p className="text-[13px] font-medium text-[#633806]">Nouveau mois disponible</p>
              <p className="text-[11px] text-[#854F0B] mt-0.5">
                Initialisez votre budget pour ce mois
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="px-3.5 py-1.5 bg-[#EF9F27] text-white text-xs font-medium rounded-lg hover:bg-[#BA7517] transition-colors"
          >
            Commencer
          </button>
        </div>
      )}

      {/* KPIs LIVE*/}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <SharedKpiLive
          label="Solde du mois"
          value={`${(data.solde ?? 0).toLocaleString(locale)} DT`}
          sub="Budget total alloué"
          pct={100}
          barColor="#378ADD"
        />
        <SharedKpiLive
          label="Consommé ce mois"
          value={`${consumed.toLocaleString(locale)} DT`}
          sub={`${consumedPct}% du budget${consumedPct > 100 ? " — dépassé" : " — sous contrôle"}`}
          pct={consumedPct}
          barColor={consumedPct > 100 ? "#E24B4A" : consumedPct > 80 ? "#EF9F27" : "#1D9E75"}
        />
        <SharedKpiLive
          label="Marge restante"
          value={`${remaining.toLocaleString(locale)} DT`}
          sub={`${Math.max(0, 100 - consumedPct)}% non consommé`}
          pct={Math.max(0, 100 - consumedPct)}
          barColor="#7F77DD"
        />
        <SharedKpiLive
          label="Rythme / jour"
          value={`${avgPerDay.toLocaleString(locale)} DT`}
          sub={`Projection : ${projected.toLocaleString(locale)} DT${projectedOver ? " ⚠ dépassement" : ""}`}
          pct={Math.round(totalBudget > 0 ? (projected / totalBudget) * 100 : 0)}
          barColor={projectedOver ? "#E24B4A" : "#EF9F27"}
        />
      </div>

      {/* BLOC COACH*/}
      <DashCoachBloc
        coachData={coachData}
        loadingCoach={loadingCoach}
        errorCoach={errorCoach}
        locale={locale}
      />

      {/* GRAPHIQUES CATÉGORIES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashCategoryBar byCategory={data.byCategory} locale={locale} />
        <DashDonutChart  byCategory={data.byCategory} locale={locale} />
      </div>

      {/* PROJECTION CUMULATIVE */}
      <DashProjectionArea
        totalBudget={totalBudget}
        consumed={consumed}
        locale={locale}
      />

      {/* OBJECTIFS*/}
      <DashGoalsProgress goals={data.goals} locale={locale} />

      {/* ── MODAL NOUVEAU MOIS ────────────────────────────────────────────── */}
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