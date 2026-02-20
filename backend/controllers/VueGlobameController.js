import { VueGlobale } from "../service/index.js";

export const getVueGlobale = async (req, res) => {
  try {
    const [kpis, operationsParJour, top5, donut, heatmap] = await Promise.all([
      VueGlobale.KPI(),
      VueGlobale.operationsParJour7j(),
      VueGlobale.top5CategoriesDepenses7j(),
      VueGlobale.depensesVsRevenus7j(),
      VueGlobale.heatmapJourHeure7j(),
    ]);

    return res.json({
      success: true,
      data: {
        kpis,
        charts: {
          operationsParJour7j: operationsParJour,
          top5CategoriesDepenses7j: top5,
          depensesVsRevenus7j: donut,
          heatmapJourHeure7j: heatmap,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Erreur serveur",
    });
  }
};
