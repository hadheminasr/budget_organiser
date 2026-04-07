import { Operation } from "../models/Operation.js";
import { Category } from "../models/Category.js";
import { Goal } from "../models/Goal.js";
import { Account } from "../models/Account.js";

export async function FinancierService() {

  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

  //toutes les opérations non archivées ce mois
  const operations = await Operation.find({
    archived: false,
    date: { $gte: debutMois }
  }).populate("IdCategory", "name color icon budget").lean();

  //total dépenses plateforme ce mois
  const totalDepensePlateforme = operations.reduce(
    (sum, op) => sum + Number(op.amount ?? 0), 0
  );

  //nb comptes actifs ce mois (avec au moins 1 opération)
  const idsComptes = operations.map(op => String(op.IdAccount));//transforme les opérations en ids
  const comptesActifsIds = [...new Set(idsComptes)];//supprime les doublons
  const nbComptesActifs = comptesActifsIds.length || 1;// pur éviter div sur 0

  //moyenne dépenses par compte actif
  const moyenneDepensesParCompte = Math.round(
    totalDepensePlateforme / nbComptesActifs
  );

  //dépenses groupées par catégorie (toute la plateforme)
  const depenseParCat = {};//objet faregh bch n'accumuli fih
  for (const op of operations) {// lkol operation
    const catId   = String(op.IdCategory?._id ?? "none");
    const catName = op.IdCategory?.name  ?? "Sans catégorie";
    const catColor= op.IdCategory?.color ?? "#D7A4A6";
    const catIcon = op.IdCategory?.icon  ?? "🏷️";
    // si cette categorie mahich mawjoda yet dans l'objet local , on crée sa fiche
    if (!depenseParCat[catId]) {
      depenseParCat[catId] = {
        categoryId: catId,
        name:       catName,
        color:      catColor,
        icon:       catIcon,
        total:      0,
        nbOps:      0,
      };
    }
    depenseParCat[catId].total += Number(op.amount ?? 0);
    depenseParCat[catId].nbOps += 1;
  }

  //trier par total décroissant
  const categoriesTriees = Object.values(depenseParCat)
    .sort((a, b) => b.total - a.total);
  //top 5 catégories
  const top5Categories = categoriesTriees.slice(0, 5);
  //catégorie la plus dépensée
  const topCategorie = categoriesTriees[0] ?? null;
  //budget alloué vs dépensé par catégorie
  //on prend toutes les catégories qui ont un budget défini
  const categories = await Category.find({
    budget: { $gt: 0 }
  }).lean();

  const budgetVsReel = await Promise.all(
    categories.slice(0, 8).map(async (cat) => {
      // total dépensé dans cette catégorie ce mois
      const depense = operations
        .filter(op => String(op.IdCategory?._id) === String(cat._id))
        .reduce((sum, op) => sum + Number(op.amount ?? 0), 0);

      return {
        name:    cat.name,
        color:   cat.color ?? "#D7A4A6",
        budget:  cat.budget ?? 0,
        depense,
        statut:  depense > cat.budget ? "depasse" : "respecte",
      };
    })
  );

  //% comptes ayant dépassé au moins 1 budget
  const tousLesComptes = await Account.find().lean();
  const totalComptes   = tousLesComptes.length || 1;

  // comptes avec au moins 1 dépassement ce mois
  let comptesAvecDepassement = 0;
  for (const compte of tousLesComptes) {
    const catsCompte = await Category.find({
      AccountId: compte._id,
      budget:    { $gt: 0 }
    }).lean();

    for (const cat of catsCompte) {
      const depenseCat = operations
        .filter(op =>
          String(op.IdAccount)   === String(compte._id) &&
          String(op.IdCategory?._id) === String(cat._id)
        )
        .reduce((sum, op) => sum + Number(op.amount ?? 0), 0);

      if (depenseCat > cat.budget) {
        comptesAvecDepassement++;
        break;//arrêter la boucle des catégories pour ce compte
      }
    }
  }

  const pctDepassement = Math.round(
    (comptesAvecDepassement / totalComptes) * 100
  );

  //montant total non dépensé (économies globales)
  const totalBudgets = categories.reduce(
    (sum, cat) => sum + (cat.budget ?? 0), 0
  );
  const montantNonDepense = Math.max(0, totalBudgets - totalDepensePlateforme);

  //objectifs
  const objectifsAtteints = await Goal.countDocuments({
    isAchieved: true,
    updatedAt:  { $gte: debutMois },
  });

  const totalDistribue = await Goal.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: "$currentAmount" } } }
  ]);
  const montantTotalObjectifs = totalDistribue[0]?.total ?? 0;

  //distribution scores discipline ( pour les comptes actifs)
  const scoresDistribution = { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 };

  for (const compteId of comptesActifsIds) {
    const catsCompte = await Category.find({
      AccountId: compteId,
      budget:    { $gt: 0 }
    }).lean();

    if (catsCompte.length === 0) continue;

    let catsRespectees = 0;
    for (const cat of catsCompte) {
      const depenseCat = operations
        .filter(op =>
          String(op.IdAccount)       === compteId &&
          String(op.IdCategory?._id) === String(cat._id)
        )
        .reduce((sum, op) => sum + Number(op.amount ?? 0), 0);

      if (depenseCat <= cat.budget) catsRespectees++;
    }

    const score = Math.round((catsRespectees / catsCompte.length) * 100);

    if      (score <= 25)  scoresDistribution["0-25"]++;
    else if (score <= 50)  scoresDistribution["26-50"]++;
    else if (score <= 75)  scoresDistribution["51-75"]++;
    else                   scoresDistribution["76-100"]++;
  }

  const distributionScores = Object.entries(scoresDistribution).map(
    ([range, count]) => ({ range, count })
  );

  //évolution dépenses par mois (6 derniers mois)
  const evolutionMois = [];
  for (let i = 5; i >= 0; i--) {
    const debut = new Date(now.getFullYear(), now.getMonth() - i, 1);
    /*const fin   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);*/
    const moisStr = `${debut.getFullYear()}-${String(debut.getMonth() + 1).padStart(2, "0")}`;

    const opsOfMonth = await Operation.find({
      archived: true,
      month:    moisStr,
    }).lean();

    const totalMois = opsOfMonth.reduce(
      (sum, op) => sum + Number(op.amount ?? 0), 0
    );
    //ajoute un objet représentant ce mois
    evolutionMois.push({
      month: moisStr,
      label: debut.toLocaleDateString("fr-FR", { month: "short" }),
      total: totalMois,
    });
  }

  // ajouter le mois en cours (non archivé)
  evolutionMois[evolutionMois.length - 1] = {
    ...evolutionMois[evolutionMois.length - 1],
    total: totalDepensePlateforme,
  };

  return {
    kpis: {
      totalDepensePlateforme,
      moyenneDepensesParCompte,
      topCategorie,
      pctDepassement,
      montantNonDepense,
      objectifsAtteints,
      montantTotalObjectifs,
    },
    top5Categories,
    budgetVsReel,
    distributionScores,
    evolutionMois,
  };
}