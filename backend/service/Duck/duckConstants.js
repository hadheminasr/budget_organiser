// service/vault/vaultConstants.js
// ─────────────────────────────────────────────────────────────────────────────
// Toutes les règles du système vault en un seul endroit.
// Aucun autre fichier ne hardcode ces valeurs.
// ─────────────────────────────────────────────────────────────────────────────

// ── Conversion healthScore (0-100) → état duck (0-5) ─────────────────────────
//
// healthScore est calculé en interne — le user ne le voit jamais.
// Il est converti en companionStateId qui détermine quelle image PNG afficher.
//
// state 0 → duck/state-0.png  (Dormant)
// state 1 → duck/state-1.png  (Fragile)
// state 2 → duck/state-2.png  (Stable)
// state 3 → duck/state-3.png  (Équilibré)
// state 4 → duck/state-4.png  (Épanoui)
// state 5 → duck/state-5.png  (Légendaire)

export const VAULT_STATES = [
  { id: 0, name: "Dormant",    minScore: 0,  maxScore: 19,  hearts: 0 },
  { id: 1, name: "Fragile",    minScore: 20, maxScore: 39,  hearts: 1 },
  { id: 2, name: "Stable",     minScore: 40, maxScore: 54,  hearts: 2 },
  { id: 3, name: "Équilibré",  minScore: 55, maxScore: 69,  hearts: 3 },
  { id: 4, name: "Épanoui",    minScore: 70, maxScore: 84,  hearts: 4 },
  { id: 5, name: "Légendaire", minScore: 85, maxScore: 100, hearts: 5 },
];

// ── Poids du healthScore ──────────────────────────────────────────────────────
// On réutilise les 4 axes déjà présents dans buildBIBlock (AccountService).
// La somme = 1.0 obligatoire.
export const HEALTH_WEIGHTS = {
  discipline:  0.35,   // taux d'exécution budgétaire (dépenses vs budget)
  epargne:     0.25,   // montant non dépensé / budget total
  objectifs:   0.20,   // progression moyenne des objectifs actifs
  regularite:  0.20,   // % catégories non dépassées
};

// Un mois est "bon" pour le streak si healthScore >= ce seuil
export const STREAK_MIN_SCORE = 55;

// ── Messages du duck ──────────────────────────────────────────────────────────
// Deux types :
//   monthly  → affiché au reset mensuel (bilan du mois)
//   reactive → affiché en temps réel quand un événement se produit

export const DUCK_MESSAGES = {

  // Messages au reset mensuel — un par état
  monthly: {
    0: "Je me réveille à peine... Le budget était difficile ce mois-ci. On repart ensemble ?",
    1: "Ce mois était tendu. Quelques dépassements, mais tu peux faire mieux. Je crois en toi.",
    2: "Mois stable. Rien de catastrophique, rien d'exceptionnel. Continue et tu vas monter !",
    3: "Bien joué ! Le budget a tenu et l'objectif avance. Je suis content de toi.",
    4: "Excellent mois ! Discipline, épargne, objectif... Tout est au vert. Je rayonne !",
    5: "Mois parfait. Performance légendaire. Tu es au sommet — et moi aussi !",
  },

  // Messages réactifs — déclenchés par des événements précis
  reactive: {
    // Une catégorie vient de dépasser son budget
    overspend: [
      "Oups ! Une catégorie a dépassé son budget. Garde un œil dessus.",
      "Un dépassement détecté. Essaie de compenser sur les dépenses flexibles.",
      "Attention, tu as dépassé le budget de cette catégorie ce mois-ci.",
    ],
    // Le reste du compte tombe à 0 ou négatif
    broke: [
      "Le budget disponible est épuisé. Mode essentiel uniquement jusqu'au reset.",
      "Plus de marge ce mois-ci. Concentre-toi sur les dépenses indispensables.",
    ],
    // L'utilisateur alimente un objectif
    goal_contribution: [
      "Super ! Ton objectif avance. Chaque contribution compte.",
      "Bien joué pour l'objectif ! Tu es sur la bonne trajectoire.",
    ],
    // Le reste repasse en positif après avoir été à 0
    recovered: [
      "La marge est revenue. Continue sur cette lancée !",
    ],
  },
};