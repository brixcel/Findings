'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  FileEdit,
  UserPlus,
  Scale,
  Download,
  AlertCircle,
  Database,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { VERBAL_INTERPRETATION_SCALE } from '@/lib/statistics';

interface SummaryData {
  totalRespondents: number;
  studentCount: number;
  expertCount: number;
  completedCount: number;
  draftCount: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [includeDemo, setIncludeDemo] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/statistics?includeDemo=${includeDemo}`);
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [includeDemo]);

  return (
    <div className="space-y-6">
      {/* Header with Title & Demo Toggle */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
            Research Evaluation System
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            AR-DUINO-M: Augmented Reality-Driven User Interface for Microcontrollers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manual Encoding & Statistical Analysis Engine for Student & Subject Matter Expert Questionnaires
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span className="font-medium">Include Test / Demo Data in Stats</span>
          </label>

          <Link
            href="/respondents/new"
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Respondent</span>
          </Link>
        </div>
      </div>

      {/* 5 Primary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Recorded
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {loading ? '...' : summary?.totalRespondents ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total in Database</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wide">
              Students (30 Qs)
            </span>
            <GraduationCap className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-900 mt-2">
            {loading ? '...' : summary?.studentCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Completed Evaluations</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
              Experts (30 Qs)
            </span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-900 mt-2">
            {loading ? '...' : summary?.expertCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Completed Evaluations</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-2">
            {loading ? '...' : summary?.completedCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for Stats</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Drafts
            </span>
            <FileEdit className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-2">
            {loading ? '...' : summary?.draftCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending Completion</div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Thesis Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation & Research Workflow */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Database className="w-4 h-4 text-sky-600" />
              <span>Research Analysis Navigation</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/respondents"
                className="p-3.5 border border-slate-200 rounded-md hover:border-sky-400 hover:bg-sky-50/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-700">
                    Respondent Records
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Browse, search, filter, paginate, and edit raw student and expert records.
                </p>
              </Link>

              <Link
                href="/results/student"
                className="p-3.5 border border-slate-200 rounded-md hover:border-sky-400 hover:bg-sky-50/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-700">
                    Student Results (6 Criteria)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Functionality, Reliability, Usability, Efficiency, Portability, Educational Effectiveness.
                </p>
              </Link>

              <Link
                href="/results/expert"
                className="p-3.5 border border-slate-200 rounded-md hover:border-sky-400 hover:bg-sky-50/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-700">
                    Expert Results (6 Criteria)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Functionality, Reliability, Usability, Efficiency, Portability, Maintainability.
                </p>
              </Link>

              <Link
                href="/results/comparison"
                className="p-3.5 border border-slate-200 rounded-md hover:border-sky-400 hover:bg-sky-50/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-700">
                    Independent Samples t-Test
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Objective 3 test comparing shared criteria and composite shared mean (α = 0.05).
                </p>
              </Link>

              <Link
                href="/export"
                className="p-3.5 border border-slate-200 rounded-md hover:border-sky-400 hover:bg-sky-50/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-700">
                    Export Research CSVs
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Download raw response matrices, full statistical summaries, and t-test tables.
                </p>
              </Link>

              <Link
                href="/demo"
                className="p-3.5 border border-slate-200 rounded-md hover:border-sky-400 hover:bg-sky-50/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-700">
                    150+ Scale & Test Suite
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Generate 150 synthetic records (4,500 responses), run automated QA, and purge safely.
                </p>
              </Link>
            </div>
          </div>

          {/* Questionnaire Matrix Specs */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">
              Questionnaire Structure & Distribution
            </h2>
            <div className="text-xs text-slate-600 mb-3">
              Exactly 35 total indicators configured across 7 criteria from the research evaluation questionnaire. Each respondent evaluates exactly 30 items:
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs table-academic">
                <thead>
                  <tr>
                    <th className="text-left">Criterion</th>
                    <th className="text-center">Items</th>
                    <th className="text-center">Student Applicable</th>
                    <th className="text-center">Expert Applicable</th>
                    <th className="text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="font-medium text-slate-900">Functionality</td>
                    <td className="text-center">5</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-slate-500">Shared criterion</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-slate-900">Reliability</td>
                    <td className="text-center">5</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-slate-500">Shared criterion</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-slate-900">Usability</td>
                    <td className="text-center">5</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-slate-500">Shared criterion</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-slate-900">Efficiency</td>
                    <td className="text-center">5</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-slate-500">Shared criterion</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-slate-900">Portability</td>
                    <td className="text-center">5</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-slate-500">Shared criterion</td>
                  </tr>
                  <tr className="bg-amber-50/40">
                    <td className="font-medium text-amber-900">Maintainability</td>
                    <td className="text-center">5</td>
                    <td className="text-center font-semibold text-rose-600">No (0)</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-amber-800 font-medium">Experts ONLY</td>
                  </tr>
                  <tr className="bg-sky-50/40">
                    <td className="font-medium text-sky-900">Educational Effectiveness</td>
                    <td className="text-center">5</td>
                    <td className="text-center font-semibold text-emerald-600">Yes (5)</td>
                    <td className="text-center font-semibold text-rose-600">No (0)</td>
                    <td className="text-sky-800 font-medium">Students ONLY</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold">
                    <td>TOTAL APPLICABLE ITEMS</td>
                    <td className="text-center">35 Total</td>
                    <td className="text-center text-sky-700">30 Items</td>
                    <td className="text-center text-indigo-700">30 Items</td>
                    <td className="text-slate-700">Strict 30 items per respondent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Verbal Interpretation & Thesis Protocol */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">
              Thesis Verbal Interpretation Scale
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Official thesis evaluation scale and boundaries:
            </p>

            <table className="w-full text-xs table-academic">
              <thead>
                <tr>
                  <th className="text-left">Mean Range</th>
                  <th className="text-left">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {VERBAL_INTERPRETATION_SCALE.map((scale, i) => (
                  <tr key={i}>
                    <td className="font-mono text-slate-700">{scale.range}</td>
                    <td className="font-medium text-slate-900">{scale.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs space-y-2">
            <div className="font-bold text-sky-400 uppercase tracking-wide text-[11px] flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Research Protocol Rules</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              <li>Never convert missing responses into zero.</li>
              <li>Completed respondents must answer all 28 questions.</li>
              <li>Students never see Maintainability questions.</li>
              <li>Experts never see Educational Effectiveness.</li>
              <li>t-Test uses respondent-level observations with α = 0.05.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
