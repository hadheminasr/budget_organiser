import React, { useState } from "react";
import { BarChart3, MessageSquare, LogOut } from "lucide-react";
import FinancierDash from "./FinancierDash";
import ActiviteGestionDash from "./ActiviteGestionDash";
import ControleQualiteDash from "./ControleQualiteDash";
import Messagerie from "./Messagerie.jsx";
import { useAuthStore } from "../../store/authStore";
import logo from "../../../public/Logo.png";

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("statistiques");
  const { logout } = useAuthStore();

  const menuItems = [
    { id: "statistiques", label: "Statistiques", icon: BarChart3 },
    { id: "messagerie", label: "Messagerie", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
                <img
                src={logo}
                alt="Budget Organizer"
                className="w-50 h-50 rounded-lg object-contain"
                />
            </div>
        </div>


        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-rose-50 text-rose-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout en bas */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Content */}
        <div className="px-6 pb-6">
          {activeMenu === "statistiques" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <StatistiquesTabs />
            </div>
          )}

          {activeMenu === "messagerie" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold mb-4">Messagerie</h2>
                <Messagerie />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatistiquesTabs() {
  const [activeTab, setActiveTab] = useState("financier");

  const tabs = [
    { id: "financier", label: "TB Financier" },
    { id: "activite", label: "TB Activité & Gestion" },
    { id: "controle", label: "TB Contrôle & Qualité" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-rose-500 text-rose-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "financier" && <FinancierDash />}
        {activeTab === "activite" && <ActiviteGestionDash />}
        {activeTab === "controle" && <ControleQualiteDash />}
      </div>
    </div>
  );
}
