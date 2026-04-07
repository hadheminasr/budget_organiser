import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  ShieldX,
  Users,
  Wallet,
  Search,
  Filter,
  Lock,
  Unlock,
} from "lucide-react";
import SharedCard from "../../SharedComponents/SharedCard";

export default function GestionControle() {
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | active | blocked

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // adapte ces routes selon ton backend réel
        const [statsRes, accountsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/gestion-controle/stats", {
            withCredentials: true,
          }),
          axios.get("http://localhost:5000/api/admin/accounts", {
            withCredentials: true,
          }),
        ]);

        setStats(statsRes.data?.stats || null);
        setAccounts(accountsRes.data?.accounts || []);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Erreur serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleBlock = async (accountId, isBlocked) => {
    try {
      setActionLoadingId(accountId);

      const url = isBlocked
        ? `http://localhost:5000/api/admin/accounts/${accountId}/unblock`
        : `http://localhost:5000/api/admin/accounts/${accountId}/block`;

      await axios.patch(
        url,
        {},
        {
          withCredentials: true,
        }
      );

      setAccounts((prev) =>
        prev.map((acc) =>
          acc._id === accountId ? { ...acc, isBlocked: !isBlocked } : acc
        )
      );

      setStats((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          comptesBloques: isBlocked
            ? Math.max((prev.comptesBloques || 0) - 1, 0)
            : (prev.comptesBloques || 0) + 1,
          comptesActifs: isBlocked
            ? (prev.comptesActifs || 0) + 1
            : Math.max((prev.comptesActifs || 0) - 1, 0),
        };
      });
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          "Erreur lors du blocage / déblocage"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    if (filterMode === "active") {
      result = result.filter((acc) => !acc.isBlocked);
    } else if (filterMode === "blocked") {
      result = result.filter((acc) => acc.isBlocked);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (acc) =>
          acc.nomCompte?.toLowerCase().includes(term) ||
          acc._id?.toLowerCase().includes(term) ||
          acc.ownerName?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [accounts, filterMode, searchTerm]);

  const kpis = useMemo(() => {
    return [
      {
        title: "Comptes totaux",
        value: stats?.nbComptes ?? accounts.length ?? 0,
        icon: Wallet,
        iconColor: "rose",
      },
      {
        title: "Comptes actifs",
        value:
          stats?.comptesActifs ??
          accounts.filter((acc) => !acc.isBlocked).length,
        icon: ShieldCheck,
        iconColor: "emerald",
      },
      {
        title: "Comptes bloqués",
        value:
          stats?.comptesBloques ??
          accounts.filter((acc) => acc.isBlocked).length,
        icon: ShieldX,
        iconColor: "red",
      },
      {
        title: "Utilisateurs",
        value: stats?.nbUsers ?? 0,
        icon: Users,
        iconColor: "blue",
      },
    ];
  }, [stats, accounts]);

  if (loading) {
    return <div className="p-6">Chargement de Gestion & Contrôle...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 font-medium">
        Erreur : {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion & Contrôle</h1>
        <p className="text-sm text-gray-500 mt-1">
          KPIs globaux, filtre des comptes et action de blocage / déblocage.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <SharedCard key={idx} {...kpi} />
        ))}
      </div>

      {/* Barre filtre */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, owner ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            Filtre :
          </div>

          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-2 rounded-xl border text-sm ${
              filterMode === "all"
                ? "bg-pink-50 border-pink-300 text-pink-700"
                : "bg-white border-gray-200"
            }`}
          >
            Tous
          </button>

          <button
            onClick={() => setFilterMode("active")}
            className={`px-3 py-2 rounded-xl border text-sm ${
              filterMode === "active"
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-gray-200"
            }`}
          >
            Actifs
          </button>

          <button
            onClick={() => setFilterMode("blocked")}
            className={`px-3 py-2 rounded-xl border text-sm ${
              filterMode === "blocked"
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-gray-200"
            }`}
          >
            Bloqués
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tableau des comptes
          </h2>
          <p className="text-sm text-gray-500">
            {filteredAccounts.length} compte(s) affiché(s)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Nom du compte</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Nb users</th>
                <th className="text-left px-4 py-3">Solde</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Créé le</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    Aucun compte trouvé.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {acc.nomCompte || "—"}
                    </td>
                    <td className="px-4 py-3">{acc.ownerName || "—"}</td>
                    <td className="px-4 py-3">{acc.nbUsers ?? "—"}</td>
                    <td className="px-4 py-3">
                      {acc.solde !== undefined ? `${acc.solde} TND` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {acc.isBlocked ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Bloqué
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {acc.createdAt
                        ? new Date(acc.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleBlock(acc._id, acc.isBlocked)}
                        disabled={actionLoadingId === acc._id}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition ${
                          acc.isBlocked
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        } disabled:opacity-50`}
                      >
                        {acc.isBlocked ? (
                          <>
                            <Unlock className="w-4 h-4" />
                            Débloquer
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Bloquer
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}