/**
 * Real config generator for 3D engine projects.
 *
 * Given an engine + deploy target + project options, produces a complete,
 * runnable bundle of config files the user deploys to their own infra.
 *
 * No infrastructure is touched. No pods are spawned. Files are returned as
 * a { path, content } map and the caller (UI) decides what to do with them
 * (preview, save, zip-download, etc.).
 */

export type Engine = 'three' | 'babylon' | 'playcanvas' | 'unity' | 'unreal' | 'godot' | 'webgpu' | 'custom';
export type Target =
  | 'k8s-pod' | 'k8s-deployment' | 'k8s-dev-container'
  | 'docker-container' | 'docker-image' | 'podman-container' | 'self-hosted-vps'
  | 'static-site' | 'vercel' | 'netlify' | 'cloudflare-pages' | 'edge-worker'
  | 'aws-amplify' | 'github-pages' | 'firebase-hosting' | 'bun-runtime'
  | 'railway' | 'fly-io' | 'render'
  | 'pwa' | 'webxr' | 'iframe-embed' | 'wasm-module'
  | 'desktop-tauri' | 'desktop-electron' | 'mobile-capacitor'
  | 'npm-package' | 'asset-cdn' | 'local-process';

export interface GenerateOptions {
  projectName: string;
  description?: string;
  framework?: 'vite' | 'next' | 'astro' | 'sveltekit' | 'nuxt' | 'remix' | 'static';
  port?: number;
  outDir?: string;
  registryUrl?: string;
  baseImage?: string;
  replicas?: number;
  cdnProvider?: 'cloudflare-r2' | 'aws-s3' | 'bunny-cdn' | 'fastly' | 'vercel-edge';
  edgeRegion?: string;
  npmPackageName?: string;
  npmAccess?: 'public' | 'restricted';
  xrRuntime?: 'webxr' | 'meta-quest' | 'visionos' | 'androidxr';
  mobileTarget?: 'ios' | 'android' | 'both';
  desktopChannel?: 'stable' | 'beta' | 'nightly';
  pwaName?: string;
  pwaThemeColor?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface GenerateResult {
  projectName: string;
  engine: Engine;
  target: Target;
  files: GeneratedFile[];
  deploySteps: string[];
  estimatedSizeKb: number;
}

const pkg = (name: string, deps: Record<string, string>, devDeps: Record<string, string> = {}, scripts: Record<string, string> = {}) => JSON.stringify({
  name,
  version: '0.1.0',
  private: true,
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
    ...scripts
  },
  dependencies: deps,
  devDependencies: devDeps
}, null, 2) + '\n';

const engineDeps = (engine: Engine): { deps: Record<string, string>; devDeps: Record<string, string> } => {
  switch (engine) {
    case 'three':
      return { deps: { three: '^0.164.1' }, devDeps: { '@types/three': '^0.164.0' } };
    case 'babylon':
      return { deps: { '@babylonjs/core': '^7.0.0', '@babylonjs/loaders': '^7.0.0' }, devDeps: {} };
    case 'playcanvas':
      return { deps: { playcanvas: '^2.0.0' }, devDeps: {} };
    case 'unity':
      return { deps: { '@unity/webgl-loader': '^1.0.0' }, devDeps: {} };
    case 'unreal':
      return { deps: { '@unreal/html5-runtime': '^1.0.0' }, devDeps: {} };
    case 'godot':
      return { deps: {}, devDeps: {} };
    case 'webgpu':
      return { deps: { three: '^0.164.1', 'wgsl-loader': '^1.0.0' }, devDeps: { '@types/three': '^0.164.0' } };
    case 'custom':
      return { deps: { three: '^0.164.1' }, devDeps: { '@types/three': '^0.164.0' } };
  }
};

const engineSource = (engine: Engine, name: string): string => {
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '-');
  if (engine === 'three') {
    return `import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0b0e);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(3, 3, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.getElementById('app')!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 10, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const mesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1, 1),
  new THREE.MeshStandardMaterial({ color: 0x00d4ff, wireframe: true })
);
scene.add(mesh);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

(function tick(t: number) {
  mesh.rotation.x = t * 0.0004;
  mesh.rotation.y = t * 0.0006;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
})(performance.now());

console.log('${safeName} running on Three.js');
`;
  }
  if (engine === 'babylon') {
    return `import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, StandardMaterial, Color3, Vector3 } from '@babylonjs/core';

const canvas = document.getElementById('app') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
scene.clearColor = new Color4(0.04, 0.04, 0.05, 1);

const camera = new ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

const light = new HemisphericLight('h', new Vector3(0, 1, 0), scene);
light.intensity = 1.2;

const sphere = MeshBuilder.CreateIcoSphere('s', { radius: 1, subdivisions: 2 }, scene);
const mat = new StandardMaterial('m', scene);
mat.wireframe = true;
mat.emissiveColor = new Color3(0, 0.83, 1);
sphere.material = mat;

engine.runRenderLoop(() => scene.render());
addEventListener('resize', () => engine.resize());

console.log('${safeName} running on Babylon.js');
`;
  }
  if (engine === 'playcanvas') {
    return `import * as pc from 'playcanvas';

const canvas = document.getElementById('app') as HTMLCanvasElement;
const app = new pc.Application(canvas, { graphicsDeviceOptions: { antialias: true } });
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.start();

app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

const light = new pc.Entity('light');
light.addComponent('light', { type: 'directional', color: new pc.Color(1, 1, 1), intensity: 1 });
light.setEulerAngles(45, 30, 0);
app.root.addChild(light);

const camera = new pc.Entity('camera');
camera.addComponent('camera', { clearColor: new pc.Color(0.04, 0.04, 0.05) });
camera.setPosition(0, 0, 5);
app.root.addChild(camera);

const sphere = new pc.Entity('sphere');
sphere.addComponent('render', { type: 'sphere' });
sphere.setLocalScale(1, 1, 1);
app.root.addChild(sphere);

app.on('update', (dt: number) => sphere.rotate(0, dt * 30, 0));

console.log('${safeName} running on PlayCanvas');
`;
  }
  if (engine === 'unity') {
    return `// Place the Unity WebGL Build folder at ./unity-build/.
// This wrapper lazy-loads the .loader.js from Unity's build output.
import './unity-build/TemplateData/style.css';

let unityInstance: any;

(async () => {
  const script = document.createElement('script');
  script.src = '/unity-build/Build/{{{ LOADER_FILENAME }}}.loader.js';
  document.body.appendChild(script);
  await new Promise(r => script.addEventListener('load', r));

  unityInstance = await (window as any).createUnityInstance({
    dataUrl: '/unity-build/Build/{{{ BUILD_FILENAME }}}.data',
    frameworkUrl: '/unity-build/Build/{{{ BUILD_FILENAME }}}.framework.js',
    codeUrl: '/unity-build/Build/{{{ BUILD_FILENAME }}}.wasm'
  }, (p: number) => {
    const bar = document.getElementById('unity-progress-bar')!;
    if (bar) (bar as HTMLElement).style.width = (p * 100) + '%';
  });
})();
`;
  }
  if (engine === 'unreal') {
    return `<!-- Place UE5 HTML5 build at ./unreal-build/.
     This page loads the UE5 pixel-streaming client. -->
<!doctype html>
<html><head><meta charset="utf-8"><title>${safeName}</title>
<style>html,body{margin:0;background:#000;height:100%;overflow:hidden}#app{height:100%}</style>
</head>
<body><div id="app"></div>
<script type="module">
  // Replace the URL with your pixel-streaming server
  const PS_URL = 'wss://pixel-stream.example.com';
  console.log('Pixel stream target:', PS_URL);
  // Load the official @unreal/html5-runtime client here.
</script></body></html>
`;
  }
  if (engine === 'godot') {
    return `<!doctype html>
<html><head><meta charset="utf-8"><title>${safeName}</title>
<style>html,body{margin:0;background:#0a0b0e;color:#94a3b8;font:14px system-ui;display:grid;place-items:center;height:100%}
#app canvas{width:100%;height:100%;display:block}</style>
</head>
<body><div id="app"></div>
<script>
  // Build your Godot 4 project with the "Web" preset and place the export at ./godot-build/.
  // Then wire it up here. See README.md.
  const script = document.createElement('script');
  script.src = '/godot-build/index.js';
  script.onload = () => {
    const eng = new (window as any).Engine('/godot-build/index.pck');
    document.getElementById('app').appendChild(eng.getCanvas());
    eng.startGame();
  };
  document.body.appendChild(script);
</script></body></html>
`;
  }
  if (engine === 'webgpu') {
    return `// WebGPU compute-shader starter. Falls back to WebGL2 if WebGPU is unavailable.
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

const renderer = new WebGPURenderer({ antialias: true });
await renderer.init();
renderer.setSize(innerWidth, innerHeight);
document.getElementById('app')!.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 3;

const mesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.3, 128, 32),
  new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.6, roughness: 0.2 })
);
scene.add(mesh);
scene.add(new THREE.DirectionalLight(0xffffff, 2).position.set(2, 2, 2));

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

(function tick(t: number) {
  mesh.rotation.x = t * 0.0004;
  mesh.rotation.y = t * 0.0006;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
})(performance.now());

console.log('${safeName} running on WebGPU');
`;
  }
  // custom
  return `// Bring your own engine. Use the canvas at #app.
const canvas = document.getElementById('app') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
if (!gl) throw new Error('WebGL not supported');
console.log('${safeName} running on custom engine');
`;
};

const indexHtml = (name: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#00d4ff" />
  <title>${name}</title>
  <style>
    html, body { margin: 0; height: 100%; background: #0a0b0e; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; }
    #app { width: 100vw; height: 100vh; display: block; }
    #fallback { position: fixed; inset: 0; display: grid; place-items: center; color: #94a3b8; font-size: 14px; pointer-events: none; opacity: 0.4; }
  </style>
</head>
<body>
  <div id="app"></div>
  <div id="fallback">${name}</div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`;

const tsconfig = `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "jsx": "preserve"
  },
  "include": ["src"]
}
`;

const gitignore = `node_modules
dist
.DS_Store
.env
.env.local
*.log
.cache
.vite
coverage
unity-build/Library
unity-build/Temp
unreal-build/Intermediate
unreal-build/Saved
godot-build/.godot
`;

// =================== PER-TARGET FILE BUILDERS ===================

const dockerfile = (engine: Engine, opts: GenerateOptions) => {
  const port = opts.port ?? 3000;
  switch (engine) {
    case 'unity':
      return `# Multi-stage Dockerfile for Unity WebGL builds served by a static host.
# Stage 1: build the JS bundle (if you have a wrapper around the Unity build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY unity-build /usr/share/nginx/html/unity-build
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
    case 'unreal':
      return `# UE5 container (pixel-streaming server side).
# The pixel-streaming container is provided by Epic. See:
#   https://docs.unrealengine.com/5.0/en-US/Sharing-your-UE5-Project-with-Pixel-Streaming-in-UE5.1
FROM ghcr.io/epicgames/pixel-streaming:latest
COPY UnrealGame/ /opt/UnrealGame/
ENV UE_PROJECT_NAME=${opts.projectName}
EXPOSE 80 19302
`;
    case 'godot':
      return `# Godot 4 web export + static host.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY godot-build /usr/share/nginx/html/godot-build
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
    case 'babylon':
    case 'playcanvas':
    case 'three':
    case 'webgpu':
    case 'custom':
    default:
      return `# Multi-stage build for a static 3D SPA.
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Stage 2: serve
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
`;
  }
};

const nginxConf = `server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # Long cache for static assets, short for HTML
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  location ~* \\.(wasm|data|glb|gltf|hdr|png|jpg|svg|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  location / {
    add_header Cache-Control "no-cache";
    try_files $uri $uri/ /index.html;
  }

  # CORS for cross-origin asset embeds
  add_header Access-Control-Allow-Origin "*" always;
  add_header Cross-Origin-Opener-Policy "same-origin" always;
  add_header Cross-Origin-Embedder-Policy "require-corp" always;
}
`;

const compose = (port: number) => `# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "${port}:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
`;

const k8sManifests = (opts: GenerateOptions) => {
  const name = opts.projectName.toLowerCase();
  const port = opts.port ?? 80;
  const replicas = opts.replicas ?? 2;

  return {
    'k8s/namespace.yaml': `apiVersion: v1
kind: Namespace
metadata:
  name: ${name}
`,
    'k8s/deployment.yaml': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${name}
  labels:
    app: ${name}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
        - name: ${name}
          image: ${opts.registryUrl ?? 'ghcr.io/your-org/' + name}:latest
          ports:
            - containerPort: ${port}
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /
              port: ${port}
            initialDelaySeconds: 2
            periodSeconds: 5
`,
    'k8s/service.yaml': `apiVersion: v1
kind: Service
metadata:
  name: ${name}
  namespace: ${name}
spec:
  type: ClusterIP
  selector:
    app: ${name}
  ports:
    - port: 80
      targetPort: ${port}
`,
    'k8s/ingress.yaml': `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${name}
  namespace: ${name}
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - ${name}.example.com
      secretName: ${name}-tls
  rules:
    - host: ${name}.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${name}
                port:
                  number: 80
`,
    'k8s/hpa.yaml': `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${name}
  namespace: ${name}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${name}
  minReplicas: ${replicas}
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 80
`
  };
};

const vercelJson = `{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/(.*)\\.(wasm|glb|gltf|hdr|br)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
`;

const netlifyToml = `[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
`;

const wranglerToml = (opts: GenerateOptions) => `name = "${opts.projectName.toLowerCase()}"
compatibility_date = "2024-09-01"
pages_build_output_dir = "dist"

[build]
  command = "npm run build"

# For an edge worker, swap to:
# main = "src/worker.ts"
# compatibility_flags = ["nodejs_compat"]
`;

const flyToml = (opts: GenerateOptions) => `# fly.toml — Fly.io app config
app = "${opts.projectName.toLowerCase()}"
primary_region = "${opts.edgeRegion ?? 'iad'}"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 80
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  size = "shared-cpu-1x"
  memory = "256mb"
`;

const railwayToml = `[build]
  builder = "DOCKERFILE"
  dockerfilePath = "Dockerfile"

[deploy]
  healthcheckPath = "/"
  healthcheckTimeout = 30
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 3
`;

const renderYaml = (opts: GenerateOptions) => `services:
  - type: web
    name: ${opts.projectName.toLowerCase()}
    runtime: static
    buildCommand: npm run build
    staticPublishPath: ./dist
    headers:
      - path: /assets/*
        name: Cache-Control
        value: public, max-age=31536000, immutable
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
`;

const amplifyYml = `version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
`;

const firebaseJson = `{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      }
    ],
    "predeploy": ["npm ci", "npm run build"]
  }
}
`;

const bunConfig = (opts: GenerateOptions) => {
  return `{
  "name": "${opts.projectName}",
  "type": "module",
  "scripts": {
    "dev": "bun run vite",
    "build": "bun run vite build",
    "start": "bun run ./dist/server.js"
  }
}
`;
};

const pwaManifest = (opts: GenerateOptions) => `{
  "name": "${opts.pwaName ?? opts.projectName}",
  "short_name": "${opts.projectName}",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0b0e",
  "theme_color": "${opts.pwaThemeColor ?? '#00d4ff'}",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
`;

const serviceWorker = `// Caches the app shell and glTF assets for offline use.
const CACHE = 'aether-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (/\\.(glb|gltf|hdr|wasm|br|png|jpg)$/.test(url.pathname)) {
    e.respondWith(caches.open(CACHE).then(async (c) => {
      const cached = await c.match(e.request);
      return cached || fetch(e.request).then((res) => { c.put(e.request, res.clone()); return res; });
    }));
  }
});
`;

const iframeSnippet = (opts: GenerateOptions) => `<!-- Drop this snippet into any site to embed your 3D scene -->
<iframe
  src="https://${opts.projectName.toLowerCase()}.aether.works"
  style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px"
  allow="xr-spatial-tracking; camera; microphone; fullscreen; autoplay"
  sandbox="allow-scripts allow-same-origin allow-popups"
  loading="lazy"
  title="${opts.projectName}"
></iframe>
`;

const wranglerWorker = `// Cloudflare Worker entry. Runs at the edge with V8 isolates.
// For a 3D engine, you'd typically precompute responses or proxy assets.
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // Proxy all asset requests to your R2 bucket.
    if (/\\.(glb|gltf|hdr|wasm|br)$/.test(url.pathname)) {
      const obj = await env.ASSETS.get(url.pathname);
      if (!obj) return new Response('Not found', { status: 404 });
      return new Response(obj.body, {
        headers: {
          'Content-Type': obj.httpMetadata?.contentType ?? 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return env.ASSETS.fetch(req);
  }
};
`;

const tauriConfig = (opts: GenerateOptions) => `{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "${opts.projectName}",
  "version": "0.1.0",
  "identifier": "works.aether.${opts.projectName.toLowerCase()}",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "${opts.projectName}",
        "width": 1280,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"]
  }
}
`;

const electronMain = (opts: GenerateOptions) => `// electron/main.cjs
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;

const capacitorConfig = (opts: GenerateOptions) => `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'works.aether.${opts.projectName.toLowerCase()}',
  appName: '${opts.projectName}',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
`;

const xrManifest = (opts: GenerateOptions) => `{
  "name": "${opts.projectName}",
  "xr": {
    "type": "${opts.xrRuntime ?? 'webxr'}",
    "stereoEnabled": true,
    "handTracking": true,
    "eyeTracking": false,
    "passthrough": ${opts.xrRuntime === 'visionos' || opts.xrRuntime === 'androidxr' ? 'true' : 'false'},
    "renderTarget": { "width": 1920, "height": 1080, "frameRate": 90 }
  },
  "icons": [
    { "src": "/xr/icon-192.png", "sizes": "192x192" }
  ]
}
`;

const cdnPushScript = (opts: GenerateOptions) => {
  const cdn = opts.cdnProvider ?? 'cloudflare-r2';
  return `#!/usr/bin/env bash
# Push optimized glTF / HDR / texture assets to your CDN.
# Requires: aws-cli (for s3/r2), wrangler (for r2), or bunny-cli.
set -euo pipefail

BUCKET="\${BUCKET:-${opts.projectName.toLowerCase()}-assets}"
SRC="\${SRC:-./public/assets}"

case "${cdn}" in
  cloudflare-r2)
    echo "Uploading to R2 bucket: \$BUCKET"
    npx wrangler r2 object put "\$BUCKET/{\$SRC}/" --recursive --remote
    ;;
  aws-s3)
    echo "Uploading to S3 bucket: \$BUCKET"
    aws s3 sync "\$SRC/" "s3://\$BUCKET/" \\
      --exclude "*.DS_Store" \\
      --cache-control "public, max-age=31536000, immutable" \\
      --content-encoding auto
    ;;
  fastly)
    echo "Purging + uploading to Fastly bucket: \$BUCKET"
    fastly object-store upload --bucket "\$BUCKET" "\$SRC" --all
    ;;
  bunny-cdn)
    echo "Uploading to Bunny storage: \$BUCKET"
    bunny storage upload --region "de" "\$SRC" "\$BUCKET"
    ;;
esac

echo "Done. Assets live on \${BUCKET}."
`;
};

const githubWorkflow = `name: deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
`;

const readme = (engine: Engine, target: Target, opts: GenerateOptions) => `# ${opts.projectName}

${opts.description ?? `A 3D scene built on ${engine}, deployable to ${target}.`}

## Generated by AetherOS

This bundle was produced by AetherOS as a deploy config. It runs on **your** infrastructure — no cluster is provisioned on your behalf.

## Develop

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Deploy

This bundle targets **${target}**. See the matching file for instructions:
- \`Dockerfile\` — any container host
- \`k8s/\` — Kubernetes manifests
- \`vercel.json\` — Vercel
- \`netlify.toml\` — Netlify
- \`wrangler.toml\` — Cloudflare
- \`fly.toml\` — Fly.io
- \`railway.toml\` — Railway
- \`render.yaml\` — Render
- \`firebase.json\` — Firebase
- \`amplify.yml\` — AWS Amplify
- \`tauri.conf.json\` — Tauri desktop
- \`electron/main.cjs\` — Electron desktop
- \`capacitor.config.ts\` — Capacitor mobile
- \`scripts/push-cdn.sh\` — Asset CDN upload

## License

MIT.
`;

// =================== MAIN ===================

export function generateConfig(engine: Engine, target: Target, opts: GenerateOptions): GenerateResult {
  const { projectName, framework = 'vite', port = 80, outDir = 'dist' } = opts;
  const { deps, devDeps } = engineDeps(engine);

  const files: GeneratedFile[] = [];
  const deploySteps: string[] = [];

  // Common: package.json, tsconfig, gitignore, README
  files.push({ path: 'package.json',         content: pkg(projectName, deps, devDeps, engine === 'unity' ? { 'unity:build': 'echo "Run Unity in editor, then copy to unity-build/"' } : {}), language: 'json' });
  files.push({ path: 'tsconfig.json',        content: tsconfig, language: 'json' });
  files.push({ path: '.gitignore',           content: gitignore, language: 'plaintext' });
  files.push({ path: 'README.md',            content: readme(engine, target, opts), language: 'markdown' });

  // Common: source files for engines that need them (skip for unity/unreal/godot which are drop-in builds)
  if (engine !== 'unity' && engine !== 'unreal' && engine !== 'godot') {
    files.push({ path: 'index.html',          content: indexHtml(projectName), language: 'html' });
    files.push({ path: 'src/main.ts',         content: engineSource(engine, projectName), language: 'typescript' });
    files.push({ path: 'vite.config.ts',      content: `import { defineConfig } from 'vite';\nexport default defineConfig({ build: { target: 'esnext', outDir: '${outDir}' }, server: { port: 3000 } });\n`, language: 'typescript' });
  }

  // Per-target files
  switch (target) {
    case 'static-site':
    case 'github-pages':
    case 'firebase-hosting': {
      // Just the static bundle, no container.
      deploySteps.push('npm install', 'npm run build', 'Upload ./' + outDir + ' to your static host.');
      if (target === 'firebase-hosting') files.push({ path: 'firebase.json', content: firebaseJson, language: 'json' });
      if (target === 'github-pages')      files.push({ path: '.github/workflows/deploy.yml', content: githubWorkflow, language: 'yaml' });
      break;
    }
    case 'vercel':
      files.push({ path: 'vercel.json', content: vercelJson, language: 'json' });
      deploySteps.push('vercel deploy --prod');
      break;
    case 'netlify':
      files.push({ path: 'netlify.toml', content: netlifyToml, language: 'toml' });
      deploySteps.push('netlify deploy --prod');
      break;
    case 'cloudflare-pages':
      files.push({ path: 'wrangler.toml', content: wranglerToml(opts), language: 'toml' });
      deploySteps.push('wrangler pages deploy ./' + outDir);
      break;
    case 'edge-worker': {
      files.push({ path: 'wrangler.toml', content: wranglerToml(opts), language: 'toml' });
      files.push({ path: 'src/worker.ts', content: wranglerWorker, language: 'typescript' });
      deploySteps.push('wrangler deploy');
      break;
    }
    case 'bun-runtime':
      files.push({ path: 'wrangler.toml', content: wranglerToml(opts), language: 'toml' });
      files.push({ path: 'bunfig.toml', content: bunConfig(opts), language: 'toml' });
      deploySteps.push('bun install', 'bun run build', 'bun run start');
      break;
    case 'fly-io':
      files.push({ path: 'Dockerfile', content: dockerfile(engine, opts), language: 'dockerfile' });
      files.push({ path: 'fly.toml', content: flyToml(opts), language: 'toml' });
      deploySteps.push('fly launch --no-deploy', 'fly deploy');
      break;
    case 'railway':
      files.push({ path: 'Dockerfile', content: dockerfile(engine, opts), language: 'dockerfile' });
      files.push({ path: 'railway.toml', content: railwayToml, language: 'toml' });
      deploySteps.push('railway up');
      break;
    case 'render':
      files.push({ path: 'render.yaml', content: renderYaml(opts), language: 'yaml' });
      deploySteps.push('Connect your repo in the Render dashboard. It will pick up render.yaml.');
      break;
    case 'aws-amplify':
      files.push({ path: 'amplify.yml', content: amplifyYml, language: 'yaml' });
      deploySteps.push('Connect your repo in the AWS Amplify console. It will pick up amplify.yml.');
      break;
    case 'docker-container':
      files.push({ path: 'Dockerfile',   content: dockerfile(engine, opts), language: 'dockerfile' });
      files.push({ path: 'nginx.conf',   content: nginxConf, language: 'nginx' });
      files.push({ path: 'docker-compose.yml', content: compose(port), language: 'yaml' });
      deploySteps.push('docker compose up --build -d');
      break;
    case 'docker-image':
      files.push({ path: 'Dockerfile', content: dockerfile(engine, opts), language: 'dockerfile' });
      files.push({ path: 'nginx.conf', content: nginxConf, language: 'nginx' });
      deploySteps.push('docker build -t ' + projectName.toLowerCase() + ':latest .', 'docker push <registry>/' + projectName.toLowerCase());
      break;
    case 'podman-container':
      files.push({ path: 'Dockerfile', content: dockerfile(engine, opts), language: 'dockerfile' });
      files.push({ path: 'nginx.conf', content: nginxConf, language: 'nginx' });
      deploySteps.push('podman build -t ' + projectName.toLowerCase() + ':latest .', 'podman run --userns=keep-id -p ' + port + ':80 ' + projectName.toLowerCase());
      break;
    case 'self-hosted-vps':
      files.push({ path: 'Dockerfile', content: dockerfile(engine, opts), language: 'dockerfile' });
      files.push({ path: 'nginx.conf', content: nginxConf, language: 'nginx' });
      files.push({ path: 'docker-compose.yml', content: compose(port), language: 'yaml' });
      files.push({ path: 'deploy/vps-setup.sh', content: `#!/usr/bin/env bash
# Minimal VPS bootstrap (Debian/Ubuntu). Run as root.
set -euo pipefail
apt update
apt install -y docker.io docker-compose-v2 ufw certbot python3-certbot-nginx nginx
ufw allow 22 80 443
cp nginx.conf /etc/nginx/sites-available/${projectName.toLowerCase()}
ln -sf /etc/nginx/sites-available/${projectName.toLowerCase()} /etc/nginx/sites-enabled/
systemctl reload nginx
certbot --nginx -d ${projectName.toLowerCase()}.example.com --agree-tos -m you@example.com
docker compose up -d --build
`, language: 'bash' });
      deploySteps.push('scp -r . user@your-vps:/srv/' + projectName.toLowerCase(), 'ssh user@your-vps "cd /srv/' + projectName.toLowerCase() + ' && bash deploy/vps-setup.sh"');
      break;
    case 'k8s-pod':
    case 'k8s-deployment':
    case 'k8s-dev-container': {
      files.push({ path: 'Dockerfile', content: dockerfile(engine, opts), language: 'dockerfile' });
      files.push({ path: 'nginx.conf', content: nginxConf, language: 'nginx' });
      Object.entries(k8sManifests(opts)).forEach(([p, c]) => files.push({ path: p, content: c, language: 'yaml' }));
      deploySteps.push('docker build -t ' + (opts.registryUrl ?? 'ghcr.io/your-org/' + projectName.toLowerCase()) + ':latest .',
                       'docker push ' + (opts.registryUrl ?? 'ghcr.io/your-org/' + projectName.toLowerCase()) + ':latest',
                       'kubectl apply -f k8s/namespace.yaml',
                       'kubectl apply -f k8s/deployment.yaml',
                       'kubectl apply -f k8s/service.yaml',
                       'kubectl apply -f k8s/ingress.yaml',
                       'kubectl apply -f k8s/hpa.yaml');
      break;
    }
    case 'pwa':
      files.push({ path: 'public/manifest.webmanifest', content: pwaManifest(opts), language: 'json' });
      files.push({ path: 'public/sw.js', content: serviceWorker, language: 'javascript' });
      deploySteps.push('npm install', 'npm run build', 'Deploy ./' + outDir + ' to any static host.');
      break;
    case 'webxr':
      files.push({ path: 'public/xr-manifest.json', content: xrManifest(opts), language: 'json' });
      deploySteps.push('npm install', 'npm run build', 'Deploy ./' + outDir + ' to any HTTPS host. WebXR requires HTTPS.');
      break;
    case 'iframe-embed':
      files.push({ path: 'embed-snippet.html', content: iframeSnippet(opts), language: 'html' });
      deploySteps.push('Host your app on any HTTPS origin. Paste the embed snippet into your target site.');
      break;
    case 'wasm-module': {
      const basePkg = JSON.parse(pkg(projectName, deps, devDeps, { 'wasm:build': 'emcc src/wasm/wrapper.cpp -O3 -s WASM=1 -s MODULARIZE=1 -o src/wasm/scene.mjs' }));
      basePkg.exports = { '.': './src/main.ts', './wasm': './src/wasm/scene.mjs' };
      files.push({ path: 'package.json', content: JSON.stringify(basePkg, null, 2) + '\n', language: 'json' });
      files.push({ path: 'src/wasm/wrapper.cpp', content: `// Bridge your engine to a standalone .wasm module.
// Emscripten will produce scene.wasm + scene.mjs.
#include <emscripten.h>
#include <cmath>

extern "C" {
  EMSCRIPTEN_KEEPALIVE
  float tick(float t) { return std::sin(t) * 0.5f; }
}
`, language: 'cpp' });
      deploySteps.push('emcc src/wasm/wrapper.cpp -O3 -s WASM=1 -s MODULARIZE=1 -o src/wasm/scene.mjs',
                       'npm publish --access ' + (opts.npmAccess ?? 'public'));
      break;
    }
    case 'desktop-tauri':
      files.push({ path: 'src-tauri/tauri.conf.json', content: tauriConfig(opts), language: 'json' });
      files.push({ path: 'src-tauri/main.rs', content: `fn main() {
  tauri::Builder::default()
    .setup(|app| Ok(()))
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
`, language: 'rust' });
      deploySteps.push('cargo install tauri-cli', 'cargo tauri build');
      break;
    case 'desktop-electron':
      files.push({ path: 'electron/main.cjs', content: electronMain(opts), language: 'javascript' });
      files.push({ path: 'electron/preload.cjs', content: `// electron/preload.cjs — context-bridge surface.
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('aether', {});
`, language: 'javascript' });
      deploySteps.push('npm i -D electron electron-builder', 'npx electron-builder');
      break;
    case 'mobile-capacitor':
      files.push({ path: 'capacitor.config.ts', content: capacitorConfig(opts), language: 'typescript' });
      deploySteps.push('npm run build',
                       'npx cap add ' + (opts.mobileTarget === 'android' ? 'android' : opts.mobileTarget === 'ios' ? 'ios' : 'ios') + ' || true',
                       'npx cap sync',
                       'npx cap open ' + (opts.mobileTarget === 'android' ? 'android' : 'ios'));
      break;
    case 'npm-package':
      files.push({ path: 'README.md', content: readme(engine, target, opts), language: 'markdown' });
      deploySteps.push('npm login', 'npm publish --access ' + (opts.npmAccess ?? 'public'));
      break;
    case 'asset-cdn':
      files.push({ path: 'scripts/push-cdn.sh', content: cdnPushScript(opts), language: 'bash' });
      deploySteps.push('chmod +x scripts/push-cdn.sh', 'BUCKET=my-bucket SRC=./public/assets ./scripts/push-cdn.sh');
      break;
    case 'local-process':
      deploySteps.push('npm install', 'npm run dev');
      break;
  }

  const estimatedSizeKb = Math.round(files.reduce((sum, f) => sum + f.content.length, 0) / 1024);

  return {
    projectName,
    engine,
    target,
    files,
    deploySteps,
    estimatedSizeKb
  };
}
