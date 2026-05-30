const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];//chaque position correspond a resultat getday() de js
const HOURS = Array.from({ length: 24 }, (_, i) => i);
//indicateur d’activité comportementale
export default function HeatmapJourHeure7j({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        Aucune donnée disponible.
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value ?? 0), 0);//le spread operator transforme le tableau en valeurs séparées poru pouvoir utiliser Math.max
  //recupérer facilement le bonne cellule pour chaque case de grille
  const getCell = (dayIndex, hour) => {
    return (
      data.find(//cherche dans le tableau data un élément qui correspond au jour et à l'heure donnés
        (item) => item.day === dayIndex && item.hour === hour
      ) || { value: 0 }
    );
  };

  const getBgColor = (value) => {
    if (!value || maxValue === 0) return "#f1f5f9";//on traite les cas sans activité

    const ratio = value / maxValue;//Le ratio permet de colorer les cellules proportionnellement à la plus forte activité observée

    if (ratio >= 0.8) return "#5B7F38";
    if (ratio >= 0.6) return "#7E9B4A";
    if (ratio >= 0.4) return "#9EB36A";
    if (ratio >= 0.2) return "#BED09A";
    return "#DDE8C8";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-[360px]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          Activité par jour et heure
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Visualisation de la répartition de l’activité sur la plateforme par jour et par heure.
        </p>
      </div>
      <div className="w-full overflow-x-auto">{/**overflow-x-auto :active un scroll horizontal si le contenu dépasse La heatmap contient 24 colonnes, donc elle peut être trop large sur petit écran */}
        <div className="min-w-[760px]">{/*garder heatmap lisisble */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10" />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="w-5 text-[10px] text-slate-400 text-center"
                >
                  {hour % 2 === 0 ? hour : ""}{/*on affiche seulement les heures paires*/}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {DAY_LABELS.map((label, dayIndex) => (
                <div key={label} className="flex items-center gap-2">
                  {/*d'ici sa rep une ligne complete de la heatmap pour un jour donnée */}
                  <div className="w-10 text-xs text-slate-500">
                    {label}
                  </div>

                  {HOURS.map((hour) => {
                    const cell = getCell(dayIndex, hour);

                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        title={`${label} • ${hour}h : ${cell.value} opération(s)`}//ce que le user voire hover la cellule
                        className="w-5 h-5 rounded-[4px] border border-slate-200"
                        style={{
                          backgroundColor: getBgColor(cell.value),
                        }}
                      />
                    );
                  })}
            </div>
          ))}
        </div>
        {/**Légende de la heatmap */}
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
          <span>Faible</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => (
            <div
              key={i}
              className="w-5 h-3 rounded"
              style={{
                backgroundColor:
                  ratio === 1
                    ? "#5B7F38"
                    : ratio >= 0.8
                    ? "#7E9B4A"
                    : ratio >= 0.6
                    ? "#9EB36A"
                    : ratio >= 0.4
                    ? "#BED09A"
                    : "#DDE8C8",
              }}
            />
          ))}
          <span>Fort</span>
        </div>
      </div>
    </div>
   </div>     
  );
}