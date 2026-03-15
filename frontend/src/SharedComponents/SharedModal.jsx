import { X } from "lucide-react";
import SharedButton from "./SharedButton";

export default function SharedModal({
  title,                    // titre du modal
  onClose,                  // fermer
  onSubmit,                 // action bouton principal
  submitLabel = "Confirmer",// texte bouton principal
  submitDisabled = false,   // désactive bouton
  loading = false,          // loading bouton
  variant = "primary",      // couleur bouton (primary/danger/secondary)
  size = "md",              // taille : sm / md / lg
  children,                 // contenu libre
}) {

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center px-4"
      style={{ zIndex: 9999 }}
      onClick={onClose} //click outside = ferme
    >
      <div
        className={`bg-white rounded-2xl border border-pink-100 p-6 shadow-xl w-full ${sizes[size]}`}
        onClick={e => e.stopPropagation()} //empêche la fermeture si click à l'intérieur
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-rose-900">{title}</h3>
          <button type="button" onClick={onClose}
            className="text-pink-300 hover:text-pink-500 cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex flex-col gap-4 mb-6">
          {children}
        </div>

        {/* Actions  cachés si pas de onSubmit */}
        {onSubmit && (
          <div className="flex gap-3">
            <SharedButton 
                variant="secondary" 
                onClick={onClose} 
                className="flex-1"
            >
              Annuler
            </SharedButton>
            
            <SharedButton
              variant={variant}
              onClick={onSubmit}
              disabled={submitDisabled}
              loading={loading}
              className="flex-1">
              {submitLabel}
            </SharedButton>
          </div>
        )}

      </div>
    </div>
  );
}