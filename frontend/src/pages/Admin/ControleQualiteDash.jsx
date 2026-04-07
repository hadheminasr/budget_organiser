import { useState } from "react";
import { useControle } from "../../hooks/useControle";
import { toggleBlock, deleteCompte } from "../../services/controleAPI";
import { Search, Shield, ShieldOff, Trash2, RefreshCw, X, Users, Wallet, Calendar, Activity } from "lucide-react";
import SharedCard from "../../SharedComponents/SharedCard";
import SharedButton from "../../SharedComponents/SharedButton";
import SharedInput from "../../SharedComponents/SharedInput";

//badge coloré
function Badge({ label }) {
  const colors = {
    budget:   "bg-red-100 text-red-600",
    anomalie: "bg-orange-100 text-orange-600",
    inactif:  "bg-gray-100 text-gray-500",
    bloqué:   "bg-purple-100 text-purple-600",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${colors[label] ?? "bg-gray-100 text-gray-500"}`}>
      {label}
    </span>
  );
}

// ── panel détail compte
function DetailPanel({ account, onClose, onToggle, onDelete, actionLoading }) {
  if (!account) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* overlay */}
      <div className="flex-1 bg-black/20" onClick={onClose} />

      {/* panel */}
      <div className="w-96 bg-white shadow-2xl flex flex-col h-full overflow-y-auto">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">{account.nomCompte}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">

          {/* statut + score */}
          <div className="grid grid-cols-2 gap-3">
            <SharedCard
              title="Statut"
              value={account.status === "active" ? "✅ Actif" : "🔒 Bloqué"}
              changeType={account.status === "active" ? "positive" : "negative"}
            />
            <SharedCard
              title="Score santé"
              value={`${account.scoreSante}/100`}
              changeType={account.scoreSante >= 80 ? "positive" : account.scoreSante >= 50 ? "neutral" : "negative"}
            />
          </div>

          {/* infos */}
          <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Membres
              </span>
              <span className="font-semibold">{account.nbMembres}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Solde
              </span>
              <span className="font-semibold">{account.solde?.toLocaleString("fr-FR")} DT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Reste
              </span>
              <span className="font-semibold">{account.reste?.toLocaleString("fr-FR")} DT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Dernier reset
              </span>
              <span className="font-semibold">{account.lastResetMonth ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Actif 7j
              </span>
              <span className={`font-semibold ${account.estActif7j ? "text-emerald-600" : "text-red-500"}`}>
                {account.estActif7j ? "Oui" : "Non"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-semibold">{account.type === "shared" ? "Partagé" : "Personnel"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email créateur</span>
              <span className="font-semibold text-xs">{account.emailCreateur}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dépassement budget</span>
              <span className={`font-semibold ${account.aDepasseBudget ? "text-red-500" : "text-emerald-600"}`}>
                {account.aDepasseBudget ? "Oui ❌" : "Non ✅"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Anomalie détectée</span>
              <span className={`font-semibold ${account.aAnomalie ? "text-orange-500" : "text-emerald-600"}`}>
                {account.aAnomalie ? "Oui ⚠️" : "Non ✅"}
              </span>
            </div>
          </div>

          {/* badges */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Badges</p>
            <div className="flex gap-1 flex-wrap">
              {account.badges.length > 0
                ? account.badges.map(b => <Badge key={b} label={b} />)
                : <span className="text-xs text-gray-300">Aucun problème détecté</span>}
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-col gap-2 mt-2">
            <SharedButton
              variant={account.status === "active" ? "danger" : "secondary"}
              icon={account.status === "active" ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              onClick={() => onToggle(account._id, account.status === "blocked")}
              loading={actionLoading === account._id}>
              {account.status === "active" ? "Bloquer le compte" : "Débloquer le compte"}
            </SharedButton>

            <SharedButton
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => onDelete(account._id, account.nomCompte)}
              loading={actionLoading === account._id}>
              Supprimer le compte
            </SharedButton>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function GestionControle() {
  const { data, loading, error, filters, setFilters, reload } = useControle();
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleToggle = async (accountId, isBlocked) => {
    setActionLoading(accountId);
    try {
      await toggleBlock(accountId, isBlocked);
      await reload();
      setSelectedAccount(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (accountId, nomCompte) => {
    if (!window.confirm(`Supprimer le compte "${nomCompte}" ?`)) return;
    setActionLoading(accountId);
    try {
      await deleteCompte(accountId);
      await reload();
      setSelectedAccount(null);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
      Chargement...
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-sm p-4 bg-red-50 rounded-xl">{error}</div>
  );

  if (!data) return null;

  const { kpis, accounts } = data;

  return (
    <div className="flex flex-col gap-6">

      {/* ── KPIs */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        <SharedCard title="Total comptes"    value={kpis.totalComptes} icon={Users} iconColor="blue" />
        <SharedCard title="Comptes actifs"   value={kpis.comptesActifs}   icon={Shield}   iconColor="emerald"
          change="comptes non bloqués" changeType="positive" />
        <SharedCard title="Comptes bloqués"  value={kpis.comptesBloqués}  icon={ShieldOff} iconColor="red"
          change="accès restreint" changeType="negative" />
        <SharedCard title="Taux d'activité" value={`${kpis.tauxActivite}%`}
          change="actifs ces 7 derniers jours" changeType={kpis.tauxActivite >= 50 ? "positive" : "negative"} />
        <SharedCard title="Santé moyenne"   value={`${kpis.santeMoyenne}/100`}
          changeType={kpis.santeMoyenne >= 70 ? "positive" : "negative"}
          change={kpis.santeMoyenne >= 70 ? "Bonne santé" : "À surveiller"} />
        <SharedCard title="Comptes partagés" value={kpis.comptesPartages} />
        <SharedCard title="% Dormants"       value={`${kpis.pctDormants}%`}
          change="sans activité 7j" changeType="negative" />
        <SharedCard title="% Dépassement"    value={`${kpis.pctDepassement}%`}
          change="budget dépassé" changeType={kpis.pctDepassement > 10 ? "negative" : "neutral"} />
        <SharedCard title="% Anomalies"      value={`${kpis.pctAnomalies}%`}
          change="dépenses anormales" changeType={kpis.pctAnomalies > 5 ? "negative" : "positive"} />
      </div>

      {/* ── FILTRES */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 min-w-48">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <SharedInput
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="text-sm outline-none flex-1 bg-transparent"
          />
        </div>

        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none cursor-pointer">
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="blocked">Bloqués</option>
        </select>

        <select
          value={filters.badge}
          onChange={e => setFilters(f => ({ ...f, badge: e.target.value }))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none cursor-pointer">
          <option value="">Tous les badges</option>
          <option value="budget">Dépassement budget</option>
          <option value="anomalie">Anomalie</option>
          <option value="inactif">Inactif</option>
          <option value="bloqué">Bloqué</option>
        </select>

        <SharedButton
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={reload}
          className="!w-auto px-4 py-2">
          Actualiser
        </SharedButton>
      </div>

      {/* ── TABLEAU */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Compte</th>
                <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Email</th>
                <th className="text-center text-xs text-gray-500 font-semibold px-4 py-3">Membres</th>
                <th className="text-center text-xs text-gray-500 font-semibold px-4 py-3">Type</th>
                <th className="text-center text-xs text-gray-500 font-semibold px-4 py-3">Statut</th>
                <th className="text-center text-xs text-gray-500 font-semibold px-4 py-3">Santé</th>
                <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Badges</th>
                <th className="text-center text-xs text-gray-500 font-semibold px-4 py-3">Détail</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr
                  key={account._id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedAccount(account)}>

                  <td className="px-4 py-3 font-semibold text-gray-800">{account.nomCompte}</td>

                  <td className="px-4 py-3 text-gray-500 text-xs">{account.emailCreateur}</td>

                  <td className="px-4 py-3 text-center text-gray-600">{account.nbMembres}</td>

                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                      ${account.type === "shared" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                      {account.type === "shared" ? "Partagé" : "Personnel"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                      ${account.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                      {account.status === "active" ? "✅ Actif" : "🔒 Bloqué"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold
                      ${account.scoreSante >= 80 ? "text-emerald-600" :
                        account.scoreSante >= 50 ? "text-amber-500" : "text-red-500"}`}>
                      {account.scoreSante}/100
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {account.badges.length > 0
                        ? account.badges.map(b => <Badge key={b} label={b} />)
                        : <span className="text-xs text-gray-300">—</span>}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedAccount(account); }}
                      className="text-xs text-blue-500 hover:underline cursor-pointer">
                      Voir →
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-gray-400 text-sm">Aucun compte trouvé</p>
          </div>
        )}
      </div>

      {/* ── PANEL DÉTAIL */}
      {selectedAccount && (
        <DetailPanel
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onToggle={handleToggle}
          onDelete={handleDelete}
          actionLoading={actionLoading}
        />
      )}

    </div>
  );
}