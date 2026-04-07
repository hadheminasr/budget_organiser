//psibilité d'amelioration avec .map
export default function ReportComparison({ comparaison, locale }) {
  if (!comparaison) return null;

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
      <h2 className="font-bold text-sm text-rose-900 mb-1">
        Comparaison avec le mois précédent
      </h2>

      <p className="text-xs text-pink-300 mb-4">
        {new Date(comparaison.previousMonth + "-01").toLocaleDateString(
          locale,
          { month: "long", year: "numeric" }
        )}
      </p>

      <div className="flex flex-col gap-3">

        {/* 1. Opérations */}
        <div className="flex items-center justify-between py-2 border-b border-pink-50">
          <span className="text-xs text-pink-400 w-36">Opérations</span>

          <span className="text-xs text-gray-400">
            {comparaison.nbOperations.previous.toLocaleString(locale)}
          </span>

          <span className="text-xs text-gray-300">→</span>

          <span className="text-xs font-bold text-rose-900">
            {comparaison.nbOperations.current.toLocaleString(locale)}
          </span>

          <div className="flex flex-col items-end w-32">
            {comparaison.nbOperations.diff !== null ? (
              <>
                <span
                  className={`text-xs font-bold ${
                    comparaison.nbOperations.diff > 0
                      ? "text-emerald-500"
                      : comparaison.nbOperations.diff < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {comparaison.nbOperations.diff > 0 ? "+" : ""}
                  {comparaison.nbOperations.diff}%
                </span>

                {comparaison.nbOperations.diff >= 50 && (
                  <span className="text-[10px] text-emerald-500">
                    🚀 Grande amélioration !
                  </span>
                )}

                {comparaison.nbOperations.diff <= -50 && (
                  <span className="text-[10px] text-red-400">
                    ⚠️ Forte dégradation
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-300">—</span>
            )}
          </div>
        </div>

        {/* 2. Total dépensé */}
        <div className="flex items-center justify-between py-2 border-b border-pink-50">
          <span className="text-xs text-pink-400 w-36">Total dépensé</span>

          <span className="text-xs text-gray-400">
            {comparaison.totalDepense.previous.toLocaleString(locale)} DT
          </span>

          <span className="text-xs text-gray-300">→</span>

          <span className="text-xs font-bold text-rose-900">
            {comparaison.totalDepense.current.toLocaleString(locale)} DT
          </span>

          <div className="flex flex-col items-end w-32">
            {comparaison.totalDepense.diff !== null ? (
              <>
                <span
                  className={`text-xs font-bold ${
                    comparaison.totalDepense.diff > 0
                      ? "text-emerald-500"
                      : comparaison.totalDepense.diff < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {comparaison.totalDepense.diff > 0 ? "+" : ""}
                  {comparaison.totalDepense.diff}%
                </span>

                {comparaison.totalDepense.diff >= 50 && (
                  <span className="text-[10px] text-emerald-500">
                    🚀 Grande amélioration !
                  </span>
                )}

                {comparaison.totalDepense.diff <= -50 && (
                  <span className="text-[10px] text-red-400">
                    ⚠️ Forte dégradation
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-300">—</span>
            )}
          </div>
        </div>

        {/* 3. Score discipline */}
        <div className="flex items-center justify-between py-2 border-b border-pink-50">
          <span className="text-xs text-pink-400 w-36">Score discipline</span>

          <span className="text-xs text-gray-400">
            {comparaison.score.previous.toLocaleString(locale)}/100
          </span>

          <span className="text-xs text-gray-300">→</span>

          <span className="text-xs font-bold text-rose-900">
            {comparaison.score.current.toLocaleString(locale)}/100
          </span>

          <div className="flex flex-col items-end w-32">
            {comparaison.score.diff !== null ? (
              <>
                <span
                  className={`text-xs font-bold ${
                    comparaison.score.diff > 0
                      ? "text-emerald-500"
                      : comparaison.score.diff < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {comparaison.score.diff > 0 ? "+" : ""}
                  {comparaison.score.diff}%
                </span>

                {comparaison.score.diff >= 50 && (
                  <span className="text-[10px] text-emerald-500">
                    🚀 Grande amélioration !
                  </span>
                )}

                {comparaison.score.diff <= -50 && (
                  <span className="text-[10px] text-red-400">
                    ⚠️ Forte dégradation
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-300">—</span>
            )}
          </div>
        </div>

        {/* 4. Notes créées */}
        <div className="flex items-center justify-between py-2 border-b border-pink-50">
          <span className="text-xs text-pink-400 w-36">Notes créées</span>

          <span className="text-xs text-gray-400">
            {comparaison.nbNotes.previous.toLocaleString(locale)}
          </span>

          <span className="text-xs text-gray-300">→</span>

          <span className="text-xs font-bold text-rose-900">
            {comparaison.nbNotes.current.toLocaleString(locale)}
          </span>

          <div className="flex flex-col items-end w-32">
            {comparaison.nbNotes.diff !== null ? (
              <>
                <span
                  className={`text-xs font-bold ${
                    comparaison.nbNotes.diff > 0
                      ? "text-emerald-500"
                      : comparaison.nbNotes.diff < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {comparaison.nbNotes.diff > 0 ? "+" : ""}
                  {comparaison.nbNotes.diff}%
                </span>

                {comparaison.nbNotes.diff >= 50 && (
                  <span className="text-[10px] text-emerald-500">
                    🚀 Grande amélioration !
                  </span>
                )}

                {comparaison.nbNotes.diff <= -50 && (
                  <span className="text-[10px] text-red-400">
                    ⚠️ Forte dégradation
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-300">—</span>
            )}
          </div>
        </div>

        {/* 5. Montant non dépensé */}
        <div className="flex items-center justify-between py-2 last:border-0">
          <span className="text-xs text-pink-400 w-36">Montant non dépensé</span>

          <span className="text-xs text-gray-400">
            {comparaison.montantNonDepense.previous.toLocaleString(locale)} DT
          </span>

          <span className="text-xs text-gray-300">→</span>

          <span className="text-xs font-bold text-rose-900">
            {comparaison.montantNonDepense.current.toLocaleString(locale)} DT
          </span>

          <div className="flex flex-col items-end w-32">
            {comparaison.montantNonDepense.diff !== null ? (
              <>
                <span
                  className={`text-xs font-bold ${
                    comparaison.montantNonDepense.diff > 0
                      ? "text-emerald-500"
                      : comparaison.montantNonDepense.diff < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {comparaison.montantNonDepense.diff > 0 ? "+" : ""}
                  {comparaison.montantNonDepense.diff}%
                </span>

                {comparaison.montantNonDepense.diff >= 50 && (
                  <span className="text-[10px] text-emerald-500">
                    🚀 Grande amélioration !
                  </span>
                )}

                {comparaison.montantNonDepense.diff <= -50 && (
                  <span className="text-[10px] text-red-400">
                    ⚠️ Forte dégradation
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-300">—</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}