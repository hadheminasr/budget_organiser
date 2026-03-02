import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { PieChart } from "@mui/x-charts/PieChart";

export default function DonutRepartitionCategories({ days = 30, limit = 8 }) {
  const [rows, setRows] = useState([]); // [{id,label,value}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonut = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `http://localhost:5000/api/admin/financierCategories/donutRepartitionCategories?days=${days}&limit=${limit}`,
          { withCredentials: true }
        );

        const data = res.data?.stats?.data ?? [];
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchDonut();
  }, [days, limit]);

  // PieChart veut un tableau d’objets {id, value, label}
  const pieData = useMemo(() => {
    return rows.map((r, idx) => ({
      id: r.id ?? idx,
      value: Number(r.value ?? 0),
      label: r.label ?? "Non classée",
    }));
  }, [rows]);

  if (loading) return <div>Loading donut...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!pieData.length) return <div>Aucune donnée.</div>;

  return (
    <Box sx={{ width: "100%", height: 360 }}>
      <PieChart
        series={[
          {
            data: pieData,
            innerRadius: 70, // donut
            outerRadius: 130,
            paddingAngle: 2,
          },
        ]}
        height={360}
      />
    </Box>
  );
}
