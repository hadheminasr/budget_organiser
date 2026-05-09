// src/hooks/useDuck.js
// Hook global du duck compagnon.
// Gère : fetch de l'état, détection de changement d'état, mode modal au reset,
// et les événements réactifs (overspend, broke, levelup, etc.)

import { useState, useEffect, useRef, useCallback } from "react";

const POLL_INTERVAL_MS = 60_000;

// ── Constantes en dehors du hook (pas recréées à chaque render) ───────────────
const REACTIVE_MESSAGES = {
  overspend:         "Oups ! Une catégorie vient de dépasser son budget. 👀",
  goal_contribution: "Super, ton objectif avance ! Continue comme ça. 🎯",
  goal_achieved: "Bravo ! Objectif atteint, ton Duck célèbre avec toi ! 🏆🎉",
  recovered:         "La marge est revenue. Belle récupération ! ✨",
  levelup:           "Nouvel état débloqué ! Tu progresses vraiment bien. 🌟",
  leveldown:         "Ce mois était difficile. On repart ensemble ? 💪",
};

// Événements qui ouvrent l'overlay plein écran (pas juste la bulle)
const OVERLAY_EVENTS = new Set(["levelup", "leveldown", "welcome","overspend","goal_achieved","goal_contribution"]);


export function useDuck(accountId) {
  const [data,           setData]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [isModal,        setIsModal]        = useState(false);
  const [isWobbling,     setIsWobbling]     = useState(false);
  const [activeMsg,      setActiveMsg]      = useState(null);
  const [isNewState,     setIsNewState]     = useState(false);
  const [activeReaction, setActiveReaction] = useState(null);

  const msgTimeout   = useRef(null);
  const pollInterval = useRef(null);

  //Fetch de l'état duck ──────────────────────────────────────────────────
  const fetchDuck = useCallback(async () => {
    if (!accountId) return;
    try {
      const res  = await fetch(`/api/duck/${accountId}`);
      const json = await res.json();
      if (!json.success) return;

      const incoming = json.data;

      setData((prev) => {
        // Détection changement d'état → levelup ou leveldown
        if (prev && incoming.companionStateId !== prev.companionStateId) {
          const isLevelUp = incoming.companionStateId > prev.companionStateId;
          setIsNewState(true);
          setActiveMsg(incoming.message);
          setActiveReaction(isLevelUp ? "levelup" : "leveldown"); // ← réaction auto
          setIsModal(true); // overlay plein écran
        }
        return incoming;
      });
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


  // triggerEvent accepte maintenant un message custom optionnel
  const triggerEvent = useCallback((eventType, customMsg = null) => {
    //─────────────────────────────────────────────────────────────
    console.log("[4] triggerEvent appelé avec :", eventType, "| msg =", customMsg ?? REACTIVE_MESSAGES[eventType]);
    const msg = customMsg ?? REACTIVE_MESSAGES[eventType];
    if (!msg) return;

    if (msgTimeout.current) clearTimeout(msgTimeout.current);

    setActiveMsg(msg);
    setIsWobbling(true);
    setActiveReaction(eventType);
    setTimeout(() => setIsWobbling(false), 600);

    if (OVERLAY_EVENTS.has(eventType)) {
      setIsModal(true);
    } else {
      msgTimeout.current = setTimeout(() => {
        setActiveMsg(null);
        setActiveReaction(null);
      }, 5000);
    }
  }, []);

  // ── Ouvrir le modal manuellement (clic sur le duck) ──────────────────────
  const openModal = useCallback(() => {
    setActiveMsg(data?.message ?? null);
    setActiveReaction(null); // clic manuel → pas de réaction spéciale
    setIsModal(true);
  }, [data]);

  // ── Fermer modal / overlay ────────────────────────────────────────────────
  const closeModal = useCallback(() => {
    setIsModal(false);
    setIsNewState(false);
    setActiveMsg(null);
    setActiveReaction(null); // ← important : reset la réaction
  }, []);

  return {
    data,
    loading,
    isModal,
    isWobbling,
    isNewState,
    activeMsg,
    activeReaction,  // ← exposé pour DuckCompanion
    openModal,
    closeModal,
    triggerEvent,
    refresh: fetchDuck,
  };
}