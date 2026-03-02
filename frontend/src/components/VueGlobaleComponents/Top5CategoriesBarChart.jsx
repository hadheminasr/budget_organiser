import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";

export default function Top5CategoriesBarChart({data = []}) {
  const [error,setError]=useState("");

  {/*sans useMemo 
    const xLabels = rows.map(r => r.label);
const totals  = rows.map(r => r.total);
const counts  = rows.map(r => r.count);
*/}
  const Data = Array.isArray(data) ? data : [];
  const { xLabels, totals, counts } = useMemo(() => {
    return {
      xLabels: Data.map((d) => d.label),
      totals: Data.map((d) => d.total),
      counts: Data.map((d) => d.count),
    };
  }, [Data]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!Data.length) return <div>Aucune donnée (7j).</div>;

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
