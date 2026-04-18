// ActiviteDash.jsx — vue Activité & Comportement (admin BI)
import { useActivite } from "../../hooks/useActivite";

import ActiviteBiKpis         from "../../components/Activite/ActiviteBiKpis";
import { EngagementSegmentation } from "../../components/Activite/EngagementSegmentation";
import { ActivityHeatmap }        from "../../components/Activite/ActivityHeatmap";
import { VelociteChart }           from "../../components/Activite/VelociteChart";
import { RetentionCurve }         from "../../components/Activite/RetentionCurve";
import { UsageDepthChart }        from "../../components/Activite/UsageDepthChart";
import { HourlyDistribution }     from "../../components/Activite/HourlyDistribution";

export default function ActiviteComportement() {
  const { data, loading, error } = useActivite();

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
      Chargement...
    </div>
  );

  if (error) return (
    <div className="text-[#A32D2D] text-sm p-4 bg-[#FCEBEB] rounded-xl border border-[#F7C1C1]">
      {error}
    </div>
  );

  if (!data) return null;

  const {
    kpis,
    segmentation,
    segmentEvolution,
    profondeurUsage,
    opsParJour,
    opsParSemaine,
    retentionCurve,
    parHeure,
  } = data;

  return (
    <div className="flex flex-col gap-5">

      {/* ── 8 KPIs BI ─────────────────────────────────────── */}
      <ActiviteBiKpis kpis={kpis} />

      {/* ── Segmentation stacked ──────────────────────────── */}
      <EngagementSegmentation
        segmentation={segmentation}
        evolution={segmentEvolution}
      />

      {/* ── Heatmap + Vélocité ────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ActivityHeatmap data={opsParJour} />
        <VelociteChart   data={opsParSemaine} />
      </div>

      {/* ── Rétention + Profondeur d'usage ────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RetentionCurve data={retentionCurve} />
        <UsageDepthChart data={profondeurUsage} />
      </div>

      {/* ── Distribution horaire ──────────────────────────── */}
      <HourlyDistribution data={parHeure} />
    </div>
  );
}