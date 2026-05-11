// PremiumDashboardPage.jsx — i18n complet
import { usePremium }     from "../../hooks/userPremium";
import { useAuth }        from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { motion }         from "framer-motion";
import {
  TrendingUp, Wallet, Calendar, Target,
  AlertTriangle, Shield, Clock, Flame, Star, Crown,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ── Utilities ────────────────────────────────────────────────────────────────
const getScoreColor = (score) => {
  if (score >= 80) return "#d4a5a5";
  if (score >= 60) return "#e0c9a6";
  if (score >= 40) return "#e8c4a0";
  return "#e8a0a0";
};

const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case "low":    return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "medium": return "bg-amber-50 text-amber-700 border-amber-200";
    case "high":   return "bg-rose-50 text-rose-700 border-rose-200";
    default:       return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getActionStyle = (action) => {
  switch (action) {
    case "reduce":   return { bg: "bg-[#fde8e8]", text: "text-[#c57676]", border: "border-[#f5d0d0]" };
    case "maintain": return { bg: "bg-[#f5f0e8]", text: "text-[#b8a088]", border: "border-[#e8dcc8]" };
    case "freeze":   return { bg: "bg-[#f0e6f0]", text: "text-[#9b7b9b]", border: "border-[#e0d0e0]" };
    case "increase": return { bg: "bg-[#e8f0e8]", text: "text-[#7b9b7b]", border: "border-[#d0e0d0]" };
    default:         return { bg: "bg-gray-50",   text: "text-gray-600",  border: "border-gray-200"  };
  }
};

const fmt = (amount = 0) => `${Number(amount || 0).toFixed(2)} DT`;

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

// ── SectionTitle ─────────────────────────────────────────────────────────────
const SectionTitle = ({ icon: Icon, title, sub, iconBg = "bg-rose-100", iconColor = "text-rose-500" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </div>
    <div>
      <h2 className="text-base font-semibold text-gray-800 leading-tight">{title}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── ScoreDonut ────────────────────────────────────────────────────────────────
const ScoreDonut = ({ score }) => {
  const data = [{ value: score }, { value: 100 - score }];
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={42}
            startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
            <Cell fill={getScoreColor(score)} />
            <Cell fill="#f5f0f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: getScoreColor(score) }}>{score}</span>
        <span className="text-[10px] text-gray-400">/100</span>
      </div>
    </div>
  );
};

// ── StatPill ──────────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value, sub, accent = "text-gray-800" }) => (
  <div className="flex items-center gap-3 bg-white/70 border border-pink-100 rounded-2xl px-4 py-3">
    {Icon && <Icon className="h-4 w-4 text-pink-300 flex-shrink-0" />}
    <div className="min-w-0">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide leading-none mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${accent} truncate`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 truncate">{sub}</p>}
    </div>
  </div>
);

// ── CategoryRebalanceItem ─────────────────────────────────────────────────────
const CategoryRebalanceItem = ({ rec }) => {
  const { t } = useTranslation();
  const a = getActionStyle(rec.action);
  const priorityStyles = {
    high:   { bg: "bg-rose-100", text: "text-rose-700"  },
    medium: { bg: "bg-amber-50", text: "text-amber-700" },
    low:    { bg: "bg-gray-100", text: "text-gray-600"  },
  };
  const p = priorityStyles[rec.priority] ?? { bg: "bg-gray-50", text: "text-gray-500" };

  return (
    <div className={`${a.bg} border ${a.border} rounded-xl p-4 flex items-center gap-4`}>
      <span className="text-xl flex-shrink-0">{rec.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-semibold text-gray-800 truncate">{rec.name}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${a.text} ${a.bg} border ${a.border}`}>
            {t(`premium.rebalance.actions.${rec.action}`, rec.action)}
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
            {t(`premium.rebalance.priority.${rec.priority}`, rec.priority)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-x-4 text-xs text-gray-500">
          <span>
            {t("premium.rebalance.originalBudget")}{" "}
            <span className="font-medium text-gray-700">{fmt(rec.originalBudget)}</span>
          </span>
          <span>
            {t("premium.rebalance.spent")}{" "}
            <span className="font-medium text-gray-700">{fmt(rec.spent)}</span>
          </span>
          <span>
            {t("premium.rebalance.recommended")}{" "}
            <span className={`font-bold ${a.text}`}>{fmt(rec.recommendedRemaining)}</span>
          </span>
        </div>
      </div>
      {/* usage ring */}
      <div className="w-12 h-12 flex-shrink-0 relative">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <path d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0-31.831"
            fill="none" stroke="#f0e6e6" strokeWidth="3" />
          <path d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0-31.831"
            fill="none" stroke={rec.color || getScoreColor(80)} strokeWidth="3"
            strokeDasharray={`${rec.usageRate}, 100`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-gray-700">{Math.round(rec.usageRate)}%</span>
        </div>
      </div>
    </div>
  );
};

// ── WeeklyActionCard ──────────────────────────────────────────────────────────
const WeeklyActionCard = ({ action }) => {
  const { t } = useTranslation();
  const borderColors = { 1: "border-l-rose-400", 2: "border-l-amber-400", 3: "border-l-gray-300" };
  return (
    <div className={`border-l-4 ${borderColors[action.priority] ?? borderColors[3]} bg-white rounded-r-xl p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{action.icon ?? "•"}</span>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 inline-block mb-1">
            {t("premium.weeklyPlan.priority", { n: action.priority })}
          </span>
          <p className="text-sm font-semibold text-gray-800">{action.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
          {action.amount != null && (
            <p className="text-xs font-semibold text-gray-700 mt-2">
              {fmt(action.amount)}
              {action.dailyAmount > 0 && (
                <span className="text-gray-400 font-normal"> · {fmt(action.dailyAmount)}/j</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── AlertCard ─────────────────────────────────────────────────────────────────
const AlertCard = ({ alert }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3 flex items-start gap-3">
      <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide">
            {t(alert.type === "danger" ? "premium.alerts.critical" : "premium.alerts.warning")}
          </span>
          <span className="text-[11px] text-rose-400 font-mono">{alert.code}</span>
        </div>
        <p className="text-xs text-gray-600">{alert.message}</p>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function PremiumDashboardPage() {
  const { user } = useAuth();
  const { t }    = useTranslation();
  const accountId = user?.accountId?._id || user?.accountId;

  const { premiumData, loading, error, refetch } = usePremium(accountId);

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-sm text-gray-400">{t("premium.loading")}</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-40 gap-3">
      <AlertTriangle className="h-6 w-6 text-rose-400" />
      <p className="text-sm text-gray-500">{error}</p>
      <button onClick={refetch}
        className="text-xs px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
        {t("premium.retry")}
      </button>
    </div>
  );

  if (!premiumData) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-sm text-gray-400">{t("premium.noData")}</p>
    </div>
  );

  const {
    executiveSummary: es = {},
    coachingMode:     cm = {},
    goalProtection:   gp = {},
    rebalance:        rb = {},
    weeklyPlan:       wp = {},
    alerts            = [],
    metadata:         md = {},
  } = premiumData;

  const statusKey = es.score >= 70 ? "good" : es.score >= 50 ? "warning" : "critical";

  return (
    <div className="w-full max-w-none px-3 py-4 sm:px-4 sm:py-6 lg:px-6 flex flex-col gap-5">

      {/* ── NIVEAU 1 — Lecture rapide ──────────────────────────────────────── */}
      <motion.div {...fadeInUp}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-pink-100 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <ScoreDonut score={es.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-base font-bold text-gray-800">{t("premium.title")}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskColor(es.riskLevel)}`}>
                {t(`premium.risk.${es.riskLevel}`, es.riskLevel)}
              </span>
              {es.coachingModeLabel && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  {es.coachingModeLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <div className="bg-pink-50 rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-gray-400 mb-0.5">{t("premium.questions.amIOk")}</p>
                <p className="text-sm font-bold text-gray-800">{t(`premium.status.${statusKey}`)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-gray-400 mb-0.5">{t("premium.questions.howMuchLeft")}</p>
                <p className="text-sm font-bold text-gray-800">{fmt(es.spendableAmount)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-gray-400 mb-0.5">{t("premium.questions.protecting")}</p>
                <p className="text-sm font-bold text-gray-800">{fmt(es.protectedGoalAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {cm.metadata?.isCriticalEndOfMonth && (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800"
            dangerouslySetInnerHTML={{ __html: t("premium.criticalEndOfMonth") }} />
        )}
        {cm.nonEssentialPolicy === "freeze" && (
          <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800"
            dangerouslySetInnerHTML={{ __html: t("premium.nonEssentialFreeze") }} />
        )}
      </motion.div>

      {/* 4 stat pills */}
      <motion.div {...fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatPill
          icon={Wallet}
          label={t("premium.kpi.remaining")}
          value={fmt(es.remainingAmount)}
          sub={t("premium.kpi.spendable", { amount: fmt(es.spendableAmount) })}
        />
        <StatPill
          icon={Flame}
          label={t("premium.kpi.burnRate")}
          value={fmt(es.dailyBurnRate)}
          sub={t("premium.kpi.average")}
        />
        <StatPill
          icon={Calendar}
          label={t("premium.kpi.daysLeft")}
          value={`${es.daysLeftInMonth}j`}
          sub={t("premium.kpi.daysElapsed", { count: es.daysElapsed })}
        />
        <StatPill
          icon={TrendingUp}
          label={t("premium.kpi.projection")}
          value={fmt(es.projectedMonthlySpend)}
          accent={es.projectedOverspend > 0 ? "text-rose-600" : "text-emerald-600"}
        />
      </motion.div>

      {/* Alertes niveau 1 */}
      {alerts.length > 0 && (
        <motion.div {...fadeInUp} className="flex flex-col gap-2">
          {alerts.map((alert, i) => <AlertCard key={i} alert={alert} />)}
        </motion.div>
      )}

      {/* ── NIVEAU 2 — Plan semaine ────────────────────────────────────────── */}
      <motion.div {...fadeInUp}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-pink-100 shadow-sm"
      >
        <SectionTitle
          icon={Star}
          title={t("premium.sections.weeklyPlan")}
          sub={wp.header?.coachingModeLabel}
          iconBg="bg-purple-100" iconColor="text-purple-600"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-purple-50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[11px] text-gray-400">{t("premium.weeklyPlan.score")}</p>
            <p className="text-lg font-bold text-purple-700">{wp.context?.score}%</p>
          </div>
          <div className="bg-purple-50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[11px] text-gray-400">{t("premium.weeklyPlan.daysLeft")}</p>
            <p className="text-lg font-bold text-purple-700">{wp.context?.daysLeftInMonth}</p>
          </div>
          <div className="bg-purple-50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[11px] text-gray-400">{t("premium.weeklyPlan.weeklyBudget")}</p>
            <p className="text-lg font-bold text-purple-700">{fmt(wp.context?.weeklyBudget)}</p>
          </div>
        </div>
        {wp.summary && (
          <p className="text-xs text-gray-600 bg-purple-50 rounded-xl p-3 mb-4">{wp.summary}</p>
        )}
        <div className="flex flex-col gap-2">
          {wp.actions?.map((action, i) => <WeeklyActionCard key={i} action={action} />)}
        </div>
      </motion.div>

      {/* ── NIVEAU 3 — Détail ─────────────────────────────────────────────── */}

      {/* Protection objectifs */}
      {gp.hasActiveGoal && (
        <motion.div {...fadeInUp}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-pink-100 shadow-sm"
        >
          <SectionTitle
            icon={Shield}
            title={t("premium.sections.goalProtection")}
            iconBg="bg-emerald-100" iconColor="text-emerald-600"
          />
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-emerald-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[11px] text-gray-400">{t("premium.goalProtection.discipline")}</p>
              <p className="text-lg font-bold text-emerald-700">{gp.disciplineScore}%</p>
            </div>
            <div className="bg-emerald-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[11px] text-gray-400">{t("premium.goalProtection.protected")}</p>
              <p className="text-lg font-bold text-emerald-700">{fmt(gp.protectedAmount)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[11px] text-gray-400">{t("premium.goalProtection.capacity")}</p>
              <p className="text-lg font-bold text-emerald-700">{gp.capacityRatio ?? "N/A"}%</p>
            </div>
          </div>
          {gp.message && (
            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-xl p-3">{gp.message}</p>
          )}
        </motion.div>
      )}

      {/* Rééquilibrage */}
      <motion.div {...fadeInUp}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-pink-100 shadow-sm"
      >
        <SectionTitle
          icon={Target}
          title={t("premium.sections.rebalance")}
          sub={[
            t("premium.rebalance.reduced",   { count: rb.summary?.reducedCount   ?? 0 }),
            t("premium.rebalance.increased",  { count: rb.summary?.increasedCount ?? 0 }),
            t("premium.rebalance.frozen",     { count: rb.summary?.frozenCount    ?? 0 }),
          ].join(" · ")}
          iconBg="bg-amber-100" iconColor="text-amber-600"
        />
        <div className="flex flex-col gap-2">
          {rb.recommendations?.map((rec, i) => <CategoryRebalanceItem key={i} rec={rec} />)}
        </div>
      </motion.div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
        <span>
          {t("premium.source",   { source:   md.scoreSource })}
          {" · "}
          {t("premium.template", { template: md.recommendedPlanTemplate?.replace("_", " ") ?? "Standard" })}
        </span>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {t("premium.generatedAt", {
              date: new Date(md.generatedAt).toLocaleDateString(t("common.locale"), {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              }),
            })}
          </span>
        </div>
      </div>

    </div>
  );
}