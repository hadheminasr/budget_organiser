import SharedCard from "../../SharedComponents/SharedCard";
import {
  Users,
  Wallet,
  Share2,
  AlertTriangle,
  Target,
  Activity,
} from "lucide-react";

export default function VueGlobaleKpis({ kpis }) {
  if (!kpis) return null;

  const cards = [
    {
      title: "Utilisateurs",
      value: kpis.nbUsers ?? 0,
      change: "Base totale utilisateurs",
      changeType: "neutral",
      icon: Users,
      iconColor: "blue",
    },
    {
      title: "Comptes actifs",
      value: kpis.comptesActifs ?? 0,
      change: `${kpis.tauxActivationComptes ?? 0}% des comptes actifs`,
      changeType: "positive",
      icon: Wallet,
      iconColor: "emerald",
    },
    {
      title: "Comptes partagés",
      value: `${kpis.pctComptesPartages ?? 0}%`,
      change: "Part des comptes collaboratifs",
      changeType: "neutral",
      icon: Share2,
      iconColor: "blue",
    },
    {
      title: "Comptes en dépassement",
      value: `${kpis.pctComptesEnDepassement ?? 0}%`,
      change: "Tension budgétaire plateforme",
      changeType: (kpis.pctComptesEnDepassement ?? 0) > 35 ? "negative" : "neutral",
      icon: AlertTriangle,
      iconColor: (kpis.pctComptesEnDepassement ?? 0) > 35 ? "red" : "amber",
    },
    {
      title: "Objectifs actifs",
      value: kpis.objectifsActifs ?? 0,
      change: `${kpis.pctObjectifsAtteints ?? 0}% atteints`,
      changeType: "positive",
      icon: Target,
      iconColor: "amber",
    },
    {
      title: "Intensité d’usage",
      value: kpis.intensiteUsage ?? 0,
      change: "Opérations moyennes / compte actif",
      changeType: "neutral",
      icon: Activity,
      iconColor: "gray",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => (
        <SharedCard
          key={card.title}
          title={card.title}
          value={card.value}
          change={card.change}
          changeType={card.changeType}
          icon={card.icon}
          iconColor={card.iconColor}
        />
      ))}
    </div>
  );
}