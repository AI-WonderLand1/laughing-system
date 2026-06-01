import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import * as THREE from 'three';
import { 
  Terminal as TerminalIcon, 
  Cpu, 
  Layers, 
  Box, 
  Sliders, 
  Activity, 
  Play, 
  Volume2, 
  FileCode, 
  Package, 
  RefreshCw, 
  Power, 
  Grid, 
  Maximize, 
  Code, 
  FolderOpen, 
  Eye, 
  Map, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Sparkles,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function PodStudio() {
  const { 
    files, 
    activeEngineId, 
    spinUpEnginePod, 
    pods, 
    addAgentLog,
    rebootPod,
    customEngineConfig
  } = useWorkspace();

  // Startup Choice Gate Launcher States
  const [isStudioBooted, setIsStudioBooted] = useState(false);
  const [selectedLaunchEngine, setSelectedLaunchEngine] = useState<'three' | 'babylon' | 'playcanvas' | 'custom'>(() => {
    const saved = localStorage.getItem('wonder_space_selected_engine');
    return (saved === 'three' || saved === 'babylon' || saved === 'playcanvas' || saved === 'custom') ? saved : 'three';
  });

  useEffect(() => {
    localStorage.setItem('wonder_space_selected_engine', selectedLaunchEngine);
  }, [selectedLaunchEngine]);

  const [selectedLaunchEditor, setSelectedLaunchEditor] = useState<'inspector' | 'terminal' | 'kubernetes' | 'ai-helper'>('inspector');
  const [compilerProfile, setCompilerProfile] = useState<'production' | 'debug_telemetry' | 'harness'>('production');
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);

  // Pod Status & Management States
  const [podStatus, setPodStatus] = useState<'Running' | 'Building' | 'Stopped'>('Running');
  const [isRestarting, setIsRestarting] = useState(false);
  const [workspaceName] = useState('WonderSpace Core 3D Pod');
  const [userID] = useState('danksmoker42001@gmail.com');

  // Left Sidebar Accordions
  const [leftTab, setLeftTab] = useState<'files' | 'scenes' | 'packages' | 'logs'>('files');
  const [selectedScene, setSelectedScene] = useState('Staging Ground');
  const [scenesList] = useState([
    'Staging Ground',
    'Industrial Garage',
    'High-Fidelity Virtual Studio',
    'WebGL Neon Grid'
  ]);
  const [packagesList] = useState([
    { name: '@google/genai', version: 'v0.1.2', status: 'stable' },
    { name: 'three-webgpu', version: 'v1.12.0', status: 'hot' },
    { name: '@react-three/fiber', version: 'v8.15.5', status: 'stable' },
    { name: 'ammo.js', version: 'v2.1.0', status: 'system' },
    { name: 'playcanvas-engine', version: 'v1.65.2', status: 'active' }
  ]);

  // Center Viewport Overlay & Cameras
  const [gizmoMode, setGizmoMode] = useState<'move' | 'rotate' | 'scale'>('move');
  const [showGrid, setShowGrid] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [camPitch, setCamPitch] = useState(20);
  const [camYaw, setCamYaw] = useState(45);
  const [camZoom, setCamZoom] = useState(1.2);
  const [fps, setFps] = useState(60);
  const [gpuLoad, setGpuLoad] = useState(38);

  // Inspector Panel (Primary Entity)
  const [entityName, setEntityName] = useState('Workspace_Primary_Mesh');
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(1.5);
  const [posZ, setPosZ] = useState(-5);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(45);
  const [rotZ, setRotZ] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [scaleZ, setScaleZ] = useState(1);

  // Material & Geometry
  const [albedoColor, setAlbedoColor] = useState('#00d4ff');
  const [metallic, setMetallic] = useState(0.85);
  const [roughness, setRoughness] = useState(0.25);
  const [geometryType, setGeometryType] = useState<'cube' | 'sphere' | 'torus' | 'cylinder'>('torus');
  const [wireframeMode, setWireframeMode] = useState(false);
  const [scriptBinding, setScriptBinding] = useState('rotate_mesh.js');

  // Bottom Tabs
  const [bottomTab, setBottomTab] = useState<'terminal' | 'build' | 'podLogs' | 'aiAssistant'>('terminal');

  // Input states
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'WonderSpace K8s Sandbox Kernel initialized.',
    'Port 3000 mapping routed successfully via local Nginx reverse‑proxy.',
    'Docker daemon running on node-gpu-01.',
    'Type "help" to display container-specific sandbox commands.'
  ]);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('How can I help optimize this 3D Pod environment? You can ask me to "enable wireframe", "change color to red", or "spin up PlayCanvas".');

  // Simulated Pod Logs Stream & Build logs
  const [buildLogs, setBuildLogs] = useState<string[]>([
    'npm run build:prod --output=dist/',
    '[webpack] Compiling 3D modules...',
    '[esbuild] transpile server.ts to CommonJS...',
    'Compiled static assets successfully.'
  ]);
  const [podLogsStream, setPodLogsStream] = useState<string[]>([
    '[K8S-DEB-POD] Connecting persistent host storage claim...',
    '[K8S-DEB-POD] Env V_ACCEL_DRIVER verified: WebGL-v2 driver running.',
    '[K8S-DEB-POD] Handshake established with host client port 3000.'
  ]);

  // Handle Resize & Canvas reference
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive Mouse Orbit Controls & Web Wheel Zoom
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: camYaw,
      pitch: camPitch
    };
    addAgentLog("Primary orbiting lock engaged", "info");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    // Smooth Orbit responsiveness
    const newYaw = (dragStart.current.yaw - dx * 0.4) % 360;
    const newPitch = Math.max(-85, Math.min(85, dragStart.current.pitch + dy * 0.4));
    
    setCamYaw(newYaw < 0 ? newYaw + 360 : newYaw);
    setCamPitch(newPitch);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom sensitivity
    const delta = e.deltaY * 0.0015;
    setCamZoom(prev => Math.max(0.4, Math.min(2.5, prev - delta)));
  };

  // Real, physically-grounded high-fidelity THREE.js pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || canvas.clientWidth || 600;
    const height = canvas.parentElement?.clientHeight || canvas.clientHeight || 450;
    canvas.width = width;
    canvas.height = height;

    // 1. Compile real Three.js Scene and Context
    const scene = new THREE.Scene();
    if (activeEngineId === 'babylon') {
      scene.background = new THREE.Color('#12131a'); // Babylon classic dark violet space
    } else if (activeEngineId === 'playcanvas') {
      scene.background = new THREE.Color('#050608'); // PlayCanvas sleek engine carbon black
    } else if (activeEngineId === 'custom') {
      scene.background = new THREE.Color(customEngineConfig?.bg || '#05060a');
    } else {
      scene.background = new THREE.Color('#08090c'); // ThreeJS standard slate mesh space
    }

    // 2. Perspective view projection representation
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    
    // Orbital trigonometric projections
    const radius = 9 * (2.2 - camZoom);
    const theta = camYaw * Math.PI / 180;
    const phi = (90 - camPitch) * Math.PI / 180;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);

    // 3. WebGL Direct buffer renderer compilation
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Physical illumination sources
    if (activeEngineId === 'babylon') {
      const ambientLight = new THREE.AmbientLight(0xd9e2ec, 0.45);
      scene.add(ambientLight);

      const hemLight = new THREE.HemisphereLight(0xfffae6, 0xbfdbfe, 1.3);
      scene.add(hemLight);

      const keyLight = new THREE.DirectionalLight(0xe2e8f0, 1.4);
      keyLight.position.set(5, 8, 6);
      scene.add(keyLight);

      const pointLight = new THREE.PointLight(new THREE.Color('#818cf8'), 5, 10);
      pointLight.position.set(0, 2, 0);
      scene.add(pointLight);
    } else if (activeEngineId === 'playcanvas') {
      const ambientLight = new THREE.AmbientLight(0x0a0c10, 0.2);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffa83e, 2.0);
      keyLight.position.set(5, 8, 6);
      scene.add(keyLight);

      const neonRimLight = new THREE.DirectionalLight(0xff4500, 1.6);
      neonRimLight.position.set(-6, 3, -6);
      scene.add(neonRimLight);

      const orangeIndicator = new THREE.PointLight(new THREE.Color('#ff8400'), 8, 12);
      orangeIndicator.position.set(0, 2, 0);
      scene.add(orangeIndicator);
    } else if (activeEngineId === 'custom') {
      const ambientLight = new THREE.AmbientLight(new THREE.Color(customEngineConfig?.ambient || '#3b82f6'), 0.55);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
      keyLight.position.set(5, 8, 6);
      scene.add(keyLight);

      const pointLight = new THREE.PointLight(new THREE.Color(customEngineConfig?.particleColor || '#00ffff'), 8, 12);
      pointLight.position.set(0, 2, 0);
      scene.add(pointLight);
    } else {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
      keyLight.position.set(5, 8, 6);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(new THREE.Color(albedoColor), 1.2);
      rimLight.position.set(-6, 3, -6);
      scene.add(rimLight);

      const pointLight = new THREE.PointLight(new THREE.Color('#00d4ff'), 6, 8);
      pointLight.position.set(0, 2, 0);
      scene.add(pointLight);
    }

    // 5. Grid Helper and Axes guides (standard ground floor layout)
    if (showGrid) {
      let color1 = '#1b1f28';
      let color2 = '#10131a';
      if (activeEngineId === 'babylon') {
        color1 = '#4c5375';
        color2 = '#1c1d29';
      } else if (activeEngineId === 'playcanvas') {
        color1 = '#ff8800';
        color2 = '#190e00';
      }
      const grid = new THREE.GridHelper(30, 24, color1, color2);
      grid.position.y = -1.8;
      scene.add(grid);

      const axes = new THREE.AxesHelper(3);
      axes.position.y = -1.79;
      scene.add(axes);
    }

    // Secondary Floating Engine Identity Accents Group
    const floatGroup = new THREE.Group();
    scene.add(floatGroup);

    if (activeEngineId === 'babylon') {
      // Babylon signature: rotating glowing coordinate orbit ring
      const torusGeo = new THREE.RingGeometry(2.1, 2.15, 32);
      const torusMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(torusGeo, torusMat);
      ring.position.set(posX, posY - 1.5, posZ + 5);
      ring.rotation.x = Math.PI / 2;
      floatGroup.add(ring);
    } else if (activeEngineId === 'playcanvas') {
      // PlayCanvas signature: four orbiting amber helper cubes
      for (let i = 0; i < 4; i++) {
        const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const pMat = new THREE.MeshBasicMaterial({ color: 0xffa500, wireframe: true });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        const angle = (i * Math.PI) / 2;
        pMesh.position.set(
          posX + Math.cos(angle) * 2.1,
          posY - 1.5,
          posZ + 5 + Math.sin(angle) * 2.1
        );
        floatGroup.add(pMesh);
      }
    }

    // 6. Geometry builder
    let geometry: THREE.BufferGeometry;
    if (activeEngineId === 'custom' && customEngineConfig) {
      if (customEngineConfig.customShape === 'box') {
        geometry = new THREE.BoxGeometry(2, 2, 2);
      } else if (customEngineConfig.customShape === 'sphere') {
        geometry = new THREE.SphereGeometry(1.3, 36, 18);
      } else if (customEngineConfig.customShape === 'torus') {
        geometry = new THREE.TorusGeometry(1.2, 0.35, 16, 80);
      } else if (customEngineConfig.customShape === 'octahedron') {
        geometry = new THREE.OctahedronGeometry(1.3, 0);
      } else { // cone
        geometry = new THREE.ConeGeometry(1.3, 2.5, 32);
      }
    } else {
      if (geometryType === 'cube') {
        geometry = new THREE.BoxGeometry(2, 2, 2);
      } else if (geometryType === 'sphere') {
        geometry = new THREE.SphereGeometry(1.3, 36, 18);
      } else if (geometryType === 'cylinder') {
        geometry = new THREE.CylinderGeometry(1, 1, 2.5, 32);
      } else { // Torus
        geometry = new THREE.TorusGeometry(1.2, 0.35, 16, 80);
      }
    }

    // 7. Physical PBR Standard Material Setup
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(albedoColor),
      metalness: metallic,
      roughness: roughness,
      wireframe: wireframeMode,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(posX, posY - 1.5, posZ + 5);
    mesh.rotation.set(rotX * Math.PI / 180, rotY * Math.PI / 180, rotZ * Math.PI / 180);
    mesh.scale.set(scaleX, scaleY, scaleZ);
    scene.add(mesh);

    // 8. Dynamic Transforming gizmos representations
    if (gizmoMode === 'move') {
      // Red green blue axes guides
      const materialX = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
      const pointsX = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 0, 0)];
      const geomX = new THREE.BufferGeometry().setFromPoints(pointsX);
      const lineX = new THREE.Line(geomX, materialX);
      
      const materialY = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
      const pointsY = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2, 0)];
      const geomY = new THREE.BufferGeometry().setFromPoints(pointsY);
      const lineY = new THREE.Line(geomY, materialY);

      const materialZ = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
      const pointsZ = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 2)];
      const geomZ = new THREE.BufferGeometry().setFromPoints(pointsZ);
      const lineZ = new THREE.Line(geomZ, materialZ);

      const gizmoGroup = new THREE.Group();
      gizmoGroup.add(lineX, lineY, lineZ);
      gizmoGroup.position.copy(mesh.position);
      scene.add(gizmoGroup);
    }

    // 9. Bounding Frame Container Helper
    let boundingBoxHelper: THREE.BoxHelper | null = null;
    if (showBoundingBoxes) {
      boundingBoxHelper = new THREE.BoxHelper(mesh, new THREE.Color(0x3b82f6));
      scene.add(boundingBoxHelper);
    }

    // 10. Frame Tick Animation Loop with JS compilation hooks
    let animationId: number;
    let localTime = 0;

    const tick = () => {
      animationId = requestAnimationFrame(tick);

      // JS compiler runner simulations
      if (activeEngineId === 'custom' && customEngineConfig) {
        try {
          if (customEngineConfig.script) {
            const win = window as any;
            if (!win.__customScriptExecutor || win.__customScriptSource !== customEngineConfig.script) {
              let code = customEngineConfig.script;
              if (code.includes('function onUpdate')) {
                code += "\n; if (typeof onUpdate === 'function') { onUpdate(time, mesh, scene); }";
              }
              win.__customScriptExecutor = new Function('time', 'mesh', 'scene', code);
              win.__customScriptSource = customEngineConfig.script;
            }
            if (win.__customScriptExecutor) {
              const stepTime = localTime * (customEngineConfig.speed || 1);
              win.__customScriptExecutor(stepTime, mesh, scene);
            }
          }
        } catch (scriptErr) {
          // Silent catch to prevent crash loops
        }
      } else {
        if (scriptBinding === 'rotate_mesh.js') {
          mesh.rotation.y += 0.015;
          mesh.rotation.z += 0.005;
        } else if (scriptBinding === 'pulse_wireframe.js') {
          localTime += 0.045;
          const multiplier = 1 + Math.sin(localTime) * 0.18;
          mesh.scale.set(scaleX * multiplier, scaleY * multiplier, scaleZ * multiplier);
        }
      }

      // Rotate active float group elements
      localTime += 0.01;
      if (activeEngineId === 'babylon') {
        floatGroup.rotation.y += 0.008;
      } else if (activeEngineId === 'playcanvas') {
        floatGroup.rotation.y += 0.025;
        floatGroup.position.y = Math.sin(localTime * 3) * 0.12;
      }

      if (boundingBoxHelper) {
        boundingBoxHelper.update();
      }

      renderer.render(scene, camera);
    };

    tick();

    // Responsive Canvas Resize Observer
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth || 600;
      const h = parent.clientHeight || 450;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [
    posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ,
    albedoColor, metallic, roughness, geometryType, wireframeMode, 
    showGrid, showBoundingBoxes, camZoom, camPitch, camYaw, scriptBinding, gizmoMode,
    activeEngineId
  ]);

  // Jitter performance counters to make them feel live & realistic
  useEffect(() => {
    const jitter = setInterval(() => {
      setFps(f => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.min(60, Math.max(54, f + delta));
      });
      setGpuLoad(g => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.min(95, Math.max(20, g + delta));
      });
    }, 1500);
    return () => clearInterval(jitter);
  }, []);

  // Soft helper function to calculate custom mesh shades
  const adjustBrightness = (hex: string, percent: number) => {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.max(0, Math.min(255, R + percent));
    G = Math.max(0, Math.min(255, G + percent));
    B = Math.max(0, Math.min(255, B + percent));

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  // Run a quick simulation of restarting the pod container
  const handleRestartPod = () => {
    setPodStatus('Building');
    setIsRestarting(true);
    addAgentLog(`[k8s] Triggering cold reboot for workspace dev container...`, 'warning');
    setTerminalLines(prev => [...prev, '[K8S-DEB-POD] Cold boot triggered. Staged services shutting down...', '[K8S-DEB-POD] Rebuilding standard dev-container.json parameters...']);
    
    // Auto-advance through build state to Running state
    setTimeout(() => {
      setPodStatus('Running');
      setIsRestarting(false);
      addAgentLog(`[k8s] Dev container pod successfully restarted! Storage synced.`, 'success');
      setTerminalLines(prev => [
        ...prev, 
        '✔ Docker container rebuild finalized.',
        '✔ Port 3000 mapping restored successfully.',
        '✔ Remote WebGPU stream synchronized on GPU kernel node.'
      ]);
    }, 3000);
  };

  const handleStopPod = () => {
    setPodStatus('Stopped');
    addAgentLog(`[k8s] Stopped persistent development container.`, 'error');
    setTerminalLines(prev => [...prev, '✖ [K8S-DEB-POD] Container terminated. Interactive ports closed.']);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const rawCmd = terminalInput.trim().toLowerCase();
    setTerminalLines(prev => [...prev, `$ ${terminalInput}`]);
    setTerminalInput('');

    // Process basic mock commands
    if (rawCmd === 'help') {
      setTerminalLines(prev => [...prev, 
        'AVAILABLE HOST RUNTIMES COMMANDS:',
        '  help          - Display this system terminal menu',
        '  clear         - Clear the visual container lines history',
        '  status        - Inspect pod deployment health indicators',
        '  env           - List container environment credentials',
        '  restart       - Restart container compilation sequence',
        '  mesh [type]   - Set mesh geometries (cube / sphere / torus)'
      ]);
    } else if (rawCmd === 'clear') {
      setTerminalLines(['Terminal history cleared.']);
    } else if (rawCmd === 'status') {
      setTerminalLines(prev => [...prev, 
        `Pod Namespace: dev-3d-environments`,
        `Replica State: Running`,
        `Port Map: Localhost:3000 -> Container:3000`,
        `Kernel active: ${activeEngineId.toUpperCase()} template.`
      ]);
    } else if (rawCmd === 'env') {
      setTerminalLines(prev => [...prev, 
        `GKE_NODE_ZONE="us-west2-a"`,
        `GPU_COMPUTE_ACCEL="NVIDIA-A100"`,
        `WASM_SANDBOX_STAGING="3000"`,
        `NODE_ENV="production"`
      ]);
    } else if (rawCmd === 'restart') {
      handleRestartPod();
    } else if (rawCmd.startsWith('mesh ')) {
      const type = rawCmd.split(' ')[1] as any;
      if (['cube', 'sphere', 'torus', 'cylinder'].includes(type)) {
        setGeometryType(type);
        setTerminalLines(prev => [...prev, `Mesh geometry modified to: ${type.toUpperCase()}`]);
      } else {
        setTerminalLines(prev => [...prev, 'Invalid type. Use cube, sphere, torus, or cylinder.']);
      }
    } else {
      setTerminalLines(prev => [...prev, `sh: command not found: ${rawCmd}`]);
    }
  };

  const handleAiAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const query = aiPrompt.trim().toLowerCase();
    setAiPrompt('');
    
    // Simulate smart agent responses that take action!
    if (query.includes('wireframe') || query.includes('enable wire')) {
      setWireframeMode(true);
      setAiResponse('I have enabled wireframe rendering in the WebGL canvas pipeline. This decreases GPU layout usage.');
      addAgentLog('AI automated action: Enable Wireframe', 'success');
    } else if (query.includes('red')) {
      setAlbedoColor('#f43f5e');
      setAiResponse('I have customized the primary mesh material color parameter to pure red (#f43f5e).');
    } else if (query.includes('playcanvas') || query.includes('spin up play')) {
      spinUpEnginePod('playcanvas');
      setSelectedLaunchEngine('playcanvas');
      setAiResponse('Provisioned a lightweight Node compiler pod with Playcanvas Studio on Port 3000.');
    } else if (query.includes('babylon') || query.includes('spin up babylon')) {
      spinUpEnginePod('babylon');
      setSelectedLaunchEngine('babylon');
      setAiResponse('I have triggered the GKE controller to provision Babylon.js Standard render node with standard hemispheric illumination.');
    } else {
      setAiResponse(`Understood! I will analyze the configuration for "${query}". I've queued a build output event check.`);
    }
  };

  const handleOrchestrateLaunch = () => {
    setIsBooting(true);
    setBootProgress(0);
    setBootLines([`[INFO] Handshaking kube-apiserver GKE endpoint...`]);

    const logs = [
      `[INFO] Verifying network allocation for GKE pod: wonder-space-core-3d...`,
      `[INFO] Downloading target artifact docker tag: wonder-space/${selectedLaunchEngine}-core-3d-runner:latest`,
      `[SUCCESS] Layer caching match found. Speeding up pod extraction...`,
      `[INFO] Mounting volume host claims on dev directory inside port 3000 namespace...`,
      `[INFO] Allocating virtual GPU instance: direct-acceleration-claim:0`,
      `[INFO] Selected Active View Context initialized: ${selectedLaunchEditor}`,
      `[INFO] Injecting compiler Optimization flags, profile level: ${compilerProfile}...`,
      `[INFO] Initializing active scene parameters: ${selectedScene}`,
      `[INFO] Binding material configuration variables: Albedo Color=${albedoColor}, Metallness=${metallic}`,
      `[SUCCESS] Node application compiled. WebGL/ThreeJS buffer compilation finished successfully.`,
      `[SUCCESS] Container online. Launching WonderSpace core live render loop!`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setBootProgress(Math.min(100, Math.floor((currentStep / logs.length) * 100)));
      
      const newLn = logs[currentStep - 1];
      if (newLn) {
        setBootLines(prev => [...prev, newLn]);
        addAgentLog(newLn, newLn.includes('[SUCCESS]') ? 'success' : 'info');
      }

      if (currentStep >= logs.length) {
        clearInterval(interval);
        // Spinup Engine pod context
        spinUpEnginePod(selectedLaunchEngine);
        
        // Contextually map selectedLaunchEditor choices to active UI defaults!
        if (selectedLaunchEditor === 'terminal') {
          setBottomTab('terminal');
        } else if (selectedLaunchEditor === 'kubernetes') {
          setBottomTab('podLogs');
        } else if (selectedLaunchEditor === 'ai-helper') {
          setBottomTab('aiAssistant');
        } else {
          setBottomTab('terminal');
        }

        setIsStudioBooted(true);
        setIsBooting(false);
        addAgentLog(`Successfully booted ${selectedLaunchEngine.toUpperCase()} engine template with ${selectedLaunchEditor.toUpperCase()} workspace.`, 'success');
      }
    }, 400);
  };

  if (!isStudioBooted) {
    return (
      <div className="h-full w-full bg-[#06070a] text-slate-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f111a_1px,transparent_1px),linear-gradient(to_bottom,#0f111a_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />
        
        {/* Glow Effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00d4ff]/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

        {/* Startup Gate Cards Frame */}
        <div className="w-full max-w-4xl bg-[#090b11] border border-white/10 rounded-2xl p-8 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)] relative z-10 flex flex-col gap-6 md:gap-8 max-h-[90vh] overflow-y-auto">
          
          {/* Main Top Header Block */}
          <div className="border-b border-white/5 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#00d4ff]/10 text-[#00d4ff] text-[9.5px] font-black tracking-widest px-2.5 py-1 rounded-md border border-[#00d4ff]/20 uppercase font-mono">
                  WONDER_SPACE PLATFORM
                </span>
                <span className="text-zinc-500 text-[10px] font-mono">v2.5.4-STABLE</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                Kubernetes Pod Launcher <span className="text-zinc-500 font-normal">/ Engine Orchestrator</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Select your live material rendering middleware, target workspace suite, and compiler engine profile.
              </p>
            </div>
          </div>

          {/* Is Booting Simulated Progress State */}
          {isBooting ? (
            <div className="flex-1 flex flex-col justify-center py-12 px-4 transition-all">
              <div className="w-full max-w-lg mx-auto space-y-6">
                <div className="flex justify-between items-end font-mono">
                  <div className="space-y-1">
                    <div className="text-xs text-[#00d4ff] font-bold uppercase animate-pulse">
                      SPINNING UP CONTAINER INSTANCE...
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase">
                      Claiming persistent node storage mounts
                    </div>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    {bootProgress}%
                  </div>
                </div>

                {/* Outer Progress bar */}
                <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00d4ff] to-emerald-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_#00d4ff]" 
                    style={{ width: `${bootProgress}%` }}
                  />
                </div>

                {/* Console Log Outputs Stream */}
                <div className="bg-black/80 rounded-xl border border-white/10 p-4 h-48 overflow-y-auto font-mono text-[10px] leading-relaxed text-zinc-400 space-y-1 shadow-inner scrollbar-thin">
                  {bootLines.map((ln, idx) => (
                    <div key={idx} className={cn(
                      "flex gap-2",
                      ln.includes('[INFO]') ? 'text-zinc-400' :
                      ln.includes('[WARN]') ? 'text-amber-400' :
                      ln.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : 'text-[#00d4ff]'
                    )}>
                      <span className="text-zinc-600 select-none">[{idx + 1}]</span>
                      <span>{ln}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Choices Selection Area inside Launcher */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Choose Render Engine Module */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold font-mono">1</span>
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest block">Render Engine</span>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { id: 'three', title: 'Three.js Core', desc: 'Direct WebGL hardware acceleration, true physical material simulations, robust lightings model.', label: 'ACTIVE' },
                      { id: 'babylon', title: 'Babylon.js Standard', desc: 'Complete feature-rich physically-based engine featuring hemispheric lighting and full debug layers.', label: 'STABLE' },
                      { id: 'playcanvas', title: 'PlayCanvas Frame', desc: 'High-performance WebGL context with customized high-contrast orange shaders and WASM acceleration.', label: 'EXPERIMENTAL' },
                      { id: 'custom', title: 'Custom Sandbox Engine', desc: 'Fully programmable custom render loop. Design your own coordinates, physics values, and execute live source scripts in real-time.', label: 'PROGRAMMABLE' },
                    ].map(eng => (
                      <button
                        key={eng.id}
                        onClick={() => setSelectedLaunchEngine(eng.id as any)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-all relative flex flex-col gap-0.5 cursor-pointer",
                          selectedLaunchEngine === eng.id 
                            ? 'bg-[#00d4ff]/5 border-[#00d4ff]/40 text-white shadow-[0_0_12px_rgba(0,212,255,0.06)]' 
                            : 'border-white/5 bg-black/20 text-zinc-400 hover:border-white/15'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[12px] font-bold">{eng.title}</span>
                          <span className={cn(
                            "text-[7px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase",
                            selectedLaunchEngine === eng.id ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-zinc-800 text-zinc-500'
                          )}>{eng.label}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 leading-normal mt-1">{eng.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Choose Default Editor Tool Workspace */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold font-mono">2</span>
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest block">Active View Mode</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'inspector', title: 'Visual Inspector', desc: 'Full sidebar control of albedo colors, metalness, and translation gizmos directly.', label: 'IDEAL FOR DESIGNERS' },
                      { id: 'terminal', title: 'Direct Terminal', desc: 'Headless node access. Perfect for running JS automation scripts natively inside pod.', label: 'IDEAL FOR DEVELOPERS' },
                      { id: 'kubernetes', title: 'K8s Container Logs', desc: 'Focus entirely on raw container compilation outputs, storage status, and telemetry loops.', label: 'IDEAL FOR OPERATORS' },
                      { id: 'ai-helper', title: 'AI Assistant Core', desc: 'Open adaptive co-pilot assistant prompt panel at boot time to command geometry easily.', label: 'IDEAL FOR CONVERSATION' },
                    ].map(edt => (
                      <button
                        key={edt.id}
                        onClick={() => setSelectedLaunchEditor(edt.id as any)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-all relative flex flex-col gap-0.5 cursor-pointer",
                          selectedLaunchEditor === edt.id 
                            ? 'bg-[#00d4ff]/5 border-[#00d4ff]/40 text-white shadow-[0_0_12px_rgba(0,212,255,0.06)]' 
                            : 'border-white/5 bg-black/20 text-zinc-400 hover:border-white/15'
                        )}
                      >
                        <span className="text-[12px] font-bold">{edt.title}</span>
                        <span className="text-[10px] text-zinc-500 leading-normal mt-1">{edt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Compiler Acceleration Settings Profile */}
                <div className="space-y-3.5 col-span-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold font-mono">3</span>
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest block">Compiler Profile</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl space-y-3">
                      {[
                        { id: 'production', label: 'OPTIMIZED PROD BUILD', desc: 'Maximized render performance, strict variables validation, garbage collector active.' },
                        { id: 'debug_telemetry', label: 'VERBOSE TRACE DEBUG', desc: 'Enabled debug assertion maps, simulated container runtime latency, detailed events log.' },
                        { id: 'harness', label: 'ACCELERATED WATER HARNESS', desc: 'Unlocks GPU direct access flags for raw floating point evaluations (Unstable).' },
                      ].map(profile => (
                        <label 
                          key={profile.id} 
                          className={cn(
                            "flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border",
                            compilerProfile === profile.id ? 'bg-white/5 border-white/10' : 'border-transparent hover:bg-white/[0.02]'
                          )}
                        >
                          <input 
                            type="radio" 
                            name="profile" 
                            checked={compilerProfile === profile.id} 
                            onChange={() => setCompilerProfile(profile.id as any)}
                            className="mt-1 accent-[#00d4ff] cursor-pointer"
                          />
                          <div className="ml-1">
                            <div className="text-[10px] font-black text-white tracking-wider">{profile.label}</div>
                            <div className="text-[9px] text-[#94a3b8] mt-0.5 leading-relaxed">{profile.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="p-3 bg-[#00d4ff]/5 border border-[#00d4ff]/10 rounded-xl text-[10.5px] font-mono leading-relaxed text-zinc-400">
                      📝 <span className="text-[#00d4ff] font-bold">Node Note:</span> Launching custom images installs appropriate WASM wrappers dynamically on boot. Connection persistence is bound directly to Port 3000.
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Boot Button footer */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
                <div className="flex items-center gap-2.5 font-mono text-[10px] text-zinc-500">
                  <span>Selected Engine: <strong className="text-white uppercase">{selectedLaunchEngine}</strong></span>
                  <span className="text-zinc-700">•</span>
                  <span>Primary Editor: <strong className="text-[#00d4ff] uppercase">{selectedLaunchEditor}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={handleOrchestrateLaunch}
                  className="px-6 py-3 rounded-xl bg-[#00d4ff] hover:bg-[#33ddff] text-black font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,212,255,0.25)] flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px] font-sans font-bold"
                >
                  Orchestrate Spin-up Pod
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#07080b] text-slate-200 font-sans overflow-hidden select-none">
      
      {/* 1. TOP BAR */}
      <div className="h-14 bg-[#0d0f14] border-b border-[#1b1f28] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Status Indicator Glow */}
          <div className="flex items-center gap-2 bg-[#12151d] px-3 py-1.5 rounded-xl border border-white/5">
            <span className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              podStatus === 'Running' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
              podStatus === 'Building' ? 'bg-[#ffb340] shadow-[0_0_8px_#ffb340]' : 
              'bg-[#ff4d6a] shadow-[0_0_8px_#ff4d6a]'
            )} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
              POD_STATUS: <span className={cn(
                podStatus === 'Running' ? 'text-emerald-400' :
                podStatus === 'Building' ? 'text-amber-400' : 'text-red-400'
              )}>{podStatus}</span>
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          <div>
            <h1 className="text-xs font-black text-white uppercase tracking-wider">{workspaceName}</h1>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">DEV_CONTAINERID: {userID}</p>
          </div>
        </div>

        {/* Pod management actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRestartPod}
            disabled={isRestarting}
            className="p-1.5 px-3 bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={cn("w-3 .5 h-3.5", isRestarting && "animate-spin")} />
            RESTART_POD
          </button>
          <button 
            onClick={handleStopPod}
            className="p-1.5 px-3 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-400 border border-red-500/15 rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" />
            STOP_POD
          </button>
        </div>
      </div>

      {/* THREE SECTIONAL SPLIT */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* 2. LEFT SIDEBAR */}
        <div className="w-64 bg-[#0c0d12] border-r border-[#1b1f28] flex flex-col shrink-0 overflow-hidden">
          {/* Internal Navbar Selector */}
          <div className="grid grid-cols-4 border-b border-[#1b1f28] text-[9px] font-bold text-[#8892a4] uppercase text-center shrink-0 bg-[#0d0f14]">
            <button 
              onClick={() => setLeftTab('files')}
              className={cn("py-2.5 border-b-2", leftTab === 'files' ? 'text-[#00d4ff] border-[#00d4ff] bg-white/5' : 'border-transparent hover:text-white')}
            >
              FILES
            </button>
            <button 
              onClick={() => setLeftTab('scenes')}
              className={cn("py-2.5 border-b-2", leftTab === 'scenes' ? 'text-[#00d4ff] border-[#00d4ff] bg-white/5' : 'border-transparent hover:text-white')}
            >
              SCENES
            </button>
            <button 
              onClick={() => setLeftTab('packages')}
              className={cn("py-2.5 border-b-2", leftTab === 'packages' ? 'text-[#00d4ff] border-[#00d4ff] bg-white/5' : 'border-transparent hover:text-white')}
            >
              PKGS
            </button>
            <button 
              onClick={() => setLeftTab('logs')}
              className={cn("py-2.5 border-b-2", leftTab === 'logs' ? 'text-[#00d4ff] border-[#00d4ff] bg-white/5' : 'border-transparent hover:text-white')}
            >
              LOGS
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {leftTab === 'files' ? (
              <div className="space-y-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">SCRIPTS_AND_ASSETS_TREE</span>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs py-1 cursor-pointer hover:bg-white/5 rounded px-2">
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                    <span className="font-mono">config/</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center gap-2 text-zinc-400 text-[11px] py-1 cursor-pointer hover:bg-white/5 rounded px-2">
                      <FileCode className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="font-mono">engine_compiler.config</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 text-[11px] py-1 cursor-pointer hover:bg-white/5 rounded px-2">
                      <FileCode className="w-3.5 h-3.5 text-[#3b82f6]" />
                      <span className="font-mono">dev-container.json</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400 text-xs py-1 cursor-pointer hover:bg-white/5 rounded px-2 mt-2">
                    <FolderOpen className="w-4 h-4 text-emerald-500" />
                    <span className="font-mono">models/</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center gap-2 text-zinc-400 text-[11px] py-1 cursor-pointer hover:bg-white/5 rounded px-2">
                      <Box className="w-3.5 h-3.5 text-lime-400" />
                      <span className="font-mono">staging_torus.glb</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400 text-xs py-1 cursor-pointer hover:bg-white/5 rounded px-2 mt-2">
                    <FolderOpen className="w-4 h-4 text-yellow-500" />
                    <span className="font-mono">src_js/</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <button 
                      onClick={() => {
                        setScriptBinding('rotate_mesh.js');
                        addAgentLog("Selected active script in container: rotate_mesh.js", "info");
                      }}
                      className={cn(
                        "w-full text-left flex items-center gap-2 text-[11px] py-1 px-2 rounded font-mono",
                        scriptBinding === 'rotate_mesh.js' ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'text-zinc-400 hover:bg-white/5'
                      )}
                    >
                      <Code className="w-3.5 h-3.5 text-[#00e5a0]" />
                      <span>rotate_mesh.js</span>
                    </button>
                    <button 
                      onClick={() => {
                        setScriptBinding('pulse_wireframe.js');
                        addAgentLog("Selected active script in container: pulse_wireframe.js", "info");
                      }}
                      className={cn(
                        "w-full text-left flex items-center gap-2 text-[11px] py-1 px-2 rounded font-mono",
                        scriptBinding === 'pulse_wireframe.js' ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'text-zinc-400 hover:bg-white/5'
                      )}
                    >
                      <Code className="w-3.5 h-3.5 text-zinc-400" />
                      <span>pulse_wireframe.js</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : leftTab === 'scenes' ? (
              <div className="space-y-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">REMOTE_SCENES_MANIFEST</span>
                <div className="space-y-1.5">
                  {scenesList.map(sc => (
                    <button 
                      key={sc}
                      onClick={() => {
                        setSelectedScene(sc);
                        addAgentLog(`Loaded remote scene coordinates for: ${sc}`, 'success');
                      }}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl border text-[11px] font-bold uppercase transition-all flex items-center justify-between",
                        selectedScene === sc ? 'bg-[#00d4ff]/5 border-[#00d4ff]/30 text-[#00d4ff]' : 'border-white/5 bg-transparent text-zinc-400 hover:border-white/10'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Map className="w-3.5 h-3.5" />
                        <span>{sc}</span>
                      </div>
                      {selectedScene === sc && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : leftTab === 'packages' ? (
              <div className="space-y-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">WASM_NPM_DEPENDENCIES</span>
                <div className="space-y-1.5">
                  {packagesList.map(pkg => (
                    <div key={pkg.name} className="p-2.5 bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-white font-mono">{pkg.name}</div>
                        <div className="text-[9px] text-zinc-500 font-mono mt-0.5">{pkg.version}</div>
                      </div>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest",
                        pkg.status === 'active' || pkg.status === 'hot' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                      )}>
                        {pkg.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">CONTAINER_EVENT_LOGGER</span>
                <div className="space-y-2 max-h-[400px] overflow-auto text-[10px] font-mono leading-relaxed text-zinc-400">
                  <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-lg">
                    [02:14:55] Handshake complete. Static server is listening on PORT 3000 inside pod container namespace.
                  </div>
                  <div className="p-2 bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/10 rounded-lg">
                    [02:14:56] Container virtual filesystem mount claim attached size 10GB.
                  </div>
                  <div className="p-2 bg-zinc-900 border border-white/5 rounded-lg text-zinc-500">
                    [02:14:58] Diagnostic metric telemetry active.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. CENTER AREA — 3D VIEWPORT */}
        <div ref={containerRef} className="flex-1 bg-black relative flex flex-col overflow-hidden min-w-0">
          
          {/* Main Renderer Canvas wrapper */}
          <div 
            className="flex-1 relative min-h-0 bg-[#090a0d] cursor-grab active:cursor-grabbing overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Top Right Floating HUD Status */}
            <div className="absolute top-4 right-4 bg-black/75 backdrop-blur border border-white/10 rounded-xl p-3 flex flex-col gap-1 z-10 font-mono text-[9px] text-[#cbd5e1] shadow-2xl">
              <div className="flex items-center gap-4 justify-between">
                <span className="text-zinc-500">FPS RATE:</span>
                <span className="text-emerald-400 font-bold">{fps} HZ</span>
              </div>
              <div className="flex items-center gap-4 justify-between">
                <span className="text-zinc-500">GPU CORE:</span>
                <span className="text-[#00d4ff] font-bold">{gpuLoad}% LOAD</span>
              </div>
              <div className="flex items-center gap-4 justify-between">
                <span className="text-zinc-500">DRIVER_TYPE:</span>
                <span className="text-zinc-300">WEBGL2_GPUDIRECT</span>
              </div>
            </div>

            {/* Top Left Viewport Tools (Gizmos and grid options) */}
            <div className="absolute top-4 left-4 flex flex-col gap-3 z-10 p-2 bg-black/60 border border-white/10 backdrop-blur rounded-xl select-none">
              
              {/* Gizmo selectors */}
              <div className="space-y-1">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1 text-center">gizmo</span>
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                  <button 
                    onClick={() => setGizmoMode('move')}
                    className={cn(
                      "p-1.5 rounded transition-colors text-xs font-bold uppercase cursor-pointer",
                      gizmoMode === 'move' ? 'bg-[#00d4ff] text-black' : 'text-zinc-400 hover:text-white'
                    )}
                    title="Translation Gizmo"
                  >
                    Move
                  </button>
                  <button 
                    onClick={() => setGizmoMode('rotate')}
                    className={cn(
                      "p-1.5 rounded transition-colors text-xs font-bold uppercase cursor-pointer",
                      gizmoMode === 'rotate' ? 'bg-[#00d4ff] text-black' : 'text-zinc-400 hover:text-white'
                    )}
                    title="Rotation Gizmo"
                  >
                    Rot
                  </button>
                  <button 
                    onClick={() => setGizmoMode('scale')}
                    className={cn(
                      "p-1.5 rounded transition-colors text-xs font-bold uppercase cursor-pointer",
                      gizmoMode === 'scale' ? 'bg-[#00d4ff] text-black' : 'text-zinc-400 hover:text-white'
                    )}
                    title="Scale Gizmo"
                  >
                    Scl
                  </button>
                </div>
              </div>

              {/* Grid / Frame toggle button layout */}
              <div className="space-y-1.5 border-t border-white/5 pt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="grid-toggle" 
                    checked={showGrid} 
                    onChange={e => setShowGrid(e.target.checked)} 
                    className="w-3 h-3 text-[#00d4ff] bg-zinc-800 border-zinc-700 rounded focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="grid-toggle" className="text-[9px] uppercase font-bold text-zinc-400 cursor-pointer">GRID_FLOOR</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="bbox-toggle" 
                    checked={showBoundingBoxes} 
                    onChange={e => setShowBoundingBoxes(e.target.checked)} 
                    className="w-3 h-3 text-[#00d4ff] bg-zinc-800 border-zinc-700 rounded focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="bbox-toggle" className="text-[9px] uppercase font-bold text-zinc-400 cursor-pointer">BOUND_FRAME</label>
                </div>
              </div>

              {/* Remote compilation engine selection shortcuts */}
              <div className="border-t border-white/5 pt-2 space-y-1">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block text-center">engine blueprint</span>
                <div className="grid grid-cols-3 gap-1">
                  {['three', 'babylon', 'playcanvas'].map(engine => (
                    <button 
                      key={engine}
                      onClick={() => {
                        setSelectedLaunchEngine(engine as any);
                        spinUpEnginePod(engine as any);
                        addAgentLog(`Provisioning container pod with ${engine.toUpperCase()} layout.`, 'info');
                      }}
                      className={cn(
                        "p-1 rounded text-[8px] font-bold uppercase text-center border transition-all cursor-pointer",
                        activeEngineId === engine ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff]/10' : 'border-white/5 text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      {engine === 'three' ? 'THREE' : engine === 'babylon' ? 'BABY' : 'PC'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Left Camera sliders inside viewport for space control */}
            <div className="absolute bottom-4 left-4 bg-black/85 border border-white/10 rounded-xl p-3 flex flex-col gap-2 z-10 w-44 font-mono shadow-xl">
              <span className="text-[8.5px] font-black text-zinc-400 uppercase tracking-widest">Wonderspace Cam viewport</span>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[8px] text-zinc-500">
                    <span>ROTATION (YAW)</span>
                    <span>{camYaw}°</span>
                  </div>
                  <input 
                    type="range" min="0" max="360" value={camYaw} onChange={e => setCamYaw(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 accent-[#00d4ff] rounded"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[8px] text-zinc-500">
                    <span>PERSPECTIVE ZOOM</span>
                    <span>{camZoom.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="2.0" step="0.1" value={camZoom} onChange={e => setCamZoom(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 accent-[#00d4ff] rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. RIGHT SIDEBAR — INSPECTOR */}
        <div className="w-80 bg-[#0c0d12] border-l border-[#1b1f28] flex flex-col shrink-0 overflow-auto p-4 space-y-5">
          
          {/* Header section */}
          <div>
            <span className="text-[9px] font-black text-zinc-500 tracking-widest uppercase block mb-1">Entity inspector</span>
            <input 
              type="text" 
              value={entityName} 
              onChange={e => setEntityName(e.target.value)}
              className="w-full bg-[#12151d] border border-white/5 rounded-lg p-2 text-xs text-white font-mono outline-none focus:border-[#00d4ff]"
            />
          </div>

          <hr className="border-[#1b1f28]" />

          {/* Transform Section */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#00d4ff]" />
              Transform parameters
            </span>
            
            {/* Translation sliders */}
            <div className="space-y-2.5 bg-[#0f1118] p-3 rounded-xl border border-white/5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Position coordinates</span>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                  <span>POS X (LATERAL)</span>
                  <span>{posX.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" min="-5" max="5" step="0.1" value={posX} onChange={e => setPosX(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 accent-[#00d4ff] rounded"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                  <span>POS Y (HEIGHT)</span>
                  <span>{posY.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" min="0" max="6" step="0.1" value={posY} onChange={e => setPosY(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 accent-[#00d4ff] rounded"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                  <span>POS Z (DEPTH)</span>
                  <span>{posZ.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" min="-12" max="-2" step="0.1" value={posZ} onChange={e => setPosZ(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 accent-[#00d4ff] rounded"
                />
              </div>
            </div>

            {/* Rotations */}
            <div className="space-y-2.5 bg-[#0f1118] p-3 rounded-xl border border-white/5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Rotation Angles</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] text-zinc-400 uppercase block mb-1">Pitch (X)</label>
                  <input 
                    type="number" value={rotX} onChange={e => setRotX(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-white/5 rounded p-1 text-[10px] text-zinc-300 font-mono text-center outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-zinc-400 uppercase block mb-1">Yaw (Y)</label>
                  <input 
                    type="number" value={rotY} onChange={e => setRotY(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-white/5 rounded p-1 text-[10px] text-zinc-300 font-mono text-center outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#1b1f28]" />

          {/* Material configurations */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-blue-400" />
              Material parameters
            </span>

            <div className="space-y-2">
              <span className="text-[9px] text-zinc-400 uppercase font-mono block">Albedo color multiplier</span>
              <div className="flex items-center gap-3 bg-[#12151d] p-2 rounded-lg border border-white/5">
                <input 
                  type="color" 
                  value={albedoColor} 
                  onChange={e => setAlbedoColor(e.target.value)}
                  className="bg-transparent border-none w-8 h-8 p-0 cursor-pointer"
                />
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#00d4ff]">{albedoColor.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                <span>METALLIC SPECULAR</span>
                <span>{(metallic * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05" value={metallic} onChange={e => setMetallic(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 accent-[#00d4ff] rounded"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                <span>SURFACE ROUGHNESS</span>
                <span>{(roughness * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05" value={roughness} onChange={e => setRoughness(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 accent-[#00d4ff] rounded"
              />
            </div>
          </div>

          <hr className="border-[#1b1f28]" />

          {/* Mesh Properties */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-white uppercase tracking-widest block">Mesh node properties</span>
            
            <div className="space-y-1">
              <span className="text-[8px] text-zinc-500 uppercase font-mono block mb-1">Geometry type</span>
              <div className="grid grid-cols-4 gap-1">
                {(['cube', 'sphere', 'torus', 'cylinder'] as const).map(geom => (
                  <button 
                    key={geom}
                    onClick={() => setGeometryType(geom)}
                    className={cn(
                      "py-1 rounded text-[8.5px] font-bold uppercase tracking-wider text-center border transition-all cursor-pointer",
                      geometryType === geom ? 'bg-[#00d4ff]/15 text-[#00d4ff] border-[#00d4ff]/30 font-black' : 'border-white/5 bg-transparent text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    {geom}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2">
              <span>WIREFRAME RENDER</span>
              <input 
                type="checkbox" 
                checked={wireframeMode} 
                onChange={e => setWireframeMode(e.target.checked)}
                className="w-4 h-4 rounded text-[#00d4ff] bg-zinc-800 border-zinc-700 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          <hr className="border-[#1b1f28]" />

          {/* Pod environment read-only constants */}
          <div className="space-y-3.5 bg-black/45 p-3.5 rounded-xl border border-white/5 font-mono">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block">Pod Environment specs</span>
            <div className="space-y-1.5 text-[8.5px] leading-relaxed text-zinc-500">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>GKE_NODE_ZONE</span>
                <span className="text-zinc-300">us-west2-a</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>GPU_COMPUTE_ACCEL</span>
                <span className="text-zinc-300">NVIDIA-A100-80G</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>STAGING_COMP_PORT</span>
                <span className="text-zinc-300">3000</span>
              </div>
              <div className="flex justify-between">
                <span>DEV_CONTAINER_SANDBOX</span>
                <span className="text-emerald-400">ACTIVE_TUNNEL</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 5. BOTTOM PANEL — TABS */}
      <div className="h-56 bg-[#0c0d12] border-t border-[#1b1f28] flex flex-col shrink-0 overflow-hidden">
        
        {/* Selection Bar */}
        <div className="h-9 bg-[#0d0f14] border-b border-[#1b1f28] flex items-center justify-between px-4 shrink-0">
          <div className="flex gap-2">
            <button 
              onClick={() => setBottomTab('terminal')}
              className={cn(
                "h-9 px-4 text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 border-b-2 hover:text-zinc-100 cursor-pointer",
                bottomTab === 'terminal' ? 'text-white border-[#00d4ff] bg-white/5 font-extrabold' : 'text-zinc-500 border-transparent'
              )}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              Container Terminal
            </button>
            <button 
              onClick={() => setBottomTab('build')}
              className={cn(
                "h-9 px-4 text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 border-b-2 hover:text-zinc-100 cursor-pointer",
                bottomTab === 'build' ? 'text-white border-[#00d4ff] bg-white/5' : 'text-zinc-500 border-transparent'
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              Build Output
            </button>
            <button 
              onClick={() => setBottomTab('podLogs')}
              className={cn(
                "h-9 px-4 text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 border-b-2 hover:text-zinc-100 cursor-pointer",
                bottomTab === 'podLogs' ? 'text-white border-[#00d4ff] bg-white/5' : 'text-zinc-500 border-transparent'
              )}
            >
              <Database className="w-3.5 h-3.5" />
              Pod Container Logs
            </button>
            <button 
              onClick={() => setBottomTab('aiAssistant')}
              className={cn(
                "h-9 px-4 text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 border-b-2 hover:text-zinc-100 cursor-pointer",
                bottomTab === 'aiAssistant' ? 'text-white border-[#00d4ff] bg-white/5' : 'text-zinc-500 border-transparent'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Helper Agent
            </button>
          </div>

          <span className="text-[10px] font-mono text-zinc-600 uppercase">KREATOR_POD_SHELL // danksmoker42001@gmail.com</span>
        </div>

        {/* Tab content view containers */}
        <div className="flex-1 overflow-auto p-3 bg-black/40 font-mono text-[11px] leading-relaxed text-zinc-300">
          
          {bottomTab === 'terminal' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex-1 overflow-auto space-y-1 scrollbar-thin select-text">
                {terminalLines.map((line, idx) => (
                  <div key={idx} className={cn(
                    line.startsWith('$') ? 'text-[#00d4ff]' : 
                    line.startsWith('✔') ? 'text-emerald-400' : 
                    line.startsWith('✖') ? 'text-red-400' : 'text-zinc-400'
                  )}>
                    {line}
                  </div>
                ))}
              </div>
              
              {/* input line */}
              <form onSubmit={handleTerminalSubmit} className="flex gap-2 border-t border-white/5 pt-2 mt-2 shrink-0">
                <span className="text-[#00d4ff] font-bold">$</span>
                <input 
                  type="text" 
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  placeholder="Type help for container tools, e.g. mesh cube"
                  className="flex-1 bg-transparent border-none outline-none text-[#f8fafc] text-[11px] font-mono focus:ring-0 placeholder:text-zinc-600"
                />
              </form>
            </div>
          )}

          {bottomTab === 'build' && (
            <div className="space-y-1 text-zinc-400">
              <span className="text-zinc-600 font-bold block mb-1">=== DEPLOY_SANDBOX_BUILD_OUTPUT ===</span>
              {buildLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-zinc-600">[{1000 + i * 2}]</span>
                  <span>{log}</span>
                </div>
              ))}
              <div className="text-emerald-400 mt-2 font-bold animate-pulse">● NPM Compiler Server listening passively on Port 3000.</div>
            </div>
          )}

          {bottomTab === 'podLogs' && (
            <div className="space-y-1 text-zinc-500">
              <span className="text-zinc-600 font-bold block mb-1">=== REVERSE_PROXY_POD_LOG_STREAMS ===</span>
              {podLogsStream.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
              <div className="text-[#00d4ff]/80 mt-1">✔ [KubeSystem] Virtual ingress port 3000 mapping finalized successfully. No errors detected.</div>
            </div>
          )}

          {bottomTab === 'aiAssistant' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex-1 overflow-auto bg-zinc-950/40 p-3 rounded-lg border border-white/5 flex items-start gap-2 max-h-[140px]">
                <Sparkles className="w-4 h-4 text-[#00d4ff] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase text-[#00d4ff] mb-1">AI Assistant Response</div>
                  <div className="text-slate-200 leading-relaxed leading-normal">{aiResponse}</div>
                </div>
              </div>

              <form onSubmit={handleAiAssistantSubmit} className="flex gap-2 mt-2 shrink-0 border-t border-white/5 pt-2">
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Ask agent: e.g. 'enable wireframe' or 'make color red'..."
                  className="flex-1 bg-transparent border-none outline-none text-[#f8fafc] text-[11px] font-mono focus:ring-0 placeholder:text-zinc-600"
                />
                <button type="submit" className="px-3 py-1 bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-extrabold uppercase rounded text-[9.5px]">
                  Submit
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
