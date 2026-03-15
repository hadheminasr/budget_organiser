import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCategories } from "../../hooks/useCategory";
import { useTranslation } from "react-i18next"; // ← ajout
import { addCategory, updateCategory, deleteCategory } from "../../services/categoryAPI";
import { Plus, Pencil, Trash2 } from "lucide-react";
import SharedButton from "../../SharedComponents/SharedButton";
import SharedInput from "../../SharedComponents/SharedInput";
import SharedModal from "../../SharedComponents/SharedModal";

const ICONS = ["🍕", "🚗", "💊", "🎮", "👗", "✈️", "🏠", "📚", "💪", "🐶", "☕", "🎵"];

function CategoryModal({ onClose, onSave, initial = null }) {
  const { t } = useTranslation(); // ← ajout
  const [name,   setName]   = useState(initial?.name   ?? "");
  const [color,  setColor]  = useState(initial?.color  ?? "#000000");
  const [budget, setBudget] = useState(initial?.budget ?? "");
  const [icon,   setIcon]   = useState(initial?.icon   ?? "🏷️");

  return (
    <SharedModal
      title={initial ? t("categories.modal.editTitle") : t("categories.modal.addTitle")}
      onClose={onClose}
      onSubmit={() => { if (!name.trim()) return; onSave({ name, color, budget: Number(budget), icon }); onClose(); }}
      submitLabel={initial ? t("categories.modal.edit") : t("categories.modal.add")}
      submitDisabled={!name.trim()}>

      {/* Nom */}
      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("categories.modal.name")}
        </label>
        <SharedInput
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t("categories.modal.namePlaceholder")}
          className="!mb-0"
        />
      </div>

      {/* Budget */}
      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("categories.modal.budget")}
        </label>
        <SharedInput
          type="number"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          placeholder="0"
          className="!mb-0"
        />
      </div>

      {/* Icône */}
      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("categories.modal.icon")}
        </label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(i => (
            <button key={i} type="button" onClick={() => setIcon(i)}
              className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition cursor-pointer
                ${icon === i ? "border-pink-400 bg-pink-50" : "border-pink-100 hover:bg-pink-50"}`}>
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Couleur + preview */}
      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          {t("categories.modal.color")}
        </label>
        <div className="flex items-center gap-3">
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-10 h-10 rounded-xl border border-pink-200 cursor-pointer" />
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
            style={{ backgroundColor: color }}>
            {icon} {name || t("categories.preview")}
          </div>
        </div>
      </div>

    </SharedModal>
  );
}

export default function Categories() {
  const { t }    = useTranslation(); // ← ajout
  const { user } = useAuth();
  const { categories, loading, error, setCategories } = useCategories();
  const locale   = t("common.locale");

  const [showModal,   setShowModal]   = useState(false);
  const [editingCat,  setEditingCat]  = useState(null);

  const handleAdd = async (data) => {
    const cat = await addCategory(user.accountId, data);
    setCategories(prev => [...prev, cat]);
  };

  const handleUpdate = async (data) => {
    const cat = await updateCategory(editingCat._id, data);
    setCategories(prev => prev.map(c => c._id === cat._id ? cat : c));
    setEditingCat(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("categories.deleteConfirm"))) return;
    await deleteCategory(id);
    setCategories(prev => prev.filter(c => c._id !== id));
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
          <h1 className="font-bold text-xl text-rose-900">{t("categories.title")}</h1>
          <p className="text-xs text-pink-300">{t("categories.count", { count: categories.length })}</p>
        </div>
        <SharedButton
          variant="primary"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
          className="!w-auto px-4">
          {t("categories.add")}
        </SharedButton>
      </div>

      {/* LISTE */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="text-pink-300 text-sm">{t("categories.noCategories")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          {categories.map(cat => (
            <div key={cat._id}
              className="flex items-center gap-3 px-5 py-4 hover:bg-pink-50/50 transition border-b border-pink-50 last:border-0">

              <span className="text-xl">{cat.icon ?? "🏷️"}</span>

              <div className="flex-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-semibold"
                  style={{ backgroundColor: cat.color }}>
                  {cat.name}
                </span>
                {cat.budget > 0 && (
                  <span className="ml-2 text-xs text-pink-300">
                    {cat.budget.toLocaleString(locale)} {t("categories.perMonth")}
                  </span>
                )}
              </div>

              {!cat.isDefault && (
                <div className="flex gap-1">
                  <SharedButton
                    type="button"
                    variant="ghost"
                    onClick={() => { setEditingCat(cat); setShowModal(true); }}
                    className="p-1.5 text-pink-300 hover:text-pink-500 cursor-pointer transition rounded-lg hover:bg-pink-50">
                    {<Pencil className="w-3.5 h-3.5" />}
                  </SharedButton>
                  <SharedButton
                    type="button"
                    variant="ghost"
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 text-pink-300 hover:text-red-400 cursor-pointer transition rounded-lg hover:bg-red-50">
                    {<Trash2 className="w-3.5 h-3.5" />}
                  </SharedButton>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <CategoryModal
          onClose={() => { setShowModal(false); setEditingCat(null); }}
          onSave={editingCat ? handleUpdate : handleAdd}
          initial={editingCat}
        />
      )}

    </div>
  );
}
