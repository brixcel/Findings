import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getApplicableQuestions } from '@/lib/questionnaire-config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const respondentType = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const includeDemo = searchParams.get('includeDemo') === 'true';

    const where: any = {};

    if (!includeDemo) {
      where.isDemo = false;
    }

    if (respondentType && (respondentType === 'STUDENT' || respondentType === 'EXPERT')) {
      where.respondentType = respondentType;
    }

    if (status && (status === 'DRAFT' || status === 'COMPLETED')) {
      where.status = status;
    }

    if (search.trim()) {
      where.OR = [
        { id: { contains: search.trim() } },
        { academicProgram: { contains: search.trim() } },
        { yearLevel: { contains: search.trim() } },
        { deviceUsed: { contains: search.trim() } },
        { remarks: { contains: search.trim() } },
      ];
    }

    const total = await prisma.respondent.count({ where });
    const respondents = await prisma.respondent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { answers: true },
        },
      },
    });

    return NextResponse.json({
      data: respondents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching respondents:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      respondentType,
      academicProgram,
      yearLevel,
      deviceUsed,
      status,
      remarks,
      answers,
      isDemo = false,
    } = body;

    if (!id || !respondentType || !academicProgram || !yearLevel || !deviceUsed || !status) {
      return NextResponse.json({ error: 'Missing required profile fields' }, { status: 400 });
    }

    if (respondentType !== 'STUDENT' && respondentType !== 'EXPERT') {
      return NextResponse.json({ error: 'Invalid respondent type' }, { status: 400 });
    }

    if (status !== 'DRAFT' && status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check duplicate ID
    const existing = await prisma.respondent.findUnique({ where: { id } });
    if (existing) {
      return NextResponse.json({ error: `Respondent ID "${id}" already exists.` }, { status: 409 });
    }

    const applicableQuestions = getApplicableQuestions(respondentType);
    const requiredItemIds = applicableQuestions.map((q) => q.itemId);

    // Validation for COMPLETED status
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

    // Filter answers to only applicable items and valid ratings
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

    const respondent = await prisma.respondent.create({
      data: {
        id,
        respondentType,
        academicProgram,
        yearLevel,
        deviceUsed,
        status,
        remarks: typeof remarks === 'string' && remarks.trim() ? remarks.trim() : null,
        isDemo: Boolean(isDemo),
        answers: {
          create: answerRecords.map((a) => ({
            itemId: a.itemId,
            criterion: a.criterion,
            rating: a.rating,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json({ data: respondent }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating respondent:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
