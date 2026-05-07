import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { BarChart2, MessageSquare, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SharedButton from "../SharedComponents/SharedButton";
import logo from "../../public/Logo.png";

export default function AdminLayout() {
  const [activeSection, setActiveSection] = useState("statistiques");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const goTo = (section, path) => {
    setActiveSection(section);
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-[#e5e0db]
          flex flex-col py-6 shadow-sm
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-5 pb-8 flex items-start justify-between">
          <div>
            <img src={logo} alt="logo" className="h-24 w-44 object-contain" />
            <div className="font-bold text-lg text-[#c17a6b]">
              BudgetApp
            </div>
          </div>

          <button
            className="lg:hidden p-2 rounded-xl hover:bg-rose-50"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2">
          <SharedButton
            variant="nav"
            icon={<BarChart2 size={18} />}
            active={activeSection === "statistiques"}
            onClick={() => goTo("statistiques", "/admin/dashboard")}
          >
            Statistiques
          </SharedButton>

          <SharedButton
            variant="nav"
            icon={<MessageSquare size={18} />}
            active={activeSection === "messagerie"}
            onClick={() => goTo("messagerie", "/admin/messagerie")}
          >
            Messagerie
          </SharedButton>
        </nav>

        <div className="px-3 pt-4 border-t border-[#e5e0db]">
          <SharedButton
            variant="ghost"
            icon={<LogOut size={18} />}
            onClick={handleLogout}
          >
            Déconnexion
          </SharedButton>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar mobile */}
        <header className="lg:hidden bg-white border-b border-[#e5e0db] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            className="p-2 rounded-xl hover:bg-rose-50"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <span className="font-bold text-[#c17a6b]">
            BudgetApp Admin
          </span>

          <div className="w-9" />
        </header>

        {/* Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8 xl:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}