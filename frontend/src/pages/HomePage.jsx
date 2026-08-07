import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            N
          </div>
          <span className="text-xl font-bold tracking-tight text-white">NIRMAAN 2.0</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-md shadow-indigo-600/20"
            >
              Go to Dashboard ({user?.name || 'User'})
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-md shadow-indigo-600/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
          Blueprint to 2D/3D Home Design Editor
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Design, Audit, and Transform <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Architectural Spaces
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
          NIRMAAN 2.0 gives you instant floor plan layout creation, automatic architectural auditing compliance checks, and 2D/3D visualization.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            Launch Editor
          </Link>
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-base transition-all hover:scale-[1.02]"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
