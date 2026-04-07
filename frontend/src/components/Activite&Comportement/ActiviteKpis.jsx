import SharedCard from "./../../SharedComponents/SharedCard";
import {
  Activity,
  Users,
  Moon,
  StickyNote,
  Target,
  RefreshCw,
} from "lucide-react";

export default function ActiviteKpis({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <SharedCard
        title="Opérations ce mois"
        value={kpis.nbOperationsMois}
        change={`moy. ${kpis.moyenneOpsParCompte} / compte actif`}
        changeType="neutral"
        icon={Activity}
        iconColor="blue"
      />

      <SharedCard
        title="Utilisateurs total"
        value={kpis.nbUtilisateurs}
        change="inscrits sur la plateforme"
        changeType="neutral"
        icon={Users}
        iconColor="rose"
      />

      <SharedCard
        title="Comptes actifs 7j"
        value={kpis.nbComptesActifs7j}
        change={`${kpis.pctActifs7j}% des comptes`}
        changeType={kpis.pctActifs7j >= 30 ? "positive" : "negative"}
        icon={Activity}
        iconColor={kpis.pctActifs7j >= 30 ? "emerald" : "red"}
      />

      <SharedCard
        title="Comptes dormants"
        value={kpis.nbDormants}
        change={`${kpis.pctDormants}% sans activité 30j`}
        changeType={kpis.pctDormants > 50 ? "negative" : "neutral"}
        icon={Moon}
        iconColor="gray"
      />

      <SharedCard
        title="% Reset ce mois"
        value={`${kpis.pctReset}%`}
        change="ont initialisé leur budget"
        changeType={kpis.pctReset >= 50 ? "positive" : "negative"}
        icon={RefreshCw}
        iconColor={kpis.pctReset >= 50 ? "emerald" : "amber"}
      />

      <SharedCard
        title="Notes créées"
        value={kpis.nbNotesMois}
        change="ce mois sur la plateforme"
        changeType="neutral"
        icon={StickyNote}
        iconColor="amber"
      />

      <SharedCard
        title="Objectifs créés"
        value={kpis.nbObjectifsMois}
        change="ce mois sur la plateforme"
        changeType="neutral"
        icon={Target}
        iconColor="emerald"
      />
    </div>
  );
}