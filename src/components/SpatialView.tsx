import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from '../WorkspaceContext';
import { 
  Cpu, 
  Zap, 
  Activity, 
  Globe, 
  Database, 
  Link2, 
  ShieldCheck, 
  Terminal as TerminalIcon, 
  Settings, 
  RefreshCw,
  Power,
  Layers,
  Network,
  Box,
  Code,
  Sliders,
  Play
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function SpatialView() {
  const { setupConfig, addAgentLog, activeEngineId } = useWorkspace();
  const [connections, setConnections] = useState<Record<string, 'connecting' | 'connected' | 'error'>>({
    engine: 'connecting',
    assets: 'connecting',
    telemetry: 'connecting'
  });
  const [metrics, setMetrics] = useState({
    fps: 0,
    latency: 0,
    memory: 0,
    throughput: 0
  });

  // Unreal States
  const [lumenQuality, setLumenQuality] = useState(1.5);
  const [naniteMode, setNaniteMode] = useState("Clusters");
  const [enableRaytracing, setEnableRaytracing] = useState(true);
  const [pixelBitrate, setPixelBitrate] = useState(15.5);

  // PlayCanvas States
  const [selectedPCNode, setSelectedPCNode] = useState("Box_Trigger");
  const [pcRotateSpeed, setPcRotateSpeed] = useState(45);
  const [enablePhysics, setEnablePhysics] = useState(true);

  // Unity States
  const [selectedUnityObj, setSelectedUnityObj] = useState("Orb_Telemetry_Light");
  const [unityGravity, setUnityGravity] = useState(-9.81);
  const [objectColor, setObjectColor] = useState("#38bdf8");
  const [rotateSpeed, setRotateSpeed] = useState(2.0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Simulate connection handshake
    const timer = setTimeout(() => {
      setConnections({
        engine: 'connected',
        assets: 'connected',
        telemetry: 'connected'
      });
      addAgentLog("Hybrid kernel handshake complete", "success");
    }, 2000);

    const metricsInterval = setInterval(() => {
      setMetrics({
        fps: 58 + Math.random() * 4,
        latency: 12 + Math.random() * 8,
        memory: activeEngineId === 'unreal' ? 3072 + Math.random() * 120 :
                activeEngineId === 'playcanvas' ? 1024 + Math.random() * 50 :
                activeEngineId === 'unity' ? 1536 + Math.random() * 80 :
                400 + Math.random() * 50,
        throughput: activeEngineId === 'unreal' ? 12.4 + Math.random() * 2.5 :
                    activeEngineId === 'playcanvas' ? 3.1 + Math.random() * 0.8 :
                    activeEngineId === 'unity' ? 5.2 + Math.random() * 1.2 :
                    2.1 + Math.random() * 1.5
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(metricsInterval);
    };
  }, [setupConfig, addAgentLog]);

  const handleReconnect = (key: string) => {
    setConnections(prev => ({ ...prev, [key]: 'connecting' }));
    setTimeout(() => {
      setConnections(prev => ({ ...prev, [key]: 'connected' }));
      addAgentLog(`Re-established link to ${key} source`, "success");
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-[#050608] text-white font-sans overflow-hidden">
      <div className="h-16 border-b border-white/[0.03] bg-[#0c0d12] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-blue-500/10 rounded-lg">
              <Network className="w-5 h-5 text-blue-400" />
           </div>
           <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Cluster_Orchestrator</div>
              <div className="text-sm font-black text-white uppercase tracking-tight mt-1">
                {setupConfig?.engineVersion} • {setupConfig?.deploymentTarget?.replace(/-/g, '_')}
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <Metric label="FPS" value={metrics.fps.toFixed(0)} unit="hz" />
           <Metric label="LAT" value={metrics.latency.toFixed(1)} unit="ms" />
           <Metric label="MEM" value={metrics.memory.toFixed(0)} unit="mb" />
           <div className="w-px h-8 bg-white/5 mx-2" />
           <button className="p-2 text-zinc-600 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
           </button>
           <button className="px-4 py-1.5 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all">
              Hot_Reload
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-white/[0.03] bg-[#0c0d12] p-6 flex flex-col gap-6">
           <div>
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Kernel_Connectivity</label>
              <div className="space-y-3">
                 <SourceState 
                    title="Engine Runtime" 
                    url={setupConfig?.sources.engine} 
                    status={connections.engine} 
                    onRetry={() => handleReconnect('engine')}
                 />
                 <SourceState 
                    title="Asset Bus" 
                    url={setupConfig?.sources.assets} 
                    status={connections.assets} 
                    onRetry={() => handleReconnect('assets')}
                 />
                 <SourceState 
                    title="Telemetry Feed" 
                    url={setupConfig?.sources.telemetry} 
                    status={connections.telemetry} 
                    onRetry={() => handleReconnect('telemetry')}
                 />
              </div>
           </div>

           <div>
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Hybrid_Modules</label>
              <div className="grid grid-cols-2 gap-2">
                 {setupConfig?.hybridModules.map(m => (
                    <div key={m} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3 group hover:border-blue-500/30 transition-all">
                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                       <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">{m}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="mt-auto p-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck className="w-3 h-3 text-emerald-400" />
                 <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Sentinel Integrity Verified</span>
              </div>
              <p className="text-[8px] text-zinc-600 font-bold uppercase leading-relaxed">
                 All source certificates verified. TLS handshake stable. Neural persistence active.
              </p>
           </div>
        </div>

        <div className="flex-1 bg-black relative flex flex-col overflow-hidden">
          {activeEngineId === 'unreal' ? (
            <div className="absolute inset-0 flex flex-col bg-[#0f1115] text-zinc-300 font-mono select-none">
              {/* Unreal Studio Header Toolbar */}
              <div className="h-8 bg-[#181c22] border-b border-[#2a313d] flex items-center justify-between px-3 text-[10px] text-zinc-400">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-white text-[11px] tracking-tight">UNREAL_STREAM_V5_ACTIVE</span>
                  <span className="h-3 w-px bg-zinc-700" />
                  <span className="text-zinc-500">LEVEL: map_staging_main.umap</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest">PixelStreaming Active (RTX-A60)</span>
                </div>
              </div>

              {/* Engine Studio Workspaces splitting controls & viewport */}
              <div className="flex-1 flex min-h-0">
                {/* Control Panel Inspector Left */}
                <div className="w-64 border-r border-[#2a313d] bg-[#14181f] p-4 flex flex-col gap-4 overflow-auto">
                  <div>
                    <span className="text-[9px] font-black text-zinc-500 tracking-widest uppercase block mb-1">Epic Lumen Config</span>
                    <p className="text-[8px] text-zinc-600 mb-3">MODIFY REAL-TIME GLOBAL ILLUMINATION SCALES</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1">
                          <span>LUMEN INTENSITY</span>
                          <span>{lumenQuality.toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range" min="0.5" max="2.0" step="0.1"
                          value={lumenQuality} onChange={e => setLumenQuality(parseFloat(e.target.value))}
                          className="w-full accent-blue-500 bg-zinc-800 h-1 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 mt-2">
                        <span>RAYTRACED SHADOWS</span>
                        <input 
                          type="checkbox" checked={enableRaytracing} onChange={e => setEnableRaytracing(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border border-zinc-700 bg-zinc-800 text-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#2a313d]" />

                  <div>
                    <span className="text-[9px] font-black text-zinc-500 tracking-widest uppercase block mb-1">Epic Nanite Assembly</span>
                    <p className="text-[8px] text-zinc-600 mb-3">COMPUTE PIPELINE POLYGON GEOMETRICS</p>
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest block">VIEW INTERIOR MODE</span>
                      <div className="grid grid-cols-3 gap-1">
                        {["Clusters", "Triangles", "Materials"].map(m => (
                          <button 
                            key={m} onClick={() => setNaniteMode(m)}
                            className={cn(
                              "py-1 rounded text-[8.5px] font-bold uppercase tracking-wider text-center border transition-all",
                              naniteMode === m ? 'bg-blue-500/20 text-[#00b8ff] border-blue-500/30' : 'bg-black/30 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                            )}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#2a313d]" />

                  <div>
                    <span className="text-[9px] font-black text-zinc-500 tracking-widest uppercase block mb-1">Stream Configuration</span>
                    <p className="text-[8px] text-zinc-600 mb-3">COORDINATE CELL BANDWIDTH ALLOCATION</p>
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1">
                        <span>PIXEL STREAM RATE</span>
                        <span>{pixelBitrate.toFixed(1)} Mbps</span>
                      </div>
                      <input 
                        type="range" min="5.0" max="30.0" step="0.5"
                        value={pixelBitrate} onChange={e => setPixelBitrate(parseFloat(e.target.value))}
                        className="w-full accent-blue-500 bg-zinc-800 h-1 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Viewport Render Block Right */}
                <div className="flex-1 bg-black relative flex flex-col min-w-0">
                  <div className="flex-1 relative min-h-0">
                    <EngineInteractiveCanvas 
                      engine="unreal" 
                      speed={pixelBitrate / 8} 
                      color="#00b8ff" 
                      polyCount={naniteMode === 'Clusters' ? 24 : naniteMode === 'Triangles' ? 72 : 12} 
                    />
                    <div className="absolute top-4 right-4 text-[9px] bg-black/60 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Sliders className="w-3 h-3 text-[#00b8ff] animate-pulse" />
                      <span className="font-extrabold uppercase tracking-widest text-[#00b8ff]">LUMEN Quality: {lumenQuality.toFixed(1)}x</span>
                    </div>
                  </div>

                  {/* Flowing Unreal Log Ticker */}
                  <div className="h-28 border-t border-[#2a313d] bg-[#0c0f13] p-3 flex flex-col font-mono text-[9px] text-zinc-500 overflow-auto space-y-1">
                    <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest mb-1 border-b border-zinc-800 pb-1">Unreal Core Diagnostic Event Log Stream</span>
                    <div className="flex items-center gap-2 text-[#00b8ff]/80">
                      <span className="text-zinc-600">[02:14:55]</span>
                      <span>[UE5-GKE-STREAM-POD] Shader Compiler compiled successfully (Lumen reflections calibrated).</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-zinc-600">[02:14:56]</span>
                      <span>[UE5-GKE-STREAM-POD] Nanite volume streaming layer hash updated: {naniteMode.toUpperCase()} active rendering.</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <span className="text-zinc-600">[02:14:57]</span>
                      <span>[UE5-GKE-STREAM-POD] Telemetry: Bitrate configured to {pixelBitrate} Mbps. Average frame delay: {(4 + Math.random() * 2).toFixed(1)} ms.</span>
                    </div>
                    {enableRaytracing && (
                      <div className="flex items-center gap-2 text-emerald-400/80">
                        <span className="text-zinc-600">[02:14:58]</span>
                        <span>[UE5-GKE-STREAM-POD] Raytracing pipeline bound. Shadows casting live on vertex coordinates.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeEngineId === 'playcanvas' ? (
            <div className="absolute inset-0 flex flex-col bg-[#141110] text-[#f59e0b] font-mono select-none">
              {/* PlayCanvas Studio Header */}
              <div className="h-8 bg-[#1f1a18] border-b border-[#352a26] flex items-center justify-between px-3 text-[10px] text-zinc-400">
                <div key="playcanvas" className="flex items-center gap-3">
                  <span className="font-extrabold text-[#f59e0b] text-[11px] tracking-tight">PLAYCANVAS Studio IDE</span>
                  <span className="h-3 w-px bg-zinc-800" />
                  <span className="text-zinc-500">STAGING PORT: 3001</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[9px] text-emerald-400 font-black">WS HANDSHAKE_ON</span>
                </div>
              </div>

              {/* Workspaces splits */}
              <div className="flex-1 flex min-h-0">
                {/* Scene tree hierarchy left */}
                <div className="w-64 border-r border-[#352a26] bg-[#1a1412] p-4 flex flex-col gap-4 overflow-auto text-zinc-400">
                  <div>
                    <span className="text-[9px] font-black text-zinc-500 tracking-widest uppercase block mb-3">Scene Hierarchy</span>
                    <div className="space-y-1">
                      {["Root_Staging", "Box_Trigger", "Main_Camera", "Directional_Light_0", "Particles_Pfx"].map(node => (
                        <button 
                          key={node} onClick={() => setSelectedPCNode(node)}
                          className={cn(
                            "w-full text-left py-1.5 px-2.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-2",
                            selectedPCNode === node ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20' : 'hover:bg-white/5 text-zinc-500 border border-transparent'
                          )}
                        >
                          <Box size={10} className="opacity-60" />
                          <span>{node}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-[#352a26]" />

                  <div>
                    <span className="text-[9px] font-black text-[#f59e0b]/70 tracking-widest uppercase block mb-1">Mesh Component Node</span>
                    <p className="text-[8px] text-zinc-600 mb-3">MODIFY PLAYCANVAS TRANSFORMS</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[9px] font-extrabold text-zinc-400 mb-1">
                          <span>ROTATION OVERRIDE</span>
                          <span>{pcRotateSpeed} deg/s</span>
                        </div>
                        <input 
                          type="range" min="0" max="180" step="5"
                          value={pcRotateSpeed} onChange={e => setPcRotateSpeed(parseInt(e.target.value))}
                          className="w-full accent-[#f59e0b] bg-zinc-800 h-1 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-extrabold text-zinc-400 mt-2">
                        <span>COLLISION PHYSICS</span>
                        <input 
                          type="checkbox" checked={enablePhysics} onChange={e => setEnablePhysics(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border border-zinc-700 bg-zinc-800 text-[#f59e0b]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Canvas renderer center */}
                <div className="flex-1 bg-black relative flex flex-col min-w-0">
                  <div className="flex-1 relative min-h-0">
                    <EngineInteractiveCanvas 
                      engine="playcanvas" 
                      speed={pcRotateSpeed / 10} 
                      color="#00e5a0" 
                      polyCount={enablePhysics ? 16 : 8} 
                    />
                    <div className="absolute top-4 right-4 text-[9px] bg-black/60 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Code className="w-3 h-3 text-[#f59e0b] animate-pulse" />
                      <span className="font-extrabold uppercase tracking-widest text-[#f59e0b]">Active script: rotate-mesh.js</span>
                    </div>
                  </div>

                  {/* Playcanvas Code Editor and console falling output */}
                  <div className="h-32 border-t border-[#352a26] bg-[#0c0909] p-3 grid grid-cols-2 gap-3 min-h-[128px]">
                    <div className="flex flex-col min-h-0">
                      <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest mb-1">rotate-mesh.js Script Code Inspector</span>
                      <pre className="flex-1 bg-black/30 text-[8px] text-zinc-400 p-2 rounded border border-[#352a26]/50 overflow-auto font-mono leading-tight">
{`var Rotate = pc.createScript('rotate');
Rotate.prototype.update = function (dt) {
    this.entity.rotate(0, ${pcRotateSpeed} * dt, 0);
    // Physics collisions: ${enablePhysics ? "STABLE" : "BYPASSED"}
};`}
                      </pre>
                    </div>

                    <div className="flex flex-col min-h-0">
                      <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest mb-1">Playcanvas Live Stream Diagnostics</span>
                      <div className="flex-1 bg-black/30 text-[8px] text-zinc-500 p-2 rounded border border-[#352a26]/50 overflow-auto font-mono space-y-1">
                        <div>Line 1: [PLAYCANVAS ENG] Loaded engine version v1.65.2-web</div>
                        <div>Line 2: [SYNTHESIS-IDE] Bound asset bus successfully.</div>
                        <div className="text-[#f59e0b]/85">Line 3: [COMPILE] cube-rotate.js parsed with rotational factor: {pcRotateSpeed} deg/s.</div>
                        {enablePhysics && <div className="text-emerald-500/80">Line 4: [PHYSICS] Ammo.js rigid body collision mesh initialized.</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeEngineId === 'unity' ? (
            <div className="absolute inset-0 flex flex-col bg-[#1c1d1f] text-zinc-300 font-mono select-none">
              {/* Unity Reflect Header */}
              <div className="h-8 bg-[#28292e] border-b border-[#3e4046] flex items-center justify-between px-3 text-[10px] text-zinc-400">
                <div key="unity" className="flex items-center gap-3">
                  <span className="font-extrabold text-white text-[11px] tracking-tight">UNITY REFLECT CONSOLE</span>
                  <span className="h-3 w-px bg-zinc-700" />
                  <span className="text-zinc-500">REMOTE DEPLOYPORT: 3002</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                  <span className="text-[9px] text-[#a78bfa] uppercase font-black tracking-widest">REMOTE WASM CONNECTED</span>
                </div>
              </div>

              {/* Workspaces splits */}
              <div className="flex-1 flex min-h-0">
                {/* Hierarchy tree left */}
                <div className="w-64 border-r border-[#3e4046] bg-[#1e1f22] p-4 flex flex-col gap-4 overflow-auto text-zinc-400">
                  <div>
                    <span className="text-[9px] font-black text-zinc-500 tracking-widest uppercase block mb-3">Reflect GameObjects Hierarchy</span>
                    <div className="space-y-1">
                      {["Main_Camera", "Direct_Light_Ambient", "Orb_Telemetry_Light", "Ground_Base_Staging"].map(obj => (
                        <button 
                          key={obj} onClick={() => setSelectedUnityObj(obj)}
                          className={cn(
                            "w-full text-left py-1 px-2 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-2",
                            selectedUnityObj === obj ? 'bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/20' : 'hover:bg-white/5 text-zinc-500 border border-transparent'
                          )}
                        >
                          <Layers size={10} className="opacity-60" />
                          <span>{obj}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-[#3e4046]" />

                  <div>
                    <span className="text-[9px] font-black text-[#a78bfa]/80 tracking-widest uppercase block mb-1">Unity Inspector attributes</span>
                    <p className="text-[8px] text-zinc-600 mb-3">DYNAMIC C# LINKER INTERPRETER</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1">
                          <span>RIGIDBODY GRAVITY</span>
                          <span>{unityGravity.toFixed(2)} m/s²</span>
                        </div>
                        <input 
                          type="range" min="-19.6" max="0" step="0.5"
                          value={unityGravity} onChange={e => setUnityGravity(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 bg-zinc-800 h-1 rounded"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1">
                          <span>ROTATION COEFFICIENT</span>
                          <span>{rotateSpeed.toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range" min="0.5" max="5.0" step="0.5"
                          value={rotateSpeed} onChange={e => setRotateSpeed(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 bg-zinc-800 h-1 rounded"
                        />
                      </div>
                      <div>
                        <span className="text-[8.5px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">MATERIAL STAGE COLOR</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" value={objectColor} onChange={e => setObjectColor(e.target.value)}
                            className="bg-transparent border-0 w-8 h-6 p-0 cursor-pointer"
                          />
                          <span className="text-[9px] text-zinc-500 uppercase">{objectColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viewport Render Block Center */}
                <div className="flex-1 bg-black relative flex flex-col min-w-0">
                  <div className="flex-1 relative min-h-0">
                    <EngineInteractiveCanvas 
                      engine="unity" 
                      speed={rotateSpeed * 1.5} 
                      color={objectColor} 
                      polyCount={Math.abs(unityGravity) > 10 ? 32 : 16} 
                    />
                    <div className="absolute top-4 right-4 text-[9px] bg-black/60 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Play className="w-3 h-3 text-purple-400 animate-pulse" />
                      <span className="font-extrabold uppercase tracking-widest text-[#a78bfa]">Unity Reflect Client (Active)</span>
                    </div>
                  </div>

                  {/* Flowing Unity Console diagnostic feed */}
                  <div className="h-28 border-t border-[#3e4046] bg-[#111215] p-3 flex flex-col font-mono text-[9px] text-zinc-500 overflow-auto space-y-1">
                    <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest mb-1 border-b border-zinc-800 pb-1">Unity remote dynamic WASM compile log</span>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-zinc-600">[02:14:55]</span>
                      <span>[UNITY_REFLECT] Allocated instances on static heap. WebGL compilation frame mapping complete.</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <span className="text-zinc-600">[02:14:56]</span>
                      <span>[UNITY_REFLECT] Physics.gravity configured: (0.00, {unityGravity.toFixed(2)}, 0.00).</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#a78bfa]/80">
                      <span className="text-zinc-600">[02:14:57]</span>
                      <span>[UNITY_REFLECT] Material of GameObject '{selectedUnityObj}' coloring parameter initialized to {objectColor.toUpperCase()}.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : setupConfig?.sources.engine ? (
            <iframe 
              ref={iframeRef}
              src={setupConfig.sources.engine}
              className="w-full h-full border-none"
              title="Spatial Engine Runtime"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
               <div className="w-20 h-20 rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center mb-6">
                  <Box className="w-10 h-10 text-blue-500 opacity-50" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Awaiting Engine Link</h3>
               <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest max-w-sm leading-relaxed">
                  No spatial runtime address provided. Synthesis plane is in standby mode. 
                  Please configure a valid kernel source in connectivity settings.
               </p>
            </div>
          )}

          <div className="absolute top-12 left-6 flex flex-col gap-3 pointer-events-none z-10">
             <HudBadge icon={<Activity className="w-3 h-3" />} label="STABLE" />
             <HudBadge icon={<Link2 className="w-3 h-3" />} label={`${metrics.throughput.toFixed(1)} GB/S`} />
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: `40px 40px`
          }} />
        </div>

        <div className="w-64 border-l border-white/[0.03] bg-[#0c0d12] p-6 space-y-8">
           <section>
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Deployment_Audit</label>
              <div className="space-y-4">
                 <AuditItem label="Namespace" value="default-runtime" />
                 <AuditItem label="Runtime" value={setupConfig?.deploymentTarget || 'local'} />
                 <AuditItem label="Kernel" value="v9.0.2-hybrid" />
                 <AuditItem label="Orch" value="Synthesis_Engine" />
              </div>
           </section>

           <section>
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Command_Center</label>
              <div className="space-y-2">
                 <CommandBtn label="Restart Cluster" icon={<RefreshCw size={12} />} />
                 <CommandBtn label="Flush Cache" icon={<Layers size={12} />} />
                 <CommandBtn label="Panic Shutdown" icon={<Power size={12} />} variant="danger" />
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="flex flex-col items-end">
       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">{label}</span>
       <div className="flex items-baseline gap-0.5 mt-0.5">
          <span className="text-sm font-black text-zinc-200 tracking-tighter leading-none">{value}</span>
          <span className="text-[10px] font-bold text-zinc-600 tracking-tight">{unit}</span>
       </div>
    </div>
  );
}

function SourceState({ title, url, status, onRetry }: any) {
  const statusColors = {
    connected: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    connecting: "text-blue-400 bg-blue-500/10 border-blue-500/20 animate-pulse",
    error: "text-rose-400 bg-rose-500/10 border-rose-500/20"
  };

  return (
    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
       <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-white uppercase tracking-tight">{title}</span>
          <div className={cn("px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", statusColors[status as keyof typeof statusColors])}>
             {status}
          </div>
       </div>
       <div className="text-[10px] font-mono text-zinc-600 truncate mb-3">{url || 'NOT_CONFIGURED'}</div>
       <div className="flex gap-2">
          <button onClick={onRetry} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black text-zinc-500 uppercase tracking-widest transition-all">
             Refresh_Link
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-600 hover:text-white transition-all">
             <Globe size={11} />
          </button>
       </div>
    </div>
  );
}

function HudBadge({ icon, label }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full backdrop-blur-md">
       <div className="text-blue-500">{icon}</div>
       <span className="text-[9px] font-black text-white uppercase tracking-widest">{label}</span>
    </div>
  );
}

function AuditItem({ label, value }: any) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
       <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">{label}</span>
       <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tight">{value}</span>
    </div>
  );
}

function CommandBtn({ label, icon, variant = "default" }: any) {
  return (
    <button className={cn(
      "w-full py-3 px-4 rounded-xl flex items-center justify-between group transition-all border",
      variant === "danger" 
        ? "bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10 text-rose-500" 
        : "bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
    )}>
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
       <div className="transition-transform group-hover:scale-110">{icon}</div>
    </button>
  );
}

function EngineInteractiveCanvas({ engine, speed, color, polyCount }: { engine: string, speed: number, color: string, polyCount: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(10, 11, 14, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.22;

      rotation += (speed || 1) * 0.005;

      // Draw grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw reference boundary ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius + Math.sin(rotation * 2) * 5, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}15`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Formulate 3D mesh node projections
      const points: {x: number, y: number}[] = [];
      const count = polyCount || 12;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + rotation;
        const r = radius + Math.cos(angle * 3 + rotation) * 12;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        points.push({ x: px, y: py });
      }

      // Render wireframe connectivities
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          if ((j - i) % 2 === 1 || engine === 'unreal') {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.strokeStyle = engine === 'unreal' ? `rgba(0, 184, 255, ${0.1 + (0.9 / (j - i))})` : `${color}35`;
            ctx.stroke();
          }
        }
      }

      // Wireframe vertex anchors
      ctx.fillStyle = color;
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // HUD textual streams
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '9px monospace';
      ctx.fillText(`CONTAINER_ENGINE: ${engine.toUpperCase()}`, 20, 30);
      ctx.fillText(`GEOMETRIC_POLYS: ${count * 4} TRIANGLES`, 20, 42);
      ctx.fillText(`PIXEL_STREAM_PORT: ${engine === 'unreal' ? '3000' : engine === 'playcanvas' ? '3001' : '3002'}`, 20, 54);
      ctx.fillText(`RENDER_STATUS: 60HZ // GKE_NODE_HEALTHY`, 20, 66);

      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [engine, speed, color, polyCount]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
