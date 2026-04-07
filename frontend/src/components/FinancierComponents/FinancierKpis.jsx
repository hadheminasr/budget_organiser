import SharedCard from "../../SharedComponents/SharedCard";
import {
  TrendingDown,
  PiggyBank,
  Target,
  AlertTriangle,
  Trophy,
} from "lucide-react";

const locale = "fr-FR";

export default function FinancierKpis({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <SharedCard
        title="Total dépenses ce mois"
        value={`${kpis.totalDepensePlateforme.toLocaleString(locale)} DT`}
        change="sur toute la plateforme"
        changeType="neutral"
        icon={TrendingDown}
        iconColor="red"
      />

      <SharedCard
        title="Moyenne par compte"
        value={`${kpis.moyenneDepensesParCompte.toLocaleString(locale)} DT`}
        change="par compte actif"
        changeType="neutral"
        icon={PiggyBank}
        iconColor="amber"
      />

      <SharedCard
        title="% Dépassement budget"
        value={`${kpis.pctDepassement}%`}
        change="des comptes ont dépassé"
        changeType={kpis.pctDepassement > 10 ? "negative" : "positive"}
        icon={AlertTriangle}
        iconColor={kpis.pctDepassement > 10 ? "red" : "emerald"}
      />

      <SharedCard
        title="Objectifs atteints"
        value={kpis.objectifsAtteints}
        change="ce mois"
        changeType="positive"
        icon={Trophy}
        iconColor="emerald"
      />

      <SharedCard
        title="Montant non dépensé"
        value={`${kpis.montantNonDepense.toLocaleString(locale)} DT`}
        change="économisé sur les budgets"
        changeType="positive"
        icon={PiggyBank}
        iconColor="emerald"
      />

      <SharedCard
        title="Total distribué objectifs"
        value={`${kpis.montantTotalObjectifs.toLocaleString(locale)} DT`}
        change="cumulé sur tous les objectifs"
        changeType="neutral"
        icon={Target}
        iconColor="blue"
      />

      {kpis.topCategorie && (
        <SharedCard
          title="Top catégorie"
          value={`${kpis.topCategorie.icon} ${kpis.topCategorie.name}`}
          change={`${kpis.topCategorie.total.toLocaleString(locale)} DT dépensés`}
          changeType="negative"
          iconColor="rose"
        />
      )}
    </div>
  );
}