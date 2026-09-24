import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Task, ScheduleBlock, LearnedProfile } from '../../types/task';
import { formatMinutesTo12Hour } from '../../engine/scheduler';

interface ChronoStudioCanvasProps {
  scheduleBlocks: ScheduleBlock[];
  learnedProfile: LearnedProfile;
  activeTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  isHeroRunning: boolean;
  onHeroComplete?: () => void;
}

interface MeshTaskUserData {
  blockId: string;
  task: Task;
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  targetScale: THREE.Vector3;
  currentVelocity: THREE.Vector3;
  isSettled: boolean;
  baseColor: THREE.Color;
  emissiveBase: THREE.Color;
}

export const ChronoStudioCanvas: React.FC<ChronoStudioCanvasProps> = ({
  scheduleBlocks,
  learnedProfile,
  activeTaskId,
  onSelectTask,
  onCompleteTask,
  isHeroRunning,
  onHeroComplete
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredTask, setHoveredTask] = useState<{ task: Task; x: number; y: number; block: ScheduleBlock } | null>(null);
  const [cameraMode, setCameraMode] = useState<'perspective' | 'top_down'>('perspective');

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const taskMeshesRef = useRef<THREE.Mesh[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2(-999, -999));
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const heroProgressRef = useRef(isHeroRunning ? 0 : 1);

  // Category Colors matching our design token palette
  const getCategoryColor = useCallback((category: string): number => {
    switch (category) {
      case 'CS / Coding':
        return 0x3b82f6; // Anodized cobalt
      case 'Mathematics':
        return 0xf59e0b; // Amber resin
      case 'Reading & Essays':
        return 0x10b981; // Sage matte
      case 'Exams & Quizzes':
        return 0xf43f5e; // Radiant coral
      case 'Admin & Quick Tasks':
        return 0x8b5cf6; // Amethyst slate
      default:
        return 0x06b6d4; // Cyan alloy
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e12); // Deep obsidian studio slate
    scene.fog = new THREE.FogExp2(0x0c0e12, 0.022);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 8.5, 14.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with soft studio shadows & anti-aliasing
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig
    // Warm Key Daylight (Simulating architectural window light)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(8, 14, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 35;
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 16;
    keyLight.shadow.camera.bottom = -16;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Cool Sky & Ground Hemisphere Fill (high contrast, zero muddy blacks)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.75);
    scene.add(hemiLight);

    // Rim / Edge Glancing Light for separation
    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    rimLight.position.set(-10, 6, -8);
    scene.add(rimLight);

    // 5. Build The Sculpted Chrono-Track (Workbench + Time Rail)
    const trackGroup = new THREE.Group();
    trackGroup.name = 'chrono-track-group';

    // Base Study Workbench Surface
    const benchGeo = new THREE.BoxGeometry(24, 0.4, 7);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x161a23,
      roughness: 0.65,
      metalness: 0.15
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.2, 0);
    bench.receiveShadow = true;
    trackGroup.add(bench);

    // Recessed Kinetic Chrono-Rail Track
    const railGeo = new THREE.BoxGeometry(22, 0.15, 3.4);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x1d2330,
      roughness: 0.4,
      metalness: 0.35
    });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, 0.02, 0);
    rail.receiveShadow = true;
    trackGroup.add(rail);

    // Chrono Hour Markers & Glow Index Lines
    // 8:00 AM (start) to 8:00 PM (end) along the X-axis (-10 to +10)
    for (let i = 0; i <= 12; i++) {
      const x = -9.5 + (i / 12) * 19;
      const isMajor = i % 2 === 0;

      // Inset laser marker
      const notchGeo = new THREE.BoxGeometry(0.08, 0.05, isMajor ? 3.0 : 1.6);
      const notchMat = new THREE.MeshBasicMaterial({
        color: isMajor ? 0x38bdf8 : 0x334155
      });
      const notch = new THREE.Mesh(notchGeo, notchMat);
      notch.position.set(x, 0.1, 0);
      trackGroup.add(notch);
    }

    // Chrono Studio Datum Indicator (Current time laser pin)
    const now = new Date();
    const currentHourMinutes = now.getHours() * 60 + now.getMinutes();
    // Map 8:00 AM (480m) to 8:00 PM (1200m)
    const clampedProgress = Math.max(0, Math.min(1, (currentHourMinutes - 480) / 720));
    const nowX = -9.5 + clampedProgress * 19;

    const datumLineGeo = new THREE.BoxGeometry(0.12, 0.25, 3.6);
    const datumLineMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const datumLine = new THREE.Mesh(datumLineGeo, datumLineMat);
    datumLine.position.set(nowX, 0.15, 0);
    trackGroup.add(datumLine);

    scene.add(trackGroup);

    // Mouse Interaction Handlers for Camera Orbit / Pan
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // Raycasting mouse normalized device coords (-1 to +1)
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isDraggingRef.current) {
        // Raycast for hover tooltips
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(taskMeshesRef.current);
        if (intersects.length > 0) {
          const topMesh = intersects[0].object as THREE.Mesh;
          const uData = topMesh.userData as MeshTaskUserData;
          if (uData && uData.task) {
            const block = scheduleBlocks.find(b => b.task.id === uData.task.id);
            if (block) {
              setHoveredTask({
                task: uData.task,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                block
              });
              container.style.cursor = 'pointer';
              return;
            }
          }
        }
        setHoveredTask(null);
        container.style.cursor = 'default';
        return;
      }

      // Camera orbital dragging
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      const cam = cameraRef.current;
      if (cam) {
        // Orbit azimuth and elevation within comfortable bounds
        const theta = deltaX * 0.005;
        const phi = deltaY * 0.005;

        const pos = cam.position.clone().sub(cameraTargetRef.current);
        const radius = pos.length();
        let currentPhi = Math.acos(Math.max(-1, Math.min(1, pos.y / radius)));
        let currentTheta = Math.atan2(pos.x, pos.z);

        currentTheta -= theta;
        currentPhi = Math.max(0.2, Math.min(Math.PI / 2.15, currentPhi + phi));

        cam.position.x = cameraTargetRef.current.x + radius * Math.sin(currentPhi) * Math.sin(currentTheta);
        cam.position.y = cameraTargetRef.current.y + radius * Math.cos(currentPhi);
        cam.position.z = cameraTargetRef.current.z + radius * Math.sin(currentPhi) * Math.cos(currentTheta);
        cam.lookAt(cameraTargetRef.current);
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycasterRef.current.setFromCamera(clickMouse, camera);
      const intersects = raycasterRef.current.intersectObjects(taskMeshesRef.current);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const uData = clickedMesh.userData as MeshTaskUserData;
        if (uData && uData.task) {
          onSelectTask(uData.task);
        }
      }
    };

    // Zoom on wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = cameraRef.current;
      if (!cam) return;
      const zoomFactor = e.deltaY * 0.008;
      const dir = cam.position.clone().sub(cameraTargetRef.current);
      const newLen = THREE.MathUtils.clamp(dir.length() + zoomFactor, 7, 24);
      dir.setLength(newLen);
      cam.position.copy(cameraTargetRef.current).add(dir);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Handle Hero Animation sequence
      if (isHeroRunning && heroProgressRef.current < 1) {
        heroProgressRef.current += delta * 0.45; // ~2.2 seconds total duration
        if (heroProgressRef.current >= 1) {
          heroProgressRef.current = 1;
          if (onHeroComplete) onHeroComplete();
        }
      }

      const heroT = heroProgressRef.current;

      // Animate Task Meshes (Physics settling, hover lift, active pulse)
      taskMeshesRef.current.forEach((mesh) => {
        const uData = mesh.userData as MeshTaskUserData;
        if (!uData) return;

        const isCurrentActive = activeTaskId === uData.task.id;
        const isCompleted = uData.task.status === 'completed';

        // Interpolate position from hero scatter to target slot
        if (heroT < 1) {
          // Cubic elastic snap
          const easeOutCubic = 1 - Math.pow(1 - heroT, 3);
          mesh.position.lerp(uData.targetPos, easeOutCubic * 0.12);
          mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, uData.targetRot.x, 0.1);
          mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, uData.targetRot.y, 0.1);
          mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, uData.targetRot.z, 0.1);
        } else {
          // Hover lift or active pulse
          let targetY = uData.targetPos.y;
          if (hoveredTask && hoveredTask.task.id === uData.task.id) {
            targetY += 0.35; // Lift up when hovered
          } else if (isCurrentActive) {
            targetY += 0.12 + Math.sin(elapsed * 4) * 0.08; // Rhythmic breathing float
          }

          mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetY, 0.15);
          mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, uData.targetPos.x, 0.1);
          mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, uData.targetPos.z, 0.1);
        }

        // Active breathing luminescence
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          if (isCompleted) {
            mat.color.setHex(0xeab308); // Brass gold
            mat.emissive.setHex(0xca8a04);
            mat.emissiveIntensity = 0.35;
          } else if (isCurrentActive) {
            const pulse = 0.3 + 0.35 * Math.sin(elapsed * 5);
            mat.emissive.setHex(0x38bdf8);
            mat.emissiveIntensity = pulse;
          } else if (hoveredTask && hoveredTask.task.id === uData.task.id) {
            mat.emissive.copy(uData.emissiveBase);
            mat.emissiveIntensity = 0.4;
          } else {
            mat.emissive.copy(uData.emissiveBase);
            mat.emissiveIntensity = 0.08;
          }
        }
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);

      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update Task Meshes when scheduleBlocks change or hero starts
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old task meshes
    taskMeshesRef.current.forEach(mesh => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    taskMeshesRef.current = [];

    // Rebuild 3D blocks from scheduled timeline
    // Working hours mapped across -9.5 to +9.5 (width 19 units)
    // 8:00 AM (480 min) to 8:00 PM (1200 min) => 720 minutes total span
    const minDayStart = 480;
    const daySpanMinutes = 720;
    const trackWidth = 19;

    const newMeshes: THREE.Mesh[] = [];

    scheduleBlocks.forEach((block, index) => {
      const task = block.task;
      const duration = task.predictedDuration || task.estimatedDuration || 30;

      // Sizing geometry based on duration & size bucket
      // Small: width proportional to duration, compact height (0.28)
      // Deep work: wide, thicker ceramic slab (height 0.65)
      const blockWidth = Math.max(1.2, (duration / daySpanMinutes) * trackWidth * 0.92);
      const isDeep = duration >= 60 || task.sizeBucket === 'large';
      const blockHeight = isDeep ? 0.62 : 0.32;
      const blockDepth = isDeep ? 2.2 : 1.5;

      // Geometry with rounded box feel
      const geo = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth, 2, 2, 2);

      // Material based on category
      const colorHex = getCategoryColor(task.category);
      const baseColor = new THREE.Color(colorHex);
      const emissiveColor = baseColor.clone().multiplyScalar(0.4);

      const mat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: isDeep ? 0.35 : 0.45,
        metalness: isDeep ? 0.2 : 0.1,
        emissive: emissiveColor,
        emissiveIntensity: 0.08
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Target position along the Chrono-Track
      const centerMinutes = (block.startMinutes + block.endMinutes) / 2;
      const normalizedX = ((centerMinutes - minDayStart) / daySpanMinutes);
      const targetX = -9.5 + normalizedX * trackWidth;
      const targetY = blockHeight / 2 + 0.05;
      // Stagger slightly in Z for visual layering
      const targetZ = (index % 2 === 0 ? 0.25 : -0.25);

      const targetPos = new THREE.Vector3(targetX, targetY, targetZ);
      const targetRot = new THREE.Euler(0, 0, 0);

      // If hero animation is active, start scattered in the air
      if (isHeroRunning) {
        const scatterAngle = (index / scheduleBlocks.length) * Math.PI * 2;
        const scatterRadius = 5.5 + Math.random() * 3.5;
        mesh.position.set(
          Math.cos(scatterAngle) * scatterRadius,
          4.5 + Math.random() * 2.5,
          Math.sin(scatterAngle) * scatterRadius * 0.6
        );
        mesh.rotation.set(
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 0.8
        );
      } else {
        mesh.position.copy(targetPos);
      }

      mesh.userData = {
        blockId: block.id,
        task,
        targetPos,
        targetRot,
        targetScale: new THREE.Vector3(1, 1, 1),
        currentVelocity: new THREE.Vector3(),
        isSettled: !isHeroRunning,
        baseColor,
        emissiveBase: emissiveColor
      } as MeshTaskUserData;

      scene.add(mesh);
      newMeshes.push(mesh);
    });

    taskMeshesRef.current = newMeshes;
  }, [scheduleBlocks, isHeroRunning, getCategoryColor]);

  // Camera reset buttons
  const resetCamera = (mode: 'perspective' | 'top_down') => {
    setCameraMode(mode);
    const cam = cameraRef.current;
    if (!cam) return;

    if (mode === 'top_down') {
      cam.position.set(0, 16, 0.5);
      cam.lookAt(0, 0, 0);
    } else {
      cam.position.set(0, 8.5, 14.5);
      cam.lookAt(0, 0, 0);
    }
    cameraTargetRef.current.set(0, 0, 0);
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0c0e12] select-none shadow-2xl">
      {/* 3D Canvas Mounting Point */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Floating Studio HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
            <span className="text-slate-300">STUDIO TRACK:</span>
            <span className="ml-1.5 font-bold text-sky-400">8:00 AM – 8:00 PM</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs font-mono text-slate-300">
            {scheduleBlocks.length} Task Slabs Docked
          </div>
        </div>

        {/* Camera View Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => resetCamera('perspective')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
              cameraMode === 'perspective'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            Perspective Orbit
          </button>
          <button
            onClick={() => resetCamera('top_down')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
              cameraMode === 'top_down'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            Top-Down Plan
          </button>
        </div>
      </div>

      {/* Bottom Chrono Timeline Axis Legend */}
      <div className="absolute bottom-3 left-6 right-6 flex justify-between pointer-events-none text-[11px] font-mono text-slate-400/80 px-2 border-t border-slate-800/80 pt-1.5">
        <span>08:00 AM (Warmup)</span>
        <span className="text-amber-400 font-semibold">10:00 AM (Peak Focus)</span>
        <span>12:00 PM (Midday)</span>
        <span className="text-sky-400 font-semibold">04:00 PM (Surge)</span>
        <span>08:00 PM (Winddown)</span>
      </div>

      {/* Interactive 3D Tooltip when hovering over a task slab */}
      {hoveredTask && (
        <div
          className="absolute z-30 pointer-events-none studio-panel p-3.5 rounded-xl border border-sky-500/30 shadow-2xl max-w-xs transition-transform transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${hoveredTask.x}px`,
            top: `${hoveredTask.y}px`
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold text-white"
              style={{
                backgroundColor: `${hoveredTask.task.category === 'CS / Coding' ? '#3B82F6' : hoveredTask.task.category === 'Mathematics' ? '#F59E0B' : '#10B981'}33`,
                border: `1px solid ${hoveredTask.task.category === 'CS / Coding' ? '#3B82F6' : hoveredTask.task.category === 'Mathematics' ? '#F59E0B' : '#10B981'}66`
              }}
            >
              {hoveredTask.task.category}
            </span>
            <span className="text-[11px] font-mono text-sky-300 font-medium">
              {formatMinutesTo12Hour(hoveredTask.block.startMinutes)} – {formatMinutesTo12Hour(hoveredTask.block.endMinutes)}
            </span>
          </div>

          <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
            {hoveredTask.task.title}
          </p>

          <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>
              Est: <strong className="text-slate-100">{hoveredTask.task.estimatedDuration}m</strong> → Pred: <strong className="text-amber-400">{hoveredTask.task.predictedDuration}m</strong>
            </span>
            <span className="text-emerald-400 font-medium">
              {Math.round(hoveredTask.block.confidenceScore * 100)}% Confidence
            </span>
          </div>

          {hoveredTask.block.reasoning && (
            <p className="mt-1 text-[10px] text-sky-200/80 italic leading-tight">
              💡 {hoveredTask.block.reasoning}
            </p>
          )}

          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Click to inspect & edit</span>
            <span className="text-sky-400">Drag to orbit scene</span>
          </div>
        </div>
      )}

      {/* Hero Animation Overlay Banner */}
      {isHeroRunning && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500">
          <div className="bg-slate-900/90 border border-sky-500/40 px-6 py-4 rounded-2xl shadow-2xl text-center max-w-md animate-bounce">
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest block mb-1">
              ✨ Adaptive Synthesis In Action
            </span>
            <h3 className="text-lg font-heading font-bold text-white">
              Docking Tasks into Circadian Focus Windows
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Evaluating your learned productivity curve and category duration biases...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
