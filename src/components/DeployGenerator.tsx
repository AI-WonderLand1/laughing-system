import React, { useState, useMemo, useEffect } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Download, FileCode, RefreshCw, Eye, FolderOpen, Check, Copy, ArrowRight, Box, Sparkles } from 'lucide-react';
import { generateConfig, Engine, Target, GeneratedFile } from '../lib/configGenerator';
import { cn } from '../lib/utils';

// Full list of engines + targets (mirrored from configGenerator for UI)
const ENGINES: { id: Engine; label: string; color: string }[] = [
  { id: 'three',    label: 'Three.js',   color: '#06b6d4' },
  { id: 'babylon',  label: 'Babylon.js', color: '#8b5cf6' },
  { id: 'playcanvas', label: 'PlayCanvas', color: '#10b981' },
  { id: 'unity',    label: 'Unity WASM',  color: '#f43f5e' },
  { id: 'unreal',   label: 'Unreal',     color: '#ffb340' },
  { id: 'godot',    label: 'Godot 4',    color: '#00e5a0' },
  { id: 'webgpu',   label: 'WebGPU',     color: '#3b82f6' },
  { id: 'custom',   label: 'Custom',     color: '#94a3b8' }
];

const TARGET_GROUPS: { label: string; ids: Target[] }[] = [
  { label: 'Cluster & Container',     ids: ['k8s-pod', 'k8s-deployment', 'k8s-dev-container', 'docker-container', 'docker-image', 'podman-container', 'self-hosted-vps'] },
  { label: 'Static / Edge',           ids: ['static-site', 'vercel', 'netlify', 'cloudflare-pages', 'edge-worker', 'aws-amplify', 'github-pages', 'firebase-hosting', 'bun-runtime', 'railway', 'fly-io', 'render'] },
  { label: 'Client Runtime',          ids: ['pwa', 'webxr', 'iframe-embed', 'wasm-module'] },
  { label: 'Native Shell',            ids: ['desktop-tauri', 'desktop-electron', 'mobile-capacitor'] },
  { label: 'Distribution',            ids: ['npm-package', 'asset-cdn', 'local-process'] }
];

const TARGET_LABELS: Record<Target, string> = {
  'k8s-pod': 'Kubernetes Pod', 'k8s-deployment': 'K8s Deployment', 'k8s-dev-container': 'K8s Dev Container',
  'docker-container': 'Docker Container', 'docker-image': 'Docker Image', 'podman-container': 'Podman (rootless)', 'self-hosted-vps': 'Self-Hosted VPS',
  'static-site': 'Static Site', 'vercel': 'Vercel', 'netlify': 'Netlify', 'cloudflare-pages': 'Cloudflare Pages',
  'edge-worker': 'Edge Worker', 'aws-amplify': 'AWS Amplify', 'github-pages': 'GitHub Pages', 'firebase-hosting': 'Firebase Hosting',
  'bun-runtime': 'Bun Runtime', 'railway': 'Railway', 'fly-io': 'Fly.io', 'render': 'Render',
  'pwa': 'PWA', 'webxr': 'WebXR', 'iframe-embed': 'iframe Embed', 'wasm-module': 'WebAssembly Module',
  'desktop-tauri': 'Desktop (Tauri)', 'desktop-electron': 'Desktop (Electron)', 'mobile-capacitor': 'Mobile (Capacitor)',
  'npm-package': 'NPM Package', 'asset-cdn': 'Asset CDN', 'local-process': 'Local Process'
};

export default function DeployGenerator() {
  const { addAgentLog } = useWorkspace();
  const [engine, setEngine] = useState<Engine>('three');
  const [target, setTarget] = useState<Target>('vercel');
  const [projectName, setProjectName] = useState('my-3d-scene');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof generateConfig> | null>(null);
  const [copied, setCopied] = useState('');

  // Auto-generate from pending template engine (set by Landing "Use template" button)
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingDeployEngine') as Engine | null;
    if (pending && ENGINES.some(e => e.id === pending)) {
      setEngine(pending);
      const res = generateConfig(pending, target, { projectName });
      setResult(res);
      setSelectedFile(res.files[0]?.path ?? null);
      addAgentLog(`Generated ${res.files.length} files for ${pending} → ${target} (${res.estimatedSizeKb} KB)`, 'success');
      sessionStorage.removeItem('pendingDeployEngine');
    }
  }, []);

  const handleGenerate = () => {
    const res = generateConfig(engine, target, { projectName });
    setResult(res);
    setSelectedFile(res.files[0]?.path ?? null);
    addAgentLog(`Generated ${res.files.length} files for ${engine} → ${target} (${res.estimatedSizeKb} KB)`, 'success');
  };

  const currentFile = useMemo(() => {
    if (!result || !selectedFile) return null;
    return result.files.find(f => f.path === selectedFile) ?? null;
  }, [result, selectedFile]);

  const handleCopy = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(label);
      setTimeout(() => setCopied(''), 1500);
    } catch {}
  };

  const handleDownloadZip = async () => {
    if (!result) return;
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      result.files.forEach(f => {
        // Handle nested paths (k8s/, src-tauri/, etc.)
        const segments = f.path.split('/');
        let folder = zip;
        for (let i = 0; i < segments.length - 1; i++) {
          folder = folder.folder(segments[i])!;
        }
        folder.file(segments[segments.length - 1], f.content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.projectName}-${result.engine}-${result.target}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      addAgentLog(`Downloaded ${result.files.length}-file config bundle`, 'success');
    } catch {
      addAgentLog('JSZip not available. Install with: npm install jszip', 'error');
      // Fallback: can still show files inline
    }
  };

  const languageForFile = (f: GeneratedFile): string => {
    const ext = f.path.split('.').pop();
    const map: Record<string, string> = {
      ts: 'typescript', tsx: 'tsx', js: 'javascript', json: 'json',
      yml: 'yaml', yaml: 'yaml', toml: 'toml', sh: 'bash',
      dockerfile: 'dockerfile', cpp: 'cpp', rs: 'rust', md: 'markdown',
      conf: 'nginx', html: 'html', css: 'css', gitignore: 'plaintext'
    };
    return map[ext ?? ''] ?? 'plaintext';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--ui-bg)] text-[var(--ui-text)] overflow-hidden">
      <div className="max-w-5xl w-full mx-auto pt-8 px-6 flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--ui-accent)] mb-2">Deploy config generator</div>
          <h2 className="text-2xl font-bold tracking-tight">Pick engine → target → generate → download</h2>
          <p className="text-sm text-[var(--ui-text-muted)] mt-0.5">
            Real, runnable config files for your own infrastructure. Nothing runs on our side.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end mb-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--ui-text-muted)] font-semibold mb-2 block">Engine</label>
            <div className="flex flex-wrap gap-1.5">
              {ENGINES.map(e => (
                <button key={e.id} onClick={() => setEngine(e.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all",
                    engine === e.id
                      ? "bg-[var(--ui-accent)] text-black border-[var(--ui-accent)]"
                      : "border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:border-[var(--ui-accent)]/40"
                  )}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--ui-text-muted)] font-semibold mb-2 block">Target</label>
            <div className="flex flex-wrap gap-1.5">
              {TARGET_GROUPS.map(g => g.ids).flat().map(t => (
                <button key={t} onClick={() => setTarget(t)}
                  className={cn(
                    "px-2 py-1.5 rounded-md text-[10px] font-mono border transition-all",
                    target === t
                      ? "bg-[var(--ui-accent)]/20 text-[var(--ui-accent)] border-[var(--ui-accent)]/50"
                      : "border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:border-[var(--ui-accent)]/30"
                  )}
                >
                  {TARGET_LABELS[t].length > 16 ? TARGET_LABELS[t].slice(0, 15) + '…' : TARGET_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input value={projectName} onChange={e => setProjectName(e.target.value)}
              className="bg-[var(--ui-panel)] border border-[var(--ui-border)] rounded-lg px-3 py-1.5 text-[12px] outline-none focus:border-[var(--ui-accent)] w-36"
              placeholder="project-name"
            />
            <button onClick={handleGenerate}
              className="px-4 py-1.5 rounded-lg bg-[var(--ui-accent)] text-black font-semibold text-[12px] hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" /> Generate
            </button>
          </div>
        </div>

        {/* RESULTS */}
        {result && (
          <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
            {/* File list */}
            <aside className="w-60 shrink-0 overflow-y-auto rounded-xl border border-[var(--ui-border)] bg-[var(--ui-panel)]">
              <div className="p-3 border-b border-[var(--ui-border)] flex items-center justify-between">
                <div className="text-[11px] font-semibold flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[var(--ui-accent)]" />
                  {result.files.length} files
                </div>
                <span className="text-[10px] text-[var(--ui-text-muted)]">{result.estimatedSizeKb} KB</span>
              </div>
              <div className="p-1.5">
                {result.files.map(f => {
                  const folders = f.path.split('/');
                  const name = folders.pop();
                  const dir = folders.join('/');
                  return (
                    <button key={f.path}
                      onClick={() => setSelectedFile(f.path)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded text-[11px] font-mono transition-colors",
                        selectedFile === f.path
                          ? "bg-[var(--ui-accent)]/10 text-[var(--ui-accent)]"
                          : "text-[var(--ui-text-muted)] hover:bg-white/[0.03]"
                      )}
                    >
                      {dir && <span className="text-[9px] opacity-50">{dir}/</span>}
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* File preview */}
            <main className="flex-1 flex flex-col overflow-hidden rounded-xl border border-[var(--ui-border)]">
              <header className="h-10 border-b border-[var(--ui-border)] flex items-center px-3 gap-3 bg-[var(--ui-panel)]">
                {currentFile && (
                  <>
                    <FileCode className="w-3.5 h-3.5 text-[var(--ui-accent)]" />
                    <span className="text-[12px] font-mono">{currentFile.path}</span>
                    <span className="text-[10px] text-[var(--ui-text-muted)]">{languageForFile(currentFile)}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(currentFile.content, currentFile.path)}
                        className="p-1.5 rounded hover:bg-white/5 text-[var(--ui-text-muted)] hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied === currentFile.path ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </>
                )}
              </header>
              <div className="flex-1 overflow-auto p-4">
                {currentFile ? (
                  <pre className="text-[12px] font-mono leading-relaxed text-[var(--ui-text-muted)] whitespace-pre-wrap break-all">{currentFile.content}</pre>
                ) : (
                  <div className="text-center text-[var(--ui-text-muted)] text-xs py-16">Select a file to preview</div>
                )}
              </div>
            </main>

            {/* Right panel: deploy steps + download */}
            <aside className="w-56 shrink-0 flex flex-col gap-3">
              <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-panel)] p-3">
                <div className="text-[10px] uppercase tracking-wider text-[var(--ui-accent)] font-semibold mb-2">Deploy steps</div>
                <ol className="space-y-1.5">
                  {result.deploySteps.map((s, i) => (
                    <li key={i} className="text-[11px] font-mono text-[var(--ui-text-muted)] flex items-start gap-1.5">
                      <span className="text-[9px] text-[var(--ui-accent)] mt-0.5">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <button onClick={handleDownloadZip}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--ui-accent)] text-black font-semibold text-sm hover:brightness-110 transition-all"
              >
                <Download className="w-4 h-4" />
                Download .zip
              </button>
              <p className="text-[9px] text-center text-[var(--ui-text-muted)]">
                Real files. No infra provisioned.
              </p>
            </aside>
          </div>
        )}

        {/* Empty state */}
        {!result && (
          <div className="flex-1 flex items-center justify-center border border-dashed border-[var(--ui-border)] rounded-xl">
            <div className="text-center">
              <Box className="w-8 h-8 mx-auto text-[var(--ui-text-muted)] mb-3" />
              <p className="text-sm text-[var(--ui-text-muted)]">Pick an engine + target and click <span className="text-white font-semibold">Generate</span></p>
              <p className="text-[11px] text-[var(--ui-text-muted)] mt-1">~{Object.keys(TARGET_LABELS).length} targets, 8 engines, real configs for your infra</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
