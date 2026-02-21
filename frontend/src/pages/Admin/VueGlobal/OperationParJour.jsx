import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { LineChart } from "@mui/x-charts/LineChart";

export default function DepenseRevenuLineChart() {
  const [rows, setRows] = useState([]); // [{date, depense, revenu}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/admin/vue-globale/OperationParJour",
          { withCredentials: true }
        );

        const data = res.data?.operationsParJour7j ?? [];

        // normalisation
        setRows(
          data.map((r) => ({
            date: r.date,
            depense: Number(r.depense ?? 0),
            revenu: Number(r.revenu ?? 0),
          }))
        );
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { xLabels, depData, revData } = useMemo(() => {
    return {
      xLabels: rows.map((r) => r.date),
      depData: rows.map((r) => r.depense),
      revData: rows.map((r) => r.revenu),
    };
  }, [rows]);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>Aucune donnée (7j).</div>;

  return (
    <Box sx={{ width: "100%", height: 320 }}>
      <LineChart
        series={[
          
          { data: depData, label: "Dépenses", yAxisId: "leftAxisId" },
          
          { data: revData, label: "Revenus", yAxisId: "rightAxisId" },
        ]}
        xAxis={[{ scaleType: "point", data: xLabels, height: 28 }]}
        yAxis={[
          { id: "leftAxisId", width: 50 },
          { id: "rightAxisId", position: "right" },
        ]}
      />
    </Box>
  );
}
