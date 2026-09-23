'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Trash2,
  Edit,
  CheckCircle2,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

interface RespondentRow {
  id: string;
  respondentType: 'STUDENT' | 'EXPERT';
  academicProgram: string;
  yearLevel: string;
  deviceUsed: string;
  status: 'DRAFT' | 'COMPLETED';
  remarks?: string | null;
  isDemo: boolean;
  createdAt: string;
  _count: {
    answers: number;
  };
}

export default function RespondentsPage() {
  const router = useRouter();

  const [respondents, setRespondents] = useState<RespondentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [includeDemo, setIncludeDemo] = useState<boolean>(true);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchRespondents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        type: typeFilter,
        status: statusFilter,
        includeDemo: String(includeDemo),
      });

      const res = await fetch(`/api/respondents?${params.toString()}`);
      const data = await res.json();
      if (data.data) {
        setRespondents(data.data);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error('Failed to fetch respondents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRespondents();
  }, [page, limit, typeFilter, statusFilter, includeDemo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRespondents();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/respondents/${encodeURIComponent(deleteId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteId(null);
        fetchRespondents();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete respondent');
      }
    } catch (e) {
      alert('Error deleting respondent');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-600" />
            <span>Respondent Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Database records for encoded student and expert questionnaires ({pagination.total} Total)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/respondents/new"
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Respondent</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, Program, Year Level, Device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Group Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">All Groups</option>
              <option value="STUDENT">Students Only</option>
              <option value="EXPERT">Experts Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="DRAFT">Draft</option>
            </select>

            {/* Rows per page */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 focus:bg-white"
            >
              <option value={15}>15 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>

            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md font-medium"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => {
                setIncludeDemo(e.target.checked);
                setPage(1);
              }}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span>Include Synthetic Test / Demo Records in Table</span>
          </label>

          <div>
            Showing <strong className="text-slate-800">{respondents.length}</strong> of{' '}
            <strong className="text-slate-800">{pagination.total}</strong> records
          </div>
        </div>
      </div>

      {/* Respondents Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex items-center justify-center space-x-2 text-xs text-slate-500">
            <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
            <span>Loading database records...</span>
          </div>
        ) : respondents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No respondent records match your query. Click "Add Respondent" to encode a new evaluation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs table-academic">
              <thead>
                <tr>
                  <th className="text-left">Respondent ID</th>
                  <th className="text-left">Group</th>
                  <th className="text-left">Academic Program / Role</th>
                  <th className="text-left">Year / Position</th>
                  <th className="text-left">Device Used</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Answers</th>
                  <th className="text-left">Feedback / Remarks</th>
                  <th className="text-left">Date Added</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {respondents.map((r) => {
                  const isStudent = r.respondentType === 'STUDENT';
                  const isCompleted = r.status === 'COMPLETED';

                  return (
                    <tr key={r.id}>
                      {/* ID with Demo Badge */}
                      <td className="font-mono font-medium text-slate-900">
                        <div className="flex items-center space-x-1.5">
                          <span>{r.id}</span>
                          {r.isDemo && (
                            <span className="text-[9px] uppercase font-semibold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Group */}
                      <td>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isStudent
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {isStudent ? 'Student' : 'Expert'}
                        </span>
                      </td>

                      {/* Academic Program */}
                      <td className="text-slate-700 truncate max-w-xs" title={r.academicProgram}>
                        {r.academicProgram}
                      </td>

                      {/* Year Level */}
                      <td className="text-slate-600">{r.yearLevel}</td>

                      {/* Device Used */}
                      <td className="text-slate-600 truncate max-w-xs">{r.deviceUsed}</td>

                      {/* Status */}
                      <td className="text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <FileEdit className="w-3 h-3 text-amber-600" />
                              <span>Draft</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Answers Count */}
                      <td className="text-center font-mono">
                        <span
                          className={`font-semibold ${
                            r._count.answers === 30
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {r._count.answers} / 30
                        </span>
                      </td>

                      {/* Qualitative Feedback / Remarks */}
                      <td className="max-w-xs">
                        {r.remarks ? (
                          <div className="flex items-start space-x-1 text-slate-700" title={r.remarks}>
                            <MessageSquare className="w-3 h-3 text-sky-600 shrink-0 mt-0.5" />
                            <span className="truncate italic text-[11px]">{r.remarks}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Date Added */}
                      <td className="text-slate-500 text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <Link
                            href={`/respondents/${r.id}/edit`}
                            className="p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-sky-700 transition-colors"
                            title="Edit / View Answers"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteId(r.id)}
                            className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Respondent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <strong className="text-slate-900">{page}</strong> of{' '}
            <strong className="text-slate-900">{pagination.totalPages || 1}</strong>
          </div>

          <div className="flex items-center space-x-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete respondent <strong>{deleteId}</strong>? All associated 28 answer records will be permanently removed.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-3 py-1.5 text-xs text-slate-700 border border-slate-300 rounded hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 text-xs bg-rose-600 text-white font-semibold rounded hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
