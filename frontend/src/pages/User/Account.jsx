import { useState } from "react";
import { useAccount } from "../../hooks/UseAccount";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {Briefcase, Users, Activity, Heart,Pencil, Check, X, Copy, Trash2, ShieldAlert} from "lucide-react";
import { renameAccount, removeMember, deleteAccount } from "../../services/accountAPI";
import SharedButton from "../../SharedComponents/SharedButton";
import SharedInput  from "../../SharedComponents/SharedInput";
import SharedCard   from "../../SharedComponents/SharedCard";

export default function Account() {
  const { t, i18n }    = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { account, loading, error, setAccount } = useAccount(user?.accountId);

  const [editingName, setEditingName]         = useState(false);
  const [tempName, setTempName]               = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput]         = useState("");

  //Sante cote UI
  const healthScore = account
    ? Math.min(100, (account.solde > 0 ? 40 : 10) + (account.Users.length > 1 ? 30 : 20) + 30)
    : 0;
  const healthLabel =
    healthScore >= 80 ? { text: t("account.health.excellent"), color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-400" } :
    healthScore >= 60 ? { text: t("account.health.good"),      color: "text-blue-500",    bg: "bg-blue-50",    border: "border-blue-200",    bar: "bg-blue-400"    } :
                        { text: t("account.health.improve"),   color: "text-orange-500",  bg: "bg-orange-50",  border: "border-orange-200",  bar: "bg-orange-400"  };

  //Handlers
  const handleRename = async () => {
    if (!tempName.trim()) return;
    try {
      const updated = await renameAccount(account._id, tempName.trim());
      console.log("updated reçu :", updated); 
      setAccount(updated);
      setEditingName(false);
    } catch (err) {
      alert(err.response?.data?.message || t("account.errors.rename"));
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm(t("account.members.confirmRemove"))) return;
    try {
      await removeMember(account._id, memberId);
      setAccount(prev => ({
        ...prev,
        Users: prev.Users.filter(u => u._id !== memberId),
      }));
    } catch (err) {
      alert(err.response?.data?.message || t("account.errors.remove"));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== account.nameAccount) return;
    try {
      await deleteAccount(account._id);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || t("account.errors.delete"));
    }
  };

  // etats
  if (loading) return (
    <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
      {t("common.loading")}
    </div>
  );
  if (error) return (
    <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl border border-red-100">
      {error}
    </div>
  );
  if (!account) return null;

  const isOwner = account.createdBy._id === user?._id?.toString();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* ══ HEADER ══ */}
<div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm">
  
  {/* Avatar centré + infos en dessous */}
  <div className="flex flex-col items-center gap-3 mb-6">
    
    {/* Cercle avatar */}
    <div className="w-25 h-20 rounded-full border-4 border-pink-200 shadow-md overflow-hidden flex-shrink-0">
      <img
        src="../../public/avatar.png"
        alt="avatar"
        className="w-full h-full object-cover"
      />
    </div>

    {/* Nom + rename + date + badge */}
    <div className="flex flex-col items-center gap-1">

      {/* Nom + rename */}
      {editingName ? (
        <div className="flex items-center gap-2">
          <SharedInput
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            className="text-sm font-semibold !mb-0"
            autoFocus
          />
          <button
            type="button"
            onClick={handleRename}
            className="px-3 py-1.5 bg-pink-400 text-white rounded-xl text-xs font-semibold hover:bg-pink-500 cursor-pointer">
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditingName(false)}
            className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-xs hover:bg-gray-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-xl text-rose-900">{account.nameAccount}</h2>
          {isOwner && (
            <button
              type="button"
              onClick={() => { setTempName(account.nameAccount); setEditingName(true); }}
              className="text-pink-300 hover:text-pink-500 cursor-pointer transition">
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Date créé */}
      <p className="text-xs text-pink-300">
        {t("account.createdAt")} {new Date(account.createdAt).toLocaleDateString(
          i18n.language === "fr" ? "fr-FR" : "en-US",
          { day: "numeric", month: "long", year: "numeric" }
        )}
      </p>

      {/* Badge actif/bloqué */}
      <div className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 mt-1 ${
        account.isBlocked
          ? "bg-red-50 text-red-400 border-red-200"
          : "bg-emerald-50 text-emerald-500 border-emerald-200"
      }`}>
        <Activity className="w-3 h-3" />
        {account.isBlocked ? t("account.status.blocked") : t("account.status.active")}
      </div>

    </div>
  </div>

  {/* KPIs */}
  <div className="grid grid-cols-2 gap-3 mb-4">
    <SharedCard
      title={t("account.kpi.balance")}
      value={`${account.solde.toLocaleString("fr-FR")} DT`}
      icon={Activity}
      iconColor="rose"
      iconColors={{ rose: "bg-pink-50 text-pink-500" }}
    />
    <SharedCard
      title={t("account.kpi.members")}
      value={account.Users.length}
      icon={Users}
      iconColor="blue"
      iconColors={{ blue: "bg-purple-50 text-purple-400" }}
    />
    <SharedCard
      title={t("account.kpi.operations")}
      value="+0"
      icon={Activity}
      iconColor="rose"
      iconColors={{ rose: "bg-rose-50 text-rose-400" }}
    />
    <div className={`${healthLabel.bg} rounded-xl p-4 border ${healthLabel.border}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase tracking-wider text-gray-400">
          {t("account.kpi.health")}
        </p>
        <Heart className="w-4 h-4 text-gray-400" />
      </div>
      <p className={`text-lg font-bold ${healthLabel.color}`}>{healthLabel.text}</p>
      <div className="h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${healthLabel.bar}`}
          style={{ width: `${healthScore}%` }}
        />
      </div>
    </div>
  </div>
</div>
      {/* ══ MEMBRES ══ */}
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-rose-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            {t("account.members.title")}
          </h3>
          <span className="text-xs text-pink-300">
            {account.Users.length} {t("account.members.count")}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {account.Users.map(member => {
            const memberIsOwner = member._id === account.createdBy._id;
            return (
              <div key={member._id}
                className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(member.username ?? member.email)[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{member.username ?? "—"}</div>
                  <div className="text-xs text-pink-300">{member.email}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  memberIsOwner ? "bg-pink-100 text-pink-500" : "bg-purple-100 text-purple-500"
                }`}>
                  {memberIsOwner ? t("account.members.owner") : t("account.members.member")}
                </span>
                {isOwner && !memberIsOwner && (
                  <SharedButton
                    variant="ghost"
                    type="submit"
                    onClick={() => handleRemoveMember(member._id)}
                    className="!w-auto px-2 py-1 text-xs text-red-400 hover:text-red-600 border border-red-100">
                    <X className="w-3 h-3 inline mr-1" />
                    {t("account.members.remove")}
                  </SharedButton>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ ZONE DANGER ══ */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
          <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            {t("account.danger.title")}
          </h3>
          <p className="text-xs text-gray-400 mb-4">{t("account.danger.subtitle")}</p>

          {!showDeleteConfirm ? (
            <SharedButton
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
              icon={<Trash2 className="w-4 h-4 text-red-400" />}
              className="border border-red-200 bg-red-50 text-red-400 hover:bg-red-100">
              {t("account.danger.deleteBtn")}
            </SharedButton>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-red-400 font-medium">
                {t("account.danger.confirmText")} <strong>"{account.nameAccount}"</strong> :
              </p>
              <SharedInput
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder={account.nameAccount}
                className="border-red-200 focus:border-red-400"
              />
              <div className="flex gap-2">
                <SharedButton
                  variant="secondary"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                  className="flex-1">
                  {t("common.cancel")}
                </SharedButton>
                <SharedButton
                  variant="primary"
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== account.nameAccount}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="flex-1 bg-red-400 from-red-400 to-red-500">
                  {t("account.danger.confirmBtn")}
                </SharedButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}