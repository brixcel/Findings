import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getApplicableQuestions } from '@/lib/questionnaire-config';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const respondent = await prisma.respondent.findUnique({
      where: { id: params.id },
      include: {
        answers: true,
      },
    });

    if (!respondent) {
      return NextResponse.json({ error: 'Respondent not found' }, { status: 404 });
    }

    return NextResponse.json({ data: respondent });
  } catch (error: any) {
    console.error('Error getting respondent:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      academicProgram,
      yearLevel,
      deviceUsed,
      status,
      remarks,
      answers,
    } = body;

    const existing = await prisma.respondent.findUnique({
      where: { id: params.id },
      include: { answers: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Respondent not found' }, { status: 404 });
    }

    const applicableQuestions = getApplicableQuestions(existing.respondentType as 'STUDENT' | 'EXPERT');
    const requiredItemIds = applicableQuestions.map((q) => q.itemId);

    if (status === 'COMPLETED') {
      if (!answers || typeof answers !== 'object') {
        return NextResponse.json(
          { error: 'Answers payload missing for completed respondent.' },
          { status: 400 }
        );
      }

      for (const reqItemId of requiredItemIds) {
        const rating = answers[reqItemId];
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
          return NextResponse.json(
            { error: `Cannot complete respondent: Item ${reqItemId} is unanswered or invalid.` },
            { status: 400 }
          );
        }
      }
    }

    // Delete existing answers and recreate or update
    await prisma.$transaction(async (tx) => {
      await tx.answer.deleteMany({
        where: { respondentId: params.id },
      });

      const answerRecords: Array<{
        itemId: string;
        criterion: string;
        rating: number;
      }> = [];

      if (answers && typeof answers === 'object') {
        for (const q of applicableQuestions) {
          const r = answers[q.itemId];
          if (typeof r === 'number' && r >= 1 && r <= 5) {
            answerRecords.push({
              itemId: q.itemId,
              criterion: q.criterion,
              rating: r,
            });
          }
        }
      }

      await tx.respondent.update({
        where: { id: params.id },
        data: {
          academicProgram: academicProgram ?? existing.academicProgram,
          yearLevel: yearLevel ?? existing.yearLevel,
          deviceUsed: deviceUsed ?? existing.deviceUsed,
          status: status ?? existing.status,
          remarks: remarks !== undefined ? (typeof remarks === 'string' && remarks.trim() ? remarks.trim() : null) : existing.remarks,
          answers: {
            create: answerRecords.map((a) => ({
              itemId: a.itemId,
              criterion: a.criterion,
              rating: a.rating,
            })),
          },
        },
      });
    });

    const updated = await prisma.respondent.findUnique({
      where: { id: params.id },
      include: { answers: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error('Error updating respondent:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.respondent.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Respondent not found' }, { status: 404 });
    }

    await prisma.respondent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Respondent deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting respondent:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
