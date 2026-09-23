'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DataEntryForm from '@/components/DataEntryForm';
import { Loader2, AlertCircle } from 'lucide-react';

export default function EditRespondentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/respondents/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Respondent not found');
        }

        const r = json.data;
        const answerMap: Record<string, number> = {};
        if (r.answers && Array.isArray(r.answers)) {
          r.answers.forEach((a: any) => {
            answerMap[a.itemId] = a.rating;
          });
        }

        setInitialData({
          id: r.id,
          respondentType: r.respondentType,
          academicProgram: r.academicProgram,
          yearLevel: r.yearLevel,
          deviceUsed: r.deviceUsed,
          status: r.status,
          remarks: r.remarks,
          answers: answerMap,
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <span className="ml-3 text-sm text-slate-600">Loading respondent data...</span>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-rose-200 rounded-lg text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-slate-900">Unable to Load Respondent</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'Record not found.'}</p>
        <button
          onClick={() => router.push('/respondents')}
          className="mt-4 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-700"
        >
          Return to Respondents
        </button>
      </div>
    );
  }

  return <DataEntryForm initialData={initialData} isEdit={true} />;
}
