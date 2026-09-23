'use client';

import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Table,
  Scale,
  CheckCircle,
  Database,
  Info,
  FileCheck,
} from 'lucide-react';

export default function ExportPage() {
  const [includeDemo, setIncludeDemo] = useState<boolean>(true);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Download className="w-5 h-5 text-emerald-600" />
            <span>Export Thesis Research Dataset</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Export the complete inputted research responses formatted for Microsoft Excel and campus statisticians.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="font-medium">Include Test / Demo Data</span>
          </label>
        </div>
      </div>

      {/* Primary Featured Card: Formatted Raw Excel Data for Statistician */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-emerald-800/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Recommended for Statistician</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Raw Questionnaire Responses (Formatted Microsoft Excel)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Contains the complete encoded responses (demographics + individual 1–5 ratings for all 33 indicators) with frozen headers, professional column formatting, thin grid borders, and numeric integer scoring ready for your campus statistician.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <a
              href={`/api/export?type=raw&format=xlsx&includeDemo=${includeDemo}`}
              className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm transition-all transform active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download Excel (.xlsx)</span>
            </a>
            <a
              href={`/api/export?type=raw&format=csv&includeDemo=${includeDemo}`}
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 px-4 rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Download CSV</span>
            </a>
          </div>
        </div>

        {/* Column breakdown preview */}
        <div className="bg-slate-950/60 rounded-lg p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-emerald-400 font-semibold mb-1">1. Demographics</div>
            <div className="text-slate-400 text-[11px] space-y-0.5">
              <div>• Respondent ID</div>
              <div>• Type (Student / Expert)</div>
              <div>• Academic Program</div>
              <div>• Year Level & Device</div>
            </div>
          </div>
          <div>
            <div className="text-emerald-400 font-semibold mb-1">2. Core ISO Criteria</div>
            <div className="text-slate-400 text-[11px] space-y-0.5">
              <div>• Functionality (FUNC_1–5)</div>
              <div>• Reliability (RELI_1–5)</div>
              <div>• Usability (USAB_1–5)</div>
              <div>• Efficiency (EFFI_1–5)</div>
            </div>
          </div>
          <div>
            <div className="text-emerald-400 font-semibold mb-1">3. Special Indicators</div>
            <div className="text-slate-400 text-[11px] space-y-0.5">
              <div>• Portability (PORT_1–4)</div>
              <div>• Maintainability (MAIN_1–5)</div>
              <div>• Educational Value (EDUC_1–5)</div>
            </div>
          </div>
          <div>
            <div className="text-emerald-400 font-semibold mb-1">4. Excel Formatting</div>
            <div className="text-slate-400 text-[11px] space-y-0.5">
              <div>• Frozen Header Row</div>
              <div>• Integer Numeric Types</div>
              <div>• Auto-fitted Column Widths</div>
              <div>• Zebra Row Striping</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Export Formats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 2: Statistical Results */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-md inline-block">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Calculated Statistical Results (CSV)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Aggregated criteria-level and item-level statistics (N, Weighted Mean, Sample SD, Verbal Interpretation) for both Student and Expert populations.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded text-[11px] text-slate-600 space-y-1 border border-slate-200">
              <div className="font-semibold text-slate-800">Included Columns:</div>
              <div>• Group (Student/Expert), Criterion, Item #, Item ID, Question Text</div>
              <div>• Sample Size N, Weighted Mean (x̄), Standard Deviation (s), Verbal Interpretation</div>
            </div>
          </div>

          <a
            href={`/api/export?type=statistics&includeDemo=${includeDemo}`}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-md shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Statistical Summary CSV</span>
          </a>
        </div>

        {/* Card 3: Group Comparison */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-2.5 bg-sky-50 text-sky-700 rounded-md inline-block">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Group Comparison t-Test (CSV)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Complete Independent Samples t-Test results across the 5 shared criteria and the individual-level Composite Shared Mean at α = 0.05.
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

      {/* Formatting & Citation Guidelines */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Statistician Submission Note</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The <strong>.xlsx</strong> file directly opens in Microsoft Excel with formatted headers and integer variables. When handing this to your campus statistician, they can immediately run their required tests (such as descriptive statistics, ANOVA, t-tests, or Cronbach&apos;s alpha) in IBM SPSS Statistics, Jamovi, JASP, or R.
        </p>
      </div>
    </div>
  );
}

