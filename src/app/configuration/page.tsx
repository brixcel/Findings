'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Edit,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_QUESTIONS, QuestionConfig } from '@/lib/questionnaire-config';

export default function ConfigurationPage() {
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/questions');
      const json = await res.json();
      if (json.data) {
        setQuestions(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleStartEdit = (q: QuestionConfig) => {
    setEditingId(q.itemId);
    setEditText(q.questionText);
    setSuccessMsg(null);
  };

  const handleSaveEdit = async (itemId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, questionText: editText }),
      });

      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) => (q.itemId === itemId ? { ...q, questionText: editText } : q))
        );
        setEditingId(null);
        setSuccessMsg(`Indicator ${itemId} wording updated successfully.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert('Failed to update indicator wording.');
      }
    } catch (e) {
      alert('Error updating question text');
    } finally {
      setSaving(false);
    }
  };

  // Group by criterion
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-sky-600" />
            <span>Questionnaire Indicators Configuration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain and edit printed questionnaire wording across all 33 indicators without altering statistical item IDs.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 flex items-center justify-center space-x-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
          <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
          <span>Loading questionnaire structure...</span>
        </div>
      ) : (
        <div className="space-y-6">
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
                {/* Banner */}
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

                {/* Items */}
                <div className="divide-y divide-slate-100">
                  {qList.map((q) => {
                    const isEditing = editingId === q.itemId;

                    return (
                      <div key={q.itemId} className="p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[11px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                                {q.itemId}
                              </span>
                              <span className="text-xs font-semibold text-slate-700">
                                Indicator #{q.itemNumber}
                              </span>
                            </div>

                            {isEditing ? (
                              <div className="space-y-2 pt-1">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  rows={3}
                                  className="w-full text-xs p-2.5 border border-sky-500 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => handleSaveEdit(q.itemId)}
                                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded flex items-center space-x-1 disabled:opacity-50"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{saving ? 'Saving...' : 'Save Wording'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-800 leading-relaxed pt-0.5">
                                {q.questionText}
                              </p>
                            )}
                          </div>

                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(q)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded transition-colors"
                              title="Edit question text"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
