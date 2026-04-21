// SOURCE DE VÉRITÉ pour tous les enums et seuils du coaching premium.
// Aucun module ne doit écrire une string de mode ou de risque en dur.


// ── Modes de coaching ─────────────────────────────
export const COACHING_MODES = {
  BALANCED:"BALANCED",
  CONTROLLED_BALANCED:"CONTROLLED_BALANCED",
  STRICT_CONTROL:"STRICT_CONTROL",
  ESSENTIALS_PROTECTION:"ESSENTIALS_PROTECTION",
  GOAL_FOCUSED:"GOAL_FOCUSED",
  RECOVERY:"RECOVERY",
  RECOVERY_STRICT:"RECOVERY_STRICT",
  // Variantes comptes partagés
  BALANCED_SHARED:"BALANCED_SHARED",
  CONTROLLED_BALANCED_SHARED:"CONTROLLED_BALANCED_SHARED",
  STRICT_CONTROL_SHARED:"STRICT_CONTROL_SHARED",
  ESSENTIALS_PROTECTION_SHARED:"ESSENTIALS_PROTECTION_SHARED",
  GOAL_FOCUSED_SHARED:"GOAL_FOCUSED_SHARED",
  RECOVERY_SHARED:"RECOVERY_SHARED",
  RECOVERY_STRICT_SHARED:"RECOVERY_STRICT_SHARED",
};

export const COACHING_MODE_LABELS = {
  [COACHING_MODES.BALANCED]:"Mode équilibré",
  [COACHING_MODES.CONTROLLED_BALANCED]:"Mode équilibré sous contrôle",
  [COACHING_MODES.STRICT_CONTROL]:"Mode contrôle strict",
  [COACHING_MODES.ESSENTIALS_PROTECTION]:"Protection des dépenses essentielles",
  [COACHING_MODES.GOAL_FOCUSED]:"Mode orienté objectif",
  [COACHING_MODES.RECOVERY]:"Mode récupération",
  [COACHING_MODES.RECOVERY_STRICT]:"Mode récupération stricte",
  [COACHING_MODES.BALANCED_SHARED]:"Mode équilibré partagé",
  [COACHING_MODES.CONTROLLED_BALANCED_SHARED]:"Mode équilibré partagé sous contrôle",
  [COACHING_MODES.STRICT_CONTROL_SHARED]:"Mode contrôle strict partagé",
  [COACHING_MODES.ESSENTIALS_PROTECTION_SHARED]:"Protection partagée des dépenses essentielles",
  [COACHING_MODES.GOAL_FOCUSED_SHARED]:"Mode partagé orienté objectif",
  [COACHING_MODES.RECOVERY_SHARED]:"Mode récupération partagé",
  [COACHING_MODES.RECOVERY_STRICT_SHARED]:"Mode récupération stricte partagée",
};

// ── Niveaux de risque ──────────────────────────────
export const RISK_LEVELS = {
  LOW:"low",
  MEDIUM:"medium",
  HIGH:"high",
  CRITICAL: "critical",
};

// Seuils de score → riskLevel (calculés UNE SEULE FOIS dans buildPremiumPayload)
export const RISK_SCORE_THRESHOLDS = {
  LOW:70,   // score >= 70 → low
  MEDIUM: 40,   // score >= 40 → medium
  // sinon → high
};

// ── Styles de conseil ──────────────────────────────
export const ADVICE_STYLES = {
  MOTIVATING: "motivating",
  DIRECT:"direct",
  SOFT:"soft",
  STRICT:"strict",
  BALANCED:"balanced",
  DETAILED:"detailed",
  CONCISE:"concise",
};

// ── Plan templates (venant du ML ou fallback) ──────
export const PLAN_TEMPLATES = {
  BALANCED_PLAN:"BALANCED_PLAN",
  FREEZE_CAP_PLAN:"FREEZE_CAP_PLAN",
  ESSENTIALS_FIRST_PLAN:"ESSENTIALS_FIRST_PLAN",
  GOAL_PROTECTION_PLAN:"GOAL_PROTECTION_PLAN",
  RECOVERY_PLAN:"RECOVERY_PLAN",
};

// ── Clusters personas (ML) ─────────────────────────
export const PERSONA_CLUSTERS = {
  BALANCED_PLANNER:"balanced_planner",
  GOAL_DRIVEN_UNSTABLE:"goal_driven_unstable",
  IMPULSIVE_SHOPPER:"impulsive_shopper",
  STRESSED_SURVIVOR:"stressed_survivor",
  CONSERVATIVE_SAVER:"conservative_saver",
};

// ── Groupes de catégories ──────────────────────────
export const ESSENTIAL_GROUPS = [
  "HOUSING", "FOOD_HOME", "TRANSPORT",
  "HEALTH_BEAUTY", "CHILDREN", "BILLS",
];

export const FLEX_GROUPS = [
  "EATING_OUT", "ENTERTAINMENT", "SHOPPING",
  "SMOKING_ALCOHOL_CAFE", "OTHER",
];

export const SAVINGS_GROUPS = ["SAVINGS"];

// ── Seuils métier ──────────────────────────────────
export const THRESHOLDS = {
  CRITICAL_END_OF_MONTH_DAYS:    7,    // jours restants → mode critique
  CRITICAL_END_OF_MONTH_AMOUNT:  150,  // montant restant → mode critique
  GOAL_URGENCY_CRITICAL_DAYS:    30,
  GOAL_URGENCY_HIGH_DAYS:        90,
  GOAL_URGENCY_MEDIUM_DAYS:      180,
  GOAL_URGENT_DAYS:              60,   // isUrgent dans payload
  PROTECTION_RATE_MIN:           0.10,
  PROTECTION_RATE_MAX:           0.45,
};

/**Sans Premiumconstants:
 * if (riskLevel === "low") ...
mode = "BALANCED"
template = "BALANCED_PLAN"
group = "HOUSING"

Avec Premiumconstants
if (riskLevel === RISK_LEVELS.LOW) ...
mode = COACHING_MODES.BALANCED
template = PLAN_TEMPLATES.BALANCED_PLAN
group = CATEGORY_GROUPS.HOUSING

Ensuite, dans budgetRebalancer, le moteur peut savoir que HOUSING est un groupe spécial, donc il ne faut pas le traiter comme un loisir ou du shopping. C’est grâce à ces constantes et groupes que ton moteur distingue charges structurelles et dépenses pilotables.

Donc ce fichier permet au moteur de comprendre :

“logement ≠ sortie ≠ épargne”

Pense à Premiumconstants comme à un dictionnaire officiel du moteur premium.

Tous les autres fichiers lui demandent :

quels sont les modes possibles ?
quels sont les niveaux de risque ?
quels sont les groupes de catégories ?
quels sont les seuils de décision ?

Au lieu d’inventer leurs propres réponses.

L’utilité de Premiumconstants, c’est :

1.

éviter d’écrire les mêmes valeurs en dur partout

2.

garder tous les fichiers cohérents

3.

servir de référence commune pour :

les modes
les risques
les catégories
les seuils

La phrase la plus simple à retenir pour la soutenance

Tu peux dire :

Premiumconstants est un fichier de référence qui centralise les constantes métier du premium coach. Les autres modules l’utilisent pour parler le même langage et éviter les incohérences dans les modes, les niveaux de risque, les groupes de catégories et les seuils de décision.
 */