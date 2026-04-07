import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotes } from "../../hooks/UseNote";
import { useTranslation } from "react-i18next";
import { addNote, markNoteDone, deleteNote } from "../../services/NoteAPI";
import { 
  Lock, 
  Globe, 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  User,
  Tag,
  Filter,
  Search,
  X,
  ChevronDown,
  Sparkles,
  FolderOpen,
  Inbox,
  Archive
} from "lucide-react";

// ── Carte note individuelle améliorée
function NoteCard({ note, currentUserId, onToggle, onDelete }) {
  const { t } = useTranslation();
  const isOwner = note.createdBy === currentUserId;
  const [isHovered, setIsHovered] = useState(false);

  const colors = [
    { bg: "from-amber-50 to-orange-50", border: "border-amber-200", icon: "text-amber-500" },
    { bg: "from-rose-50 to-pink-50", border: "border-rose-200", icon: "text-rose-500" },
    { bg: "from-violet-50 to-purple-50", border: "border-violet-200", icon: "text-violet-500" },
    { bg: "from-emerald-50 to-teal-50", border: "border-emerald-200", icon: "text-emerald-500" },
    { bg: "from-sky-50 to-blue-50", border: "border-sky-200", icon: "text-sky-500" },
  ];
  const colorIndex = note._id?.charCodeAt(0) % colors.length ?? 0;
  const color = colors[colorIndex];

  return (
    <div 
      className={`relative rounded-2xl bg-gradient-to-br ${color.bg} border ${color.border} 
        transition-all duration-300 overflow-hidden group
        ${note.isDone ? "opacity-75" : "hover:shadow-xl hover:-translate-y-1 hover:shadow-pink-100/50"}
        ${isHovered && !note.isDone ? "scale-[1.02]" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-10 -mt-10" />
      
      <div className="p-5 relative">
        {/* Header avec badge et actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-white/60 backdrop-blur-sm ${color.icon}`}>
              {note.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full
              ${note.isPrivate 
                ? "bg-gray-100/80 text-gray-500 backdrop-blur-sm" 
                : "bg-white/80 text-pink-500 backdrop-blur-sm"}`}>
              {note.isPrivate ? t("notes.private") : t("notes.shared")}
            </span>
            {note.category && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-sm text-gray-500">
                <Tag className="w-2.5 h-2.5" />
                {note.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button 
              type="button" 
              onClick={() => onToggle(note._id)}
              className={`w-8 h-8 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer
                ${note.isDone
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-white/60 backdrop-blur-sm border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50"}`}>
              {note.isDone ? <Check className="w-4 h-4" /> : <Check className="w-4 h-4 text-gray-400" />}
            </button>

            {isOwner && (
              <button 
                type="button" 
                onClick={() => onDelete(note._id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/60 backdrop-blur-sm 
                  border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 
                  hover:bg-red-50 transition-all duration-200 cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="mb-4">
          <p className={`text-sm leading-relaxed font-medium ${note.isDone ? "line-through text-gray-500" : "text-gray-700"}`}>
            {note.content}
          </p>
        </div>

        {/* Footer avec métadonnées */}
        <div className="flex items-center justify-between pt-3 border-t border-white/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <User className="w-3 h-3" />
              <span className="font-medium">{note.createdBy?.name ?? "Moi"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(note.createdAt).toLocaleDateString(
                  t("common.locale"),
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </span>
            </div>
          </div>
          
          {note.isDone && note.doneBy?.name && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                ✅ {t("notes.doneby", { name: note.doneBy.name.split(' ')[0] })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator for done notes */}
      {note.isDone && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
      )}
    </div>
  );
}

// ── Formulaire ajout amélioré avec suggestions
function AddNoteForm({ onAdd }) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    "💰 " + t("notes.suggestions.budget"),
    "📊 " + t("notes.suggestions.expense"),
    "🎯 " + t("notes.suggestions.goal"),
    "📝 " + t("notes.suggestions.note")
  ];

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    await onAdd({ 
      content: content.trim(), 
      isPrivate,
      category: category || null
    });
    setContent("");
    setCategory("");
    setLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setContent(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-gray-700">{t("notes.newNote")}</h3>
        </div>
        
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleSubmit(); }}
          placeholder={t("notes.placeholder")}
          rows={3}
          className="w-full text-sm text-gray-700 placeholder-gray-300 resize-none outline-none bg-gray-50 rounded-xl p-3 border border-gray-100 focus:border-pink-200 focus:ring-1 focus:ring-pink-200 transition"
        />

        {/* Suggestions */}
        {showSuggestions && content === "" && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2">{t("notes.suggestions.title")}</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-pink-50 text-gray-600 hover:text-pink-600 rounded-full border border-gray-100 hover:border-pink-200 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category input */}
        <div className="mt-3">
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder={t("notes.categoryPlaceholder")}
            className="w-full text-xs text-gray-500 placeholder-gray-300 outline-none bg-transparent border-b border-gray-100 focus:border-pink-200 pb-1 transition"
          />
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-pink-50">
          <button 
            type="button" 
            onClick={() => setIsPrivate(p => !p)}
            className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer
              ${isPrivate
                ? "bg-gray-100 text-gray-600 border-gray-200"
                : "bg-pink-50 text-pink-500 border-pink-100 hover:bg-pink-100"}`}>
            {isPrivate
              ? <><Lock className="w-3.5 h-3.5" /> {t("notes.private")}</>
              : <><Globe className="w-3.5 h-3.5" /> {t("notes.shared")}</>}
          </button>

          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl text-xs font-bold hover:from-pink-500 hover:to-rose-500 transition-all duration-200 disabled:opacity-40 cursor-pointer hover:shadow-md">
            <Plus className="w-4 h-4" />
            {loading ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> : t("notes.add")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale améliorée
export default function Note() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notes, setNotes, loading, error } = useNotes();
  const [tab, setTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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
    // Tab filter
    if (tab === "shared") return !n.isPrivate;
    if (tab === "private") return n.isPrivate;
    if (tab === "done") return n.isDone;
    
    // Search filter
    if (searchQuery) {
      return n.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const counts = {
    all: notes.length,
    shared: notes.filter(n => !n.isPrivate).length,
    private: notes.filter(n => n.isPrivate).length,
    done: notes.filter(n => n.isDone).length,
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-400 border-t-transparent" />
      <p className="text-pink-400 text-sm">{t("common.loading")}</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <div className="text-red-400 text-sm">{error}</div>
    </div>
  );

  const tabs = [
    { key: "all", label: t("notes.tabs.all"), icon: Inbox },
    { key: "shared", label: t("notes.tabs.shared"), icon: Globe },
    { key: "private", label: t("notes.tabs.private"), icon: Lock },
    { key: "done", label: t("notes.tabs.done"), icon: Check },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 px-4 py-6">
      {/* HEADER avec animation */}
      <div className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-3xl bg-gradient-to-r from-rose-900 to-pink-600 bg-clip-text text-transparent">
            {t("notes.title")}
          </h1>
        </div>
        <p className="text-sm text-pink-400 mt-1">{t("notes.subtitle")}</p>
      </div>

      <AddNoteForm onAdd={handleAdd} />

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("notes.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-pink-100 rounded-xl focus:border-pink-300 focus:ring-1 focus:ring-pink-200 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-pink-100 rounded-xl hover:bg-pink-50 transition"
        >
          <Filter className="w-4 h-4 text-pink-400" />
          <span className="text-gray-600">{t("notes.filters")}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* TABS améliorés */}
      <div className="flex gap-2 flex-wrap border-b border-pink-100 pb-2">
        {tabs.map(item => {
          const Icon = item.icon;
          const isActive = tab === item.key;
          return (
            <button 
              key={item.key} 
              type="button" 
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${isActive
                  ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md"
                  : "text-pink-600 hover:bg-pink-50"}`}>
              <Icon className="w-4 h-4" />
              {item.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                ${isActive 
                  ? "bg-white/20 text-white" 
                  : "bg-pink-100 text-pink-600"}`}>
                {counts[item.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* LISTE avec animations */}
      {filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-pink-100 p-16 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-50 rounded-full mb-4">
            {tab === "done" ? (
              <Archive className="w-10 h-10 text-pink-400" />
            ) : (
              <Inbox className="w-10 h-10 text-pink-400" />
            )}
          </div>
          <p className="text-pink-400 text-base font-medium">
            {tab === "done" ? t("notes.empty.done") : t("notes.empty.default")}
          </p>
          {tab === "all" && (
            <p className="text-pink-300 text-sm mt-2 max-w-md mx-auto">
              {t("notes.empty.hint")}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((note, index) => (
            <div
              key={note._id}
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                opacity: 0
              }}
            >
              <NoteCard
                note={note}
                currentUserId={user?._id}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}