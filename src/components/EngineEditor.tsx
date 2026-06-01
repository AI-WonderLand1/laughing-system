import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Cpu, 
  Play, 
  Settings, 
  ChevronRight, 
  Box, 
  Zap,
  Globe,
  Database,
  RefreshCw,
  Sparkles,
  Shield,
  BarChart4,
  Loader2,
  Code,
  Wand2,
  Sliders,
  Eye,
  Check,
  Trash2,
  PenTool,
  Bookmark
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';

export default function EngineEditor() {
  const { 
    config, 
    updateConfig, 
    addAgentLog, 
    setupConfig, 
    synthesisStatus, 
    setSynthesisStatus,
    customEngineConfig,
    updateCustomEngineConfig,
    addEntity,
    entities,
    activeEngineId,
    spinUpEnginePod
  } = useWorkspace();

  const [optimizationReport, setOptimizationReport] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'orchestrator' | 'custom-lab' | 'mesh-designer'>('orchestrator');

  // Custom script compilation states
  const [editorCode, setEditorCode] = useState(customEngineConfig?.script || '');
  const [isCompilingCode, setIsCompilingCode] = useState(false);
  const [compilationSuccess, setCompilationSuccess] = useState<boolean | null>(null);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([
    'SYSTEM: Ready to compile custom engine scripts.'
  ]);

  // Voxel & Mesh designer states
  const [customMeshName, setCustomMeshName] = useState('My Core Vox');
  const [customMeshShape, setCustomMeshShape] = useState<'box' | 'sphere' | 'torus' | 'octahedron' | 'cone'>('torus');
  const [customMeshColor, setCustomMeshColor] = useState('#00e5a0');
  const [customMeshX, setCustomMeshX] = useState(0);
  const [customMeshY, setCustomMeshY] = useState(2);
  const [customMeshZ, setCustomMeshZ] = useState(-5);
  const [customMeshScale, setCustomMeshScale] = useState(1);
  const [customMeshWireframe, setCustomMeshWireframe] = useState(false);
  const [designerLogs, setDesignerLogs] = useState<string>('');

  const handleSynthesize = () => {
    setSynthesisStatus('synthesizing');
    addAgentLog(`Initiating hybrid synthesis sequence for ${setupConfig?.engineVersion || 'v3-stable'}...`, 'thinking');
    
    setTimeout(() => {
      addAgentLog(`Merging modules: ${setupConfig?.hybridModules?.join(', ') || 'Core Spatial'}`, 'info');
    }, 1000);

    setTimeout(() => {
      addAgentLog(`Kernel optimization pass complete`, 'info');
    }, 2500);

    setTimeout(() => {
      setSynthesisStatus('complete');
      addAgentLog(`Hybrid Engine Synthesized Successfully`, 'success');
    }, 4000);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    addAgentLog("Generating neural optimization pass...", "thinking");
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze this kernel configuration and provide a 3-point technical optimization report:
          Engine: ${setupConfig?.engineVersion || 'v3-stable'}
          Modules: ${setupConfig?.hybridModules?.join(', ') || 'Core Spatial'}
          Deployment: ${setupConfig?.deploymentTarget || 'Kube-core'}
          Be extremely concise and technical. Use markdown.`,
          history: [],
          context: { pods: [], scenes: [], viewMode: 'engine' }
        })
      });
      const data = await response.json();
      setOptimizationReport(data.content);
      addAgentLog("Optimization report generated", "success");
    } catch (error) {
      console.error(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const codeTemplates = [
    {
      name: '🌀 Orbit & Pulse',
      desc: 'Rotates shape on Y axis and scales with high-frequency sine pulsation loops.',
      code: `// Available parameters: time, mesh, scene
function onUpdate(time, mesh, scene) {
  // Rotate core voxel elements
  mesh.rotation.y = time * 0.9;
  mesh.rotation.z = time * 0.3;
  
  // Sine scale pulsing effect
  const pulsingScale = 1.0 + Math.sin(time * 3.5) * 0.22;
  mesh.scale.set(pulsingScale, pulsingScale, pulsingScale);
}`
    },
    {
      name: '💫 Chaotic Spin',
      desc: 'Asymmetric triple-axis rotational angular frequencies.',
      code: `// Available parameters: time, mesh, scene
function onUpdate(time, mesh, scene) {
  // Chaotic triple angle spin
  mesh.rotation.x = time * 1.5;
  mesh.rotation.y = time * 0.7;
  mesh.rotation.z = time * 2.2;
}`
    },
    {
      name: '📈 Levitating Orbit',
      desc: 'Floating levitation vectors mapped with gradual rotation curves.',
      code: `// Available parameters: time, mesh, scene
function onUpdate(time, mesh, scene) {
  // Translate height offsets
  mesh.position.y = Math.sin(time * 2.5) * 0.6;
  mesh.position.x = Math.cos(time * 1.5) * 0.4;
  
  // Twist parameters
  mesh.rotation.y = time * 0.5;
}`
    },
    {
      name: '🧠 Emissive Breathing',
      desc: 'Bypasses static positions to directly morph emissive illumination offsets.',
      code: `// Available parameters: time, mesh, scene
function onUpdate(time, mesh, scene) {
  mesh.rotation.y = time * 0.45;
  
  // Twist material properties
  if (mesh.material && mesh.material.emissive) {
    const breathingHue = (time * 0.1) % 1.0;
    mesh.material.emissive.setHSL(breathingHue, 1.0, 0.5);
  }
}`
    }
  ];

  const handleApplyTemplate = (code: string, templateName: string) => {
    setEditorCode(code);
    updateCustomEngineConfig({ script: code });
    setCompilationSuccess(null);
    setCompilationLogs(prev => [
      ...prev,
      `[LOADED] Applied template "${templateName}" into active editor workspace.`
    ]);
    addAgentLog(`Loaded custom code template: ${templateName}`, 'info');
  };

  const handleCompileCode = () => {
    setIsCompilingCode(true);
    setCompilationLogs(prev => [
      ...prev,
      `[INFO] Re-building programmable engine parser bounds...`,
      `[INFO] Checking syntax: evaluating onUpdate parameter keys...`
    ]);

    setTimeout(() => {
      try {
        let testCode = editorCode;
        if (testCode.includes('function onUpdate')) {
          testCode += "\n; if (typeof onUpdate === 'function') {  }";
        }
        // Test compile via new Function instantiation
        new Function('time', 'mesh', 'scene', testCode);

        // Save to provider context
        updateCustomEngineConfig({ script: editorCode });
        setCompilationSuccess(true);
        setCompilationLogs(prev => [
          ...prev,
          `[SUCCESS] Custom engine loop compiled: 0 warnings, verified size ${editorCode.length} bytes.`,
          `[LOG] hot-reloaded successfully on active WebGL thread.`
        ]);
        addAgentLog("Programmable custom script compiled and hot-reloaded successfully!", "success");
      } catch (err: any) {
        setCompilationSuccess(false);
        setCompilationLogs(prev => [
          ...prev,
          `[ERROR] Syntax error detected inside code compiler bounds.`,
          `[ERROR] detail: ${err.message}`
        ]);
        addAgentLog(`Script compiler failed: ${err.message}`, "error");
      } finally {
        setIsCompilingCode(false);
      }
    }, 1200);
  };

  const handleCreateCustomMesh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMeshName.trim()) return;

    // Trigger addEntity from WorkspaceContext
    addEntity({
      type: 'mesh',
      name: customMeshName.trim(),
      x: Number(customMeshX),
      y: Number(customMeshY),
      z: Number(customMeshZ),
      scale: Number(customMeshScale),
      rotation: 0,
      properties: {
        color: customMeshColor,
        wireframe: customMeshWireframe,
        shape: customMeshShape,
        isCustomEngineMesh: true
      }
    });

    setDesignerLogs(`CREATED: Registered spatial entity "${customMeshName}" [${customMeshShape.toUpperCase()}] at coordinates (${customMeshX}, ${customMeshY}, ${customMeshZ}) inside active World registry.`);
    addAgentLog(`Registered and spawned customized shape "${customMeshName}" inside 3D Studio.`, 'success');
    
    // Reset name for next creation
    setCustomMeshName('Aux Mesh ' + (entities.length + 1));
  };

  const handleSelectProgrammableEngine = () => {
    spinUpEnginePod('custom');
    addAgentLog("Activated custom programmable engine sandbox environment.", "success");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#050608] text-zinc-100">
      
      {/* Sub Tab Navigation bar */}
      <div className="border-b border-white/5 bg-[#0a0c10] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('orchestrator')}
            className={cn(
              "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2",
              activeTab === 'orchestrator' 
                ? "bg-zinc-800 text-white border border-white/10" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>📡 Hybrid Core Orchestrator</span>
          </button>

          <button 
            onClick={() => setActiveTab('custom-lab')}
            className={cn(
              "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2",
              activeTab === 'custom-lab' 
                ? "bg-zinc-800 text-white border border-white/10" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Code className="w-3.5 h-3.5 text-ui-accent" />
            <span>⚙️ Programmable Engine Lab</span>
          </button>

          <button 
            onClick={() => setActiveTab('mesh-designer')}
            className={cn(
              "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2",
              activeTab === 'mesh-designer' 
                ? "bg-zinc-800 text-white border border-white/10" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
            <span>📐 Mesh & Shape Designer</span>
          </button>
        </div>

        {/* Global state indicator */}
        <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Engine Frame context:</span>
            <span className={cn(
              "text-[10px] font-mono font-bold uppercase",
              activeEngineId === 'custom' ? "text-[#00e5a0]" : "text-blue-400"
            )}>
              {activeEngineId.toUpperCase()}
            </span>
          </div>
          {activeEngineId !== 'custom' && (
            <button
              onClick={handleSelectProgrammableEngine}
              className="px-2.5 py-1 rounded bg-[#00e3ff]/10 hover:bg-[#00e3ff]/20 border border-[#00e3ff]/20 text-[#00e3ff] text-[9px] font-mono tracking-wider uppercase transition-all"
            >
              Activate Custom
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* TAB 1: ORIGINAL HYBRID CORE ORCHESTRATOR */}
        {activeTab === 'orchestrator' && (
          <div className="flex-1 flex overflow-hidden h-full">
            <div className="w-64 border-r border-white/5 flex flex-col bg-[#0c0d12]">
              <div className="p-4 border-b border-white/5 bg-gradient-to-b from-blue-500/5 to-transparent">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 block">Synthesized Modules</label>
                <div className="space-y-1">
                  {(setupConfig?.hybridModules || ['Core Renderer', 'Telemetry Bus']).map(m => (
                    <ModuleItem key={m} label={m.toUpperCase()} active />
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-white/[0.01] flex-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 block text-center">Neural Link Stats</label>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                    <div className="text-[9px] font-bold text-blue-400 uppercase text-center mb-1">Deployment Core</div>
                    <div className="text-[11px] font-black text-white uppercase tracking-widest text-center">
                      {(setupConfig?.deploymentTarget || 'k8s-pod')?.replace(/-/g, '_')?.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
                    <div className="text-[9px] font-bold text-purple-400 uppercase text-center mb-1">Entropy Load</div>
                    <div className="text-[11px] font-black text-white uppercase tracking-widest text-center">
                      MINIMAL_3%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col relative overflow-auto bg-aura-blue p-8 space-y-8">
              <div className="max-w-4xl mx-auto w-full space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                      {synthesisStatus === 'synthesizing' ? <RefreshCw className="w-7 h-7 text-white animate-spin" /> : <Cpu className="w-7 h-7 text-white" />}
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Hybrid_Kernel_Orchestration</h1>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                        Status: <span className={cn(synthesisStatus === 'complete' ? "text-emerald-400" : "text-blue-400")}>{synthesisStatus.toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <StatCard label="Memory Usage" value="1.24 GB" icon={<Database className="w-4 h-4 text-purple-400" />} />
                    <StatCard label="Synthesis Latency" value="1.4s" icon={<Globe className="w-4 h-4 text-emerald-400" />} />
                    <StatCard label="Active Workers" value="12 Nodes" icon={<BarChart4 className="w-4 h-4 text-blue-400" />} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <SectionHeader title="Synthesis Parameters" icon={<Settings className="w-4 h-4" />} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ConfigCard title="Telemetry Stream" desc="Real-time kernel profiling" value={setupConfig?.sources.telemetry} />
                      <ConfigCard title="Asset Bus" desc="Content delivery network" value={setupConfig?.sources.assets} />
                      <ConfigCard title="Engine Kernel" desc="Spatial runtime source" value={setupConfig?.sources.engine} />
                      <ConfigCard title="Version Control" desc="Semantic versioning" value={setupConfig?.engineVersion} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionHeader title="AI Oversight" icon={<Sparkles className="w-4 h-4" />} />
                    <div className="bg-[#0c0d12]/65 border border-white/5 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 space-y-4">
                        {optimizationReport ? (
                          <div className="text-[10px] text-zinc-300 leading-relaxed max-h-[180px] overflow-auto pr-1 select-text">
                            {optimizationReport}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Shield className="w-4 h-4 text-zinc-500" />
                            </div>
                            <p className="text-[9px] text-zinc-500 uppercase font-bold">No Optimization Active</p>
                          </div>
                        )}
                        
                        <button 
                          onClick={handleOptimize}
                          disabled={isOptimizing}
                          className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-[9px] font-black uppercase tracking-widest text-zinc-300 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          {isOptimizing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                          Run AI Audit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex border-t border-white/5 justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", synthesisStatus === 'complete' ? "bg-emerald-500" : "bg-zinc-800")} />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Compiler_Link: {synthesisStatus === 'complete' ? 'READY' : 'STANDBY'}</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-2 border border-white/10 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all">FLUSH_CACHE</button>
                    <button 
                      onClick={handleSynthesize}
                      disabled={synthesisStatus === 'synthesizing'}
                      className={cn(
                        "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md",
                        synthesisStatus === 'synthesizing' 
                          ? "bg-zinc-800 text-zinc-500" 
                          : "bg-blue-600 text-white hover:bg-blue-500"
                      )}
                    >
                      {synthesisStatus === 'synthesizing' ? "SYNTHESIZING..." : "INITIATE_SYNTHESIS"}
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROGRAMMABLE ENGINE LAB AND CODE COMPILER */}
        {activeTab === 'custom-lab' && (
          <div className="flex-1 flex overflow-hidden h-full">
            
            {/* Left Side: Parameters Slider Panel */}
            <div className="w-80 border-r border-white/5 bg-[#0c0d12] flex flex-col p-4 overflow-y-auto space-y-6">
              <div>
                <label className="text-[10px] font-bold text-[#00e5a0] uppercase tracking-widest block mb-4">Space Matrix Variables</label>
                <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/5">
                  
                  {/* Background color */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase font-black">Universe Backing color</span>
                      <span className="text-[9.5px] font-mono text-zinc-500 font-bold">{customEngineConfig.bg}</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={customEngineConfig.bg}
                        onChange={e => updateCustomEngineConfig({ bg: e.target.value })}
                        className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={customEngineConfig.bg}
                        maxLength={7}
                        onChange={e => updateCustomEngineConfig({ bg: e.target.value })}
                        className="flex-1 bg-black/50 border border-white/10 rounded h-8 px-2 text-[10px] font-mono uppercase text-zinc-300 focus:border-[#00e3ff] outline-none"
                      />
                    </div>
                  </div>

                  {/* Ambient illumination hue */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase font-black">Ambient illumination Light</span>
                      <span className="text-[9.5px] font-mono text-zinc-500 font-bold">{customEngineConfig.ambient}</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={customEngineConfig.ambient}
                        onChange={e => updateCustomEngineConfig({ ambient: e.target.value })}
                        className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={customEngineConfig.ambient}
                        maxLength={7}
                        onChange={e => updateCustomEngineConfig({ ambient: e.target.value })}
                        className="flex-1 bg-black/50 border border-white/10 rounded h-8 px-2 text-[10px] font-mono uppercase text-zinc-300 focus:border-[#00e3ff] outline-none"
                      />
                    </div>
                  </div>

                  {/* Glow point light indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase font-black">Particle Glow PointLight</span>
                      <span className="text-[9.5px] font-mono text-zinc-500 font-bold">{customEngineConfig.particleColor}</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={customEngineConfig.particleColor}
                        onChange={e => updateCustomEngineConfig({ particleColor: e.target.value })}
                        className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={customEngineConfig.particleColor}
                        maxLength={7}
                        onChange={e => updateCustomEngineConfig({ particleColor: e.target.value })}
                        className="flex-1 bg-black/50 border border-white/10 rounded h-8 px-2 text-[10px] font-mono uppercase text-zinc-300 focus:border-[#00e3ff] outline-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Slider multipliers */}
              <div className="space-y-3.5">
                <label className="text-[10px] font-bold text-[#00e5a0] uppercase tracking-widest block">Physics & Time Scaling</label>
                <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[9.5px]">
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>LOOP ROTATION VELOCITY</span>
                      <span className="text-[#00e5a0] font-bold">{customEngineConfig.speed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="3.0" 
                      step="0.1"
                      value={customEngineConfig.speed}
                      onChange={e => updateCustomEngineConfig({ speed: Number(e.target.value) })}
                      className="w-full accent-[#00e5a0] bg-zinc-800 cursor-pointer h-1 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>GEOMETRY ROTATION RATIO</span>
                      <span className="text-[#00e5a0] font-bold">{customEngineConfig.rotationSpeed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="4.0" 
                      step="0.2"
                      value={customEngineConfig.rotationSpeed}
                      onChange={e => updateCustomEngineConfig({ rotationSpeed: Number(e.target.value) })}
                      className="w-full accent-[#00e5a0] bg-zinc-800 cursor-pointer h-1 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>PARTICLE INTENSITY</span>
                      <span className="text-[#00e5a0] font-bold">{customEngineConfig.particleCount} cells</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="500" 
                      step="10"
                      value={customEngineConfig.particleCount}
                      onChange={e => updateCustomEngineConfig({ particleCount: Number(e.target.value) })}
                      className="w-full accent-[#00e5a0] bg-zinc-800 cursor-pointer h-1 rounded"
                    />
                  </div>

                </div>
              </div>

              {/* Base Geometry Selection */}
              <div className="space-y-3.5">
                <label className="text-[10px] font-bold text-[#00e5a0] uppercase tracking-widest block">Active Base Mesh Solid</label>
                <div className="grid grid-cols-2 gap-2 bg-black/45 p-3 rounded-xl border border-white/5">
                  {['box', 'sphere', 'torus', 'octahedron', 'cone'].map(shape => (
                    <button
                      key={shape}
                      onClick={() => updateCustomEngineConfig({ customShape: shape as any })}
                      className={cn(
                        "p-2 text-center rounded-lg border text-[10px] font-mono uppercase font-bold transition-all cursor-pointer",
                        customEngineConfig.customShape === shape 
                          ? "bg-[#00e5a0]/10 border-[#00e5a0] text-[#00e5a0]" 
                          : "border-white/5 bg-zinc-950/40 text-zinc-400 hover:text-white"
                      )}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Code editor and console */}
            <div className="flex-1 flex flex-col bg-[#050608] overflow-hidden">
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* Code Editor block */}
                <div className="flex-1 flex flex-col p-4 border-r border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-ui-accent" />
                      <span className="text-xs font-black uppercase text-zinc-300 font-mono">Engine onUpdate Frame script hook</span>
                    </div>
                    <span className="text-[9.5px] font-mono text-zinc-500 uppercase">Compiled on JavaScript tick event</span>
                  </div>

                  <div className="flex-1 bg-zinc-950 rounded-xl border border-white/5 relative p-1 pb-4 flex flex-col overflow-hidden">
                    <textarea
                      value={editorCode}
                      onChange={e => setEditorCode(e.target.value)}
                      placeholder="// Write code updates on activeMesh or custom scene"
                      className="flex-1 w-full p-4 font-mono text-xs text-zinc-300 bg-transparent resize-none focus:outline-none custom-scrollbar uppercase-none text-left leading-relaxed"
                      spellCheck="false"
                      style={{ textTransform: 'none' }}
                    />

                    {/* Bottom compilation trigger */}
                    <div className="px-3 flex justify-between items-center bg-black/30 border-t border-white/5 pt-2">
                      <div className="flex items-center gap-2">
                        {compilationSuccess === true && (
                          <span className="text-[9.5px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded flex items-center gap-1 font-mono uppercase">
                            <Check className="w-3 h-3" /> Live linked
                          </span>
                        )}
                        {compilationSuccess === false && (
                          <span className="text-[9.5px] bg-red-500/15 text-red-500 font-bold px-2 py-0.5 rounded flex items-center gap-1 font-mono uppercase">
                            ✖ Build failed
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleCompileCode}
                        disabled={isCompilingCode}
                        className="py-1.5 px-4 bg-ui-accent hover:opacity-85 text-zinc-950 font-mono text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                      >
                        {isCompilingCode ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Compiling engine loops...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>Compile & Hot-Reload</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Templates Selector */}
                <div className="w-full lg:w-72 p-4 flex flex-col overflow-y-auto space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-white/5">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-black uppercase text-zinc-300">Quick Code Presets</span>
                  </div>

                  <p className="text-[10px] text-zinc-500 uppercase leading-relaxed font-mono">
                    Select standard orbital acceleration scripts to seed your engine update cycle instantly.
                  </p>

                  <div className="space-y-3 pr-1">
                    {codeTemplates.map(tpl => (
                      <button
                        key={tpl.name}
                        onClick={() => handleApplyTemplate(tpl.code, tpl.name)}
                        className="w-full text-left p-3 bg-zinc-950/60 border border-white/5 hover:border-ui-accent/30 rounded-xl transition-all flex flex-col gap-1 cursor-pointer"
                      >
                        <span className="text-[11px] font-bold text-white uppercase tracking-tight">{tpl.name}</span>
                        <span className="text-[9px] text-zinc-500 leading-normal font-sans uppercase">{tpl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Dynamic Console Logs */}
              <div className="h-40 bg-[#07080b] border-t border-white/5 p-4 flex flex-col font-mono text-[10.5px]">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2 text-zinc-500 font-bold uppercase select-none">
                  <span>Engine Telemetry & Compilation logs</span>
                  <button 
                    onClick={() => setCompilationLogs(['SYSTEM: Telemetry log reset ready.'])}
                    className="text-[9px] text-zinc-500 hover:text-white uppercase font-black"
                  >
                    Clear Console
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 text-zinc-400 select-text font-mono">
                  {compilationLogs.map((log, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "leading-relaxed uppercase",
                        log.includes('[SUCCESS]') ? 'text-emerald-400' :
                        log.includes('[ERROR]') ? 'text-red-400 font-bold' :
                        log.includes('[LOADED]') ? 'text-purple-400' : 'text-zinc-500'
                      )}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: MESH & VOXEL DESIGNER */}
        {activeTab === 'mesh-designer' && (
          <div className="flex-1 flex overflow-hidden h-full">
            
            {/* Shapes Configurator */}
            <div className="w-96 border-r border-white/5 bg-[#0c0d12] flex flex-col p-6 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <Bookmark className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Spatial Entity Builder</h3>
                <p className="text-[10px] text-zinc-400 uppercase leading-relaxed font-mono">
                  Define structural variables for high precision 3D mesh instances. Submit the form to instantly register them inside your physical World Scene list.
                </p>
              </div>

              <form onSubmit={handleCreateCustomMesh} className="space-y-4">
                
                {/* Mesh Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider font-mono">Entity Designation Label</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={customMeshName}
                    onChange={e => setCustomMeshName(e.target.value)}
                    className="w-full bg-black/55 border border-white/10 rounded-lg p-2 text-xs font-mono text-zinc-200 focus:border-emerald-400 outline-none uppercase"
                  />
                </div>

                {/* Mesh Shape */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider font-mono">Geometry Shape Solid</label>
                  <select
                    value={customMeshShape}
                    onChange={e => setCustomMeshShape(e.target.value as any)}
                    className="w-full bg-black/55 border border-white/10 rounded-lg p-2 text-xs font-mono text-zinc-200 focus:border-emerald-400 outline-none uppercase"
                  >
                    <option value="box">Box (Voxel Core)</option>
                    <option value="sphere">Sphere (Orbital)</option>
                    <option value="torus">Torus (Vortex Ring)</option>
                    <option value="octahedron">Octahedron (Diamond)</option>
                    <option value="cone">Cone (Fixture)</option>
                  </select>
                </div>

                {/* Mesh Color */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider font-mono">Albedo Mesh Paint</label>
                    <span className="text-[9.5px] font-mono text-emerald-400 uppercase">{customMeshColor}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customMeshColor}
                      onChange={e => setCustomMeshColor(e.target.value)}
                      className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      maxLength={7}
                      value={customMeshColor}
                      onChange={e => setCustomMeshColor(e.target.value)}
                      className="flex-1 bg-black/55 border border-white/10 rounded-lg px-2 text-xs font-mono uppercase text-zinc-200 focus:border-emerald-400 outline-none h-10"
                    />
                  </div>
                </div>

                {/* Coordinates (X, Y, Z) */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider font-mono">XYZ Translation Offsets</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 block uppercase">Pos X</span>
                      <input
                        type="number"
                        step="0.5"
                        value={customMeshX}
                        onChange={e => setCustomMeshX(Number(e.target.value))}
                        className="w-full bg-black/55 border border-white/10 rounded p-1.5 text-xs font-mono text-zinc-200 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 block uppercase">Pos Y (Height)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={customMeshY}
                        onChange={e => setCustomMeshY(Number(e.target.value))}
                        className="w-full bg-black/55 border border-white/10 rounded p-1.5 text-xs font-mono text-zinc-200 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 block uppercase">Pos Z</span>
                      <input
                        type="number"
                        step="0.5"
                        value={customMeshZ}
                        onChange={e => setCustomMeshZ(Number(e.target.value))}
                        className="w-full bg-black/55 border border-white/10 rounded p-1.5 text-xs font-mono text-zinc-200 text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Mesh Scale */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider font-mono">Dilation Scale multiplier</label>
                    <span className="text-[9.5px] font-mono text-emerald-400">{customMeshScale}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    value={customMeshScale}
                    onChange={e => setCustomMeshScale(Number(e.target.value))}
                    className="w-full accent-emerald-400 bg-zinc-800 cursor-pointer h-1 rounded"
                  />
                </div>

                {/* Wireframe toggle */}
                <div className="flex items-center justify-between py-1 border-t border-white/5 pt-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider cursor-pointer select-none" htmlFor="wf">
                    Compile in Wireframe Mode
                  </label>
                  <input
                    type="checkbox"
                    id="wf"
                    checked={customMeshWireframe}
                    onChange={e => setCustomMeshWireframe(e.target.checked)}
                    className="w-4 h-4 accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Spawn Action Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-950/30 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl text-emerald-400 font-mono text-[10px] font-black uppercase transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 animate-bounce" />
                  <span>Spawn & Sync to Studio View</span>
                </button>
              </form>
            </div>

            {/* Active scene list viewer */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#050608] space-y-4">
              <div>
                <dt className="text-xs font-black uppercase text-zinc-300 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>World Entities Database Ledgers ({entities.length})</span>
                </dt>
                <p className="text-[10px] text-zinc-500 uppercase leading-relaxed font-mono mt-1">
                  Active meshes contextually mapped inside this workspace. These objects display instantly on the ThreeJS canvas scene of 3D Pod Studio.
                </p>
              </div>

              {/* Status prompt */}
              {designerLogs && (
                <div className="p-3.5 bg-emerald-950/15 border border-emerald-500/15 rounded-xl font-mono text-[9.5px] text-emerald-400 leading-normal uppercase">
                  {designerLogs}
                </div>
              )}

              {/* Grid cards listing entities */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                {entities.map(ent => (
                  <div key={ent.id} className="p-4 bg-zinc-950/45 border border-white/5 rounded-xl flex items-center justify-between gap-4 group hover:border-[#00e5a0]/30 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wide text-zinc-100 group-hover:text-emerald-400 transition-colors">
                          {ent.name}
                        </span>
                        <span className="text-[7.5px] font-mono bg-zinc-900 border border-white/5 py-0.5 px-1.5 rounded text-zinc-400">
                          {ent.type.toUpperCase()}
                        </span>
                        {ent.properties?.isCustomEngineMesh && (
                          <span className="text-[7px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 py-0.5 px-1.5 rounded uppercase font-black">
                            CUSTOM LAB
                          </span>
                        )}
                      </div>

                      {/* Coordinates */}
                      <div className="flex items-center gap-3.5 text-[9px] font-mono text-zinc-500">
                        <span>X: {ent.x}</span>
                        <span>Y: {ent.y}</span>
                        <span>Z: {ent.z}</span>
                        {ent.properties?.color && (
                          <span className="flex items-center gap-1">
                            COLOR: 
                            <span 
                              className="w-2.5 h-2.5 rounded-full inline-block border border-white/10" 
                              style={{ backgroundColor: ent.properties.color }}
                            />
                            {ent.properties.color}
                          </span>
                        )}
                        {ent.properties?.shape && (
                          <span>SHAPE: {ent.properties.shape.toUpperCase()}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-[9px] text-zinc-500 h-6 flex items-center bg-zinc-900 px-2.5 rounded border border-white/5">
                      SCALE: {ent.scale}x
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function ConfigCard({ title, desc, value }: any) {
  return (
    <div className="p-4 bg-[#0c0d12] border border-white/5 rounded-2xl space-y-2 group hover:border-blue-500/20 transition-all text-left">
       <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest">{title}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors" />
       </div>
       <div className="text-[10px] font-bold text-white truncate font-mono uppercase">{value || 'UNSET'}</div>
       <p className="text-[8.5px] text-zinc-600 font-bold uppercase">{desc}</p>
    </div>
  );
}

function ModuleItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-lg border text-[10px] font-medium transition-all text-left select-none",
      active ? "bg-ui-accent/5 border-ui-accent/20 text-ui-text font-black" : "bg-transparent border-transparent text-ui-text-muted opacity-50"
    )}>
      {label}
      {active && <div className="w-1.5 h-1.5 rounded-full bg-ui-accent animate-pulse" />}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-ui-panel border border-ui-border rounded-xl p-3 flex items-center gap-3 shadow-lg group hover:border-ui-accent/30 transition-all text-left">
      <div className="p-2 bg-ui-bg rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[8.5px] font-bold text-ui-text-muted uppercase tracking-widest leading-none">{label}</span>
        <span className="text-[12.5px] font-bold text-ui-text font-mono mt-1 leading-none">{value}</span>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1 bg-ui-panel rounded border border-ui-border text-ui-accent">
        {icon}
      </div>
      <h3 className="text-[10px] font-bold text-ui-text uppercase tracking-wider">{title}</h3>
      <div className="h-[1px] flex-1 bg-ui-border ml-2" />
    </div>
  );
}
