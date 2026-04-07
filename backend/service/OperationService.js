import { Operation } from "../models/Operation.js";
import { Category } from "../models/Category.js";
import { Account } from "../models/Account.js";
import { User } from "../models/User.js";
import { ActivityLogService } from "./ActivityLogService.js"; 
         

export const OperationService = {
  async AddOperation(data, userId, IdAccount) {
  const { date, categoryId, description } = data;
  const amount = Number(data.amount);


  const category = await Category.findById(categoryId);
  if (!category) throw new Error("Catégorie introuvable");

  const account = await Account.findById(IdAccount);
  console.log("account trouvé :", account?._id, "solde :", account?.solde);
  console.log("account trouvé :", account?._id, "reste :", account?.reste);
  if (!account) throw new Error("Compte introuvable");

  // ── calcul déjà dépensé dans cette catégorie ce mois
  const currentMonth = new Date(date ?? Date.now()).toISOString().slice(0, 7);

  const dejaDepense = await Operation.aggregate([
    {
      $match: {
        IdAccount:  account._id,
        IdCategory: category._id,
        month:      currentMonth,
        archived:   false,
      }
    },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const totalDejaDepense = dejaDepense[0]?.total ?? 0;
  const budgetCategorie  = category.budget ?? 0;
  const restebudget      = budgetCategorie - totalDejaDepense;

  // ── calcul dépassement
  const depassement      = budgetCategorie > 0 && (totalDejaDepense + amount) > budgetCategorie;
  const montantDepasse   = depassement ? (totalDejaDepense + amount) - budgetCategorie : 0;

  // ── vérification solde suffisant
  if (amount > account.solde) {
    const err = new Error("Solde insuffisant");
    err.status = 400;
    throw err;
  }

  console.log("totalDejaDepense :", totalDejaDepense);
console.log("amount :", amount);
console.log("budgetCategorie :", budgetCategorie);
console.log("depassement :", depassement);
console.log("montantDepasse :", montantDepasse);
console.log("account.reste :", account.reste);



  // ── si dépassement → vérifier que le reste couvre le dépassement
  if (depassement && montantDepasse > account.reste) {
    console.log(account.reste);
    const err = new Error("Reste insuffisant pour couvrir le dépassement");
    err.status = 400;
    throw err;
  }

  // ── création opération
  const op = await Operation.create({
    amount,
    date,
    IdAccount,
    createdBy:  userId,
    IdCategory: category._id,
    description,
    month:      currentMonth,
  });

  // ── décrémenter solde
  await Account.findByIdAndUpdate(IdAccount, { 
    $inc: { solde: -amount } 
  });
  console.log("account.reste :", account.reste);
  console.log("montantDepasse :", montantDepasse);

  // ── si dépassement → décrémenter aussi le reste
  if (depassement && montantDepasse > 0) {
    await Account.findByIdAndUpdate(IdAccount, {
      $inc: { reste: -montantDepasse }
    });
  }

  // ── log
  const user = await User.findById(userId).select("name");
  await ActivityLogService.log(
    IdAccount, userId, user?.name,
    "operation.add", "operation", op._id,
    { amount, category: category.name, date }
  );


  console.log("account.reste :", account.reste);
  console.log("montantDepasse :", montantDepasse);
  return {
    operation:       op,
    depassement,
    budgetCategorie,
    nouveauTotal:    totalDejaDepense + amount,
    resteCategorie:  Math.max(0, restebudget - amount),
    montantDepasse,
  };
},


  async DeleteOperation(IdOperation) {
  const operation = await Operation.findById(IdOperation);
  if (!operation) throw new Error("Operation not found");

  const category = await Category.findById(operation.IdCategory);
  const budgetCategorie = category?.budget ?? 0;

  // calcul total dépensé dans cette catégorie SANS cette op
  const dejaDepense = await Operation.aggregate([
    {
      $match: {
        IdAccount:  operation.IdAccount,
        IdCategory: operation.IdCategory,
        month:      operation.month,
        archived:   false,
        _id:        { $ne: operation._id }
      }
    },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const totalSansOp  = dejaDepense[0]?.total ?? 0;
  const totalAvecOp  = totalSansOp + operation.amount;

  // est-ce que cette op causait un dépassement ?
  const causaitDepassement = budgetCategorie > 0 && totalAvecOp > budgetCategorie;

  // combien à restituer au reste ?
  const aRestituerAuReste = causaitDepassement
    ? Math.min(operation.amount, totalAvecOp - budgetCategorie)
    : 0;

  // supprimer l'op
  await Operation.findByIdAndDelete(IdOperation);

  // remettre dans le solde
  await Account.findByIdAndUpdate(operation.IdAccount, {
    $inc: { solde: +operation.amount }
  });

  // remettre dans le reste si dépassement
  if (aRestituerAuReste > 0) {
    await Account.findByIdAndUpdate(operation.IdAccount, {
      $inc: { reste: +aRestituerAuReste }
    });
  }

  // log
  const user = await User.findById(operation.createdBy).select("name");
  await ActivityLogService.log(
    operation.IdAccount, operation.createdBy, user?.name,
    "operation.delete", "operation", IdOperation,
    { amount: operation.amount }
  );

  return true;
},

async UpdateOperation(updates, IdOperation) {
  const oldOp = await Operation.findById(IdOperation);
  if (!oldOp) throw new Error("Operation not found");

  const newAmount = Number(updates.amount ?? oldOp.amount);
  const category  = await Category.findById(oldOp.IdCategory);
  const budgetCategorie = category?.budget ?? 0;

  // calcul total SANS l'ancienne op
  const dejaDepense = await Operation.aggregate([
    {
      $match: {
        IdAccount:  oldOp.IdAccount,
        IdCategory: oldOp.IdCategory,
        month:      oldOp.month,
        archived:   false,
        _id:        { $ne: oldOp._id }
      }
    },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const totalSansOp = dejaDepense[0]?.total ?? 0;

  // dépassement avec ancien montant
  const totalAvecAncien   = totalSansOp + oldOp.amount;
  const depassementAncien = budgetCategorie > 0 && totalAvecAncien > budgetCategorie;
  const depasse_ancien    = depassementAncien
    ? Math.min(oldOp.amount, totalAvecAncien - budgetCategorie)
    : 0;

  // dépassement avec nouveau montant
  const totalAvecNouveau   = totalSansOp + newAmount;
  const depassementNouveau = budgetCategorie > 0 && totalAvecNouveau > budgetCategorie;
  const depasse_nouveau    = depassementNouveau
    ? Math.min(newAmount, totalAvecNouveau - budgetCategorie)
    : 0;

  // différence de dépassement → impact sur le reste
  const diffReste = depasse_ancien - depasse_nouveau;

  // update solde
  await Account.findByIdAndUpdate(oldOp.IdAccount, {
    $inc: { solde: oldOp.amount - newAmount }
  });

  // update reste
  if (diffReste !== 0) {
    await Account.findByIdAndUpdate(oldOp.IdAccount, {
      $inc: { reste: diffReste }
    });
  }

  // update l'opération
  const operation = await Operation.findByIdAndUpdate(
    IdOperation, { $set: updates }, { new: true }
  );

  // log
  const user = await User.findById(oldOp.createdBy).select("name");
  await ActivityLogService.log(
    oldOp.IdAccount, oldOp.createdBy, user?.name,
    "operation.update", "operation", IdOperation,
    { old: { amount: oldOp.amount }, new: { amount: newAmount } }
  );

  return operation;
},
  async getAllOperations(AccountId) {
    const operations = await Operation.find({ IdAccount: AccountId })
      .populate("IdCategory", "name icon color")
      .sort({ date: -1 });
    return operations;
  },

  async getOperationsGroupedByCategory(AccountId) {
    const operations = await Operation.find({ 
      IdAccount: AccountId,
      archived: { $ne: true }
    })
      .populate("IdCategory", "name color budget")
      .sort({ date: -1 });

    const groups = operations.reduce((acc, op) => {
      const catId = op.IdCategory?._id?.toString() ?? "none";
      acc[catId] = acc[catId] ?? { info: op.IdCategory, ops: [], total: 0 };
      acc[catId].ops.push(op);
      acc[catId].total += op.amount;
      return acc;
    }, {});

    return Object.values(groups);
  },



};