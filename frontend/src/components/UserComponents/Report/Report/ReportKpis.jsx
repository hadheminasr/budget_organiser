import SharedCard from "../../../../SharedComponents/SharedCard";
import {
  Hash,
  Star,
  StickyNote,
  CheckCircle,
  PiggyBank,
  Target,
} from "lucide-react";

export default function ReportKpis({ data, locale }) {
  const scoreColor =
    data.score >= 80 ? "emerald" : data.score >= 50 ? "amber" : "red";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <SharedCard
        title="Opérations ce mois"
        value={data.nbOperations}
        change="transactions effectuées"
        changeType="neutral"
        icon={Hash}
        iconColor="blue"
      />

      <SharedCard
        title="Score discipline"
        value={`${data.score} / 100`}
        change={
          data.score >= 80
            ? "🎉 Excellent ce mois !"
            : data.score >= 50
            ? "👍 Peut mieux faire"
            : "⚠️ À améliorer"
        }
        changeType={
          data.score >= 80
            ? "positive"
            : data.score >= 50
            ? "neutral"
            : "negative"
        }
        icon={Star}
        iconColor={scoreColor}
      />

      <SharedCard
        title="Notes ce mois"
        value={data.nbNotes}
        change="notes créées"
        changeType="neutral"
        icon={StickyNote}
        iconColor="amber"
      />

      <SharedCard
        title="Catégories respectées"
        value={`${data.catsNonDepassees} / ${data.totalCats}`}
        change={
          data.catsNonDepassees === data.totalCats
            ? "✅ Toutes respectées !"
            : `${data.totalCats - data.catsNonDepassees} dépassée(s)`
        }
        changeType={
          data.catsNonDepassees === data.totalCats ? "positive" : "negative"
        }
        icon={CheckCircle}
        iconColor={
          data.catsNonDepassees === data.totalCats ? "emerald" : "red"
        }
      />

      <SharedCard
        title="Montant non dépensé"
        value={`${data.montantNonDepense.toLocaleString(locale)} DT`}
        change="économisé sur les budgets"
        changeType="positive"
        icon={PiggyBank}
        iconColor="emerald"
      />

      <SharedCard
        title="Objectifs actifs"
        value={data.objectifsActifs}
        change="en cours de réalisation"
        changeType="neutral"
        icon={Target}
        iconColor="rose"
      />
    </div>
  );
}