'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle,
  PlusCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Keyboard,
  Info,
  MessageSquareQuote,
} from 'lucide-react';
import {
  QuestionConfig,
  getApplicableQuestions,
  CRITERIA_ORDER,
} from '@/lib/questionnaire-config';

interface DataEntryFormProps {
  initialData?: {
    id: string;
    respondentType: 'STUDENT' | 'EXPERT';
    academicProgram: string;
    yearLevel: string;
    deviceUsed: string;
    status: 'DRAFT' | 'COMPLETED';
    remarks?: string | null;
    answers?: Record<string, number>;
  };
  isEdit?: boolean;
}

export default function DataEntryForm({ initialData, isEdit = false }: DataEntryFormProps) {
  const router = useRouter();

  // Profile fields
  const [respondentType, setRespondentType] = useState<'STUDENT' | 'EXPERT'>(
    initialData?.respondentType || 'STUDENT'
  );
  const [respondentId, setRespondentId] = useState<string>(
    initialData?.id || `RESP-STU-${Date.now().toString().slice(-4)}`
  );
  const [academicProgram, setAcademicProgram] = useState<string>(
    initialData?.academicProgram || 'BSCPE'
  );
  const [yearLevel, setYearLevel] = useState<string>(
    initialData?.yearLevel || (initialData?.respondentType === 'EXPERT' ? 'Faculty / Instructor' : '3rd Year')
  );
  const [deviceUsed, setDeviceUsed] = useState<string>(
    initialData?.deviceUsed || 'Researcher-provided device'
  );
  const [remarks, setRemarks] = useState<string>(
    initialData?.remarks || ''
  );

  // Ratings: itemId -> rating (1-5)
  const [answers, setAnswers] = useState<Record<string, number>>(
    initialData?.answers || {}
  );

  // Active question index for keyboard navigation focus
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Status and UI feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Questions configuration based on respondent type (strictly 28 items)
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);

  useEffect(() => {
    const list = getApplicableQuestions(respondentType);
    setQuestions(list);

    // If changing respondent type on creation, generate appropriate ID
    if (!isEdit && !initialData) {
      const prefix = respondentType === 'STUDENT' ? 'RESP-STU' : 'RESP-EXP';
      setRespondentId(`${prefix}-${Date.now().toString().slice(-4)}`);
      if (respondentType === 'EXPERT' && yearLevel === '3rd Year') {
        setYearLevel('Faculty / Instructor');
      } else if (respondentType === 'STUDENT' && yearLevel === 'Faculty / Instructor') {
        setYearLevel('3rd Year');
      }
    }
  }, [respondentType]);

  // Total applicable questions is always 28
  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => answers[q.itemId] !== undefined).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Set rating for a question and optionally auto-advance
  const handleSelectRating = (itemId: string, rating: number, currentIndex: number) => {
    setAnswers((prev) => ({ ...prev, [itemId]: rating }));
    setErrorMsg(null);

    if (autoAdvance && currentIndex < totalQuestions - 1) {
      setActiveQuestionIndex(currentIndex + 1);
    }
  };

  // Keyboard shortcut listener (1-5 for ratings, Tab/Arrow keys for navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focused on text inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const rating = parseInt(e.key, 10);
        if (questions[activeQuestionIndex]) {
          const curQ = questions[activeQuestionIndex];
          handleSelectRating(curQ.itemId, rating, activeQuestionIndex);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        if (activeQuestionIndex < totalQuestions - 1) {
          setActiveQuestionIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (activeQuestionIndex > 0) {
          setActiveQuestionIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestionIndex, questions, autoAdvance]);

  // Group questions by criterion for display
  const criteriaGroups = React.useMemo(() => {
    const map = new Map<string, QuestionConfig[]>();
    for (const q of questions) {
      if (!map.has(q.criterion)) {
        map.set(q.criterion, []);
      }
      map.get(q.criterion)!.push(q);
    }
    return Array.from(map.entries());
  }, [questions]);

  // Submission handler (Draft or Completed, plus Add Another flow)
  const handleSubmit = async (targetStatus: 'DRAFT' | 'COMPLETED', addAnother = false) => {
    setErrorMsg(null);

    if (!respondentId.trim()) {
      setErrorMsg('Respondent ID is required.');
      return;
    }

    if (targetStatus === 'COMPLETED') {
      const missing = questions.filter((q) => answers[q.itemId] === undefined);
      if (missing.length > 0) {
        setErrorMsg(
          `Cannot save as Completed: ${missing.length} question(s) remain unanswered. Answer all ${totalQuestions} questions or choose "Save Draft".`
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        id: respondentId.trim(),
        respondentType,
        academicProgram,
        yearLevel,
        deviceUsed,
        status: targetStatus,
        remarks: remarks.trim() || undefined,
        answers,
      };

      const url = isEdit ? `/api/respondents/${initialData?.id}` : '/api/respondents';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save respondent record.');
      }

      if (addAnother) {
        // Reset form for next respondent
        const prefix = respondentType === 'STUDENT' ? 'RESP-STU' : 'RESP-EXP';
        setRespondentId(`${prefix}-${Date.now().toString().slice(-4)}`);
        setRemarks('');
        setAnswers({});
        setActiveQuestionIndex(0);
        setErrorMsg(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/respondents');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Fast Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <button
            type="button"
            onClick={() => router.push('/respondents')}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Respondents</span>
          </button>
          <h1 className="text-lg font-bold text-slate-900">
            {isEdit ? `Edit Evaluation: ${initialData?.id}` : 'Fast Questionnaire Data Entry'}
          </h1>
          <p className="text-xs text-slate-500">
            Encode physical questionnaire ratings into research database.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span className="font-medium">Auto-Advance on Keypress</span>
          </label>
        </div>
      </div>

      {/* Progress & Shortcut Guide Bar */}
      <div className="bg-slate-900 text-white rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-16 z-40">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-sky-400">
              Question {activeQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-slate-300">
              {answeredCount} / {totalQuestions} Answered ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-300 border-t sm:border-t-0 sm:border-l border-slate-700 pt-2 sm:pt-0 sm:pl-4">
          <Keyboard className="w-4 h-4 text-sky-400" />
          <span>Press keys <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">1</strong>–<strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">5</strong> to rate • <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">↑</strong> <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">↓</strong> to navigate</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Respondent Profile Metadata Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          1. Respondent Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* Respondent ID */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Respondent ID
            </label>
            <input
              type="text"
              value={respondentId}
              onChange={(e) => setRespondentId(e.target.value)}
              disabled={isEdit}
              className="w-full text-xs font-mono border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-60"
            />
          </div>

          {/* Respondent Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Respondent Group
            </label>
            <select
              value={respondentType}
              onChange={(e) => setRespondentType(e.target.value as 'STUDENT' | 'EXPERT')}
              disabled={isEdit}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-60 font-semibold text-slate-800"
            >
              <option value="STUDENT">Student / End-User (30 Qs)</option>
              <option value="EXPERT">Instructor / Subject Expert (30 Qs)</option>
            </select>
          </div>

          {/* Academic Program */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Academic Program / Dept
            </label>
            <input
              type="text"
              value={academicProgram}
              onChange={(e) => setAcademicProgram(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Year Level / Position */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Year Level / Position
            </label>
            <input
              type="text"
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Device Used */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Device Used
            </label>
            <select
              value={deviceUsed}
              onChange={(e) => setDeviceUsed(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="Researcher-provided device">Researcher-provided device</option>
              <option value="Own device / downloaded from website">Own device / downloaded from website</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>
            {respondentType === 'STUDENT'
              ? `Student Profile: Evaluates 5 Core Criteria + Educational Effectiveness (${totalQuestions} questions total). Maintainability is strictly excluded.`
              : `Subject Expert Profile: Evaluates 5 Core Criteria + Maintainability (${totalQuestions} questions total). Educational Effectiveness is strictly excluded.`}
          </span>
        </div>
      </div>

      {/* 2. Questionnaire Rating Items Grouped by Criterion */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Questionnaire Ratings ({totalQuestions} Items)
          </h2>
          <span className="text-xs text-slate-500">
            Click rating or use keys <strong>1, 2, 3, 4, 5</strong>
          </span>
        </div>

        {criteriaGroups.map(([criterion, qList]) => {
          const isStudentOnly = criterion === 'Educational Effectiveness';
          const isExpertOnly = criterion === 'Maintainability';

          return (
            <div
              key={criterion}
              className={`bg-white border rounded-lg overflow-hidden shadow-xs ${
                isStudentOnly
                  ? 'border-sky-200'
                  : isExpertOnly
                  ? 'border-indigo-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Criterion Banner */}
              <div
                className={`px-4 py-2.5 flex items-center justify-between ${
                  isStudentOnly
                    ? 'bg-sky-50 text-sky-900 border-b border-sky-100'
                    : isExpertOnly
                    ? 'bg-indigo-50 text-indigo-900 border-b border-indigo-100'
                    : 'bg-slate-100 text-slate-800 border-b border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs">{criterion}</span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                    {qList.length} Items
                  </span>
                </div>
                <div className="text-[11px] font-medium">
                  {isStudentOnly && '★ Students Only'}
                  {isExpertOnly && '★ Experts Only'}
                  {!isStudentOnly && !isExpertOnly && 'Shared Criterion'}
                </div>
              </div>

              {/* Questions List */}
              <div className="divide-y divide-slate-100">
                {qList.map((q) => {
                  const globalIndex = questions.findIndex((item) => item.itemId === q.itemId);
                  const isCurrent = globalIndex === activeQuestionIndex;
                  const currentRating = answers[q.itemId];

                  return (
                    <div
                      key={q.itemId}
                      onClick={() => setActiveQuestionIndex(globalIndex)}
                      className={`p-4 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-50/60 ring-2 ring-inset ring-sky-500'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Question Text */}
                        <div className="flex-1 pr-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-[11px] font-bold font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {q.itemId}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              Item #{q.itemNumber}
                            </span>
                            {currentRating !== undefined ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Rating: {currentRating}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                Unanswered
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed">
                            {q.questionText}
                          </p>
                        </div>

                        {/* Large Rating Buttons 1 to 5 */}
                        <div className="flex items-center space-x-1.5 shrink-0 self-end md:self-auto">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isSelected = currentRating === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectRating(q.itemId, val, globalIndex);
                                }}
                                className={`w-11 h-11 rounded-md text-sm font-bold transition-all flex flex-col items-center justify-center border ${
                                  isSelected
                                    ? 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300 shadow-sm scale-105'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                <span>{val}</span>
                                <span className="text-[8px] font-normal uppercase opacity-75">
                                  {val === 5 ? 'V.Much' : val === 1 ? 'Not' : `Key ${val}`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Qualitative Feedback / Comments Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center space-x-2 mb-2">
          <MessageSquareQuote className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Qualitative Feedback / Remarks & Recommendations (Optional)
          </h3>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Encode any written comments, suggestions, or technical remarks provided by the respondent on the physical questionnaire. This qualitative data supports findings in Chapter 4 & 5.
        </p>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="e.g., The AR interface is intuitive and tracking is responsive; recommend adding night mode..."
          className="w-full text-xs border border-slate-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-4 z-30">
        <div className="text-xs text-slate-600">
          Status: <span className="font-semibold text-slate-900">{answeredCount === totalQuestions ? 'All 28 Answered' : `${totalQuestions - answeredCount} Remaining`}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Save Draft */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT', false)}
            className="flex items-center space-x-1.5 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Save Draft</span>
          </button>

          {/* Save & Complete */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('COMPLETED', false)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete & Save</span>
          </button>

          {/* Save & Add Another (Only on new entries) */}
          {!isEdit && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('COMPLETED', true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Complete & Add Another</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
