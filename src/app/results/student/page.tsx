'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Download,
  Loader2,
  AlertCircle,
  BarChart2,
  ArrowRight,
  MessageSquareQuote,
} from 'lucide-react';
import { VERBAL_INTERPRETATION_SCALE } from '@/lib/statistics';

export default function StudentResultsPage() {
  const [data, setData] = useState<any>(null);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [includeDemo, setIncludeDemo] = useState<boolean>(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/statistics?includeDemo=${includeDemo}`);
      const json = await res.json();
      if (json.studentResults) {
        setData(json.studentResults);
      }
      if (json.studentRemarks) {
        setRemarks(json.studentRemarks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [includeDemo]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
              Student / End-User Evaluation
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              30 Indicators • 6 Criteria
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-sky-600" />
            <span>Student Questionnaire Results & Analysis</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Calculations for Functionality, Reliability, Usability, Efficiency, Portability, and Educational Effectiveness.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span className="font-medium">Include Test Data</span>
          </label>

          <a
            href={`/api/export?type=statistics&includeDemo=${includeDemo}`}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex items-center justify-center space-x-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
          <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
          <span>Computing student evaluation statistics...</span>
        </div>
      ) : !data || data.sampleSize === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <div className="font-bold text-slate-800 text-sm">No Completed Student Evaluations Found</div>
          <p>Encode student questionnaires or generate synthetic test data to view statistical results.</p>
          <Link
            href="/respondents/new"
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-sky-600 text-white font-medium rounded text-xs mt-2"
          >
            <span>Encode Student Questionnaire</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-sky-950 text-white rounded-lg p-5 border border-sky-900 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-sky-300 uppercase font-semibold">Student Sample Size (N)</div>
              <div className="text-2xl font-bold mt-1 text-white">{data.sampleSize}</div>
              <div className="text-[11px] text-sky-400 mt-0.5">Completed Respondents</div>
            </div>
            <div>
              <div className="text-xs text-sky-300 uppercase font-semibold">Overall Grand Mean</div>
              <div className="text-2xl font-bold mt-1 text-white">
                {data.grandMean !== null ? data.grandMean.toFixed(2) : 'N/A'}
              </div>
              <div className="text-[11px] text-sky-400 mt-0.5">Across all 30 items</div>
            </div>
            <div>
              <div className="text-xs text-sky-300 uppercase font-semibold">Overall Standard Deviation</div>
              <div className="text-2xl font-bold mt-1 text-white">
                {data.grandSD !== null ? data.grandSD.toFixed(2) : 'N/A'}
              </div>
              <div className="text-[11px] text-sky-400 mt-0.5">Sample SD</div>
            </div>
            <div>
              <div className="text-xs text-sky-300 uppercase font-semibold">Grand Verbal Interpretation</div>
              <div className="text-base font-bold mt-1.5 text-sky-200 bg-sky-900/60 border border-sky-800 px-2.5 py-1 rounded inline-block">
                {data.grandInterpretation}
              </div>
              <div className="text-[11px] text-sky-400 mt-1">Thesis Evaluation Standard</div>
            </div>
          </div>

          {/* Criteria Breakdown Tables */}
          {data.criteria.map((c: any) => {
            const isSpecial = c.criterion === 'Educational Effectiveness';

            return (
              <div
                key={c.criterion}
                className={`bg-white border rounded-lg overflow-hidden shadow-xs ${
                  isSpecial ? 'border-sky-300' : 'border-slate-200'
                }`}
              >
                {/* Table Header / Title */}
                <div
                  className={`px-5 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isSpecial
                      ? 'bg-sky-50 text-sky-950 border-sky-200'
                      : 'bg-slate-100 text-slate-900 border-slate-200'
                  }`}
                >
                  <div>
                    <h2 className="font-bold text-sm flex items-center space-x-2">
                      <span>{c.criterion}</span>
                      {isSpecial && (
                        <span className="text-[10px] uppercase font-bold bg-sky-600 text-white px-2 py-0.5 rounded">
                          Student-Specific Criterion
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {c.items.length} items evaluated by {c.n} student respondents
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-semibold">
                    <div>
                      Mean: <span className="text-sky-700 font-mono text-sm">{c.overallMean !== null ? c.overallMean.toFixed(2) : 'N/A'}</span>
                    </div>
                    <div>
                      SD: <span className="text-slate-700 font-mono text-sm">{c.overallSD !== null ? c.overallSD.toFixed(2) : 'N/A'}</span>
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-current text-sky-800">
                      {c.interpretation}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs table-academic">
                    <thead>
                      <tr>
                        <th className="text-center w-16">Item #</th>
                        <th className="text-left w-24">Item ID</th>
                        <th className="text-left">Indicator / Questionnaire Wording</th>
                        <th className="text-center w-16">N</th>
                        <th className="text-center w-24">Weighted Mean</th>
                        <th className="text-center w-24">Std Deviation</th>
                        <th className="text-left w-44">Verbal Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {c.items.map((item: any) => (
                        <tr key={item.itemId}>
                          <td className="text-center font-bold text-slate-600">{item.itemNumber}</td>
                          <td className="font-mono text-slate-500 font-medium">{item.itemId}</td>
                          <td className="text-slate-800 leading-relaxed pr-4">{item.questionText}</td>
                          <td className="text-center font-mono text-slate-600">{item.n}</td>
                          <td className="text-center font-mono font-bold text-sky-900 bg-sky-50/30">
                            {item.weightedMean !== null ? item.weightedMean.toFixed(2) : 'N/A'}
                          </td>
                          <td className="text-center font-mono text-slate-600">
                            {item.standardDeviation !== null ? item.standardDeviation.toFixed(2) : 'N/A'}
                          </td>
                          <td className="font-semibold text-slate-800">{item.interpretation}</td>
                        </tr>
                      ))}

                      {/* Criterion Overall Summary Row */}
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                        <td colSpan={3} className="text-right text-slate-800 tracking-wide uppercase text-[11px] pr-4">
                          Overall Criterion Mean ({c.criterion})
                        </td>
                        <td className="text-center font-mono text-slate-800">{c.n}</td>
                        <td className="text-center font-mono text-sky-900 text-sm bg-sky-100/60">
                          {c.overallMean !== null ? c.overallMean.toFixed(2) : 'N/A'}
                        </td>
                        <td className="text-center font-mono text-slate-800">
                          {c.overallSD !== null ? c.overallSD.toFixed(2) : 'N/A'}
                        </td>
                        <td className="text-sky-900 font-bold">{c.interpretation}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Qualitative Feedback & Remarks Section for Chapter 4 & 5 */}
      {!loading && data && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <MessageSquareQuote className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Qualitative Student Feedback & Recommendations
                </h3>
                <p className="text-xs text-slate-500">
                  Triangulation data for Chapter 4 (Results & Discussion) and Chapter 5 (Recommendations).
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full self-start sm:self-auto">
              {remarks.length} Recorded Comment{remarks.length === 1 ? '' : 's'}
            </span>
          </div>

          {remarks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3 text-center">
              No written remarks or qualitative suggestions recorded from student respondents yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {remarks.map((r, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2 relative hover:border-sky-300 transition-colors"
                >
                  <p className="text-xs text-slate-800 italic leading-relaxed">
                    "{r.remarks}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                    <span className="font-semibold text-sky-800">{r.id} ({r.program})</span>
                    <span>{r.yearLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
