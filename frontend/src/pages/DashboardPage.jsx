import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { Plus, Trash2, ExternalLink, FolderPlus, LogOut, Layers } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    if (e) e.preventDefault();
    const nameToUse = newProjectName.trim() || 'My Floor Plan';

    setIsCreating(true);
    try {
      const res = await apiClient.post('/projects', {
        name: nameToUse,
        type: 'Residential Design',
        walls: [],
        doors: [],
        windows: [],
      });
      setNewProjectName('');
      setProjects((prev) => [res.data, ...prev]);
      navigate(`/editor/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setDeletingId(projectId);
    try {
      await apiClient.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <nav className="max-w-6xl mx-auto rounded-2xl glass-panel px-6 py-3.5 flex justify-between items-center shadow-lg border border-white/80">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/25">
                N
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                  NIRMAAN <span className="text-indigo-600 font-bold">2.0</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  Workspace
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-600">
              Logged in as <strong className="text-slate-900">{user?.name || 'User'}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl glass-button text-xs font-bold transition-all flex items-center gap-1.5 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Your Projects</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage and edit your architectural floor plans in 2D and 3D</p>
          </div>

          <form onSubmit={handleCreateProject} className="flex gap-2">
            <input
              type="text"
              placeholder="New project title..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="glass-input rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 min-w-[200px]"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 bg-red-50/80 border border-red-200/80 rounded-2xl p-4 text-xs font-semibold text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl glass-card animate-pulse"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel border border-dashed border-slate-300 rounded-3xl p-12 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
              <FolderPlus className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No projects created yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">Create your first architectural 2D/3D floor plan to get started.</p>
            <button
              onClick={() => handleCreateProject()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-white/90 relative group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors pr-4">
                      {project.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                      {project.type || '2D/3D Design'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.walls?.length || 0} Walls</span>
                    <span>•</span>
                    <span>{project.doors?.length || 0} Doors</span>
                    <span>•</span>
                    <span>{project.windows?.length || 0} Windows</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                  <span className="text-[11px] font-medium text-slate-400">
                    Updated {formatDate(project.updated_at)}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={deletingId === project.id}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/editor/${project.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5"
                    >
                      Open Editor
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
