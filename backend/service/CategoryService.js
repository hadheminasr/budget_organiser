import { Category } from "../models/Category.js";
import { User } from "../models/User.js";
import { ActivityLogService } from "./ActivityLogService.js"; // ← ajout

export const CategoryService = {
  async addCategory(data, AccountId, userId) {
    const { name, color, budget, icon, normalizedGroup } = data;

    const category = await Category.create({
      name, color, budget, icon, normalizedGroup,
      AccountId,
      createdBy: userId,
      isDefault: false,
    });

    // ── log ──────────────────────────────────────────────────────
    const user = await User.findById(userId).select("name");
    await ActivityLogService.log(
      AccountId, userId, user?.name,
      "category.add", "category", category._id,
      { name: category.name, budget: category.budget }
    );
    // ─────────────────────────────────────────────────────────────

    return category;
  },

  async UpdateCategory(updates, IdCategory, userId, AccountId) {
    const old = await Category.findById(IdCategory);
    if (!old) throw new Error("Category not found");

    const category = await Category.findByIdAndUpdate(
      IdCategory, { $set: updates }, { new: true }
    );

    // ── log ──────────────────────────────────────────────────────
    const user = await User.findById(userId).select("name");
    await ActivityLogService.log(
      AccountId, userId, user?.name,
      "category.update", "category", IdCategory,
      { name: category.name, oldBudget: old.budget, newBudget: category.budget }
    );
    // ─────────────────────────────────────────────────────────────

    return category;
  },

  async DeleteCategory(IdCategory, userId, AccountId) {
    const category = await Category.findByIdAndDelete(IdCategory);
    if (!category) throw new Error("Category not found");

    // ── log ──────────────────────────────────────────────────────
    const user = await User.findById(userId).select("name");
    await ActivityLogService.log(
      AccountId, userId, user?.name,
      "category.delete", "category", IdCategory,
      { name: category.name }
    );
    // ─────────────────────────────────────────────────────────────

    return true;
  },

  async getAllCategories(AccountId) {
    const categories = await Category.find({ AccountId });
    if (!categories) throw new Error("no Categories yet");
    return categories;
  }
};