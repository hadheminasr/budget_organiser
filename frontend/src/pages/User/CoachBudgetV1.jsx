import { useAuth } from "../../context/AuthContext";
import { useCoachBudget } from "../../hooks/useCoachBudget";

// ── Inline SVG icons (no Lucide dependency needed) ──────────────────────────
const IconRefresh = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.6 0 3 .68 4 1.76M13.5 2.5v2.5H11" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconAlert = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconWarning = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconGauge = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);
const IconWallet = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconZap = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconStar = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconTrendingUp = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconShield = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconLightbulb = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" />
    <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" />
    <line x1="12" y1="22" x2="12" y2="18" />
  </svg>
);
const IconFolder = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);
const IconTarget = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconSparkles = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconTrendingDown = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
);

// ── Config maps ──────────────────────────────────────────────────────────────
const statusConfig = {
  alert: {
    card: "border-[#F7C1C1] bg-[#fdf2f2]",
    badge: "bg-[#FCEBEB] text-[#501313] border-[#F7C1C1]",
    icon: <IconAlert />,
    iconColor: "text-[#A32D2D]",
    title: "Situation critique",
    subtitle: "Le coach a détecté des signaux nécessitant une correction rapide.",
  },
  warning: {
    card: "border-[#FAC775] bg-[#fdf8ee]",
    badge: "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
    icon: <IconWarning />,
    iconColor: "text-[#854F0B]",
    title: "Situation à surveiller",
    subtitle: "Votre budget reste globalement gérable, mais certains points demandent de l'attention.",
  },
  good: {
    card: "border-[#9FE1CB] bg-[#f0faf6]",
    badge: "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
    icon: <IconCheck />,
    iconColor: "text-[#0F6E56]",
    title: "Situation globalement saine",
    subtitle: "Votre budget est sous contrôle selon les règles actuelles du coach.",
  },
};

const riskLabels = { high: "Élevé", medium: "Modéré", low: "Faible" };
const riskStyles = {
  high:   "bg-[#FCEBEB] text-[#791F1F] border-[#F7C1C1]",
  medium: "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
  low:    "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
};

const ruleLabels = {
  budget_global_depasse:      "Budget global dépassé",
  categorie_depassee:         "Catégorie dépassée",
  reste_critique:             "Reste critique",
  objectif_en_retard:         "Objectif en retard",
  tendance_hausse:            "Tendance à la hausse",
  budget_sous_controle:       "Budget sous contrôle",
  objectif_bonne_progression: "Bonne progression de l'objectif",
};

const ruleTypeStyles = {
  alert:   "bg-[#FCEBEB] text-[#791F1F] border-[#F7C1C1]",
  warning: "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
  good:    "bg-[#EAF3DE] text-[#3B6D11] border-[#C0DD97]",
};

const severityLabels = { low: "Léger", medium: "Modéré", high: "Élevé", none: "Aucun" };
const severityStyles = {
  low:    "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
  medium: "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
  high:   "bg-[#FCEBEB] text-[#791F1F] border-[#F7C1C1]",
  none:   "bg-gray-50 text-gray-600 border-gray-200",
};

const profileLabels = {
  direct:     "Direct",
  motivating: "Motivant",
  leisure:    "Loisirs / sorties",
  food:       "Alimentation",
  transport:  "Transport",
  shopping:   "Shopping / achats",
  often:      "Souvent",
  sometimes:  "Parfois",
  rarely:     "Rarement",
  never:      "Jamais",
  reach_goal: "Atteindre un objectif",
};

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-2 mb-4">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <h3 className="text-[15px] font-medium text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function RecGroup({ label, dot, items, emptyText, itemClass }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
        {label}
      </p>
      {items?.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <div key={i} className={`rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed text-gray-700 ${itemClass}`}>
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">{emptyText}</p>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CoachBudgetPage() {
  const { user } = useAuth();
  const { coachData, loadingCoach, errorCoach, fetchCoachBudget } =
    useCoachBudget(user?.accountId);

  const locale = "fr-TN";

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingCoach) {
    return (
      <div className="w-full min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Chargement du Coach Budget…</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (errorCoach) {
    return (
      <div className="w-full">
        <div className="rounded-2xl border border-[#F7C1C1] bg-[#fdf2f2] p-5">
          <p className="text-sm font-medium text-[#791F1F] mb-1">Erreur de chargement</p>
          <p className="text-sm text-[#A32D2D]">{errorCoach}</p>
          <button
            onClick={fetchCoachBudget}
            className="mt-4 px-4 py-2 rounded-xl bg-[#E24B4A] text-white text-sm font-medium hover:bg-[#A32D2D] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!coachData) {
    return (
      <div className="w-full">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <p className="text-sm text-gray-400">
            Aucune donnée Coach Budget disponible pour le moment.
          </p>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const budgetConsumption  = coachData.smartKpis?.budgetConsumptionRate ?? 0;
  const healthScore        = coachData.smartKpis?.healthScore ?? 0;
  const riskLevel          = coachData.smartKpis?.riskLevel ?? "low";
  const remainingBudget    = coachData.smartKpis?.remainingBudget ?? 0;
  const projectedSpending  = coachData.projection?.projectedEndMonthSpending ?? 0;
  const projectedRemaining = coachData.projection?.projectedRemainingBudget ?? 0;
  const projectedStatus    = coachData.projection?.projectedStatus ?? "safe";

  const projectionText =
    projectedStatus === "over_budget"
      ? "Un dépassement de fin de mois est probable si le rythme actuel continue."
      : projectedStatus === "close_to_limit"
      ? "La trajectoire actuelle reste proche de la limite budgétaire."
      : "La trajectoire actuelle reste sous contrôle pour la fin du mois.";

  const ui = statusConfig[coachData.status] || statusConfig.warning;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col gap-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-gray-900">Coach Budget</h1>
          <p className="text-sm text-gray-400 mt-1">
            Diagnostic personnalisé, recommandations et projection de fin de mois.
          </p>
        </div>
        <button
          onClick={fetchCoachBudget}
          className="inline-flex items-center gap-2 self-start px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <IconRefresh />
          Actualiser
        </button>
      </div>

      {/* ── SYNTHÈSE PRINCIPALE ── */}
      <section className={`rounded-2xl border p-5 ${ui.card}`}>
        {/* Top row */}
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl bg-white/70 shrink-0 ${ui.iconColor}`}>
            {ui.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-medium text-gray-900">{ui.title}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${ui.badge}`}>
                {coachData.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{ui.subtitle}</p>
            {coachData.mainLabel && (
              <span className="mt-2.5 inline-flex px-3 py-1 rounded-full bg-white/70 border border-white/80 text-xs text-gray-600">
                {ruleLabels[coachData.mainLabel] || coachData.mainLabel}
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/60 border border-white/80 p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2">
              Message principal
            </p>
            <p className="text-sm leading-relaxed text-gray-700">{coachData.mainMessage}</p>
          </div>
          <div className="rounded-xl bg-white/60 border border-white/80 p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2">
              Lecture globale
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              {coachData.secondaryMessage ||
                "Aucune précision complémentaire n'est disponible pour ce diagnostic."}
            </p>
          </div>
        </div>
      </section>

      {/* ── KPI CARDS ── */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Budget consommé */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3 text-[#E24B4A]">
            <IconGauge />
            <p className="text-xs text-gray-500">Budget consommé</p>
          </div>
          <p className="text-2xl font-medium text-gray-900">{budgetConsumption.toFixed(1)}%</p>
          <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
            Part du budget total déjà utilisée ce mois-ci.
          </p>
        </div>

        {/* Marge restante */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3 text-[#639922]">
            <IconWallet />
            <p className="text-xs text-gray-500">Marge restante</p>
          </div>
          <p className="text-2xl font-medium text-gray-900">
            {remainingBudget.toLocaleString(locale)}{" "}
            <span className="text-sm font-normal text-gray-400">DT</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
            Budget encore disponible avant la limite totale.
          </p>
        </div>

        {/* Risque budgétaire */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3 text-[#BA7517]">
            <IconZap />
            <p className="text-xs text-gray-500">Risque budgétaire</p>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${riskStyles[riskLevel] || riskStyles.low}`}>
            {riskLabels[riskLevel] || riskLevel}
          </span>
          <p className="text-[11px] text-gray-400 mt-2 leading-snug">
            Niveau de vigilance estimé par le coach.
          </p>
        </div>

        {/* Score santé */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3 text-[#7F77DD]">
            <IconStar />
            <p className="text-xs text-gray-500">Score santé budget</p>
          </div>
          <p className="text-2xl font-medium text-gray-900">
            {healthScore}
            <span className="text-sm font-normal text-gray-400">/100</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">
            Score synthétique calculé à partir des règles détectées.
          </p>
        </div>
      </section>

      {/* ── PROJECTION ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionHeader
          icon={<span className="text-[#185FA5]"><IconTrendingUp /></span>}
          title="Projection de fin de mois"
          subtitle={`Basée sur le rythme actuel — Jour ${coachData.projection?.currentDay ?? "—"}/${coachData.projection?.daysInMonth ?? "—"}`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#E6F1FB] border border-[#B5D4F4] p-4">
            <p className="text-[11px] text-gray-500 mb-1.5">Dépense projetée</p>
            <p className="text-lg font-medium text-gray-900">
              {projectedSpending.toLocaleString(locale)}{" "}
              <span className="text-sm font-normal text-gray-400">DT</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-2 leading-snug">
              Estimation si la tendance actuelle se maintient.
            </p>
          </div>
          <div className="rounded-xl bg-[#EAF3DE] border border-[#C0DD97] p-4">
            <p className="text-[11px] text-gray-500 mb-1.5">Marge estimée fin de mois</p>
            <p className="text-lg font-medium text-gray-900">
              {projectedRemaining.toLocaleString(locale)}{" "}
              <span className="text-sm font-normal text-gray-400">DT</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-2 leading-snug">
              Budget résiduel projeté à fin de mois.
            </p>
          </div>
          <div className="rounded-xl bg-[#FAEEDA] border border-[#FAC775] p-4">
            <p className="text-[11px] text-gray-500 mb-1.5">Lecture du coach</p>
            <p className="text-sm font-medium text-gray-800 leading-relaxed">{projectionText}</p>
          </div>
        </div>
      </section>

      {/* ── ALERTES + RECOMMANDATIONS ── */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Alertes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionHeader
            icon={<span className="text-[#E24B4A]"><IconShield /></span>}
            title="Alertes détectées"
          />
          {coachData.alerts?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {coachData.alerts.map((alert, i) => (
                <div key={i} className="rounded-lg border border-[#F7C1C1] bg-[#FCEBEB] px-3.5 py-2.5 text-sm text-[#791F1F] leading-relaxed">
                  {alert}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3.5 py-2.5 text-sm text-[#3B6D11]">
              Aucune alerte critique détectée pour le moment.
            </div>
          )}
        </div>

        {/* Recommandations */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionHeader
            icon={<span className="text-[#BA7517]"><IconLightbulb /></span>}
            title="Recommandations du coach"
          />
          <RecGroup
            label="Actions immédiates"
            dot="bg-[#E24B4A]"
            items={coachData.recommendationBlocks?.immediate}
            emptyText="Aucune action urgente."
            itemClass="border-[#F7C1C1] bg-[#FCEBEB]"
          />
          <RecGroup
            label="Actions ciblées"
            dot="bg-[#EF9F27]"
            items={coachData.recommendationBlocks?.targeted}
            emptyText="Aucune action ciblée spécifique."
            itemClass="border-[#FAC775] bg-[#FAEEDA]"
          />
          <RecGroup
            label="Actions stratégiques"
            dot="bg-[#639922]"
            items={coachData.recommendationBlocks?.strategic}
            emptyText="Aucune action stratégique spécifique."
            itemClass="border-[#C0DD97] bg-[#EAF3DE]"
          />
        </div>
      </section>

      {/* ── FOCUS PERSONNALISÉS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Catégorie sensible */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionHeader
            icon={<span className="text-[#E24B4A]"><IconFolder /></span>}
            title="Catégorie sensible"
          />
          {coachData.insights?.topCategorieProbleme ? (
            <>
              <p className="text-sm font-medium text-gray-900 mb-2">
                {coachData.insights.topCategorieProbleme.name}
              </p>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                  severityStyles[coachData.insights.topCategorieProbleme.severity] ||
                  severityStyles.none
                }`}
              >
                Sévérité :{" "}
                {severityLabels[coachData.insights.topCategorieProbleme.severity] ||
                  coachData.insights.topCategorieProbleme.severity}
              </span>
              <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400">Dépassement</span>
                  <span className="text-sm font-medium text-[#E24B4A]">
                    +{(coachData.insights.topCategorieProbleme.depassement ?? 0).toLocaleString(locale)} DT
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400">Consommation</span>
                  <span className="text-sm font-medium text-[#993556]">
                    {(coachData.insights.topCategorieProbleme.consumptionRate ?? 0).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                Cette catégorie est actuellement celle qui déséquilibre le plus votre budget.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Aucune catégorie critique détectée.</p>
          )}
        </div>

        {/* Objectif à relancer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionHeader
            icon={<span className="text-[#639922]"><IconTarget /></span>}
            title="Objectif à relancer"
          />
          {coachData.insights?.objectifLeMoinsAvance ? (
            <>
              <p className="text-sm font-medium text-gray-900 mb-2">
                {coachData.insights.objectifLeMoinsAvance.name}
              </p>
              <div className="space-y-1.5 border-t border-gray-100 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400">Progression</span>
                  <span className="text-sm font-medium text-[#BA7517]">
                    {((coachData.insights.objectifLeMoinsAvance.progressRate ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400">Montant actuel</span>
                  <span className="text-sm font-medium text-[#993556]">
                    {(coachData.insights.objectifLeMoinsAvance.currentAmount ?? 0).toLocaleString(locale)} DT
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                Une contribution régulière peut améliorer l'avancement de cet objectif.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Aucun objectif actif à analyser.</p>
          )}
        </div>

        {/* Profil de conseil */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionHeader
            icon={<span className="text-[#7F77DD]"><IconSparkles /></span>}
            title="Profil de conseil"
          />
          <div className="flex flex-col gap-3">
            {[
              { label: "Style de conseil",    value: coachData.accountProfile?.adviceStyle,    fallback: "Non défini" },
              { label: "Difficulté principale",value: coachData.accountProfile?.mainDifficulty, fallback: "Non renseignée" },
              { label: "Habitude d'épargne",  value: coachData.accountProfile?.savingHabit,    fallback: "Non renseignée" },
              { label: "Objectif principal",  value: coachData.accountProfile?.mainGoal,       fallback: "Non renseigné" },
            ].map(({ label, value, fallback }) => (
              <div key={label}>
                <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-800">
                  {profileLabels[value] || value || fallback}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DÉTAIL DES RÈGLES ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionHeader
          icon={<span className="text-[#185FA5]"><IconTrendingDown /></span>}
          title="Détail du diagnostic"
          subtitle="Règles déclenchées par le moteur V1 et leur niveau de priorité."
        />
        {coachData.triggeredRules?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2.5 pr-4 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    Règle détectée
                  </th>
                  <th className="py-2.5 pr-4 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    Type
                  </th>
                  <th className="py-2.5 pr-4 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    Priorité
                  </th>
                </tr>
              </thead>
              <tbody>
                {coachData.triggeredRules.map((rule, index) => (
                  <tr key={index} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      {ruleLabels[rule.label] || rule.label}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                          ruleTypeStyles[rule.type] ||
                          "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {rule.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{rule.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Aucune règle déclenchée.</p>
        )}
      </section>
    </div>
  );
}