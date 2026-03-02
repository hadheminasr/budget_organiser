import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCategories } from "../../hooks/useCategory";
import { addCategory, updateCategory, deleteCategory } from "../../services/categoryAPI";
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react";

// ── Modal ajout / modification
function CategoryModal({ onClose, onSave, initial = null }) {
  const [name, setName]   = useState(initial?.name  ?? "");
  const [color, setColor] = useState(initial?.color ?? "#D7A4A6");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onSave({ name: name.trim(), color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xl w-full max-w-sm mx-4">

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-rose-900">
            {initial ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h3>
          <button type="button" onClick={onClose}
            className="text-pink-300 hover:text-pink-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nom */}
        <div className="mb-4">
          <label className="text-xs text-pink-400 font-semibold mb-1 block">Nom</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Alimentation, Transport..."
            className="w-full border border-pink-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-400"
          />
        </div>

        {/* Couleur */}
        <div className="mb-6">
          <label className="text-xs text-pink-400 font-semibold mb-1 block">Couleur</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 rounded-xl border border-pink-200 cursor-pointer"
            />
            <span className="text-sm text-gray-500 font-mono">{color}</span>
            {/* Preview */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
              style={{ backgroundColor: color }}>
              <Tag className="w-3 h-3" />
              {name || "Aperçu"}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-200 transition">
            Annuler
          </button>
          <button type="button" onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-pink-500 transition disabled:opacity-40">
            {initial ? "Modifier" : "Ajouter"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Page principale
export default function Categories() {
  const { user } = useAuth();
  const { categories, loading, error, setCategories } = useCategories();

  const [showModal, setShowModal]   = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  // ── Ajouter
  const handleAdd = async (data) => {
    const cat = await addCategory(user.accountId, data);
    setCategories(prev => [...prev, cat]);
  };

  // ── Modifier
  const handleUpdate = async (data) => {
    const cat = await updateCategory(editingCat._id, data);
    setCategories(prev => prev.map(c => c._id === cat._id ? cat : c));
    setEditingCat(null);
  };

  // ── Supprimer
  const handleDelete = async (catId) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    await deleteCategory(catId);
    setCategories(prev => prev.filter(c => c._id !== catId));
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

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* ══ HEADER ══ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-rose-900">Catégories</h1>
          <p className="text-xs text-pink-300">{categories.length} catégorie(s)</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-400 text-white rounded-xl text-sm font-semibold hover:bg-pink-500 hover:scale-105 transition cursor-pointer">
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* ══ LISTE ══ */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="text-pink-300 text-sm">Aucune catégorie pour le moment</p>
          <p className="text-pink-200 text-xs mt-1">Cliquez sur "Ajouter" pour commencer</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="flex flex-col divide-y divide-pink-50">
            {categories.map(cat => (
              <div key={cat._id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-pink-50/50 transition">

                {/* Couleur */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />

                {/* Badge nom */}
                <div className="flex-1">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-semibold"
                    style={{ backgroundColor: cat.color }}>
                    <Tag className="w-3 h-3" />
                    {cat.name}
                  </span>
                </div>

                {/* Badge default */}
                {cat.isDefault && (
                  <span className="text-[10px] px-2 py-0.5 bg-pink-100 text-pink-400 rounded-full font-semibold">
                    Défaut
                  </span>
                )}

                {/* Actions — pas de modif/suppression sur les défauts */}
                {!cat.isDefault && (
                  <div className="flex items-center gap-1">
                    <button type="button"
                      onClick={() => { setEditingCat(cat); setShowModal(true); }}
                      className="p-1.5 text-pink-300 hover:text-pink-500 cursor-pointer transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button"
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-pink-300 hover:text-red-400 cursor-pointer transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ MODAL ══ */}
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