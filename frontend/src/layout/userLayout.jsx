import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next"; // ← ajout
import LanguageSwitcher from "../components/LanguageSwitcher";

const UserLayout = () => {
  const { t }            = useTranslation(); // ← ajout
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const locale           = t("common.locale");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-rose-50">

      {/* ── SIDEBAR ── */}
      <aside className="w-56 bg-white border-r border-pink-100 flex flex-col py-6 shadow-sm flex-shrink-0">

        {/* Logo */}
        <div className="px-5 pb-5 border-b border-pink-100">
          <img src="../../public/logo.png" alt="Budget Organizer" className="h-150 w-150 object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">

          <span className="text-[9px] uppercase tracking-widest text-pink-300 px-2 mb-1">
            {t("layout.nav.principal")}
          </span>

          <NavLink to="/user/dashboard"  className={navStyle}>{t("layout.nav.dashboard")}</NavLink>
          <NavLink to="/user/operations" className={navStyle}>{t("layout.nav.operations")}</NavLink>
          <NavLink to="/user/categories" className={navStyle}>{t("layout.nav.categories")}</NavLink>
          <NavLink to="/user/goals"      className={navStyle}>{t("layout.nav.goals")}</NavLink>
          <NavLink to="/user/note"       className={navStyle}>{t("layout.nav.notes")}</NavLink>

          <span className="text-[9px] uppercase tracking-widest text-pink-300 px-2 mt-4 mb-1">
            {t("layout.nav.automation")}
          </span>

        
          <NavLink to="/user/history"     className={navStyle}>{t("layout.nav.history")}</NavLink>
          <NavLink to="/user/coach"       className={navStyle}>{t("layout.nav.coach")}</NavLink>

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
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="bg-white border-b border-pink-100 px-7 py-4 flex items-center justify-between flex-shrink-0">
          <div>
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
            🔔
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
          </div>
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-7">
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
