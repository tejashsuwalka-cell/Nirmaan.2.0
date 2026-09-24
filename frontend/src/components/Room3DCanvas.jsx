import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export default function Room3DCanvas({
  walls = [],
  doors = [],
  windows = [],
  furniture = [],
  materialPreset = 'oak', // 'oak', 'concrete', 'glass'
  autoRotate = true,
  interactive = true,
  height = '480px',
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const roomGroupRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const [activeMaterial, setActiveMaterial] = useState(materialPreset);
  const [isRotating, setIsRotating] = useState(autoRotate);

  // Material builder based on current preset
  const getWallMaterial = useCallback((preset) => {
    switch (preset) {
      case 'concrete':
        return new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.6,
          metalness: 0.1,
        });
      case 'glass':
        return new THREE.MeshPhysicalMaterial({
          color: 0x93c5fd,
          transparent: true,
          opacity: 0.65,
          roughness: 0.1,
          metalness: 0.1,
          transmission: 0.8,
          ior: 1.5,
        });
      case 'oak':
      default:
        return new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.4,
          metalness: 0.05,
        });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 480;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 2000);
    camera.position.set(400, 350, 450);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(300, 500, 200);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 0.6);
    fillLight.position.set(-300, 200, -200);
    scene.add(fillLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(600, 30, 0xc7d2fe, 0xe2e8f0);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Base Floor Plane
    const floorGeo = new THREE.PlaneGeometry(600, 600);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.8,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Room Group
    const roomGroup = new THREE.Group();
    roomGroupRef.current = roomGroup;
    scene.add(roomGroup);

    // Construct 3D Layout Elements
    const wallMat = getWallMaterial(activeMaterial);

    const defaultWalls = walls.length > 0 ? walls : [
      { id: 'w1', x1: 120, y1: 120, x2: 600, y2: 120, thickness: 16 },
      { id: 'w2', x1: 600, y1: 120, x2: 600, y2: 400, thickness: 16 },
      { id: 'w3', x1: 600, y1: 400, x2: 120, y2: 400, thickness: 16 },
      { id: 'w4', x1: 120, y1: 400, x2: 120, y2: 120, thickness: 16 },
    ];

    // Determine 2D offset (centering canvas origin 360, 260)
    const is2DCoords = defaultWalls.some((w) => w.x1 > 0 || w.y1 > 0);
    const offsetX = is2DCoords ? 360 : 0;
    const offsetZ = is2DCoords ? 260 : 0;

    // Helper: Find nearest wall & project point onto wall line segment with exact angle
    const snapToNearestWall = (px, py) => {
      if (defaultWalls.length === 0) {
        return { posX: px - offsetX, posZ: py - offsetZ, angle: 0, wallThick: 14 };
      }
      let minDist = Infinity;
      let bestProjX = px;
      let bestProjY = py;
      let bestAngle = 0;
      let bestThick = 14;

      defaultWalls.forEach((w) => {
        const dx = w.x2 - w.x1;
        const dy = w.y2 - w.y1;
        const l2 = dx * dx + dy * dy;
        let t = l2 === 0 ? 0 : ((px - w.x1) * dx + (py - w.y1) * dy) / l2;
        t = Math.max(0, Math.min(1, t));

        const projX = w.x1 + t * dx;
        const projY = w.y1 + t * dy;
        const d = Math.hypot(px - projX, py - projY);

        if (d < minDist) {
          minDist = d;
          bestProjX = projX;
          bestProjY = projY;
          bestAngle = Math.atan2(dy, dx);
          bestThick = w.thickness || 14;
        }
      });

      return {
        posX: bestProjX - offsetX,
        posZ: bestProjY - offsetZ,
        angle: bestAngle,
        wallThick: bestThick,
      };
    };

    // Render 3D Walls
    defaultWalls.forEach((w) => {
      const dx = w.x2 - w.x1;
      const dy = w.y2 - w.y1;
      const len = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const midX = (w.x1 + w.x2) / 2 - offsetX;
      const midZ = (w.y1 + w.y2) / 2 - offsetZ;
      const wallHeight = w.height || 120;
      const wallThick = w.thickness || 14;

      const wallGeo = new THREE.BoxGeometry(len, wallHeight, wallThick);
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.set(midX, wallHeight / 2, midZ);
      wallMesh.rotation.y = -angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      roomGroup.add(wallMesh);
    });

    // Render Realistic 3D Doors (Parallel Wall Aligned)
    const defaultDoors = doors.length > 0 ? doors : (walls.length === 0 ? [{ id: 'd1', x: 360, y: 120, width: 50 }] : []);

    const doorFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Architectural dark frame trim
      roughness: 0.4,
    });
    const doorLeafMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Warm architectural oak wood leaf
      roughness: 0.3,
    });
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Brushed stainless steel handle
      metalness: 0.9,
      roughness: 0.1,
    });

    defaultDoors.forEach((d) => {
      const snapped = snapToNearestWall(d.x, d.y);
      const doorWidth = d.width || 50;
      const doorHeight = 96;

      // Container group positioned and rotated parallel to wall direction
      const doorGroup = new THREE.Group();
      doorGroup.position.set(snapped.posX, doorHeight / 2, snapped.posZ);
      doorGroup.rotation.y = -snapped.angle;

      // 1. Architrave Frame Trim (Outer Border surrounding wall cutout)
      const frameThick = snapped.wallThick + 4;
      const frameTop = new THREE.Mesh(new THREE.BoxGeometry(doorWidth + 6, 6, frameThick), doorFrameMat);
      frameTop.position.set(0, doorHeight / 2 - 3, 0);
      doorGroup.add(frameTop);

      const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(4, doorHeight, frameThick), doorFrameMat);
      frameLeft.position.set(-doorWidth / 2 - 2, 0, 0);
      doorGroup.add(frameLeft);

      const frameRight = new THREE.Mesh(new THREE.BoxGeometry(4, doorHeight, frameThick), doorFrameMat);
      frameRight.position.set(doorWidth / 2 + 2, 0, 0);
      doorGroup.add(frameRight);

      // 2. Main Door Leaf Panel
      const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(doorWidth - 2, doorHeight - 6, 10), doorLeafMat);
      doorPanel.castShadow = true;
      doorPanel.receiveShadow = true;
      doorGroup.add(doorPanel);

      // 3. Beveled Panel Insets (Upper & Lower Decorative Insets)
      [-22, 22].forEach((posY) => {
        const insetMesh = new THREE.Mesh(new THREE.BoxGeometry(doorWidth - 16, 32, 12), doorFrameMat);
        insetMesh.position.set(0, posY, 0);
        doorGroup.add(insetMesh);
      });

      // 4. Stainless Steel Lever Handle
      const leverPlate = new THREE.Mesh(new THREE.BoxGeometry(4, 16, 14), handleMat);
      leverPlate.position.set(doorWidth / 2 - 10, -2, 0);
      doorGroup.add(leverPlate);

      const leverArm = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 12), handleMat);
      leverArm.rotation.x = Math.PI / 2;
      leverArm.position.set(doorWidth / 2 - 10, 0, 8);
      doorGroup.add(leverArm);

      roomGroup.add(doorGroup);
    });

    // Render Realistic 3D Windows (Parallel Wall Aligned)
    const defaultWindows = windows.length > 0 ? windows : (walls.length === 0 ? [{ id: 'win1', x: 360, y: 400, width: 70, height: 50 }] : []);

    const windowFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark modern window frame
      roughness: 0.3,
    });
    const windowSillMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Soft stone sill
      roughness: 0.5,
    });
    const windowGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      transmission: 0.85,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
    });

    defaultWindows.forEach((win) => {
      const snapped = snapToNearestWall(win.x, win.y);
      const winWidth = win.width || 70;
      const winHeight = win.height || 50;
      const sillHeight = win.sillHeight || 40;
      const posY = sillHeight + winHeight / 2;

      const winGroup = new THREE.Group();
      winGroup.position.set(snapped.posX, posY, snapped.posZ);
      winGroup.rotation.y = -snapped.angle;

      // 1. Bottom Sill Ledge (Extends past wall)
      const sillMesh = new THREE.Mesh(new THREE.BoxGeometry(winWidth + 10, 5, snapped.wallThick + 8), windowSillMat);
      sillMesh.position.set(0, -winHeight / 2 - 2, 0);
      winGroup.add(sillMesh);

      // 2. Outer Window Frame Box
      const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(winWidth, winHeight, snapped.wallThick + 2), windowFrameMat);
      winGroup.add(frameMesh);

      // 3. Translucent Glass Pane
      const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(winWidth - 8, winHeight - 8, 6), windowGlassMat);
      winGroup.add(glassMesh);

      // 4. Mullion Grid Lattices (Vertical + Horizontal bars)
      const vMullion = new THREE.Mesh(new THREE.BoxGeometry(3, winHeight - 8, 8), windowFrameMat);
      winGroup.add(vMullion);

      const hMullion = new THREE.Mesh(new THREE.BoxGeometry(winWidth - 8, 3, 8), windowFrameMat);
      winGroup.add(hMullion);

      roomGroup.add(winGroup);
    });

    // Render Furniture & Accessories in 3D Space
    if (furniture && furniture.length > 0) {
      furniture.forEach((item) => {
        const itemX = item.x - offsetX;
        const itemZ = item.y - offsetZ;
        const rotDeg = item.rotation || 0;
        const rotRad = (rotDeg * Math.PI) / 180;
        const itemScale = item.scale !== undefined ? item.scale : 1.0;

        const itemGroup = new THREE.Group();
        itemGroup.position.set(itemX, 0, itemZ);
        itemGroup.rotation.y = -rotRad;
        itemGroup.scale.set(itemScale, itemScale, itemScale);

        if (item.type === 'sofa') {
          // 3-Seater Sofa
          const fabricMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.7 });
          const cushionMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.6 });
          const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });

          // Base
          const base = new THREE.Mesh(new THREE.BoxGeometry(110, 16, 50), fabricMat);
          base.position.y = 12;
          base.castShadow = true;
          itemGroup.add(base);

          // Seat Cushions (3 cushions)
          [-32, 0, 32].forEach((cx) => {
            const cushion = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 42), cushionMat);
            cushion.position.set(cx, 22, 2);
            cushion.castShadow = true;
            itemGroup.add(cushion);
          });

          // Backrest
          const back = new THREE.Mesh(new THREE.BoxGeometry(110, 35, 14), fabricMat);
          back.position.set(0, 32, -18);
          back.castShadow = true;
          itemGroup.add(back);

          // Armrests
          [-52, 52].forEach((ax) => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(12, 28, 50), fabricMat);
            arm.position.set(ax, 24, 0);
            arm.castShadow = true;
            itemGroup.add(arm);
          });

          // Legs
          [-50, 50].forEach((lx) => {
            [-20, 20].forEach((lz) => {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(2, 1, 8), legMat);
              leg.position.set(lx, 4, lz);
              itemGroup.add(leg);
            });
          });
        } else if (item.type === 'bed') {
          // Modern Platform Bed
          const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
          const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
          const duvetMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, roughness: 0.6 });
          const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

          // Headboard
          const headboard = new THREE.Mesh(new THREE.BoxGeometry(100, 50, 8), frameMat);
          headboard.position.set(0, 25, -50);
          headboard.castShadow = true;
          itemGroup.add(headboard);

          // Bed Frame
          const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(100, 14, 96), frameMat);
          bedFrame.position.set(0, 7, 0);
          bedFrame.castShadow = true;
          itemGroup.add(bedFrame);

          // Mattress
          const mattress = new THREE.Mesh(new THREE.BoxGeometry(92, 16, 90), mattressMat);
          mattress.position.set(0, 20, 0);
          mattress.castShadow = true;
          itemGroup.add(mattress);

          // Duvet Fold
          const duvet = new THREE.Mesh(new THREE.BoxGeometry(92, 17, 55), duvetMat);
          duvet.position.set(0, 21, 16);
          duvet.castShadow = true;
          itemGroup.add(duvet);

          // Pillows (2 plush pillows)
          [-22, 22].forEach((px) => {
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(36, 6, 20), pillowMat);
            pillow.position.set(px, 29, -30);
            itemGroup.add(pillow);
          });
        } else if (item.type === 'plant') {
          // Indoor Potted House Plant
          const potMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
          const soilMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
          const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });

          // Terracotta Pot
          const pot = new THREE.Mesh(new THREE.CylinderGeometry(14, 10, 26, 16), potMat);
          pot.position.y = 13;
          pot.castShadow = true;
          itemGroup.add(pot);

          // Soil Disc
          const soil = new THREE.Mesh(new THREE.CylinderGeometry(13.5, 13.5, 2, 16), soilMat);
          soil.position.y = 25;
          itemGroup.add(soil);

          // Foliage Spheres
          const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(18, 16, 16), leafMat);
          foliage1.position.set(0, 42, 0);
          foliage1.castShadow = true;
          itemGroup.add(foliage1);

          const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 16), leafMat);
          foliage2.position.set(-8, 54, 4);
          foliage2.castShadow = true;
          itemGroup.add(foliage2);

          const foliage3 = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 16), leafMat);
          foliage3.position.set(8, 52, -4);
          foliage3.castShadow = true;
          itemGroup.add(foliage3);
        } else if (item.type === 'tv_unit') {
          // TV Console & Widescreen TV
          const consoleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
          const tvFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
          const screenMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.1 });

          // Console Cabinet Table
          const cabinet = new THREE.Mesh(new THREE.BoxGeometry(100, 22, 28), consoleMat);
          cabinet.position.set(0, 11, 0);
          cabinet.castShadow = true;
          itemGroup.add(cabinet);

          // TV Stand Base
          const tvStand = new THREE.Mesh(new THREE.BoxGeometry(30, 2, 16), tvFrameMat);
          tvStand.position.set(0, 23, 0);
          itemGroup.add(tvStand);

          const tvPole = new THREE.Mesh(new THREE.BoxGeometry(6, 12, 4), tvFrameMat);
          tvPole.position.set(0, 29, 0);
          itemGroup.add(tvPole);

          // Flat TV Screen Bezel & Display
          const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(80, 46, 4), tvFrameMat);
          tvFrame.position.set(0, 56, 0);
          tvFrame.castShadow = true;
          itemGroup.add(tvFrame);

          const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(76, 42, 4.5), screenMat);
          tvScreen.position.set(0, 56, 0);
          itemGroup.add(tvScreen);
        }

        roomGroup.add(itemGroup);
      });
    }

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (roomGroupRef.current) {
        // Auto-rotation
        if (isRotating && !isDraggingRef.current) {
          roomGroupRef.current.rotation.y += 0.003;
        }

        // Smooth Mouse Parallax
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

        if (!isDraggingRef.current) {
          roomGroupRef.current.rotation.x = mouseRef.current.y * 0.15;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [walls, doors, windows, furniture, activeMaterial, isRotating, getWallMaterial]);

  // Mouse Interaction Handlers
  const handleMouseMove = (e) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseRef.current.targetX = x * 2;
    mouseRef.current.targetY = y * 2;

    if (isDraggingRef.current && roomGroupRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      roomGroupRef.current.rotation.y += deltaX * 0.01;
      roomGroupRef.current.rotation.x += deltaY * 0.01;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseDown = (e) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl glass-card border border-white/80 shadow-2xl">
      {/* Interactive 3D Canvas */}
      <div
        ref={containerRef}
        style={{ height }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating Glass Control Bar */}
      {interactive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl glass-panel flex items-center gap-3 shadow-xl backdrop-blur-xl border border-white/90">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Material:</span>
          
          <button
            onClick={() => setActiveMaterial('oak')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeMaterial === 'oak'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🌿 Minimal White
          </button>

          <button
            onClick={() => setActiveMaterial('concrete')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeMaterial === 'concrete'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🏛️ Concrete
          </button>

          <button
            onClick={() => setActiveMaterial('glass')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeMaterial === 'glass'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            💎 Glass
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          <button
            onClick={() => setIsRotating((prev) => !prev)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              isRotating
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {isRotating ? '🔄 Orbiting' : '⏸️ Paused'}
          </button>
        </div>
      )}
    </div>
  );
}
