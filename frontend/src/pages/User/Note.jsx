import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotes } from "../../hooks/UseNote";
import { useTranslation } from "react-i18next"; // ← ajout
import { addNote, markNoteDone, deleteNote } from "../../services/NoteAPI";
import { Lock, Globe, Plus, Trash2, Check } from "lucide-react";

// ── Carte note individuelle
function NoteCard({ note, currentUserId, onToggle, onDelete }) {
  const { t } = useTranslation(); // ← ajout
  const isOwner = note.createdBy === currentUserId;

  const colors = [
    "bg-amber-50 border-amber-200",
    "bg-rose-50 border-rose-200",
    "bg-violet-50 border-violet-200",
    "bg-emerald-50 border-emerald-200",
    "bg-sky-50 border-sky-200",
  ];
  const colorClass = colors[note._id?.charCodeAt(0) % colors.length] ?? colors[0];

  return (
    <div className={`relative rounded-2xl border-2 p-5 transition-all duration-300 group
      ${note.isDone ? "opacity-60" : "hover:shadow-lg hover:-translate-y-0.5"}
      ${colorClass}`}>

      {/* Badge visibilité */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
          ${note.isPrivate ? "bg-gray-100 text-gray-400" : "bg-white/70 text-pink-400"}`}>
          {note.isPrivate
            ? <><Lock className="w-2.5 h-2.5" /> {t("notes.private")}</>
            : <><Globe className="w-2.5 h-2.5" /> {t("notes.shared")}</>}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button type="button" onClick={() => onToggle(note._id)}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition cursor-pointer
              ${note.isDone
                ? "bg-emerald-400 border-emerald-400 text-white"
                : "border-gray-300 hover:border-emerald-400"}`}>
            {note.isDone && <Check className="w-3.5 h-3.5" />}
          </button>

          {isOwner && (
            <button type="button" onClick={() => onDelete(note._id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <p className={`text-sm leading-relaxed ${note.isDone ? "line-through text-gray-400" : "text-gray-700"}`}>
        {note.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-[10px] text-gray-400">
          {note.createdBy?.name ?? "Moi"}
        </span>
        {note.isDone && note.doneBy?.name && (
          <span className="text-[10px] text-emerald-500 font-semibold">
            ✅ {t("notes.doneby", { name: note.doneBy.name })}
          </span>
        )}
        <span className="text-[10px] text-gray-300">
          {new Date(note.createdAt).toLocaleDateString(
            t("common.locale"),
            { day: "numeric", month: "short" }
          )}
        </span>
      </div>

    </div>
  );
}

// ── Formulaire ajout rapide
function AddNoteForm({ onAdd }) {
  const { t } = useTranslation(); // ← ajout
  const [content,   setContent]   = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    await onAdd({ content: content.trim(), isPrivate });
    setContent("");
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-pink-200 p-5 hover:border-pink-300 transition">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleSubmit(); }}
        placeholder={t("notes.placeholder")}
        rows={3}
        className="w-full text-sm text-gray-700 placeholder-gray-300 resize-none outline-none bg-transparent leading-relaxed"
      />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-pink-100">
        <button type="button" onClick={() => setIsPrivate(p => !p)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer
            ${isPrivate
              ? "bg-gray-100 text-gray-500 border-gray-200"
              : "bg-pink-50 text-pink-400 border-pink-200"}`}>
          {isPrivate
            ? <><Lock className="w-3 h-3" /> {t("notes.private")}</>
            : <><Globe className="w-3 h-3" /> {t("notes.shared")}</>}
        </button>

        <button type="button" onClick={handleSubmit}
          disabled={!content.trim() || loading}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-pink-400 text-white rounded-full text-xs font-bold hover:bg-pink-500 transition disabled:opacity-40 cursor-pointer hover:scale-105 active:scale-95">
          <Plus className="w-3.5 h-3.5" />
          {loading ? "..." : t("notes.add")}
        </button>
      </div>
    </div>
  );
}

// ── Page principale
export default function Note() {
  const { t }    = useTranslation(); // ← ajout
  const { user } = useAuth();
  const { notes, setNotes, loading, error } = useNotes();
  const [tab, setTab] = useState("all");

  const handleAdd = async (data) => {
    const note = await addNote(user.accountId, data);
    setNotes(prev => [note, ...prev]);
  };

  const handleToggle = async (noteId) => {
    const note = await markNoteDone(noteId);
    setNotes(prev => prev.map(n => n._id === noteId ? note : n));
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm(t("notes.deleteConfirm"))) return;
    await deleteNote(noteId);
    setNotes(prev => prev.filter(n => n._id !== noteId));
  };

  const filtered = notes.filter(n => {
    if (tab === "shared")  return !n.isPrivate;
    if (tab === "private") return  n.isPrivate;
    if (tab === "done")    return  n.isDone;
    return true;
  });

  const counts = {
    all:     notes.length,
    shared:  notes.filter(n => !n.isPrivate).length,
    private: notes.filter(n =>  n.isPrivate).length,
    done:    notes.filter(n =>  n.isDone).length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
      {t("common.loading")}
    </div>
  );

  if (error) return (
    <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl">{error}</div>
  );

  const tabs = [
    { key: "all",     label: t("notes.tabs.all")     },
    { key: "shared",  label: t("notes.tabs.shared")  },
    { key: "private", label: t("notes.tabs.private") },
    { key: "done",    label: t("notes.tabs.done")    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 px-2">

      {/* HEADER */}
      <div>
        <h1 className="font-bold text-2xl text-rose-900">{t("notes.title")}</h1>
        <p className="text-xs text-pink-300 mt-0.5">{t("notes.subtitle")}</p>
      </div>

      <AddNoteForm onAdd={handleAdd} />

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(item => (
          <button key={item.key} type="button" onClick={() => setTab(item.key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer
              ${tab === item.key
                ? "bg-pink-400 text-white border-pink-400"
                : "bg-white text-pink-400 border-pink-200 hover:bg-pink-50"}`}>
            {item.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
              ${tab === item.key ? "bg-white/30 text-white" : "bg-pink-100 text-pink-400"}`}>
              {counts[item.key]}
            </span>
          </button>
        ))}
      </div>

      {/* LISTE */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">{tab === "done" ? "🎉" : "📝"}</p>
          <p className="text-pink-300 text-sm">
            {tab === "done" ? t("notes.empty.done") : t("notes.empty.default")}
          </p>
          {tab === "all" && (
            <p className="text-pink-200 text-xs mt-1">{t("notes.empty.hint")}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(note => (
            <NoteCard
              key={note._id}
              note={note}
              currentUserId={user?._id}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}


