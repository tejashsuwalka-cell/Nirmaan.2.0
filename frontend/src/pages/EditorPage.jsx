import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function EditorPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/projects/${projectId}`);
      setProject(res.data);
    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      const payload = {
        walls: project?.walls || [],
        doors: project?.doors || [],
        windows: project?.windows || [],
      };
      const res = await apiClient.post('/audit', payload);
      setAuditResult(res.data);
    } catch (err) {
      console.error('Audit failed:', err);
      alert('Failed to execute layout audit');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Editor Toolbar */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
          <span className="text-slate-700">|</span>
          <h1 className="text-sm font-bold text-white">
            {isLoading ? 'Loading...' : project?.name || `Project (${projectId})`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAudit}
            disabled={isAuditing}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {isAuditing ? 'Running Audit...' : '⚡ Run Compliance Audit'}
          </button>
        </div>
      </header>

      {/* Editor Canvas Placeholder */}
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 bg-slate-900/40 p-6 flex flex-col items-center justify-center border-r border-slate-800 relative">
          <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              2D
            </div>
            <h3 className="text-xl font-bold text-white mb-2">2D Floor Plan Canvas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive wall drawing, door, and window placement editor placeholder.
            </p>
          </div>
        </div>

        {/* Audit Panel / Inspection Side Panel */}
        {auditResult && (
          <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-white">Audit Report</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                auditResult.score >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                Score: {auditResult.score}/100
              </span>
            </div>

            {auditResult.warnings?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Warnings</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {auditResult.warnings.map((w, idx) => (
                    <li key={idx} className="bg-amber-500/10 border border-amber-500/20 p-2 rounded">
                      ⚠️ {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {auditResult.suggestions?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Suggestions</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {auditResult.suggestions.map((s, idx) => (
                    <li key={idx} className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded">
                      💡 {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {auditResult.disclaimer && (
              <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-3 mt-4">
                {auditResult.disclaimer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
