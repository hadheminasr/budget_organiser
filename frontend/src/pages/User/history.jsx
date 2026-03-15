import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next"; // ← ajout
import axios from "axios";

const ACTION_CONFIG = {
  "operation.add":    { emoji: "➕", color: "bg-red-50 text-red-400 border-red-100" },
  "operation.update": { emoji: "✏️", color: "bg-orange-50 text-orange-400 border-orange-100" },
  "operation.delete": { emoji: "🗑️", color: "bg-gray-50 text-gray-400 border-gray-100" },
  "category.add":     { emoji: "🏷️", color: "bg-purple-50 text-purple-400 border-purple-100" },
  "category.update":  { emoji: "✏️", color: "bg-purple-50 text-purple-400 border-purple-100" },
  "category.delete":  { emoji: "🗑️", color: "bg-gray-50 text-gray-400 border-gray-100" },
  "goal.add":         { emoji: "🎯", color: "bg-blue-50 text-blue-400 border-blue-100" },
  "goal.update":      { emoji: "📈", color: "bg-blue-50 text-blue-400 border-blue-100" },
  "goal.achieved":    { emoji: "🏆", color: "bg-emerald-50 text-emerald-500 border-emerald-100" },
  "goal.delete":      { emoji: "🗑️", color: "bg-gray-50 text-gray-400 border-gray-100" },
  "note.add":         { emoji: "📝", color: "bg-yellow-50 text-yellow-500 border-yellow-100" },
  "note.done":        { emoji: "✅", color: "bg-emerald-50 text-emerald-500 border-emerald-100" },
  "note.delete":      { emoji: "🗑️", color: "bg-gray-50 text-gray-400 border-gray-100" },
};

// ── label traduit depuis ACTION_CONFIG
function useActionLabel(action) {
  const { t } = useTranslation();
  return t(`history.actions_config.${action}`, { defaultValue: action });
}

// ── détail lisible selon l'action
function LogDetail({ action, details }) {
  const { t } = useTranslation();
  if (!details) return null;

  if (action === "operation.add")
    return <span>{t("history.details.operationAdd", { amount: details.amount, category: details.category })}</span>;

  if (action === "operation.update")
    return <span>{t("history.details.operationUpdate", { oldAmount: details.old?.amount, newAmount: details.new?.amount })}</span>;

  if (action === "operation.delete")
    return <span>{t("history.details.operationDelete", { amount: details.amount })}</span>;

  if (action === "category.add")
    return <span>{t("history.details.categoryAdd", { name: details.name, budget: details.budget ?? 0 })}</span>;

  if (action === "category.update")
    return <span>{t("history.details.categoryUpdate", { name: details.name, oldBudget: details.oldBudget, newBudget: details.newBudget })}</span>;

  if (action === "category.delete")
    return <span>{details.name}</span>;

  if (action === "goal.add")
    return <span>{t("history.details.goalAdd", { name: details.name, targetAmount: details.targetAmount })}</span>;

  if (action === "goal.update" || action === "goal.achieved")
    return <span>{t("history.details.goalUpdate", { name: details.name, newTotal: details.newTotal, targetAmount: details.targetAmount })}</span>;

  if (action === "goal.delete")
    return <span>{details.name}</span>;

  if (action === "note.add" || action === "note.done")
    return <span>{t("history.details.noteDone", { content: details.content })}</span>;

  return null;
}

// ── groupe les logs par date
function groupByDate(logs, locale) {
  return logs.reduce((acc, log) => {
    const date = new Date(log.createdAt).toLocaleDateString(locale, {
      day: "numeric", month: "long", year: "numeric"
    });
    acc[date] = acc[date] ?? [];
    acc[date].push(log);
    return acc;
  }, {});
}

function getAvailableMonths(logs) {
  const months = [...new Set(logs.map(l => l.month))].sort().reverse();
  return months;
}

export default function History() {
  const { t }      = useTranslation(); // ← ajout
  const { user }   = useAuth();
  const locale     = t("common.locale"); // "fr-FR" ou "en-US"

  const [logs, setLogs]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterEntity, setFilterEntity] = useState("");
  const [filterMonth, setFilterMonth]   = useState("");

  useEffect(() => {
    if (!user?.accountId) return;
    const load = async () => {
      try {
        const params = {};
        if (filterEntity) params.entity = filterEntity;
        if (filterMonth)  params.month  = filterMonth;
        const res = await axios.get(`/api/logs/${user.accountId}`, { params, withCredentials: true });
        setLogs(res.data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.accountId, filterEntity, filterMonth]);

  const availableMonths = getAvailableMonths(logs);
  const grouped         = groupByDate(logs, locale);

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
      {t("common.loading")}
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-rose-900">{t("history.title")}</h1>
          <p className="text-xs text-pink-300">{logs.length} {t("history.actions")}</p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)}
          className="border border-pink-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-400 bg-white cursor-pointer">
          <option value="">{t("history.filters.allActions")}</option>
          <option value="operation">{t("history.filters.operations")}</option>
          <option value="category">{t("history.filters.categories")}</option>
          <option value="goal">{t("history.filters.goals")}</option>
          <option value="note">{t("history.filters.notes")}</option>
        </select>

        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          className="border border-pink-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-400 bg-white cursor-pointer">
          <option value="">{t("history.filters.allMonths")}</option>
          {availableMonths.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* LISTE */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-pink-300 text-sm">{t("history.noActivity")}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, dateLogs]) => (
          <div key={date}>

            <p className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-3">{date}</p>

            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
              {dateLogs.map((log, i) => {
                const config = ACTION_CONFIG[log.action] ?? { emoji: "•", color: "bg-gray-50 text-gray-400 border-gray-100" };
                const label  = t(`history.actions_config.${log.action}`, { defaultValue: log.action });

                return (
                  <div key={log._id}
                    className={`flex items-center gap-3 px-5 py-3 hover:bg-pink-50/50 transition ${i !== 0 ? "border-t border-pink-50" : ""}`}>

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border flex-shrink-0 ${config.color}`}>
                      {config.emoji}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-rose-900">{label}</span>
                        {log.username && (
                          <span className="text-[10px] px-2 py-0.5 bg-pink-100 text-pink-400 rounded-full font-semibold">
                            {log.username}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-pink-300 mt-0.5">
                        <LogDetail action={log.action} details={log.details} />
                      </div>
                    </div>

                    <span className="text-[10px] text-pink-200 flex-shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                    </span>

                  </div>
                );
              })}
            </div>

          </div>
        ))
      )}

    </div>
  );
}
