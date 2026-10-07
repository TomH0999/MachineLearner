import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { QUIZ_QUESTION_COUNT } from "@/types/domain";
import { ContentValidationError, type NodeBank, type SkillNodeId } from "../../../content/schema";
import { loadContent } from "./load";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Banque valide : `questionCount` questions à 4 options et 2 flashcards. */
function makeBank(nodeId: SkillNodeId, questionCount: number): NodeBank {
  return {
    nodeId,
    questions: Array.from({ length: questionCount }, (_, i) => ({
      id: `${nodeId}-Q${pad(i + 1)}`,
      question: `Question ${i + 1} ?`,
      options: ["A", "B", "C", "D"],
      correctOptionIndex: i % 4,
      explanation: `Explication ${i + 1}.`,
    })),
    flashcards: [1, 2].map((i) => ({ id: `${nodeId}-F${pad(i)}`, front: `Recto ${i}`, back: `Verso ${i}` })),
  };
}

async function captureError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("loadContent aurait dû lever une erreur.");
}

describe("loadContent — contenu réel", () => {
  it("charge les 15 nœuds et les banques de démarrage", async () => {
    const { nodes, banks } = await loadContent();
    expect(nodes).toHaveLength(15);
    expect(banks.map((bank) => bank.nodeId)).toEqual(expect.arrayContaining(["BUT-MAT1", "BUT-ALG1"]));
  });

  it("chaque banque a assez de questions et pointe vers un nœud existant", async () => {
    const { nodes, banks } = await loadContent();
    const nodeIds = new Set(nodes.map((node) => node.id));
    for (const bank of banks) {
      expect(bank.questions.length, bank.nodeId).toBeGreaterThanOrEqual(QUIZ_QUESTION_COUNT);
      expect(nodeIds.has(bank.nodeId), bank.nodeId).toBe(true);
    }
  });

  it("les ids de questions et de flashcards sont uniques sur l'ensemble des banques", async () => {
    const { banks } = await loadContent();
    const questionIds = banks.flatMap((bank) => bank.questions.map((question) => question.id));
    const flashcardIds = banks.flatMap((bank) => bank.flashcards.map((card) => card.id));
    expect(new Set(questionIds).size).toBe(questionIds.length);
    expect(new Set(flashcardIds).size).toBe(flashcardIds.length);
  });
});

describe("loadContent — fixtures", () => {
  let banksDir: string;

  beforeEach(async () => {
    banksDir = await mkdtemp(path.join(os.tmpdir(), "engipath-banks-"));
  });

  afterEach(async () => {
    await rm(banksDir, { recursive: true, force: true });
  });

  async function writeBank(fileName: string, content: unknown): Promise<void> {
    const text = typeof content === "string" ? content : JSON.stringify(content);
    await writeFile(path.join(banksDir, fileName), text, "utf8");
  }

  it("charge un fichier BUT-MAT1.json valide de 5 questions", async () => {
    await writeBank("BUT-MAT1.json", makeBank("BUT-MAT1", 5));
    const { banks } = await loadContent({ banksDir });
    expect(banks).toHaveLength(1);
    expect(banks[0].nodeId).toBe("BUT-MAT1");
    expect(banks[0].questions).toHaveLength(5);
  });

  it("un dossier absent donne une liste de banques vide", async () => {
    const { banks } = await loadContent({ banksDir: path.join(banksDir, "absent") });
    expect(banks).toEqual([]);
  });

  it("rejette un fichier dont le nom ne correspond pas au nodeId", async () => {
    await writeBank("WRONG.json", makeBank("BUT-MAT1", 5));
    const error = await captureError(loadContent({ banksDir }));
    expect(error).toBeInstanceOf(ContentValidationError);
    expect((error as Error).message).toContain("WRONG.json");
  });

  it("rejette un JSON mal formé en citant le fichier", async () => {
    await writeBank("BUT-MAT1.json", '{ "nodeId": "BUT-MAT1", ');
    const error = await captureError(loadContent({ banksDir }));
    expect(error).toBeInstanceOf(ContentValidationError);
    expect((error as Error).message).toContain("BUT-MAT1.json");
  });

  it("regroupe les erreurs de plusieurs fichiers en une seule ContentValidationError", async () => {
    await writeBank("BUT-ALG1.json", "pas du JSON");
    await writeBank("BUT-MAT1.json", makeBank("BUT-MAT1", 2)); // moins de MIN_QUESTIONS_PER_BANK
    const error = await captureError(loadContent({ banksDir }));
    expect(error).toBeInstanceOf(ContentValidationError);
    const { message } = error as Error;
    expect(message).toContain("BUT-ALG1.json");
    expect(message).toContain("BUT-MAT1.json");
  });
});
