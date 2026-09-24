import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import Room3DCanvas from '../components/Room3DCanvas';
import {
  MousePointer,
  Square,
  DoorOpen,
  AppWindow,
  Home,
  Trash2,
  Save,
  ShieldCheck,
  Box,
  Layers,
  ArrowLeft,
  AlertTriangle,
  Lightbulb,
  Sofa,
  Bed,
  Flower2,
  Tv,
  RotateCw,
  Maximize2,
} from 'lucide-react';

export default function EditorPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Editor View Mode: '2d' or '3d'
  const [viewMode, setViewMode] = useState('2d');

  // Editor Tools: 'select', 'wall', 'door', 'window', 'sofa', 'bed', 'plant', 'tv_unit'
  const [activeTool, setActiveTool] = useState('wall');

  // Layout State
  const [walls, setWalls] = useState([]);
  const [doors, setDoors] = useState([]);
  const [windows, setWindows] = useState([]);
  const [furniture, setFurniture] = useState([]);

  // Drawing state
  const [drawingStart, setDrawingStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState(null); // { type, id }

  const canvasRef = useRef(null);
  const GRID_SIZE = 20;

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/projects/${projectId}`);
      setProject(res.data);
      setWalls(res.data.walls || []);
      setDoors(res.data.doors || []);
      setWindows(res.data.windows || []);
      setFurniture(res.data.furniture || []);
    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Snap coordinate to grid
  const snap = (val) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  // Distance helper
  const distance = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

  // Distance to line segment helper
  const distanceToSegment = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
  };

  // Update selected furniture properties
  const handleUpdateSelectedFurniture = useCallback((updates) => {
    if (!selectedElement || selectedElement.type !== 'furniture') return;
    setFurniture((prev) =>
      prev.map((f) => (f.id === selectedElement.id ? { ...f, ...updates } : f))
    );
  }, [selectedElement]);

  const handleRotateSelectedFurniture = useCallback((delta = 45) => {
    if (!selectedElement || selectedElement.type !== 'furniture') return;
    setFurniture((prev) =>
      prev.map((f) => {
        if (f.id === selectedElement.id) {
          const currentRot = f.rotation || 0;
          return { ...f, rotation: (currentRot + delta) % 360 };
        }
        return f;
      })
    );
  }, [selectedElement]);

  // Reset drawing start when active tool changes
  useEffect(() => {
    setDrawingStart(null);
  }, [activeTool]);

  // Handle Escape and R key shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDrawingStart(null);
        setSelectedElement(null);
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedElement?.type === 'furniture') {
          handleRotateSelectedFurniture(45);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, handleRotateSelectedFurniture]);

  // Render 2D Canvas
  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background (Clean off-white)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Walls
    walls.forEach((w) => {
      const isSelected = selectedElement?.type === 'wall' && selectedElement?.id === w.id;
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
      ctx.strokeStyle = isSelected ? '#4f46e5' : '#1e293b';
      ctx.lineWidth = w.thickness || 14;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Wall length label
      const len = (Math.hypot(w.x2 - w.x1, w.y2 - w.y1) / 20).toFixed(1);
      const midX = (w.x1 + w.x2) / 2;
      const midY = (w.y1 + w.y2) / 2;
      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px sans-serif';
      ctx.fillText(`${len}m`, midX + 6, midY - 6);
    });

    // Draw Doors
    doors.forEach((d) => {
      const isSelected = selectedElement?.type === 'door' && selectedElement?.id === d.id;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.fillStyle = isSelected ? '#7c3aed' : '#9333ea';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Swing arc line
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI / 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('D', 0, 0);
      ctx.restore();
    });

    // Draw Windows
    windows.forEach((win) => {
      const isSelected = selectedElement?.type === 'window' && selectedElement?.id === win.id;
      ctx.save();
      ctx.translate(win.x, win.y);
      ctx.fillStyle = isSelected ? '#0284c7' : '#38bdf8';
      ctx.fillRect(-16, -6, 32, 12);

      // Glass line preview
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(-16, -6, 32, 12);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('W', 0, 0);
      ctx.restore();
    });

    // Draw Furniture Accessories with Rotation & Scale
    furniture.forEach((f) => {
      const isSelected = selectedElement?.type === 'furniture' && selectedElement?.id === f.id;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(((f.rotation || 0) * Math.PI) / 180);
      const s = f.scale !== undefined ? f.scale : 1.0;
      ctx.scale(s, s);

      if (f.type === 'sofa') {
        ctx.fillStyle = isSelected ? '#4338ca' : '#6366f1';
        ctx.fillRect(-24, -12, 48, 24);
        ctx.strokeStyle = isSelected ? '#312e81' : '#4338ca';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeRect(-24, -12, 48, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SOFA', 0, 0);
      } else if (f.type === 'bed') {
        ctx.fillStyle = isSelected ? '#1e293b' : '#475569';
        ctx.fillRect(-22, -26, 44, 52);
        ctx.strokeStyle = isSelected ? '#6366f1' : '#334155';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeRect(-22, -26, 44, 52);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-18, -22, 36, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BED', 0, 8);
      } else if (f.type === 'plant') {
        ctx.fillStyle = isSelected ? '#15803d' : '#16a34a';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#4f46e5' : '#d97706';
        ctx.lineWidth = isSelected ? 3.5 : 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪴', 0, 0);
      } else if (f.type === 'tv_unit') {
        ctx.fillStyle = isSelected ? '#0f172a' : '#1e293b';
        ctx.fillRect(-26, -8, 52, 16);
        ctx.strokeStyle = isSelected ? '#4f46e5' : '#0f172a';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeRect(-26, -8, 52, 16);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(-20, -2, 40, 4);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TV', 0, -4);
      }
      ctx.restore();
    });

    // Draw Active Drawing Preview (Wall)
    if (activeTool === 'wall' && drawingStart) {
      ctx.beginPath();
      ctx.moveTo(drawingStart.x, drawingStart.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 12;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [walls, doors, windows, furniture, drawingStart, mousePos, activeTool, selectedElement, viewMode]);

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = snap((e.clientX - rect.left) * scaleX);
    const y = snap((e.clientY - rect.top) * scaleY);
    setMousePos({ x, y });
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = snap((e.clientX - rect.left) * scaleX);
    const y = snap((e.clientY - rect.top) * scaleY);

    if (activeTool === 'wall') {
      if (!drawingStart) {
        setDrawingStart({ x, y });
      } else {
        if (drawingStart.x !== x || drawingStart.y !== y) {
          const newWall = {
            id: `wall_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            x1: drawingStart.x,
            y1: drawingStart.y,
            x2: x,
            y2: y,
            thickness: 14,
            height: 150,
            color: '#1e293b',
          };
          setWalls((prev) => [...prev, newWall]);
        }
        setDrawingStart(null);
      }
    } else if (activeTool === 'door') {
      const newDoor = {
        id: `door_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        x,
        y,
        width: 50,
        swing: 'left',
      };
      setDoors((prev) => [...prev, newDoor]);
    } else if (activeTool === 'window') {
      const newWindow = {
        id: `win_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        x,
        y,
        width: 70,
        height: 50,
      };
      setWindows((prev) => [...prev, newWindow]);
    } else if (['sofa', 'bed', 'plant', 'tv_unit'].includes(activeTool)) {
      const newItem = {
        id: `${activeTool}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: activeTool,
        x,
        y,
        rotation: 0,
        scale: 1.0,
      };
      setFurniture((prev) => [...prev, newItem]);
    } else if (activeTool === 'select') {
      const clickedItem = furniture.find((f) => distance(f, { x, y }) < 25);
      if (clickedItem) {
        setSelectedElement({ type: 'furniture', id: clickedItem.id });
        return;
      }
      const clickedDoor = doors.find((d) => distance(d, { x, y }) < 20);
      if (clickedDoor) {
        setSelectedElement({ type: 'door', id: clickedDoor.id });
        return;
      }
      const clickedWin = windows.find((w) => distance(w, { x, y }) < 20);
      if (clickedWin) {
        setSelectedElement({ type: 'window', id: clickedWin.id });
        return;
      }
      const clickedWall = walls.find(
        (w) => distanceToSegment(x, y, w.x1, w.y1, w.x2, w.y2) <= 16
      );
      if (clickedWall) {
        setSelectedElement({ type: 'wall', id: clickedWall.id });
        return;
      }
      setSelectedElement(null);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedElement) return;
    if (selectedElement.type === 'wall') {
      setWalls((prev) => prev.filter((w) => w.id !== selectedElement.id));
    } else if (selectedElement.type === 'door') {
      setDoors((prev) => prev.filter((d) => d.id !== selectedElement.id));
    } else if (selectedElement.type === 'window') {
      setWindows((prev) => prev.filter((w) => w.id !== selectedElement.id));
    } else if (selectedElement.type === 'furniture') {
      setFurniture((prev) => prev.filter((f) => f.id !== selectedElement.id));
    }
    setSelectedElement(null);
  };

  const handleLoadPresetRoom = () => {
    setWalls([
      { id: 'w1', x1: 120, y1: 120, x2: 600, y2: 120, thickness: 14 },
      { id: 'w2', x1: 600, y1: 120, x2: 600, y2: 400, thickness: 14 },
      { id: 'w3', x1: 600, y1: 400, x2: 120, y2: 400, thickness: 14 },
      { id: 'w4', x1: 120, y1: 400, x2: 120, y2: 120, thickness: 14 },
    ]);
    setDoors([{ id: 'd1', x: 360, y: 120, width: 50 }]);
    setWindows([{ id: 'win1', x: 360, y: 400, width: 70 }]);
    setFurniture([
      { id: 'f1', type: 'sofa', x: 360, y: 220, rotation: 0, scale: 1.0 },
      { id: 'f2', type: 'tv_unit', x: 360, y: 360, rotation: 0, scale: 1.0 },
      { id: 'f3', type: 'plant', x: 180, y: 160, rotation: 0, scale: 1.0 },
      { id: 'f4', type: 'bed', x: 520, y: 260, rotation: 0, scale: 1.0 },
    ]);
    setSelectedElement(null);
  };

  const handleClearCanvas = () => {
    setWalls([]);
    setDoors([]);
    setWindows([]);
    setFurniture([]);
    setDrawingStart(null);
    setSelectedElement(null);
    setAuditResult(null);
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    setSaveStatus('');
    try {
      await apiClient.put(`/projects/${projectId}`, {
        walls,
        doors,
        windows,
        furniture,
      });
      setSaveStatus('Project saved!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save project layout');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      const payload = { walls, doors, windows };
      const res = await apiClient.post('/audit', payload);
      setAuditResult(res.data);
    } catch (err) {
      console.error('Audit failed:', err);
      alert('Failed to execute layout audit');
    } finally {
      setIsAuditing(false);
    }
  };

  const selectedFurniture = selectedElement?.type === 'furniture'
    ? furniture.find((f) => f.id === selectedElement.id)
    : null;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col h-screen overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Glass Navigation Bar */}
      <header className="px-6 py-3 shrink-0">
        <div className="max-w-full mx-auto rounded-2xl glass-panel px-6 py-3 flex justify-between items-center shadow-lg border border-white/80">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-button"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-sm font-extrabold text-slate-900">
              {isLoading ? 'Loading...' : project?.name || `Project (${projectId})`}
            </h1>
            {saveStatus && (
              <span className="text-xs text-emerald-600 font-bold animate-pulse">{saveStatus}</span>
            )}
          </div>

          {/* Mode Switcher 2D / 3D */}
          <div className="flex items-center p-1 rounded-xl glass-panel border border-slate-200">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === '2d'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              2D Blueprint
            </button>

            <button
              onClick={() => setViewMode('3d')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              3D Perspective View
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProject}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Layout'}
            </button>
            <button
              onClick={handleAudit}
              disabled={isAuditing}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAuditing ? 'Auditing...' : 'Run Audit'}
            </button>
          </div>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Toolbar */}
        {viewMode === '2d' && (
          <div className="w-20 rounded-3xl glass-panel p-2.5 flex flex-col items-center gap-2 shrink-0 shadow-lg border border-white/90 overflow-y-auto">
            <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Tools</div>

            <button
              onClick={() => setActiveTool('select')}
              className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                activeTool === 'select'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Select Element"
            >
              <MousePointer className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">Select</span>
            </button>

            <button
              onClick={() => setActiveTool('wall')}
              className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                activeTool === 'wall'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Draw Wall"
            >
              <Square className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">Wall</span>
            </button>

            <button
              onClick={() => setActiveTool('door')}
              className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                activeTool === 'door'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Place Door"
            >
              <DoorOpen className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">Door</span>
            </button>

            <button
              onClick={() => setActiveTool('window')}
              className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                activeTool === 'window'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Place Window"
            >
              <AppWindow className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">Window</span>
            </button>

            <div className="w-full h-[1px] bg-slate-200/80 my-1" />

            <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Decor</div>

            <button
              onClick={() => setActiveTool('sofa')}
              className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                activeTool === 'sofa'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Add Sofa"
            >
              <Sofa className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">Sofa</span>
            </button>

            <button
              onClick={() => setActiveTool('bed')}
              className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                activeTool === 'bed'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Add Bed"
            >
              <Bed className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">Bed</span>
            </button>

            <button
              onClick={() => setActiveTool('plant')}
              className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                activeTool === 'plant'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Add Plant"
            >
              <Flower2 className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">Plant</span>
            </button>

            <button
              onClick={() => setActiveTool('tv_unit')}
              className={`w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                activeTool === 'tv_unit'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Add TV Unit"
            >
              <Tv className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">TV Console</span>
            </button>

            <div className="w-full h-[1px] bg-slate-200/80 my-1" />

            <button
              onClick={handleLoadPresetRoom}
              className="w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              title="Load Room Template"
            >
              <Home className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">Preset</span>
            </button>

            <button
              onClick={handleClearCanvas}
              className="w-12 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 font-semibold">Clear</span>
            </button>
          </div>
        )}

        {/* Main Canvas / 3D Stage Workspace */}
        <div className="flex-1 rounded-3xl glass-panel p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-xl border border-white/90">
          {/* Status Bar Overlay */}
          <div className="absolute top-6 left-6 z-10 px-4 py-2 rounded-2xl glass-panel border border-white/90 shadow-md flex items-center gap-4 text-xs font-semibold text-slate-700">
            <div>
              Mode: <span className="font-extrabold text-indigo-600 uppercase">{viewMode === '2d' ? activeTool : '3D WebGL'}</span>
            </div>
            <div>Walls: <span className="font-extrabold text-slate-900">{walls.length}</span></div>
            <div>Doors: <span className="font-extrabold text-purple-600">{doors.length}</span></div>
            <div>Windows: <span className="font-extrabold text-sky-600">{windows.length}</span></div>
            <div>Decor: <span className="font-extrabold text-emerald-600">{furniture.length}</span></div>
            {selectedElement && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg font-bold hover:bg-red-100 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected {selectedElement.type}
              </button>
            )}
          </div>

          {/* Interactive Selected Furniture Inspector Overlay */}
          {selectedFurniture && (
            <div className="absolute bottom-6 z-20 px-6 py-3 rounded-2xl glass-panel border border-white/90 shadow-2xl backdrop-blur-xl flex flex-wrap items-center gap-6 text-xs text-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  {selectedFurniture.type.replace('_', ' ')}:
                </span>
              </div>

              {/* Rotation Controls */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">Rotation:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={selectedFurniture.rotation || 0}
                  onChange={(e) =>
                    handleUpdateSelectedFurniture({ rotation: Number(e.target.value) })
                  }
                  className="w-24 accent-indigo-600 cursor-pointer"
                />
                <span className="font-mono text-slate-900 font-bold w-10">
                  {selectedFurniture.rotation || 0}°
                </span>
                <button
                  onClick={() => handleRotateSelectedFurniture(45)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 flex items-center gap-1 transition-all"
                  title="Rotate 45° (Keyboard shortcut: R)"
                >
                  <RotateCw className="w-3 h-3" />
                  +45°
                </button>
              </div>

              {/* Scale / Size Controls */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <span className="font-bold text-slate-500 flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-slate-400" />
                  Size:
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={selectedFurniture.scale !== undefined ? selectedFurniture.scale : 1.0}
                  onChange={(e) =>
                    handleUpdateSelectedFurniture({ scale: Number(e.target.value) })
                  }
                  className="w-24 accent-indigo-600 cursor-pointer"
                />
                <span className="font-mono text-slate-900 font-bold w-10">
                  {(selectedFurniture.scale !== undefined ? selectedFurniture.scale : 1.0).toFixed(1)}x
                </span>
              </div>

              <div className="border-l border-slate-200 pl-4">
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* View Render Container */}
          {viewMode === '2d' ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <canvas
                ref={canvasRef}
                width={720}
                height={520}
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
                className="bg-slate-50 border border-slate-200 rounded-2xl shadow-xl cursor-crosshair"
              />
              <div className="text-[11px] font-medium text-slate-400 mt-3">
                Click grid to place items or draw walls. Select items to rotate/scale. Press 'R' to rotate selected accessory.
              </div>
            </div>
          ) : (
            <div className="w-full h-full p-2 flex items-center justify-center">
              <Room3DCanvas walls={walls} doors={doors} windows={windows} furniture={furniture} height="100%" />
            </div>
          )}
        </div>

        {/* Audit Side Panel */}
        {auditResult && (
          <div className="w-80 rounded-3xl glass-panel p-6 overflow-y-auto shrink-0 flex flex-col shadow-xl border border-white/90">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-sm text-slate-900">Compliance Audit</h3>
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold shadow-sm ${
                  auditResult.passed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {auditResult.passed ? '✓ PASSED' : '⚠️ REVISION NEEDED'} ({auditResult.score}/100)
              </span>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full transition-all duration-500 ${
                  auditResult.passed ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${auditResult.score}%` }}
              />
            </div>

            {auditResult.warnings?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Warnings ({auditResult.warnings.length})
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {auditResult.warnings.map((w, idx) => (
                    <li key={idx} className="bg-amber-50/80 border border-amber-200/60 p-3 rounded-xl leading-relaxed font-medium">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {auditResult.suggestions?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Suggestions
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {auditResult.suggestions.map((s, idx) => (
                    <li key={idx} className="bg-indigo-50/80 border border-indigo-200/60 p-3 rounded-xl leading-relaxed font-medium">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {auditResult.tips?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Architectural Guidance</h4>
                <ul className="space-y-1.5 text-xs text-slate-500 font-medium">
                  {auditResult.tips.map((tip, idx) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {auditResult.disclaimer && (
              <p className="text-[10px] text-slate-400 border-t border-slate-200/80 pt-3 mt-auto leading-relaxed font-medium">
                {auditResult.disclaimer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
