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

function formatRespondentType(type: string): string {
  if (type === 'EXPERT') return 'Expert / Instructor';
  if (type === 'STUDENT') return 'Student / End-User';
  return type;
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
    { header: 'Target Population', key: 'targetGroup', width: 24 },
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
        ? 'Experts / Instructors Only'
        : 'Students / End-Users Only';

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'raw'; // 'raw' | 'statistics' | 'comparison'
    const format = searchParams.get('format') || (type === 'raw' ? 'xlsx' : 'csv'); // 'xlsx' | 'csv'
    const includeDemo = searchParams.get('includeDemo') === 'true';

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
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: { answers: true },
    });

    // Group all Experts together first, followed by all Students
    const expertRespondents = respondents.filter((r) => r.respondentType === 'EXPERT');
    const studentRespondents = respondents.filter((r) => r.respondentType === 'STUDENT');
    const orderedRespondents =
      targetGroup === 'STUDENT'
        ? studentRespondents
        : targetGroup === 'EXPERT'
        ? expertRespondents
        : [...expertRespondents, ...studentRespondents];

    const dbQuestions = await prisma.question.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    const allQuestions = dbQuestions.length > 0 ? dbQuestions : DEFAULT_QUESTIONS;

    const questionsToExport =
      targetGroup === 'STUDENT'
        ? allQuestions.filter(
            (q) => q.applicableRespondentType === 'ALL' || q.applicableRespondentType === 'STUDENT'
          )
        : targetGroup === 'EXPERT'
        ? allQuestions.filter(
            (q) => q.applicableRespondentType === 'ALL' || q.applicableRespondentType === 'EXPERT'
          )
        : allQuestions;

    const todayStr = new Date().toISOString().slice(0, 10);

    if (type === 'raw') {
      // Handle Formatted Microsoft Excel (.xlsx) Export
      if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'AR-DUINO-M Research System';
        workbook.lastModifiedBy = 'AR-DUINO-M Research System';
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet('Raw Encoded Responses', {
          views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
          properties: { defaultRowHeight: 20 },
        });

        // Define Columns (Respondent ID, Comments & Feedbacks omitted)
        const columns: Array<{ header: string; key: string; width: number }> = [
          { header: 'No.', key: 'rowNumber', width: 8 },
          { header: 'Respondent Type', key: 'respondentType', width: 22 },
          { header: 'Academic Program', key: 'academicProgram', width: 26 },
          { header: 'Year Level', key: 'yearLevel', width: 16 },
          { header: 'Device Used', key: 'deviceUsed', width: 32 },
          { header: 'Status', key: 'status', width: 14 },
          { header: 'Date Encoded', key: 'createdAt', width: 16 },
        ];

        questionsToExport.forEach((q) => {
          columns.push({
            header: q.itemId,
            key: q.itemId,
            width: 12,
          });
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
            fgColor: { argb: 'FF1E293B' }, // Dark slate navy
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

        // Add Data Rows: All Experts grouped together first, then all Students
        orderedRespondents.forEach((r, index) => {
          const answerMap = new Map<string, number>();
          r.answers?.forEach((a: any) => answerMap.set(a.itemId, a.rating));

          const dateVal =
            r.createdAt instanceof Date
              ? r.createdAt.toISOString().slice(0, 10)
              : String(r.createdAt).slice(0, 10);

          const rowData: Record<string, any> = {
            rowNumber: index + 1,
            respondentType: formatRespondentType(r.respondentType),
            academicProgram: r.academicProgram,
            yearLevel: r.yearLevel,
            deviceUsed: r.deviceUsed,
            status: r.status,
            createdAt: dateVal,
          };

          questionsToExport.forEach((q) => {
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
            if (colKey === 'academicProgram' || colKey === 'deviceUsed') {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }

            if (typeof cell.value === 'number') {
              cell.numFmt = '0';
            }
          });
        });

        // Tab 2: Questionnaire Codebook
        const codebookSheet = workbook.addWorksheet('Questionnaire Codebook');
        populateCodebookWorksheet(codebookSheet, questionsToExport, 'FF1E293B');

        const buffer = await workbook.xlsx.writeBuffer();

        const filename =
          targetGroup === 'EXPERT'
            ? `AR-DUINO-M_Expert_Responses_${todayStr}.xlsx`
            : targetGroup === 'STUDENT'
            ? `AR-DUINO-M_Student_Responses_${todayStr}.xlsx`
            : `AR-DUINO-M_Raw_Data_for_Statistician_${todayStr}.xlsx`;

        return new NextResponse(buffer, {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      // Handle Fallback CSV Export
      const headers = [
        'No.',
        'Respondent Type',
        'Academic Program',
        'Year Level',
        'Device Used',
        'Status',
        'Date Encoded',
        ...questionsToExport.map((q) => `${q.itemId} (${q.criterion} ${q.itemNumber})`),
      ];

      const rows = orderedRespondents.map((r, index) => {
        const answerMap = new Map<string, number>();
        r.answers?.forEach((a: any) => answerMap.set(a.itemId, a.rating));

        const itemScores = questionsToExport.map((q) => {
          const val = answerMap.get(q.itemId);
          return val !== undefined ? String(val) : 'N/A';
        });

        const dateStr =
          r.createdAt instanceof Date
            ? r.createdAt.toISOString().slice(0, 10)
            : String(r.createdAt).slice(0, 10);

        return [
          index + 1,
          formatRespondentType(r.respondentType),
          r.academicProgram,
          r.yearLevel,
          r.deviceUsed,
          r.status,
          dateStr,
          ...itemScores,
        ]
          .map(escapeCsv)
          .join(',');
      });

      const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');

      const csvFilename =
        targetGroup === 'EXPERT'
          ? `AR-DUINO-M_Expert_Responses_${todayStr}.csv`
          : targetGroup === 'STUDENT'
          ? `AR-DUINO-M_Student_Responses_${todayStr}.csv`
          : `AR-DUINO-M_Raw_Responses_${todayStr}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${csvFilename}"`,
        },
      });
    } else if (type === 'statistics') {
      // Statistical Breakdown CSV
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
          : ['EXPERT', 'STUDENT'];

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
                formatRespondentType(grp),
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
              formatRespondentType(grp),
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

      const statFilename =
        targetGroup === 'EXPERT'
          ? `AR-DUINO-M_Expert_Statistical_Results_${todayStr}.csv`
          : targetGroup === 'STUDENT'
          ? `AR-DUINO-M_Student_Statistical_Results_${todayStr}.csv`
          : `AR-DUINO-M_Statistical_Results_${todayStr}.csv`;

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
