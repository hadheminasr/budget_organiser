import { useState, useEffect } from "react";
import { fetchTemplates, sendMessage, fetchAllMessages } from "../../services/messageAPI";
import { fetchControle } from "../../services/controleAPI";
import SharedButton from "../../SharedComponents/SharedButton";
import { Send, Inbox, Bell, AlertTriangle, Info } from "lucide-react";

// ── icône selon type
function TypeIcon({ type }) {
  if (type === "urgent")  return <AlertTriangle className="w-4 h-4 text-red-500" />;
  if (type === "warning") return <Bell className="w-4 h-4 text-amber-500" />;
  return <Info className="w-4 h-4 text-blue-500" />;
}

// ── badge type
function TypeBadge({ type }) {
  const styles = {
    urgent:  "bg-red-50 text-red-600",
    warning: "bg-amber-50 text-amber-600",
    info:    "bg-blue-50 text-blue-600",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${styles[type]}`}>
      {type}
    </span>
  );
}

export default function Messagerie() {
  const [templates,setTemplates]= useState([]);
  const [messages,setMessages]= useState([]);
  const [comptes,         setComptes]         = useState([]);
  const [selectedTemplate,setSelectedTemplate]= useState(null);
  const [form,            setForm]            = useState({
    to:        "all",
    accountId: "",
    subject:   "",
    content:   "",
    type:      "info",
  });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [activeTab,setActiveTab]= useState("compose"); // "compose" | "sent"

  // charger templates + messages + comptes
  useEffect(() => {
    const load = async () => {
      try {
        const [t, m, c] = await Promise.all([
          fetchTemplates(),
          fetchAllMessages(),
          fetchControle(),
        ]);
        setTemplates(t);
        setMessages(m);
        setComptes(c.accounts ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  // quand on choisit un template
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id);
    setForm(f => ({
      ...f,
      subject: template.subject,
      content: template.content,
      type:    template.type,
      to:      template.cible,
    }));
  };

  // envoyer
  const handleSend = async () => {
    if (!form.subject || !form.content) return;
    setLoading(true);
    try {
      await sendMessage({
        to:        form.to,
        accountId: form.to === "compte" ? form.accountId : null,
        subject:   form.subject,
        content:   form.content,
        type:      form.type,
      });
      setSuccess(true);
      // recharger messages
      const m = await fetchAllMessages();
      setMessages(m);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── TABS */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {[
          { key: "compose", label: "✏️ Composer" },
          { key: "sent",    label: `📬 Envoyés (${messages.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition cursor-pointer
              ${activeTab === tab.key
                ? "border-rose-400 text-rose-600"
                : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB COMPOSER */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* colonne gauche — templates */}
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-sm text-gray-700">
              Choisir un template
            </h2>
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`text-left p-3 rounded-xl border transition cursor-pointer
                  ${selectedTemplate === template.id
                    ? "border-rose-400 bg-rose-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800">
                    {template.label}
                  </span>
                  <TypeBadge type={template.type} />
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {template.subject || "Message personnalisé"}
                </p>
              </button>
            ))}
          </div>

          {/* colonne droite — formulaire */}
          <div className="sm:col-span-2 bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
            <h2 className="font-bold text-sm text-gray-700">
              Composer le message
            </h2>

            {/* cible */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">
                Destinataire
              </label>
              <select
                value={form.to}
                onChange={e => setForm(f => ({ ...f, to: e.target.value, accountId: "" }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 bg-white cursor-pointer">
                <option value="all">Tous les comptes</option>
                <option value="dormants">Comptes dormants</option>
                <option value="anomalie">Comptes avec anomalie</option>
                <option value="budget">Comptes avec dépassement</option>
                <option value="compte">Un compte spécifique</option>
              </select>
            </div>

            {/* compte spécifique */}
            {form.to === "compte" && (
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block">
                  Choisir le compte
                </label>
                <select
                  value={form.accountId}
                  onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 bg-white cursor-pointer">
                  <option value="">-- Sélectionner --</option>
                  {comptes.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.nomCompte} — {c.emailCreateur}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* type */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">
                Type
              </label>
              <div className="flex gap-2">
                {["info", "warning", "urgent"].map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer
                      ${form.type === t
                        ? t === "urgent"  ? "bg-red-50 border-red-400 text-red-600"
                        : t === "warning" ? "bg-amber-50 border-amber-400 text-amber-600"
                        : "bg-blue-50 border-blue-400 text-blue-600"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                    <TypeIcon type={t} />
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* sujet */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">
                Sujet
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Sujet du message..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400"
              />
            </div>

            {/* contenu */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">
                Message
              </label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Corps du message..."
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 resize-none"
              />
            </div>

            {/* bouton envoyer */}
            <SharedButton
              variant="primary"
              icon={<Send className="w-4 h-4" />}
              onClick={handleSend}
              loading={loading}
              disabled={!form.subject || !form.content}
              className="!w-auto px-6 self-end">
              Envoyer
            </SharedButton>

            {/* message succès */}
            {success && (
              <p className="text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-center">
                ✅ Message envoyé avec succès !
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB MESSAGES ENVOYÉS */}
      {activeTab === "sent" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">📬</p>
              <p className="text-gray-400 text-sm">Aucun message envoyé</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Type</th>
                  <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Destinataire</th>
                  <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Sujet</th>
                  <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Compte</th>
                  <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Lu</th>
                  <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(msg => (
                  <tr key={msg._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <TypeIcon type={msg.type} />
                        <TypeBadge type={msg.type} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{msg.to}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{msg.subject}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {msg.accountId?.nameAccount ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${msg.isRead ? "text-emerald-600" : "text-gray-400"}`}>
                        {msg.isRead ? "✅ Lu" : "⏳ Non lu"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}