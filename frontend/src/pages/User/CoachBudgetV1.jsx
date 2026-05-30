// CoachBudgetPage.jsx — i18n complet
import { useAuth }        from "../../context/AuthContext";
import { useCoachBudget } from "../../hooks/useCoachBudget";
import { useTranslation } from "react-i18next";
import {
  CheckCircle   as IconCheck,
  AlertTriangle as IconAlert,
  ShieldAlert   as IconWarning,
  Gauge         as IconGauge,
  Wallet        as IconWallet,
  Zap           as IconZap,
  Star          as IconStar,
  TrendingUp    as IconTrendingUp,
  Shield        as IconShield,
  Lightbulb     as IconLightbulb,
  FolderPlus    as IconFolder,
  Target        as IconTarget,
  Sparkles      as IconSparkles,
  TrendingDown  as IconTrendingDown,
} from "lucide-react";

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-2 mb-4">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <h3 className="text-[15px] font-medium text-gray-900 truncate">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
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
            <div key={i} className={`rounded-lg border px-3 py-2.5 text-sm leading-relaxed text-gray-700 break-words ${itemClass}`}>
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

// ── Styles (indépendants de la langue) ───────────────────────────────────────
const statusCardStyle = {
  alert:   "border-[#F7C1C1] bg-[#fdf2f2]",
  warning: "border-[#FAC775] bg-[#fdf8ee]",
  good:    "border-[#9FE1CB] bg-[#f0faf6]",
};
const statusBadgeStyle = {
  alert:   "bg-[#FCEBEB] text-[#501313] border-[#F7C1C1]",
  warning: "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
  good:    "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
};
const statusIconColor = {
  alert:   "text-[#A32D2D]",
  warning: "text-[#854F0B]",
  good:    "text-[#0F6E56]",
};
const statusIcon = {
  alert:   <IconAlert   className="w-5 h-5" />,
  warning: <IconWarning className="w-5 h-5" />,
  good:    <IconCheck   className="w-5 h-5" />,
};
const riskStyle = {
  high:   "bg-[#FCEBEB] text-[#791F1F] border-[#F7C1C1]",
  medium: "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
  low:    "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
};
const ruleTypeStyle = {
  alert:   "bg-[#FCEBEB] text-[#791F1F] border-[#F7C1C1]",
  warning: "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
  good:    "bg-[#EAF3DE] text-[#3B6D11] border-[#C0DD97]",
};
const severityStyle = {
  low:    "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
  medium: "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
  high:   "bg-[#FCEBEB] text-[#791F1F] border-[#F7C1C1]",
  none:   "bg-gray-50 text-gray-600 border-gray-200",
};

// ── Main component ────────────────────────────────────────────────────────────
export default function CoachBudgetPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "fr" ? "fr-FR" : "en-US";

  const { coachData, loadingCoach, errorCoach, fetchCoachBudget } =
    useCoachBudget(user?.accountId);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingCoach) return (
    <div className="w-full min-h-[40vh] flex items-center justify-center">
      <p className="text-sm text-gray-400">{t("coach.loading")}</p>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (errorCoach) return (
    <div className="w-full">
      <div className="rounded-2xl border border-[#F7C1C1] bg-[#fdf2f2] p-5">
        <p className="text-sm font-medium text-[#791F1F] mb-1">{t("coach.errorTitle")}</p>
        <p className="text-sm text-[#A32D2D]">{errorCoach}</p>
        <button onClick={fetchCoachBudget}
          className="mt-4 px-4 py-2 rounded-xl bg-[#E24B4A] text-white text-sm font-medium hover:bg-[#A32D2D] transition-colors">
          {t("coach.retry")}
        </button>
      </div>
    </div>
  );

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!coachData) return (
    <div className="w-full">
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <p className="text-sm text-gray-400">{t("coach.noData")}</p>
      </div>
    </div>
  );

  // ── Derived ────────────────────────────────────────────────────────────────
  const status          = coachData.status ?? "warning";
  const budgetConsumption  = coachData.smartKpis?.budgetConsumptionRate ?? 0;
  const healthScore        = coachData.smartKpis?.healthScore ?? 0;
  const riskLevel          = coachData.smartKpis?.riskLevel ?? "low";
  const remainingBudget    = coachData.smartKpis?.remainingBudget ?? 0;
  const projectedSpending  = coachData.projection?.projectedEndMonthSpending ?? 0;
  const projectedRemaining = coachData.projection?.projectedRemainingBudget ?? 0;
  const projectedStatus    = coachData.projection?.projectedStatus ?? "safe";
  const currentDay         = coachData.projection?.currentDay ?? "—";
  const daysInMonth        = coachData.projection?.daysInMonth ?? "—";

  // projectionText traduit depuis le status retourné par le back
  const projectionText = t(`coach.projection.${
    projectedStatus === "over_budget"   ? "overBudget"   :
    projectedStatus === "close_to_limit"? "closeToLimit" : "safe"
  }`);

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-gray-900">{t("coach.title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("coach.subtitle")}</p>
        </div>
      </div>

      {/* ── SYNTHÈSE PRINCIPALE ── */}
      <section className={`rounded-2xl border p-5 ${statusCardStyle[status] ?? statusCardStyle.warning}`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl bg-white/70 shrink-0 ${statusIconColor[status]}`}>
            {statusIcon[status]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-medium text-gray-900">
                {t(`coach.status.${status}.title`)}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusBadgeStyle[status]}`}>
                {status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {t(`coach.status.${status}.subtitle`)}
            </p>
            {coachData.mainLabel && (
              <span className="mt-2.5 inline-flex px-3 py-1 rounded-full bg-white/70 border border-white/80 text-xs text-gray-600">
                {t(`coach.rules.labels.${coachData.mainLabel}`, coachData.mainLabel)}
              </span>
            )}
          </div>
        </div>

        {/* Messages narratifs — générés en FR côté back, affichés tels quels */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/60 border border-white/80 p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2">
              {t("coach.messageMain")}
            </p>
            <p className="text-sm leading-relaxed text-gray-700">{coachData.mainMessage}</p>
          </div>
          <div className="rounded-xl bg-white/60 border border-white/80 p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-2">
              {t("coach.messageGlobal")}
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              {coachData.secondaryMessage || t("coach.noSecondaryMessage")}
            </p>
          </div>
        </div>
      </section>

      {/* ── KPI CARDS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-[#E24B4A]">
            <IconGauge className="w-4 h-4" />
            <p className="text-xs text-gray-500">{t("coach.kpi.consumed")}</p>
          </div>
          <p className="text-2xl font-medium text-gray-900">{budgetConsumption.toFixed(1)}%</p>
          <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">{t("coach.kpi.consumedSub")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-[#639922]">
            <IconWallet className="w-4 h-4" />
            <p className="text-xs text-gray-500">{t("coach.kpi.remaining")}</p>
          </div>
          <p className="text-2xl font-medium text-gray-900">
            {remainingBudget.toLocaleString(locale)}{" "}
            <span className="text-sm font-normal text-gray-400">DT</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">{t("coach.kpi.remainingSub")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-[#BA7517]">
            <IconZap className="w-4 h-4" />
            <p className="text-xs text-gray-500">{t("coach.kpi.risk")}</p>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${riskStyle[riskLevel] ?? riskStyle.low}`}>
            {t(`coach.risk.${riskLevel}`)}
          </span>
          <p className="text-[11px] text-gray-400 mt-2 leading-snug">{t("coach.kpi.riskSub")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-[#7F77DD]">
            <IconStar className="w-4 h-4" />
            <p className="text-xs text-gray-500">{t("coach.kpi.healthScore")}</p>
          </div>
          <p className="text-2xl font-medium text-gray-900">
            {healthScore}
            <span className="text-sm font-normal text-gray-400">/100</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">{t("coach.kpi.healthScoreSub")}</p>
        </div>
      </section>

      {/* ── PROJECTION ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 overflow-hidden">
        <SectionHeader
          icon={<span className="text-[#185FA5]"><IconTrendingUp className="w-4 h-4" /></span>}
          title={t("coach.projection.title")}
          subtitle={t("coach.projection.subtitle", { current: currentDay, total: daysInMonth })}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#E6F1FB] border border-[#B5D4F4] p-4">
            <p className="text-[11px] text-gray-500 mb-1.5">{t("coach.projection.projected")}</p>
            <p className="text-lg font-medium text-gray-900">
              {projectedSpending.toLocaleString(locale)}{" "}
              <span className="text-sm font-normal text-gray-400">DT</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-2 leading-snug">{t("coach.projection.projectedSub")}</p>
          </div>
          <div className="rounded-xl bg-[#EAF3DE] border border-[#C0DD97] p-4">
            <p className="text-[11px] text-gray-500 mb-1.5">{t("coach.projection.margin")}</p>
            <p className="text-lg font-medium text-gray-900">
              {projectedRemaining.toLocaleString(locale)}{" "}
              <span className="text-sm font-normal text-gray-400">DT</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-2 leading-snug">{t("coach.projection.marginSub")}</p>
          </div>
          <div className="rounded-xl bg-[#FAEEDA] border border-[#FAC775] p-4">
            <p className="text-[11px] text-gray-500 mb-1.5">{t("coach.projection.coachRead")}</p>
            <p className="text-sm font-medium text-gray-800 leading-relaxed">{projectionText}</p>
          </div>
        </div>
      </section>

      {/* ── ALERTES + RECOMMANDATIONS ── */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Alertes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 overflow-hidden">
          <SectionHeader
            icon={<span className="text-[#E24B4A]"><IconShield className="w-4 h-4" /></span>}
            title={t("coach.alerts.title")}
          />
          {coachData.alerts?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {coachData.alerts.map((alert, i) => (
                <div key={i} className="rounded-lg border border-[#F7C1C1] bg-[#FCEBEB] px-3.5 py-2.5 text-sm text-[#791F1F] leading-relaxed">
                  {alert}
                  {/* ↑ texte généré FR côté backend — affiché tel quel */}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3.5 py-2.5 text-sm text-[#3B6D11]">
              {t("coach.alerts.none")}
            </div>
          )}
        </div>

        {/* Recommandations */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <SectionHeader
            icon={<span className="text-[#BA7517]"><IconLightbulb className="w-4 h-4" /></span>}
            title={t("coach.recommendations.title")}
          />
          <RecGroup
            label={t("coach.recommendations.immediate")}
            dot="bg-[#E24B4A]"
            items={coachData.recommendationBlocks?.immediate}
            emptyText={t("coach.recommendations.immediateNone")}
            itemClass="border-[#F7C1C1] bg-[#FCEBEB]"
          />
          <RecGroup
            label={t("coach.recommendations.targeted")}
            dot="bg-[#EF9F27]"
            items={coachData.recommendationBlocks?.targeted}
            emptyText={t("coach.recommendations.targetedNone")}
            itemClass="border-[#FAC775] bg-[#FAEEDA]"
          />
          <RecGroup
            label={t("coach.recommendations.strategic")}
            dot="bg-[#639922]"
            items={coachData.recommendationBlocks?.strategic}
            emptyText={t("coach.recommendations.strategicNone")}
            itemClass="border-[#C0DD97] bg-[#EAF3DE]"
          />
        </div>
      </section>

      {/* ── FOCUS PERSONNALISÉS ── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Catégorie sensible */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 overflow-hidden">
          <SectionHeader
            icon={<span className="text-[#E24B4A]"><IconFolder className="w-4 h-4" /></span>}
            title={t("coach.focus.categoryTitle")}
          />
          {coachData.insights?.topCategorieProbleme ? (
            <>
              <p className="text-sm font-medium text-gray-900 mb-2">
                {coachData.insights.topCategorieProbleme.name}
              </p>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                severityStyle[coachData.insights.topCategorieProbleme.severity] ?? severityStyle.none
              }`}>
                {t("coach.focus.consumption")} :{" "}
                {t(`coach.severity.${coachData.insights.topCategorieProbleme.severity}`,
                   coachData.insights.topCategorieProbleme.severity)}
              </span>
              <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-gray-400">{t("coach.focus.overrun")}</span>
                  <span className="text-sm font-medium text-[#E24B4A] whitespace-nowrap">
                    +{(coachData.insights.topCategorieProbleme.depassement ?? 0).toLocaleString(locale)} DT
                  </span>
                </div>
                <div className="flex justify-between items-baseline whitespace-nowrap">
                  <span className="text-xs text-gray-400">{t("coach.focus.consumption")}</span>
                  <span className="text-sm font-medium text-[#993556]">
                    {(coachData.insights.topCategorieProbleme.consumptionRate ?? 0).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                {t("coach.focus.categoryCaption")}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">{t("coach.focus.categoryNone")}</p>
          )}
        </div>

        {/* Objectif à relancer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 overflow-hidden">
          <SectionHeader
            icon={<span className="text-[#639922]"><IconTarget className="w-4 h-4" /></span>}
            title={t("coach.focus.goalTitle")}
          />
          {coachData.insights?.objectifLeMoinsAvance ? (
            <>
              <p className="text-sm font-medium text-gray-900 mb-2">
                {coachData.insights.objectifLeMoinsAvance.name}
              </p>
              <div className="space-y-1.5 border-t border-gray-100 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400 whitespace-nowrap">{t("coach.focus.progress")}</span>
                  <span className="text-sm font-medium text-[#BA7517]">
                    {((coachData.insights.objectifLeMoinsAvance.progressRate ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400 whitespace-nowrap">{t("coach.focus.currentAmount")}</span>
                  <span className="text-sm font-medium text-[#993556]">
                    {(coachData.insights.objectifLeMoinsAvance.currentAmount ?? 0).toLocaleString(locale)} DT
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                {t("coach.focus.goalCaption")}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">{t("coach.focus.goalNone")}</p>
          )}
        </div>

        {/* Profil de conseil */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 overflow-hidden">
          <SectionHeader
            icon={<span className="text-[#7F77DD]"><IconSparkles className="w-4 h-4" /></span>}
            title={t("coach.focus.profileTitle")}
          />
          <div className="flex flex-col gap-3">
            {[
              { label: t("coach.focus.adviceStyle"),    value: coachData.accountProfile?.adviceStyle,    fallback: t("coach.focus.notDefined") },
              { label: t("coach.focus.mainDifficulty"), value: coachData.accountProfile?.mainDifficulty, fallback: t("coach.focus.notFilled") },
              { label: t("coach.focus.savingHabit"),    value: coachData.accountProfile?.savingHabit,    fallback: t("coach.focus.notFilled") },
              { label: t("coach.focus.mainGoal"),       value: coachData.accountProfile?.mainGoal,       fallback: t("coach.focus.notDefined") },
            ].map(({ label, value, fallback }) => (
              <div key={label} className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-800 break-words">
                  {t(`coach.profile.${value}`, value) || fallback}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DÉTAIL DES RÈGLES ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 overflow-hidden">
        <SectionHeader
          icon={<span className="text-[#185FA5]"><IconTrendingDown className="w-4 h-4" /></span>}
          title={t("coach.rules.title")}
          subtitle={t("coach.rules.subtitle")}
        />
        {coachData.triggeredRules?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2.5 pr-4 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    {t("coach.rules.colRule")}
                  </th>
                  <th className="py-2.5 pr-4 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    {t("coach.rules.colType")}
                  </th>
                  <th className="py-2.5 pr-4 text-left text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    {t("coach.rules.colPrio")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {coachData.triggeredRules.map((rule, index) => (
                  <tr key={index} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      {t(`coach.rules.labels.${rule.label}`, rule.label)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        ruleTypeStyle[rule.type] ?? "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>
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
          <p className="text-sm text-gray-400">{t("coach.rules.none")}</p>
        )}
      </section>

    </div>
  );
}