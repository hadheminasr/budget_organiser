import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { AccountProfile } from "../../models/AccountProfile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// adapte ce chemin selon ton vrai emplacement
const PYTHON_SCRIPT_PATH = path.resolve(
  __dirname,
  "C:\\Users\\DELL I5\\Desktop\\ML_Budget_organiser\\persona\\predict_persona.py"
);

// selon ton PC: "python" ou "py"
const PYTHON_COMMAND = "C:/Users/DELL I5/Downloads/thonny-4.1.7-windows-portable/python.exe";

/**
 * Récupère le vrai AccountProfile d'un compte.
 */
export async function getAccountProfileForPersona(accountId) {
  const profile = await AccountProfile.findOne({ accountId }).lean();

  if (!profile) {
    const error = new Error("AccountProfile introuvable pour ce compte");
    error.statusCode = 404;
    throw error;
  }

  return profile;
}

/**
 * Lance le script Python predict_persona.py
 * et retourne le JSON prédit.
 */
export function runPersonaPredictionPython(profile) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(profile);

    const py = spawn(PYTHON_COMMAND, [PYTHON_SCRIPT_PATH, payload], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    py.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `predict_persona.py failed (code ${code}) - ${stderr || stdout}`
          )
        );
      }

      try {
        const parsed = JSON.parse(stdout.trim());

        if (!parsed.success) {
          return reject(
            new Error(parsed.error || "La prédiction persona a échoué")
          );
        }

        resolve(parsed);
      } catch (err) {
        reject(
          new Error(`Réponse JSON invalide retournée par Python: ${stdout}`)
        );
      }
    });
  });
}

/**
 * Fonction principale appelée par le reste du backend.
 */
export async function getPersonaSignal(accountId) {
  const profile = await getAccountProfileForPersona(accountId);
  const prediction = await runPersonaPredictionPython(profile);

  return {
    clusterId: prediction.persona_cluster,
    clusterLabel: prediction.persona_label,
    encodedFeatures: prediction.encoded_features ?? null,
    source: "python_persona_v2",
  };
}