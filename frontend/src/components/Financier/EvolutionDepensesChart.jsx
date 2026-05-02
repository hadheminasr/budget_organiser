import SharedKpiLive from "../../SharedComponents/SharedKpiLive";

const locale = "fr-TN";

const KPI_CONFIG = [
  {
    key: "tauxExecution",
    suffix: "%",
    label: "Taux d'exécution budgétaire",
    sub: "dépensé / budget alloué",
    color: (v) => (v > 100 ? "#E24B4A" : v > 85 ? "#EF9F27" : "#378ADD"),
    pct: (v) => Math.min(v, 100),
  },
  {
    key: "tauxEpargne",
    suffix: "%",
    label: "Taux d'épargne global",
    sub: "non-dépensé / budget total",
    color: (v) => (v >= 15 ? "#1D9E75" : v >= 5 ? "#EF9F27" : "#E24B4A"),
    pct: (v) => v,
  },
  {
    key: "scoreSanteMoy",
    suffix: "",
    label: "Score santé moyen",
    sub: "moyenne des comptes actifs",
    color: (v) => (v >= 65 ? "#1D9E75" : v >= 40 ? "#EF9F27" : "#E24B4A"),
    pct: (v) => v,
  },
  {
    key: "concentrationTop2",
    suffix: "%",
    label: "Concentration top 2 cat.",
    sub: "part des 2 premières catégories",
    color: (v) => (v > 70 ? "#E24B4A" : v > 50 ? "#EF9F27" : "#1D9E75"),
    pct: (v) => v,
  },
  {
    key: "pctDepassement",
    suffix: "%",
    label: "Comptes en dépassement",
    sub: "au moins 1 catégorie dépassée",
    color: (v) => (v <= 20 ? "#1D9E75" : v <= 40 ? "#EF9F27" : "#E24B4A"),
    pct: (v) => v,
    invert: true,
  },
  {
    key: "totalDepensePlateforme",
    suffix: " DT",
    label: "Dépense totale plateforme",
    sub: "tous comptes ce mois",
    color: () => "#378ADD",
    pct: (v, kpis) =>
      kpis.totalBudgets > 0
        ? Math.round((v / kpis.totalBudgets) * 100)
        : 50,
    format: (v) => v.toLocaleString(locale),
  },
  {
    key: "moyenneDepensesParCompte",
    suffix: " DT",
    label: "Moy. dépense / compte actif",
    sub: "DT par compte avec opérations",
    color: () => "#888780",
    pct: () => 50,
    format: (v) => v.toLocaleString(locale),
  },
  {
    key: "montantTotalObjectifs",
    suffix: " DT",
    label: "Total alloué aux objectifs",
    sub: "cumulé sur objectifs actifs",
    color: () => "#7F77DD",
    pct: () => 40,
    format: (v) => v.toLocaleString(locale),
  },
];

function KpiCard({ cfg, kpis }) {
  const raw = kpis[cfg.key] ?? 0;
  const value = cfg.format ? cfg.format(raw) : raw;
  const color = cfg.color(raw, kpis);
  const pct = cfg.pct(raw, kpis);

  const displayValue =
    typeof cfg.suffix === "string" && !cfg.format
      ? `${value}${cfg.suffix}`
      : value;

  return (
    <SharedKpiLive
      label={cfg.label}
      value={displayValue}
      sub={cfg.sub}
      pct={pct}
      barColor={color}
    />
  );
}

export default function FinancierKpis({ kpis = {} }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {KPI_CONFIG.map((cfg) => (
        <KpiCard key={cfg.key} cfg={cfg} kpis={kpis} />
      ))}
    </div>
  );
}