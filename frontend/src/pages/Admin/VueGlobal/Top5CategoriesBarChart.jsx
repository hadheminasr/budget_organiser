import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";

export default function Top5CategoriesBarChart() {
  const [rows, setRows] = useState([]); // [{label,total,count,categoryId}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTop5 = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/admin/vue-globale/top5CategoriesDepenses",
          { withCredentials: true }
        );

        const data = res.data?.top5CategoriesDepenses7j ?? [];

        // Normaliser: toujours numbers + label
        setRows(
          data.map((r) => ({
            label: r.label ?? "Non classée",
            total: Number(r.total ?? 0),
            count: Number(r.count ?? 0),
            categoryId: r.categoryId ?? null,
          }))
        );
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchTop5();
  }, []);
  {/*sans useMemo 
    const xLabels = rows.map(r => r.label);
const totals  = rows.map(r => r.total);
const counts  = rows.map(r => r.count);
*/}
  const { xLabels, totals, counts } = useMemo(() => {
    return {
      xLabels: rows.map((r) => r.label),
      totals: rows.map((r) => r.total),
      counts: rows.map((r) => r.count),
    };
  }, [rows]);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>Aucune donnée (7j).</div>;

  return (
    <Box sx={{ width: "100%", height: 320 }}>
      <BarChart
        series={[
          { data: totals, label: "Total dépensé", id: "totalId" },
          { data: counts, label: "Nb opérations", id: "countId" },
        ]}
        xAxis={[{ data: xLabels, scaleType: "band", height: 28 }]}
        yAxis={[{ width: 60 }]}
      />
    </Box>
  );
}
