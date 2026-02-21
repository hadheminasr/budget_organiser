import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import Chart, {
  ArgumentAxis,
  CommonSeriesSettings,
  Legend,
  Series,
  Tooltip,
  ValueAxis,
  ConstantLine,
  Label,
} from "devextreme-react/chart";
//helpers
function customizePercentageText({ valueText }) {
  return `${valueText}%`;
}

function customizeTooltip(pointInfo) {
  // shared tooltip: points[0] = bar, points[1] = spline
  const bar = pointInfo.points?.[0];
  const line = pointInfo.points?.[1];

  return {
    html: `
      <div style="min-width:180px">
        <div style="font-weight:600;margin-bottom:6px">${pointInfo.argumentText}</div>
        <div>
          <div><b>${bar?.seriesName ?? "Total"}</b>: ${bar?.valueText ?? "-"}</div>
          <div><b>${line?.seriesName ?? "% cumulé"}</b>: ${line?.valueText ?? "-"}%</div>
        </div>
      </div>
    `,
  };
}

export default function ParetoTopCategoriesDevExtreme() {
  const [rows, setRows] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPareto = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/admin/financierCategories/paretoTopCategories",
          { withCredentials: true }
        );
        const pareto = res.data?.stats?.pareto ?? [];//// pareto est DANS stats.pareto (pas stats directement)
        setRows(Array.isArray(pareto) ? pareto : []);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchPareto();
  }, []);

  //Adapter tes données au format du template DevExtreme
  const dataArray = useMemo(() => {
    if (!rows.length) return [];

    // sécurité: trier par total desc (normalement déjà trié backend)
    //const sorted = [...rows].sort((a, b) => Number(b.total ?? 0) - Number(a.total ?? 0));
    return rows.map((item) => ({
      complaint: item.label ?? "Non classée",               // axe X
      count: Number(item.total ?? 0),                       // bar (montant)
      cumulativePercentage: Number(item.cumPct ?? 0),       // line (0..100)
    }));
  }, [rows]);

  // Totaux (optionnel) pour afficher dans title
  const grandTotal = useMemo(() => {
    return dataArray.reduce((s, x) => s + Number(x.count ?? 0), 0);
  }, [dataArray]);

  if (loading) return <div>Loading pareto...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!dataArray.length) return <div>Aucune donnée.</div>;

  return (
    <div style={{ width: "100%" }}>
      <Chart
        title={`Pareto Dépenses par Catégorie (Total: ${grandTotal} DT)`}
        dataSource={dataArray}
        palette="Harmony Light"
        id="paretoChart"
      >
        <CommonSeriesSettings argumentField="complaint" />

        {/* Bar = Montant */}
        <Series
          name="Total dépenses (DT)"
          valueField="count"
          axis="frequency"
          type="bar"
          color="#FFB7CE"
        />

        {/* Line = % cumulé */}
        <Series
          name="% cumulé"
          valueField="cumulativePercentage"
          axis="percentage"
          type="spline"
          color="#6b71c3"
        />

        <ArgumentAxis>
          <Label overlappingBehavior="stagger" />
        </ArgumentAxis>

        {/* Axe gauche = montant */}
        <ValueAxis name="frequency" position="left" />

        {/* Axe droit = % */}
        <ValueAxis
          name="percentage"
          position="right"
          tickInterval={20}
          showZero={true}
          valueMarginsEnabled={false}
          min={0}
          max={100}
        >
          <Label customizeText={customizePercentageText} />

          {/* Ligne 80% Pareto */}
          <ConstantLine value={80} width={2} color="#fc3535" dashStyle="dash">
            <Label visible={true} text="80%" />
          </ConstantLine>
        </ValueAxis>

        <Tooltip enabled={true} shared={true} customizeTooltip={customizeTooltip} />

        <Legend verticalAlignment="top" horizontalAlignment="center" />
      </Chart>
    </div>
  );
}
