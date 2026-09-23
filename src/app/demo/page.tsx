'use client';

import React, { useEffect, useState } from 'react';
import {
  FlaskConical,
  Database,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Play,
  RefreshCw,
  Users,
  Layers,
} from 'lucide-react';

export default function DemoManagementPage() {
  const [demoStatus, setDemoStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [purging, setPurging] = useState<boolean>(false);
  const [students, setStudents] = useState<number>(100);
  const [experts, setExperts] = useState<number>(50);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo');
      const json = await res.json();
      setDemoStatus(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students, experts }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || 'Synthetic test respondents created successfully.');
        fetchStatus();
      } else {
        alert(data.error || 'Failed to generate test data.');
      }
    } catch (e) {
      alert('Error generating test data');
    } finally {
      setGenerating(false);
    }
  };

  const handlePurge = async () => {
    if (!confirm('Are you sure you want to purge all synthetic test records? Real encoded respondents will NOT be affected.')) {
      return;
    }
    setPurging(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/demo', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || 'Synthetic test respondents purged.');
        fetchStatus();
      } else {
        alert(data.error || 'Failed to purge test data.');
      }
    } catch (e) {
      alert('Error purging test data');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-sky-600" />
            <span>150+ Thesis Respondent Scale & Test Suite</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate and validate large-scale evaluation datasets (150–1,000 respondents / 4,200+ raw response records) without contaminating real research data.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="flex items-center space-x-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-900 rounded-md text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Database Population Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Real Thesis Records</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {loading ? '...' : demoStatus?.realCount ?? 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Physical Questionnaires</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-amber-700 uppercase">Synthetic Test Records</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">
            {loading ? '...' : demoStatus?.demoCount ?? 0}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            {demoStatus?.demoStudentCount ?? 0} Students • {demoStatus?.demoExpertCount ?? 0} Experts
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-sky-700 uppercase">Total Response Records</div>
          <div className="text-2xl font-bold text-sky-900 mt-1">
            {loading ? '...' : demoStatus?.demoAnswersCount ?? 0}
          </div>
          <div className="text-[11px] text-sky-700 mt-0.5">30 answers per respondent</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Data Isolation</div>
          <div className="text-sm font-bold text-slate-800 mt-2 flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Strictly Partitioned</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">1-Click Purgeable</div>
        </div>
      </div>

      {/* Generator & Purge Action Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Generate Synthetic 150+ Test Dataset
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Number of Students
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Number of Subject Matter Experts
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={experts}
              onChange={(e) => setExperts(Number(e.target.value))}
              className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            disabled={generating}
            onClick={handleGenerate}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2.5 rounded-md shadow-xs transition-colors disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {students + experts} Test Records...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Generate {students + experts} Test Respondents ({(students + experts) * 30} Responses)</span>
              </>
            )}
          </button>

          {demoStatus?.demoCount > 0 && (
            <button
              type="button"
              disabled={purging}
              onClick={handlePurge}
              className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2.5 rounded-md shadow-xs transition-colors disabled:opacity-50"
            >
              {purging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Purging...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Purge All {demoStatus.demoCount} Test Records</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Quality Requirements Checklist from plan.md */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          12-Point Thesis Quality & Scale Requirements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          {[
            '1. 150+ respondents stored in relational SQLite database with foreign keys',
            '2. 150 respondents appear correctly in the paginated management system',
            '3. Database pagination works with offset/limit queries',
            '4. Full-text search and respondent-type filtering operate properly',
            '5. All 4,500+ individual response records preserved with raw ratings',
            '6. Student and Expert sample sizes separated (30 questions each)',
            '7. Weighted Means computed using exact thesis formula Σ(f × x)/N',
            '8. Sample standard deviations computed across individual observations',
            '9. Frequency and percentage distributions for ratings 1–5 calculated',
            '10. Objective 3 Independent Samples t-Test uses respondent-level observations',
            '11. CSV exports contain all respondents and responses',
            '12. Deleting or editing a respondent safely cascades without corrupting unrelated data',
          ].map((req, i) => (
            <div key={i} className="flex items-start space-x-2 p-2 rounded bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700">{req}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
