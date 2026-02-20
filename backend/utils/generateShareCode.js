import crypto from "crypto";

/**
 * Génère un code alphanumérique (A-Z + 0-9) unique en DB.
 * @param {import("mongoose").Model} AccountModel - le model Mongoose Account
 * @param {number} length - longueur du code
 * @param {number} maxAttempts - nb max de tentatives
 */
export async function generateUniqueShareCode(AccountModel, length = 8, maxAttempts = 20) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 1) Générer une string random
    const bytes = crypto.randomBytes(length);
    let code = "";
    for (let i = 0; i < length; i++) {
      code += alphabet[bytes[i] % alphabet.length];
    }

    // 2) Vérifier unicité
    const exists = await AccountModel.exists({ Sharingcode: code });
    if (!exists) return code;
  }

  throw new Error("Unable to generate unique Sharingcode (too many collisions)");
}
