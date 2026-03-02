
import { useState } from "react";
import { BarChart2, MessageSquare, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SharedTabButton from "../../SharedComponents/SharedTabButton";
import SharedButton from "../../SharedComponents/SharedButton";
import VueGlobale from "./VueGlobale";
import Messagerie from "./Messagerie";
import logo from "../../../public/Logo.png"; 

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("vue-globale");

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f0eb" }}>

      {/*SIDEBAR*/}
      <aside style={{
        width: 220,
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e5e0db",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
      }}>
        <div style={{ padding: "0 20px 32px" }}>
          <img src={logo} alt="logo" style={{ height: 100, width:180 }} /> 
          <div style={{ fontWeight: 700, fontSize: 18, color: "#c17a6b" }}>BudgetApp</div>
        </div>

        <SharedButton
          variant="nav"
          icon={<BarChart2 size={18} />}
          active={activeTab !== "messagerie"}
          onClick={() => setActiveTab("vue-globale")}
        >
          Statistiques
        </SharedButton>

        <SharedButton
          variant="nav"
          icon={<MessageSquare size={18} />}
          active={activeTab === "messagerie"}
          onClick={() => setActiveTab("messagerie")}
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

      {/* CONTENU PRINCIPAL  */}
      <main style={{ flex: 1, padding: "32px 40px" }}>
        {activeTab === "messagerie" && <Messagerie />}
        {activeTab !== "messagerie" && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#2c2420", marginBottom: 24 }}>
              Statistiques globales
            </h1>
            <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e5e0db", marginBottom: 28 }}>
              <SharedTabButton label="Vue globale"             tab="vue-globale"  activeTab={activeTab} setActiveTab={setActiveTab} />
              <SharedTabButton label="Activité & comportement" tab="activite"     activeTab={activeTab} setActiveTab={setActiveTab} />
              <SharedTabButton label="Financier"               tab="financier"    activeTab={activeTab} setActiveTab={setActiveTab} />
              <SharedTabButton label="Gestion & contrôle"      tab="gestion"      activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {activeTab === "vue-globale"  && <VueGlobale />}
            {activeTab === "activite"     && <ActiviteComportement />}
            {activeTab === "financier"    && <FinancierCategorisation />}
            {activeTab === "gestion"      && <GestionControle />}
          </div>
        )}

      </main>
    </div>
  );
}

