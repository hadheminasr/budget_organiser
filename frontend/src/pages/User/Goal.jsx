import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGoals } from "../../hooks/UseGoal";
import { useTranslation } from "react-i18next";
import { addGoal, updateGoal, deleteGoal } from "../../services/goalAPI";
import { Plus, Pencil, Trash2, Trophy, Target, Clock } from "lucide-react";
import SharedButton from "../../SharedComponents/SharedButton";
import SharedInput from "../../SharedComponents/SharedInput";
import SharedModal from "../../SharedComponents/SharedModal";

// ── messages motivants selon le % de progression
function getMotivation(percent, isAchieved) {
  if (isAchieved) return { msg: "🏆 Objectif atteint ! Félicitations !", color: "text-emerald-500" };
  if (percent >= 90) return { msg: "🔥 Encore un effort, tu y es presque !", color: "text-orange-500" };
  if (percent >= 75) return { msg: "💪 Excellent progrès, continue !", color: "text-blue-500" };
  if (percent >= 50) return { msg: "⚡ Tu es à mi-chemin, ne lâche pas !", color: "text-purple-500" };
  if (percent >= 25) return { msg: "🌱 Bon début, chaque DT compte !", color: "text-teal-500" };
  return { msg: "🎯 Le voyage de mille DT commence par un seul pas !", color: "text-pink-400" };
}

// ── emoji illustration selon le nom de l'objectif
function getGoalIllustration(icon, name) {
  const illustrations = {
    "✈️": "🌍✈️🏖️", "🚗": "🚗🛣️🏁", "🏠": "🏠🔑✨",
    "📚": "📚🎓🌟", "💊": "🏥💊❤️", "🎮": "🎮🕹️🏆",
    "🐶": "🐶🐾❤️", "☕": "☕🌅😊", "🎵": "🎵🎶🎤",
    "💪": "💪🏋️🏅", "👗": "👗✨💃", "🍕": "🍕😋🎉",
  };
  return illustrations[icon] ?? `${icon}✨🌟`;
}

// ── barre de progression colorée selon %
function ProgressBar({ percent, isAchieved }) {
  const color = isAchieved     ? "#10b981" :
                percent >= 75  ? "#3b82f6" :
                percent >= 50  ? "#8b5cf6" :
                percent >= 25  ? "#f59e0b" :
                "#D7A4A6";

  return (
    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
      {/* pourcentage dans la barre si > 20% */}
      {percent > 20 && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
          {percent.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

function GoalModal({ onClose, onSave, initial = null }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    targetAmount: initial?.targetAmount ?? "",
    TargetDate: initial?.TargetDate
      ? new Date(initial.TargetDate).toISOString().slice(0, 10)
      : "",
    icon: initial?.icon ?? "🎯",
  });

  const today = new Date().toISOString().slice(0, 10);

const nameError =
  form.name.trim().length > 0 &&
  form.name.trim().length < 2;

const targetAmountError =
  form.targetAmount !== "" &&
  Number(form.targetAmount) <= 0;

const targetDateError =
  form.TargetDate && form.TargetDate <= today;

const canSubmit =
  form.name.trim().length >= 2 &&
  form.targetAmount !== "" &&
  Number(form.targetAmount) > 0 &&
  form.TargetDate &&
  form.TargetDate > today;
  return (
    <SharedModal
      title={initial ? t("goals.modal.editTitle") : t("goals.modal.addTitle")}
      onClose={onClose}
      onSubmit={() => {
        if (!canSubmit) return;

        onSave({
          ...form,
          name: form.name.trim(),
          targetAmount: Number(form.targetAmount),
        });
        onClose();
      }}
      submitLabel={initial ? t("goals.modal.edit") : t("goals.modal.create")}
      submitDisabled={!canSubmit}
    >
      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("goals.modal.name")}
        </label>
        <SharedInput
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder={t("goals.modal.namePlaceholder")}
          className="!mb-0"
        />
        {nameError && (
          <p className="text-xs text-rose-500 mt-1">
            {t("goals.errors.nameTooShort")}
          </p>
        )}
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("goals.modal.targetAmount")}
        </label>
        <SharedInput
          type="number"
          value={form.targetAmount}
          onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
          placeholder="3000"
          className="!mb-0"
        />
        {targetAmountError && (
          <p className="text-xs text-rose-500 mt-1">
            {t("goals.errors.invalidTargetAmount")}
          </p>
        )}
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("goals.modal.targetDate")}
        </label>
        <SharedInput
          type="date"
          value={form.TargetDate}
          onChange={e => setForm(f => ({ ...f, TargetDate: e.target.value }))}
          className="!mb-0"
        />
        {targetDateError && (
    <p className="text-xs text-rose-500 mt-1">
      {t("goals.errors.futureTargetDate")}
    </p>
  )}
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("goals.modal.icon")}
        </label>
        <SharedInput
          value={form.icon}
          onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
          placeholder="🎯"
          className="!mb-0"
        />
      </div>
    </SharedModal>
  );
}
// ── Page principale
export default function Goals() {
  const { t }    = useTranslation();
  const { user } = useAuth();
  const { goals, loading, error, setGoals } = useGoals();
  const locale   = t("common.locale");

  const [showModal,   setShowModal]   = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter,      setFilter]      = useState("all"); // all / active / achieved

  const handleAdd = async (data) => {
    try {
      const goal = await addGoal(user.accountId, {
        name:         data.name,
        targetAmount: Number(data.targetAmount),
        TargetDate:   data.TargetDate,
        icon:         data.icon,
      });
      setGoals(prev => [...prev, goal]);
    } catch (err) {
      console.log("erreur:", err.response?.data);
    }
  };

  const handleUpdate = async (data) => {
    const goal = await updateGoal(editingGoal._id, data);
    setGoals(prev => prev.map(g => g._id === goal._id ? goal : g));
    setEditingGoal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("goals.deleteConfirm"))) return;
    await deleteGoal(id);
    setGoals(prev => prev.filter(g => g._id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
      {t("common.loading")}
    </div>
  );
  if (error) return (
    <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl">{error}</div>
  );

  // filtrer les goals
  const filtered = goals.filter(g => {
    if (filter === "active")   return !g.isAchieved;
    if (filter === "achieved") return  g.isAchieved;
    return true;
  });

  const nbAtteints = goals.filter(g => g.isAchieved).length;
  const nbActifs   = goals.filter(g => !g.isAchieved).length;

  return (
    <div className="w-full flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-rose-900">{t("goals.title")}</h1>
          <p className="text-xs text-pink-300">
            {nbAtteints} atteint(s) · {nbActifs} en cours
          </p>
        </div>
        <SharedButton
          variant="primary"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
          className="!w-auto px-4">
        </SharedButton>
      </div>

      {/* TABS filtre */}
      <div className="flex gap-2">
        {[
          { key: "all",      label: "Tous",     count: goals.length },
          { key: "active",   label: "En cours", count: nbActifs },
          { key: "achieved", label: "Atteints", count: nbAtteints },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer
              ${filter === tab.key
                ? "bg-pink-400 text-white border-pink-400"
                : "bg-white text-pink-400 border-pink-200 hover:bg-pink-50"}`}>
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
              ${filter === tab.key ? "bg-white/30 text-white" : "bg-pink-100 text-pink-400"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* LISTE */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">
            {filter === "achieved" ? "🏆" : "🎯"}
          </p>
          <p className="text-pink-300 text-sm">
            {filter === "achieved"
              ? "Aucun objectif atteint pour le moment"
              : "Aucun objectif en cours"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(goal => {
            const current  = goal.currentAmount ?? 0;
            const target   = goal.targetAmount  ?? 1;
            const percent  = Math.min(100, Math.round((current / target) * 100));
            const reste    = target - current;
            const months   = goal.TargetDate
              ? Math.max(0, Math.ceil(
                  (new Date(goal.TargetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)
                ))
              : null;
            const motivation = getMotivation(percent, goal.isAchieved);
            const illustration = getGoalIllustration(goal.icon, goal.name);

            return (
              <div
                key={goal._id}
                className={`relative bg-white rounded-2xl border-2 shadow-sm p-5 transition-all
                  ${goal.isAchieved
                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                    : "border-pink-100 hover:shadow-lg hover:-translate-y-0.5"}`}>

                {/* badge atteint */}
                {goal.isAchieved && (
                  <div className="absolute -top-3 -right-3">
                    <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                {/* illustration + header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* grande illustration emoji */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl
                      ${goal.isAchieved ? "bg-emerald-100" : "bg-pink-50"}`}>
                      {goal.icon ?? "🎯"}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-rose-900">{goal.name}</h3>
                      {/* illustration textuelle */}
                      <p className="text-lg">{illustration}</p>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="flex gap-1">
                    <SharedButton
                      type="button"
                      variant="ghost"
                      onClick={() => { setEditingGoal(goal); setShowModal(true); }}
                      icon={<Pencil className="w-3.5 h-3.5" />}
                      className="p-1.5 text-pink-300 hover:text-pink-500 cursor-pointer transition rounded-lg hover:bg-pink-50">
                    </SharedButton>
                    <SharedButton
                      type="button"
                      variant="danger"
                      onClick={() => handleDelete(goal._id)}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      className="p-1.5 text-pink-300 hover:text-red-400 cursor-pointer transition rounded-lg hover:bg-red-50">
                    </SharedButton>
                  </div>
                </div>

                {/* montants */}
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold text-rose-900">
                    {current.toLocaleString(locale)} DT
                  </span>
                  <span className="text-pink-300">
                    sur {target.toLocaleString(locale)} DT
                  </span>
                </div>

                {/* barre progression */}
                <ProgressBar percent={percent} isAchieved={goal.isAchieved} />

                {/* infos deadline + reste */}
                <div className="flex items-center justify-between mt-3">
                  {goal.TargetDate && !goal.isAchieved && (
                    <div className="flex items-center gap-1 text-[10px] text-pink-300">
                      <Clock className="w-3 h-3" />
                      {months !== null && months > 0
                        ? `${months} mois restants`
                        : "Échéance dépassée !"}
                    </div>
                  )}
                  {!goal.isAchieved && (
                    <span className="text-[10px] text-pink-300 ml-auto">
                      encore {reste.toLocaleString(locale)} DT
                    </span>
                  )}
                </div>

                {/* message motivant */}
                <div className={`mt-3 text-[11px] font-semibold text-center py-2 px-3 rounded-xl
                  ${goal.isAchieved ? "bg-emerald-50" : "bg-pink-50"}`}>
                  <span className={motivation.color}>
                    {motivation.msg}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <GoalModal
          onClose={() => { setShowModal(false); setEditingGoal(null); }}
          onSave={editingGoal ? handleUpdate : handleAdd}
          initial={editingGoal}
        />
      )}

    </div>
  );
}