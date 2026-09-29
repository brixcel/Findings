import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/db';
import {
  DEFAULT_QUESTIONS,
  SHARED_CRITERIA,
  getApplicableQuestions,
} from '@/lib/questionnaire-config';
import {
  calculateWeightedMean,
  calculateSampleSD,
  getVerbalInterpretation,
  calculateIndependentTTest,
} from '@/lib/statistics';

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export const dynamic = 'force-dynamic';

interface PopulateWorksheetOptions {
  worksheet: ExcelJS.Worksheet;
  respondents: any[];
  questions: any[];
  themeHeaderColor?: string;
}

function populateResponseWorksheet({
  worksheet,
  respondents,
  questions,
  themeHeaderColor = 'FF1E293B',
}: PopulateWorksheetOptions) {
  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  worksheet.properties.defaultRowHeight = 20;

  const columns: Array<{ header: string; key: string; width: number }> = [
    { header: 'No.', key: 'rowNumber', width: 8 },
    { header: 'Respondent ID', key: 'id', width: 18 },
    { header: 'Respondent Type', key: 'respondentType', width: 18 },
    { header: 'Academic Program', key: 'academicProgram', width: 26 },
    { header: 'Year Level / Designation', key: 'yearLevel', width: 22 },
    { header: 'Device Used', key: 'deviceUsed', width: 32 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Date Encoded', key: 'createdAt', width: 16 },
  ];

  questions.forEach((q) => {
    columns.push({
      header: q.itemId,
      key: q.itemId,
      width: 12,
    });
  });

  columns.push({
    header: 'Remarks / Feedback',
    key: 'remarks',
    width: 38,
  });

  worksheet.columns = columns;

  // Style Header Row (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: themeHeaderColor },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });

  // Add Data Rows
  respondents.forEach((r, index) => {
    const answerMap = new Map<string, number>();
    r.answers?.forEach((a: any) => answerMap.set(a.itemId, a.rating));

    const dateVal =
      r.createdAt instanceof Date
        ? r.createdAt.toISOString().slice(0, 10)
        : String(r.createdAt).slice(0, 10);

    const rowData: Record<string, any> = {
      rowNumber: index + 1,
      id: r.id,
      respondentType: r.respondentType,
      academicProgram: r.academicProgram,
      yearLevel: r.yearLevel,
      deviceUsed: r.deviceUsed,
      status: r.status,
      createdAt: dateVal,
      remarks: r.remarks || '',
    };

    questions.forEach((q) => {
      const val = answerMap.get(q.itemId);
      rowData[q.itemId] = val !== undefined ? val : 'N/A';
    });

    const row = worksheet.addRow(rowData);
    row.height = 22;

    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Clean alternating zebra striping

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = {
        name: 'Segoe UI',
        size: 10,
        color: { argb: 'FF0F172A' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      const colKey = columns[colNumber - 1]?.key;
      if (colKey === 'academicProgram' || colKey === 'deviceUsed' || colKey === 'remarks') {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      if (typeof cell.value === 'number') {
        cell.numFmt = '0';
      }
    });
  });
}

function populateCodebookWorksheet(
  worksheet: ExcelJS.Worksheet,
  questions: any[],
  themeHeaderColor = 'FF1E293B'
) {
  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  worksheet.properties.defaultRowHeight = 20;

  const columns = [
    { header: 'Item ID', key: 'itemId', width: 14 },
    { header: 'Criterion / Dimension', key: 'criterion', width: 26 },
    { header: 'Item No.', key: 'itemNumber', width: 10 },
    { header: 'Indicator / Questionnaire Statement', key: 'questionText', width: 75 },
    { header: 'Target Population', key: 'targetGroup', width: 22 },
  ];

  worksheet.columns = columns;

  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: themeHeaderColor },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });

  questions.forEach((q, index) => {
    const targetGroup =
      q.applicableRespondentType === 'ALL'
        ? 'Both (Students & Experts)'
        : q.applicableRespondentType === 'EXPERT'
        ? 'Experts Only'
        : 'Students Only';

    const row = worksheet.addRow({
      itemId: q.itemId,
      criterion: q.criterion,
      itemNumber: q.itemNumber,
      questionText: q.questionText,
      targetGroup,
    });
    row.height = 24;

    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = {
        name: 'Segoe UI',
        size: 10,
        color: { argb: 'FF0F172A' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      const colKey = columns[colNumber - 1]?.key;
      if (colKey === 'questionText' || colKey === 'criterion') {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });
}

function buildCsvContent(respondents: any[], questions: any[]) {
  const headers = [
    'No.',
    'Respondent ID',
    'Respondent Type',
    'Academic Program',
    'Year Level',
    'Device Used',
    'Status',
    'Date Encoded',
    ...questions.map((q) => `${q.itemId} (${q.criterion} ${q.itemNumber})`),
    'Remarks',
  ];

  const rows = respondents.map((r, index) => {
    const answerMap = new Map<string, number>();
    r.answers?.forEach((a: any) => answerMap.set(a.itemId, a.rating));

    const itemScores = questions.map((q) => {
      const val = answerMap.get(q.itemId);
      return val !== undefined ? String(val) : 'N/A';
    });

    const dateStr =
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt);

    return [
      index + 1,
      r.id,
      r.respondentType,
      r.academicProgram,
      r.yearLevel,
      r.deviceUsed,
      r.status,
      dateStr,
      ...itemScores,
      r.remarks || '',
    ]
      .map(escapeCsv)
      .join(',');
  });

  return [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'raw'; // 'raw' | 'statistics' | 'comparison'
    const format = searchParams.get('format') || (type === 'raw' ? 'xlsx' : 'csv'); // 'xlsx' | 'csv'
    const includeDemo = searchParams.get('includeDemo') === 'true';

    // Respondent group separation parameter: 'STUDENT' | 'EXPERT' | 'ALL'
    const respondentTypeParam = (
      searchParams.get('respondentType') ||
      searchParams.get('group') ||
      searchParams.get('role') ||
      ''
    ).toUpperCase();

    const targetGroup: 'STUDENT' | 'EXPERT' | 'ALL' =
      respondentTypeParam === 'STUDENT'
        ? 'STUDENT'
        : respondentTypeParam === 'EXPERT'
        ? 'EXPERT'
        : 'ALL';

    const where: any = { status: 'COMPLETED' };
    if (!includeDemo) {
      where.isDemo = false;
    }
    if (targetGroup !== 'ALL') {
      where.respondentType = targetGroup;
    }

    const respondents = await prisma.respondent.findMany({
      where,
      orderBy: [{ respondentType: 'asc' }, { id: 'asc' }],
      include: { answers: true },
    });

    const dbQuestions = await prisma.question.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    const allQuestions = dbQuestions.length > 0 ? dbQuestions : DEFAULT_QUESTIONS;

    // Filter indicators tailored to respective respondent groups
    const studentQuestions = allQuestions.filter(
      (q) => q.applicableRespondentType === 'ALL' || q.applicableRespondentType === 'STUDENT'
    );
    const expertQuestions = allQuestions.filter(
      (q) => q.applicableRespondentType === 'ALL' || q.applicableRespondentType === 'EXPERT'
    );

    const todayStr = new Date().toISOString().slice(0, 10);

    if (type === 'raw') {
      // Handle Formatted Microsoft Excel (.xlsx) Export
      if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'AR-DUINO-M Research System';
        workbook.lastModifiedBy = 'AR-DUINO-M Research System';
        workbook.created = new Date();
        workbook.modified = new Date();

        let filename = `AR-DUINO-M_Raw_Data_${todayStr}.xlsx`;

        if (targetGroup === 'EXPERT') {
          filename = `AR-DUINO-M_Expert_Responses_${todayStr}.xlsx`;

          // Sheet 1: Dedicated Expert Responses with 30 Expert Indicators (excludes EDUC)
          const expertSheet = workbook.addWorksheet('Expert Responses');
          populateResponseWorksheet({
            worksheet: expertSheet,
            respondents,
            questions: expertQuestions,
            themeHeaderColor: 'FF1E1B4B', // Deep indigo navy
          });

          // Sheet 2: Questionnaire Codebook
          const codebookSheet = workbook.addWorksheet('Questionnaire Codebook');
          populateCodebookWorksheet(codebookSheet, expertQuestions, 'FF1E293B');
        } else if (targetGroup === 'STUDENT') {
          filename = `AR-DUINO-M_Student_Responses_${todayStr}.xlsx`;

          // Sheet 1: Dedicated Student Responses with 30 Student Indicators (excludes MAINT)
          const studentSheet = workbook.addWorksheet('Student Responses');
          populateResponseWorksheet({
            worksheet: studentSheet,
            respondents,
            questions: studentQuestions,
            themeHeaderColor: 'FF064E3B', // Rich emerald slate
          });

          // Sheet 2: Questionnaire Codebook
          const codebookSheet = workbook.addWorksheet('Questionnaire Codebook');
          populateCodebookWorksheet(codebookSheet, studentQuestions, 'FF1E293B');
        } else {
          // Master / Combined Export: Provide cleanly separated sheets for both groups
          filename = `AR-DUINO-M_Master_Research_Dataset_${todayStr}.xlsx`;

          const studentRespondents = respondents.filter((r) => r.respondentType === 'STUDENT');
          const expertRespondents = respondents.filter((r) => r.respondentType === 'EXPERT');

          // Sheet 1: Student Responses (30 items)
          const studentSheet = workbook.addWorksheet('Student Responses');
          populateResponseWorksheet({
            worksheet: studentSheet,
            respondents: studentRespondents,
            questions: studentQuestions,
            themeHeaderColor: 'FF064E3B',
          });

          // Sheet 2: Expert Responses (30 items)
          const expertSheet = workbook.addWorksheet('Expert Responses');
          populateResponseWorksheet({
            worksheet: expertSheet,
            respondents: expertRespondents,
            questions: expertQuestions,
            themeHeaderColor: 'FF1E1B4B',
          });

          // Sheet 3: Combined Raw Matrix (All 35 items)
          const combinedSheet = workbook.addWorksheet('Combined All Responses');
          populateResponseWorksheet({
            worksheet: combinedSheet,
            respondents,
            questions: allQuestions,
            themeHeaderColor: 'FF0F172A',
          });

          // Sheet 4: Complete Questionnaire Codebook
          const codebookSheet = workbook.addWorksheet('Questionnaire Codebook');
          populateCodebookWorksheet(codebookSheet, allQuestions, 'FF1E293B');
        }

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      // Handle CSV Export
      let activeQuestions = allQuestions;
      let csvFilename = `AR-DUINO-M_All_Responses_${todayStr}.csv`;

      if (targetGroup === 'EXPERT') {
        activeQuestions = expertQuestions;
        csvFilename = `AR-DUINO-M_Expert_Responses_${todayStr}.csv`;
      } else if (targetGroup === 'STUDENT') {
        activeQuestions = studentQuestions;
        csvFilename = `AR-DUINO-M_Student_Responses_${todayStr}.csv`;
      }

      const csvContent = buildCsvContent(respondents, activeQuestions);

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${csvFilename}"`,
        },
      });
    } else if (type === 'statistics') {
      // Statistical breakdown
      const headers = [
        'Respondent Group',
        'Criterion',
        'Item Number',
        'Item ID',
        'Question Text',
        'N',
        'Weighted Mean',
        'Standard Deviation',
        'Verbal Interpretation',
      ];

      const rows: string[] = [];
      const groups: Array<'STUDENT' | 'EXPERT'> =
        targetGroup === 'STUDENT'
          ? ['STUDENT']
          : targetGroup === 'EXPERT'
          ? ['EXPERT']
          : ['STUDENT', 'EXPERT'];

      for (const grp of groups) {
        const grpRespondents = respondents.filter((r) => r.respondentType === grp);
        const applicable = getApplicableQuestions(grp);
        const criteriaList = Array.from(new Set(applicable.map((q) => q.criterion)));

        for (const criterion of criteriaList) {
          const cQuestions = applicable.filter((q) => q.criterion === criterion);

          for (const q of cQuestions) {
            const ratings = grpRespondents
              .map((r) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
              .filter((val): val is number => typeof val === 'number');

            const mean = calculateWeightedMean(ratings);
            const sd = calculateSampleSD(ratings);
            const interp = getVerbalInterpretation(mean);

            rows.push(
              [
                grp,
                criterion,
                q.itemNumber,
                q.itemId,
                q.questionText,
                ratings.length,
                mean !== null ? mean.toFixed(2) : 'N/A',
                sd !== null ? sd.toFixed(2) : 'N/A',
                interp,
              ].map(escapeCsv).join(',')
            );
          }

          // Criterion Summary Row
          const respondentCriterionMeans: number[] = [];
          for (const r of grpRespondents) {
            const rRatings = cQuestions
              .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
              .filter((val): val is number => typeof val === 'number');
            if (rRatings.length > 0) {
              respondentCriterionMeans.push(
                rRatings.reduce((a, b) => a + b, 0) / rRatings.length
              );
            }
          }

          const cMean = calculateWeightedMean(respondentCriterionMeans);
          const cSD = calculateSampleSD(respondentCriterionMeans);
          const cInterp = getVerbalInterpretation(cMean);

          rows.push(
            [
              grp,
              criterion,
              'OVERALL CRITERION',
              '-',
              `Overall Mean for ${criterion}`,
              respondentCriterionMeans.length,
              cMean !== null ? cMean.toFixed(2) : 'N/A',
              cSD !== null ? cSD.toFixed(2) : 'N/A',
              cInterp,
            ].map(escapeCsv).join(',')
          );
        }
      }

      const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');

      let statFilename = `AR-DUINO-M_Statistical_Results_${todayStr}.csv`;
      if (targetGroup === 'EXPERT') {
        statFilename = `AR-DUINO-M_Expert_Statistical_Results_${todayStr}.csv`;
      } else if (targetGroup === 'STUDENT') {
        statFilename = `AR-DUINO-M_Student_Statistical_Results_${todayStr}.csv`;
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${statFilename}"`,
        },
      });
    } else if (type === 'comparison') {
      // Group Comparison Independent t-test
      const headers = [
        'Variable',
        'Expert N',
        'Student N',
        'Expert Mean',
        'Student Mean',
        'Difference',
        't-value',
        'df',
        'p-value',
        'Alpha (α)',
        'Decision',
        'Result',
      ];

      const expertRespondents = respondents.filter((r) => r.respondentType === 'EXPERT');
      const studentRespondents = respondents.filter((r) => r.respondentType === 'STUDENT');
      const sharedQuestions = DEFAULT_QUESTIONS.filter((q) =>
        SHARED_CRITERIA.includes(q.criterion as any)
      );

      const rows: string[] = [];

      for (const criterion of SHARED_CRITERIA) {
        const cQuestions = sharedQuestions.filter((q) => q.criterion === criterion);

        const expertMeans = expertRespondents
          .map((r) => {
            const vals = cQuestions
              .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
              .filter((v): v is number => typeof v === 'number');
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          })
          .filter((v): v is number => v !== null);

        const studentMeans = studentRespondents
          .map((r) => {
            const vals = cQuestions
              .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
              .filter((v): v is number => typeof v === 'number');
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          })
          .filter((v): v is number => v !== null);

        const res = calculateIndependentTTest(criterion, expertMeans, studentMeans);
        rows.push(
          [
            res.variable,
            res.expertN,
            res.studentN,
            res.expertMean !== null ? res.expertMean.toFixed(2) : 'N/A',
            res.studentMean !== null ? res.studentMean.toFixed(2) : 'N/A',
            res.difference !== null ? res.difference.toFixed(2) : 'N/A',
            res.tValue !== null ? res.tValue.toFixed(4) : 'N/A',
            res.degreesOfFreedom !== null ? res.degreesOfFreedom : 'N/A',
            res.pValue !== null ? res.pValue.toFixed(4) : 'N/A',
            '0.05 (two-tailed)',
            res.decision,
            res.interpretation,
          ].map(escapeCsv).join(',')
        );
      }

      // Composite Shared Mean
      const expertComposite = expertRespondents
        .map((r) => {
          const vals = sharedQuestions
            .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
            .filter((v): v is number => typeof v === 'number');
          return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        })
        .filter((v): v is number => v !== null);

      const studentComposite = studentRespondents
        .map((r) => {
          const vals = sharedQuestions
            .map((q) => r.answers.find((a) => a.itemId === q.itemId)?.rating)
            .filter((v): v is number => typeof v === 'number');
          return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        })
        .filter((v): v is number => v !== null);

      const compositeRes = calculateIndependentTTest(
        'Composite Shared Mean',
        expertComposite,
        studentComposite
      );
      rows.push(
        [
          compositeRes.variable,
          compositeRes.expertN,
          compositeRes.studentN,
          compositeRes.expertMean !== null ? compositeRes.expertMean.toFixed(2) : 'N/A',
          compositeRes.studentMean !== null ? compositeRes.studentMean.toFixed(2) : 'N/A',
          compositeRes.difference !== null ? compositeRes.difference.toFixed(2) : 'N/A',
          compositeRes.tValue !== null ? compositeRes.tValue.toFixed(4) : 'N/A',
          compositeRes.degreesOfFreedom !== null ? compositeRes.degreesOfFreedom : 'N/A',
          compositeRes.pValue !== null ? compositeRes.pValue.toFixed(4) : 'N/A',
          '0.05 (two-tailed)',
          compositeRes.decision,
          compositeRes.interpretation,
        ].map(escapeCsv).join(',')
      );

      const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="AR-DUINO-M_Group_Comparison_${todayStr}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error generating export:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
