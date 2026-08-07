import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const res = await apiClient.post('/projects', {
        name: newProjectName.trim(),
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            N
          </div>
          <span className="text-xl font-bold tracking-tight text-white">NIRMAAN 2.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            Welcome, <strong className="text-slate-200">{user?.name || 'User'}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Projects</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and edit your architectural floor plans</p>
          </div>

          <form onSubmit={handleCreateProject} className="flex gap-2">
            <input
              type="text"
              placeholder="New project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isCreating || !newProjectName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : '+ Create Project'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/20">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto mb-4 text-slate-400">
              📐
            </div>
            <h3 className="text-lg font-semibold text-slate-200">No projects yet</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6">Create your first 2D floor plan project to get started.</p>
            <button
              onClick={() => {
                const name = prompt('Enter project name:', 'My Dream Home');
                if (name) {
                  setNewProjectName(name);
                }
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h3>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {project.type || '2D Design'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-6">
                    <span>{project.walls?.length || 0} Walls</span>
                    <span>•</span>
                    <span>{project.doors?.length || 0} Doors</span>
                    <span>•</span>
                    <span>{project.windows?.length || 0} Windows</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500">
                    Updated {new Date(project.updated_at || Date.now()).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/editor/${project.id}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Open Editor →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
