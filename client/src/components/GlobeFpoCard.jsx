import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { FPO_STATES, FPO_CORRIDORS, FPO_SUMMARY } from '../data/fpoData';
import { Plus, Minus, Target, ChevronLeft, ChevronRight } from 'lucide-react';

export const GlobeFpoCard = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [labelMode, setLabelMode] = useState('top'); // 'top', 'clean', 'all'
  const [screenCoords, setScreenCoords] = useState({});
  const [currentHubIdx, setCurrentHubIdx] = useState(0);

  // Key hub states for cycling via < > buttons
  const majorHubs = useMemo(() => ['MP', 'MH', 'KA', 'WB', 'UP', 'RJ', 'DL', 'OD', 'GJ', 'BR'], []);

  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const isAutoRotatingRef = useRef(true);

  // Three.js instances ref
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Floating full globe in compact card view
  const targetRotationRef = useRef({ x: 0.28, y: 3.35 });
  const targetZoomRef = useRef(9.8);
  const markerPositionsRef = useRef({});

  // Helper: Lat/Lng to Vector3 on sphere of given radius
  const latLngToVector3 = (lat, lng, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = targetZoomRef.current;
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    sunLight.position.set(25, 20, 30);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-25, -15, -20);
    scene.add(rimLight);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Initial orientation pointing at India
    globeGroup.rotation.x = targetRotationRef.current.x;
    globeGroup.rotation.y = targetRotationRef.current.y;

    // Radius calibrated for compact card
    const globeRadius = 3.2;

    // 6. Earth Mesh (Texture + Bump)
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      '/textures/earth-blue-marble.jpg',
      () => renderer.render(scene, camera)
    );
    const bumpTexture = textureLoader.load('/textures/earth-topology.png');

    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.08,
      roughness: 0.6,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(earthMesh);

    // 7. Atmospheric Halo
    const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.15, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.24, 0.65, 0.98, 1.0) * intensity * 0.85;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // 8. 3D State Markers & Rings
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);

    const markerPositions = {};

    FPO_STATES.forEach((state) => {
      const pos = latLngToVector3(state.lat, state.lng, globeRadius);
      markerPositions[state.id] = pos;

      let pinColor = 0x3b82f6; // Blue pin
      if (state.tier === 'hub') pinColor = 0x10b981;
      else if (state.tier === 'high') pinColor = 0xef4444;
      else if (state.tier === 'medium') pinColor = 0xf59e0b;

      // Small compact pin sphere
      const pinRadius = state.tier === 'high' ? 0.030 : (state.tier === 'medium' ? 0.024 : 0.020);
      const pinGeom = new THREE.SphereGeometry(pinRadius, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        emissive: pinColor,
        emissiveIntensity: 0.9,
        roughness: 0.2
      });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(pos.clone().multiplyScalar(1.018));
      markersGroup.add(pinMesh);

      // Subtle halo ring on surface
      const ringGeom = new THREE.RingGeometry(pinRadius * 1.1, pinRadius * 1.5, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.021));
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      markersGroup.add(ringMesh);
    });

    markerPositionsRef.current = markerPositions;

    // 9. 3D Curved Arcs
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);

    const pulsePoints = [];

    FPO_CORRIDORS.forEach((corridor) => {
      const v1 = markerPositions[corridor.from];
      const v2 = markerPositions[corridor.to];
      if (!v1 || !v2) return;

      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      const distance = v1.distanceTo(v2);
      const elevation = globeRadius + Math.max(0.25, distance * 0.22);
      mid.normalize().multiplyScalar(elevation);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);

      const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.011, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.85,
      });
      const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      arcsGroup.add(tubeMesh);

      const pulseGeom = new THREE.SphereGeometry(0.020, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xffedd5,
        transparent: true,
        opacity: 0.95,
      });
      const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
      arcsGroup.add(pulseMesh);

      pulsePoints.push({
        mesh: pulseMesh,
        curve: curve,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.003
      });
    });

    // 10. Mouse / Drag Interaction
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      targetRotationRef.current.y += deltaX * 0.004;
      targetRotationRef.current.x = Math.max(-1.1, Math.min(1.1, targetRotationRef.current.x + deltaY * 0.004));

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.004;
      targetZoomRef.current = Math.max(6.5, Math.min(16, targetZoomRef.current + zoomDelta));
    };

    // Touch Support
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
      const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;

      targetRotationRef.current.y += deltaX * 0.004;
      targetRotationRef.current.x = Math.max(-1.1, Math.min(1.1, targetRotationRef.current.x + deltaY * 0.004));

      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    canvasEl.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // 11. Animation Loop
    let pulseAngle = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Continuous visible slow rotation (majestic ~4 degrees per second)
      if (!isDraggingRef.current && isAutoRotatingRef.current) {
        targetRotationRef.current.y += 0.0012;
      }

      globeGroup.rotation.y += (targetRotationRef.current.y - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotationRef.current.x - globeGroup.rotation.x) * 0.08;
      camera.position.z += (targetZoomRef.current - camera.position.z) * 0.1;

      pulsePoints.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      pulseAngle += 0.04;
      const scaleMultiplier = 1 + Math.sin(pulseAngle) * 0.15;
      markersGroup.children.forEach((child) => {
        if (child.geometry instanceof THREE.RingGeometry) {
          child.scale.set(scaleMultiplier, scaleMultiplier, 1);
        }
      });

      renderer.render(scene, camera);

      const coords = {};
      const tempV = new THREE.Vector3();

      FPO_STATES.forEach((state) => {
        const pos = markerPositions[state.id];
        if (!pos) return;

        tempV.copy(pos);
        tempV.applyEuler(globeGroup.rotation);

        const isFacing = tempV.z > 0.6;
        if (isFacing) {
          tempV.project(camera);
          const x = (tempV.x * 0.5 + 0.5) * width;
          const y = (-(tempV.y * 0.5) + 0.5) * height;
          coords[state.id] = { x, y, visible: true, tier: state.tier };
        } else {
          coords[state.id] = { visible: false };
        }
      });

      setScreenCoords(coords);
    };

    animate();

    // 12. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height || 360;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      canvasEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('wheel', handleWheel);
      canvasEl.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
    };
  }, []);

  // Controls Handlers
  const handleZoomIn = () => {
    targetZoomRef.current = Math.max(6.5, targetZoomRef.current - 1.2);
  };

  const handleZoomOut = () => {
    targetZoomRef.current = Math.min(16, targetZoomRef.current + 1.2);
  };

  const handleResetIndia = () => {
    targetRotationRef.current = { x: 0.28, y: 3.35 };
    targetZoomRef.current = 9.8;
    setSelectedState(null);
  };

  const rotateToState = (stateId) => {
    const state = FPO_STATES.find((s) => s.id === stateId);
    if (!state) return;
    setSelectedState(state);

    const phi = (90 - state.lat) * (Math.PI / 180);
    const theta = (state.lng + 180) * (Math.PI / 180);
    const x = -3.2 * Math.cos(theta) * Math.sin(phi);
    const z = 3.2 * Math.sin(theta) * Math.sin(phi);

    const angleY = Math.PI + Math.atan2(x, -z);

    targetRotationRef.current = {
      x: 0.25,
      y: angleY
    };
    targetZoomRef.current = 8.0;
  };

  const handlePrevHub = () => {
    const nextIdx = (currentHubIdx - 1 + majorHubs.length) % majorHubs.length;
    setCurrentHubIdx(nextIdx);
    rotateToState(majorHubs[nextIdx]);
  };

  const handleNextHub = () => {
    const nextIdx = (currentHubIdx + 1) % majorHubs.length;
    setCurrentHubIdx(nextIdx);
    rotateToState(majorHubs[nextIdx]);
  };

  const shouldShowLabel = (state) => {
    if (hoveredState?.id === state.id || selectedState?.id === state.id) return true;
    if (labelMode === 'clean') return false;
    if (labelMode === 'all') return true;
    const topSpacedHubs = ['MP', 'KA', 'WB', 'RJ', 'DL', 'TN'];
    return topSpacedHubs.includes(state.id);
  };

  const toggleAutoRotate = () => {
    const next = !isAutoRotating;
    setIsAutoRotating(next);
    isAutoRotatingRef.current = next;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[440px] h-[360px] bg-[#091226] text-slate-100 rounded-[28px] border border-[#1b2a4e] shadow-[0_15px_40px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden select-none font-sans"
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Outer Radial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.12)_0%,rgba(9,18,38,0)_75%)]" />

      {/* TOP HEADER (Compact matching reference) */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-20">
        {/* Left: Title + Navigation Pill Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="font-bold text-xs text-slate-200 tracking-wide">
            3D Globe
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevHub}
              title="Previous FPO Hub"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1c284c] hover:bg-[#28396c] text-blue-300 transition-all border border-blue-800/30 active:scale-90"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextHub}
              title="Next FPO Hub"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1c284c] hover:bg-[#28396c] text-blue-300 transition-all border border-blue-800/30 active:scale-90"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Mode Switcher: Top Hubs / Clean / All */}
        <div className="hidden sm:flex items-center gap-0.5 pointer-events-auto bg-[#0d162f]/85 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-blue-900/40 text-[9px] font-bold text-slate-300">
          <button
            onClick={() => setLabelMode('top')}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              labelMode === 'top' ? 'bg-blue-600 text-white font-black' : 'hover:text-white'
            }`}
          >
            Top Hubs
          </button>
          <button
            onClick={() => setLabelMode('clean')}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              labelMode === 'clean' ? 'bg-blue-600 text-white font-black' : 'hover:text-white'
            }`}
          >
            Clean
          </button>
          <button
            onClick={() => setLabelMode('all')}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              labelMode === 'all' ? 'bg-blue-600 text-white font-black' : 'hover:text-white'
            }`}
          >
            All
          </button>
        </div>

        {/* Right: Vertical stack of +, -, and Target */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1c284c]/90 hover:bg-[#28396c] text-slate-200 border border-blue-800/30 shadow-md transition-all active:scale-90"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1c284c]/90 hover:bg-[#28396c] text-slate-200 border border-blue-800/30 shadow-md transition-all active:scale-90"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetIndia}
            title="Reset to India Center"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1c284c]/90 hover:bg-[#28396c] text-rose-400 hover:text-rose-300 border border-blue-800/30 shadow-md transition-all active:scale-90"
          >
            <Target className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FLOATING 2D LABELS ON TOP OF 3D GLOBE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {FPO_STATES.map((state) => {
          const coord = screenCoords[state.id];
          if (!coord || !coord.visible) return null;

          const isVisible = shouldShowLabel(state);
          const isHovered = hoveredState?.id === state.id;
          const isSelected = selectedState?.id === state.id;

          if (!isVisible) {
            return (
              <div
                key={state.id}
                style={{
                  transform: `translate(${coord.x}px, ${coord.y}px) translate(-50%, -50%)`,
                }}
                className="absolute pointer-events-auto w-4 h-4 cursor-pointer flex items-center justify-center"
                onMouseEnter={() => setHoveredState(state)}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => rotateToState(state.id)}
              />
            );
          }

          let badgeStyle = 'bg-blue-600/90 border-blue-400 text-blue-100';
          if (state.tier === 'hub') badgeStyle = 'bg-emerald-600/95 border-emerald-300 text-white';
          else if (state.tier === 'high') badgeStyle = 'bg-red-600/90 border-red-400 text-white';
          else if (state.tier === 'medium') badgeStyle = 'bg-amber-600/90 border-amber-300 text-white';

          return (
            <div
              key={state.id}
              style={{
                transform: `translate(${coord.x}px, ${coord.y}px) translate(-50%, -115%)`,
              }}
              className="absolute pointer-events-auto cursor-pointer transition-transform duration-150"
              onMouseEnter={() => setHoveredState(state)}
              onMouseLeave={() => setHoveredState(null)}
              onClick={() => rotateToState(state.id)}
            >
              <div
                className={`flex items-center gap-0.5 px-1 py-0.2 rounded border text-[8px] font-bold tracking-tight shadow-sm backdrop-blur-sm transition-all ${badgeStyle} ${
                  isHovered || isSelected ? 'ring-1 ring-white scale-110 z-30' : 'hover:scale-105'
                }`}
              >
                <span>{state.code}</span>
                <span className="bg-black/40 px-0.5 rounded text-[7px] font-mono">({state.count})</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM-LEFT FLOATING BADGE (Compact matching reference) */}
      <div className="absolute bottom-3.5 left-3.5 z-20 pointer-events-auto">
        <div className="bg-[#0b1428]/92 backdrop-blur-md border border-blue-900/40 rounded-xl p-2.5 shadow-xl min-w-[155px] max-w-[170px] space-y-1.5">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-700/40 font-bold text-[10px] text-slate-100">
            <span>🌾</span>
            <span>FPO Network Map</span>
          </div>

          <div className="space-y-1 text-[9px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm" />
              <span>High Volume (&gt;50)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
              <span>Inter-State Route</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
              <span>National SFAC Hub</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
              <span>State FPO Clusters</span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-700/40 flex items-center justify-between text-[8px] text-slate-400 font-medium">
            <span>901 FPOs</span>
            <span>•</span>
            <span>2-Yr: 260</span>
            <span>•</span>
            <span>3-Yr: 641</span>
          </div>
        </div>
      </div>

      {/* ACTIVE STATE DETAIL POPUP CARD */}
      {(hoveredState || selectedState) && (
        <div className="absolute top-12 right-3.5 z-20 pointer-events-auto animate-fade-in">
          {(() => {
            const current = hoveredState || selectedState;
            const percentage = ((current.count / FPO_SUMMARY.total) * 100).toFixed(1);
            return (
              <div className="bg-[#0b1429]/95 backdrop-blur-md border border-blue-500/40 rounded-xl p-2.5 shadow-2xl w-44 space-y-1.5 text-[11px]">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-xs text-slate-100">{current.name}</h4>
                    <p className="text-[9px] text-blue-300 font-bold uppercase tracking-wider">
                      SFAC Cluster
                    </p>
                  </div>
                  <span className="bg-blue-600/30 border border-blue-400/40 text-blue-200 px-1.5 py-0.5 rounded text-[10px] font-black">
                    {current.count}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[9px] pt-1 border-t border-slate-700/60">
                  <div className="bg-slate-800/60 p-1 rounded border border-slate-700/40">
                    <span className="text-slate-400 block text-[8px]">Share</span>
                    <span className="font-bold text-slate-200">{percentage}%</span>
                  </div>
                  <div className="bg-slate-800/60 p-1 rounded border border-slate-700/40">
                    <span className="text-slate-400 block text-[8px]">Tier</span>
                    <span className="font-bold text-slate-200 capitalize">{current.tier}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
