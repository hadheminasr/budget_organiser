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

function colorByType(type) {
  switch (type) {
    case "base":
      return "#3b82f6";
    case "allocation":
      return "#8b5cf6";
    case "spent":
      return "#f59e0b";
    case "positive":
      return "#10b981";
    case "negative":
      return "#ef4444";
    default:
      return "#64748b";
  }
}

export default function BudgetFlowChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-[360px]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          Flux budgétaire plateforme
        </h3>
        <p className="text-sm text-slate-500">
          Vue synthétique du solde, des budgets alloués, des dépenses et du reste non consommé.
        </p>
      </div>

      {!safeData.length ? (
        <div className="text-sm text-slate-400">Aucune donnée disponible.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [`${value} DT`, "Montant"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {safeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorByType(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}