import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";

export default function DepensesParCategorieBar({ days = 30, limit = 10 }) {
  const [rows, setRows] = useState([]); // [{label,total,count}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBar = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `http://localhost:5000/api/admin/financierCategories/depensesParCategorieBar?days=${days}&limit=${limit}`,
          { withCredentials: true }
        );

        const data = res.data?.stats?.rows ?? [];
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchBar();
  }, [days, limit]);

  const { xLabels, totals } = useMemo(() => {
    return {
      xLabels: rows.map((r) => r.label ?? "Non classée"),
      totals: rows.map((r) => Number(r.total ?? 0)),
    };
  }, [rows]);

  if (loading) return <div>Loading bar chart...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>Aucune donnée.</div>;

  return (
    <Box sx={{ width: "100%", height: 360 }}>
      <BarChart
        xAxis={[{ data: xLabels, scaleType: "band", height: 28 }]}
        series={[{ data: totals, label: "Total dépenses (DT)" }]}
        yAxis={[{ width: 60 }]}
        height={360}
      />
    </Box>
  );
}
