import { Account } from "../models/Account.js";
import { User } from "../models/User.js";
import { Goal } from "../models/Goal.js";
import { Operation } from "../models/Operation.js";
import { daysAgo, pct, buildDateRange, toYMD , denominateurSafe } from "../utils/seviceUtils.js";

export const VueGlobale = {
  async KPI() {
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
      Operation.countDocuments({ date: { $gte: since7 } }),
    ]);

    return {
      nbComptes,
      comptesActifs,
      comptesBloques,
      pctComptesPartages: pct(comptesPartages, denominateurSafe(nbComptes)),
      nbUsers,
      newUsers7j: newUsers,
      objectifsActifs,
      pctObjectifsAtteints: pct(objectifsAtteints,denominateurSafe(nbObjectifs)),
      nbOperations7j,
    };
  },
  // Courbe: opérations par jour (7j) (depense/revenu)
  async operationsParJour7j() {
    const now = new Date();
    const since = daysAgo(7);

    const rows = await Operation.aggregate([
      { $match: { date: { $gte: since, $lte: now } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);
    //faire remplir les dates avec operations vides
    const dates = buildDateRange(since, now);
    const base = {};
    for (const d of dates) base[d] = { date: d, depense: 0, revenu: 0 };

    for (const r of rows) {
      const d = r._id.date;
      const t = r._id.type;
      if (!base[d]) base[d] = { date: d, depense: 0, revenu: 0 };
      if (t === "depense") base[d].depense = r.count;
      if (t === "revenu") base[d].revenu = r.count;
    }
    return dates.map((d) => base[d]);
  },


  // Bar: Top 5 catégories (dépenses) (7j)
  async top5CategoriesDepenses7j() {
    const now = new Date();
    const since = daysAgo(7);

    const rows = await Operation.aggregate([
      { $match: { type: "depense", date: { $gte: since, $lte: now } } },
      {
        $group: {
          _id: "$IdCategory",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "Category",
          localField: "_id",
          foreignField: "_id",
          as: "cat",
        },//ajoute cat mais sous forma du tableau
      },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },//$unwind transforme tableau en objet  , preserveNullAndEmptyArrays: true: si cat[] le doc reste et cat=null
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          label: { $ifNull: ["$cat.name", "Non classée"] },
          total: 1,
          count: 1,
        },
      },
    ]);

    return rows;
  },
  // Donut: Dépenses vs Revenus (7j)
  async depensesVsRevenus7j() {
    const now = new Date();
    const since = daysAgo(7);

    const rows = await Operation.aggregate([
      { $match: { date: { $gte: since, $lte: now } } },
      { $group: { _id: "$type", total: { $sum: "$monatnt" } } },
    ]);

    const dep = rows.find((r) => r._id === "depense")?.total ?? 0;
    const rev = rows.find((r) => r._id === "revenu")?.total ?? 0;
    return [
      { name: "Dépenses", value: Number(dep) },
      { name: "Revenus", value: Number(rev) },
    ];
  },
  // Heatmap: jour x heure (7j)
  async heatmapJourHeure7j() {
    const now = new Date();
    const since = daysAgo(7);

    const rows = await Operation.aggregate([
      { $match: { date: { $gte: since, $lte: now } } },
      {
        $project: {
          day: { $dayOfWeek: "$date" }, 
          hour: { $hour: "$date" },
        },
      },
      { $group: { _id: { day: "$day", hour: "$hour" }, count: { $sum: 1 } } },
      { $sort: { "_id.day": 1, "_id.hour": 1 } },
    ]);

    return rows.map((r) => ({
      day: r._id.day - 1, // 0..6
      hour: r._id.hour,
      count: r.count,
    }));
  },
};

