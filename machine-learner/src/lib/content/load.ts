import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { assertValidSkillGraph } from "@/lib/skill-tree/graph";
import { SKILL_TREE } from "../../../content/skill-tree";
import {
  ContentValidationError,
  parseNodeBank,
  validateSeedNodes,
  type NodeBank,
  type SeedNode,
} from "../../../content/schema";

/**
 * Chargeur du contenu pédagogique (Node uniquement : seed tsx et Vitest).
 * Lecture de fichiers seulement, aucun accès à la base ; pas de "server-only" pour rester utilisable hors Next.
 */

export interface LoadedContent {
  nodes: readonly SeedNode[];
  banks: readonly NodeBank[];
}

export interface LoadContentOptions {
  banksDir?: string; // par défaut : path.join(process.cwd(), "content", "banks")
}

function isMissingDirectory(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Fichiers *.json du dossier, triés par nom ; dossier absent = aucune banque. */
async function listBankFiles(banksDir: string): Promise<string[]> {
  try {
    const entries = await readdir(banksDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if (isMissingDirectory(error)) return [];
    throw error;
  }
}

/**
 * Valide le Skill Tree puis lit toutes les banques. Toutes les erreurs des banques sont
 * collectées avant de lever une unique ContentValidationError : rien n'est écrit si le contenu est invalide.
 */
export async function loadContent(options?: LoadContentOptions): Promise<LoadedContent> {
  assertValidSkillGraph(SKILL_TREE);
  const nodeErrors = validateSeedNodes(SKILL_TREE);
  if (nodeErrors.length > 0) {
    throw new ContentValidationError(
      [`content/skill-tree.ts : ${nodeErrors.length} erreur(s) de contenu`, ...nodeErrors.map((e) => `  - ${e}`)].join(
        "\n",
      ),
    );
  }

  const banksDir = options?.banksDir ?? path.join(process.cwd(), "content", "banks");
  const errors: string[] = [];
  const fileByNodeId = new Map<string, string>();
  const bankByNodeId = new Map<string, NodeBank>();

  for (const fileName of await listBankFiles(banksDir)) {
    const text = await readFile(path.join(banksDir, fileName), "utf8");

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch (error) {
      errors.push(`${fileName} : JSON invalide (${errorMessage(error)})`);
      continue;
    }

    let bank: NodeBank;
    try {
      bank = parseNodeBank(raw, fileName);
    } catch (error) {
      errors.push(errorMessage(error));
      continue;
    }

    if (!SKILL_TREE.some((node) => node.id === bank.nodeId)) {
      errors.push(`${fileName} : nodeId « ${bank.nodeId} » absent de content/skill-tree.ts.`);
    }

    const expectedName = `${bank.nodeId}.json`;
    if (fileName !== expectedName) {
      errors.push(`${fileName} : nodeId « ${bank.nodeId} », le fichier doit s'appeler « ${expectedName} ».`);
    }

    const previousFile = fileByNodeId.get(bank.nodeId);
    if (previousFile !== undefined) {
      errors.push(`${fileName} : nodeId « ${bank.nodeId} » déjà défini dans ${previousFile}.`);
      continue;
    }
    fileByNodeId.set(bank.nodeId, fileName);
    bankByNodeId.set(bank.nodeId, bank);
  }

  if (errors.length > 0) {
    throw new ContentValidationError(
      [`content/banks : ${errors.length} erreur(s) de contenu`, ...errors.map((e) => `- ${e}`)].join("\n"),
    );
  }

  const banks = SKILL_TREE.flatMap((node) => {
    const bank = bankByNodeId.get(node.id);
    return bank === undefined ? [] : [bank];
  });
  return { nodes: SKILL_TREE, banks };
}
