'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  Table,
  Scale,
  CheckCircle,
  Database,
  Info,
  Layers,
  GraduationCap,
  Briefcase,
  Check,
  FileText,
} from 'lucide-react';

export default function ExportPage() {
  const [includeDemo, setIncludeDemo] = useState<boolean>(true);
  const [counts, setCounts] = useState<{
    studentCount: number;
    expertCount: number;
    completedCount: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/statistics?includeDemo=${includeDemo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) {
          setCounts({
            studentCount: data.summary.studentCount || 0,
            expertCount: data.summary.expertCount || 0,
            completedCount: data.summary.completedCount || 0,
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching respondent counts:', err);
      });
  }, [includeDemo]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Download className="w-5 h-5 text-sky-600" />
            <span>Export Thesis Research Dataset</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Separated Microsoft Excel (.xlsx) and CSV datasets for Expert and Student respondents formatted for thesis defense and campus statisticians.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {counts && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                <GraduationCap className="w-3.5 h-3.5 mr-1" />
                {counts.studentCount} Students
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                <Briefcase className="w-3.5 h-3.5 mr-1" />
                {counts.expertCount} Experts
              </span>
            </div>
          )}

          <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span className="font-medium">Include Test Data</span>
          </label>
        </div>
      </div>

      {/* Primary Section: Separated Files for Experts and Students */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Separated Respondent Datasets (Recommended for Statistical Analysis)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Experts and students evaluated different rubric indicators. Each file has zero blank/N/A columns, frozen headers, and integer types ready for SPSS, Jamovi, or JASP.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Expert Respondents (Separated Excel & CSV) */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-md border border-indigo-800/40 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>IT Faculty & Industry Experts</span>
                </span>
                {counts && (
                  <span className="text-xs text-indigo-200 font-medium bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
                    {counts.expertCount} Evaluators Encoded
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Expert Questionnaire Responses (.xlsx)
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Dedicated dataset containing only IT experts and faculty members. Strictly includes the <strong>30 expert indicators</strong> (25 Core ISO + 5 Maintainability). Student-only criteria are excluded to eliminate empty columns.
                </p>
              </div>

              {/* Indicator Pills */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-indigo-500/20 text-xs space-y-1.5">
                <div className="text-indigo-300 font-semibold text-[11px] uppercase tracking-wider">
                  Included Indicators (30 Variables):
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Functionality (FUNC_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Reliability (RELI_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Usability (USAB_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Efficiency (EFFI_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Portability (PORT_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-semibold text-indigo-300">
                    <Check className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Maintainability (MAIN_1–5)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={`/api/export?type=raw&format=xlsx&respondentType=EXPERT&includeDemo=${includeDemo}`}
                className="flex-1 flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all transform active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                <span>Download Expert Excel (.xlsx)</span>
              </a>
              <a
                href={`/api/export?type=raw&format=csv&respondentType=EXPERT&includeDemo=${includeDemo}`}
                className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 px-3.5 rounded-lg border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>CSV</span>
              </a>
            </div>
          </div>

          {/* Card 2: Student Respondents (Separated Excel & CSV) */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-xl p-6 shadow-md border border-emerald-800/40 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Respondents</span>
                </span>
                {counts && (
                  <span className="text-xs text-emerald-200 font-medium bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50">
                    {counts.studentCount} Students Encoded
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Student Questionnaire Responses (.xlsx)
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Dedicated dataset containing only student respondents. Strictly includes the <strong>30 student indicators</strong> (25 Core ISO + 5 Educational Effectiveness). Maintainability criteria are excluded to prevent mismatched scales.
                </p>
              </div>

              {/* Indicator Pills */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-emerald-500/20 text-xs space-y-1.5">
                <div className="text-emerald-300 font-semibold text-[11px] uppercase tracking-wider">
                  Included Indicators (30 Variables):
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Functionality (FUNC_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Reliability (RELI_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Usability (USAB_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Efficiency (EFFI_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Portability (PORT_1–5)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-semibold text-emerald-300">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Educational Value (EDUC_1–5)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={`/api/export?type=raw&format=xlsx&respondentType=STUDENT&includeDemo=${includeDemo}`}
                className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all transform active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                <span>Download Student Excel (.xlsx)</span>
              </a>
              <a
                href={`/api/export?type=raw&format=csv&respondentType=STUDENT&includeDemo=${includeDemo}`}
                className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 px-3.5 rounded-lg border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>CSV</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Master Combined Multi-Sheet Excel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Master Multi-Worksheet File</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Combined Research Dataset (Multi-Tab Excel)
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Contains separate tabs for <strong>Student Responses</strong> and <strong>Expert Responses</strong> within a single workbook, alongside a combined overview sheet and complete indicator codebook.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <a
            href={`/api/export?type=raw&format=xlsx&includeDemo=${includeDemo}`}
            className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Download Master Excel (.xlsx)</span>
          </a>
          <a
            href={`/api/export?type=raw&format=csv&includeDemo=${includeDemo}`}
            className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2.5 px-3.5 rounded-lg border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Combined CSV</span>
          </a>
        </div>
      </div>

      {/* Additional Export Formats: Statistical Results & Group Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 4: Statistical Results */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-md inline-block">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Calculated Statistical Results (CSV)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Aggregated criteria-level and item-level statistics (Sample Size N, Weighted Mean x̄, Sample Standard Deviation s, Verbal Interpretation).
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded text-[11px] text-slate-600 space-y-1 border border-slate-200">
              <div className="font-semibold text-slate-800">Included Columns:</div>
              <div>• Group (Student / Expert), Criterion, Item #, Item ID, Statement</div>
              <div>• Sample Size N, Weighted Mean (x̄), Sample SD (s), Verbal Interpretation</div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/api/export?type=statistics&respondentType=STUDENT&includeDemo=${includeDemo}`}
                className="flex items-center justify-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold py-2 px-3 rounded-md transition-colors text-center"
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Student Stats CSV</span>
              </a>
              <a
                href={`/api/export?type=statistics&respondentType=EXPERT&includeDemo=${includeDemo}`}
                className="flex items-center justify-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold py-2 px-3 rounded-md transition-colors text-center"
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span>Expert Stats CSV</span>
              </a>
            </div>
            <a
              href={`/api/export?type=statistics&includeDemo=${includeDemo}`}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-md shadow-xs transition-colors w-full"
            >
              <Download className="w-4 h-4" />
              <span>Download All Statistical Results CSV</span>
            </a>
          </div>
        </div>

        {/* Card 5: Group Comparison t-Test */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-2.5 bg-sky-50 text-sky-700 rounded-md inline-block">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Group Comparison t-Test (CSV)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Complete Independent Samples t-Test results across the 5 shared criteria and Composite Shared Mean at α = 0.05.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded text-[11px] text-slate-600 space-y-1 border border-slate-200">
              <div className="font-semibold text-slate-800">Included Columns:</div>
              <div>• Variable (Functionality, Reliability, Usability, Efficiency, Portability, Composite)</div>
              <div>• Expert Mean, Student Mean, Difference, t-value, df, p-value, Decision, Result</div>
            </div>
          </div>

          <a
            href={`/api/export?type=comparison&includeDemo=${includeDemo}`}
            className="flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold py-2.5 px-4 rounded-md shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download t-Test Results CSV</span>
          </a>
        </div>
      </div>

      {/* Formatting & Statistical Rationale Note */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
          <Info className="w-4 h-4 text-sky-600" />
          <span>Why are the Excel Files Separated for Campus Statisticians?</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Students and IT Experts evaluate distinct criteria rubrics: Experts evaluate <strong>Software Maintainability</strong> (source code modifiability, error identification, component organization), whereas Students evaluate <strong>Educational Effectiveness</strong> (comprehension and engagement). Exporting separated Excel files ensures that each respondent group has a complete, dense rating matrix with zero blank cells or N/A values. Campus statisticians can immediately import either file directly into IBM SPSS Statistics, Jamovi, JASP, or R to compute Cronbach&apos;s alpha, ANOVA, or descriptive statistics without manual spreadsheet cleanup.
        </p>
      </div>
    </div>
  );
}
