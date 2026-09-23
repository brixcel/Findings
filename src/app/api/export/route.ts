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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'raw'; // 'raw' | 'statistics' | 'comparison'
    const format = searchParams.get('format') || (type === 'raw' ? 'xlsx' : 'csv'); // 'xlsx' | 'csv'
    const includeDemo = searchParams.get('includeDemo') === 'true';

    const where: any = { status: 'COMPLETED' };
    if (!includeDemo) {
      where.isDemo = false;
    }

    const respondents = await prisma.respondent.findMany({
      where,
      orderBy: [{ respondentType: 'asc' }, { id: 'asc' }],
      include: { answers: true },
    });

    const dbQuestions = await prisma.question.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    const questionList = dbQuestions.length > 0 ? dbQuestions : DEFAULT_QUESTIONS;

    if (type === 'raw') {
      const todayStr = new Date().toISOString().slice(0, 10);

      // Handle Formatted Microsoft Excel (.xlsx) Export
      if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'AR-DUINO-M Research System';
        workbook.lastModifiedBy = 'AR-DUINO-M';
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet('Raw Encoded Responses', {
          views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
          properties: { defaultRowHeight: 20 },
        });

        // Define Columns
        const columns: Array<{ header: string; key: string; width: number }> = [
          { header: 'Respondent ID', key: 'id', width: 18 },
          { header: 'Respondent Type', key: 'respondentType', width: 18 },
          { header: 'Academic Program', key: 'academicProgram', width: 26 },
          { header: 'Year Level', key: 'yearLevel', width: 14 },
          { header: 'Device Used', key: 'deviceUsed', width: 32 },
          { header: 'Status', key: 'status', width: 14 },
          { header: 'Is Demo', key: 'isDemo', width: 12 },
          { header: 'Date Encoded', key: 'createdAt', width: 16 },
        ];

        questionList.forEach((q) => {
          columns.push({
            header: `${q.itemId}`,
            key: q.itemId,
            width: 12,
          });
        });

        columns.push({
          header: 'Comments / Remarks',
          key: 'remarks',
          width: 40,
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

        // Add Data Rows
        respondents.forEach((r, index) => {
          const answerMap = new Map<string, number>();
          r.answers.forEach((a) => answerMap.set(a.itemId, a.rating));

          const rowData: Record<string, any> = {
            id: r.id,
            respondentType: r.respondentType,
            academicProgram: r.academicProgram,
            yearLevel: r.yearLevel,
            deviceUsed: r.deviceUsed,
            status: r.status,
            isDemo: r.isDemo ? 'YES' : 'NO',
            createdAt: r.createdAt.toISOString().slice(0, 10),
            remarks: r.remarks || '',
          };

          questionList.forEach((q) => {
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

            // Alignment: Program & Remarks left-aligned, everything else centered
            const colKey = columns[colNumber - 1]?.key;
            if (colKey === 'academicProgram' || colKey === 'remarks' || colKey === 'deviceUsed') {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }

            // Numeric format for integer ratings
            if (typeof cell.value === 'number') {
              cell.numFmt = '0';
            }
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="AR-DUINO-M_Raw_Data_for_Statistician_${todayStr}.xlsx"`,
          },
        });
      }

      // Fallback CSV: ID, Type, Program, Year, Device, Status, Remarks, CreatedAt, FUNC_1, FUNC_2, ..., EDUC_5
      const headers = [
        'Respondent ID',
        'Respondent Type',
        'Academic Program',
        'Year Level',
        'Device Used',
        'Status',
        'Comments / Remarks',
        'Is Demo',
        'Date Added',
        ...questionList.map((q) => `${q.itemId} (${q.criterion} ${q.itemNumber})`),
      ];

      const rows = respondents.map((r) => {
        const answerMap = new Map<string, number>();
        r.answers.forEach((a) => answerMap.set(a.itemId, a.rating));

        const itemScores = questionList.map((q) => {
          const val = answerMap.get(q.itemId);
          return val !== undefined ? String(val) : 'N/A';
        });

        return [
          r.id,
          r.respondentType,
          r.academicProgram,
          r.yearLevel,
          r.deviceUsed,
          r.status,
          r.remarks || '',
          r.isDemo ? 'YES' : 'NO',
          r.createdAt.toISOString(),
          ...itemScores,
        ]
          .map(escapeCsv)
          .join(',');
      });

      const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="AR-DUINO-M_Raw_Responses_${todayStr}.csv"`,
        },
      });
    } else if (type === 'statistics') {
      // CSV for Student & Expert Statistical Breakdown
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
      const groups: Array<'STUDENT' | 'EXPERT'> = ['STUDENT', 'EXPERT'];

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

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="AR-DUINO-M_Statistical_Results_${new Date().toISOString().slice(0, 10)}.csv"`,
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
          'Content-Disposition': `attachment; filename="AR-DUINO-M_Group_Comparison_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
