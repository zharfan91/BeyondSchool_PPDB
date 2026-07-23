import { prisma } from "./prisma";

const CRITERIA_NAME = "Tes Masuk";
// Fallback weight when a test somehow has none configured. Admin can tune the
// real weight per test via Test.selectionWeight.
const DEFAULT_CRITERIA_WEIGHT = 0.3;

/**
 * Sums every answer's pointsAwarded for an attempt, marks it GRADED, and
 * pushes the result into the applicant's SelectionCriteriaScore (creating a
 * PENDING SelectionResult first if one doesn't exist yet). Only call this
 * once every answer in the attempt actually has a non-null pointsAwarded —
 * callers are responsible for that check (auto-graded on submit when there
 * are no essay questions, or once a grader finishes the last essay answer).
 *
 * SelectionResult.score is NOT simply set to the test's raw score — other
 * criteria (academic grade, achievements, etc.) may already exist on the same
 * SelectionResult from elsewhere in the app. This recomputes score as the
 * weight-normalized average of every criterion's percentage (score/maxScore),
 * so adding a test score never clobbers pre-existing scoring on other axes.
 */
export async function finalizeAttemptScore(attemptId: string) {
  const attempt = await prisma.testAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { answers: { include: { question: true } }, test: true },
  });

  const criteriaWeight = Number(attempt.test.selectionWeight ?? DEFAULT_CRITERIA_WEIGHT);

  const totalScore = attempt.answers.reduce(
    (sum, a) => sum + Number(a.pointsAwarded ?? 0),
    0
  );
  const maxScore = attempt.answers.reduce((sum, a) => sum + a.question.points, 0);

  await prisma.testAttempt.update({
    where: { id: attemptId },
    data: {
      status: "GRADED",
      gradedAt: new Date(),
      totalScore,
      maxScore,
    },
  });

  let selectionResult = await prisma.selectionResult.findUnique({
    where: { registrationId: attempt.registrationId },
    include: { criteriaScores: true },
  });
  if (!selectionResult) {
    selectionResult = await prisma.selectionResult.create({
      data: { registrationId: attempt.registrationId, status: "PENDING" },
      include: { criteriaScores: true },
    });
  }

  const existingCriteria = selectionResult.criteriaScores.find((c) => c.criteriaName === CRITERIA_NAME);
  if (existingCriteria) {
    await prisma.selectionCriteriaScore.update({
      where: { id: existingCriteria.id },
      data: { score: totalScore, maxScore, weight: criteriaWeight },
    });
  } else {
    await prisma.selectionCriteriaScore.create({
      data: {
        selectionResultId: selectionResult.id,
        criteriaName: CRITERIA_NAME,
        score: totalScore,
        maxScore,
        weight: criteriaWeight,
      },
    });
  }

  const allCriteria = await prisma.selectionCriteriaScore.findMany({
    where: { selectionResultId: selectionResult.id },
  });
  const totalWeight = allCriteria.reduce((sum, c) => sum + Number(c.weight), 0);
  const weightedScore =
    totalWeight > 0
      ? allCriteria.reduce((sum, c) => {
          const percent = Number(c.maxScore) > 0 ? (Number(c.score) / Number(c.maxScore)) * 100 : 0;
          return sum + percent * Number(c.weight);
        }, 0) / totalWeight
      : 0;

  await prisma.selectionResult.update({
    where: { id: selectionResult.id },
    data: { score: weightedScore },
  });

  return { totalScore, maxScore, overallScore: weightedScore };
}
