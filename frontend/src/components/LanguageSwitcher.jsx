// Dans ton topbar/header
import { useTranslation } from "react-i18next";

export default function LangToggle() {
  const { i18n } = useTranslation();

  const toggle = () => {
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-bold text-pink-400 hover:bg-pink-50 hover:scale-105 transition cursor-pointer">
      {i18n.language === "fr" ? "EN" : "FR"}
    </button>
  );
}
