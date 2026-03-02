import { Operation } from "../models/Operation.js";
import { Category } from "../models/Category.js";
import { Account } from "../models/Account.js";
export const OperationService={
  async AddOperation(data, userId, IdAccount) {
  const { amount, date, type, categoryId } = data;

  const category = await Category.findById(categoryId);
  if (!category) throw new Error("Catégorie introuvable");

  const op = await Operation.create({
    amount,
    date,
    type,
    IdAccount,
    createdBy: userId,
    IdCategory: category._id,
  });

  const delta = type === "revenue" ? +amount : -amount;
  await Account.findByIdAndUpdate(IdAccount, { $inc: { solde: delta } });
  return op;
},
  async UpdateOperation (updates, IdOperation){
    const oldOp = await Operation.findById(IdOperation);
    if (!oldOp) throw new Error("Operation not found");

    const oldDelta = oldOp.type === "revenue" ? -oldOp.amount : +oldOp.amount;
    await Account.findByIdAndUpdate(oldOp.IdAccount, { $inc: { solde: oldDelta } });

    const newType   = updates.type   ?? oldOp.type;
    const newAmount = updates.amount ?? oldOp.amount;
    const newDelta  = newType === "revenue" ? +newAmount : -newAmount;
    await Account.findByIdAndUpdate(oldOp.IdAccount, { $inc: { solde: newDelta } });
    const operation = await Operation.findByIdAndUpdate(
      IdOperation,
      { $set: updates },
      { new: true }
    );
    return operation;
},

  async DeleteOperation (IdOperation){
    const operation = await Operation.findById(IdOperation);
    if (!operation) throw new Error("Operation not found");

    const delta = operation.type === "revenue" ? -operation.amount : +operation.amount;
    await Account.findByIdAndUpdate(operation.IdAccount, { $inc: { solde: delta } });

    await Operation.findByIdAndDelete(IdOperation);
    return true;

  },
  async getAllOperations(AccountId) {
  const operations = await Operation.find({ IdAccount: AccountId })
    .populate("IdCategory", "name icon color") 
    .sort({ date: -1 }); 
  return operations;
},
}
