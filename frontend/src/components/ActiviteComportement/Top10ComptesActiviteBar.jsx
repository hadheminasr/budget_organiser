import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";

export default function Top10ComptesParActivite7j() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/admin/ActiviteComportement/top10ComptesParActivite7j",
          { withCredentials: true }
        );

        setRows(res.data?.stats ?? []);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { xLabels, opsData } = useMemo(() => {
    return {
      xLabels: rows.map((r) => r.label ?? "Compte supprimé"),
      opsData: rows.map((r) => Number(r.nbOperations ?? 0)),
    };
  }, [rows]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>Aucune donnée.</div>;

  return (
    <Box sx={{ width: "100%", height: 360 }}>
      <BarChart
        xAxis={[{ data: xLabels, scaleType: "band", height: 40 }]}
        series={[{ data: opsData, label: "Nb opérations (7j)", id: "opsId" }]}
        yAxis={[{ width: 50 }]}
      />
    </Box>
  );
}
