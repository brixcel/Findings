import { PrismaClient } from '@prisma/client';
import {
  calculateWeightedMean,
  calculateSampleSD,
  calculateFrequencies,
  getVerbalInterpretation,
  calculateIndependentTTest,
  studentT_pValue,
} from '../src/lib/statistics';
import {
  DEFAULT_QUESTIONS,
  SHARED_CRITERIA,
  getApplicableQuestions,
} from '../src/lib/questionnaire-config';

const prisma = new PrismaClient();

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 RUNNING FULL AR-DUINO-M THESIS SYSTEM QA VERIFICATION SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test 1: Questionnaire & Criteria Validation
  // -------------------------------------------------------------
  console.log('1️⃣ Verifying Questionnaire Configuration (35 Items / 30 per group)...');
  assert(DEFAULT_QUESTIONS.length === 35, 'Total questions must be exactly 35');

  const studentQuestions = getApplicableQuestions('STUDENT');
  const expertQuestions = getApplicableQuestions('EXPERT');

  assert(studentQuestions.length === 30, 'Student questions must be exactly 30');
  assert(expertQuestions.length === 30, 'Expert questions must be exactly 30');

  // Verify Maintainability NEVER in student questions
  const studentHasMaintainability = studentQuestions.some((q) => q.criterion === 'Maintainability');
  assert(!studentHasMaintainability, 'Maintainability must NEVER appear for Students');

  // Verify Educational Effectiveness NEVER in expert questions
  const expertHasEducational = expertQuestions.some((q) => q.criterion === 'Educational Effectiveness');
  assert(!expertHasEducational, 'Educational Effectiveness must NEVER appear for Experts');

  // Verify Shared Criteria count (5 criteria * 5 items each = 25 items)
  const shared = DEFAULT_QUESTIONS.filter((q) => SHARED_CRITERIA.includes(q.criterion as any));
  assert(shared.length === 25, 'Shared criteria (Func:5, Reli:5, Usab:5, Effi:5, Port:5) must equal 25 items');

  // -------------------------------------------------------------
  // Test 2: Statistical Math Engine Verification
  // -------------------------------------------------------------
  console.log('\n2️⃣ Verifying Statistical Engine & Verbal Interpretation Formulas...');
  
  // Weighted Mean verification: ratings [5, 4, 4, 5, 3] -> sum=21, n=5, mean=4.20
  const testRatings = [5, 4, 4, 5, 3];
  const mean = calculateWeightedMean(testRatings);
  assert(mean !== null && Math.abs(mean - 4.20) < 0.001, 'Weighted mean calculation [5,4,4,5,3] = 4.20');

  // Sample SD verification: [5, 4, 4, 5, 3]
  const sd = calculateSampleSD(testRatings);
  assert(sd !== null && Math.abs(sd - 0.83666) < 0.001, 'Sample standard deviation formula is correct');

  // Verbal Interpretation Scale Thresholds:
  assert(getVerbalInterpretation(5.00) === 'Very Much Acceptable', '5.00 -> Very Much Acceptable');
  assert(getVerbalInterpretation(4.21) === 'Very Much Acceptable', '4.21 -> Very Much Acceptable');
  assert(getVerbalInterpretation(4.20) === 'Much Acceptable', '4.20 -> Much Acceptable');
  assert(getVerbalInterpretation(3.41) === 'Much Acceptable', '3.41 -> Much Acceptable');
  assert(getVerbalInterpretation(3.40) === 'Acceptable', '3.40 -> Acceptable');
  assert(getVerbalInterpretation(2.61) === 'Acceptable', '2.61 -> Acceptable');
  assert(getVerbalInterpretation(2.60) === 'Less Acceptable', '2.60 -> Less Acceptable');
  assert(getVerbalInterpretation(1.81) === 'Less Acceptable', '1.81 -> Less Acceptable');
  assert(getVerbalInterpretation(1.80) === 'Not Acceptable', '1.80 -> Not Acceptable');
  assert(getVerbalInterpretation(1.00) === 'Not Acceptable', '1.00 -> Not Acceptable');

  // Frequency and Percentage calculations
  const freqs = calculateFrequencies([5, 5, 4, 3, 2]);
  assert(freqs[5].count === 2 && freqs[5].percentage === 40, 'Frequency count & % for rating 5');
  assert(freqs[4].count === 1 && freqs[4].percentage === 20, 'Frequency count & % for rating 4');
  assert(freqs[1].count === 0 && freqs[1].percentage === 0, 'Frequency count & % for rating 1 (0%)');

  // Two-Tailed t-Test and p-value calculation
  const groupA = [4.5, 4.6, 4.4, 4.8, 4.5];
  const groupB = [3.2, 3.1, 3.4, 3.0, 3.3];
  const tTestRes = calculateIndependentTTest('Test Variable', groupA, groupB);
  assert(tTestRes.tValue !== null && tTestRes.tValue > 0, 't-value computed properly');
  assert(tTestRes.pValue !== null && tTestRes.pValue < 0.001, 'p-value < 0.001 for distinct groups');
  assert(tTestRes.decision === 'Reject H₀', 'Hypothesis decision must strictly be "Reject H₀"');
  assert(tTestRes.interpretation === 'Statistically significant difference', 'Correct statistical interpretation text');

  // Equal groups test (Fail to reject H0)
  const groupC = [4.0, 4.1, 3.9, 4.0, 4.0];
  const groupD = [4.0, 3.9, 4.1, 4.0, 4.0];
  const tTestEqual = calculateIndependentTTest('Equal Test', groupC, groupD);
  assert(tTestEqual.decision === 'Fail to reject H₀', 'Decision must strictly be "Fail to reject H₀"');

  // -------------------------------------------------------------
  // Test 3: Database Scale Test (150 Synthetic Respondents / 4,500 Answers)
  // -------------------------------------------------------------
  console.log('\n3️⃣ Seeding Database with 150 Synthetic Respondents (4,500 Responses)...');

  // Clean old test records
  await prisma.respondent.deleteMany({ where: { isDemo: true } });

  const studentCount = 100;
  const expertCount = 50;

  // Insert 100 students (30 items each = 3,000)
  for (let i = 1; i <= studentCount; i++) {
    const padId = String(i).padStart(3, '0');
    await prisma.respondent.create({
      data: {
        id: `QA-STU-${padId}`,
        respondentType: 'STUDENT',
        academicProgram: 'BSCPE',
        yearLevel: '4th Year',
        deviceUsed: 'Researcher-provided device',
        status: 'COMPLETED',
        isDemo: true,
        answers: {
          create: studentQuestions.map((q) => ({
            itemId: q.itemId,
            criterion: q.criterion,
            rating: ((i + q.itemNumber) % 5) + 1,
          })),
        },
      },
    });
  }

  // Insert 50 experts (30 items each = 1,500)
  for (let i = 1; i <= expertCount; i++) {
    const padId = String(i).padStart(3, '0');
    await prisma.respondent.create({
      data: {
        id: `QA-EXP-${padId}`,
        respondentType: 'EXPERT',
        academicProgram: 'BS Computer Engineering',
        yearLevel: 'Faculty / Instructor',
        deviceUsed: 'Own device / downloaded from website',
        status: 'COMPLETED',
        isDemo: true,
        answers: {
          create: expertQuestions.map((q) => ({
            itemId: q.itemId,
            criterion: q.criterion,
            rating: ((i * 2 + q.itemNumber) % 5) + 1,
          })),
        },
      },
    });
  }

  // Verify total respondents stored
  const totalStored = await prisma.respondent.count({ where: { isDemo: true } });
  assert(totalStored === 150, '150 respondents stored successfully in SQLite database');

  const storedStudents = await prisma.respondent.count({ where: { isDemo: true, respondentType: 'STUDENT' } });
  const storedExperts = await prisma.respondent.count({ where: { isDemo: true, respondentType: 'EXPERT' } });
  assert(storedStudents === 100, 'Student count in DB is exactly 100');
  assert(storedExperts === 50, 'Expert count in DB is exactly 50');

  // Verify all 4,500 response records
  const totalAnswers = await prisma.answer.count({ where: { respondent: { isDemo: true } } });
  assert(totalAnswers === 4500, `All 4,500 response records preserved in database (found: ${totalAnswers})`);

  // -------------------------------------------------------------
  // Test 4: Database Pagination and Filtering
  // -------------------------------------------------------------
  console.log('\n4️⃣ Testing Database Pagination, Searching, and Filters...');
  
  // Page 1 (limit 20)
  const page1 = await prisma.respondent.findMany({
    where: { isDemo: true },
    skip: 0,
    take: 20,
    orderBy: { createdAt: 'desc' },
  });
  assert(page1.length === 20, 'Pagination page size = 20 returned correctly');

  // Filter by EXPERT
  const expertPage = await prisma.respondent.findMany({
    where: { isDemo: true, respondentType: 'EXPERT' },
  });
  assert(expertPage.length === 50, 'Filter by EXPERT returns exactly 50 records');

  // Search by ID prefix
  const searchResults = await prisma.respondent.findMany({
    where: { isDemo: true, id: { contains: 'QA-STU-00' } },
  });
  assert(searchResults.length === 9, 'Search by ID substring returns matching records');

  // -------------------------------------------------------------
  // Test 5: Cascade Deletion & Data Isolation
  // -------------------------------------------------------------
  console.log('\n5️⃣ Testing Foreign Key Cascading Deletions...');

  const sampleResp = await prisma.respondent.findUnique({
    where: { id: 'QA-STU-001' },
    include: { answers: true },
  });
  assert(sampleResp !== null && sampleResp.answers.length === 30, 'Respondent QA-STU-001 has 30 answers');

  // Delete single respondent
  await prisma.respondent.delete({ where: { id: 'QA-STU-001' } });
  
  // Verify cascade
  const remainingAnswers = await prisma.answer.count({ where: { respondentId: 'QA-STU-001' } });
  assert(remainingAnswers === 0, 'Cascade delete successfully removed all 30 child answers on respondent deletion');

  // Purge all demo records
  const purged = await prisma.respondent.deleteMany({ where: { isDemo: true } });
  assert(purged.count === 149, '1-Click Purge successfully cleaned all test demo records');

  const postPurgeAnswers = await prisma.answer.count({ where: { respondent: { isDemo: true } } });
  assert(postPurgeAnswers === 0, 'Zero orphaned answers remain after test suite purge');

  console.log('\n================================================================');
  console.log('🎉 ALL 12 THESIS SYSTEM QUALITY & SCALE VERIFICATIONS PASSED!');
  console.log('================================================================\n');
}

runVerification()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
