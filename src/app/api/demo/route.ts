import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getApplicableQuestions } from '@/lib/questionnaire-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const demoCount = await prisma.respondent.count({ where: { isDemo: true } });
    const realCount = await prisma.respondent.count({ where: { isDemo: false } });
    const demoStudentCount = await prisma.respondent.count({
      where: { isDemo: true, respondentType: 'STUDENT' },
    });
    const demoExpertCount = await prisma.respondent.count({
      where: { isDemo: true, respondentType: 'EXPERT' },
    });
    const demoAnswersCount = await prisma.answer.count({
      where: { respondent: { isDemo: true } },
    });

    return NextResponse.json({
      demoCount,
      realCount,
      demoStudentCount,
      demoExpertCount,
      demoAnswersCount,
    });
  } catch (error: any) {
    console.error('Error fetching demo data status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const studentCount = typeof body.students === 'number' ? body.students : 100;
    const expertCount = typeof body.experts === 'number' ? body.experts : 50;

    const programs = ['BSCPE', 'BS Computer Engineering', 'BS Computer Science', 'BS Information Technology', 'BS Electronics Engineering'];
    const studentYears = ['3rd Year', '4th Year'];
    const expertYears = ['Faculty / Instructor', 'Industry Specialist', 'Embedded Systems Researcher'];
    const devices = ['Researcher-provided device', 'Own device / downloaded from website'];

    const studentFeedbackSamples = [
      'The AR visualization makes pinout identification significantly faster during breadboard assembly.',
      'User interface is clean and responsive. Suggest adding a night mode in future versions.',
      'Helped me understand microcontroller register concepts much better than static textbooks.',
      'Augmented Reality tracking was very stable even under low classroom lighting conditions.',
      'Simulation outputs closely matched real-time oscilloscope multimeter readings.',
      'Very intuitive user experience, highly recommended for engineering laboratory classes.',
      'Navigation between menus was fluid with minimal delay on mobile device.',
      'Great step-by-step guidance for microcontroller pin configurations.',
    ];

    const expertFeedbackSamples = [
      'Excellent implementation of ISO 25010 standards. Architecture demonstrates solid modularity.',
      'Recommend integrating server-side telemetry caching and automated unit testing in future iterations.',
      'High educational utility for embedded systems pedagogy. The interactive 3D overlays reduce student error rates.',
      'Portability across Android device specifications is well handled with lightweight asset rendering.',
      'Reliable state synchronization between MCU physical pins and AR overlays.',
      'Suggest documenting API schemas thoroughly to aid future student researchers during maintainability audits.',
    ];

    const studentQuestions = getApplicableQuestions('STUDENT');
    const expertQuestions = getApplicableQuestions('EXPERT');

    // Clean existing demo data first to ensure clean slate
    await prisma.respondent.deleteMany({
      where: { isDemo: true },
    });

    const respondentsToCreate: any[] = [];

    // Helper for realistic distribution skewed towards high ratings (4-5 with some 3s)
    function getRandomRating(meanBias = 4.2): number {
      const rand = Math.random();
      if (rand < 0.45) return 5;
      if (rand < 0.80) return 4;
      if (rand < 0.95) return 3;
      if (rand < 0.98) return 2;
      return 1;
    }

    // 1. Generate Students (e.g. 100)
    for (let i = 1; i <= studentCount; i++) {
      const padId = String(i).padStart(3, '0');
      const respId = `DEMO-STU-${padId}`;
      const program = programs[i % programs.length];
      const year = studentYears[i % studentYears.length];
      const device = devices[i % devices.length];
      const remarks = i % 3 === 0 ? studentFeedbackSamples[(i / 3) % studentFeedbackSamples.length] : null;

      respondentsToCreate.push({
        id: respId,
        respondentType: 'STUDENT',
        academicProgram: program,
        yearLevel: year,
        deviceUsed: device,
        status: 'COMPLETED',
        remarks,
        isDemo: true,
        answers: {
          create: studentQuestions.map((q) => ({
            itemId: q.itemId,
            criterion: q.criterion,
            rating: getRandomRating(4.1),
          })),
        },
      });
    }

    // 2. Generate Experts (e.g. 50)
    for (let i = 1; i <= expertCount; i++) {
      const padId = String(i).padStart(3, '0');
      const respId = `DEMO-EXP-${padId}`;
      const program = programs[i % programs.length];
      const year = expertYears[i % expertYears.length];
      const device = devices[i % devices.length];
      const remarks = i % 2 === 0 ? expertFeedbackSamples[(i / 2) % expertFeedbackSamples.length] : null;

      respondentsToCreate.push({
        id: respId,
        respondentType: 'EXPERT',
        academicProgram: program,
        yearLevel: year,
        deviceUsed: device,
        status: 'COMPLETED',
        remarks,
        isDemo: true,
        answers: {
          create: expertQuestions.map((q) => ({
            itemId: q.itemId,
            criterion: q.criterion,
            rating: getRandomRating(4.3),
          })),
        },
      });
    }

    // Insert all in transaction chunks
    for (const rData of respondentsToCreate) {
      await prisma.respondent.create({
        data: rData,
      });
    }

    const totalCreated = respondentsToCreate.length;
    const totalAnswers = await prisma.answer.count({
      where: { respondent: { isDemo: true } },
    });

    return NextResponse.json({
      message: `Successfully generated ${totalCreated} synthetic test respondents (${totalAnswers} total answers).`,
      studentCount,
      expertCount,
      totalAnswers,
    });
  } catch (error: any) {
    console.error('Error generating demo data:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const deleteResult = await prisma.respondent.deleteMany({
      where: { isDemo: true },
    });

    return NextResponse.json({
      message: `Successfully purged ${deleteResult.count} synthetic demo respondents.`,
      purgedCount: deleteResult.count,
    });
  } catch (error: any) {
    console.error('Error purging demo data:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
