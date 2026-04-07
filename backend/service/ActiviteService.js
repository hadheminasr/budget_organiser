import { Operation } from "../models/Operation.js";
import { Note } from "../models/Note.js";
import { Goal } from "../models/Goal.js";
import { Account } from "../models/Account.js";
import { User } from "../models/User.js";

export async function ActiviteService() {

  const now = new Date();
  const debutMois    = new Date(now.getFullYear(), now.getMonth(), 1);
  const il7Jours     = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const il30Jours    = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const moisActuel   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // ── 1. tous les comptes
  const tousComptes = await Account.find().lean();
  const totalComptes = tousComptes.length || 1;

  // ── 2. opérations non archivées ce mois
  const opsMois = await Operation.find({
    archived: false,
    date: { $gte: debutMois }
  }).lean();

  const nbOperationsMois = opsMois.length;

  // ── 3. comptes actifs ces 7 jours
  const comptesActifs7j = new Set(
    opsMois
      .filter(op => new Date(op.date) >= il7Jours)
      .map(op => String(op.IdAccount))
  );
  const nbComptesActifs7j = comptesActifs7j.size;

  // ── 4. comptes dormants (0 opération depuis 30 jours)
  const comptesAvecOps30j = new Set(
    (await Operation.find({
      archived: false,
      date: { $gte: il30Jours }
    }).lean()).map(op => String(op.IdAccount))
  );
  const nbDormants = tousComptes.filter(
    c => !comptesAvecOps30j.has(String(c._id))
  ).length;

  // ── 5. moyenne opérations par compte actif
  const nbComptesAvecOps = new Set(opsMois.map(op => String(op.IdAccount))).size || 1;
  const moyenneOpsParCompte = Math.round(nbOperationsMois / nbComptesAvecOps);

  // ── 6. % comptes ayant fait leur reset ce mois
  const comptesResetMois = tousComptes.filter(
    c => c.lastResetMonth === moisActuel
  ).length;
  const pctReset = Math.round((comptesResetMois / totalComptes) * 100);

  // ── 7. notes créées ce mois
  const nbNotesMois = await Note.countDocuments({
    createdAt: { $gte: debutMois }
  });

  // ── 8. objectifs créés ce mois
  const nbObjectifsMois = await Goal.countDocuments({
    createdAt: { $gte: debutMois }
  });

  // ── 9. nb utilisateurs total
  const nbUtilisateurs = await User.countDocuments();

  // ── 10. distribution activité des comptes
  // groupe les comptes par niveau d'activité
  const opsByAccount = opsMois.reduce((acc, op) => {
    const id = String(op.IdAccount);
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});

  const distribution = { "0": 0, "1-5": 0, "6-20": 0, "20+": 0 };
  for (const compte of tousComptes) {
    const nb = opsByAccount[String(compte._id)] ?? 0;
    if      (nb === 0)  distribution["0"]++;
    else if (nb <= 5)   distribution["1-5"]++;
    else if (nb <= 20)  distribution["6-20"]++;
    else                distribution["20+"]++;
  }

  const distributionActivite = Object.entries(distribution).map(
    ([range, count]) => ({ range, count })
  );

  // ── 11. opérations par jour (30 derniers jours)
  const opsParJour = [];
  for (let i = 29; i >= 0; i--) {
    const jour     = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const jourStr  = jour.toISOString().slice(0, 10);
    const debutJour= new Date(jour.getFullYear(), jour.getMonth(), jour.getDate());
    const finJour  = new Date(jour.getFullYear(), jour.getMonth(), jour.getDate() + 1);

    const nbOps = opsMois.filter(op => {
      const d = new Date(op.date);
      return d >= debutJour && d < finJour;
    }).length;

    opsParJour.push({
      date:  jourStr,
      label: jour.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      nbOps,
    });
  }

  // ── 12. évolution activité par semaine (8 dernières semaines)
  const opsParSemaine = [];
  for (let i = 7; i >= 0; i--) {
    const debutSemaine = new Date(now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000);
    const finSemaine   = new Date(now.getTime() - (i * 7 - 1) * 24 * 60 * 60 * 1000);

    const opsAll = await Operation.find({
      archived: false,
      date: { $gte: debutSemaine, $lte: finSemaine }
    }).lean();

    opsParSemaine.push({
      label:       `S${8 - i}`,
      nbOps:       opsAll.length,
      nbComptes:   new Set(opsAll.map(op => String(op.IdAccount))).size,
    });
  }

  return {
    kpis: {
      nbOperationsMois,
      moyenneOpsParCompte,
      nbComptesActifs7j,
      nbDormants,
      pctReset,
      nbNotesMois,
      nbObjectifsMois,
      nbUtilisateurs,
      pctDormants: Math.round((nbDormants / totalComptes) * 100),
      pctActifs7j: Math.round((nbComptesActifs7j / totalComptes) * 100),
    },
    distributionActivite,
    opsParJour,
    opsParSemaine,
  };
}