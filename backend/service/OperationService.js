import { Operation } from "../models/Operation.js";
import { Category } from "../models/Category.js";
import { Account } from "../models/Account.js";
import { User } from "../models/User.js";
import { ActivityLogService } from "./ActivityLogService.js"; 
         

export const OperationService = {
  async AddOperation(data, userId, IdAccount) {
    const { amount, date, categoryId } = data;

    const category = await Category.findById(categoryId);
    if (!category) throw new Error("Catégorie introuvable");

    const op = await Operation.create({
      amount, date, IdAccount,
      createdBy: userId,
      IdCategory: category._id,
    });

    await Account.findByIdAndUpdate(IdAccount, { $inc: { solde: -amount } });

    // ── log ──────────────────────────────────────────────────────
    const user = await User.findById(userId).select("name");
    console.log("user found:", user);
    await ActivityLogService.log(
      IdAccount,
      userId, 
      user?.name,
      "operation.add", 
      "operation", 
      op._id,
      { amount, category: category.name, date }
    );
    // ─────────────────────────────────────────────────────────────

    return op;
  },

  async UpdateOperation(updates, IdOperation) {
    const oldOp = await Operation.findById(IdOperation);
    if (!oldOp) throw new Error("Operation not found");

    await Account.findByIdAndUpdate(oldOp.IdAccount, { $inc: { solde: +oldOp.amount } });
    const newAmount = updates.amount ?? oldOp.amount;
    await Account.findByIdAndUpdate(oldOp.IdAccount, { $inc: { solde: -newAmount } });

    const operation = await Operation.findByIdAndUpdate(
      IdOperation, { $set: updates }, { new: true }
    );

    // ── log ──────────────────────────────────────────────────────
    const user = await User.findById(oldOp.createdBy).select("name");
    await ActivityLogService.log(
      oldOp.IdAccount, oldOp.createdBy, user?.name,
      "operation.update", "operation", IdOperation,
      { old: { amount: oldOp.amount }, new: { amount: newAmount } }
    );
    // ─────────────────────────────────────────────────────────────

    return operation;
  },

  async DeleteOperation(IdOperation) {
    const operation = await Operation.findById(IdOperation);
    if (!operation) throw new Error("Operation not found");

    await Account.findByIdAndUpdate(operation.IdAccount, { $inc: { solde: +operation.amount } });
    await Operation.findByIdAndDelete(IdOperation);

    // ── log ──────────────────────────────────────────────────────
    const user = await User.findById(operation.createdBy).select("name");
    await ActivityLogService.log(
      operation.IdAccount, operation.createdBy, user?.name,
      "operation.delete", "operation", IdOperation,
      { amount: operation.amount }
    );
    // ─────────────────────────────────────────────────────────────

    return true;
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