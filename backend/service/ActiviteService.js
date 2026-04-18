// ActiviteService.js — version BI enrichie
// Nouveaux indicateurs : taux d'engagement, vélocité, rétention,
// heatmap horaire, profondeur d'usage, courbe de rétention comportementale

import { Operation } from "../models/Operation.js";
import { Note }      from "../models/Note.js";
import { Goal }      from "../models/Goal.js";
import { Account }   from "../models/Account.js";
import { User }      from "../models/User.js";

export async function ActiviteService() {

  const now          = new Date();
  const debutMois    = new Date(now.getFullYear(), now.getMonth(), 1);
  const il7Jours     = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const il30Jours    = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const moisActuel   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // ── Base ────────────────────────────────────────────────────
  const tousComptes  = await Account.find().lean();
  const totalComptes = tousComptes.length || 1;

  // Toutes les opérations non archivées du mois
  const opsMois = await Operation.find({
    archived: false,
    date: { $gte: debutMois },
  }).lean();

  const nbOperationsMois = opsMois.length;

  // ── Comptes actifs 7j ────────────────────────────────────────
  const setActifs7j = new Set(
    opsMois.filter(op => new Date(op.date) >= il7Jours).map(op => String(op.IdAccount))
  );
  const nbComptesActifs7j = setActifs7j.size;

  // ── Comptes dormants 30j ─────────────────────────────────────
  const setActifs30j = new Set(
    (await Operation.find({ archived: false, date: { $gte: il30Jours } }).lean())
      .map(op => String(op.IdAccount))
  );
  const nbDormants     = tousComptes.filter(c => !setActifs30j.has(String(c._id))).length;
  const pctDormants    = Math.round((nbDormants / totalComptes) * 100);

  // ── Vélocité — moyenne ops par compte actif ──────────────────
  const opsByAccount    = opsMois.reduce((acc, op) => {
    const id = String(op.IdAccount);
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});
  const nbComptesAvecOps     = Object.keys(opsByAccount).length || 1;
  const moyenneOpsParCompte  = +(nbOperationsMois / nbComptesAvecOps).toFixed(1);

  // ── Intensité moy parmi les comptes vraiment actifs (7j) ─────
  const opsActifs7j = [...setActifs7j].map(id => opsByAccount[id] ?? 0);
  const intensiteMoyActifs = opsActifs7j.length
    ? +(opsActifs7j.reduce((s, v) => s + v, 0) / opsActifs7j.length).toFixed(1)
    : 0;

  // ── Reset mensuel ────────────────────────────────────────────
  const comptesResetMois = tousComptes.filter(c => c.lastResetMonth === moisActuel).length;
  const pctReset         = Math.round((comptesResetMois / totalComptes) * 100);

  // ── Notes + Objectifs ────────────────────────────────────────
  const [nbNotesMois, nbObjectifsMois, nbUtilisateurs] = await Promise.all([
    Note.countDocuments({ createdAt: { $gte: debutMois } }),
    Goal.countDocuments({ createdAt: { $gte: debutMois } }),
    User.countDocuments(),
  ]);

  // ── Profondeur d'usage ───────────────────────────────────────
  // Comptes ayant utilisé chaque feature (proxy depuis les données disponibles)
  const comptesAvecObjectif = new Set(
    (await Goal.find({ isActive: true }).distinct("IdAccount")).map(String)
  );
  const comptesAvecNote = new Set(
    (await Note.find({}).distinct("IdAccount")).map(String)
  );
  const profilsCoach = await Account.countDocuments({ lastResetMonth: moisActuel });

  const profondeurUsage = [
    { feature: "Opérations",       pct: 100 },
    { feature: "Budget & catégories", pct: Math.round((nbComptesAvecOps / totalComptes) * 100) },
    { feature: "Objectifs",        pct: Math.round((comptesAvecObjectif.size / totalComptes) * 100) },
    { feature: "Notes",            pct: Math.round((comptesAvecNote.size / totalComptes) * 100) },
    { feature: "Coach Budget",     pct: Math.round((profilsCoach / totalComptes) * 100) },
    { feature: "Rapport",          pct: Math.round((comptesResetMois / totalComptes) * 100) },
  ];

  // ── Segmentation d'engagement ────────────────────────────────
  const distribution = { "0": 0, "1-5": 0, "6-20": 0, "20+": 0 };
  for (const compte of tousComptes) {
    const nb = opsByAccount[String(compte._id)] ?? 0;
    if      (nb === 0)  distribution["0"]++;
    else if (nb <= 5)   distribution["1-5"]++;
    else if (nb <= 20)  distribution["6-20"]++;
    else                distribution["20+"]++;
  }
  const distributionActivite = Object.entries(distribution).map(([range, count]) => ({ range, count }));

  // Pourcentages pour la barre de segmentation
  const segmentation = {
    inactifs:   Math.round((distribution["0"]   / totalComptes) * 100),
    faibles:    Math.round((distribution["1-5"] / totalComptes) * 100),
    moderes:    Math.round((distribution["6-20"]/ totalComptes) * 100),
    tresActifs: Math.round((distribution["20+"] / totalComptes) * 100),
  };

  // ── Opérations par jour (30 derniers jours) ──────────────────
  const opsParJour = [];
  for (let i = 29; i >= 0; i--) {
    const jour      = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const jourStr   = jour.toISOString().slice(0, 10);
    const debutJour = new Date(jour.getFullYear(), jour.getMonth(), jour.getDate());
    const finJour   = new Date(jour.getFullYear(), jour.getMonth(), jour.getDate() + 1);
    const nbOps     = opsMois.filter(op => {
      const d = new Date(op.date);
      return d >= debutJour && d < finJour;
    }).length;
    opsParJour.push({
      date:  jourStr,
      label: jour.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      nbOps,
    });
  }

  // ── Évolution par semaine (8 dernières semaines) ─────────────
  const opsParSemaine = [];
  for (let i = 7; i >= 0; i--) {
    const debutSem = new Date(now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000);
    const finSem   = new Date(now.getTime() - (i * 7 - 1) * 24 * 60 * 60 * 1000);
    const opsAll   = await Operation.find({
      archived: false,
      date: { $gte: debutSem, $lte: finSem },
    }).lean();
    opsParSemaine.push({
      label:     `S${8 - i}`,
      nbOps:     opsAll.length,
      nbComptes: new Set(opsAll.map(op => String(op.IdAccount))).size,
    });
  }

  // ── Courbe de rétention comportementale ─────────────────────
  // Pour chaque semaine S1..S8, % de comptes qui étaient actifs en S1
  // et qui ont continué à être actifs cette semaine-là.
  // Proxy simple : on mesure le % de comptes actifs semaine par semaine
  // normalisé par le max (S1 ou semaine la plus active).
  const maxActifs = Math.max(...opsParSemaine.map(s => s.nbComptes), 1);
  const retentionCurve = opsParSemaine.map((s, i) => ({
    label:        s.label,
    pctRetention: Math.round((s.nbComptes / maxActifs) * 100),
    nbComptes:    s.nbComptes,
  }));

  // ── Distribution horaire ─────────────────────────────────────
  // Agrégation MongoDB par heure de la journée (30 derniers jours)
  const opsAvecHeure = await Operation.aggregate([
    { $match: { archived: false, date: { $gte: il30Jours } } },
    { $group: { _id: { $hour: "$date" }, count: { $sum: 1 } } },
    { $sort: { "_id": 1 } },
  ]);
  const parHeure = Array.from({ length: 24 }, (_, h) => {
    const found = opsAvecHeure.find(x => x._id === h);
    return { heure: h, label: `${h}h`, nbOps: found?.count ?? 0 };
  });

  // ── Segmentation évolution (pour le stacked bar chart) ──────
  // On reconstruit l'historique semaine par semaine des segments
  const segmentEvolution = await Promise.all(
    Array.from({ length: 8 }, async (_, i) => {
      const idx       = 7 - i;
      const debutSem  = new Date(now.getTime() - (idx * 7 + 6) * 24 * 60 * 60 * 1000);
      const finSem    = new Date(now.getTime() - (idx * 7 - 1) * 24 * 60 * 60 * 1000);
      const opsS      = await Operation.find({
        archived: false,
        date: { $gte: debutSem, $lte: finSem },
      }).lean();

      const byAcc = opsS.reduce((a, op) => {
        const id = String(op.IdAccount);
        a[id] = (a[id] ?? 0) + 1;
        return a;
      }, {});

      let s0 = 0, s1 = 0, s2 = 0, s3 = 0;
      for (const compte of tousComptes) {
        const nb = byAcc[String(compte._id)] ?? 0;
        if (nb === 0)  s0++;
        else if (nb <= 5)  s1++;
        else if (nb <= 20) s2++;
        else s3++;
      }
      const t = totalComptes;
      return {
        label:     `S${8 - idx}`,
        inactifs:  Math.round((s0 / t) * 100),
        faibles:   Math.round((s1 / t) * 100),
        moderes:   Math.round((s2 / t) * 100),
        tresActifs:Math.round((s3 / t) * 100),
      };
    })
  );

  // ── KPIs calculés ─────────────────────────────────────────
  // Score de rétention = moyenne des pct sur les 8 semaines
  const scoreRetention = Math.round(
    retentionCurve.reduce((s, r) => s + r.pctRetention, 0) / retentionCurve.length
  );

  // Profondeur moy = moyenne des pct features (hors ops)
  const profondeurMoy = +(
    profondeurUsage.slice(1).reduce((s, f) => s + f.pct, 0) /
    (profondeurUsage.length - 1)
  ).toFixed(1);

  return {
    kpis: {
      // KPIs existants
      nbOperationsMois,
      moyenneOpsParCompte,
      nbComptesActifs7j,
      nbDormants,
      pctReset,
      nbNotesMois,
      nbObjectifsMois,
      nbUtilisateurs,
      pctDormants,
      pctActifs7j: Math.round((nbComptesActifs7j / totalComptes) * 100),
      // Nouveaux KPIs BI
      tauxEngagement:     Math.round((nbComptesActifs7j / totalComptes) * 100),
      tauxChurn:          pctDormants,
      tauxActivation:     pctReset,
      intensiteMoyActifs,
      scoreRetention,
      profondeurMoy,
      nbCreationsMois:    nbNotesMois + nbObjectifsMois,
    },
    segmentation,
    segmentEvolution,
    distributionActivite,
    profondeurUsage,
    opsParJour,
    opsParSemaine,
    retentionCurve,
    parHeure,
  };
}