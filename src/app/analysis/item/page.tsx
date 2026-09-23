'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Loader2,
  AlertCircle,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { getApplicableQuestions, QuestionConfig } from '@/lib/questionnaire-config';

export default function ItemAnalysisPage() {
  const [targetGroup, setTargetGroup] = useState<'STUDENT' | 'EXPERT'>('STUDENT');
  const [selectedCriterion, setSelectedCriterion] = useState<string>('Functionality');
  const [selectedItemId, setSelectedItemId] = useState<string>('FUNC_1');

  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [includeDemo, setIncludeDemo] = useState<boolean>(true);

  // Applicable questions based on selected group
  const applicableQuestions = React.useMemo(() => {
    return getApplicableQuestions(targetGroup);
  }, [targetGroup]);

  // Criteria list for selected group
  const criteriaList = React.useMemo(() => {
    return Array.from(new Set(applicableQuestions.map((q) => q.criterion)));
  }, [applicableQuestions]);

  // Questions within selected criterion
  const criterionQuestions = React.useMemo(() => {
    return applicableQuestions.filter((q) => q.criterion === selectedCriterion);
  }, [applicableQuestions, selectedCriterion]);

  // Ensure selectedItemId is valid whenever group or criterion changes
  useEffect(() => {
    if (!criteriaList.includes(selectedCriterion)) {
      setSelectedCriterion(criteriaList[0] || 'Functionality');
    }
  }, [targetGroup, criteriaList, selectedCriterion]);

  useEffect(() => {
    if (criterionQuestions.length > 0) {
      if (!criterionQuestions.some((q) => q.itemId === selectedItemId)) {
        setSelectedItemId(criterionQuestions[0].itemId);
      }
    }
  }, [criterionQuestions, selectedItemId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/statistics?includeDemo=${includeDemo}`);
      const json = await res.json();
      setStatsData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [includeDemo]);

  // Find the selected item's statistical metrics from server payload
  const currentItemStats = React.useMemo(() => {
    if (!statsData) return null;
    const groupResults =
      targetGroup === 'STUDENT' ? statsData.studentResults : statsData.expertResults;
    if (!groupResults || !groupResults.criteria) return null;

    const criterionObj = groupResults.criteria.find(
      (c: any) => c.criterion === selectedCriterion
    );
    if (!criterionObj || !criterionObj.items) return null;

    return criterionObj.items.find((it: any) => it.itemId === selectedItemId);
  }, [statsData, targetGroup, selectedCriterion, selectedItemId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <span>Item-Level Distribution & Frequency Analysis</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Drill down into individual questionnaire indicators to inspect 1–5 response counts, percentages, mean, and standard deviation.
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
        </div>
      </div>

      {/* Filter / Selector Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-sky-600" />
          <span>Select Evaluation Indicator</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Respondent Group */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              1. Respondent Group
            </label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value as 'STUDENT' | 'EXPERT')}
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="STUDENT">Student / End-User Evaluation</option>
              <option value="EXPERT">Instructor / Subject Matter Expert Evaluation</option>
            </select>
          </div>

          {/* 2. Criterion */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              2. Criterion
            </label>
            <select
              value={selectedCriterion}
              onChange={(e) => setSelectedCriterion(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {criteriaList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Item */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              3. Questionnaire Item
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {criterionQuestions.map((q) => (
                <option key={q.itemId} value={q.itemId}>
                  #{q.itemNumber} ({q.itemId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex items-center justify-center space-x-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
          <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
          <span>Loading indicator distribution...</span>
        </div>
      ) : !currentItemStats || currentItemStats.n === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <div className="font-bold text-slate-800 text-sm">No Response Data for this Indicator</div>
          <p>Encode questionnaires to inspect item-level frequency distributions.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Indicator Overview Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-xs mb-1">
                <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {currentItemStats.itemId}
                </span>
                <span className="font-semibold text-slate-600">
                  {selectedCriterion} • Item #{currentItemStats.itemNumber}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {targetGroup === 'STUDENT' ? 'Student Evaluation' : 'Expert Evaluation'}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 leading-relaxed">
                {currentItemStats.questionText}
              </h2>
            </div>

            {/* Key Stats Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Sample (N)</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{currentItemStats.n}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Weighted Mean</div>
                <div className="text-xl font-bold text-sky-700 mt-1">
                  {currentItemStats.weightedMean !== null ? currentItemStats.weightedMean.toFixed(2) : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Standard Deviation</div>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {currentItemStats.standardDeviation !== null ? currentItemStats.standardDeviation.toFixed(2) : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Verbal Interpretation</div>
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded inline-block mt-1">
                  {currentItemStats.interpretation}
                </div>
              </div>
            </div>
          </div>

          {/* Rating Frequency & Percentage Breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Response Frequency & Percentage Distribution (Ratings 1 to 5)
            </h3>

            <div className="space-y-3">
              {[
                { rating: 5, label: '5 - Very Much Acceptable (4.21–5.00)' },
                { rating: 4, label: '4 - Much Acceptable (3.41–4.20)' },
                { rating: 3, label: '3 - Acceptable (2.61–3.40)' },
                { rating: 2, label: '2 - Less Acceptable (1.81–2.60)' },
                { rating: 1, label: '1 - Not Acceptable (1.00–1.80)' },
              ].map(({ rating, label }) => {
                const freq = currentItemStats.frequencies?.[rating] || { count: 0, percentage: 0 };
                const pct = freq.percentage;

                return (
                  <div key={rating} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{label}</span>
                      <div className="space-x-2 font-mono">
                        <span className="font-bold text-slate-900">{freq.count}</span>
                        <span className="text-slate-500">({pct.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          rating >= 4
                            ? 'bg-sky-600'
                            : rating === 3
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
