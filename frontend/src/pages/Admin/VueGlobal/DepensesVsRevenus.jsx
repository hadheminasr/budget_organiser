import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";

export default function DepensesVsRevenusDonut() {
  const [rows, setRows] = useState([]); // [{name, value}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonut = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/admin/vue-globale/depensesVsRevenus",
          { withCredentials: true }
        );

        const data = res.data?.depensesVsRevenus7j ?? [];

        // Normaliser en format PieChart: { id, value, label }
        setRows(
          data.map((r, idx) => ({
            id: idx,
            value: Number(r.value ?? 0),
            label: r.name ?? "Inconnu",
          }))
        );
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchDonut();
  }, []);

  const total = useMemo(() => {
    return rows.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [rows]);

  if (loading) return <div>Loading donut...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>Aucune donnée.</div>;

  return (
    <Box sx={{ width: "100%", height: 320, position: "relative" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Répartition Dépenses vs Revenus (7j)
      </Typography>

      <PieChart
        series={[
          {
            data: rows, // [{id,value,label}]
            innerRadius: 70, //  donut
            outerRadius: 110,
            paddingAngle: 2,
            cornerRadius: 4,
          },
        ]}
        height={260}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
      />

      {/* Petit affichage du total (optionnel) */}
      <Typography
        sx={{
          position: "absolute",
          top: "52%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontWeight: 700,
        }}
      >
        {total}
      </Typography>

      <Typography
        sx={{
          position: "absolute",
          top: "62%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 12,
          color: "text.secondary",
        }}
      >
        Total
      </Typography>
    </Box>
  );
}
