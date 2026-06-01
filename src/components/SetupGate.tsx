import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Box, 
  ChevronRight,
  Database,
  Link2,
  Terminal,
  Activity,
  Server,
  Cloud,
  Layers,
  Cpu,
  Zap,
  Network,
  Globe,
  Settings,
  Sparkles,
  Command,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkspaceSetup, DeploymentTarget } from '../types';
import { motion, AnimatePresence } from 'motion/react';

type Step = 'orchestration' | 'connectivity' | 'deployment' | 'synthesis';

export default function SetupGate() {
  const { completeSetup, addAgentLog, resetLanding } = useWorkspace();
  const [currentStep, setCurrentStep] = useState<Step>('orchestration');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  
  // Custom interactive configs for Docs and Settings modals
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [maxThreads, setMaxThreads] = useState(8);
  const [verboseLogging, setVerboseLogging] = useState(true);
  const [advTelemetry, setAdvTelemetry] = useState(true);
  const [activeDocsTab, setActiveDocsTab] = useState<'engines' | 'modules' | 'topology' | 'faq'>('engines');
  
  // Setup State
  const [engine, setEngine] = useState<WorkspaceSetup['engineVersion']>('v3-stable');
  const [hybridModules, setHybridModules] = useState<string[]>(['wasi', 'assets', 'physics', 'mesh-opt']);
  const [editor, setEditor] = useState<WorkspaceSetup['editorMode']>('full');
  const [deployment, setDeployment] = useState<DeploymentTarget>('k8s-pod');
  const [sources, setSources] = useState({
    engine: 'https://kernel.spatial.io',
    assets: 'https://cdn.assets.io',
    telemetry: 'wss://telemetry.cluster.local'
  });
  const [customBuildOptions, setCustomBuildOptions] = useState({
    replicas: 3,
    baseImage: 'node:20-alpine',
    registryUrl: 'gcr.io/spatial-workspace/render-core:latest',
    exposedPort: 3000,
    mountPath: '/usr/src/app',
    autoUpdate: true,
    scalingMetric: 'CPU_utilization_80'
  });

  const steps: Step[] = ['orchestration', 'connectivity', 'deployment', 'synthesis'];
  const currentIndex = steps.indexOf(currentStep);

  const toggleModule = (id: string) => {
    setHybridModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      completeSetup({
        engineVersion: engine,
        editorMode: editor,
        deploymentTarget: deployment,
        hybridModules,
        sources,
        advancedTelemetry: true,
        customBuildOptions: customBuildOptions
      });
    }
  };

  const handleBypassSetup = () => {
    completeSetup({
      engineVersion: 'v3-stable',
      editorMode: 'full',
      deploymentTarget: 'k8s-pod',
      hybridModules: ['wasi', 'assets', 'physics', 'mesh-opt'],
      sources: {
        engine: 'https://kernel.spatial.io',
        assets: 'https://cdn.assets.io',
        telemetry: 'wss://telemetry.cluster.local'
      },
      advancedTelemetry: true,
      customBuildOptions: {
        replicas: 3,
        baseImage: 'node:20-alpine',
        registryUrl: 'gcr.io/spatial-workspace/render-core:latest',
        exposedPort: 3000,
        mountPath: '/usr/src/app',
        autoUpdate: true,
        scalingMetric: 'CPU_utilization_80'
      }
    });
  };

  const selectEngineWithAutoAdvance = (val: WorkspaceSetup['engineVersion']) => {
    setEngine(val);
    setTimeout(() => {
      setCurrentStep('connectivity');
    }, 280);
  };

  const selectTopologyWithAutoAdvance = (val: DeploymentTarget) => {
    setDeployment(val);
  };

  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Suggest a kernel configuration for this project goal: "${aiPrompt}". 
          Pick one engine from: v3-stable, v4-beta, v2-legacy, hybrid-custom.
          Pick modules from: wasi, assets, multiplayer, physics, compiler, mesh-opt.
          Return ONLY JSON in this format: {"engine": "...", "modules": ["...", "..."], "reasoning": "..."}`,
          history: [],
          context: { pods: [], scenes: [], viewMode: 'setup' }
        })
      });

      if (!response.ok) throw new Error('AI suggestion failed');
      const data = await response.json();
      
      // Handle markdown code block if present
      const cleanJson = data.content.includes('```json') 
        ? data.content.split('```json')[1].split('```')[0].trim()
        : data.content.includes('```')
          ? data.content.split('```')[1].split('```')[0].trim()
          : data.content.trim();
          
      const suggestion = JSON.parse(cleanJson);
      
      setEngine(suggestion.engine as any);
      setHybridModules(suggestion.modules);
      setAiPrompt("");
      // Show some feedback or log if needed
    } catch (error) {
      console.error('AI Suggestion Error:', error);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#08090d] flex flex-col font-sans selection:bg-[#00b8ff]/30 selection:text-[#00b8ff] text-[#cbd5e1]">
      {/* GLOBAL HUD STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes pulse-soft {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px rgba(0, 229, 160, 0.4)); }
          50% { opacity: 0.5; filter: drop-shadow(0 0 1px rgba(0, 229, 160, 0.1)); }
        }
        .animate-pulse-soft { animation: pulse-soft 2s infinite; }
      `}} />

      {/* TOP NAV */}
      <nav className="h-[48px] bg-[#0e1115]/90 backdrop-blur-md border-b border-[#1b1f26] px-6 flex items-center justify-between shrink-0 sticky top-0 z-[100]">
        <div className="flex items-center gap-5">
           <button onClick={(e) => { e.preventDefault(); }} className="flex items-center gap-2 font-mono text-[12px] font-bold text-[#f8fafc] tracking-wide bg-transparent border-none p-0 cursor-pointer outline-none">
              <div className="w-[22px] h-[22px] bg-gradient-to-br from-[#00b8ff] to-[#a78bfa] rounded flex items-center justify-center text-[10px] text-black font-black shadow-[0_0_12px_rgba(0,184,255,0.25)]">S</div>
              Spatial_IDE <span className="text-[#64748b] font-normal">/ setup</span>
           </button>
           <div className="w-px h-4 bg-[#1b1f26]" />
           <span className="font-mono text-[10px] text-[#00b8ff] bg-[#00b8ff]/10 border border-[#00b8ff]/15 px-2 py-0.5 rounded-md tracking-wider">v9.0.Hybrid</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleBypassSetup} 
             className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase font-mono bg-gradient-to-r from-[#00d4ff] to-[#a78bfa] hover:from-[#00c0fa] hover:to-[#9079ea] text-black shadow-lg shadow-[#00d4ff]/10 hover:shadow-[#00d4ff]/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
           >
             Quick Launch IDE
             <ChevronRight size={12} />
           </button>
           <button onClick={() => setIsDocsOpen(true)} className="nav-btn-user hover:bg-[#00b8ff]/10 hover:text-[#00b8ff] hover:border-[#00b8ff]/30 transition-colors">Docs</button>
           <button onClick={() => setIsSettingsOpen(true)} className="nav-btn-user hover:bg-[#00b8ff]/10 hover:text-[#00b8ff] hover:border-[#00b8ff]/30 transition-colors">Settings</button>
        </div>
      </nav>

      <div className="flex-1 grid grid-cols-[200px_1fr_260px] min-h-0 relative">
        {/* Subtle Decorative Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/[0.02] blur-[100px] rounded-full" />
           <div className="absolute bottom-[-10%] right-[5%] w-[350px] h-[350px] bg-purple-500/[0.02] blur-[100px] rounded-full" />
        </div>
        
        {/* SIDEBAR: BUILD PHASES */}
        <aside className="bg-[#0b0c10] border-r border-[#151921] py-5 flex flex-col overflow-y-auto no-scrollbar justify-between">
           <div className="px-3">
              <button
                onClick={() => resetLanding()}
                className="w-full mb-4 px-2 py-1.5 text-[10px] font-mono text-[#64748b] hover:text-white border border-transparent hover:border-[#1b1f26] rounded transition-colors flex items-center gap-1.5"
                title="Back to landing page"
              >
                ← Back to home
              </button>
              <div className="font-mono text-[9px] font-bold tracking-[0.15em] text-[#64748b] uppercase mb-4 px-2">Build Phases</div>
              <div className="space-y-1">
                 <PhaseItem num="01" name="Orchestration" status={currentIndex > 0 ? 'done' : currentIndex === 0 ? 'active' : 'pending'} onClick={() => setCurrentStep('orchestration')} />
                 <PhaseItem num="02" name="Connectivity" status={currentIndex > 1 ? 'done' : currentIndex === 1 ? 'active' : 'pending'} onClick={() => setCurrentStep('connectivity')} />
                 <PhaseItem num="03" name="Deployment" status={currentIndex > 2 ? 'done' : currentIndex === 2 ? 'active' : 'pending'} onClick={() => setCurrentStep('deployment')} />
                 <PhaseItem num="04" name="Synthesis" status={currentIndex === 3 ? 'active' : 'pending'} onClick={() => setCurrentStep('synthesis')} />
              </div>
           </div>

           <div className="px-4 border-t border-[#151921] pt-5 mt-5">
              <div className="font-mono text-[9px] font-bold tracking-[0.15em] text-[#64748b] uppercase mb-2">Active Spec</div>
              <div className="space-y-2">
                 <div className="font-mono text-[10px] text-[#00e5a0] flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
                    Core Connected
                 </div>
                 <div className="font-mono text-[10px] text-[#64748b] leading-relaxed">
                    Runtime: WASI<br/>
                    Cluster: {deployment.toUpperCase().replace(/-/g, '_')}<br/>
                    Workers: 3 Active
                 </div>
              </div>
           </div>
        </aside>

        {/* MAIN: CONTENT AREA */}
        <main className="bg-[#06070a] overflow-y-auto no-scrollbar flex flex-col h-full px-12 py-8">
           <div className="max-w-[760px] w-full mx-auto flex-1 flex flex-col justify-between">
              
              <div className="space-y-8">
                 {/* DYNAMIC HEADER */}
                 <header className="pb-5 border-b border-[#151921] mb-2">
                    <div className="font-mono text-[9px] text-[#64748b] mb-1.5 tracking-wider uppercase">
                       Compilation Process › <span className="text-[#a78bfa] font-bold">Phase_0{currentIndex + 1}</span>
                    </div>
                    <h1 className="text-[20px] font-black tracking-tight text-[#f8fafc] mb-1 uppercase font-mono">
                       {currentStep === 'orchestration' && "01 › Core_Selection"}
                       {currentStep === 'connectivity' && "02 › Network_Routing"}
                       {currentStep === 'deployment' && "03 › Host_Topology"}
                       {currentStep === 'synthesis' && "04 › System_Synthesis"}
                    </h1>
                    <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[580px] uppercase tracking-wider font-semibold">
                       {currentStep === 'orchestration' && "Bind core engine layers and WASI compiler sub-modules."}
                       {currentStep === 'connectivity' && "Route port states and dynamic signal conduits."}
                       {currentStep === 'deployment' && "Select the virtual host topology for sandbox execution."}
                       {currentStep === 'synthesis' && "Confirm structural metrics before launching spatial compilers."}
                    </p>
                 </header>

                 {/* ACTIVE HUD STATE BAR */}
                 <div className="h-11 bg-[#0b0c10]/60 border border-[#151921] rounded-lg px-4 flex items-center justify-between font-mono text-[10px] select-none text-zinc-400">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse-soft" />
                       <span className="text-zinc-200 font-bold uppercase tracking-wide">Static Active Assembly</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#64748b]">
                       <span className="text-zinc-400">60_FPS</span>
                       <span>·</span>
                       <span className="text-[#00e5a0] bg-[#00e5a0]/10 border border-[#00e5a0]/20 px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider">healthy</span>
                    </div>
                 </div>

                 {/* STEP RENDERERS */}
                 <AnimatePresence mode="wait">
                    <motion.div key={currentStep} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="space-y-8">
                      {currentStep === 'orchestration' && (
                        <div className="space-y-6">
                          {/* AI Assistant Hook */}
                          <div className="bg-[#0e1115] border border-[#1b1f26] rounded-xl p-4 relative overflow-hidden">
                            <div className="relative z-10 flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                  <Sparkles size={16} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-[12px] font-bold text-white uppercase tracking-wider">Suggest parameters</h3>
                                  <p className="text-[11px] text-[#64748b]">Describe your layout target and get prompt-based configurations.</p>
                                </div>
                            </div>
                            <div className="mt-3 relative flex items-center">
                               <input 
                                 type="text" 
                                 placeholder="e.g. 'Optimized lightweight WebGL sandbox'"
                                 className="w-full bg-[#06070a] border border-[#1b1f26] rounded-lg py-2 pl-3 pr-28 text-[11.5px] text-white outline-none focus:border-blue-500/30 transition-all font-medium"
                                 value={aiPrompt}
                                 onChange={(e) => setAiPrompt(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleAiSuggest()}
                               />
                               <button 
                                 onClick={handleAiSuggest}
                                 disabled={!aiPrompt.trim() || isAiSuggesting}
                                 className="absolute right-1 px-3 py-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5"
                               >
                                 {isAiSuggesting ? <Loader2 size={10} className="animate-spin" /> : 'Suggest'}
                               </button>
                            </div>
                          </div>

                          <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em] flex items-center gap-2">
                             01. Target Core Engine
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <EngineCard 
                               selected={engine === 'v3-stable'} 
                               onClick={() => selectEngineWithAutoAdvance('v3-stable')}
                               version="V3 Stable" 
                               name="Production Pro" 
                               tag="GLTF · WebVR · Standard" 
                               desc="Standard optimized assembly for stable frame rendering."
                               accent="blue" 
                             />
                             <EngineCard 
                               selected={engine === 'v4-beta'} 
                               onClick={() => selectEngineWithAutoAdvance('v4-beta')}
                               version="V4 Hyper" 
                               name="Neural Engine" 
                               tag="WebGPU · Ray-Tracing" 
                               desc="Enables cinematic rays and WebGPU compute pipelines."
                               accent="yellow" 
                             />
                             <EngineCard 
                               selected={engine === 'v2-legacy'} 
                               onClick={() => selectEngineWithAutoAdvance('v2-legacy')}
                               version="V2 Edge" 
                               name="Lightweight Base" 
                               tag="WASM · Bytecode · Compact" 
                               desc="Micro footprint binary optimized for edge devices."
                               accent="green" 
                             />
                             <EngineCard 
                               selected={engine === 'hybrid-custom'} 
                               onClick={() => selectEngineWithAutoAdvance('hybrid-custom')}
                               version="V9 Custom" 
                               name="Manual Bridging" 
                               tag="Custom · Broad Control" 
                               desc="Bespoke synthesis allowing full module mapping rules."
                               accent="purple" 
                             />
                          </div>

                          <div className="space-y-3 pt-2">
                             <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em] flex items-center gap-2">
                                02. Active Plugins
                             </div>
                             <div className="flex flex-wrap gap-2">
                                <ModuleToggle label="WASI Support" icon="⚡" on={hybridModules.includes('wasi')} onClick={() => toggleModule('wasi')} />
                                <ModuleToggle label="Asset Stream" icon="📦" on={hybridModules.includes('assets')} onClick={() => toggleModule('assets')} />
                                <ModuleToggle label="Multiuser Live" icon="👥" on={hybridModules.includes('multiplayer')} onClick={() => toggleModule('multiplayer')} />
                                <ModuleToggle label="GPU Physics" icon="🎮" on={hybridModules.includes('physics')} onClick={() => toggleModule('physics')} />
                                <ModuleToggle label="Live Compiler" icon="◈" on={hybridModules.includes('compiler')} onClick={() => toggleModule('compiler')} />
                                <ModuleToggle label="Mesh Optimizer" icon="◉" on={hybridModules.includes('mesh-opt')} onClick={() => toggleModule('mesh-opt')} />
                             </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 'connectivity' && (
                        <div className="space-y-5">
                           <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em]">
                              Configuration Gateway Links
                           </div>

                           <div className="space-y-4 max-w-xl">
                              <div className="space-y-1">
                                 <div className="flex justify-between items-center px-0.5">
                                    <span className="font-mono text-[9px] font-bold text-[#a78bfa] uppercase tracking-wider">Engine Assembly Path</span>
                                    <span className="font-mono text-[9px] text-zinc-600 font-medium tracking-wide">WASM GATEWAY URL</span>
                                 </div>
                                 <div className="relative flex items-center bg-[#0e1115] border border-[#1b1f26] rounded-lg group focus-within:border-purple-500/30 transition-all">
                                    <div className="absolute left-3.5 text-[#475569] group-focus-within:text-purple-400 transition-colors">
                                       <Globe size={14} />
                                    </div>
                                    <input 
                                      type="text" 
                                      value={sources.engine} 
                                      onChange={e => setSources(prev => ({ ...prev, engine: e.target.value }))}
                                      onKeyDown={e => e.key === 'Enter' && handleNext()}
                                      className="w-full bg-transparent border-none py-2.5 pl-10 pr-4 text-[11px] font-mono text-[#f8fafc] outline-none" 
                                    />
                                 </div>
                              </div>

                              <div className="space-y-1">
                                 <div className="flex justify-between items-center px-0.5">
                                    <span className="font-mono text-[9px] font-bold text-[#a78bfa] uppercase tracking-wider">Assets Bus Gateway</span>
                                    <span className="font-mono text-[9px] text-zinc-600 font-medium tracking-wide">CONTENT DEV BUS URL</span>
                                 </div>
                                 <div className="relative flex items-center bg-[#0e1115] border border-[#1b1f26] rounded-lg group focus-within:border-purple-500/30 transition-all">
                                    <div className="absolute left-3.5 text-[#475569] group-focus-within:text-purple-400 transition-colors">
                                       <Database size={14} />
                                    </div>
                                    <input 
                                      type="text" 
                                      value={sources.assets} 
                                      onChange={e => setSources(prev => ({ ...prev, assets: e.target.value }))}
                                      onKeyDown={e => e.key === 'Enter' && handleNext()}
                                      className="w-full bg-transparent border-none py-2.5 pl-10 pr-4 text-[11px] font-mono text-[#f8fafc] outline-none" 
                                    />
                                 </div>
                              </div>

                              <div className="space-y-1">
                                 <div className="flex justify-between items-center px-0.5">
                                    <span className="font-mono text-[9px] font-bold text-[#a78bfa] uppercase tracking-wider">Telemetry Endpoint</span>
                                    <span className="font-mono text-[9px] text-zinc-600 font-medium tracking-wide">SIGNAL PROTOCOL WS</span>
                                 </div>
                                 <div className="relative flex items-center bg-[#0e1115] border border-[#1b1f26] rounded-lg group focus-within:border-purple-500/30 transition-all">
                                    <div className="absolute left-3.5 text-[#475569] group-focus-within:text-purple-400 transition-colors">
                                       <Zap size={14} />
                                    </div>
                                    <input 
                                      type="text" 
                                      value={sources.telemetry} 
                                      onChange={e => setSources(prev => ({ ...prev, telemetry: e.target.value }))}
                                      onKeyDown={e => e.key === 'Enter' && handleNext()}
                                      className="w-full bg-transparent border-none py-2.5 pl-10 pr-4 text-[11px] font-mono text-[#f8fafc] outline-none" 
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                      )}

                      {currentStep === 'deployment' && (
                        <div className="space-y-6">
                           <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em] flex items-center justify-between">
                              <span>Deployment Topologies</span>
                              <span className="text-[#00b8ff] text-[9px] font-mono">Select a target to customize build variables</span>
                           </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                               <TopologyCard
                                 id="k8s-pod"
                                 selected={deployment === 'k8s-pod'}
                                 onClick={() => selectTopologyWithAutoAdvance('k8s-pod')}
                                 icon={<Layers size={16} />}
                                 title="Kubernetes Pods"
                                 desc="Deploy basic isolated cloud computing nodes."
                                 accent="green"
                               />
                               <TopologyCard
                                 id="k8s-dev-container"
                                 selected={deployment === 'k8s-dev-container'}
                                 onClick={() => selectTopologyWithAutoAdvance('k8s-dev-container')}
                                 icon={<Terminal size={16} />}
                                 title="K8s Dev-Container"
                                 desc="Live sync compiler and micro-reload loops (decontainer)."
                                 accent="blue"
                               />
                               <TopologyCard
                                 id="k8s-deployment"
                                 selected={deployment === 'k8s-deployment'}
                                 onClick={() => selectTopologyWithAutoAdvance('k8s-deployment')}
                                 icon={<Network size={16} />}
                                 title="K8s Deployment"
                                 desc="Multi-replica scalable production architecture targets."
                                 accent="yellow"
                               />
                               <TopologyCard
                                 id="docker-container"
                                 selected={deployment === 'docker-container'}
                                 onClick={() => selectTopologyWithAutoAdvance('docker-container')}
                                 icon={<Server size={16} />}
                                 title="Docker Isolated"
                                 desc="Port mapping, standard isolated container environment."
                                 accent="purple"
                               />
                               <TopologyCard
                                 id="docker-image"
                                 selected={deployment === 'docker-image'}
                                 onClick={() => selectTopologyWithAutoAdvance('docker-image')}
                                 icon={<Database size={16} />}
                                 title="Docker Image Target"
                                 desc="Compile down to raw Docker registry images."
                                 accent="blue"
                               />
                               <TopologyCard
                                 id="local-process"
                                 selected={deployment === 'local-process'}
                                 onClick={() => selectTopologyWithAutoAdvance('local-process')}
                                 icon={<Cloud size={16} />}
                                 title="Direct Local Host"
                                 desc="High-speed local context memory boundaries."
                                 accent="purple"
                               />
                               <TopologyCard
                                 id="podman-container"
                                 selected={deployment === 'podman-container'}
                                 onClick={() => selectTopologyWithAutoAdvance('podman-container')}
                                 icon={<Server size={16} />}
                                 title="Podman Rootless"
                                 desc="Daemonless rootless containers with UID mapping."
                                 accent="green"
                               />
                               <TopologyCard
                                 id="self-hosted-vps"
                                 selected={deployment === 'self-hosted-vps'}
                                 onClick={() => selectTopologyWithAutoAdvance('self-hosted-vps')}
                                 icon={<Server size={16} />}
                                 title="Self-Hosted VPS"
                                 desc="Ansible-provisioned Hetzner / DO / OVH instance."
                                 accent="blue"
                               />
                               <TopologyCard
                                 id="static-site"
                                 selected={deployment === 'static-site'}
                                 onClick={() => selectTopologyWithAutoAdvance('static-site')}
                                 icon={<Globe size={16} />}
                                 title="Static Site"
                                 desc="Pre-rendered static bundle, any host."
                                 accent="yellow"
                               />
                               <TopologyCard
                                 id="vercel"
                                 selected={deployment === 'vercel'}
                                 onClick={() => selectTopologyWithAutoAdvance('vercel')}
                                 icon={<Globe size={16} />}
                                 title="Vercel"
                                 desc="Edge-cached deploys with HMR + preview URLs."
                                 accent="blue"
                               />
                               <TopologyCard
                                 id="netlify"
                                 selected={deployment === 'netlify'}
                                 onClick={() => selectTopologyWithAutoAdvance('netlify')}
                                 icon={<Globe size={16} />}
                                 title="Netlify"
                                 desc="Atomic deploys with edge functions."
                                 accent="green"
                               />
                               <TopologyCard
                                 id="cloudflare-pages"
                                 selected={deployment === 'cloudflare-pages'}
                                 onClick={() => selectTopologyWithAutoAdvance('cloudflare-pages')}
                                 icon={<Globe size={16} />}
                                 title="Cloudflare Pages"
                                 desc="Global edge deploy with KV bindings."
                                 accent="yellow"
                               />
                               <TopologyCard
                                 id="edge-worker"
                                 selected={deployment === 'edge-worker'}
                                 onClick={() => selectTopologyWithAutoAdvance('edge-worker')}
                                 icon={<Globe size={16} />}
                                 title="Edge Worker"
                                 desc="Cloudflare Workers / Deno Deploy / Vercel Edge."
                                 accent="purple"
                               />
                               <TopologyCard
                                 id="aws-amplify"
                                 selected={deployment === 'aws-amplify'}
                                 onClick={() => selectTopologyWithAutoAdvance('aws-amplify')}
                                 icon={<Cloud size={16} />}
                                 title="AWS Amplify"
                                 desc="Full-stack hosting with CI/CD from your repo."
                                 accent="blue"
                               />
                               <TopologyCard
                                 id="github-pages"
                                 selected={deployment === 'github-pages'}
                                 onClick={() => selectTopologyWithAutoAdvance('github-pages')}
                                 icon={<Globe size={16} />}
                                 title="GitHub Pages"
                                 desc="Push to main, get a *.github.io URL."
                                 accent="green"
                               />
                               <TopologyCard
                                 id="firebase-hosting"
                                 selected={deployment === 'firebase-hosting'}
                                 onClick={() => selectTopologyWithAutoAdvance('firebase-hosting')}
                                 icon={<Cloud size={16} />}
                                 title="Firebase Hosting"
                                 desc="Globally cached static + SSR hosting."
                                 accent="yellow"
                               />
                               <TopologyCard
                                 id="bun-runtime"
                                 selected={deployment === 'bun-runtime'}
                                 onClick={() => selectTopologyWithAutoAdvance('bun-runtime')}
                                 icon={<Cpu size={16} />}
                                 title="Bun Runtime"
                                 desc="Bun-native edge with WebGPU shims."
                                 accent="purple"
                               />
                               <TopologyCard
                                 id="railway"
                                 selected={deployment === 'railway'}
                                 onClick={() => selectTopologyWithAutoAdvance('railway')}
                                 icon={<Cloud size={16} />}
                                 title="Railway"
                                 desc="One-click PaaS with Postgres + volumes."
                                 accent="blue"
                               />
                               <TopologyCard
                                 id="fly-io"
                                 selected={deployment === 'fly-io'}
                                 onClick={() => selectTopologyWithAutoAdvance('fly-io')}
                                 icon={<Cloud size={16} />}
                                 title="Fly.io"
                                 desc="Edge PaaS with WireGuard mesh + volumes."
                                 accent="green"
                               />
                               <TopologyCard
                                 id="render"
                                 selected={deployment === 'render'}
                                 onClick={() => selectTopologyWithAutoAdvance('render')}
                                 icon={<Cloud size={16} />}
                                 title="Render"
                                 desc="Web services, static sites, and cron jobs."
                                 accent="yellow"
                               />
                               <TopologyCard
                                 id="pwa"
                                 selected={deployment === 'pwa'}
                                 onClick={() => selectTopologyWithAutoAdvance('pwa')}
                                 icon={<Globe size={16} />}
                                 title="PWA"
                                 desc="Installable web app with offline glTF cache."
                                 accent="blue"
                               />
                               <TopologyCard
                                 id="webxr"
                                 selected={deployment === 'webxr'}
                                 onClick={() => selectTopologyWithAutoAdvance('webxr')}
                                 icon={<Globe size={16} />}
                                 title="WebXR (Quest / Vision Pro)"
                                 desc="Stereoscopic 90Hz render, hand + controller."
                                 accent="purple"
                               />
                               <TopologyCard
                                 id="iframe-embed"
                                 selected={deployment === 'iframe-embed'}
                                 onClick={() => selectTopologyWithAutoAdvance('iframe-embed')}
                                 icon={<Box size={16} />}
                                 title="iframe Embed"
                                 desc="Drop the 3D scene into any site, sandboxed."
                                 accent="green"
                               />
                               <TopologyCard
                                 id="wasm-module"
                                 selected={deployment === 'wasm-module'}
                                 onClick={() => selectTopologyWithAutoAdvance('wasm-module')}
                                 icon={<Cpu size={16} />}
                                 title="WebAssembly Module"
                                 desc="Standalone .wasm + .mjs export."
                                 accent="yellow"
                               />
                               <TopologyCard
                                 id="desktop-tauri"
                                 selected={deployment === 'desktop-tauri'}
                                 onClick={() => selectTopologyWithAutoAdvance('desktop-tauri')}
                                 icon={<Cpu size={16} />}
                                 title="Desktop (Tauri)"
                                 desc="Tiny native shell, ~8MB, all OSes."
                                 accent="blue"
                               />
                               <TopologyCard
                                 id="desktop-electron"
                                 selected={deployment === 'desktop-electron'}
                                 onClick={() => selectTopologyWithAutoAdvance('desktop-electron')}
                                 icon={<Cpu size={16} />}
                                 title="Desktop (Electron)"
                                 desc="Cross-platform installers with auto-update."
                                 accent="purple"
                               />
                               <TopologyCard
                                 id="mobile-capacitor"
                                 selected={deployment === 'mobile-capacitor'}
                                 onClick={() => selectTopologyWithAutoAdvance('mobile-capacitor')}
                                 icon={<Layers size={16} />}
                                 title="Mobile (Capacitor)"
                                 desc="iOS + Android via native WebView shell."
                                 accent="green"
                               />
                               <TopologyCard
                                 id="npm-package"
                                 selected={deployment === 'npm-package'}
                                 onClick={() => selectTopologyWithAutoAdvance('npm-package')}
                                 icon={<Box size={16} />}
                                 title="NPM Package"
                                 desc="Publish a reusable engine / library."
                                 accent="yellow"
                               />
                               <TopologyCard
                                 id="asset-cdn"
                                 selected={deployment === 'asset-cdn'}
                                 onClick={() => selectTopologyWithAutoAdvance('asset-cdn')}
                                 icon={<Cloud size={16} />}
                                 title="Asset CDN"
                                 desc="Cloudflare R2 / S3 / Fastly for glTF + textures."
                                 accent="blue"
                               />
                            </div>

                           {/* Interactive Build Customization Panel */}
                           <div className="mt-5 p-5 bg-[#0e1115]/80 border border-[#1b1f26] rounded-xl space-y-4">
                              <div className="flex items-center justify-between border-b border-[#1b1f26] pb-3">
                                 <h4 className="font-mono text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider flex items-center gap-2">
                                    <Settings className="w-3.5 h-3.5 text-[#00b8ff]" />
                                    CUSTOMIZE_BUILD_CONFIG : {deployment.toUpperCase().replace(/-/g, '_')}
                                 </h4>
                                 <span className="font-mono text-[8.5px] bg-[#00e5a0]/10 border border-[#00e5a0]/20 text-[#00e5a0] font-bold px-2 py-0.5 rounded uppercase">Verified Target</span>
                              </div>

                              {deployment === 'k8s-pod' && (
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 col-span-2">
                                       <div className="flex justify-between items-center text-[9px] font-mono font-black text-zinc-400">
                                          <span>NAMESPACE SELECTION</span>
                                          <span className="text-[#00b8ff]">K8S_NS</span>
                                       </div>
                                       <select 
                                          className="w-full bg-[#06070a] border border-[#1b1f26] rounded-lg p-2.5 text-[11px] font-mono text-[#cbd5e1] outline-none focus:border-[#00b8ff]/30 cursor-pointer"
                                          value={customBuildOptions.scalingMetric}
                                          onChange={e => setCustomBuildOptions(prev => ({ ...prev, scalingMetric: e.target.value }))}
                                       >
                                          <option value="default">default</option>
                                          <option value="engine">engine-sandbox</option>
                                          <option value="infra">infra-services</option>
                                          <option value="data">data-plane</option>
                                       </select>
                                    </div>
                                 </div>
                              )}

                              {deployment === 'k8s-dev-container' && (
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                       <label className="font-mono text-[9px] font-black text-zinc-400 block">Workspace Mount Path</label>
                                       <input 
                                          type="text"
                                          className="w-full bg-[#06070a] border border-[#1b1f26] rounded-lg p-2 font-mono text-[11px] text-[#cbd5e1] outline-none focus:border-[#00b8ff]/30"
                                          value={customBuildOptions.mountPath}
                                          onChange={e => setCustomBuildOptions(prev => ({ ...prev, mountPath: e.target.value }))}
                                       />
                                    </div>

                                    <div className="space-y-1.5">
                                       <label className="font-mono text-[9px] font-black text-zinc-400 block">Exposed Ingress Port</label>
                                       <input 
                                          type="number"
                                          className="w-full bg-[#06070a] border border-[#1b1f26] rounded-lg p-2 font-mono text-[11px] text-[#cbd5e1] outline-none focus:border-[#00b8ff]/30"
                                          value={customBuildOptions.exposedPort}
                                          onChange={e => setCustomBuildOptions(prev => ({ ...prev, exposedPort: Number(e.target.value) }))}
                                       />
                                    </div>

                                    <div className="col-span-2 flex items-center justify-between p-2.5 bg-black/30 border border-[#1b1f26] rounded-lg">
                                       <div>
                                          <span className="text-[10px] font-bold text-[#f8fafc] block">Passive Signal Hot Module Re-linking (HMR)</span>
                                          <span className="text-[9px] text-[#64748b] block">Instantly recompile assets directly inside context frame on save</span>
                                       </div>
                                       <button 
                                          onClick={() => setCustomBuildOptions(prev => ({ ...prev, autoUpdate: !prev.autoUpdate }))}
                                          className={cn(
                                             "w-10 h-5.5 rounded-full p-0.5 transition-all flex items-center cursor-pointer",
                                             customBuildOptions.autoUpdate ? "bg-[#00e5a0] justify-end" : "bg-zinc-800 justify-start"
                                          )}
                                       >
                                          <div className="w-4.5 h-4.5 rounded-full bg-[#0a0b0e] shadow-md" />
                                       </button>
                                    </div>
                                 </div>
                              )}

                              {deployment === 'k8s-deployment' && (
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                       <div className="flex justify-between items-center bg-zinc-950/40 p-1 px-2 rounded-lg border border-white/5">
                                          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider font-mono">Deployment Replicas</label>
                                          <span className="font-mono text-xs text-[#00b8ff] font-bold">{customBuildOptions.replicas} REPLICAS</span>
                                       </div>
                                       <input 
                                          type="range" 
                                          min={1} 
                                          max={10} 
                                          step={1}
                                          value={customBuildOptions.replicas} 
                                          onChange={e => setCustomBuildOptions(prev => ({ ...prev, replicas: Number(e.target.value) }))}
                                          className="w-full accent-[#00b8ff] bg-zinc-950 p-1 cursor-pointer rounded-lg h-2"
                                       />
                                       <div className="flex justify-between text-[8px] text-zinc-500 font-mono uppercase">
                                          <span>Min (1)</span>
                                          <span>Optimal (3)</span>
                                          <span>Limit (10)</span>
                                       </div>
                                    </div>

                                    <div className="space-y-1.5">
                                       <label className="font-mono text-[9px] font-black text-zinc-400 block uppercase">Autoscaling Condition Metric</label>
                                       <select 
                                          className="w-full bg-[#06070a] border border-[#1b1f26] rounded-lg p-2.5 text-[11px] font-mono text-[#cbd5e1] outline-none focus:border-[#00b8ff]/30 cursor-pointer"
                                          value={customBuildOptions.scalingMetric}
                                          onChange={e => setCustomBuildOptions(prev => ({ ...prev, scalingMetric: e.target.value }))}
                                       >
                                          <option value="CPU_utilization_80">Average CPU Utilization &gt; 80%</option>
                                          <option value="Memory_saturation_75">Memory saturation &gt; 75%</option>
                                          <option value="Network_Throughput_60">Active requests thread size &gt; 500/s</option>
                                          <option value="None">None (Static Replica Bounds)</option>
                                       </select>
                                    </div>
                                 </div>
                              )}

                              {deployment === 'docker-image' && (
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                       <label className="font-mono text-[9px] font-black text-zinc-400 block uppercase">Compilation Base Docker Image</label>
                                       <input 
                                          type="text"
                                          className="w-full bg-[#06070a] border border-[#1b1f26] rounded-lg p-2 font-mono text-[11px] text-[#cbd5e1] outline-none focus:border-[#00b8ff]/30"
                                          value={customBuildOptions.baseImage}
                                          onChange={e => setCustomBuildOptions(prev => ({ ...prev, baseImage: e.target.value }))}
                                       />
                                       <span className="text-[8px] text-zinc-500 font-bold uppercase block">RECOMMENDED: alpine, python:slim, node:alpine</span>
                                    </div>

                                    <div className="space-y-1.5">
                                       <label className="font-mono text-[9px] font-black text-zinc-400 block uppercase">Target Docker Registry Host</label>
                                       <input 
                                          type="text"
                                          className="w-full bg-[#06070a] border border-[#1b1f26] rounded-lg p-2 font-mono text-[11px] text-[#cbd5e1] outline-none focus:border-[#00b8ff]/30"
                                          value={customBuildOptions.registryUrl}
                                          onChange={e => setCustomBuildOptions(prev => ({ ...prev, registryUrl: e.target.value }))}
                                       />
                                       <span className="text-[8px] text-zinc-500 font-bold uppercase block">RECOMMENDED: docker.io, gcr.io, ghcr.io</span>
                                    </div>
                                 </div>
                              )}

                              {deployment === 'docker-container' && (
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                       <label className="font-mono text-[9px] font-black text-zinc-400 block uppercase">Host Ingress Port Binds</label>
                                       <input 
                                          type="number"
                                          className="w-full bg-[#06070a] border border-[#1b1f26] rounded-lg p-2 font-mono text-[11px] text-[#cbd5e1] outline-none focus:border-[#00b8ff]/30"
                                          value={customBuildOptions.exposedPort}
                                          onChange={e => setCustomBuildOptions(prev => ({ ...prev, exposedPort: Number(e.target.value) }))}
                                       />
                                       <span className="text-[8px] text-zinc-500 font-bold uppercase block block">Binds local network port to container 3000</span>
                                    </div>

                                    <div className="space-y-1.5">
                                       <label className="font-mono text-[9px] font-black text-zinc-400 block uppercase">Docker Volume Mappings</label>
                                       <input 
                                          type="text"
                                          className="w-full bg-[#06070a] border border-[#1b1f26] rounded-lg p-2 font-mono text-[11px] text-[#cbd5e1] outline-none focus:border-[#00b8ff]/30"
                                          defaultValue="/spatial-host-data:/data"
                                       />
                                       <span className="text-[8px] text-zinc-500 font-bold uppercase block">Persistent storage maps inside Docker contexts</span>
                                    </div>
                                 </div>
                              )}

                              {deployment === 'local-process' && (
                                 <div className="p-3 bg-zinc-950/40 border border-[#1b1f26] rounded-lg space-y-1">
                                    <span className="text-[10px] text-zinc-200 block font-bold">🛠 DIRECT PROCESS ARCHITECTURAL CONTROL</span>
                                    <p className="text-[9.5px] text-zinc-500 leading-relaxed uppercase font-semibold">Bypasses isolation namespaces down to bare-metal thread buffers on host process context, offering perfect 60fps latency maps using hardware context directly.</p>
                                 </div>
                              )}
                           </div>
                        </div>
                      )}

                      {currentStep === 'synthesis' && (
                        <div className="space-y-5">
                           <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em] flex items-center gap-2">
                              Build Parameters Summary
                           </div>
                           
                           <div className="bg-[#0e1115] border border-[#1b1f26] rounded-xl p-5 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient-glow pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(0, 184, 255, 0.04) 0%, transparent 70%)" }} />
                              <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                 <Command className="w-3.5 h-3.5 text-[#00b8ff]" /> COMPILER_MANIFEST
                              </h3>
                              
                              <div className="grid grid-cols-2 gap-y-4 gap-x-8 font-mono">
                                 <div className="border-b border-zinc-900 pb-2.5">
                                    <span className="text-[9px] text-[#64748b] uppercase block">Synthesized Core</span>
                                    <span className="text-[11.5px] font-bold text-white uppercase tracking-wide">{engine === 'v4-beta' ? 'Neural_V4' : engine === 'v3-stable' ? 'Stable_V3' : engine === 'v2-legacy' ? 'Light_V2' : 'Hybrid_Custom'}</span>
                                 </div>

                                 <div className="border-b border-zinc-900 pb-2.5">
                                    <span className="text-[9px] text-[#64748b] uppercase block">Runtime Topology</span>
                                    <span className="text-[11.5px] font-bold text-white uppercase tracking-wide">{deployment.replace(/-/g, '_')}</span>
                                 </div>

                                 <div className="border-b border-zinc-900 pb-2.5">
                                    <span className="text-[9px] text-[#64748b] uppercase block">Signal Relay URL</span>
                                    <span className="text-[11px] text-[#00b8ff] truncate block max-w-xs">{sources.telemetry}</span>
                                 </div>

                                 <div className="border-b border-zinc-900 pb-2.5">
                                    <span className="text-[9px] text-[#64748b] uppercase block">Delivery CDN</span>
                                    <span className="text-[11px] text-[#00b8ff] truncate block max-w-xs">{sources.assets}</span>
                                 </div>

                                 <div className="col-span-2">
                                    <span className="text-[9px] text-[#64748b] uppercase block mb-1.5">Enabled Assemblies</span>
                                    <div className="flex flex-wrap gap-1">
                                       {hybridModules.map(m => (
                                          <span key={m} className="px-2 py-0.5 bg-white/[0.03] border border-white/5 text-[9.5px] text-[#cbd5e1] rounded uppercase">{m}</span>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-3 bg-[#00e5a0]/5 border border-[#00e5a0]/10 rounded-xl p-3">
                              <div className="w-5 h-5 rounded-full bg-[#00e5a0]/10 flex items-center justify-center text-[#00e5a0] text-[10px] shrink-0">
                                 ✓
                              </div>
                              <div className="text-[11px]">
                                 <span className="font-bold text-[#00e5a0]">Vetted checks passed.</span> Kernel parameters successfully validated against sandbox guidelines.
                              </div>
                           </div>
                        </div>
                      )}
                    </motion.div>
                 </AnimatePresence>
              </div>

              {/* FOOTER ACTIONS */}
              <footer className="mt-8 pt-5 border-t border-[#151921] flex items-center justify-between shrink-0">
                <span className="font-mono text-[10px] text-[#64748b] font-bold tracking-wider uppercase">
                   Phase {currentIndex + 1} / 4
                </span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      completeSetup({
                        engineVersion: 'v3-stable',
                        editorMode: 'full',
                        deploymentTarget: 'k8s-pod',
                        hybridModules: ['wasi', 'assets', 'physics', 'mesh-opt'],
                        sources: {
                          engine: 'https://kernel.spatial.io',
                          assets: 'https://cdn.assets.io',
                          telemetry: 'wss://telemetry.cluster.local'
                        },
                        advancedTelemetry: true
                      });
                    }}
                    className="bg-gradient-to-r from-purple-600 to-[#00b8ff] hover:from-purple-500 hover:to-[#33c9ff] text-white font-bold font-mono text-[11.5px] px-5 py-2.5 rounded shadow-[0_0_15px_rgba(147,51,234,0.35)] hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                    title="Bypass multi-step configuration and boot the workspace with high-fidelity production defaults"
                  >
                    ⚡ QUICK_LAUNCH
                  </button>
                  <button 
                    onClick={handleNext}
                    className="bg-[#00b8ff] hover:bg-[#33c9ff] text-black font-bold font-mono text-[11.5px] px-6 py-2.5 rounded shadow-[0_0_15px_rgba(0,184,255,0.2)] hover:-translate-y-0.5 transition-all flex items-center gap-2 group active:scale-95 cursor-pointer"
                  >
                    {currentStep === 'synthesis' ? 'INIT_COMPILER' : 'CONTINUE_PHASE'}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </footer>
           </div>
        </main>

        {/* RIGHT PANEL: AUDIT HUD */}
        <aside className="bg-[#0b0c10] border-l border-[#151921] p-4 flex flex-col justify-between overflow-y-auto no-scrollbar">
           <div>
              <div className="font-mono text-[10px] font-bold tracking-[0.15em] text-[#64748b] uppercase mb-3">Live Console</div>
              <div className="space-y-0.5">
                 <SpecRow label="ENGINE" value={engine === 'v4-beta' ? 'V4 Neural' : engine === 'v3-stable' ? 'V3 Pro' : engine === 'v2-legacy' ? 'V2 Lite' : 'Hybrid'} color="accent" />
                 <SpecRow label="RENDERER" value={engine === 'v4-beta' ? 'RAYTRACED' : 'GLTF/WEBVR'} />
                 <SpecRow label="RUNTIME" value="WASI_ON" color="green" />
                 <SpecRow label="ACCEL" value={hybridModules.includes('physics') ? "ACTIVE" : "OFF"} color={hybridModules.includes('physics') ? "green" : "dim"} />
                 <SpecRow label="HOST" value={deployment.toUpperCase().replace(/-/g, '_')} />
                 <SpecRow label="TARGET_FPS" value="60" color="green" />
                 <SpecRow label="PLUGINS" value={`${hybridModules.length} active`} color="yellow" />
              </div>
           </div>

           <div className="mt-4 bg-[#06070a] border border-[#151921] rounded p-2.5 font-mono text-[9.5px] leading-relaxed min-h-[120px] text-zinc-500">
              <div className="flex gap-1">
                <span className="text-[#00e5a0]">›</span>
                <span>system_synthesis ready</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[#00e5a0]">›</span>
                <span>loading model {engine}...</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[#00e5a0]">›</span>
                <span>WASI sub-pipes active</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[#00e5a0]">›</span>
                <span>host connection: ok</span>
              </div>
              <div className="flex gap-1 text-[#00e5a0]">
                <span>✓</span>
                <span>ready to consolidate</span>
              </div>
           </div>
        </aside>
      </div>

      {/* DOCS MODAL OVERLAY */}
      <AnimatePresence>
        {isDocsOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }} 
              className="bg-[#0b0c10] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative text-[#cbd5e1]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#00b8ff]/10 text-[#00b8ff] rounded flex items-center justify-center text-[10px] font-bold">Docs</div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Spatial_IDE // Kernel Documentation</h3>
                </div>
                <button onClick={() => setIsDocsOpen(false)} className="w-7 h-7 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white flex items-center justify-center text-xs border border-transparent hover:border-white/10 transition-all cursor-pointer">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex gap-2 border-b border-white/5 pb-3">
                  <button onClick={() => setActiveDocsTab('engines')} className={cn("px-3 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer", activeDocsTab === 'engines' ? "bg-[#00b8ff]/10 text-[#00b8ff] border border-[#00b8ff]/20" : "text-zinc-500 hover:text-zinc-300")}>[01] Engines</button>
                  <button onClick={() => setActiveDocsTab('modules')} className={cn("px-3 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer", activeDocsTab === 'modules' ? "bg-[#00b8ff]/10 text-[#00b8ff] border border-[#00b8ff]/20" : "text-zinc-500 hover:text-zinc-300")}>[02] Modules</button>
                  <button onClick={() => setActiveDocsTab('topology')} className={cn("px-3 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer", activeDocsTab === 'topology' ? "bg-[#00b8ff]/10 text-[#00b8ff] border border-[#00b8ff]/20" : "text-zinc-500 hover:text-zinc-300")}>[03] Topology</button>
                  <button onClick={() => setActiveDocsTab('faq')} className={cn("px-3 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer", activeDocsTab === 'faq' ? "bg-[#00b8ff]/10 text-[#00b8ff] border border-[#00b8ff]/20" : "text-zinc-500 hover:text-zinc-300")}>[04] Setup FAQ</button>
                </div>

                <div className="space-y-4 text-xs text-zinc-450 leading-relaxed font-sans mt-2">
                  {activeDocsTab === 'engines' && (
                    <div className="space-y-3">
                      <h4 className="text-zinc-200 uppercase font-mono font-bold">Kernel Engine Architectures</h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                          <strong className="text-white block font-mono mb-1">V3 Stable (Production Pro)</strong>
                          Standardized WebGL engine preset. Out-of-the-box GLTF support, robust environment controls, and optimized asset pipelines suitable for high framerate mobile & desktop layouts.
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                          <strong className="text-white block font-mono mb-1">V4 Hyper (Raytraced WebGPU)</strong>
                          Experimental WebGPU pipeline enabling complex compute passes, dynamic shadows, and high-fidelity screen space ambient shading blocks.
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                          <strong className="text-white block font-mono mb-1">V2 Legacy (Edge Compiler)</strong>
                          Miniature build profile for low-compute environments or direct WASM loading setups with reduced footprint.
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDocsTab === 'modules' && (
                    <div className="space-y-3">
                      <h4 className="text-zinc-200 uppercase font-mono font-bold">Plugin Assembly Modules</h4>
                      <p className="text-zinc-400">Enable plug-and-play extensions into the main sandbox cycle safely. Each runtime is isolated at thread compile time:</p>
                      <div className="grid grid-cols-2 gap-3 font-mono text-[10.5px]">
                        <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg">
                          <span className="text-[#00e5a0] font-bold">✔ WASI Core</span>: Handles unified low-level POSIX and WASM memory system calls mapping.
                        </div>
                        <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg">
                          <span className="text-[#00e5a0] font-bold">✔ Assets Buffer</span>: Optimizes asset queues and streams assets dynamically.
                        </div>
                        <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg">
                          <span className="text-[#00e5a0] font-bold">✔ GPU Physics</span>: Accelerates rigid-body solver constraints.
                        </div>
                        <div className="p-2.5 bg-zinc-950 border border-white/5 rounded-lg">
                          <span className="text-[#00e5a0] font-bold">✔ Live Compiler</span>: Enables instant runtime Hot Module Replacement rendering.
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDocsTab === 'topology' && (
                    <div className="space-y-3">
                      <h4 className="text-zinc-200 uppercase font-mono font-bold">Virtual Infrastructure Host Routing</h4>
                      <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl space-y-3">
                        <p className="text-zinc-400"><strong>Kubernetes Pods:</strong> Automates Docker containers inside sandbox namespaces, listening directly on system <span className="text-[#00b8ff] font-mono">Port 3000</span>. Recommended for cluster testing and load-shared simulations.</p>
                        <p className="text-zinc-400"><strong>Edge Wasm Workers:</strong> Instantly claims close geo-servers to execute bytecode cycles with zero cold storage start metrics.</p>
                        <p className="text-zinc-400"><strong>Isolated Host Process:</strong> Bypasses typical frame network limits using client-side cyclic hardware directly for lightning performance.</p>
                      </div>
                    </div>
                  )}

                  {activeDocsTab === 'faq' && (
                    <div className="space-y-3">
                      <h4 className="text-zinc-200 uppercase font-mono font-bold">Frequently Asked Questions</h4>
                      <div className="space-y-3 border-t border-white/5 pt-3">
                        <div>
                          <strong className="text-zinc-300 block font-mono">Q: Why is Port 3000 static inside the network setup?</strong>
                          <span className="text-zinc-400">A: Cloud environments mandate reverse proxies starting at port 3000 to route development sessions seamlessly.</span>
                        </div>
                        <div className="pt-2">
                          <strong className="text-zinc-300 block font-mono">Q: Does the compiler auto-optimise raw GLTF bounds?</strong>
                          <span className="text-zinc-400">A: When the Mesh Optimizer extension is activated, vertices decimate down to safe counts automatically on asset upload.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-white/5 bg-zinc-950/60 flex justify-end">
                <button onClick={() => setIsDocsOpen(false)} className="px-5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SETUP CONFIG / SETTINGS MODAL OVERLAY */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }} 
              className="bg-[#0b0c10] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-[#cbd5e1]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
                <div className="flex items-center gap-2">
                  <span className="text-[#a78bfa] font-mono text-[9px] font-black uppercase bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">Setup Profile</span>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Cluster Administration</h3>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="w-7 h-7 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white flex items-center justify-center text-xs border border-transparent hover:border-white/10 transition-all cursor-pointer">✕</button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-zinc-950/40 p-1 px-1.5 rounded-lg border border-white/5 mb-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Worker Compilation Threads</label>
                    <span className="font-mono text-xs text-[#00b8ff] font-bold">{maxThreads} THREADS</span>
                  </div>
                  <input 
                    type="range" 
                    min={2} 
                    max={16} 
                    step={2}
                    value={maxThreads} 
                    onChange={e => setMaxThreads(Number(e.target.value))}
                    className="w-full accent-[#00b8ff] bg-zinc-950 p-1 cursor-pointer rounded-lg h-2"
                  />
                  <div className="flex justify-between text-[8px] text-zinc-500 font-mono uppercase">
                    <span>Min (2)</span>
                    <span>Safe (8)</span>
                    <span>Peak Limit (16)</span>
                  </div>
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="flex items-center justify-between bg-zinc-950/10 p-2.5 rounded-xl border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide block">Diagnostics Telemetry</span>
                    <span className="text-[9.5px] text-zinc-500 block">Periodically sync metrics payloads over secure SSL</span>
                  </div>
                  <button 
                    onClick={() => setAdvTelemetry(!advTelemetry)}
                    className={cn(
                      "w-11 h-6 rounded-full p-0.5 transition-all flex items-center cursor-pointer",
                      advTelemetry ? "bg-[#00e5a0] justify-end" : "bg-zinc-800 justify-start"
                    )}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#0a0b0e] shadow-md" />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-zinc-950/10 p-2.5 rounded-xl border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide block">Exhaustive Stdout Logging</span>
                    <span className="text-[9.5px] text-zinc-500 block">Deploy verbose diagnostic logging in system terminal</span>
                  </div>
                  <button 
                    onClick={() => setVerboseLogging(!verboseLogging)}
                    className={cn(
                      "w-11 h-6 rounded-full p-0.5 transition-all flex items-center cursor-pointer",
                      verboseLogging ? "bg-[#00e5a0] justify-end" : "bg-zinc-800 justify-start"
                    )}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#0a0b0e] shadow-md" />
                  </button>
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    <span>Reverse Proxy Routing Port</span>
                    <span className="text-zinc-600 font-normal">Read-Only Bind</span>
                  </div>
                  <input 
                    type="text" 
                    readOnly
                    value="3000"
                    disabled
                    className="w-full bg-zinc-950 border border-white/5 rounded-lg p-2 font-mono text-xs text-zinc-500 cursor-not-allowed uppercase"
                  />
                  <span className="text-[8.5px] text-zinc-600 block leading-normal italic">
                    ⚠ Port 3000 is reserved to bind container networks in accordance with the workspace development server proxy.
                  </span>
                </div>
              </div>

              <div className="p-5 border-t border-white/5 bg-zinc-950/60 flex gap-2 justify-end">
                <button 
                  onClick={() => setIsSettingsOpen(false)} 
                  className="px-4 py-2 border border-white/5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  onClick={() => {
                    setIsSettingsOpen(false);
                    addAgentLog?.(`Saved compiler settings: WorkerPool=${maxThreads} threads, DevLogs=${verboseLogging ? 'verbose' : 'brief'}`, 'success');
                  }} 
                  className="px-5 py-2.5 rounded-lg bg-[#00b8ff] hover:bg-[#33c9ff] text-black text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-[0_0_12px_rgba(0,184,255,0.15)] hover:scale-[1.02] active:scale-100"
                >
                  Apply and Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-btn-user {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid #1c212b;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.1s;
        }
        .nav-btn-user:hover { color: #f8fafc; border-color: #3b4252; }
      `}} />
    </div>
  );
}

function PhaseItem({ num, name, status, onClick }: { num: string, name: string, status: 'done' | 'active' | 'pending', onClick?: () => void }) {
  return (
    <motion.button 
      type="button"
      onClick={onClick}
      whileHover={{ x: 3 }}
      className={cn(
        "w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#00b8ff]/40",
        status === 'active' ? "bg-[#00b8ff]/5 border border-[#00b8ff]/10" : "border border-transparent hover:bg-white/[0.01]"
      )}
    >
       <div className={cn(
         "w-1.5 h-1.5 rounded-full shrink-0",
         status === 'done' ? "bg-[#00e5a0]" : 
         status === 'active' ? "bg-[#00b8ff] shadow-[0_0_8px_#00b8ff]" : "bg-[#475569]"
       )} />
       <div className="flex gap-2 items-baseline text-left">
          <span className={cn(
            "font-mono text-[10px] font-bold min-w-[15px]",
            status === 'done' ? "text-[#00e5a0]" : 
            status === 'active' ? "text-[#00b8ff]" : "text-[#475569]"
          )}>{num}</span>
          <span className={cn(
            "text-[12px] transition-colors tracking-wide",
            status === 'active' ? "text-zinc-100 font-bold" : "text-zinc-500 font-medium"
          )}>{name}</span>
       </div>
    </motion.button>
  );
}

function EngineCard({ selected, onClick, version, name, tag, desc, accent }: any) {
  const accentColors = {
    blue: "text-[#00b8ff]",
    yellow: "text-[#f5c842]",
    green: "text-[#00e5a0]",
    purple: "text-[#a78bfa]"
  };

  return (
    <motion.button 
      type="button"
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "text-left border rounded-xl p-4 cursor-pointer transition-all bg-[#0e1115] relative overflow-hidden group outline-none focus-visible:ring-2 focus-visible:ring-[#00b8ff]/40",
        selected ? "border-[#00b8ff] bg-[#00b8ff]/5 shadow-[0_0_15px_rgba(0,184,255,0.05)]" : "border-[#1b1f26] hover:bg-[#12161c] hover:border-zinc-700"
      )}
    >
       {selected && <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-[#00b8ff] to-[#a78bfa]" />}
       <div className="flex items-start justify-between mb-2">
          <span className={cn("font-mono text-[9px] font-bold tracking-wider uppercase", accentColors[accent as keyof typeof accentColors])}>{version}</span>
          <div className={cn(
            "w-3.5 h-3.5 rounded-full border transition-all flex items-center justify-center",
            selected ? "border-[#00b8ff]" : "border-[#1b1f26]"
          )}>
            {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#00b8ff]" />}
          </div>
       </div>
       <div className="text-[13px] font-bold text-[#f8fafc] mb-0.5 group-hover:text-white transition-colors">{name}</div>
       <div className="font-mono text-[8.5px] text-[#64748b] font-bold tracking-wider mb-2">{tag}</div>
       <p className="text-[11px] text-[#cbd5e1] leading-relaxed border-t border-[#1b1f26] pt-3 font-normal">
          {desc}
       </p>
    </motion.button>
  );
}

function ModuleToggle({ label, icon, on, onClick }: any) {
  return (
    <motion.button 
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all select-none outline-none focus-visible:ring-1 focus-visible:ring-[#00b8ff]/40",
        on ? "border-[#00b8ff] bg-[#00b8ff]/10 text-[#00b8ff] shadow-[0_0_10px_rgba(0,184,255,0.05)]" : "border-[#1b1f26] bg-[#0c1015] text-[#cbd5e1] hover:border-zinc-700 hover:text-white"
      )}
    >
       <span className="text-[12px]">{icon}</span>
       <span>{label}</span>
       <div className={cn("w-1.5 h-1.5 rounded-full transition-all ml-0.5", on ? "bg-[#00b8ff]" : "bg-[#475569]")} />
    </motion.button>
  );
}

function TopologyCard({ selected, onClick, icon, title, desc, accent }: any) {
  const bgColors = {
    green: "bg-[#00e5a0]/5",
    blue: "bg-[#00b8ff]/5",
    yellow: "bg-[#f5c842]/5",
    purple: "bg-[#a78bfa]/5"
  };

  const textColors = {
    green: "text-[#00e5a0]",
    blue: "text-[#00b8ff]",
    yellow: "text-[#f5c842]",
    purple: "text-[#a78bfa]"
  };

  const borderColors = {
    green: "border-[#00e5a0]/40",
    blue: "border-[#00b8ff]/40",
    yellow: "border-[#f5c842]/40",
    purple: "border-[#a78bfa]/40"
  };

  return (
    <motion.button 
      type="button" 
      onClick={onClick} 
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "text-left border rounded-xl p-3.5 cursor-pointer bg-[#0e1115] relative overflow-hidden flex items-start gap-3 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00b8ff]/40",
        selected ? `border-current ${bgColors[accent as keyof typeof bgColors]} shadow-[0_0_12px_rgba(255,255,255,0.02)]` : "border-[#1b1f26] hover:bg-[#12161c] hover:border-zinc-700"
      )}
      style={{
        borderColor: selected ? undefined : '',
        color: selected ? (accent === 'green' ? '#00e5a0' : accent === 'blue' ? '#00b8ff' : accent === 'yellow' ? '#f5c842' : '#a78bfa') : undefined
      }}
    >
       <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0 border border-white/5", selected ? bgColors[accent as keyof typeof bgColors] + " " + textColors[accent as keyof typeof textColors] : "bg-[#0c1015] text-[#64748b]")}>
          {icon}
       </div>
       <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-2">
             <h4 className="text-[12px] font-bold text-white uppercase tracking-wider">{title}</h4>
             {selected && <div className={cn("w-1.5 h-1.5 rounded-full select-indicator", textColors[accent as keyof typeof textColors])} style={{ backgroundColor: 'currentColor' }} />}
          </div>
          <p className="text-[11px] text-[#cbd5e1] leading-relaxed font-normal">
             {desc}
          </p>
       </div>
    </motion.button>
  );
}

function SpecRow({ label, value, color }: { label: string, value: string, color?: string }) {
  const colorMap = {
    accent: "text-[#00b8ff]",
    green: "text-[#00e5a0]",
    yellow: "text-[#f5c842]",
    dim: "text-[#64748b]"
  };
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-zinc-900 last:border-none">
       <span className="font-mono text-[9px] text-[#64748b] uppercase font-bold tracking-wider">{label}</span>
       <span className={cn("text-[11px] font-medium tracking-wide text-right font-mono", color ? colorMap[color as keyof typeof colorMap] : "text-[#cbd5e1]")}>{value}</span>
    </div>
  );
}
