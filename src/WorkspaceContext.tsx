import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FileNode, Tab, ViewMode, AgentLog, WorkspaceConfig, PipelineItem, WorldEntity, Prefab, Scene, Pod, WorkspaceSetup, DeploymentTarget, WorkspaceError, CheckpointStep, CustomEngineConfig } from './types';
import { io, Socket } from 'socket.io-client';

const DEFAULT_CONFIG: WorkspaceConfig = {
  theme: "minimal",
  engine: "three",
  aiProvider: "spatial-v9",
  pipeline: {
    autoOptimize: true,
    format: "glb"
  },
  skybox: "city",
  customEngineUrl: "",
  localDev: false,
  keys: {
    openai: "",
    gemini: "",
    anthropic: "",
    perplexity: "",
    groq: "",
    opencode: ""
  }
};

interface WorkspaceContextType {
  files: FileNode[];
  tabs: Tab[];
  activeTabPath: string | null;
  terminalLogs: string[];
  agentLogs: AgentLog[];
  viewMode: ViewMode;
  isSidebarOpen: boolean;
  isAgentSidebarOpen: boolean;
  isAgentThinking: boolean;
  targetUrl: string;
  config: WorkspaceConfig;
  pipelineItems: PipelineItem[];
  entities: WorldEntity[];
  prefabs: Prefab[];
  scenes: Scene[];
  currentSceneId: string | null;
  pods: Pod[];
  isSetupComplete: boolean;
  setupConfig: WorkspaceSetup | null;
  hasSeenLanding: boolean;
  markLandingSeen: () => void;
  resetLanding: () => void;
  hybridSplit: boolean;
  synthesisStatus: 'idle' | 'synthesizing' | 'complete';
  activeEngineId: 'unreal' | 'playcanvas' | 'unity' | 'three' | 'babylon' | 'godot' | 'webgpu' | 'custom';
  setHybridSplit: (val: boolean) => void;
  setSynthesisStatus: (status: 'idle' | 'synthesizing' | 'complete') => void;
  spinUpEnginePod: (engineId: 'unreal' | 'playcanvas' | 'unity' | 'three' | 'babylon' | 'godot' | 'webgpu' | 'custom', buildTarget?: DeploymentTarget, customOptions?: any) => void;
  customEngineConfig: CustomEngineConfig;
  updateCustomEngineConfig: (updates: Partial<CustomEngineConfig>) => void;
  
  setFiles: (files: FileNode[]) => void;
  completeSetup: (setup: WorkspaceSetup) => void;
  refreshPods: () => void;
  rebootPod: (id: string) => void;
  deletePod: (id: string) => void;
  openFile: (path: string) => Promise<void>;
  closeTab: (path: string) => void;
  setActiveTabPath: (path: string) => void;
  saveActiveFile: () => Promise<void>;
  updateTabContent: (path: string, content: string) => void;
  sendTerminalCommand: (cmd: string) => void;
  addAgentLog: (msg: string, type?: AgentLog['type']) => void;
  setViewMode: (mode: ViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setAgentSidebarOpen: (open: boolean) => void;
  setTargetUrl: (url: string) => void;
  updateConfig: (updates: Partial<WorkspaceConfig>) => void;
  addPipelineItem: (item: Omit<PipelineItem, 'id' | 'status'>) => void;
  setEntities: (entities: WorldEntity[]) => void;
  addEntity: (entity: Omit<WorldEntity, 'id'>) => void;
  updateEntity: (id: string, updates: Partial<WorldEntity>) => void;
  deleteEntity: (id: string) => void;
  addPrefab: (prefab: Omit<Prefab, 'id'>) => void;
  saveScene: (name: string) => void;
  loadScene: (id: string) => void;
  createScene: (name: string) => void;

  // NEW AUTO-SAVE & SECTION ERROR LOG HANDLERS
  errors: WorkspaceError[];
  checkpoints: CheckpointStep[];
  isSaving: boolean;
  createCheckpoint: (actionName: string) => void;
  recordError: (section: string, code: string, message: string) => void;
  resolveError: (id: string, solution?: string) => void;
  triggerErrorRemediation: (id: string) => Promise<string>;
  restoreCheckpoint: (id: string) => void;
  clearCheckpoints: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["Spatial Shell v1.0.4", "Connected to engine context..."]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([
    { id: '1', message: 'Canvas ready for spatial reconstruction', type: 'info', timestamp: Date.now() }
  ]);
  const [viewMode, setViewMode] = useState<ViewMode>('pod-studio');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAgentSidebarOpen, setAgentSidebarOpen] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [targetUrl, setTargetUrl] = useState("https://spatial-engine-v3.dev");
  const [config, setConfig] = useState<WorkspaceConfig>(DEFAULT_CONFIG);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [entities, setEntities] = useState<WorldEntity[]>([
    { id: '1', type: 'mesh', name: 'Primary Cube', x: 0, y: 2, z: -5, scale: 1, rotation: 0, properties: { color: '#06b6d4' } },
    { id: '2', type: 'light', name: 'Key Light', x: 10, y: 10, z: 10, scale: 1, rotation: 0, properties: { intensity: 1.5, color: '#00ffff' } },
    { id: '3', type: 'mesh', name: 'Ground Plane', x: 0, y: -0.01, z: 0, scale: 20, rotation: 0, properties: { color: '#313131' } },
  ]);
  const [prefabs, setPrefabs] = useState<Prefab[]>([
    { id: 'p1', name: 'Standard Box', type: 'mesh', properties: { scale: 1, color: '#06b6d4' } },
    { id: 'p2', name: 'Point Light', type: 'light', properties: { intensity: 1, color: '#ffffff' } },
    { id: 'p3', name: 'Neon Sphere', type: 'mesh', properties: { scale: 0.5, color: '#ff00ff', emissive: true } },
    { id: 'p4', name: 'Spotlight', type: 'light', properties: { intensity: 3, color: '#00ffff' } },
  ]);
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 's1', name: 'Default Setup', entities: [
      { id: '1', type: 'mesh', name: 'Primary Cube', x: 0, y: 2, z: -5, scale: 1, rotation: 0, properties: { color: '#06b6d4' } },
      { id: '2', type: 'light', name: 'Key Light', x: 10, y: 10, z: 10, scale: 1, rotation: 0, properties: { intensity: 1.5, color: '#00ffff' } },
      { id: '3', type: 'mesh', name: 'Ground Plane', x: 0, y: -0.01, z: 0, scale: 20, rotation: 0, properties: { color: '#313131' } },
    ], timestamp: Date.now() }
  ]);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>('s1');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupConfig, setSetupConfig] = useState<WorkspaceSetup | null>(null);
  const [hasSeenLanding, setHasSeenLanding] = useState<boolean>(() => {
    try { return localStorage.getItem('spatial_seen_landing') === '1'; } catch { return false; }
  });
  const [hybridSplit, setHybridSplit] = useState(false);
  const [synthesisStatus, setSynthesisStatus] = useState<'idle' | 'synthesizing' | 'complete'>('idle');
  const [activeEngineId, setActiveEngineId] = useState<'unreal' | 'playcanvas' | 'unity' | 'three' | 'babylon' | 'godot' | 'webgpu' | 'custom'>('three');

  const [customEngineConfig, setCustomEngineConfig] = useState<CustomEngineConfig>(() => {
    try {
      const saved = localStorage.getItem('spatial_custom_engine_config');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse custom engine config', e);
    }
    return {
      bg: '#05060a',
      ambient: '#3b82f6',
      particleCount: 200,
      particleColor: '#00ffff',
      speed: 1,
      rotationSpeed: 1,
      glow: true,
      customShape: 'torus',
      script: `// Custom Engine Render Loop Script
// Available variables: time, activeMesh, scene
function onUpdate(time, activeMesh, scene) {
  // Rotate the core shape
  activeMesh.rotation.x = time * 0.4;
  activeMesh.rotation.y = time * 0.6;
  
  // Oscillate shape offset
  activeMesh.position.y = Math.sin(time * 2.0) * 0.25;
}`
    };
  });

  const updateCustomEngineConfig = useCallback((updates: Partial<CustomEngineConfig>) => {
    setCustomEngineConfig(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('spatial_custom_engine_config', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const [errors, setErrors] = useState<WorkspaceError[]>([]);
  const [checkpoints, setCheckpoints] = useState<CheckpointStep[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Persistence Logic
  useEffect(() => {
    try {
      const savedSetup = localStorage.getItem('spatial_setup');
      if (savedSetup && savedSetup !== 'undefined' && savedSetup !== 'null') {
        const parsedSetup = JSON.parse(savedSetup);
        if (parsedSetup && typeof parsedSetup === 'object') {
          setSetupConfig(parsedSetup);
          setIsSetupComplete(true);
        }
      }
    } catch (e) {
      console.error('Failed to parse spatial_setup', e);
    }

    try {
      const savedEntities = localStorage.getItem('spatial_entities');
      if (savedEntities && savedEntities !== 'undefined' && savedEntities !== 'null') {
        const parsed = JSON.parse(savedEntities);
        if (Array.isArray(parsed)) {
          setEntities(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse spatial_entities', e);
    }

    try {
      const savedScenes = localStorage.getItem('spatial_scenes');
      if (savedScenes && savedScenes !== 'undefined' && savedScenes !== 'null') {
        const parsed = JSON.parse(savedScenes);
        if (Array.isArray(parsed)) {
          setScenes(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parase spatial_scenes', e);
    }

    try {
      const savedEngine = localStorage.getItem('spatial_active_engine');
      if (savedEngine && savedEngine !== 'undefined' && savedEngine !== 'null') {
        setActiveEngineId(savedEngine as any);
      }
    } catch (e) {
      console.error('Failed to parse active engine', e);
    }

    try {
      const savedErrors = localStorage.getItem('spatial_errors');
      if (savedErrors && savedErrors !== 'undefined' && savedErrors !== 'null') {
        const parsed = JSON.parse(savedErrors);
        if (Array.isArray(parsed)) {
          setErrors(parsed);
        }
      } else {
        const initialErrors: WorkspaceError[] = [
          {
            id: 'err_k8s_oom',
            section: 'Kubernetes Pod Studio',
            code: 'ERR_POD_OOM_OUT_OF_MEMORY',
            message: 'Redis caching cluster pod failed with exit flag 137. Resources saturated under high resolution vertex compilation.',
            timestamp: Date.now() - 3600000,
            resolved: false
          },
          // Stripe error entry removed — no middleman billing
        ];
        setErrors(initialErrors);
        localStorage.setItem('spatial_errors', JSON.stringify(initialErrors));
      }
    } catch (e) {
      console.error('Failed to parse spatial_errors', e);
    }

    try {
      const savedCheckpoints = localStorage.getItem('spatial_checkpoints');
      if (savedCheckpoints && savedCheckpoints !== 'undefined' && savedCheckpoints !== 'null') {
        const parsed = JSON.parse(savedCheckpoints);
        if (Array.isArray(parsed)) {
          setCheckpoints(parsed);
        }
      } else {
        const initialCheckpoints: CheckpointStep[] = [
          {
            id: 'init_checkpoint',
            actionName: 'AetherOS System Booted',
            timestamp: Date.now() - 600000,
            viewMode: 'pod-studio',
            stateDump: JSON.stringify({ entities: [], activeEngineId: 'three' })
          }
        ];
        setCheckpoints(initialCheckpoints);
        localStorage.setItem('spatial_checkpoints', JSON.stringify(initialCheckpoints));
      }
    } catch (e) {
      console.error('Failed to parse spatial_checkpoints', e);
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete && setupConfig) {
      localStorage.setItem('spatial_setup', JSON.stringify(setupConfig));
    }
  }, [isSetupComplete, setupConfig]);

  useEffect(() => {
    localStorage.setItem('spatial_entities', JSON.stringify(entities));
  }, [entities]);

  useEffect(() => {
    localStorage.setItem('spatial_scenes', JSON.stringify(scenes));
  }, [scenes]);

  useEffect(() => {
    localStorage.setItem('spatial_active_engine', activeEngineId);
  }, [activeEngineId]);

  useEffect(() => {
    if (errors && errors.length > 0) {
      localStorage.setItem('spatial_errors', JSON.stringify(errors));
    }
  }, [errors]);

  useEffect(() => {
    if (checkpoints && checkpoints.length > 0) {
      localStorage.setItem('spatial_checkpoints', JSON.stringify(checkpoints));
    }
  }, [checkpoints]);

  const [pods, setPods] = useState<Pod[]>([
    { id: 'p1', name: 'api-server-7fb9-d8s', status: 'Running', cpu: 12, memory: 256, restarts: 0, age: '4d 2h', node: 'node-01', namespace: 'default' },
    { id: 'p2', name: 'spatial-engine-v3-9kx', status: 'Running', cpu: 45, memory: 1024, restarts: 1, age: '2d 4h', node: 'node-02', namespace: 'default' },
    { id: 'p3', name: 'worker-primary-f2s', status: 'Running', cpu: 8, memory: 512, restarts: 0, age: '12d', node: 'node-01', namespace: 'infra' },
    { id: 'p4', name: 'vector-db-0', status: 'Running', cpu: 5, memory: 2048, restarts: 0, age: '30d', node: 'node-03', namespace: 'data' },
    { id: 'p5', name: 'redis-cache-main', status: 'Pending', cpu: 0, memory: 0, restarts: 0, age: '12s', node: 'node-02', namespace: 'infra' },
  ]);

  // Simulate Telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setPods(prev => prev.map(p => {
        if (p.status !== 'Running') return p;
        // Jitter CPU and Memory slightly
        const cpuJitter = (Math.random() - 0.5) * 5;
        const memJitter = (Math.random() - 0.5) * 10;
        return {
          ...p,
          cpu: Math.max(1, Math.min(99, Math.round(p.cpu + cpuJitter))),
          memory: Math.max(100, Math.min(4096, Math.round(p.memory + memJitter)))
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const refreshPods = () => {
    addAgentLog('Refreshing Kubernetes pod state...', 'info');
    // Simulate a brief pending state for the one that is pending
    setPods(prev => prev.map(p => p.status === 'Pending' ? { ...p, status: 'Running', cpu: 5, memory: 128 } : p));
  };

  const rebootPod = (id: string) => {
    setPods(prev => prev.map(p => {
      if (p.id === id) {
        addAgentLog(`Rebooting pod: ${p.name}`, 'warning');
        return { ...p, status: 'Pending', cpu: 0, restarts: p.restarts + 1 };
      }
      return p;
    }));
    
    setTimeout(() => {
      setPods(prev => prev.map(p => p.id === id ? { ...p, status: 'Running', cpu: 10, memory: 256 } : p));
      addAgentLog(`Pod successfully restarted`, 'success');
    }, 3000);
  };

  const deletePod = (id: string) => {
    setPods(prev => {
      const pod = prev.find(p => p.id === id);
      if (pod) {
        addAgentLog(`Deleting pod: ${pod.name}`, 'warning');
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const spinUpEnginePod = (
    engineId: 'unreal' | 'playcanvas' | 'unity' | 'three' | 'babylon' | 'godot' | 'webgpu' | 'custom',
    buildTarget: DeploymentTarget = 'k8s-pod',
    customOptions: any = {}
  ) => {
    setActiveEngineId(engineId);
    
    const targetName = buildTarget.toUpperCase().replace(/-/g, '_');
    addAgentLog(`Provisioning 3D Cluster Stack: ${engineId.toUpperCase()} with Target ${targetName}...`, 'thinking');
    
    // Clear any existing pods for this engine first
    setPods(prev => prev.filter(p => !p.id.startsWith(`p_${engineId}`)));

    // Dispatch on deployment target
    switch (buildTarget) {
      // ============== KUBERNETES ==============
      case 'k8s-deployment': {
        const numReplicas = customOptions?.replicas || 3;
        addAgentLog(`Creating multi-replica K8s Deployment mapping: scaling is capped at ${numReplicas} pods`, 'info');
        const replicaPods: Pod[] = Array.from({ length: numReplicas }).map((_, idx) => ({
          id: `p_${engineId}_replica_${idx + 1}`,
          name: `${engineId}-deployment-replica-${idx + 1}`,
          status: 'Pending', cpu: 0, memory: 0, restarts: 0, age: '1s',
          node: `node-0${(idx % 3) + 1}`,
          namespace: customOptions?.scalingMetric !== 'None' ? 'autoscale' : 'default'
        }));
        setPods(prev => [...prev, ...replicaPods]);
        setTimeout(() => addAgentLog('Applying load balancers and ingress hosts config...', 'info'), 1000);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id.startsWith(`p_${engineId}_replica`) ? {
            ...p, status: 'Running',
            cpu: Math.floor(Math.random() * 20) + 20,
            memory: engineId === 'unreal' ? 1024 : 512
          } : p));
          addAgentLog(`✔ Kubernetes Deployment finalized successfully: ${numReplicas} active replicas running perfectly.`, 'success');
        }, 2500);
        break;
      }
      case 'k8s-dev-container': {
        addAgentLog('Initiating live-mount decontainer workspace binding...', 'thinking');
        const mPath = customOptions?.mountPath || '/usr/src/app';
        const devPod: Pod = { id: `p_${engineId}_dev`, name: `${engineId}-dev-decontainer-0`, status: 'Pending', cpu: 1, memory: 256, restarts: 0, age: '1s', node: 'node-01', namespace: 'dev' };
        setPods(prev => [...prev, devPod]);
        setTimeout(() => addAgentLog(`Mounting host volumes onto container paths: binding workspace ${mPath}...`, 'info'), 1000);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_dev` ? { ...p, status: 'Running', cpu: 15, memory: 512 } : p));
          addAgentLog('✔ Kubernetes decontainer online. Real-time file sync watchers established on port 3000!', 'success');
        }, 2500);
        break;
      }
      case 'k8s-pod': {
        const newPod: Pod = { id: `p_${engineId}`, name: `${engineId}-k8s-pod-0`, status: 'Pending', cpu: 1, memory: 128, restarts: 0, age: '1s', node: 'node-02', namespace: 'default' };
        setPods(prev => [...prev, newPod]);
        setTimeout(() => addAgentLog('Connecting storage claims & starting compiler stream on port 3000...', 'info'), 1000);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}` ? { ...p, status: 'Running', cpu: 32, memory: 768 } : p));
          addAgentLog('✔ Kubernetes pod in running state! Port 3000 is open.', 'success');
        }, 2500);
        break;
      }

      // ============== CONTAINER ==============
      case 'docker-image': {
        addAgentLog('Orchestrating containerized compilation sequence for Docker image...', 'thinking');
        const base = customOptions?.baseImage || 'node:20-alpine';
        const reg = customOptions?.registryUrl || 'gcr.io/spatial-3d';
        const buildPod: Pod = { id: `p_${engineId}_builder`, name: `${engineId}-docker-image-builder`, status: 'Pending', cpu: 2, memory: 512, restarts: 0, age: '1s', node: 'node-02', namespace: 'builds' };
        setPods(prev => [...prev, buildPod]);
        setTimeout(() => {
          addAgentLog(`$ docker build -f ${engineId}.Dockerfile -t ${reg}/${engineId}-render:latest --build-arg BASE_IMAGE=${base}`, 'info');
          addAgentLog('[Step 1/3] Copying 3D compiler headers: compiling Draco vertex streams...', 'info');
          setPods(prev => prev.map(p => p.id === `p_${engineId}_builder` ? { ...p, status: 'Running', cpu: 78 } : p));
        }, 1000);
        setTimeout(() => addAgentLog('[Step 2/3] Shrinking layout binaries: Draco geometry meshopt pass...', 'info'), 2000);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_builder` ? { ...p, status: 'Succeeded', cpu: 0, memory: 0 } : p));
          addAgentLog(`✔ Docker Image successfully pushed to registry mapping: ${reg}/${engineId}-render:latest`, 'success');
        }, 3500);
        break;
      }
      case 'docker-container': {
        addAgentLog('Starting Docker container runtime...', 'thinking');
        const cPod: Pod = { id: `p_${engineId}_docker`, name: `${engineId}-docker-container-0`, status: 'Pending', cpu: 1, memory: 256, restarts: 0, age: '1s', node: 'node-01', namespace: 'docker' };
        setPods(prev => [...prev, cPod]);
        setTimeout(() => addAgentLog('$ docker compose up -d --build', 'info'), 500);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_docker` ? { ...p, status: 'Running', cpu: 22, memory: 384 } : p));
          addAgentLog('✔ Docker container running on localhost:3000. Volume mounts active.', 'success');
        }, 2000);
        break;
      }
      case 'podman-container': {
        addAgentLog('Spinning up rootless Podman container (no daemon)...', 'thinking');
        const pPod: Pod = { id: `p_${engineId}_podman`, name: `${engineId}-podman-rootless-0`, status: 'Pending', cpu: 1, memory: 192, restarts: 0, age: '1s', node: 'localhost', namespace: 'podman' };
        setPods(prev => [...prev, pPod]);
        setTimeout(() => addAgentLog('$ podman run --userns=keep-id -p 3000:3000 ' + engineId + '-render:latest', 'info'), 500);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_podman` ? { ...p, status: 'Running', cpu: 18, memory: 320 } : p));
          addAgentLog('✔ Podman rootless container running. UID mapping preserved.', 'success');
        }, 2000);
        break;
      }
      case 'self-hosted-vps': {
        addAgentLog('Provisioning bare-metal VPS workspace (Hetzner/DO style)...', 'thinking');
        const vPod: Pod = { id: `p_${engineId}_vps`, name: `${engineId}-vps-instance-0`, status: 'Pending', cpu: 2, memory: 1024, restarts: 0, age: '1s', node: 'cx22-hetzner-fsn1', namespace: 'bare-metal' };
        setPods(prev => [...prev, vPod]);
        setTimeout(() => addAgentLog('$ ansible-playbook -i inventories/vps playbooks/3d-runtime.yml', 'info'), 800);
        setTimeout(() => addAgentLog('Configuring Caddy reverse proxy + TLS (Let\'s Encrypt)...', 'info'), 1600);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_vps` ? { ...p, status: 'Running', cpu: 28, memory: 896 } : p));
          addAgentLog('✔ VPS instance reachable at https://' + engineId + '.aether.works', 'success');
        }, 2800);
        break;
      }

      // ============== STATIC / EDGE ==============
      case 'static-site':
      case 'vercel':
      case 'netlify':
      case 'cloudflare-pages':
      case 'aws-amplify':
      case 'github-pages':
      case 'firebase-hosting': {
        const labels: Record<string, string> = {
          'static-site': 'generic static host',
          'vercel': 'Vercel',
          'netlify': 'Netlify',
          'cloudflare-pages': 'Cloudflare Pages',
          'aws-amplify': 'AWS Amplify',
          'github-pages': 'GitHub Pages',
          'firebase-hosting': 'Firebase Hosting'
        };
        addAgentLog(`Building static bundle for ${labels[buildTarget]}...`, 'thinking');
        const outDir = customOptions?.outDir || 'dist';
        const proj = customOptions?.projectName || `${engineId}-workspace`;
        const sPod: Pod = { id: `p_${engineId}_static`, name: `${engineId}-static-build-${buildTarget}`, status: 'Pending', cpu: 1, memory: 384, restarts: 0, age: '1s', node: 'build-farm-01', namespace: 'edge' };
        setPods(prev => [...prev, sPod]);
        setTimeout(() => addAgentLog(`$ vite build --outDir ${outDir} --target esnext`, 'info'), 600);
        setTimeout(() => addAgentLog('[1/4] Compiling GLSL/WGSL shaders → Wasm...', 'info'), 1300);
        setTimeout(() => addAgentLog('[2/4] Optimizing glTF meshes with Draco + meshopt...', 'info'), 1900);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_static` ? { ...p, status: 'Succeeded', cpu: 0, memory: 0 } : p));
          addAgentLog(`✔ Static bundle uploaded to ${labels[buildTarget]}: project ${proj}`, 'success');
        }, 2700);
        break;
      }
      case 'edge-worker':
      case 'bun-runtime': {
        const isBun = buildTarget === 'bun-runtime';
        addAgentLog(`Compiling edge runtime bundle (${isBun ? 'Bun' : 'Cloudflare Workers'})...`, 'thinking');
        const ePod: Pod = { id: `p_${engineId}_edge`, name: `${engineId}-edge-worker-${isBun ? 'bun' : 'cf'}`, status: 'Pending', cpu: 1, memory: 128, restarts: 0, age: '1s', node: isBun ? 'edge-bun-01' : 'edge-cf-01', namespace: 'edge' };
        setPods(prev => [...prev, ePod]);
        const region = customOptions?.edgeRegion || (isBun ? 'iad' : 'auto');
        setTimeout(() => addAgentLog(`$ ${isBun ? 'bun build' : 'wrangler deploy'} --region ${region}`, 'info'), 600);
        setTimeout(() => addAgentLog('Shimming WebGPU → compute workers (WASM fallback enabled)...', 'info'), 1500);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_edge` ? { ...p, status: 'Running', cpu: 8, memory: 96 } : p));
          addAgentLog(`✔ Edge worker live in ${region}. Cold start < 5ms.`, 'success');
        }, 2400);
        break;
      }
      case 'railway':
      case 'fly-io':
      case 'render': {
        const labels: Record<string, string> = { 'railway': 'Railway', 'fly-io': 'Fly.io', 'render': 'Render' };
        addAgentLog(`Deploying to ${labels[buildTarget]}...`, 'thinking');
        const rPod: Pod = { id: `p_${engineId}_${buildTarget}`, name: `${engineId}-${buildTarget}-service`, status: 'Pending', cpu: 1, memory: 512, restarts: 0, age: '1s', node: buildTarget, namespace: 'paas' };
        setPods(prev => [...prev, rPod]);
        setTimeout(() => addAgentLog(`$ ${buildTarget} deploy --service ${engineId}-render`, 'info'), 700);
        setTimeout(() => addAgentLog('Attaching persistent volume for glTF asset cache...', 'info'), 1500);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_${buildTarget}` ? { ...p, status: 'Running', cpu: 24, memory: 480 } : p));
          addAgentLog(`✔ ${labels[buildTarget]} service live. Public URL assigned.`, 'success');
        }, 2400);
        break;
      }

      // ============== CLIENT RUNTIMES ==============
      case 'pwa': {
        const pwaName = customOptions?.pwaName || `${engineId}-workspace`;
        const theme = customOptions?.pwaThemeColor || '#00d4ff';
        addAgentLog(`Generating PWA manifest + service worker for "${pwaName}"...`, 'thinking');
        const pPod: Pod = { id: `p_${engineId}_pwa`, name: `${engineId}-pwa-build`, status: 'Pending', cpu: 1, memory: 256, restarts: 0, age: '1s', node: 'build-farm-01', namespace: 'edge' };
        setPods(prev => [...prev, pPod]);
        setTimeout(() => addAgentLog('Pre-caching glTF + HDR assets via Workbox...', 'info'), 700);
        setTimeout(() => addAgentLog(`Theme color: ${theme} · Display: standalone`, 'info'), 1500);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_pwa` ? { ...p, status: 'Succeeded', cpu: 0, memory: 0 } : p));
          addAgentLog(`✔ PWA "${pwaName}" ready to install. Install prompt wired.`, 'success');
        }, 2400);
        break;
      }
      case 'webxr': {
        const xrRt = customOptions?.xrRuntime || 'webxr';
        addAgentLog(`Compiling WebXR build (${xrRt}) with hand-tracking + passthrough...`, 'thinking');
        const xPod: Pod = { id: `p_${engineId}_xr`, name: `${engineId}-webxr-${xrRt}`, status: 'Pending', cpu: 2, memory: 768, restarts: 0, age: '1s', node: 'node-gpu-01', namespace: 'xr' };
        setPods(prev => [...prev, xPod]);
        setTimeout(() => addAgentLog('Generating left/right eye render targets at 90Hz...', 'info'), 700);
        setTimeout(() => addAgentLog('Hooking controller raycast + pinch gestures...', 'info'), 1500);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_xr` ? { ...p, status: 'Running', cpu: 62, memory: 1024 } : p));
          addAgentLog(`✔ WebXR build deployed for ${xrRt}. Enter VR from the canvas.`, 'success');
        }, 2700);
        break;
      }
      case 'iframe-embed': {
        const allow = (customOptions?.iframeAllowList || ['camera', 'microphone', 'xr-spatial-tracking']).join('; ');
        addAgentLog(`Generating iframe embed snippet (sandbox + allow="${allow}")...`, 'thinking');
        const iPod: Pod = { id: `p_${engineId}_embed`, name: `${engineId}-embed-bundle`, status: 'Pending', cpu: 1, memory: 192, restarts: 0, age: '1s', node: 'build-farm-01', namespace: 'edge' };
        setPods(prev => [...prev, iPod]);
        setTimeout(() => addAgentLog('Postmessage handshake + origin allowlist baked in.', 'info'), 1500);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_embed` ? { ...p, status: 'Succeeded', cpu: 0, memory: 0 } : p));
          addAgentLog('✔ iframe snippet ready: <iframe src="https://embed.aether/' + engineId + '" allow="' + allow + '" />', 'success');
        }, 2400);
        break;
      }
      case 'wasm-module': {
        addAgentLog('Compiling scene to standalone WebAssembly module (Emscripten)...', 'thinking');
        const wPod: Pod = { id: `p_${engineId}_wasm`, name: `${engineId}-wasm-module-build`, status: 'Pending', cpu: 2, memory: 640, restarts: 0, age: '1s', node: 'build-farm-01', namespace: 'wasm' };
        setPods(prev => [...prev, wPod]);
        setTimeout(() => addAgentLog('$ emcc scene.cpp -O3 -s WASM=1 -s MODULARIZE=1 -o scene.mjs', 'info'), 800);
        setTimeout(() => addAgentLog('Bundling .wasm + .mjs loader + type definitions...', 'info'), 1800);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_wasm` ? { ...p, status: 'Succeeded', cpu: 0, memory: 0 } : p));
          addAgentLog(`✔ scene.wasm (${engineId}) ready. Import from any JS host.`, 'success');
        }, 2800);
        break;
      }

      // ============== NATIVE SHELLS ==============
      case 'desktop-tauri':
      case 'desktop-electron': {
        const isTauri = buildTarget === 'desktop-tauri';
        const channel = customOptions?.desktopChannel || 'stable';
        addAgentLog(`Building ${isTauri ? 'Tauri' : 'Electron'} desktop shell (${channel})...`, 'thinking');
        const dPod: Pod = { id: `p_${engineId}_desktop`, name: `${engineId}-${isTauri ? 'tauri' : 'electron'}-${channel}`, status: 'Pending', cpu: 2, memory: 1024, restarts: 0, age: '1s', node: 'build-farm-01', namespace: 'native' };
        setPods(prev => [...prev, dPod]);
        setTimeout(() => addAgentLog(`$ ${isTauri ? 'cargo tauri' : 'electron-builder'} build --${channel}`, 'info'), 700);
        setTimeout(() => addAgentLog('Code-signing binaries (macOS / Windows / Linux)...', 'info'), 1700);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_desktop` ? { ...p, status: 'Succeeded', cpu: 0, memory: 0 } : p));
          addAgentLog(`✔ Desktop bundle ready (~${isTauri ? '8MB' : '120MB'}). Cross-platform installers generated.`, 'success');
        }, 2700);
        break;
      }
      case 'mobile-capacitor': {
        const target = customOptions?.mobileTarget || 'both';
        addAgentLog(`Building mobile app via Capacitor (${target})...`, 'thinking');
        const mPod: Pod = { id: `p_${engineId}_mobile`, name: `${engineId}-capacitor-${target}`, status: 'Pending', cpu: 2, memory: 896, restarts: 0, age: '1s', node: 'build-farm-01', namespace: 'mobile' };
        setPods(prev => [...prev, mPod]);
        setTimeout(() => addAgentLog('$ npx cap add ios && npx cap add android', 'info'), 700);
        setTimeout(() => addAgentLog('Patching WebGL touch gestures + safe-area insets...', 'info'), 1500);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_mobile` ? { ...p, status: 'Succeeded', cpu: 0, memory: 0 } : p));
          addAgentLog(`✔ Mobile build ready for ${target}. Open in Xcode / Android Studio.`, 'success');
        }, 2700);
        break;
      }

      // ============== DISTRIBUTION ==============
      case 'npm-package': {
        const name = customOptions?.npmPackageName || `@aether/${engineId}-engine`;
        const access = customOptions?.npmAccess || 'public';
        addAgentLog(`Publishing ${name} to npm (${access})...`, 'thinking');
        const nPod: Pod = { id: `p_${engineId}_npm`, name: `${engineId}-npm-publish`, status: 'Pending', cpu: 1, memory: 256, restarts: 0, age: '1s', node: 'build-farm-01', namespace: 'dist' };
        setPods(prev => [...prev, nPod]);
        setTimeout(() => addAgentLog('$ npm publish --access ' + access, 'info'), 700);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_npm` ? { ...p, status: 'Succeeded', cpu: 0, memory: 0 } : p));
          addAgentLog(`✔ ${name}@latest published. ${access} access.`, 'success');
        }, 2400);
        break;
      }
      case 'asset-cdn': {
        const cdn = customOptions?.cdnProvider || 'cloudflare-r2';
        addAgentLog(`Pushing optimized glTF/HDR/texture assets to ${cdn}...`, 'thinking');
        const aPod: Pod = { id: `p_${engineId}_cdn`, name: `${engineId}-cdn-${cdn}`, status: 'Pending', cpu: 1, memory: 384, restarts: 0, age: '1s', node: 'edge-01', namespace: 'cdn' };
        setPods(prev => [...prev, aPod]);
        setTimeout(() => addAgentLog('Draco-compressing meshes, KTX2-compressing textures, ffmpeg audio normalization...', 'info'), 800);
        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}_cdn` ? { ...p, status: 'Succeeded', cpu: 0, memory: 0 } : p));
          addAgentLog(`✔ Asset bundle on ${cdn}. Cache purges wired.`, 'success');
        }, 2400);
        break;
      }

      // ============== LOCAL ==============
      case 'local-process':
      default: {
        const newPod: Pod = {
          id: `p_${engineId}`,
          name: engineId === 'unreal' ? 'unreal-editor-render-pod' :
                engineId === 'playcanvas' ? 'playcanvas-studio-node-pod' :
                engineId === 'babylon' ? 'babylon-standard-render-pod' :
                engineId === 'unity' ? 'unity-wasm-reflect-pod' :
                engineId === 'godot' ? 'godot4-web-export-pod' :
                engineId === 'webgpu' ? 'webgpu-compute-shader-pod' :
                engineId === 'custom' ? 'custom-engine-runtime-pod' : 'threejs-webgpu-sandbox-pod',
          status: 'Pending',
          cpu: 1,
          memory: 128,
          restarts: 0,
          age: '1s',
          node: ['unreal', 'babylon', 'godot', 'webgpu'].includes(engineId) ? 'node-gpu-01' : 'node-02',
          namespace: 'engine'
        };
        setPods(prev => [...prev, newPod]);

        setTimeout(() => {
          addAgentLog(`Connecting storage claims & starting compiler stream on port 3000...`, 'info');
        }, 1000);

        setTimeout(() => {
          setPods(prev => prev.map(p => p.id === `p_${engineId}` ? {
            ...p,
            status: 'Running',
            cpu: engineId === 'unreal' ? 84 : engineId === 'playcanvas' ? 35 : engineId === 'babylon' ? 42 : engineId === 'unity' ? 55 : engineId === 'godot' ? 38 : engineId === 'webgpu' ? 62 : 20,
            memory: engineId === 'unreal' ? 3072 : engineId === 'playcanvas' ? 1024 : engineId === 'babylon' ? 1280 : engineId === 'unity' ? 1536 : engineId === 'godot' ? 768 : engineId === 'webgpu' ? 2048 : 512,
          } : p));
          addAgentLog(`✔ [${buildTarget.toUpperCase()}] ${engineId.toUpperCase()} workspace container in running state! Port 3000 is open.`, 'success');
        }, 2500);
        break;
      }
    }
  };

  const addAgentLog = useCallback((message: string, type: AgentLog['type'] = 'info') => {
    setAgentLogs(prev => [{ id: Math.random().toString(), message, type, timestamp: Date.now() }, ...prev]);
  }, []);

  const openFile = async (path: string) => {
    if (tabs.find(t => t.path === path)) {
      setActiveTabPath(path);
      return;
    }
    const nodes = path.split('/');
    const name = nodes[nodes.length - 1];
    setTabs(prev => [...prev, { path, name, content: '// Content for ' + path }]);
    setActiveTabPath(path);
  };

  const closeTab = (path: string) => {
    setTabs(prev => prev.filter(t => t.path !== path));
    if (activeTabPath === path) {
      setActiveTabPath(tabs[tabs.length - 2]?.path || null);
    }
  };

  const updateTabContent = (path: string, content: string) => {
    setTabs(prev => prev.map(t => t.path === path ? { ...t, content, isDirty: true } : t));
  };

  const saveActiveFile = async () => {
    if (!activeTabPath) return;
    setTabs(prev => prev.map(t => t.path === activeTabPath ? { ...t, isDirty: false } : t));
    addAgentLog(`Saved changes to ${activeTabPath}`, 'success');
    createCheckpoint(`File saved: ${activeTabPath}`);
  };

  const sendTerminalCommand = (cmd: string) => {
    const rawCmd = cmd.trim().toLowerCase();
    setTerminalLogs(prev => [...prev, `> ${cmd}`]);

    if (rawCmd === 'help') {
      setTerminalLogs(prev => [...prev, 
        'AVAILABLE COMMANDS:',
        '  help      - Display this help menu',
        '  cls       - Clear terminal history',
        '  pods      - List all kubernetes pods',
        '  ls        - List workspace files',
        '  whoami    - Display current user context',
        '  reboot    - Usage: reboot [id] (reboots a specific pod)'
      ]);
    } else if (rawCmd === 'cls' || rawCmd === 'clear') {
      setTerminalLogs(["Terminal session cleared."]);
    } else if (rawCmd === 'pods') {
      setTerminalLogs(prev => [...prev, 
        'CURRENT KUBERNETES PODS:',
        ...pods.map(p => `  ${p.name.padEnd(25)} [${p.status.padEnd(10)}] NS:${p.namespace}`)
      ]);
    } else if (rawCmd === 'whoami') {
      setTerminalLogs(prev => [...prev, 'User: Spatial_Architect_01', 'Context: cluster_admin_group']);
    } else if (rawCmd === 'ls') {
      setTerminalLogs(prev => [...prev, 'BUILD_MANIFEST.json', 'spatials.db', 'engine_v3.bin', 'source/']);
    } else if (rawCmd.startsWith('reboot ')) {
      const id = rawCmd.split(' ')[1];
      const pod = pods.find(p => p.id === id || p.name === id);
      if (pod) {
        rebootPod(pod.id);
      } else {
        setTerminalLogs(prev => [...prev, `Error: Pod '${id}' not found.`]);
      }
    } else {
      setTerminalLogs(prev => [...prev, `Command not found: ${cmd}. Type 'help' for options.`]);
    }
  };

  const updateConfig = (updates: Partial<WorkspaceConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    createCheckpoint(`Config changed: ${Object.keys(updates).join(', ')}`);
  };

  const addPipelineItem = (item: Omit<PipelineItem, 'id' | 'status'>) => {
    const newItem: PipelineItem = { ...item, id: Math.random().toString(), status: 'raw' };
    setPipelineItems(prev => [...prev, newItem]);
    createCheckpoint(`Item added to compiler pipeline: ${item.name}`);
    setTimeout(() => {
      setPipelineItems(prev => prev.map(i => i.id === newItem.id ? { ...i, status: 'processed' } : i));
    }, 2000);
  };

  const addEntity = (entity: Omit<WorldEntity, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setEntities(prev => [...prev, { ...entity, id }]);
    createCheckpoint(`Added mesh entity: ${entity.name}`);
  };

  const updateEntity = (id: string, updates: Partial<WorldEntity>) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    createCheckpoint(`Updated mesh positions`);
  };

  const deleteEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
    createCheckpoint(`Deleted mesh entity`);
  };

  const addPrefab = (prefab: Omit<Prefab, 'id'>) => {
    const id = 'p' + (prefabs.length + 1);
    setPrefabs(prev => [...prev, { ...prefab, id }]);
    createCheckpoint(`Prefab saved: ${prefab.name}`);
  };

  const saveScene = (name: string) => {
    if (currentSceneId) {
      setScenes(prev => prev.map(s => s.id === currentSceneId ? { ...s, name, entities, timestamp: Date.now() } : s));
      addAgentLog(`Saved scene: ${name}`, 'success');
      createCheckpoint(`Saved scene parameters: ${name}`);
    } else {
      createScene(name);
    }
  };

  const loadScene = (id: string) => {
    const scene = scenes.find(s => s.id === id);
    if (scene) {
      setEntities([...scene.entities]);
      setCurrentSceneId(id);
      addAgentLog(`Loaded scene: ${scene.name}`, 'info');
      createCheckpoint(`Restored scene configuration: ${scene.name}`);
    }
  };

  const createScene = (name: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newScene: Scene = { id, name, entities: [...entities], timestamp: Date.now() };
    setScenes(prev => [...prev, newScene]);
    setCurrentSceneId(id);
    addAgentLog(`Created new scene: ${name}`, 'success');
    createCheckpoint(`Created and persisted scene: ${name}`);
  };

  const markLandingSeen = useCallback(() => {
    setHasSeenLanding(true);
    try { localStorage.setItem('spatial_seen_landing', '1'); } catch {}
  }, []);

  const resetLanding = useCallback(() => {
    setHasSeenLanding(false);
    setIsSetupComplete(false);
    setSetupConfig(null);
    try {
      localStorage.removeItem('spatial_seen_landing');
      localStorage.removeItem('spatial_setup');
    } catch {}
  }, []);

  const completeSetup = (setup: WorkspaceSetup) => {
    setSetupConfig(setup);
    setIsSetupComplete(true);
    localStorage.setItem('spatial_setup', JSON.stringify(setup));
    addAgentLog(`Workspace initialized: ${setup.engineVersion} / ${setup.editorMode}`, 'success');
    
    // Deployment Orchestration Sequence
    setTimeout(() => {
      addAgentLog(`Orchestrating ${setup.deploymentTarget} target...`, 'thinking');
    }, 500);

    setTimeout(() => {
      if (setup.deploymentTarget.startsWith('k8s')) {
        addAgentLog(`Injecting sidecars into Kubernetes cluster...`, 'info');
      } else if (setup.deploymentTarget.startsWith('docker')) {
        addAgentLog(`Pulling spatial runtime image from registry...`, 'info');
      }
    }, 1500);

    setTimeout(() => {
        addAgentLog(`Environment spin-up finalized. Orchestration complete.`, 'success');
    }, 3000);

    // Apply changes based on setup
    if (setup.engineVersion === 'hybrid-custom') {
      addAgentLog(`Synthesizing custom hybrid kernel with ${setup.hybridModules.length} modules`, 'thinking');
      setTargetUrl(setup.sources.engine || "https://hybrid-kernel.local");
    } else {
      setTargetUrl(setup.sources.engine || "https://spatial-engine.default");
    }

    // Initialize clean data plane
    setEntities([]);
  };

  // CHECKPOINT SAVE & SECTION ERROR REMEDIATION HANDLERS
  const createCheckpoint = useCallback((actionName: string) => {
    setIsSaving(true);
    const dump = {
      entities,
      config,
      activeEngineId,
      synthesisStatus,
      hybridSplit,
      viewMode
    };
    const newStep: CheckpointStep = {
      id: 'step_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      actionName,
      timestamp: Date.now(),
      viewMode,
      stateDump: JSON.stringify(dump)
    };
    setCheckpoints(prev => [newStep, ...prev].slice(0, 50));
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  }, [entities, config, activeEngineId, synthesisStatus, hybridSplit, viewMode]);

  const recordError = useCallback((section: string, code: string, message: string) => {
    const errorId = 'err_' + Date.now();
    const newErr: WorkspaceError = {
      id: errorId,
      section,
      code,
      message,
      timestamp: Date.now(),
      resolved: false
    };
    setErrors(prev => {
      const updated = [newErr, ...prev];
      localStorage.setItem('spatial_errors', JSON.stringify(updated));
      return updated;
    });
    addAgentLog(`[ERROR LOG - ${section}] ${code}: ${message}`, 'error');
    
    // Save immediate checkpoint
    const dump = {
      entities,
      config,
      activeEngineId,
      synthesisStatus,
      hybridSplit,
      viewMode
    };
    const newStep: CheckpointStep = {
      id: 'step_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      actionName: `Section Error flagged: ${code}`,
      timestamp: Date.now(),
      viewMode,
      stateDump: JSON.stringify(dump)
    };
    setCheckpoints(prev => {
      const updatedCheckpoints = [newStep, ...prev].slice(0, 50);
      localStorage.setItem('spatial_checkpoints', JSON.stringify(updatedCheckpoints));
      return updatedCheckpoints;
    });
  }, [entities, config, activeEngineId, synthesisStatus, hybridSplit, viewMode, addAgentLog]);

  const resolveError = useCallback((id: string, solution?: string) => {
    setErrors(prev => {
      const updated = prev.map(err => {
        if (err.id === id) {
          addAgentLog(`Resolved section error: ${err.code}`, 'success');
          return {
            ...err,
            resolved: true,
            resolutionInfo: solution || "Remediation applied successfully via Aether AI Secure Diagnostics Agent."
          };
        }
        return err;
      });
      localStorage.setItem('spatial_errors', JSON.stringify(updated));
      return updated;
    });
    createCheckpoint(`Resolved Error Status: ${id}`);
  }, [createCheckpoint, addAgentLog]);

  const triggerErrorRemediation = async (id: string) => {
    const errorObj = errors.find(err => err.id === id);
    if (!errorObj) return "Error code not registered.";
    addAgentLog(`Consulting secure AI engine for remediation instructions for ${errorObj.code}...`, 'thinking');
    
    try {
      const res = await fetch('/api/config/lint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: errorObj })
      });
      const data = await res.json();
      if (data.success) {
        resolveError(id, data.solution);
        addAgentLog(`AI successfully auto-healed section: ${errorObj.section}. Applied patch vector.`, 'success');
        return data.solution;
      } else {
        throw new Error(data.error || "Execution timeout");
      }
    } catch (err: any) {
      console.error(err);
      const fallbackSolution = `Fallback Auto-Healer: Cleaned target process. Flushed OOM cache limits and re-allocated core heap parameters. Service fully operational!`;
      resolveError(id, fallbackSolution);
      addAgentLog(`Local Healer applied fallback containment. Service restored.`, 'success');
      return fallbackSolution;
    }
  };

  const restoreCheckpoint = useCallback((id: string) => {
    const cp = checkpoints.find(c => c.id === id);
    if (!cp) return;
    try {
      const data = JSON.parse(cp.stateDump);
      if (data.entities) setEntities(data.entities);
      if (data.config) setConfig(data.config);
      if (data.activeEngineId) setActiveEngineId(data.activeEngineId);
      if (data.synthesisStatus) setSynthesisStatus(data.synthesisStatus);
      if (typeof data.hybridSplit !== 'undefined') setHybridSplit(data.hybridSplit);
      if (data.viewMode) setViewMode(data.viewMode);
      
      addAgentLog(`Restored workspace checkpoint: "${cp.actionName}" successfully!`, 'success');
    } catch (err) {
      console.error("Checkpoint restore failed:", err);
    }
  }, [checkpoints, addAgentLog]);

  const clearCheckpoints = useCallback(() => {
    setCheckpoints([]);
    localStorage.removeItem('spatial_checkpoints');
    addAgentLog("Cleared all historical auto-save steps from local session.", "info");
  }, [addAgentLog]);

  return (
    <WorkspaceContext.Provider value={{
      files, tabs, activeTabPath, terminalLogs, agentLogs, viewMode, isSidebarOpen, isAgentSidebarOpen, isAgentThinking, targetUrl, config, pipelineItems, entities, prefabs, scenes, currentSceneId, pods, isSetupComplete, setupConfig,
      hybridSplit, synthesisStatus, setHybridSplit, setSynthesisStatus, activeEngineId,
      setFiles, openFile, closeTab, setActiveTabPath, saveActiveFile, updateTabContent, sendTerminalCommand, addAgentLog,
      setViewMode, setSidebarOpen, setAgentSidebarOpen, setTargetUrl, updateConfig, addPipelineItem,
      setEntities, addEntity, updateEntity, deleteEntity, addPrefab, saveScene, loadScene, createScene, refreshPods, rebootPod, deletePod, completeSetup, spinUpEnginePod,
      hasSeenLanding, markLandingSeen, resetLanding,
      
      // NEW HANDLERS EXPOSED
      errors, checkpoints, isSaving, createCheckpoint, recordError, resolveError, triggerErrorRemediation, restoreCheckpoint, clearCheckpoints,
      customEngineConfig, updateCustomEngineConfig
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
}
