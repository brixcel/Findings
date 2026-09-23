import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  calculateFrequencies,
  calculateWeightedMean,
  calculateSampleSD,
  getVerbalInterpretation,
  calculateIndependentTTest,
  TTestResult,
} from '@/lib/statistics';
import {
  DEFAULT_QUESTIONS,
  SHARED_CRITERIA,
  getApplicableQuestions,
} from '@/lib/questionnaire-config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDemo = searchParams.get('includeDemo') === 'true';

    const whereRespondent: any = { status: 'COMPLETED' };
    if (!includeDemo) {
      whereRespondent.isDemo = false;
    }

    // 1. Fetch completed respondents with all their answers
    const respondents = await prisma.respondent.findMany({
      where: whereRespondent,
      include: {
        answers: true,
      },
    });

    const allRespondentsCount = await prisma.respondent.count({
      where: includeDemo ? {} : { isDemo: false },
    });
    const completedCount = respondents.length;
    const draftCount = await prisma.respondent.count({
      where: {
        ...(includeDemo ? {} : { isDemo: false }),
        status: 'DRAFT',
      },
    });

    const studentRespondents = respondents.filter((r) => r.respondentType === 'STUDENT');
    const expertRespondents = respondents.filter((r) => r.respondentType === 'EXPERT');

    // 2. Fetch custom question texts from DB (or fallback to DEFAULT_QUESTIONS)
    const dbQuestions = await prisma.question.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    const questionMap = new Map<string, (typeof DEFAULT_QUESTIONS)[0]>();
    for (const dq of DEFAULT_QUESTIONS) {
      questionMap.set(dq.itemId, dq);
    }
    for (const dbq of dbQuestions) {
      const existing = questionMap.get(dbq.itemId);
      if (existing) {
        questionMap.set(dbq.itemId, {
          ...existing,
          questionText: dbq.questionText,
          criterion: dbq.criterion,
        });
      }
    }

    // Helper to calculate criterion and item stats for a group of respondents
    function computeGroupStats(
      groupRespondents: typeof respondents,
      targetType: 'STUDENT' | 'EXPERT'
    ) {
      const applicable = getApplicableQuestions(targetType);
      const criteriaList = Array.from(new Set(applicable.map((q) => q.criterion)));

      const criteriaResults = criteriaList.map((criterion) => {
        const criterionQuestions = applicable.filter((q) => q.criterion === criterion);

        // Item-level stats
        const items = criterionQuestions.map((q) => {
          const config = questionMap.get(q.itemId) || q;
          const ratings = groupRespondents
            .map((r) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
            .filter((val): val is number => typeof val === 'number');

          const mean = calculateWeightedMean(ratings);
          const sd = calculateSampleSD(ratings);
          const interpretation = getVerbalInterpretation(mean);
          const frequencies = calculateFrequencies(ratings);

          return {
            itemId: q.itemId,
            itemNumber: q.itemNumber,
            questionText: config.questionText,
            n: ratings.length,
            weightedMean: mean,
            standardDeviation: sd,
            interpretation,
            frequencies,
          };
        });

        // Criterion-level aggregate:
        // Calculate respondent-level mean for this criterion, then average and SD across respondents
        const respondentCriterionMeans: number[] = [];
        for (const r of groupRespondents) {
          const rRatings = criterionQuestions
            .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
            .filter((val): val is number => typeof val === 'number');

          if (rRatings.length > 0) {
            respondentCriterionMeans.push(
              rRatings.reduce((acc, v) => acc + v, 0) / rRatings.length
            );
          }
        }

        const criterionMean = calculateWeightedMean(respondentCriterionMeans);
        const criterionSD = calculateSampleSD(respondentCriterionMeans);
        const criterionInterpretation = getVerbalInterpretation(criterionMean);

        return {
          criterion,
          n: respondentCriterionMeans.length,
          overallMean: criterionMean,
          overallSD: criterionSD,
          interpretation: criterionInterpretation,
          items,
        };
      });

      // Overall composite mean across all applicable items for this group
      const respondentOverallMeans: number[] = [];
      for (const r of groupRespondents) {
        const rRatings = applicable
          .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
          .filter((val): val is number => typeof val === 'number');

        if (rRatings.length > 0) {
          respondentOverallMeans.push(
            rRatings.reduce((acc, v) => acc + v, 0) / rRatings.length
          );
        }
      }

      const grandMean = calculateWeightedMean(respondentOverallMeans);
      const grandSD = calculateSampleSD(respondentOverallMeans);

      return {
        sampleSize: groupRespondents.length,
        criteria: criteriaResults,
        grandMean,
        grandSD,
        grandInterpretation: getVerbalInterpretation(grandMean),
      };
    }

    const studentResults = computeGroupStats(studentRespondents, 'STUDENT');
    const expertResults = computeGroupStats(expertRespondents, 'EXPERT');

    // 3. Objective 3: Independent Samples t-Test for Shared Criteria & Composite Shared Mean
    // Shared Criteria: Functionality, Reliability, Usability, Efficiency, Portability (23 items)
    const sharedQuestions = DEFAULT_QUESTIONS.filter((q) =>
      SHARED_CRITERIA.includes(q.criterion as any)
    );

    const tTestResults: TTestResult[] = [];

    // T-test per shared criterion
    for (const criterion of SHARED_CRITERIA) {
      const criterionQuestions = sharedQuestions.filter((q) => q.criterion === criterion);

      const expertCriterionMeans: number[] = [];
      for (const r of expertRespondents) {
        const ratings = criterionQuestions
          .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
          .filter((val): val is number => typeof val === 'number');
        if (ratings.length > 0) {
          expertCriterionMeans.push(ratings.reduce((a, b) => a + b, 0) / ratings.length);
        }
      }

      const studentCriterionMeans: number[] = [];
      for (const r of studentRespondents) {
        const ratings = criterionQuestions
          .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
          .filter((val): val is number => typeof val === 'number');
        if (ratings.length > 0) {
          studentCriterionMeans.push(ratings.reduce((a, b) => a + b, 0) / ratings.length);
        }
      }

      tTestResults.push(
        calculateIndependentTTest(criterion, expertCriterionMeans, studentCriterionMeans)
      );
    }

    // Composite Shared Mean (across all 23 shared items) per respondent
    const expertCompositeShared: number[] = [];
    for (const r of expertRespondents) {
      const ratings = sharedQuestions
        .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
        .filter((val): val is number => typeof val === 'number');
      if (ratings.length > 0) {
        expertCompositeShared.push(ratings.reduce((a, b) => a + b, 0) / ratings.length);
      }
    }

    const studentCompositeShared: number[] = [];
    for (const r of studentRespondents) {
      const ratings = sharedQuestions
        .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
        .filter((val): val is number => typeof val === 'number');
      if (ratings.length > 0) {
        studentCompositeShared.push(ratings.reduce((a, b) => a + b, 0) / ratings.length);
      }
    }

    tTestResults.push(
      calculateIndependentTTest(
        'Composite Shared Mean',
        expertCompositeShared,
        studentCompositeShared
      )
    );

    // Qualitative Feedback & Remarks for Chapter 4 & 5 Triangulation
    const studentRemarks = studentRespondents
      .filter((r) => r.remarks && r.remarks.trim())
      .map((r) => ({
        id: r.id,
        program: r.academicProgram,
        yearLevel: r.yearLevel,
        deviceUsed: r.deviceUsed,
        remarks: r.remarks!,
        isDemo: r.isDemo,
        createdAt: r.createdAt.toISOString(),
      }));

    const expertRemarks = expertRespondents
      .filter((r) => r.remarks && r.remarks.trim())
      .map((r) => ({
        id: r.id,
        program: r.academicProgram,
        yearLevel: r.yearLevel,
        deviceUsed: r.deviceUsed,
        remarks: r.remarks!,
        isDemo: r.isDemo,
        createdAt: r.createdAt.toISOString(),
      }));

    return NextResponse.json({
      summary: {
        totalRespondents: allRespondentsCount,
        studentCount: studentRespondents.length,
        expertCount: expertRespondents.length,
        completedCount,
        draftCount,
      },
      studentResults,
      expertResults,
      tTestResults,
      studentRemarks,
      expertRemarks,
    });
  } catch (error: any) {
    console.error('Error calculating statistics:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
