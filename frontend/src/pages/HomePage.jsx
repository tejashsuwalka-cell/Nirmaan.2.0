import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Room3DCanvas from '../components/Room3DCanvas';
import {
  Sparkles,
  ShieldCheck,
  Box,
  ArrowRight,
  Layout,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Glass Navigation Header */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <nav className="max-w-6xl mx-auto rounded-2xl glass-panel px-6 py-3.5 flex justify-between items-center shadow-lg border border-white/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/25">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                NIRMAAN <span className="text-indigo-600 font-bold">2.0</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                3D Architectural Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
              >
                Go to Dashboard ({user?.name || 'User'})
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section with Interactive 3D Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-8 pb-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Interactive 3D Architectural Design Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Architectural Precision, <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Elevated in 3D Space
            </span>
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed font-normal mb-8">
            Experience effortless floor plan drafting, real-time 3D WebGL visualization, and instant compliance audit checks wrapped in a refined glassmorphic canvas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Box className="w-5 h-5" />
              Launch 3D Studio
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-button font-bold text-base transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Sign In to Project
            </Link>
          </div>
        </div>

        {/* Hero Interactive 3D WebGL Canvas */}
        <div className="relative mb-24">
          {/* Floating Glass Badges */}
          <div className="hidden lg:flex absolute -top-6 -left-6 z-10 p-4 rounded-2xl glass-panel border border-white/90 shadow-xl items-center gap-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Real-time 3D Lighting</div>
              <div className="text-[11px] text-slate-500 font-medium">Physics-based soft shadows</div>
            </div>
          </div>

          <div className="hidden lg:flex absolute -bottom-6 -right-6 z-10 p-4 rounded-2xl glass-panel border border-white/90 shadow-xl items-center gap-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Instant Compliance Audit</div>
              <div className="text-[11px] text-slate-500 font-medium">Automatic spatial verification</div>
            </div>
          </div>

          <Room3DCanvas height="520px" materialPreset="oak" />
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Crafted for Modern Architects
            </h2>
            <p className="text-slate-600 text-sm">
              Refined tools engineered for maximum clarity, speed, and spatial accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl glass-card border border-white/80">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Precision 2D Blueprinting</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Intuitive grid snapping, precise wall thickness controls, and instant element placement for doors and windows.
              </p>
            </div>

            <div className="p-8 rounded-3xl glass-card border border-white/80">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Interactive 3D WebGL</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visualize architectural layouts in real-time 3D with realistic lighting, material presets, and fluid camera controls.
              </p>
            </div>

            <div className="p-8 rounded-3xl glass-card border border-white/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Automated Compliance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instant rule-based scoring engine evaluating wall enclosures, entryways, and natural lighting access.
              </p>
            </div>
          </div>
        </div>

        {/* Architectural Showcase Banner */}
        <div className="p-10 rounded-3xl glass-panel border border-white/90 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Ready to Design Your Next Space?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Start building 2D blueprints and inspecting them in 3D right inside your browser with zero plugins required.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pure WebGL 3D
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fast & Responsive
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Glassmorphic UI
              </span>
            </div>
          </div>

          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl shadow-slate-900/10 transition-all shrink-0 flex items-center gap-2"
          >
            Create Your First Project
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-8 px-6 text-center text-xs font-semibold text-slate-400">
        NIRMAAN 2.0 Architectural Studio • Light Glass 3D Web Engine
      </footer>
    </div>
  );
}
