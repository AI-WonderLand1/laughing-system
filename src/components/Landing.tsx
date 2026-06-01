import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, useScroll, useTransform } from 'motion/react';
import * as THREE from 'three';
import {
  Box, Cpu, Cloud, Terminal, GitBranch, Database, Search,
  ArrowRight, Sparkles, Layers, Zap, Globe, Boxes,
  ChevronDown, Command, Play, Github, Star,
  Server as ServerIcon, Train as TrainIcon, Plane as PlaneIcon, Package as PackageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

// ============== SIGNATURE: AETHER NODE (wireframe spatial mark) ==============
function AetherNode({ size = 1, color = '#00d4ff', wire = true }: { size?: number; color?: string; wire?: boolean }) {
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[size, 1]} />
        <meshBasicMaterial color={color} wireframe={wire} transparent opacity={0.85} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[size * 1.35, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

// ============== HERO 3D SCENE ==============
function HeroScene() {
  const group = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.18 + mouse.x * 0.4;
    group.current.rotation.x = Math.sin(t * 0.25) * 0.15 - mouse.y * 0.25;
  });

  return (
    <group ref={group}>
      {/* central node */}
      <AetherNode size={1.1} color="#00d4ff" />

      {/* orbiting engine pods */}
      {[
        { angle: 0,    r: 2.6, h: 0,    color: '#3b82f6', kind: 'box' },
        { angle: 1.05, r: 2.9, h: 0.4,  color: '#8b5cf6', kind: 'torus' },
        { angle: 2.1,  r: 2.6, h: -0.3, color: '#10b981', kind: 'sphere' },
        { angle: 3.14, r: 2.9, h: 0.2,  color: '#f43f5e', kind: 'box' },
        { angle: 4.19, r: 2.6, h: -0.4, color: '#00e5a0', kind: 'sphere' },
        { angle: 5.24, r: 2.9, h: 0.3,  color: '#ffb340', kind: 'torus' }
      ].map((p, i) => {
        const x = Math.cos(p.angle + performance.now() / 4000) * p.r;
        const z = Math.sin(p.angle + performance.now() / 4000) * p.r;
        return (
          <group key={i} position={[x, p.h, z]}>
            {p.kind === 'box' && (
              <mesh rotation={[0.4, 0.4, 0]}>
                <boxGeometry args={[0.45, 0.45, 0.45]} />
                <meshBasicMaterial color={p.color} wireframe />
              </mesh>
            )}
            {p.kind === 'sphere' && (
              <mesh>
                <sphereGeometry args={[0.3, 12, 12]} />
                <meshBasicMaterial color={p.color} wireframe />
              </mesh>
            )}
            {p.kind === 'torus' && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.32, 0.08, 8, 24]} />
                <meshBasicMaterial color={p.color} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* far stars */}
      {Array.from({ length: 80 }).map((_, i) => {
        const r = 8 + (i % 7);
        const theta = (i * 137.5) * (Math.PI / 180);
        const phi = (i * 53.7) * (Math.PI / 180);
        return (
          <mesh key={i} position={[Math.cos(theta) * r, Math.sin(phi) * 2, Math.sin(theta) * r]}>
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        );
      })}
    </group>
  );
}

// ============== TINY 3D EMBED (used in feature cards) ==============
function MiniShape({ kind }: { kind: 'cube' | 'sphere' | 'torus' | 'octa' | 'cone' }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.4;
      ref.current.rotation.y += dt * 0.6;
    }
  });
  const geo = {
    cube:   <boxGeometry args={[0.9, 0.9, 0.9]} />,
    sphere: <sphereGeometry args={[0.55, 16, 16]} />,
    torus:  <torusGeometry args={[0.5, 0.18, 12, 32]} />,
    octa:   <octahedronGeometry args={[0.7, 0]} />,
    cone:   <coneGeometry args={[0.55, 1, 16]} />
  }[kind];
  return (
    <mesh ref={ref}>
      {geo}
      <meshBasicMaterial color="#00d4ff" wireframe />
    </mesh>
  );
}

function MiniCanvas({ kind }: { kind: 'cube' | 'sphere' | 'torus' | 'octa' | 'cone' }) {
  return (
    <Canvas camera={{ position: [0, 0, 2.2] }} dpr={[1, 2]}>
      <ambientLight intensity={0.5} />
      <Suspense fallback={null}>
        <MiniShape kind={kind} />
      </Suspense>
    </Canvas>
  );
}

// ============== DATA ==============
const ENGINES = [
  { id: 'three',     name: 'Three.js',     blurb: 'WebGL default',          icon: Box },
  { id: 'babylon',   name: 'Babylon.js',   blurb: 'Full PBR scene graph',   icon: Layers },
  { id: 'playcanvas',name: 'PlayCanvas',   blurb: 'Engine OSS',             icon: Cpu },
  { id: 'unity',     name: 'Unity WASM',   blurb: 'IL2CPP web build',       icon: Boxes },
  { id: 'unreal',    name: 'Unreal',       blurb: 'Pixel-streamed UE5',     icon: Zap },
  { id: 'godot',     name: 'Godot 4',      blurb: 'Web export',             icon: Sparkles },
  { id: 'webgpu',    name: 'WebGPU',       blurb: 'Native compute',         icon: Globe },
  { id: 'custom',    name: 'Custom',       blurb: 'Bring your engine',      icon: Command }
] as const;

const TEMPLATES = [
  { name: 'three-vite-tailwind',  engines: ['three'],     desc: 'Vite + Three.js + Tailwind. Empty scene, OrbitControls, glTF loader.' },
  { name: 'babylon-ar-showroom',  engines: ['babylon'],   desc: 'Babylon.js product viewer with AR fallback and WebXR support.' },
  { name: 'playcanvas-runner',    engines: ['playcanvas'],desc: 'Side-scroller starter. Physics, input, audio buses.' },
  { name: 'unity-wasm-portfolio', engines: ['unity'],     desc: 'Unity 2022 LTS built to WASM, deployable as a static pod.' },
  { name: 'unreal-pixel-stream',  engines: ['unreal'],    desc: 'UE5 container with pixel streaming, k8s ingress, GPU node pool.' },
  { name: 'godot-web-platformer', engines: ['godot'],     desc: 'Godot 4 web export, controller + keyboard input, save state.' },
  { name: 'webgpu-compute-lab',   engines: ['webgpu'],    desc: 'Compute-shader playground. Particles, BVH, raymarcher.' }
];

type DeployGroup = { label: string; items: { id: string; name: string; blurb: string; icon: any }[] };

const DEPLOY_TARGETS: DeployGroup[] = [
  {
    label: 'Cluster & Containers',
    items: [
      { id: 'k8s-pod',           name: 'Kubernetes Pod',     icon: Cloud,    blurb: 'Single-pod dev environment, HMR live reload.' },
      { id: 'k8s-deployment',    name: 'K8s Deployment',     icon: Layers,   blurb: 'Replicated, autoscale, ingress + load balancer.' },
      { id: 'k8s-dev-container', name: 'K8s Dev Container',  icon: Terminal, blurb: 'Live-mount workspace, in-cluster file sync.' },
      { id: 'docker-image',      name: 'Docker Image',       icon: Box,      blurb: 'Build & push a portable runtime image to any registry.' },
      { id: 'docker-container',  name: 'Docker Container',   icon: Boxes,    blurb: 'Run a single containerized workspace locally.' },
      { id: 'podman-container',  name: 'Podman (rootless)',  icon: Boxes,    blurb: 'Rootless container runtime with UID mapping preserved.' },
      { id: 'self-hosted-vps',   name: 'Self-Hosted VPS',    icon: ServerIcon, blurb: 'Ansible-provisioned bare-metal VPS, Hetzner / DO / OVH.' }
    ]
  },
  {
    label: 'Static, Edge & Serverless',
    items: [
      { id: 'static-site',       name: 'Static Site',        icon: Globe,    blurb: 'Build a static bundle, upload to any static host.' },
      { id: 'vercel',            name: 'Vercel',             icon: Zap,      blurb: 'Edge-cached deploys with HMR + preview URLs.' },
      { id: 'netlify',           name: 'Netlify',            icon: Zap,      blurb: 'Atomic deploys + edge functions.' },
      { id: 'cloudflare-pages',  name: 'Cloudflare Pages',   icon: Globe,    blurb: 'Global edge deploy with KV bindings.' },
      { id: 'edge-worker',       name: 'Edge Worker',        icon: Cpu,      blurb: 'Cloudflare Workers / Deno Deploy / Vercel Edge.' },
      { id: 'aws-amplify',       name: 'AWS Amplify',        icon: Cloud,    blurb: 'Full-stack hosting with CI/CD from your repo.' },
      { id: 'github-pages',      name: 'GitHub Pages',       icon: Github,   blurb: 'Push to main, get a *.github.io URL.' },
      { id: 'firebase-hosting',  name: 'Firebase Hosting',   icon: Cloud,    blurb: 'Globally cached static + SSR hosting.' },
      { id: 'bun-runtime',       name: 'Bun Runtime',        icon: Cpu,      blurb: 'Bun-native edge with native WebGPU shims.' },
      { id: 'railway',           name: 'Railway',            icon: TrainIcon,blurb: 'One-click PaaS with Postgres + volumes.' },
      { id: 'fly-io',            name: 'Fly.io',             icon: PlaneIcon,blurb: 'Edge PaaS with WireGuard mesh + volumes.' },
      { id: 'render',            name: 'Render',             icon: Cloud,    blurb: 'Web services, static sites, and cron jobs.' }
    ]
  },
  {
    label: 'Client Runtimes & Distribution',
    items: [
      { id: 'pwa',               name: 'PWA',                icon: Globe,    blurb: 'Installable web app with offline glTF cache.' },
      { id: 'webxr',             name: 'WebXR',              icon: Sparkles, blurb: 'Quest, Vision Pro, Android XR — controller + hand tracking.' },
      { id: 'iframe-embed',      name: 'iframe Embed',       icon: Box,      blurb: 'Drop the 3D scene into any site, sandboxed + signed.' },
      { id: 'wasm-module',       name: 'WebAssembly Module', icon: Cpu,      blurb: 'Standalone .wasm + .mjs export, importable anywhere.' },
      { id: 'desktop-tauri',     name: 'Desktop (Tauri)',    icon: Cpu,      blurb: 'Tiny, fast native shell, ~8MB, all OSes.' },
      { id: 'desktop-electron',  name: 'Desktop (Electron)', icon: Cpu,      blurb: 'Cross-platform installers with auto-update.' },
      { id: 'mobile-capacitor',  name: 'Mobile (Capacitor)', icon: Boxes,    blurb: 'iOS + Android via native WebView shell.' },
      { id: 'npm-package',       name: 'NPM Package',        icon: PackageIcon, blurb: 'Publish a reusable engine / library to the registry.' },
      { id: 'asset-cdn',         name: 'Asset CDN',          icon: Cloud,    blurb: 'Cloudflare R2 / S3 / Fastly / Bunny for glTF + textures.' },
      { id: 'local-process',     name: 'Local Process',      icon: Cpu,      blurb: 'Just spin it up on your machine.' }
    ]
  }
];

// ============== PAGE ==============
export default function Landing() {
  const { isSetupComplete, hasSeenLanding, markLandingSeen, resetLanding } = useWorkspace();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLaunch = () => {
    if (!isSetupComplete) {
      // First click: leave the landing and enter the workspace setup gate.
      markLandingSeen();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05060a] text-[var(--ui-text)] overflow-x-hidden">
      {/* ambient noise gradient */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(1200px 600px at 70% -10%, rgba(0,212,255,0.10), transparent 60%),' +
            'radial-gradient(900px 500px at 0% 10%, rgba(139,92,246,0.08), transparent 60%),' +
            'radial-gradient(800px 600px at 50% 100%, rgba(16,185,129,0.06), transparent 60%)'
        }}
      />

      {/* ============== NAV ============== */}
      <header className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled ? "border-white/5 bg-[#05060a]/80 backdrop-blur-xl" : "border-transparent"
      )}>
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <a href="#top" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 relative">
              <AetherNodeSvg />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight">AetherOS</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--ui-text-muted)]">Spatial Cloud IDE</span>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-[var(--ui-text-muted)]">
            <a href="#engines" className="hover:text-white transition-colors">Engines</a>
            <a href="#templates" className="hover:text-white transition-colors">Templates</a>
            <a href="#deploy" className="hover:text-white transition-colors">Deploy</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#why" className="hover:text-white transition-colors">Why spatial</a>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a href="https://github.com" target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[12px] text-[var(--ui-text-muted)] hover:text-white px-2 py-1.5">
              <Github className="w-3.5 h-3.5" />
              <Star className="w-3 h-3" />
              <span>14.2k</span>
            </a>
            <button onClick={handleLaunch}
              className="text-[12px] font-semibold px-3.5 py-1.5 rounded-md border border-white/10 text-white/90 hover:bg-white/5 transition-colors">
              Sign in
            </button>
            <button onClick={handleLaunch}
              className="text-[12px] font-semibold px-3.5 py-1.5 rounded-md bg-[var(--ui-accent)] text-black hover:brightness-110 transition-all flex items-center gap-1.5">
              Launch Workspace <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>
      </header>

      {/* ============== HERO ============== */}
      <section id="top" className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--ui-accent)] border border-[var(--ui-accent)]/30 bg-[var(--ui-accent)]/5 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ui-accent)] animate-pulse" />
              v3.0 · Now with Godot & WebGPU
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.95]">
              A new way of <br />
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#8b5cf6] to-[#10b981] bg-clip-text text-transparent">
                doing everything.
              </span>
            </h1>
            <p className="mt-6 text-lg text-[var(--ui-text-muted)] max-w-xl leading-relaxed">
              AetherOS is a cloud IDE for 3D — like Coder, but your file tree is a spatial scene, your editor compiles to <span className="text-white">six engines</span>, and your workspace ships as a <span className="text-white">Kubernetes pod</span> or <span className="text-white">Docker image</span>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={handleLaunch}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-black font-semibold text-sm hover:brightness-95 transition-all">
                <Play className="w-4 h-4 fill-black" />
                Launch a workspace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <a href="#templates"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/10 text-white/90 text-sm hover:bg-white/5 transition-colors">
                Browse 3D templates
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { k: '8',   v: 'engines supported' },
                { k: '12k+', v: 'workspaces spun up' },
                { k: '<8s', v: 'pod cold start' }
              ].map(s => (
                <div key={s.v}>
                  <div className="text-2xl font-bold tracking-tight">{s.k}</div>
                  <div className="text-[11px] text-[var(--ui-text-muted)] uppercase tracking-wider">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D HERO */}
          <div className="relative aspect-square w-full max-w-[560px] mx-auto">
            <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-[#0a0b0e] to-black shadow-2xl shadow-black/60">
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
                <Suspense fallback={null}>
                  <HeroScene />
                </Suspense>
              </Canvas>

              {/* HUD overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-[var(--ui-text-muted)] pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  aether://cluster/main
                </div>
                <div>FPS 60 · DPR 2</div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-[var(--ui-text-muted)] pointer-events-none">
                <div>pods: <span className="text-emerald-400">6/6</span> · gpu: <span className="text-[var(--ui-accent)]">A100</span></div>
                <div>scene: Default Setup</div>
              </div>
            </div>
            {/* faint glow under hero */}
            <div className="absolute -inset-8 -z-10 rounded-[40px] bg-[var(--ui-accent)]/10 blur-3xl" />
          </div>
        </div>

        <div className="mt-20 flex items-center justify-center text-[var(--ui-text-muted)]">
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ============== ENGINES BAR ============== */}
      <section id="engines" className="relative z-10 border-y border-white/5 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--ui-text-muted)] mb-4 text-center">
            One scene. Eight engines. Zero lock-in.
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {ENGINES.map(e => (
              <div key={e.id} className="group p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:border-[var(--ui-accent)]/40 hover:bg-[var(--ui-accent)]/5 transition-all text-center">
                <e.icon className="w-4 h-4 mx-auto mb-1.5 text-[var(--ui-accent)] group-hover:scale-110 transition-transform" />
                <div className="text-[11px] font-semibold">{e.name}</div>
                <div className="text-[9px] text-[var(--ui-text-muted)] mt-0.5">{e.blurb}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section id="how" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-14">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--ui-accent)] mb-3">How it works</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">From template to running pod, in one workspace.</h2>
          <p className="mt-4 text-[var(--ui-text-muted)] text-lg">
            Pick a 3D engine template, edit in the browser, and ship to a Kubernetes pod, a Docker image, or a dev container — no local install required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { step: '01', title: 'Pick a template',     desc: 'Start from a curated engine starter: Three.js, Babylon, PlayCanvas, Unity WASM, Unreal, Godot, or WebGPU. Each ships with HMR, glTF pipeline, and a Scene Graph already wired.', icon: Box },
            { step: '02', title: 'Edit in space',       desc: 'Drag meshes into the Spatial Canvas, run the AI Architect to grow the scene, and iterate with live preview. Everything is checkpointed, diffable, and reversible.', icon: Sparkles },
            { step: '03', title: 'Ship to a cluster',   desc: 'Spin up a k8s pod, scale to a deployment, or build a Docker image. OpenCode agents watch your pods and heal them when they drift.', icon: Cloud }
          ].map(s => (
            <div key={s.step} className="relative p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-[var(--ui-accent)]/30 transition-colors">
              <div className="text-[10px] font-mono text-[var(--ui-accent)] mb-3">{s.step}</div>
              <s.icon className="w-5 h-5 text-white mb-3" />
              <div className="text-lg font-semibold mb-1.5">{s.title}</div>
              <p className="text-[13px] text-[var(--ui-text-muted)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============== TEMPLATES ============== */}
      <section id="templates" className="relative z-10 border-t border-white/5 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-10">
            <div className="max-w-xl">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--ui-accent)] mb-3">Templates</div>
              <h2 className="text-4xl font-bold tracking-tight">Start with a real engine, not a blank file.</h2>
            </div>
            <button onClick={handleLaunch}
              className="hidden md:inline-flex items-center gap-1.5 text-sm text-[var(--ui-text-muted)] hover:text-white">
              View all templates <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map(t => (
              <div key={t.name} className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[var(--ui-accent)]/40 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  {t.engines.map(e => {
                    const eng = ENGINES.find(x => x.id === e);
                    if (!eng) return null;
                    const Icon = eng.icon;
                    return (
                      <span key={e} className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[var(--ui-text-muted)]">
                        <Icon className="w-2.5 h-2.5" /> {eng.name}
                      </span>
                    );
                  })}
                </div>
                <div className="text-sm font-mono text-white/90 mb-1.5">{t.name}</div>
                <p className="text-[12px] text-[var(--ui-text-muted)] leading-relaxed">{t.desc}</p>
                <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={handleLaunch}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded bg-[var(--ui-accent)] text-black">
                    Use template
                  </button>
                  <button className="text-[11px] text-[var(--ui-text-muted)] hover:text-white">Preview</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== WHY SPATIAL ============== */}
      <section id="why" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-14">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--ui-accent)] mb-3">Why spatial</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Your IDE is flat. Your code isn't.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              kind: 'cube' as const, title: 'Spatial Canvas', desc: 'A real Three.js scene is the workspace. Add, move, and group meshes the way you think about them — spatially.',
              icon: Box
            },
            {
              kind: 'octa' as const, title: 'AI Spatial Architect', desc: 'Describe a scene in plain English. The Architect returns real WorldEntity objects with transforms, materials, and lights.',
              icon: Sparkles
            },
            {
              kind: 'sphere' as const, title: 'OpenCode-native agent', desc: 'Powered by OpenCode AI. Your OpenCode server is the brain — sessions, tools, file edits, terminal, all in one plane.',
              icon: Command
            },
            {
              kind: 'torus' as const, title: 'Cluster as a feature', desc: 'Pods, deployments, dev containers, Docker images — first-class. No plugin, no YAML, no kubectl. Just click.',
              icon: Cloud
            },
            {
              kind: 'cone' as const, title: 'Real-time collab', desc: 'Multiplayer scene sync over Socket.IO. See cursors, entity moves, and AI edits live in the canvas.',
              icon: GitBranch
            },
            {
              kind: 'cube' as const, title: 'Database, Git, Search', desc: 'Postgres browser, branch & history, full-text search over scenes, entities, files, and symbols. Cmd-K everything.',
              icon: Database
            }
          ].map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[var(--ui-accent)]/30 transition-all flex gap-5">
              <div className="w-16 h-16 rounded-xl bg-black/50 border border-white/5 overflow-hidden shrink-0">
                <MiniCanvas kind={f.kind} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <f.icon className="w-3.5 h-3.5 text-[var(--ui-accent)]" />
                  <div className="text-base font-semibold">{f.title}</div>
                </div>
                <p className="text-[13px] text-[var(--ui-text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============== DEPLOY ============== */}
      <section id="deploy" className="relative z-10 border-t border-white/5 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-12">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--ui-accent)] mb-3">Deploy anywhere</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ship your workspace, not just your code.</h2>
            <p className="mt-4 text-[var(--ui-text-muted)] text-lg">
              {DEPLOY_TARGETS.reduce((n, g) => n + g.items.length, 0)} first-class deployment targets. The OpenCode agent wires ingress, secrets, and HMR for you.
            </p>
          </div>

          <div className="space-y-12">
            {DEPLOY_TARGETS.map(group => (
              <div key={group.label}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white font-semibold">{group.label}</div>
                  <div className="flex-1 h-px bg-white/5" />
                  <div className="text-[10px] font-mono text-[var(--ui-text-muted)]">{group.items.length} targets</div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {group.items.map(t => {
                    const Icon = t.icon;
                    return (
                      <div key={t.id} className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[var(--ui-accent)]/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="w-4 h-4 text-[var(--ui-accent)]" />
                          <div className="text-[13px] font-semibold">{t.name}</div>
                        </div>
                        <p className="text-[11.5px] text-[var(--ui-text-muted)] leading-relaxed">{t.blurb}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== TERMINAL PROOF ============== */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <div className="rounded-2xl border border-white/5 bg-black/60 overflow-hidden shadow-2xl shadow-black/60">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 text-[11px] font-mono text-[var(--ui-text-muted)]">spatial-shell · k8s-pod</span>
          </div>
          <pre className="px-5 py-5 text-[12.5px] font-mono leading-relaxed text-[var(--ui-text-muted)] overflow-x-auto">
{`$ aether spin-up three --target k8s-deployment --replicas 3
✔ provisioning 3D Cluster Stack: THREE with Target K8S_DEPLOYMENT
✔ applying load balancers and ingress hosts config...
✔ Kubernetes Deployment finalized successfully: 3 active replicas running perfectly.

$ aether ship --target edge-worker --region iad
✔ compiling edge runtime bundle (Cloudflare Workers)
✔ shimming WebGPU → compute workers (WASM fallback enabled)
✔ edge worker live in iad. cold start < 5ms.

$ aether deploy --target webxr --runtime meta-quest
✔ generating left/right eye render targets at 90Hz
✔ hooking controller raycast + pinch gestures
✔ WebXR build deployed for meta-quest. Enter VR from the canvas.

$ aether publish --target npm --name @aether/three-engine
✔ @aether/three-engine@latest published. public access.`}
          </pre>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Stop building 3D the <span className="line-through text-[var(--ui-text-muted)]">flat</span> way.
          </h2>
          <p className="mt-4 text-[var(--ui-text-muted)] text-lg max-w-xl mx-auto">
            Launch a workspace, pick an engine template, and ship the cluster in under a minute.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={handleLaunch}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--ui-accent)] text-black font-semibold text-sm hover:brightness-110 transition-all">
              <Sparkles className="w-4 h-4" />
              Launch a workspace
              <ArrowRight className="w-4 h-4" />
            </button>
            <a href="#how"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-white text-sm hover:bg-white/5 transition-colors">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center gap-6 text-[12px] text-[var(--ui-text-muted)]">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5"><AetherNodeSvg /></div>
            <span className="font-semibold text-white">AetherOS</span>
            <span>· Ai-Wonderland</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#engines" className="hover:text-white">Engines</a>
            <a href="#templates" className="hover:text-white">Templates</a>
            <a href="#deploy" className="hover:text-white">Deploy</a>
            <a href="#why" className="hover:text-white">Why spatial</a>
          </div>
          <div className="md:ml-auto">© 2026 AetherOS · Built in 3D</div>
        </div>
      </footer>
    </div>
  );
}

// ============== LOGO: Aether wireframe icosahedron in 2D ==============
function AetherNodeSvg() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <g stroke="url(#ag)" strokeWidth="1.1" fill="none">
        <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" />
        <polygon points="16,2 22,16 4,9"  />
        <polygon points="16,2 28,9 22,16" />
        <polygon points="4,9  10,16 22,16" />
        <polygon points="10,16 4,23 22,16 28,9" />
        <polygon points="16,30 4,23 10,16" />
        <polygon points="16,30 22,16 28,23" />
      </g>
      <circle cx="16" cy="16" r="1.4" fill="#00d4ff" />
    </svg>
  );
}
