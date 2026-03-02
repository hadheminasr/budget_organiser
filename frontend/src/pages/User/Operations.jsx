import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOperations } from "../../hooks/UseOperations";
import { fetchCategories, } from "../../services/categoryAPI";
import { addOperation, updateOperation, deleteOperation } from "../../services/operationAPI";
import { Plus, Pencil, Trash2, X, Check, TrendingUp, TrendingDown } from "lucide-react";

// ── Grouper par catégorie
const groupByCategory = (operations) => {
  return operations.reduce((groups, op) => {
    const catName = op.IdCategory?.name ?? "Sans catégorie";
    if (!groups[catName]) groups[catName] = { info: op.IdCategory, ops: [] };
    groups[catName].ops.push(op);
    return groups;
  }, {});
};

// ── Modal ajout / modification
function OperationModal({ onClose, onSave, categories, initial = null }) {
  const [form, setForm] = useState({
    amount:     initial?.amount     ?? "",
    type:       initial?.type       ?? "depense",
    date:       initial?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    categoryId: initial?.IdCategory?._id ?? "",
  });

  const handleSubmit = async () => {
    if (!form.amount || !form.categoryId) return;
    await onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xl w-full max-w-md mx-4">

        {/* Header modal */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-rose-900">
            {initial ? "Modifier l'opération" : "Nouvelle opération"}
          </h3>
          <button type="button" onClick={onClose}
            className="text-pink-300 hover:text-pink-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type */}
        <div className="flex gap-2 mb-4">
          <button type="button"
            onClick={() => setForm(f => ({ ...f, type: "depense" }))}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition cursor-pointer ${
              form.type === "depense"
                ? "bg-red-50 text-red-400 border-red-200"
                : "bg-white text-gray-400 border-gray-200"
            }`}>
            <TrendingDown className="w-4 h-4 inline mr-1" />
            Dépense
          </button>
          <button type="button"
            onClick={() => setForm(f => ({ ...f, type: "revenue" }))}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition cursor-pointer ${
              form.type === "revenue"
                ? "bg-emerald-50 text-emerald-500 border-emerald-200"
                : "bg-white text-gray-400 border-gray-200"
            }`}>
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Revenu
          </button>
        </div>

        {/* Montant */}
        <div className="mb-4">
          <label className="text-xs text-pink-400 font-semibold mb-1 block">Montant (DT)</label>
          <input
            type="number"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="0.00"
            className="w-full border border-pink-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-400"
          />
        </div>

        {/* Catégorie */}
        <div className="mb-4">
          <label className="text-xs text-pink-400 font-semibold mb-1 block">Catégorie</label>
          <select
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            className="w-full border border-pink-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-400 bg-white cursor-pointer">
            <option value="">Choisir une catégorie</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="text-xs text-pink-400 font-semibold mb-1 block">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-pink-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-200 transition">
            Annuler
          </button>
          <button type="button" onClick={handleSubmit}
            disabled={!form.amount || !form.categoryId}
            className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-pink-500 transition disabled:opacity-40 disabled:cursor-not-allowed">
            {initial ? "Modifier" : "Ajouter"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Page principale
export default function Operations() {
  const { user } = useAuth();
  const { operations, loading, error, setOperations } = useOperations();

  const [categories, setCategories]   = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [editingOp, setEditingOp]     = useState(null);

  // Charger les catégories au montage
  useState(() => {
    if (!user?.accountId) return;
    fetchCategories(user.accountId)
      .then(setCategories)
      .catch(console.error);
  });

  // ── Ajouter
  const handleAdd = async (form) => {
    const op = await addOperation(user.accountId, form);
    setOperations(prev => [op, ...prev]);
  };

  // ── Modifier
  const handleUpdate = async (form) => {
    const op = await updateOperation(editingOp._id, form);
    setOperations(prev => prev.map(o => o._id === op._id ? op : o));
    setEditingOp(null);
  };

  // ── Supprimer
  const handleDelete = async (opId) => {
    if (!window.confirm("Supprimer cette opération ?")) return;
    await deleteOperation(opId);
    setOperations(prev => prev.filter(o => o._id !== opId));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
      Chargement...
    </div>
  );
  if (error) return (
    <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl border border-red-100">
      {error}
    </div>
  );

  const grouped = groupByCategory(operations);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* ══ HEADER ══ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-rose-900">Opérations</h1>
          <p className="text-xs text-pink-300">{operations.length} opération(s)</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-semibold hover:bg-pink-500 hover:scale-105 transition cursor-pointer">
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* ══ LISTE GROUPÉE PAR CATÉGORIE ══ */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-pink-300 text-sm">Aucune opération pour le moment</p>
          <p className="text-pink-200 text-xs mt-1">Cliquez sur "Ajouter" pour commencer</p>
        </div>
      ) : (
        Object.entries(grouped).map(([catName, { info, ops }]) => (
          <div key={catName} className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">

            {/* Header catégorie */}
            <div className="flex items-center justify-between px-5 py-3 bg-pink-50 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: info?.color ?? "#D7A4A6" }}
                />
                <span className="font-semibold text-sm text-rose-900">{catName}</span>
              </div>
              <span className="text-xs text-pink-300">{ops.length} op.</span>
            </div>

            {/* Opérations */}
            <div className="flex flex-col divide-y divide-pink-50">
              {ops.map(op => (
                <div key={op._id} className="flex items-center gap-3 px-5 py-3 hover:bg-pink-50/50 transition">

                  {/* Icône type */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    op.type === "revenue" ? "bg-emerald-100" : "bg-red-100"
                  }`}>
                    {op.type === "revenue"
                      ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                      : <TrendingDown className="w-4 h-4 text-red-400" />
                    }
                  </div>

                  {/* Infos */}
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${
                      op.type === "revenue" ? "text-emerald-500" : "text-red-400"
                    }`}>
                      {op.type === "revenue" ? "+" : "-"}{op.amount.toLocaleString("fr-FR")} DT
                    </div>
                    <div className="text-xs text-pink-300">
                      {new Date(op.date).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button type="button"
                      onClick={() => { setEditingOp(op); setShowModal(true); }}
                      className="p-1.5 text-pink-300 hover:text-pink-500 cursor-pointer transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button"
                      onClick={() => handleDelete(op._id)}
                      className="p-1.5 text-pink-300 hover:text-red-400 cursor-pointer transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Total catégorie */}
            <div className="px-5 py-2 bg-pink-50/50 border-t border-pink-100 flex justify-between">
              <span className="text-xs text-pink-300">Total</span>
              <span className={`text-xs font-bold ${
                ops.reduce((s, o) => s + (o.type === "revenue" ? o.amount : -o.amount), 0) >= 0
                  ? "text-emerald-500" : "text-red-400"
              }`}>
                {ops.reduce((s, o) => s + (o.type === "revenue" ? o.amount : -o.amount), 0)
                  .toLocaleString("fr-FR")} DT
              </span>
            </div>

          </div>
        ))
      )}

      {/* ══ MODAL ══ */}
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