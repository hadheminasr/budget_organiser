import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next"; // ← ajout
import LanguageSwitcher from "../components/LanguageSwitcher";


import { useState, useEffect, useRef } from "react";
import { useMessages } from "../hooks/useMessages";
//import { fetchMessagesForAccount, markAsRead } from "../services/messageAPI";


const UserLayout = () => {
  
  const { t }            = useTranslation(); // ← ajout
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const locale           = t("common.locale");

  const [showPanel, setShowPanel]       = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const panelRef                        = useRef(null);

  const {
    messages,
    unreadCount,
    loading:      loadingMsg,
    loadMessages,
    handleMarkRead,
  } = useMessages();

  const handleOpenPanel = () => {
    setShowPanel(p => !p);
    if (!showPanel) loadMessages();
  };

  // fermer le panel si clic en dehors
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // charger les messages quand on ouvre le panel

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-rose-50 flex overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 lg:w-56 bg-white border-r border-pink-100
          flex flex-col py-6 shadow-sm flex-shrink-0
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Logo */}
        <div className="px-5 pb-5 border-b border-pink-100 flex items-start justify-between">
        <img
          src="/Logo.png"
          alt="Budget Organizer"
          className="h-50 w-50 object-contain"
        />

        <button
          className="lg:hidden p-2 rounded-xl hover:bg-pink-50 text-pink-400"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">

          <span className="text-[9px] uppercase tracking-widest text-pink-300 px-2 mb-1">
            {t("layout.nav.principal")}
          </span>

          
          <NavLink
            to="/user/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={navStyle}
          >
            {t("layout.nav.dashboard")}
          </NavLink>
          <NavLink to="/user/operations" onClick={() => setSidebarOpen(false)} className={navStyle}>{t("layout.nav.operations")}</NavLink>
          <NavLink to="/user/categories" onClick={() => setSidebarOpen(false)} className={navStyle}>{t("layout.nav.categories")}</NavLink>
          <NavLink to="/user/goals"    onClick={() => setSidebarOpen(false)}  className={navStyle}>{t("layout.nav.goals")}</NavLink>
          <NavLink to="/user/note"   onClick={() => setSidebarOpen(false)}    className={navStyle}>{t("layout.nav.notes")}</NavLink>
          <NavLink to="/user/report" onClick={() => setSidebarOpen(false)} className={navStyle}> {t("layout.nav.report")}</NavLink>
          <span className="text-[9px] uppercase tracking-widest text-pink-300 px-2 mt-4 mb-1">
            {t("layout.nav.automation")}
          </span>

        
          <NavLink to="/user/history"     className={navStyle}>{t("layout.nav.history")}</NavLink>
          <NavLink to="/user/coach"       className={navStyle}>{t("layout.nav.coach")}</NavLink>
          <NavLink to="/user/premium"     className={navStyle}>{t("layout.nav.premium")}</NavLink>

          <span className="text-[9px] uppercase tracking-widest text-pink-300 px-2 mt-4 mb-1">
            {t("layout.nav.account")}
          </span>

          <NavLink to="/user/account" className={navStyle}>{t("layout.nav.myAccount")}</NavLink>
          <NavLink to="/user/partage" className={navStyle}>{t("layout.nav.share")}</NavLink>

        </nav>

        {/* User card + logout */}
        <div className="px-3 pt-3 border-t border-pink-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-xl border border-pink-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-[10px] text-pink-300 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2 text-xs text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors">
            {t("layout.logout")}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="bg-white border-b border-pink-100 px-4 sm:px-7 py-4 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-pink-50 text-pink-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-lg text-rose-900">
              {t("layout.hello", { name: user?.name })}
            </h1>
            <p className="text-xs text-pink-300">
              {new Date().toLocaleDateString(locale, {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <div className="w-9 h-9 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-center text-base cursor-pointer relative">
            {/* Cloche + panel messages */}
<div className="relative" ref={panelRef}>
  <button
    onClick={handleOpenPanel}
    className="w-9 h-9 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-center text-base cursor-pointer relative hover:bg-pink-100 transition">
    🔔
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    )}
  </button>

  {/* Panel messages */}
  {showPanel && (
    <div className="absolute right-0 top-11 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-white rounded-2xl shadow-xl border border-pink-100 z-50 overflow-hidden">

      {/* header panel */}
      <div className="px-4 py-3 border-b border-pink-100 flex items-center justify-between">
        <span className="font-bold text-sm text-rose-900">
          Messages
        </span>
        {unreadCount > 0 && (
          <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full font-semibold">
            {unreadCount} non lu(s)
          </span>
        )}
      </div>

      {/* liste messages */}
      <div className="max-h-80 overflow-y-auto">
        {loadingMsg ? (
          <div className="text-center py-6 text-pink-400 text-sm">
            Chargement...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">📬</p>
            <p className="text-pink-300 text-xs">Aucun message</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg._id}
              onClick={() => !msg.isRead && handleMarkRead(msg._id)}
              className={`px-4 py-3 border-b border-pink-50 last:border-0 cursor-pointer hover:bg-pink-50 transition
                ${!msg.isRead ? "bg-pink-50/50" : ""}`}>

              {/* header message */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {/* icône type */}
                  <span className="text-xs">
                    {msg.type === "urgent"  ? "🔴" :
                     msg.type === "warning" ? "⚠️" : "ℹ️"}
                  </span>
                  <span className={`text-xs font-bold
                    ${msg.type === "urgent"  ? "text-red-500" :
                      msg.type === "warning" ? "text-amber-500" :
                      "text-blue-500"}`}>
                    {msg.subject}
                  </span>
                </div>
                {!msg.isRead && (
                  <span className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0" />
                )}
              </div>

              {/* contenu */}
              <p className="text-xs text-gray-500 line-clamp-2">
                {msg.content}
              </p>

              {/* date */}
              <p className="text-[10px] text-pink-300 mt-1">
                {new Date(msg.createdAt).toLocaleDateString(locale, {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </p>

              {/* bouton marquer lu */}
              {!msg.isRead && (
                <button
                  onClick={e => { e.stopPropagation(); handleMarkRead(msg._id); }}
                  className="text-[10px] text-pink-400 hover:text-pink-600 mt-1 cursor-pointer">
                  Marquer comme lu ✓
                </button>
              )}

            </div>
          ))
        )}
      </div>

      {/* footer */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-pink-100 text-center">
          <p className="text-[10px] text-pink-300">
            {messages.filter(m => m.isRead).length} / {messages.length} lus
          </p>
        </div>
      )}

    </div>
  )}
</div>

            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
          </div>
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-7">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

const navStyle = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
    isActive
      ? "bg-gradient-to-r from-pink-50 to-purple-50 text-pink-500 border-pink-200"
      : "text-rose-300 border-transparent hover:bg-pink-50 hover:text-pink-500"
  }`;

export default UserLayout;
