// BISynthese.jsx
// Section analytique BI complète — à injecter dans Report.jsx
// Remplace ou complète ReportKpis + ReportComparison
//
// Props: data (vient de useReport()) — structure attendue :
// {
//   biKpis: [{ label, value, delta, deltaLabel, deltaType, note }],
//   biScore: { global, discipline, epargne, objectifs, regularite },
//   waterfallItems: [{ label, value }],
//   radarData: { labels, current, previous, currentLabel, previousLabel },
//   dailyCumulative: { days, real, budget },
//   varianceItems: [{ name, budget, reel }],
//   insights: [{ type, text }],
//   reportMonth: "2025-03",
// }

import BIKpiGrid       from "./BIkpiGrid";
import BIScoreCard     from "./BIScoreCard";
import WaterfallChart  from "./WaterfallChart";
import RadarComparison from "./RadarComparision";
import CumulativeAreaChart from "./CumultativeAreaChart";
import VarianceTable   from "./VarianceTable";
import BIInsights      from "./BIInsights";

export default function BISynthese({ data, locale = "fr-TN" }) {
  if (!data) return null;

  const {
    biKpis         = [],
    biScore        = {},
    waterfallItems = [],
    radarData      = {},
    dailyCumulative = {},
    varianceItems  = [],
    insights       = [],
  } = data;

  return (
    <div className="flex flex-col gap-5">

      {/* Étiquette de section */}
      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
        Synthèse BI — analyse du mois
      </p>

      {/* 8 KPIs avec delta */}
      <BIKpiGrid kpis={biKpis} />

      {/* Score composite + Waterfall */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BIScoreCard score={biScore} />
        <WaterfallChart items={waterfallItems} locale={locale} />
      </div>

      {/* Radar + Area chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RadarComparison radarData={radarData} locale={locale} />
        <CumulativeAreaChart dailyData={dailyCumulative} locale={locale} />
      </div>

      {/* Tableau de variance */}
      <VarianceTable items={varianceItems} locale={locale} />

      {/* Insights analytiques */}
      <BIInsights insights={insights} />

    </div>
  );
}