
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShare } from "../../hooks/useShare";
import { useAuth } from "../../context/AuthContext";
import { joinAccountByCode, regenerateShareCode } from "../../services/shareAPI";
import { Copy, RefreshCw, ArrowRight, Rocket, Target, Heart } from "lucide-react";
import SharedButton from "../../SharedComponents/SharedButton";
import SharedInput  from "../../SharedComponents/SharedInput";

export default function Share() {
  const navigate            = useNavigate();
  const { user, checkAuth } = useAuth();
  const { account, loading, error, setAccount } = useShare();

  const [code, setCode]               = useState("");
  const [copied, setCopied]           = useState(false);
  const [joining, setJoining]         = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [joinMsg, setJoinMsg]         = useState(null);

  const isOwner = account?.createdBy?._id === user?._id?.toString()
               || account?.createdBy      === user?._id?.toString();

  const handleCopy = () => {
    navigator.clipboard?.writeText(account?.Sharingcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setJoining(true);
    setJoinMsg(null);
    try {
      await joinAccountByCode(code.trim());
      await checkAuth();
      setJoinMsg({ type: "success", text: "✅ Compte rejoint !" });
      setCode("");
      setTimeout(() => navigate("/user/account"), 1500);
    } catch (err) {
      setJoinMsg({ type: "error", text: err.response?.data?.message || "Code invalide" });
    } finally {
      setJoining(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm("Régénérer ? L'ancien code ne fonctionnera plus.")) return;
    setRegenerating(true);
    try {
      const newCode = await regenerateShareCode(account._id);
      setAccount(prev => ({ ...prev, Sharingcode: newCode }));
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-pink-400 text-sm">
      Chargement...
    </div>
  );
  if (error) return (
    <div className="text-red-400 text-sm p-4 bg-red-50 rounded-xl border border-red-100">
      {error}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">

      {/* ══ REJOINDRE ══ */}
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm">
        <h2 className="font-bold text-rose-900 mb-1">Rejoindre un compte</h2>
        <p className="text-xs text-pink-300 mb-4">Collez le code reçu par un proche</p>

        <div className="flex gap-3">
          <SharedInput
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: K7MX2QP4"
            className="font-mono font-bold !mb-0"
          />
          <SharedButton
            variant="primary"
            onClick={handleJoin}
            loading={joining}
            disabled={!code.trim()}
            icon={<ArrowRight className="w-4 h-4" />}
            className="!w-auto px-5">
            Rejoindre
          </SharedButton>
        </div>

        {joinMsg && (
          <p className={`text-xs mt-2 font-medium ${
            joinMsg.type === "success" ? "text-emerald-500" : "text-red-400"
          }`}>
            {joinMsg.text}
          </p>
        )}

        <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
          <p className="text-xs text-pink-500 font-medium leading-relaxed">
            <strong>Sharing is caring !</strong> Les comptes partagés atteignent leurs objectifs
            <strong> 40% plus vite</strong>. Invitez un proche et avancez ensemble.
          </p>
        </div>
      </div>

      {/* ══ MON CODE ══ */}
      {account && (
        <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm">
          <h2 className="font-bold text-rose-900 mb-1">Mon code de partage</h2>
          <p className="text-xs text-pink-300 mb-4">
            Compte actuel : <strong>{account.nameAccount}</strong>
          </p>

          {/* Code + bouton copier */}
          <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100 mb-3">
  <span className="font-mono font-bold text-2xl tracking-widest text-pink-500">
    {account.Sharingcode}
  </span>
  <button
    type="button"
    onClick={handleCopy}
    className="cursor-pointer px-4 py-2 bg-white border border-pink-200 rounded-xl text-xs font-semibold text-pink-400 hover:bg-pink-50 transition flex items-center gap-1 flex-shrink-0 z-10 relative">
    <Copy className="w-3 h-3" />
    {copied ? "Copié !" : "Copier"}
  </button>
</div>

          {/* Régénérer — owner seulement */}
          {isOwner && (
            <div className="flex flex-col gap-2 mb-4">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating}
                className="cursor-pointer w-full py-2.5 border border-pink-200 rounded-xl text-xs font-semibold text-pink-400 hover:bg-pink-50 transition flex items-center justify-center gap-2 disabled:opacity-50">
                <RefreshCw className="w-4 h-4" />
                {regenerating ? "Régénération..." : "Régénérer un nouveau code"}
              </button>
              <p className="text-[10px] text-pink-300 text-center">
                Régénérer invalide l'ancien code — les membres existants ne sont pas affectés.
              </p>
            </div>
          )}

          {/* Encouragements */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <Rocket className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-xs text-emerald-600 font-medium">
                Les duos épargnent <strong>2x plus vite</strong> grâce à la motivation mutuelle.
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Target className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-600 font-medium">
                Un objectif partagé est un objectif <strong>presque atteint</strong>.
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <Heart className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <p className="text-xs text-purple-600 font-medium">
                <strong>Sharing is caring</strong> — gérez vos finances en famille ou entre amis.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}