import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher"; 


const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

          <span className="text-[9px] uppercase tracking-widest text-pink-300 px-2 mb-1">Principal</span>

          <NavLink to="/user/dashboard"      className={navStyle}>🏠 Dashboard</NavLink>
          <NavLink to="/user/operations"     className={navStyle}>↕️ Opérations</NavLink>
          <NavLink to="/user/categories"     className={navStyle}>🏷️ Catégories</NavLink>
          <NavLink to="/user/objectifs"      className={navStyle}>🎯 Objectifs</NavLink>
          <NavLink to="/user/objectifs"      className={navStyle}>📝 Notes</NavLink>

          <span className="text-[9px] uppercase tracking-widest text-pink-300 px-2 mt-4 mb-1">Automatisation</span>

          <NavLink to="/user/abonnements"    className={navStyle}>🔄 Abonnements</NavLink>
          <NavLink to="/user/coach"          className={navStyle}>🤖 Coach Budget</NavLink>

          <span className="text-[9px] uppercase tracking-widest text-pink-300 px-2 mt-4 mb-1">Compte</span>

          <NavLink to="/user/account"         className={navStyle}>👤 Mon Compte</NavLink>
          <NavLink to="/user/partage"        className={navStyle}>👥 Partage</NavLink>

        </nav>

        {/* User card + logout */}
        <div className="px-3 pt-3 border-t border-pink-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-xl border border-pink-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{user?.username}</div>
              <div className="text-[10px] text-pink-300 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2 text-xs text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="bg-white border-b border-pink-100 px-7 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-bold text-lg text-rose-900">Bonjour, {user?.username} 👋</h1>
            <p className="text-xs text-pink-300">{new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
          </div>
          <div className="w-9 h-9 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-center text-base cursor-pointer relative">
            🔔
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
          </div>
           <div className="flex justify-end mb-4">
              <LanguageSwitcher />
           </div>
        </div>

        {/* Page content — chaque page s'affiche ici */}
        <div className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

// Style actif/inactif des liens sidebar
const navStyle = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
    isActive
      ? "bg-gradient-to-r from-pink-50 to-purple-50 text-pink-500 border-pink-200"
      : "text-rose-300 border-transparent hover:bg-pink-50 hover:text-pink-500"
  }`;

export default UserLayout;