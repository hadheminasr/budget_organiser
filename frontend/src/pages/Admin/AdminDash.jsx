import { useState } from "react";
import SharedTabButton from "../../SharedComponents/SharedTabButton";
import VueGlobale from "./VueGlobale";
import ActiviteComportement from "./ActiviteDash";
import GestionControle from "./ControleQualiteDash";
import FinancierDash from "./FinancierDash";

export default function AdminDash() {
  const [activeTab, setActiveTab] = useState("vue-globale");

  return (
    <div>
      <h1 className="text-[26px] font-bold text-[#2c2420] mb-6">
        Statistiques globales
      </h1>

      <div className="flex gap-1 border-b-2 border-[#e5e0db] mb-7">
        <SharedTabButton
          label="Vue globale"
          tab="vue-globale"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <SharedTabButton
          label="Activité & comportement"
          tab="activite"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <SharedTabButton
          label="Financier"
          tab="financier"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <SharedTabButton
          label="Gestion & contrôle"
          tab="gestion"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {activeTab === "vue-globale" && <VueGlobale />}
      {activeTab === "activite" && <ActiviteComportement />}
      {activeTab === "financier" && <FinancierDash />}
      {activeTab === "gestion" && <GestionControle />}
    </div>
  );
}