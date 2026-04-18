import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

export default function WaterfallChart({ items = [], locale = "fr-TN" }) {
  const chartData = [];
  let running = 0;

  items.forEach((item, index) => {
    const isFirst = index === 0;
    const isLast = index === items.length - 1;

    let start;
    let end;
    let color;

    if (isFirst) {
      start = 0;
      end = item.value;
      running = item.value;
      color = "#378ADD";
    } else if (isLast) {
      start = 0;
      end = item.value;
      color = item.value >= 0 ? "#1D9E75" : "#E24B4A";
    } else {
      start = running;
      end = running + item.value;
      running = end;
      color = item.value < 0 ? "#E24B4A" : "#1D9E75";
    }

    chartData.push({
      label: item.label,
      value: item.value,
      start,
      end,
      base: Math.min(start, end),
      amount: Math.abs(end - start),
      color,
    });
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-gray-900">
          Waterfall — flux du mois
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Comment le solde s'est transformé
        </p>
      </div>

      <div className="flex gap-4 mb-3 text-[11px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ background: "#378ADD" }}
          />
          Solde départ
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ background: "#E24B4A" }}
          />
          Dépenses
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ background: "#1D9E75" }}
          />
          Reste / épargne
        </span>
      </div>

      <div className="relative w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid stroke="rgba(0,0,0,.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={55}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(value) =>
                `${Number(value).toLocaleString(locale)} DT`
              }
            />
            <Tooltip
              formatter={(value, name, props) => {
                if (name === "amount") {
                  return [
                    `${Number(props.payload.value).toLocaleString(locale)} DT`,
                    "Variation",
                  ];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `${label}`}
            />

            <Bar dataKey="base" stackId="waterfall" fill="transparent" />
            <Bar dataKey="amount" stackId="waterfall" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}