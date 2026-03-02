import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";

export default function DepensesVsRevenusDonut({data=[]}) {
  const Data = Array.isArray(data)?data:[];
  // Normaliser en format PieChart: { id, value, label }
  const pieData =useMemo(()=>{
    return Data.map((r,idx)=>({
      id:idx,
      value:Number(r.value??0),
      label:r.name??"Inconnu",
    }));
  },[Data])

  const total = useMemo(() => {
    return Data.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [Data]);

  if (!Data.length) return <div>Aucune donnée.</div>;

  return (
    <Box sx={{ width: "100%", height: 320, position: "relative" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Répartition Dépenses vs Revenus (7j)
      </Typography>

      <PieChart
        series={[
          {
            data: Data, // [{id,value,label}]
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
