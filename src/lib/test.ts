import { prisma } from "./prisma";
import type { Prisma, TestQuestion, TestQuestionOption, TestQuestionType } from "@prisma/client";

/**
 * One Test row per academic period. Ensures the active period's Test exists,
 * creating it (unpublished, no time limit) on first access. Returns null when
 * no academic period is currently active.
 */
export async function getOrCreateActiveTest() {
  const activePeriod = await prisma.academicPeriod.findFirst({ where: { isActive: true } });
  if (!activePeriod) return null;

  return prisma.test.upsert({
    where: { academicPeriodId: activePeriod.id },
    update: {},
    create: { academicPeriodId: activePeriod.id },
  });
}

/** true/false questions are stored as two options; auto-gradable like MC. */
export const OBJECTIVE_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"] as const;

export function normalizeShortAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Deterministic shuffle seeded by a string — same seed always yields the same
 * order. Used to shuffle a question's options stably per attempt (seed =
 * attemptId + questionId) without persisting the order.
 */
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns the points an objective answer earns, or null if the question needs
 * manual grading (ESSAY). Awards all-or-nothing per question.
 */
export function autoGradePoints(
  question: TestQuestion & { options: TestQuestionOption[] },
  answer: { selectedOptionId: string | null; essayAnswer: string | null }
): number | null {
  if (question.type === "ESSAY") return null;

  if (question.type === "SHORT_ANSWER") {
    const accepted = Array.isArray(question.acceptedAnswers)
      ? (question.acceptedAnswers as unknown[]).map((a) => normalizeShortAnswer(String(a)))
      : [];
    const given = answer.essayAnswer ? normalizeShortAnswer(answer.essayAnswer) : "";
    return given && accepted.includes(given) ? question.points : 0;
  }

  // MULTIPLE_CHOICE and TRUE_FALSE both resolve via the selected option.
  const selected = question.options.find((o) => o.id === answer.selectedOptionId);
  return selected?.isCorrect ? question.points : 0;
}

export interface OptionInput {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionInput {
  type?: TestQuestionType;
  question?: string;
  points?: number;
  order?: number;
  options?: OptionInput[];
  essayAnswerKey?: string;
  acceptedAnswers?: string[];
  correctBool?: boolean; // for TRUE_FALSE
}

/**
 * Validates a question payload and returns the Prisma create-data (minus
 * test/order relation), or an error string. Shared by single-create and
 * bulk-import.
 */
export function buildQuestionData(
  input: QuestionInput
): { error: string } | { data: Omit<Prisma.TestQuestionCreateInput, "test" | "order"> } {
  const { type, question, points } = input;

  if (!type || !["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"].includes(type)) {
    return { error: "Tipe soal tidak valid" };
  }
  if (!question || !question.trim()) {
    return { error: "Teks soal wajib diisi" };
  }

  const base = {
    type,
    question: question.trim(),
    points: points && points > 0 ? Math.floor(points) : 1,
  };

  if (type === "MULTIPLE_CHOICE") {
    const options = (input.options ?? []).filter((o) => o.text.trim());
    if (options.length < 2) return { error: "Pilihan ganda butuh minimal 2 opsi" };
    if (!options.some((o) => o.isCorrect)) return { error: "Tandai satu opsi sebagai kunci jawaban yang benar" };
    return {
      data: { ...base, options: { create: options.map((o) => ({ label: o.label, text: o.text.trim(), isCorrect: !!o.isCorrect })) } },
    };
  }

  if (type === "TRUE_FALSE") {
    if (typeof input.correctBool !== "boolean") return { error: "Tentukan jawaban benar (Benar/Salah)" };
    return {
      data: {
        ...base,
        options: {
          create: [
            { label: "B", text: "Benar", isCorrect: input.correctBool === true },
            { label: "S", text: "Salah", isCorrect: input.correctBool === false },
          ],
        },
      },
    };
  }

  if (type === "SHORT_ANSWER") {
    const accepted = (input.acceptedAnswers ?? []).map((a) => a.trim()).filter(Boolean);
    if (accepted.length === 0) return { error: "Isi minimal satu jawaban yang diterima" };
    return { data: { ...base, acceptedAnswers: accepted } };
  }

  // ESSAY
  if (!input.essayAnswerKey || !input.essayAnswerKey.trim()) {
    return { error: "Kunci jawaban/rubrik esai wajib diisi" };
  }
  return { data: { ...base, essayAnswerKey: input.essayAnswerKey.trim() } };
}
