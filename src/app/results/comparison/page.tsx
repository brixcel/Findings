'use client';

import React, { useEffect, useState } from 'react';
import {
  Scale,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { TTestResult } from '@/lib/statistics';

export default function GroupComparisonPage() {
  const [results, setResults] = useState<TTestResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [includeDemo, setIncludeDemo] = useState<boolean>(true);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/statistics?includeDemo=${includeDemo}`);
      const json = await res.json();
      if (json.tTestResults) {
        setResults(json.tTestResults);
      }
      if (json.summary) {
        setSummary(json.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [includeDemo]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
              Objective 3 Statistical Test
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
              Two-Tailed • α = 0.05
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center space-x-2">
            <Scale className="w-5 h-5 text-sky-600" />
            <span>Group Comparison: Independent Samples t-Test</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Statistical comparison between Expert / Instructor and Student / End-User evaluations across shared criteria and composite shared mean.
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
            href={`/api/export?type=comparison&includeDemo=${includeDemo}`}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Hypothesis & Parameters Context Card */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-slate-400 uppercase font-semibold">Test Type</div>
          <div className="text-sm font-bold text-slate-100 mt-1">Independent Samples t-Test</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Two-Tailed Distribution</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase font-semibold">Significance Level (α)</div>
          <div className="text-sm font-bold text-sky-400 mt-1">α = 0.05</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Confidence Interval: 95%</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase font-semibold">Expert Sample Size (N₁)</div>
          <div className="text-sm font-bold text-indigo-400 mt-1">
            {summary?.expertCount ?? 0} Respondents
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Instructors & Specialists</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase font-semibold">Student Sample Size (N₂)</div>
          <div className="text-sm font-bold text-emerald-400 mt-1">
            {summary?.studentCount ?? 0} Respondents
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">End-User Students</div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex items-center justify-center space-x-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
          <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
          <span>Executing statistical tests and calculating p-values...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <div className="font-bold text-slate-800 text-sm">Insufficient Data for t-Test</div>
          <p>
            An Independent Samples t-Test requires at least 2 completed Expert responses and 2 completed Student responses.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                  Group Comparison Table (Expert vs Student)
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Evaluated across 5 shared criteria and the individual respondent-level Composite Shared Mean
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs table-academic">
                <thead>
                  <tr>
                    <th className="text-left">Variable / Criterion</th>
                    <th className="text-center">Expert Mean</th>
                    <th className="text-center">Student Mean</th>
                    <th className="text-center">Difference</th>
                    <th className="text-center">t-value</th>
                    <th className="text-center">df</th>
                    <th className="text-center">p-value</th>
                    <th className="text-center">Decision</th>
                    <th className="text-left">Statistical Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r, i) => {
                    const isComposite = r.variable === 'Composite Shared Mean';
                    const isReject = r.decision === 'Reject H₀';
                    const isInsufficient = r.decision === 'Insufficient data';

                    return (
                      <tr
                        key={r.variable}
                        className={isComposite ? 'bg-sky-50/70 font-semibold border-t-2 border-slate-300' : ''}
                      >
                        {/* Variable */}
                        <td className="font-semibold text-slate-900">
                          <div className="flex items-center space-x-1.5">
                            <span>{r.variable}</span>
                            {isComposite && (
                              <span className="text-[9px] uppercase font-bold bg-sky-600 text-white px-1.5 py-0.2 rounded">
                                Composite
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Expert Mean */}
                        <td className="text-center font-mono text-slate-800">
                          {r.expertMean !== null ? r.expertMean.toFixed(2) : 'N/A'}
                        </td>

                        {/* Student Mean */}
                        <td className="text-center font-mono text-slate-800">
                          {r.studentMean !== null ? r.studentMean.toFixed(2) : 'N/A'}
                        </td>

                        {/* Difference */}
                        <td className="text-center font-mono text-slate-700">
                          {r.difference !== null ? (r.difference > 0 ? `+${r.difference.toFixed(2)}` : r.difference.toFixed(2)) : 'N/A'}
                        </td>

                        {/* t-value */}
                        <td className="text-center font-mono font-bold text-slate-900">
                          {r.tValue !== null ? r.tValue.toFixed(4) : 'N/A'}
                        </td>

                        {/* df */}
                        <td className="text-center font-mono text-slate-600">
                          {r.degreesOfFreedom !== null ? r.degreesOfFreedom : 'N/A'}
                        </td>

                        {/* p-value */}
                        <td className="text-center font-mono font-bold">
                          {r.pValue !== null ? (
                            <span
                              className={
                                r.pValue <= 0.05
                                  ? 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded'
                                  : 'text-slate-800'
                              }
                            >
                              {r.pValue.toFixed(4)}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>

                        {/* Decision (Strictly Reject H0 or Fail to reject H0) */}
                        <td className="text-center">
                          {isInsufficient ? (
                            <span className="text-slate-400 italic">Insufficient data</span>
                          ) : isReject ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                              Reject H₀
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Fail to reject H₀
                            </span>
                          )}
                        </td>

                        {/* Statistical Result */}
                        <td>
                          {isInsufficient ? (
                            <span className="text-slate-400 italic">Insufficient data</span>
                          ) : isReject ? (
                            <span className="text-rose-700 font-medium">
                              Statistically significant difference (p ≤ 0.05)
                            </span>
                          ) : (
                            <span className="text-slate-700">
                              No statistically significant difference (p &gt; 0.05)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Notes & Methodological Explanation */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Statistical Protocol & Hypothesis Interpretation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-900">Null Hypothesis (H₀):</div>
                <p>
                  There is no statistically significant difference between the assessments of Students and Subject Matter Experts regarding the shared criteria of the AR-DUINO-M system.
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  • If <strong>p &gt; 0.05</strong>: We <strong>Fail to reject H₀</strong> (assessments are statistically consistent).
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-900">Alternative Hypothesis (H₁):</div>
                <p>
                  There is a statistically significant difference between the assessments of Students and Subject Matter Experts.
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  • If <strong>p ≤ 0.05</strong>: We <strong>Reject H₀</strong> (statistically significant difference found).
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex flex-col gap-1">
              <div>
                <strong>Exclusion Note:</strong> <em>Maintainability</em> (evaluated exclusively by Experts) and <em>Educational Effectiveness</em> (evaluated exclusively by Students) are strictly omitted from the comparative t-test.
              </div>
              <div>
                <strong>Composite Shared Mean Note:</strong> Calculated using individual respondent-level observation averages across the 25 shared indicators (Functionality: 5, Reliability: 5, Usability: 5, Efficiency: 5, Portability: 5), preserving variance for the two-sample test.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
