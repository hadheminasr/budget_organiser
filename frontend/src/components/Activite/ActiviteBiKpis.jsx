import SharedCard from "../../SharedComponents/SharedCard";
import {
  Activity,
  Gauge,
  Repeat,
  Rocket,
  ShieldCheck,
  Layers3,
  Sparkles,
  BarChart3,
} from "lucide-react";

const KPI_CONFIG = [
  {
    key: "tauxEngagement",
    title: "Taux d'engagement actif",
    suffix: "%",
    sub: "comptes actifs 7j / total",
    icon: Activity,
    iconColor: "emerald",
    getChange: (v) => `${v ?? 0}% d'engagement`,
    getChangeType: (v) => (v >= 60 ? "positive" : v >= 40 ? "neutral" : "negative"),
  },
  {
    key: "moyenneOpsParCompte",
    title: "Vélocité plateforme",
    suffix: "",
    sub: "ops / compte actif ce mois",
    icon: Gauge,
    iconColor: "blue",
    getChange: (v) => `${v ?? 0} ops / compte actif`,
    getChangeType: (v) => (v >= 5 ? "positive" : v >= 2 ? "neutral" : "negative"),
  },
  {
    key: "tauxChurn",
    title: "Taux de churn précoce",
    suffix: "%",
    sub: "dormants 30j / total",
    icon: Repeat,
    iconColor: "red",
    getChange: (v) => `${v ?? 0}% de churn`,
    getChangeType: (v) => (v <= 15 ? "positive" : v <= 30 ? "neutral" : "negative"),
  },
  {
    key: "tauxActivation",
    title: "Taux d'activation",
    suffix: "%",
    sub: "comptes ayant fait leur reset",
    icon: Rocket,
    iconColor: "amber",
    getChange: (v) => `${v ?? 0}% activés`,
    getChangeType: (v) => (v >= 70 ? "positive" : v >= 45 ? "neutral" : "negative"),
  },
  {
    key: "scoreRetention",
    title: "Score de rétention",
    suffix: "",
    sub: "stabilité sur 8 semaines",
    icon: ShieldCheck,
    iconColor: "blue",
    getChange: (v) => `score ${v ?? 0}/100`,
    getChangeType: (v) => (v >= 70 ? "positive" : v >= 50 ? "neutral" : "negative"),
  },
  {
    key: "profondeurMoy",
    title: "Profondeur d'usage",
    suffix: "",
    sub: "features utilisées / compte",
    icon: Layers3,
    iconColor: "amber",
    getChange: (v) => `${v ?? 0} fonctionnalités`,
    getChangeType: (v) => (v >= 4 ? "positive" : v >= 2 ? "neutral" : "negative"),
  },
  {
    key: "nbCreationsMois",
    title: "Créations ce mois",
    suffix: "",
    sub: "notes + objectifs combinés",
    icon: Sparkles,
    iconColor: "rose",
    getChange: (v) => `${v ?? 0} créations`,
    getChangeType: (v) => (v >= 10 ? "positive" : v >= 4 ? "neutral" : "negative"),
  },
  {
    key: "intensiteMoyActifs",
    title: "Intensité moy. actifs",
    suffix: "",
    sub: "ops/mois parmi actifs 7j",
    icon: BarChart3,
    iconColor: "gray",
    getChange: (v) => `${v ?? 0} ops / actif`,
    getChangeType: (v) => (v >= 8 ? "positive" : v >= 4 ? "neutral" : "negative"),
  },
];

export default function ActiviteBiKpis({ kpis = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {KPI_CONFIG.map((cfg) => {
        const rawValue = kpis?.[cfg.key] ?? 0;
        const displayValue = `${rawValue}${cfg.suffix}`;

        return (
          <SharedCard
            key={cfg.key}
            title={cfg.title}
            value={displayValue}
            change={`${cfg.sub} · ${cfg.getChange(rawValue)}`}
            changeType={cfg.getChangeType(rawValue)}
            icon={cfg.icon}
            iconColor={cfg.iconColor}
          />
        );
      })}
    </div>
  );
}