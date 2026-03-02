import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";

export default function CategoriesDistributionHistogram() {
  const [rows, setRows] = useState([]); // [{label,count}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIt = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          "http://localhost:5000/api/admin/ActiviteComportement/histogramCategoriesParCompte",
          { withCredentials: true }
        );
        const data = res.data?.stats ?? [];

        setRows(
          data.map((r) => ({
            label: String(r.label),
            count: Number(r.count ?? 0),
          }))
        );
      } catch (e) {
        setError(e?.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIt();
  }, []);

  const { xLabels, counts } = useMemo(() => {
    return {
      xLabels: rows.map((r) => r.label),
      counts: rows.map((r) => Number(r.count ?? 0)),
    };
  }, [rows]);

  if (loading) return <div>Loading histogram...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!rows.length) return <div>Aucune donnée.</div>;

  return (
    <Box sx={{ width: "100%", height: 320 }}>
      <BarChart
        xAxis={[{ data: xLabels, scaleType: "band", height: 28 }]}
        series={[{ data: counts, label: "Nb comptes" }]}
        yAxis={[{ width: 60 }]}
      />
    </Box>
  );
}
