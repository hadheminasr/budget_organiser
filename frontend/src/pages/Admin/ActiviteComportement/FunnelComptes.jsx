import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function FunnelComptes() {
  const [rows, setRows] = useState([]); // [{ step, value }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFunnel = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/admin/ActiviteComportement/funnelComptes", // adapte
          { withCredentials: true }
        );

        // ✅ Postman => res.data.stats
        const data = res.data?.stats ?? [];

        setRows(
          data.map((r) => ({
            step: r.step ?? "—",
            value: Number(r.value ?? 0), // ✅ IMPORTANT
          }))
        );
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchFunnel();
  }, []);

  const maxValue = useMemo(() => {
    return rows.length ? Math.max(...rows.map((r) => r.value)) : 0;
  }, [rows]);

  if (loading) return <div>Loading funnel...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>Aucune donnée.</div>;

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = maxValue === 0 ? 0 : (r.value / maxValue) * 100;

        return (
          <div key={r.step} className="flex items-center gap-3">
            {/* label */}
            <div className="w-56 text-sm text-gray-700">{r.step}</div>

            {/* bar */}
            <div className="flex-1">
              <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-10 bg-teal-500 rounded-lg"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* value */}
            <div className="w-10 text-right font-semibold">{r.value}</div>
          </div>
        );
      })}

      <div className="text-xs text-gray-500 mt-2">
        Largeur proportionnelle au max (effet “funnel”).
      </div>
    </div>
  );
}
