import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGoals } from "../../hooks/UseGoal";
import { useTranslation } from "react-i18next"; // ← ajout
import { addGoal, updateGoal, deleteGoal } from "../../services/goalAPI";
import { Plus, Pencil, Trash2, PlusCircle } from "lucide-react";
import SharedButton from "../../SharedComponents/SharedButton";
import SharedInput from "../../SharedComponents/SharedInput";
import SharedModal from "../../SharedComponents/SharedModal";

// ── Modal ajout / modification
function GoalModal({ onClose, onSave, initial = null }) {
  const { t } = useTranslation(); // ← ajout
  const [form, setForm] = useState({
    name:         initial?.name         ?? "",
    targetAmount: initial?.targetAmount ?? "",
    TargetDate:   initial?.TargetDate   ? new Date(initial.TargetDate).toISOString().slice(0, 10) : "",
    icon:         initial?.icon         ?? "🎯",
  });

  return (
    <SharedModal
      title={initial ? t("goals.modal.editTitle") : t("goals.modal.addTitle")}
      onClose={onClose}
      onSubmit={() => { if (!form.name || !form.targetAmount) return; onSave(form); onClose(); }}
      submitLabel={initial ? t("goals.modal.edit") : t("goals.modal.create")}
      submitDisabled={!form.name || !form.targetAmount || !form.TargetDate}>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">{t("goals.modal.name")}</label>
        <SharedInput
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder={t("goals.modal.namePlaceholder")}
          className="!mb-0"
        />
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">{t("goals.modal.targetAmount")}</label>
        <SharedInput
          type="number"
          value={form.targetAmount}
          onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
          placeholder="3000"
          className="!mb-0"
        />
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">{t("goals.modal.targetDate")}</label>
        <SharedInput
          type="date"
          value={form.TargetDate}
          onChange={e => setForm(f => ({ ...f, TargetDate: e.target.value }))}
          className="!mb-0"
        />
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">{t("goals.modal.icon")}</label>
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

// ── Modal ajouter montant
function AddAmountModal({ onClose, onSave, goal }) {
  const { t } = useTranslation(); // ← ajout
  const [amount, setAmount] = useState("");
  const locale = t("common.locale");

  return (
    <SharedModal
      title={t("goals.modal.addTo", { name: goal.name })}
      onClose={onClose}
      onSubmit={() => { if (!amount) return; onSave(Number(amount)); onClose(); }}
      submitLabel={t("goals.modal.add")}
      submitDisabled={!amount}
      size="sm">

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">{t("goals.modal.targetAmount")}</label>
        <SharedInput
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
          className="!mb-0"
          autoFocus
        />
      </div>

      <p className="text-xs text-pink-300">
        {t("goals.progress", {
          current: goal.currentAmount?.toLocaleString(locale),
          target:  goal.targetAmount?.toLocaleString(locale),
        })}
      </p>

    </SharedModal>
  );
}

// ── Page principale
export default function Goals() {
  const { t }    = useTranslation(); // ← ajout
  const { user } = useAuth();
  const { goals, loading, error, setGoals } = useGoals();
  const locale   = t("common.locale");

  const [showModal,    setShowModal]    = useState(false);
  const [editingGoal,  setEditingGoal]  = useState(null);
  const [addingToGoal, setAddingToGoal] = useState(null);

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

  const handleAddAmount = async (amount) => {
    const goal = await updateGoal(addingToGoal._id, { addAmount: amount });
    setGoals(prev => prev.map(g => g._id === goal._id ? goal : g));
    setAddingToGoal(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
      {t("common.loading")}
    </div>
  );
  if (error) return (
    <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl">{error}</div>
  );

  return (
    <div className="w-full flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-rose-900">{t("goals.title")}</h1>
          <p className="text-xs text-pink-300">{t("goals.count", { count: goals.length })}</p>
        </div>
        <SharedButton
          variant="primary"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
          className="!w-auto px-4">
        </SharedButton>
      </div>

      {/* LISTE */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-pink-300 text-sm">{t("goals.noGoals")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map(goal => {
            const current = goal.currentAmount ?? 0;
            const target  = goal.targetAmount  ?? 1;
            const percent = Math.min(100, (current / target) * 100);
            const reste   = target - current;
            const months  = goal.TargetDate
              ? Math.max(0, Math.ceil((new Date(goal.TargetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
              : null;

            return (
              <div key={goal._id} className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">

                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goal.icon ?? "🎯"}</span>
                    <div>
                      <h3 className="font-bold text-sm text-rose-900">{goal.name}</h3>
                      {goal.TargetDate && (
                        <p className="text-[10px] text-pink-300">
                          {t("goals.target")} {new Date(goal.TargetDate).toLocaleDateString(locale, { month: "long", year: "numeric" })}
                          {months !== null && ` ${t("goals.monthsLeft", { count: months })}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {goal.isAchieved && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-500 border border-emerald-200 rounded-full font-semibold">
                        {t("goals.achieved")}
                      </span>
                    )}
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

                {/* Barre progression */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-pink-400">{current.toLocaleString(locale)} DT</span>
                    <span className="text-pink-300">{target.toLocaleString(locale)} DT</span>
                  </div>
                  <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${percent}%`, backgroundColor: goal.color ?? "#D7A4A6" }} />
                  </div>
                  <div className="flex justify-between text-[10px] mt-1">
                    <span className="font-bold" style={{ color: goal.color ?? "#D7A4A6" }}>
                      {percent.toFixed(0)}%
                    </span>
                    <span className="text-pink-300">
                      {t("goals.remaining", { amount: reste.toLocaleString(locale) })}
                    </span>
                  </div>
                </div>

                {/* Bouton ajouter montant */}
                {!goal.isAchieved && (
                  <SharedButton
                    type="button"
                    onClick={() => setAddingToGoal(goal)}
                    icon={<PlusCircle className="w-3.5 h-3.5" />}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-pink-200 rounded-xl text-xs text-pink-400 hover:bg-pink-50 cursor-pointer transition">
                    {t("goals.addAmount")}
                  </SharedButton>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {showModal && (
        <GoalModal
          onClose={() => { setShowModal(false); setEditingGoal(null); }}
          onSave={editingGoal ? handleUpdate : handleAdd}
          initial={editingGoal}
        />
      )}

      {addingToGoal && (
        <AddAmountModal
          onClose={() => setAddingToGoal(null)}
          onSave={handleAddAmount}
          goal={addingToGoal}
        />
      )}

    </div>
  );
}

