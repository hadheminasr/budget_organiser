import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function HeatmapJourHeure() {
  const [rows, setRows] = useState([]); // [{day,hour,count}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/admin/vue-globale/heatmapJourHeure7j",
          { withCredentials: true }
        );

        const data = res.data?.heatmapJourHeure7j ?? [];
        setRows(
          data.map((r) => ({
            day: Number(r.day),
            hour: Number(r.hour),
            count: Number(r.count ?? 0),
          }))
        );
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, []);

  // Transforme en matrix 7x24
  const { matrix, maxCount } = useMemo(() => {
    const m = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 0;

    for (const r of rows) {
      if (r.day >= 0 && r.day <= 6 && r.hour >= 0 && r.hour <= 23) {
        m[r.day][r.hour] = r.count;
        if (r.count > max) max = r.count;
      }
    }

    return { matrix: m, maxCount: max };
  }, [rows]);

  if (loading) return <div>Loading heatmap...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

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
