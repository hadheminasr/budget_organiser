// FinancierKpis.jsx — refait avec SharedCard
import SharedCard from "../../SharedComponents/SharedCard";
import {
  TrendingUp,
  PiggyBank,
  HeartPulse,
  BarChart2,
  AlertTriangle,
  Wallet,
  Users,
  Target,
} from "lucide-react";

const locale = "fr-TN";

// Détermine la couleur de l'icône SharedCard selon la valeur et les seuils
const resolveIconColor = (colorFn, raw) => {
  const hex = colorFn(raw);
  // Mappe les hex du design system → clés de SharedCard
  if (hex === "#1D9E75") return "emerald";
  if (hex === "#EF9F27") return "amber";
  if (hex === "#E24B4A") return "rose";
  if (hex === "#378ADD") return "blue";
  if (hex === "#7F77DD") return "blue";
  return "gray";
};

// Détermine changeType pour la couleur du texte change
const resolveChangeType = (colorFn, raw) => {
  const hex = colorFn(raw);
  if (hex === "#1D9E75") return "positive";
  if (hex === "#E24B4A") return "negative";
  return "neutral";
};

const KPI_CONFIG = [
  {
    key: "tauxExecution",
    suffix: "%",
    label: "Taux d'exécution budgétaire",
    changeFn: (v) =>
      v > 100
        ? `⚠ Dépassement de ${v - 100}%`
        : v > 85
        ? `Proche de la limite`
        : `${100 - v}% de marge restante`,
    icon: TrendingUp,
    color: (v) => (v > 100 ? "#E24B4A" : v > 85 ? "#EF9F27" : "#378ADD"),
    format: (v) => `${v}%`,
  },
  {
    key: "tauxEpargne",
    suffix: "%",
    label: "Taux d'épargne global",
    changeFn: (v) =>
      v >= 15
        ? `Épargne saine`
        : v >= 5
        ? `Épargne limite`
        : `Épargne insuffisante`,
    icon: PiggyBank,
    color: (v) => (v >= 15 ? "#1D9E75" : v >= 5 ? "#EF9F27" : "#E24B4A"),
    format: (v) => `${v}%`,
  },
  {
    key: "scoreSanteMoy",
    suffix: "",
    label: "Score santé budgétaire",
    changeFn: (v) =>
      v >= 70
        ? `Gestion budgétaire saine`
        : v >= 45
        ? `Gestion à améliorer`
        : `Gestion budgétaire critique`,
    icon: HeartPulse,
    color: (v) => (v >= 70 ? "#1D9E75" : v >= 45 ? "#EF9F27" : "#E24B4A"),
    format: (v) => `${v} / 100`,
  },
  {
    key: "concentrationTop2",
    suffix: "%",
    label: "Concentration top 2 cat.",
    changeFn: (v) =>
      v > 70
        ? `Forte concentration`
        : v > 50
        ? `Concentration modérée`
        : `Bonne diversification`,
    icon: BarChart2,
    color: (v) => (v > 70 ? "#E24B4A" : v > 50 ? "#EF9F27" : "#1D9E75"),
    format: (v) => `${v}%`,
  },
  {
    key: "pctDepassement",
    suffix: "%",
    label: "Comptes en dépassement",
    changeFn: (v) =>
      v <= 20
        ? `Situation maîtrisée`
        : v <= 40
        ? `À surveiller`
        : `Taux élevé de dépassements`,
    icon: AlertTriangle,
    color: (v) => (v <= 20 ? "#1D9E75" : v <= 40 ? "#EF9F27" : "#E24B4A"),
    format: (v) => `${v}%`,
  },
  {
    key: "totalDepensePlateforme",
    suffix: " DT",
    label: "Dépense totale plateforme",
    changeFn: (v, kpis) => {
      if (!kpis.totalBudgets) return "Ce mois";
      const pct = Math.round((v / kpis.totalBudgets) * 100);
      return `${pct}% du budget total alloué`;
    },
    icon: Wallet,
    color: () => "#378ADD",
    format: (v) => `${v.toLocaleString(locale)} DT`,
  },
  {
    key: "moyenneDepensesParCompte",
    suffix: " DT",
    label: "Moy. dépense / compte actif",
    changeFn: () => "Par compte avec opérations",
    icon: Users,
    color: () => "#888780",
    format: (v) => `${v.toLocaleString(locale)} DT`,
  },
  {
    key: "montantTotalObjectifs",
    suffix: " DT",
    label: "Total alloué aux objectifs",
    changeFn: () => "Cumulé sur objectifs actifs",
    icon: Target,
    color: () => "#7F77DD",
    format: (v) => `${v.toLocaleString(locale)} DT`,
  },
];

export default function FinancierKpis({ kpis = {} }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {KPI_CONFIG.map((cfg) => {
        const raw        = kpis[cfg.key] ?? 0;
        const value      = cfg.format(raw);
        const change     = cfg.changeFn(raw, kpis);
        const iconColor  = resolveIconColor(cfg.color, raw);
        const changeType = resolveChangeType(cfg.color, raw);

        return (
          <SharedCard
            key={cfg.key}
            title={cfg.label}
            value={value}
            change={change}
            changeType={changeType}
            icon={cfg.icon}
            iconColor={iconColor}
          />
        );
      })}
    </div>
  );
}