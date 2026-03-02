import { useMemo } from "react";  // ← supprimer useEffect, useState, axios

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function HeatmapJourHeure({ data = [] }) {  // ← accolades
  const safeData = Array.isArray(data) ? data : [];        // ← variable simple

  const { matrix, maxCount } = useMemo(() => {
    const m = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 0;

    for (const r of safeData) {                            // ← safeData
      const day = Number(r.day);
      const hour = Number(r.hour);
      const count = Number(r.count ?? 0);
      if (day >= 0 && day <= 6 && hour >= 0 && hour <= 23) {
        m[day][hour] = count;
        if (count > max) max = count;
      }
    }

    return { matrix: m, maxCount: max };
  }, [safeData]);                                          // ← safeData

  if (!safeData.length) return <div>Aucune donnée (7j).</div>;  // ← plus de loading/error

 


  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>Heatmap activité (Jour × Heure) — 7 jours</h3>
        <small style={{ color: "#6b7280" }}>
          Plus la case est foncée, plus il y a d’opérations
        </small>
      </div>

      {/* Axe des heures */}
      <div style={styles.hoursRow}>
        <div style={{ width: 48 }} />
        {HOURS.map((h) => (
          <div key={h} style={styles.hourLabel}>
            {h % 2 === 0 ? h : ""}
          </div>
        ))}
      </div>

      {/* Lignes jours */}
      {DAYS.map((dayLabel, dayIdx) => (
        <div key={dayLabel} style={styles.row}>
          <div style={styles.dayLabel}>{dayLabel}</div>

          {HOURS.map((hour) => {
            const count = matrix[dayIdx][hour];
            const bg = colorForCount(count, maxCount);

            return (
              <div
                key={hour}
                title={`${dayLabel} à ${hour}h : ${count} opération(s)`}
                style={{
                  ...styles.cell,
                  backgroundColor: bg,
                  borderColor: count > 0 ? "#e5e7eb" : "#f3f4f6",
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Légende */}
      <div style={styles.legend}>
        <span style={{ color: "#6b7280" }}>Faible</span>
        <div style={styles.legendBar}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              style={{
                ...styles.legendCell,
                backgroundColor: colorForCount(Math.round(t * maxCount), maxCount),
              }}
            />
          ))}
        </div>
        <span style={{ color: "#6b7280" }}>Fort</span>
      </div>
    </div>
  );
}

// Couleur selon intensité (0..max)
function colorForCount(count, max) {
  if (!max || count === 0) return "#f9fafb"; // quasi blanc
  const t = count / max; // 0..1

  // Gradient simple (bleu clair -> bleu foncé)
  // (on évite libs, mais c’est propre)
  const r = Math.round(219 - 90 * t);
  const g = Math.round(234 - 120 * t);
  const b = Math.round(254 - 150 * t);

  return `rgb(${r}, ${g}, ${b})`;
}

const styles = {
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    overflowX: "auto",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 12,
  },
  hoursRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 6,
  },
  hourLabel: {
    width: 22,
    textAlign: "center",
    fontSize: 10,
    color: "#6b7280",
  },
  row: {
    display: "flex",
    alignItems: "center",
    marginBottom: 4,
  },
  dayLabel: {
    width: 48,
    fontSize: 12,
    color: "#374151",
  },
  cell: {
    width: 22,
    height: 18,
    borderRadius: 4,
    border: "1px solid",
    marginRight: 2,
  },
  legend: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    fontSize: 12,
  },
  legendBar: {
    display: "flex",
    gap: 4,
    alignItems: "center",
  },
  legendCell: {
    width: 18,
    height: 12,
    borderRadius: 4,
    border: "1px solid #e5e7eb",
  },
};
