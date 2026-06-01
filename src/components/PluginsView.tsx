import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Puzzle, 
  Check, 
  Trash2, 
  Activity, 
  Grid, 
  Terminal as TermIcon, 
  Flame, 
  RotateCw, 
  Play, 
  Sparkles, 
  Eye, 
  Compass, 
  Database, 
  Radio, 
  Sliders 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PluginExtension {
  id: string;
  name: string;
  category: 'graphics' | 'physics' | 'intelligence' | 'networking' | 'utility';
  version: string;
  provider: string;
  description: string;
  isInstalled: boolean;
  isActive: boolean;
  performanceOverhead: number; // millisecond cost
  memoryCost: number; // in MB
  stats?: { label: string; value: string }[];
}

const INITIAL_PLUGINS: PluginExtension[] = [
  {
    id: "post-processing",
    name: "Cinematic Bloom & Lens FX",
    category: "graphics",
    version: "v2.1.0",
    provider: "Spatial Standard Labs",
    description: "Multi-pass post-processing pipeline featuring adaptive tone mapping, orbital glare bloom, and ambient occlusion.",
    isInstalled: true,
    isActive: true,
    performanceOverhead: 0.28,
    memoryCost: 42,
    stats: [
      { label: "Render Pass Count", value: "3 passes" },
      { label: "FBO Buffer Fmt", value: "RGBA16F" }
    ]
  },
  {
    id: "rapier-physics",
    name: "GPU Rapier Engine",
    category: "physics",
    version: "v4.8.4",
    provider: "Rust WASM Core",
    description: "High-performance rigid-body simulator using parallel WASM threads, gravity fields, and precise mesh collisions.",
    isInstalled: true,
    isActive: true,
    performanceOverhead: 1.45,
    memoryCost: 128,
    stats: [
      { label: "Active Solvers", value: "240 nodes" },
      { label: "Constraint Error Rate", value: "0.001%" }
    ]
  },
  {
    id: "ai-mesh-synth",
    name: "Gemini Mesh Generator",
    category: "intelligence",
    version: "v1.5.Pro",
    provider: "Spatial Core Labs",
    description: "Real-time prompt-to-3D mesh model reconstruction. Generates vertices & texture patterns directly in the sandbox canvas.",
    isInstalled: false,
    isActive: false,
    performanceOverhead: 0.05,
    memoryCost: 0,
    stats: [
      { label: "Avg Synthesis", value: "8.2s" },
      { label: "API Calls Queue", value: "0/s" }
    ]
  },
  {
    id: "multiplayer-socket",
    name: "Cluster Sync Relay",
    category: "networking",
    version: "v0.9.3",
    provider: "Kubernetes Infra Group",
    description: "Websocket replication loop for distributed multiuser avatar state, chat triggers, and real-time environment delta logs.",
    isInstalled: true,
    isActive: false,
    performanceOverhead: 0.12,
    memoryCost: 14,
    stats: [
      { label: "Protocol", value: "WSS Binary" },
      { label: "Heartbeat Interval", value: "45ms" }
    ]
  },
  {
    id: "fluid-simulation",
    name: "Volumetric SPH Fluids",
    category: "graphics",
    version: "v1.0.1",
    provider: "Fluid Dynamics Lab",
    description: "SPH (Smoothed Particle Hydrodynamics) volume water bodies, ocean waves generator, and interactive ripple feedback.",
    isInstalled: false,
    isActive: false,
    performanceOverhead: 3.12,
    memoryCost: 0,
    stats: [
      { label: "Particle Threshold Limit", value: "65k particles" },
      { label: "Solver Steps/sec", value: "12 steps" }
    ]
  },
  {
    id: "telemetry-d3-probe",
    name: "D3 Cluster Telemetry Probe",
    category: "utility",
    version: "v2.5.0",
    provider: "Kubernetes Infra Group",
    description: "Automated telemetry gatherer monitoring cluster CPU spikes, pod state logs, and memory heap values.",
    isInstalled: true,
    isActive: true,
    performanceOverhead: 0.11,
    memoryCost: 8,
    stats: [
      { label: "Sampling Jitter", value: "+-2.1%" },
      { label: "Metrics Gather Rate", value: "1000ms" }
    ]
  },
  {
    id: "fpv-controller",
    name: "FPV Camera Flight Simulator",
    category: "graphics",
    version: "v1.2.5",
    provider: "Spatial Standard Labs",
    description: "Unlocks First-Person View (FPV) orbital translation, flight controls, camera physics, and custom Field of View options inside the spatial workspace sandbox.",
    isInstalled: false,
    isActive: false,
    performanceOverhead: 0.45,
    memoryCost: 0,
    stats: [
      { label: "Control Latency", value: "1.2ms" },
      { label: "Default FOV", value: "85deg" }
    ]
  },
  {
    id: "npc-routing",
    name: "AI Autonomous NPC Pathfinder",
    category: "intelligence",
    version: "v3.0.0",
    provider: "Neural Mesh Labs",
    description: "Autonomous non-player character model paths, dynamic coordinate navigation mesh (NavMesh) solver, and AI behavior patterns.",
    isInstalled: false,
    isActive: false,
    performanceOverhead: 1.85,
    memoryCost: 0,
    stats: [
      { label: "Route Precision", value: "99.8%" },
      { label: "Agent Replicas", value: "Configurable" }
    ]
  },
  {
    id: "vid-to-3d-splatting",
    name: "Real-Live Video-to-3D Splatter",
    category: "intelligence",
    version: "v2.4-beta",
    provider: "Spatial Core Labs",
    description: "Direct server-side video, depth buffers, and real-live video stream parsing into 3D Gaussian Splats and volumetric mesh formats inside the WebGPU pipeline.",
    isInstalled: false,
    isActive: false,
    performanceOverhead: 4.25,
    memoryCost: 0,
    stats: [
      { label: "Splat Count", value: "1.2M splats" },
      { label: "Processing Speed", value: "30fps" }
    ]
  }
];

export default function PluginsView() {
  const { addAgentLog } = useWorkspace();
  const [plugins, setPlugins] = useState<PluginExtension[]>(INITIAL_PLUGINS);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'installed' | 'graphics' | 'physics' | 'intelligence' | 'networking'>('all');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'market' | 'debug'>('market');

  const handleInstall = (id: string, name: string) => {
    setInstallingId(id);
    addAgentLog(`Injecting plugin bundle: ${name}...`, 'thinking');
    
    setTimeout(() => {
      setPlugins(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, isInstalled: true, isActive: true, memoryCost: Math.round(Math.random() * 60 + 15) };
        }
        return p;
      }));
      setInstallingId(null);
      addAgentLog(`Successfully registered ${name} in kernel routing space`, 'success');
    }, 1800);
  };

  const handleUninstall = (id: string, name: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, isInstalled: false, isActive: false, memoryCost: 0 };
      }
      return p;
    }));
    addAgentLog(`Deprovisioned plugin extension: ${name}`, 'warning');
  };

  const toggleActive = (id: string, name: string, currentlyActive: boolean) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, isActive: !currentlyActive };
      }
      return p;
    }));
    addAgentLog(`${currentlyActive ? 'Deactivated' : 'Activated'} extension kernel bindings: ${name}`, currentlyActive ? 'warning' : 'info');
  };

  // Compute Telemetry Stats
  const activePlugins = plugins.filter(p => p.isInstalled && p.isActive);
  const totalOverhead = activePlugins.reduce((acc, curr) => acc + curr.performanceOverhead, 0);
  const totalMemory = activePlugins.reduce((acc, curr) => acc + curr.memoryCost, 0);

  const filtered = plugins.filter(p => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'installed') return p.isInstalled;
    return p.category === categoryFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto w-full h-full bg-[#06070a] select-none text-[#cbd5e1] font-sans">
      <div className="flex flex-col p-8 max-w-5xl mx-auto w-full py-10 space-y-8">
        
        {/* Dynamic Header */}
        <header className="pb-5 border-b border-[#151921] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[9px] text-[#64748b] tracking-wider uppercase mb-1 flex items-center gap-1.5">
              <span>SANDBOX ARCHITECT</span>
              <span>•</span>
              <span className="text-[#a78bfa]">PLUGINS & EXTENSIONS</span>
            </div>
            <h1 className="text-[20px] font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
              <Puzzle className="w-5 h-5 text-[#00b8ff]" />
              Plugin Orchestrator
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5 max-w-xl">
              Inject custom shaders, physics engines, or analytics relays into the WebGPU and WASI kernel pipelines.
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('market')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wide flex items-center gap-1.5",
                activeTab === 'market' ? "bg-white/10 border border-white/15 text-white" : "text-zinc-500 hover:text-zinc-400"
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              Registry
            </button>
            <button 
              onClick={() => setActiveTab('debug')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wide flex items-center gap-1.5",
                activeTab === 'debug' ? "bg-white/10 border border-white/15 text-white" : "text-zinc-500 hover:text-zinc-400"
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              Runtime Debugger
            </button>
          </div>
        </header>

        {/* Runtime Performance HUD Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0b0c10] border border-[#151921] rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">Active Engines/Exts</span>
              <span className="text-xl font-mono font-bold text-white leading-none">
                {activePlugins.length} <span className="text-zinc-600 text-[10px] font-normal">loaded</span>
              </span>
            </div>
            <Grid className="w-7 h-7 text-[#00e5a0]/40" />
          </div>

          <div className="bg-[#0b0c10] border border-[#151921] rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">Render Delay Impact</span>
              <span className="text-xl font-mono font-bold text-white leading-none">
                +{totalOverhead.toFixed(2)}ms <span className="text-[#64748b] text-[10px] font-normal">/ tick</span>
              </span>
            </div>
            <Flame className="w-7 h-7 text-amber-500/40" />
          </div>

          <div className="bg-[#0b0c10] border border-[#151921] rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">WASM Heap Allocation</span>
              <span className="text-xl font-mono font-bold text-white leading-none">
                {totalMemory}Mb <span className="text-[#64748b] text-[10px] font-normal">RAM</span>
              </span>
            </div>
            <Sliders className="w-7 h-7 text-[#00b8ff]/40" />
          </div>
        </div>

        {activeTab === 'market' ? (
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <FilterBtn label="All Modules" active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} />
              <FilterBtn label="Installed" active={categoryFilter === 'installed'} onClick={() => setCategoryFilter('installed')} />
              <FilterBtn label="Graphics" active={categoryFilter === 'graphics'} onClick={() => setCategoryFilter('graphics')} />
              <FilterBtn label="Physics" active={categoryFilter === 'physics'} onClick={() => setCategoryFilter('physics')} />
              <FilterBtn label="Intelligence" active={categoryFilter === 'intelligence'} onClick={() => setCategoryFilter('intelligence')} />
              <FilterBtn label="Networking" active={categoryFilter === 'networking'} onClick={() => setCategoryFilter('networking')} />
            </div>

            {/* Grid of Plugins */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((p) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={p.id}
                    className={cn(
                      "bg-[#0e1115] border border-[#1b1f26] rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700/50 transition-all group",
                      p.isActive && "ring-1 ring-[#00b8ff]/20 bg-[#00b8ff]/[0.01]"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-[8px] font-mono tracking-widest text-[#a78bfa] font-bold uppercase bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500">
                          <span>{p.version}</span>
                          <span>•</span>
                          <span className="text-zinc-600">{p.provider}</span>
                        </div>
                      </div>

                      <h3 className="text-[13px] font-extrabold text-[#f1f5f9] tracking-wide mt-3 group-hover:text-white transition-colors">
                        {p.name}
                      </h3>
                      
                      <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                        {p.description}
                      </p>

                      {p.isInstalled && p.stats && (
                        <div className="mt-4 grid grid-cols-2 gap-2 bg-[#06070a]/50 border border-white/[0.03] rounded-lg p-2.5 font-mono text-[9px]">
                          {p.stats.map(s => (
                            <div key={s.label}>
                              <span className="text-zinc-600 block">{s.label}</span>
                              <span className="text-zinc-400 font-bold">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/[0.03] flex items-center justify-between">
                      <div className="flex items-center gap-4 font-mono text-[9px] text-zinc-500">
                        <div>
                          <span className="text-zinc-600">Tick Delay:</span>{' '}
                          <span className={cn("font-bold", p.performanceOverhead > 1 ? "text-amber-500" : "text-[#00e5a0]")}>
                            {p.performanceOverhead > 0 ? `+${p.performanceOverhead}ms` : 'Negligible'}
                          </span>
                        </div>
                        {p.isInstalled && (
                          <div>
                            <span className="text-zinc-600">Heap Allocation:</span>{' '}
                            <span className="text-zinc-300 font-bold">{p.memoryCost}Mb</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {p.isInstalled ? (
                          <>
                            <button
                              onClick={() => toggleActive(p.id, p.name, p.isActive)}
                              className={cn(
                                "h-7 px-3 rounded-lg text-[9px] font-mono font-bold transition-all uppercase",
                                p.isActive 
                                  ? "bg-[#00e5a0]/15 border border-[#00e5a0]/25 text-[#00e5a0] hover:bg-[#00e5a0]/25" 
                                  : "bg-white/5 border border-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                              )}
                            >
                              {p.isActive ? "ACTIVE_STATE" : "DISABLED"}
                            </button>
                            <button
                              onClick={() => handleUninstall(p.id, p.name)}
                              className="h-7 w-7 flex items-center justify-center bg-red-500/5 hover:bg-red-500/15 text-zinc-500 hover:text-red-400 border border-white/5 hover:border-red-500/10 rounded-lg transition-all"
                              title="Delete extension bundle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleInstall(p.id, p.name)}
                            disabled={installingId === p.id}
                            className="bg-blue-600/10 hover:bg-blue-600/20 active:scale-95 text-blue-400 text-[9px] font-mono font-bold border border-blue-500/20 hover:border-blue-500/30 px-3.5 h-7 rounded-lg transition-all flex items-center gap-1 leading-none disabled:opacity-50"
                          >
                            {installingId === p.id ? (
                              <>
                                <RotateCw className="w-3 h-3 animate-spin text-blue-400" />
                                INJECTING...
                              </>
                            ) : (
                              <>
                                INJECT_MODULE
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Raw System Telemetry logs */}
            <div className="bg-[#0b0c10] border border-[#151921] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Memory Debug Trace</h3>
                  <p className="text-[11px] text-zinc-600">Garbage collection profile logs and thread schedules.</p>
                </div>
                <button
                  onClick={() => addAgentLog("Forced system garbage recovery pass complete", "info")}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-mono font-bold text-zinc-300 border border-white/5 rounded-lg transition-all uppercase"
                >
                  Force GC Dump
                </button>
              </div>

              <div className="bg-[#06070a] border border-[#151921] rounded-lg p-4 font-mono text-[10.5px] text-zinc-500 leading-relaxed overflow-x-auto space-y-1">
                <div>[04:41:20] <span className="text-[#00e5a0] font-bold">[GC_OK]</span> Reallocated heap bucket index 0 through 4 (deallocated 12.8M)</div>
                <div>[04:41:45] <span className="text-[#00b8ff] font-bold">[T_PASS]</span> Physics stepRapier3d executed in 1.48ms (240 constraints)</div>
                <div>[04:42:10] <span className="text-[#00b8ff] font-bold">[T_PASS]</span> Multi-shd BloomFilter rendered 3 FBO frames (0.24ms)</div>
                <div>[04:42:35] <span className="text-zinc-600">[STANDBY]</span> Waiting for telemetry polling iteration signal...</div>
                <div>[04:43:00] <span className="text-[#a78bfa] font-bold">[TELEMETRY]</span> Collected 12 metrics pointers. Buffer flush success.</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0b0c10] border border-[#151921] rounded-xl p-5 space-y-3">
                <span className="font-mono text-[9px] text-[#00b8ff] font-bold uppercase tracking-wider block">WASM Isolation Sandbox</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every plugin is compiled down to high-performance WebAssembly virtual runtimes and executed within a secure thread sandbox. It limits frame-jumps and protects workspace stability.
                </p>
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-lg p-3 font-mono text-[10px]">
                  <div>
                    <span className="text-zinc-500">Isolation Layer:</span>{' '}
                    <span className="text-white font-bold">WASI 0.2.0 (Stable)</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b0c10] border border-[#151921] rounded-xl p-5 space-y-3">
                <span className="font-mono text-[9px] text-purple-400 font-bold uppercase tracking-wider block">Extension Hot-Routing</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The Spatial IDE router supports zero-downtime hot reloading. Toggling state dynamically injects or detaches assembly linkages, without resetting your viewport coordinate states.
                </p>
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-lg p-3 font-mono text-[10px]">
                  <div>
                    <span className="text-zinc-500">Live Dynamic Binding:</span>{' '}
                    <span className="text-emerald-400 font-bold">READY_HOT_RELOAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 bg-[#0e1115] border rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all",
        active ? "border-[#00b8ff] text-[#00b8ff] bg-[#00b8ff]/5" : "border-white/5 text-zinc-500 hover:text-zinc-400 hover:border-zinc-700"
      )}
    >
      {label}
    </button>
  );
}
