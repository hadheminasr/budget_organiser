// src/hooks/useDuck.js
// ─────────────────────────────────────────────────────────────────────────────
// Hook global du duck compagnon.
// Gère : fetch de l'état, détection de changement d'état, mode modal au reset,
//        et les événements réactifs (overspend, broke, etc.)
//
// Utilisation dans App.jsx :
//   const duck = useDuck(accountId);
//   <DuckCompanion duck={duck} />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";

const POLL_INTERVAL_MS = 60_000; // re-fetch toutes les 60 secondes

// Messages réactifs selon l'événement
const REACTIVE_MESSAGES = {
  overspend:         "Oups ! Une catégorie vient de dépasser son budget. 👀",
  broke:             "Plus de budget disponible. Mode essentiel jusqu'au reset. 🛑",
  goal_contribution: "Super, ton objectif avance ! Continue comme ça. 🎯",
  recovered:         "La marge est revenue. Belle récupération ! ✨",
};

export function useDuck(accountId) {
  const [data,        setData]        = useState(null);   // données duck depuis l'API
  const [loading,     setLoading]     = useState(true);
  const [isModal,     setIsModal]     = useState(false);  // true = mode grand modal
  const [isWobbling,  setIsWobbling]  = useState(false);  // animation réactive
  const [activeMsg,   setActiveMsg]   = useState(null);   // message bulle actif
  const [isNewState,  setIsNewState]  = useState(false);  // changement d'état détecté

  const prevStateId  = useRef(null);
  const msgTimeout   = useRef(null);
  const pollInterval = useRef(null);

  // ── Fetch de l'état duck ────────────────────────────────────────────────────
  const fetchDuck = useCallback(async () => {
    if (!accountId) return;
    try {
      const res  = await fetch(`/api/duck/${accountId}`);
      const json = await res.json();
      if (!json.success) return;

      const incoming = json.data;

      setData((prev) => {
        // Détecter un changement d'état (ex: après un reset mensuel)
        if (
          prev &&
          incoming.companionStateId !== prev.companionStateId
        ) {
          setIsNewState(true);
          setIsModal(true);   // ouvre le modal automatiquement
          setActiveMsg(incoming.message);
        }
        return incoming;
      });

      // Premier chargement
      if (prevStateId.current === null) {
        prevStateId.current = incoming.companionStateId;
      }
    } catch (err) {
      console.warn("[Duck] fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  // Fetch initial + polling
  useEffect(() => {
    fetchDuck();
    pollInterval.current = setInterval(fetchDuck, POLL_INTERVAL_MS);
    return () => clearInterval(pollInterval.current);
  }, [fetchDuck]);

  // ── Afficher un message réactif (appelé depuis l'extérieur) ─────────────────
  // Ex: après création d'une opération qui dépasse le budget
  //   duck.triggerEvent("overspend")
  const triggerEvent = useCallback((eventType) => {
    const msg = REACTIVE_MESSAGES[eventType];
    if (!msg) return;

    if (msgTimeout.current) clearTimeout(msgTimeout.current);

    setActiveMsg(msg);
    setIsWobbling(true);

    // Arrêter le wobble après l'animation
    setTimeout(() => setIsWobbling(false), 600);

    // Effacer le message après 5 secondes
    msgTimeout.current = setTimeout(() => setActiveMsg(null), 5000);
  }, []);

  // ── Ouvrir / fermer le modal manuellement (clic sur le duck) ───────────────
  const openModal  = useCallback(() => {
    setActiveMsg(data?.message ?? null);
    setIsModal(true);
  }, [data]);

  const closeModal = useCallback(() => {
    setIsModal(false);
    setIsNewState(false);
    setActiveMsg(null);
  }, []);

  return {
    data,           // { companionStateId, stateName, hearts, streak, ... }
    loading,
    isModal,
    isWobbling,
    isNewState,     // true = changement d'état ce reset
    activeMsg,      // message bulle actif (null = pas de bulle)
    openModal,
    closeModal,
    triggerEvent,   // duck.triggerEvent("overspend")
    refresh: fetchDuck,
  };
}