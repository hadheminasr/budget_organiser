import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOperations } from "../../hooks/UseOperations";
import { useCategories } from "../../hooks/useCategory";
import { useTranslation } from "react-i18next"; // ← ajout
import { fetchOperationsGrouped, addOperation, updateOperation, deleteOperation } from "../../services/operationAPI";
import { Plus, Pencil, Trash2, TrendingDown } from "lucide-react";
import SharedButton from "../../SharedComponents/SharedButton";
import SharedInput  from "../../SharedComponents/SharedInput";
import SharedModal  from "../../SharedComponents/SharedModal";

function OperationModal({ onClose, onSave, categories, initial = null }) {
  const { t } = useTranslation(); // ← ajout
  const [form, setForm] = useState({
    amount:      initial?.amount      ?? "",
    description: initial?.description ?? "",
    date:        initial?.date
      ? new Date(initial.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    categoryId:  initial?.IdCategory?._id ?? "",
  });

  return (
    <SharedModal
      title={initial ? t("operations.modal.editTitle") : t("operations.modal.addTitle")}
      onClose={onClose}
      onSubmit={() => {
        if (!form.amount || !form.categoryId) return;
        onSave(form);
        onClose();
      }}
      submitLabel={initial ? t("operations.modal.edit") : t("operations.modal.add")}
      submitDisabled={!form.amount || !form.categoryId}>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("operations.modal.amount")}
        </label>
        <SharedInput
          type="number"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          placeholder="0.00"
          className="!mb-0"
        />
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("operations.modal.description")}
        </label>
        <SharedInput
          type="text"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder={t("operations.modal.descriptionPlaceholder")}
          className="!mb-0"
        />
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("operations.modal.category")}
        </label>
        <select
          value={form.categoryId}
          onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
          className="w-full border border-pink-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-400 bg-white cursor-pointer">
          <option value="">{t("operations.modal.categoryPlaceholder")}</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("operations.modal.date")}
        </label>
        <SharedInput
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          className="!mb-0"
        />
      </div>

    </SharedModal>
  );
}

export default function Operations() {
  const { t }    = useTranslation(); // ← ajout
  const { user } = useAuth();
  const { categories }                       = useCategories();
  const { operations, loading, error, setOperations } = useOperations();
  const locale = t("common.locale");

  const [showModal, setShowModal] = useState(false);
  const [editingOp, setEditingOp] = useState(null);

  const handleAdd = async (form) => {
    await addOperation(user.accountId, form);
    const groups = await fetchOperationsGrouped(user.accountId);
    setOperations(groups);
  };

  const handleUpdate = async (form) => {
    await updateOperation(editingOp._id, form);
    const groups = await fetchOperationsGrouped(user.accountId);
    setOperations(groups);
    setEditingOp(null);
  };

  const handleDelete = async (opId) => {
    if (!window.confirm(t("operations.deleteConfirm"))) return;
    await deleteOperation(opId);
    const groups = await fetchOperationsGrouped(user.accountId);
    setOperations(groups);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
      {t("common.loading")}
    </div>
  );

  if (error) return (
    <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl border border-red-100">
      {error}
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-rose-900">{t("operations.title")}</h1>
          <p className="text-xs text-pink-300">
            {t("operations.count", { count: operations?.length })}
          </p>
        </div>
        <div className="w-auto">
          <SharedButton
            variant="primary"
            onClick={() => setShowModal(true)}
            icon={<Plus className="w-4 h-4" />}
            className="!w-auto px-4 py-2.5 text-sm">
          </SharedButton>
        </div>
      </div>

      {/* LISTE */}
      {operations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-pink-300 text-sm">{t("operations.noOperations")}</p>
          <p className="text-pink-200 text-xs mt-1">{t("operations.noOperationsHint")}</p>
        </div>
      ) : (
        operations.map(({ info, ops, total }) => {
          const totalDepense = total;
          const budget  = info?.budget ?? 0;
          const reste   = budget - totalDepense;
          const percent = budget > 0 ? Math.min(100, (totalDepense / budget) * 100) : 0;

          return (
            <div key={info?._id ?? "none"} className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">

              {/* Header catégorie */}
              <div className="px-5 py-4 bg-pink-50 border-b border-pink-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: info?.color ?? "#D7A4A6" }} />
                    <span className="font-semibold text-sm text-rose-900">{info?.name}</span>
                  </div>
                  <span className="text-xs text-pink-300">
                    {t("operations.count", { count: ops.length })}
                  </span>
                </div>

                {/* Barre budget */}
                {budget > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-pink-400">
                        {t("operations.spent", { amount: totalDepense.toLocaleString(locale) })}
                      </span>
                      <span className={reste >= 0 ? "text-emerald-500" : "text-red-400"}>
                        {reste >= 0
                          ? t("operations.remaining", { amount: reste.toLocaleString(locale) })
                          : t("operations.exceeded",  { amount: Math.abs(reste).toLocaleString(locale) })}
                      </span>
                    </div>
                    <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${reste >= 0 ? "bg-pink-400" : "bg-red-400"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-pink-300 mt-1">
                      {t("operations.budget", { amount: budget.toLocaleString(locale) })}
                    </p>
                  </div>
                )}
              </div>

              {/* Liste opérations */}
              <div className="flex flex-col divide-y divide-pink-50">
                {ops.map(op => (
                  <div key={op._id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-pink-50/50 transition">

                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-bold text-red-400">
                        -{op.amount.toLocaleString(locale)} DT
                      </div>
                      <div className="text-xs text-pink-300">
                        {new Date(op.date).toLocaleDateString(locale, {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => { setEditingOp(op); setShowModal(true); }}
                        className="p-1.5 text-pink-300 hover:text-pink-500 cursor-pointer transition rounded-lg hover:bg-pink-50">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button"
                        onClick={() => handleDelete(op._id)}
                        className="p-1.5 text-pink-300 hover:text-red-400 cursor-pointer transition rounded-lg hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Total catégorie */}
              <div className="px-5 py-2 bg-pink-50/50 border-t border-pink-100 flex justify-between">
                <span className="text-xs text-pink-300">{t("operations.totalSpent")}</span>
                <span className="text-xs font-bold text-red-400">
                  -{totalDepense.toLocaleString(locale)} DT
                </span>
              </div>

            </div>
          );
        })
      )}

      {/* MODAL */}
      {showModal && (
        <OperationModal
          onClose={() => { setShowModal(false); setEditingOp(null); }}
          onSave={editingOp ? handleUpdate : handleAdd}
          categories={categories}
          initial={editingOp}
        />
      )}

    </div>
  );
}
