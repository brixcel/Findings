import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_QUESTIONS } from '@/lib/questionnaire-config';

export async function GET() {
  try {
    let questions = await prisma.question.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    if (questions.length === 0) {
      // Seed default questions if empty
      for (const q of DEFAULT_QUESTIONS) {
        await prisma.question.create({
          data: {
            itemId: q.itemId,
            criterion: q.criterion,
            itemNumber: q.itemNumber,
            questionText: q.questionText,
            applicableRespondentType: q.applicableRespondentType,
            displayOrder: q.displayOrder,
          },
        });
      }
      questions = await prisma.question.findMany({
        orderBy: { displayOrder: 'asc' },
      });
    }

    return NextResponse.json({ data: questions });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, questionText } = body;

    if (!itemId || !questionText) {
      return NextResponse.json({ error: 'itemId and questionText are required' }, { status: 400 });
    }

    const updated = await prisma.question.update({
      where: { itemId },
      data: { questionText: questionText.trim() },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error('Error updating question text:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
