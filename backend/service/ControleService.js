import { Account } from "../models/Account.js";
import { Operation } from "../models/Operation.js";
import { Category } from "../models/Category.js";


export async function ControleService(filters = {}) {
  const { status, badge, search } = filters;

  //récupérer tous les comptes
  const accounts = await Account.find()
    .populate("Users", "name familyName email")
    .lean(); // .lean() retourne des objets JS simples, plus rapide

  //date de début du mois en cours
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

  //date d'il y a 7 jours
  const il7Jours = new Date();
  il7Jours.setDate(il7Jours.getDate() - 7);

  //construire les données pour chaque compte
  const rows = await Promise.all(
    accounts.map(async (account) => {
      const accountId = account._id;

      // opérations non archivées de ce compte
      const operations = await Operation.find({
        IdAccount: accountId,
        archived:  false,
      }).lean();

      // opérations des 7 derniers jours
      const ops7jours = operations.filter(
        op => new Date(op.date) >= il7Jours
      );

      // opérations du mois en cours
      const opsMois = operations.filter(
        op => new Date(op.date) >= debutMois
      );

      // est-ce que le compte a eu une activité ces 7 jours 
      const estActif7j = ops7jours.length > 0;

      // catégories du compte
      const categories = await Category.find({
        AccountId: accountId
      }).lean();

      // dépassement budget pour chaque catégorie
      // on compare ce qui a été dépensé vs le budget
      let aDepasseBudget = false;
      for (const cat of categories) {
        const budget = Number(cat.budget ?? 0);
        if (budget <= 0) continue; // pas de budget défini → on skip

        // total dépensé dans cette catégorie ce mois
        const totalDepenseCat = opsMois
          .filter(op => String(op.IdCategory) === String(cat._id))
          .reduce((sum, op) => sum + Number(op.amount ?? 0), 0);

        if (totalDepenseCat > budget) {
          aDepasseBudget = true;
          break; // un seul dépassement suffit
        }
      }

      // anomalie — dépense anormalement élevée
      // on calcule la moyenne et l'écart-type de toutes les dépenses
      const montants = operations.map(op => Number(op.amount ?? 0));
      
      const moyenne = montants.length > 0
        ? montants.reduce((s, v) => s + v, 0) / montants.length
        : 0;

      const ecartType = montants.length > 1
        ? Math.sqrt(
            montants.reduce((s, v) => s + (v - moyenne) ** 2, 0) / montants.length
          )
        : 0;

      const seuilAnomalie = moyenne + 2 * ecartType;

      // est-ce qu'une dépense récente dépasse le seuil ?
      const aAnomalie = ops7jours.some(
        op => Number(op.amount) > seuilAnomalie && seuilAnomalie > 0
      );

      // score santé — sur 100
      // commence à 100 et on retire des points selon les problèmes
      let scoreSante = 100;
      if (!estActif7j)     scoreSante -= 30; // inactif
      if (aDepasseBudget)  scoreSante -= 25; // dépassement budget
      if (aAnomalie)       scoreSante -= 35; // anomalie détectée
      if (account.isBlocked) scoreSante -= 10; // compte bloqué
      scoreSante = Math.max(0, Math.min(100, scoreSante)); // entre 0 et 100

      // badges — liste des problèmes détectés
      const badges = [];
      if (aDepasseBudget)    badges.push("budget");
      if (aAnomalie)         badges.push("anomalie");
      if (!estActif7j)       badges.push("inactif");
      if (account.isBlocked) badges.push("bloqué");

      // email du créateur du compte
      const createur = account.Users?.find(
        u => String(u._id) === String(account.createdBy)
      );

      return {
        _id:           accountId,
        nomCompte:     account.nameAccount ?? "Sans nom",
        nbMembres:     account.Users?.length ?? 0,
        type:          (account.Users?.length ?? 0) > 1 ? "shared" : "personal",
        status:        account.isBlocked ? "blocked" : "active",
        solde:         account.solde ?? 0,
        reste:         account.reste ?? 0,
        lastResetMonth:account.lastResetMonth ?? null,
        badges,
        scoreSante,
        emailCreateur: createur?.email ?? "—",
        estActif7j,
        aDepasseBudget,
        aAnomalie,
      };
    })
  );

  //appliquer les filtres
  let rowsFiltrees = [...rows];

  // filtre par status
  if (status === "active")  rowsFiltrees = rowsFiltrees.filter(r => r.status === "active");
  if (status === "blocked") rowsFiltrees = rowsFiltrees.filter(r => r.status === "blocked");
  // filtre par badge
  if (badge) rowsFiltrees = rowsFiltrees.filter(r => r.badges.includes(badge));
  // filtre par recherche (nom ou email)
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    rowsFiltrees = rowsFiltrees.filter(
      r => r.nomCompte.toLowerCase().includes(q) ||
           r.emailCreateur.toLowerCase().includes(q)
    );
  }

  //calculer les KPIs globaux (sur TOUS les comptes, pas les filtrés)
  const total = rows.length || 1;

  const kpis = {
    totalComptes:        rows.length,
    comptesActifs:       rows.filter(r => r.status === "active").length,
    comptesBloqués:      rows.filter(r => r.status === "blocked").length,
    comptesPartages:     rows.filter(r => r.type === "shared").length,
    tauxActivite:        Math.round((rows.filter(r => r.estActif7j).length / total) * 100),
    santeMoyenne:        Math.round(rows.reduce((s, r) => s + r.scoreSante, 0) / total),
    pctDepassement:      Math.round((rows.filter(r => r.aDepasseBudget).length / total) * 100),
    pctAnomalies:        Math.round((rows.filter(r => r.aAnomalie).length / total) * 100),
    pctDormants:         Math.round((rows.filter(r => !r.estActif7j).length / total) * 100),
  };

  return { kpis, accounts: rowsFiltrees };
}