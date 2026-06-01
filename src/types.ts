export type ViewMode = 'pod-studio' | 'deploy' | 'design' | 'engine' | 'spatial' | 'code' | 'pipeline' | 'settings' | 'infrastructure' | 'assistant' | 'plugins' | 'integrity' | 'database' | 'git' | 'search';

export interface WorkspaceError {
  id: string;
  section: string;
  code: string;
  message: string;
  timestamp: number;
  resolved: boolean;
  resolutionInfo?: string;
}

export interface CheckpointStep {
  id: string;
  actionName: string;
  timestamp: number;
  viewMode: ViewMode;
  stateDump: string;
}

export interface Pod {
  id: string;
  name: string;
  status: 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'Unknown';
  cpu: number;
  memory: number;
  restarts: number;
  age: string;
  node: string;
  namespace: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}

export interface Tab {
  path: string;
  name: string;
  content: string;
  isDirty?: boolean;
}

export interface AgentLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'thinking';
  timestamp: number;
}

export interface WorkspaceConfig {
  theme: "brutalist" | "minimal" | "cyber" | "soft";
  engine: "three" | "babylon" | "playcanvas" | "unity-webgl" | "unreal" | "godot" | "webgpu" | "custom";
  aiProvider?: "spatial-v9" | "gemini-pro" | "opencode-ai";
  pipeline: {
    autoOptimize: boolean;
    format: "glb" | "gltf" | "usdz";
  };
  skybox: "city" | "night" | "apartment" | "forest" | "dawn" | "sunset" | "warehouse";
  customEngineUrl?: string;
  localDev?: boolean;
  keys?: {
    openai?: string;
    gemini?: string;
    anthropic?: string;
    perplexity?: string;
    groq?: string;
    opencode?: string;
  };
}

export interface PipelineItem {
  id: string;
  name: string;
  type: 'gltf' | 'texture' | 'audio' | 'script';
  status: 'raw' | 'processed' | 'error';
  size?: number;
}

export interface WorldEntity {
  id: string;
  type: 'mesh' | 'light' | 'camera' | 'group';
  name: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
  properties?: any;
}

export interface Prefab {
  id: string;
  name: string;
  type: WorldEntity['type'];
  properties: any;
}

export interface Scene {
  id: string;
  name: string;
  entities: WorldEntity[];
  timestamp: number;
}

export type DeploymentTarget =
  // --- Cluster / container ---
  | 'k8s-pod'
  | 'k8s-deployment'
  | 'k8s-dev-container'
  | 'docker-container'
  | 'docker-image'
  | 'podman-container'
  | 'self-hosted-vps'
  // --- Static / edge / serverless ---
  | 'static-site'
  | 'vercel'
  | 'netlify'
  | 'cloudflare-pages'
  | 'edge-worker'
  | 'aws-amplify'
  | 'github-pages'
  | 'firebase-hosting'
  | 'bun-runtime'
  | 'railway'
  | 'fly-io'
  | 'render'
  // --- Client runtimes ---
  | 'pwa'
  | 'webxr'
  | 'iframe-embed'
  | 'wasm-module'
  // --- Native shells ---
  | 'desktop-tauri'
  | 'desktop-electron'
  | 'mobile-capacitor'
  // --- Distribution ---
  | 'npm-package'
  | 'asset-cdn'
  | 'local-process';

export interface WorkspaceSetup {
  engineVersion: 'v3-stable' | 'v4-beta' | 'v2-legacy' | 'hybrid-custom';
  editorMode: 'full' | 'code-lite' | 'spatial-only';
  deploymentTarget: DeploymentTarget;
  hybridModules: string[];
  sources: {
    engine?: string;
    assets?: string;
    telemetry?: string;
  };
  customConfig?: string;
  advancedTelemetry: boolean;
  customBuildOptions?: {
    replicas?: number;
    baseImage?: string;
    registryUrl?: string;
    exposedPort?: number;
    mountPath?: string;
    autoUpdate?: boolean;
    scalingMetric?: string;
    // Static / edge
    outDir?: string;
    projectName?: string;
    framework?: 'vite' | 'next' | 'astro' | 'sveltekit' | 'nuxt' | 'remix' | 'static';
    edgeRegion?: string;
    // Distribution
    npmPackageName?: string;
    npmAccess?: 'public' | 'restricted';
    cdnProvider?: 'cloudflare-r2' | 'aws-s3' | 'bunny-cdn' | 'fastly' | 'vercel-edge';
    // WebXR / mobile / desktop
    xrRuntime?: 'webxr' | 'meta-quest' | 'visionos' | 'androidxr';
    mobileTarget?: 'ios' | 'android' | 'both';
    desktopChannel?: 'stable' | 'beta' | 'nightly';
    // PWA / iframe
    pwaName?: string;
    pwaThemeColor?: string;
    iframeAllowList?: string[];
  };
}

export interface CustomEngineConfig {
  bg: string;
  ambient: string;
  particleCount: number;
  particleColor: string;
  speed: number;
  rotationSpeed: number;
  glow: boolean;
  script: string;
  customShape: 'box' | 'sphere' | 'torus' | 'octahedron' | 'cone';
}

