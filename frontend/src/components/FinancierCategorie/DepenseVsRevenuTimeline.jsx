import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { LineChart } from "@mui/x-charts/LineChart";

export default function DepenseVsRevenuTimeline({ days = 30 }) {
  const [rows, setRows] = useState([]); // [{date, depense, revenu}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLine = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `http://localhost:5000/api/admin/financierCategories/depenseVsRevenuTimeline?days=${days}`,
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

    fetchLine();
  }, [days]);

  const { xLabels, depData, revData } = useMemo(() => {
    return {
      xLabels: rows.map((r) => r.date),
      depData: rows.map((r) => Number(r.depense ?? 0)),
      revData: rows.map((r) => Number(r.revenu ?? 0)),
    };
  }, [rows]);

  if (loading) return <div>Loading timeline...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>Aucune donnée.</div>;

  return (
    <Box sx={{ width: "100%", height: 360 }}>
      <LineChart
        series={[
          { data: depData, label: "Dépenses", yAxisId: "leftAxisId" },
          { data: revData, label: "Revenus", yAxisId: "rightAxisId" },
        ]}
        xAxis={[{ scaleType: "point", data: xLabels, height: 28 }]}
        yAxis={[
          { id: "leftAxisId", width: 60 },
          { id: "rightAxisId", position: "right" },
        ]}
        height={360}
      />
    </Box>
  );
}
