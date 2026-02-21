import { Account } from "../models/Account.js";
import {User} from "../models/User.js";
import {Goal} from "../models/Goal.js";
import { Operation } from "../models/Operation.js";
import { computeHealth,meanStd, daysAgo ,startOfMonth, startOfNextMonth, startOfPrevMonth, monthKey, pctChange,pct } from "../utils/seviceUtils.js";
export const KPI ={
async VueGlobale (){
    const since7 = daysAgo(7);
    const [
      nbComptes,
      comptesActifs,
      comptesBloques,
      comptesPartages,
      nbUsers,
      newUsers,
      objectifsActifs,
      nbObjectifs,
      objectifsAtteints,
      nbOperations7j,
    ] = await Promise.all([
      Account.countDocuments(),
      Account.countDocuments({ isBlocked: false }),
      Account.countDocuments({ isBlocked: true }),
      Account.countDocuments({ nbUsers: { $gt: 1 } }),

      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: since7 } }),

      Goal.countDocuments({ isActive: true }),
      Goal.countDocuments(),
      Goal.countDocuments({ isAchieved: true }),

      Operation.countDocuments({ createdAt: { $gte: since7 } }),
    ]);

    return {
      nbComptes,
      comptesActifs,
      comptesBloques,
      pctComptesPartages: pct(comptesPartages, nbComptes),
      nbUsers,
      newUsers7j: newUsers,
      objectifsActifs,
      pctObjectifsAtteints: pct(objectifsAtteints, nbObjectifs),
      nbOperations7j,
    };
    },
    async activiteComportement() {
    const now = new Date();
    const since7 = daysAgo(7);
    const since14 = daysAgo(14);

    // 1) Base : comptes non bloqués
    const comptesActifs = await Account.countDocuments({ isBlocked: false });

    // 2) Comptes actifs (avec au moins 1 opération) sur 7j et sur la semaine précédente
    const [activeNowIds, activePrevIds] = await Promise.all([
      Operation.distinct("IdCompte", {
        date: { $gte: since7, $lte: now },
        IdCompte: { $ne: null },
      }),
      Operation.distinct("IdCompte", {
        date: { $gte: since14, $lt: since7 },
        IdCompte: { $ne: null },
      }),
    ]);

    const activeNow = activeNowIds.length;
    const activePrev = activePrevIds.length;

    const rateNow = comptesActifs ? activeNow / comptesActifs : 0;
    const ratePrev = comptesActifs ? activePrev / comptesActifs : 0;

    const pctChange = ratePrev === 0 ? null : Number((((rateNow - ratePrev) / ratePrev) * 100).toFixed(2));

    // 3) Dormants = non bloqués mais pas dans activeNowIds
    const dormantCount = await Account.countDocuments({
      isBlocked: false,
      _id: { $nin: activeNowIds },
    });

    // 4) Moyenne opérations par compte (global)
    const totalOps = await Operation.countDocuments();
    const avgOpsPerAccount = comptesActifs ? Number((totalOps / comptesActifs).toFixed(2)) : 0;

    // 5) % comptes avec objectifs actifs (ou objectifs tout court)
    // Ici on calcule via distinct comptes dans Goal (plus fiable que "nbObjectifs" stocké)
    const goalAccounts = await Goal.distinct("IdAccount", { IdAccount: { $ne: null } });
    const pctWithGoals = pct(goalAccounts.length, comptesActifs);

    // 6) % comptes avec catégories personnalisées
    // ⚠️ si tu as un champ sur Account genre nbCathegoriesPerso, garde-le.
    // Sinon, on fera via Category model (mais tu ne l’as pas donné ici).
    // Exemple si tu as nbCathegories (perso) :
    const comptesAvecCatsPerso = await Account.countDocuments({ isBlocked: false, nbCathegories: { $gte: 1 } });
    const pctWithCustomCats = pct(comptesAvecCatsPerso, comptesActifs);

    return {
      comptesActifs,
      activeNow,
      activePrev,
      rateNow: Number((rateNow * 100).toFixed(2)),
      ratePrev: Number((ratePrev * 100).toFixed(2)),
      pctChange, 
      dormantCount,
      avgOpsPerAccount,
      pctWithGoals,
      pctWithCustomCats,
    };
  },




  async financierCategorisation() {
    const now = new Date();

    const curStart = startOfMonth(now);
    const curEnd = startOfNextMonth(now);
    const prevStart = startOfPrevMonth(now);
    const prevEnd = curStart;

    // ✅ Comptes non bloqués pour avg par compte
    const comptesActifs = await Account.countDocuments({ isBlocked: false });

    // 1) Totaux mois courant
    const [depCur, revCur] = await Promise.all([
      Operation.aggregate([
        { $match: { type: "depense", date: { $gte: curStart, $lt: curEnd } } },
        { $group: { _id: null, total: { $sum: "$monatnt" } } },
      ]),
      Operation.aggregate([
        { $match: { type: "revenue", date: { $gte: curStart, $lt: curEnd } } },
        { $group: { _id: null, total: { $sum: "$monatnt" } } },
      ]),
    ]);

    const depTotal = Number(depCur[0]?.total ?? 0);
    const revTotal = Number(revCur[0]?.total ?? 0);

    // 2) Totaux mois précédent (MoM)
    const [depPrev, revPrev] = await Promise.all([
      Operation.aggregate([
        { $match: { type: "depense", date: { $gte: prevStart, $lt: prevEnd } } },
        { $group: { _id: null, total: { $sum: "$monatnt" } } },
      ]),
      Operation.aggregate([
        { $match: { type: "revenue", date: { $gte: prevStart, $lt: prevEnd } } },
        { $group: { _id: null, total: { $sum: "$monatnt" } } },
      ]),
    ]);

    const depPrevTotal = Number(depPrev[0]?.total ?? 0);
    const revPrevTotal = Number(revPrev[0]?.total ?? 0);

    const depMoM = pctChange(depTotal, depPrevTotal); // null si prev=0
    const revMoM = pctChange(revTotal, revPrevTotal);

    // 3) Top catégorie (dépenses du mois)
    const topCatRows = await Operation.aggregate([
      { $match: { type: "depense", date: { $gte: curStart, $lt: curEnd } } },
      {
        $group: {
          _id: "$IdCathegorie",
          total: { $sum: "$monatnt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "cathegories", // ⚠️ le nom de ta collection
          localField: "_id",
          foreignField: "_id",
          as: "cat",
        },
      },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          label: { $ifNull: ["$cat.nom", "Non classée"] },
          total: 1,
          count: 1,
        },
      },
    ]);

    const topCategorie =
      topCatRows[0] || { categoryId: null, label: "Non classée", total: 0, count: 0 };

    const avgDepenseParCompte =
      comptesActifs === 0 ? 0 : Number((depTotal / comptesActifs).toFixed(2));

    return {
      month: monthKey(now),
      prevMonth: monthKey(prevStart),
      depTotal,
      revTotal,
      depMoM,
      revMoM,
      topCategorie,
      avgDepenseParCompte,
    };
  },


  async gestionControle() {
    const now = new Date();
    const since7 = daysAgo(7);

    // historique (8 semaines avant la semaine actuelle)
    const historyWeeks = 8;
    const historyDays = historyWeeks * 7;
    const sinceHistory = daysAgo(7 + historyDays);
    const historyEnd = since7;

    // 1) Comptes non bloqués
    const comptes = await Account.find({ isBlocked: false })
      .select("_id solde")
      .lean();

    const totalNonBlocked = comptes.length;

    if (totalNonBlocked === 0) {
      return {
        tauxActiviteReguliere: 0,
        santeMoyenne: 0,
        pctSoldeNegatif: 0,
        pctAbusAnormal: 0,
        totalComptesNonBloques: 0,
      };
    }

    // 2) Semaine actuelle (7j)
    const curAgg = await Operation.aggregate([
      { $match: { date: { $gte: since7, $lte: now }, IdCompte: { $ne: null } } },
      {
        $group: {
          _id: "$IdCompte",
          ops7j: { $sum: 1 },
          dep7j: {
            $sum: { $cond: [{ $eq: ["$type", "depense"] }, "$monatnt", 0] },
          },
          depCount7j: {
            $sum: { $cond: [{ $eq: ["$type", "depense"] }, 1, 0] },
          },
          depClassed7j: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$type", "depense"] },
                    { $ne: ["$IdCathegorie", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    const curMap = new Map(curAgg.map((r) => [String(r._id), r]));

    // 3) Historique hebdo (hors 7j)
    const histAgg = await Operation.aggregate([
      {
        $match: {
          type: "depense",
          date: { $gte: sinceHistory, $lt: historyEnd },
          IdCompte: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            compteId: "$IdCompte",
            week: { $isoWeek: "$date" },
            year: { $isoWeekYear: "$date" },
          },
          totalWeek: { $sum: "$monatnt" },
        },
      },
      { $group: { _id: "$_id.compteId", weeks: { $push: "$totalWeek" } } },
    ]);
    const histMap = new Map(histAgg.map((r) => [String(r._id), r.weeks]));

    // 4) Goals actifs par compte
    const goalsAgg = await Goal.aggregate([
      { $match: { isActive: true, IdAccount: { $ne: null } } },
      { $group: { _id: "$IdAccount", count: { $sum: 1 } } },
    ]);
    const goalsMap = new Map(goalsAgg.map((g) => [String(g._id), g.count]));

    // 5) Calcul KPIs
    let regularCount = 0;
    let soldeNegCount = 0;
    let abusCount = 0;
    let healthSum = 0;

    for (const c of comptes) {
      const cur = curMap.get(String(c._id)) || {};
      const ops7j = cur.ops7j || 0;
      const dep7j = cur.dep7j || 0;

      const depCount7j = cur.depCount7j || 0;
      const depClassed7j = cur.depClassed7j || 0;
      const pctClassed = depCount7j === 0 ? 0 : Math.round((depClassed7j / depCount7j) * 100);

      const solde = c.solde ?? 0;
      const hasGoal = (goalsMap.get(String(c._id)) || 0) > 0;

      if (ops7j >= 1) regularCount++;
      if (solde < 0) soldeNegCount++;

      const weeks = histMap.get(String(c._id)) || [];
      const { mean, std } = meanStd(weeks);
      const threshold = mean + 2 * std;
      const isAbus = weeks.length >= 2 && dep7j > threshold;
      if (isAbus) abusCount++;

      healthSum += computeHealth({ ops7j, pctClassed, hasGoal, solde });
    }

    return {
      tauxActiviteReguliere: Number(((regularCount / totalNonBlocked) * 100).toFixed(2)),
      santeMoyenne: Number((healthSum / totalNonBlocked).toFixed(2)),
      pctSoldeNegatif: Number(((soldeNegCount / totalNonBlocked) * 100).toFixed(2)),
      pctAbusAnormal: Number(((abusCount / totalNonBlocked) * 100).toFixed(2)),
      totalComptesNonBloques: totalNonBlocked,
    };
  },
  async all() {
  const [VueGlobale, activiteComportement, financierCategorisation, gestionControle] =
    await Promise.all([
      this.VueGlobale(),
      this.activiteComportement(),
      this.financierCategorisation(),
      this.gestionControle(),
    ]);

  return { VueGlobale, activiteComportement, financierCategorisation, gestionControle };
}
};
