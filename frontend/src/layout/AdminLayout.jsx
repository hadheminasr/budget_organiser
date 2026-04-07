import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { BarChart2, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SharedButton from "../SharedComponents/SharedButton";
import logo from "../../public/Logo.png";

export default function AdminLayout() {
  const [activeSection, setActiveSection] = useState("statistiques");

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f0eb" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: 220,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e0db",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
        }}
      >
        <div style={{ padding: "0 20px 32px" }}>
          <img src={logo} alt="logo" style={{ height: 100, width: 180 }} />
          <div style={{ fontWeight: 700, fontSize: 18, color: "#c17a6b" }}>
            BudgetApp
          </div>
        </div>

        <SharedButton
          variant="nav"
          icon={<BarChart2 size={18} />}
          active={activeSection === "statistiques"}
          onClick={() => {
            setActiveSection("statistiques");
            navigate("/admin/dashboard");
          }}
        >
          Statistiques
        </SharedButton>

        <SharedButton
          variant="nav"
          icon={<MessageSquare size={18} />}
          active={activeSection === "messagerie"}
          onClick={() => {
            setActiveSection("messagerie");
            navigate("/admin/messagerie");
          }}
        >
          Messagerie
        </SharedButton>

        <SharedButton
          variant="ghost"
          icon={<LogOut size={18} />}
          onClick={handleLogout}
        >
          Déconnexion
        </SharedButton>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main style={{ flex: 1, padding: "32px 40px" }}>
        <Outlet />
      </main>
    </div>
  );
}