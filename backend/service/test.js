/*import { Cathegorie } from "../models/Cathegorie.js";

export const adminService = {
    
//GESTION & CONTROLE
async function gestionControle() {
 

export const AdminService = {
  gestionControle,
};

//financierCategories

  
async paretoTopCategories({ days = 7, limit = 10 } = {}) {
  const since = daysAgo(days);
  const now = new Date();

  const rows = await Operation.aggregate([
    { $match: { type: "depense", date: { $gte: since, $lte: now } } },

    {
      $group: {
        _id: "$IdCathegorie",
        total: { $sum: "$monatnt" },
        count: { $sum: 1 },
      },
    },

    { $sort: { total: -1 } },
    { $limit: limit },

    {
      $lookup: {
        from: "cathegories",
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
  //grandTotal = total dépenses toutes catégories confondues ( s est l'accumulateur / r ligne courante)
  const grandTotal = rows.reduce((s, r) => s + Number(r.total), 0);

  let cum = 0;
  const pareto = rows.map((r) => {
    const pct = grandTotal === 0 ? 0 : (r.total / grandTotal) * 100;
    cum += pct;

    return {
      ...r,
      pct: Number(pct.toFixed(2)),        // % part catégorie
      cumPct: Number(cum.toFixed(2)),     // % cumulée
    };
  });

  //  où on atteint ~80%
  const idx80 = pareto.findIndex((x) => x.cumPct >= 80);

  return {
    days,
    limit,
    grandTotal,
    pareto,
    idx80: idx80 === -1 ? null : idx80,
  };
},

//donut:reprtitionCathegorie
async donutRepartitionCategories({ days = 7, limit = 8 } = {}) {
  const since = daysAgo(days);
  const now = new Date();

  const rows = await Operation.aggregate([
    { $match: { type: "depense", date: { $gte: since, $lte: now } } },
    {
      $group: {
        _id: "$IdCathegorie",
        value: { $sum: "$monatnt" },
      },
    },
    { $sort: { value: -1 } },
    { $limit: limit },

    {
      $lookup: {
        from: "cathegories",
        localField: "_id",
        foreignField: "_id",
        as: "cat",
      },
    },
    { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        id: "$_id",
        label: { $ifNull: ["$cat.nom", "Non classée"] },
        value: 1,
      },
    },
  ]);

  return { days, limit, data: rows };
},
//bar chart: dépenses par cathegorie 
async depensesParCategorieBar({ days = 7, limit = 10 } = {}) {
  const since = daysAgo(days);
  const now = new Date();

  const rows = await Operation.aggregate([
    { $match: { type: "depense", date: { $gte: since, $lte: now } } },
    {
      $group: {
        _id: "$IdCathegorie",
        total: { $sum: "$monatnt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: limit },

    {
      $lookup: {
        from: "cathegories",
        localField: "_id",
        foreignField: "_id",
        as: "cat",
      },
    },
    { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        label: { $ifNull: ["$cat.nom", "Non classée"] },
        total: 1,
        count: 1,
      },
    },
  ]);

  return { days, limit, rows };
},
//courbe:depense vs revenu dans le temp
async depenseVsRevenuTimeline({ days = 7 } = {}) {
  const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  const since = daysAgo(days);
  const now = new Date();

  const raw = await Operation.aggregate([
    { $match: { date: { $gte: since, $lte: now } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        depense: {
          $sum: { $cond: [{ $eq: ["$type", "depense"] }, "$monatnt", 0] },
        },
        revenu: {
          $sum: { $cond: [{ $eq: ["$type", "revenue"] }, "$monatnt", 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", depense: 1, revenu: 1 } },
  ]);

  //  map rapide (date => valeurs)
  const map = new Map(raw.map((r) => [r.date, r]));

  // jours complets (même si pas d'opérations)
  const allDates = buildDateRange(since, now);

  const rows = allDates.map((d) => {
    const r = map.get(d);
    return {
      date: d,
      depense: safeNumber(r?.depense),
      revenu: safeNumber(r?.revenu),
    };
  });

  return { days, rows };
},




//ACTIVITE_COMPORTEMENT
// Histogramme: distribution nbCathegories par compte
async histogramCategoriesParCompte() {
    const rows = await Compte.aggregate([
      {
        $bucket: {
          groupBy: "$nbCathegories",
          boundaries: [0, 1, 3, 6, 11], // 0 | 1-2 | 3-5 | 6-10 | >=11
          default: "11+",
          output: { count: { $sum: 1 } },
        },
      },
      {
        $project: {
          _id: 0,
          bin: "$_id",
          count: 1,
        },
      },
    ]);

    // normaliser l'affichage des bins
    return rows.map((r) => ({
      label:
        r.bin === 0
          ? "0"
          : r.bin === 1
          ? "1-2"
          : r.bin === 3
          ? "3-5"
          : r.bin === 6
          ? "6-10"
          : "11+",
      count: r.count,
    }));
  },

  //  Bar chart: top 10 comptes par activité (= nb opérations)
  async top10ComptesParActivite7j() {
    const since = daysAgo(7);

    const rows = await Operation.aggregate([
      { $match: { IdCompte: { $ne: null }, date: { $gte: since } } },
      { $group: { _id: "$IdCompte", nbOperations: { $sum: 1 } } },
      { $sort: { nbOperations: -1 } },
      { $limit: 10 },

      // join Compte pour récupérer le nom
      {
        $lookup: {
          from: "comptes", // ⚠️ vérifie dans Compass le nom réel (souvent "comptes")
          localField: "_id",
          foreignField: "_id",
          as: "compte",
        },
      },
      { $unwind: { path: "$compte", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          compteId: "$_id",
          label: { $ifNull: ["$compte.nomCompte", "nom compte undefined"] },
          nbOperations: 1,
        },
      },
    ]);

    return rows;
  },

  //  Funnel: créés -> actifs -> partagés -> avec objectifs
  async funnelComptes() {
    const [created, actifs, partages, avecObj] = await Promise.all([
      Compte.countDocuments(),
      Compte.countDocuments({ isBlocked: false }),
      Compte.countDocuments({ nbUsers: { $gt: 1 } }), // ou Users.1 exists
      Compte.countDocuments({ nbObjectifs: { $gte: 1 } }),
    ]);

    return [
      { step: "Comptes créés", value: created },
      { step: "Comptes actifs", value: actifs },
      { step: "Comptes partagés", value: partages },
      { step: "Comptes avec objectifs", value: avecObj },
    ];
},

  



};
*/