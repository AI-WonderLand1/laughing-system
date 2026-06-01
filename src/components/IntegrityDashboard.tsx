import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { CheckpointStep, WorkspaceError } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  History, 
  RotateCcw, 
  Trash2, 
  Activity, 
  Cpu, 
  Sparkles, 
  Terminal, 
  ChevronRight, 
  PlusCircle, 
  Flame, 
  RefreshCw, 
  HardDrive
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function IntegrityDashboard() {
  const {
    errors,
    checkpoints,
    isSaving,
    createCheckpoint,
    recordError,
    resolveError,
    triggerErrorRemediation,
    restoreCheckpoint,
    clearCheckpoints,
    setViewMode
  } = useWorkspace();

  const [simErrorSection, setSimErrorSection] = useState('Kubernetes Pod Studio');
  const [simErrorCode, setSimErrorCode] = useState('ERR_K8S_THREAD_LOCK');
  const [simErrorMessage, setSimErrorMessage] = useState('Component dispatcher encountered a persistent thread lock state under concurrent Draco compilation.');
  const [customCheckpointName, setCustomCheckpointName] = useState('');
  
  const [healingErrorId, setHealingErrorId] = useState<string | null>(null);
  const [remediationLogs, setRemediationLogs] = useState<Record<string, string>>({});

  // Calculate dynamic stats
  const activeErrors = errors.filter(e => !e.resolved);
  const resolvedErrors = errors.filter(e => e.resolved);
  const totalErrorsCount = errors.length;
  const integrityIndex = Math.max(0, 100 - activeErrors.length * 15);

  const handleSimulateError = () => {
    if (!simErrorSection || !simErrorCode || !simErrorMessage) return;
    recordError(simErrorSection, simErrorCode, simErrorMessage);
    
    // Auto-generate some randomized future defaults
    const sections = ['Asset PipelinePass', 'Plugins & Extensions', 'Spatial RenderEngine', 'Source Compiler'];
    const codes = ['ERR_WEB_SOCKET_HALT', 'ERR_DRACO_FAIL_MESH_COMPRESS', 'ERR_WASM_MEM_CORRUPT', 'ERR_SECURE_AUTH_TIMEOUT'];
    const messages = [
      'Active connection websocket closed abruptly by remote infrastructure peer.',
      'Draco vertex pipeline optimization terminated: unreferenced coordinate floats in model body.',
      'WebAssembly runtime instance exceeded virtual memory allocation pool boundary.',
      'SSL dynamic token signature invalidated. Session credentials expired.'
    ];
    const rIdx = Math.floor(Math.random() * sections.length);
    setSimErrorSection(sections[rIdx]);
    setSimErrorCode(codes[rIdx % codes.length]);
    setSimErrorMessage(messages[rIdx % messages.length]);
  };

  const handleCreateCustomCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCheckpointName.trim()) return;
    createCheckpoint(customCheckpointName.trim());
    setCustomCheckpointName('');
  };

  const handleTriggerHeal = async (errId: string) => {
    setHealingErrorId(errId);
    try {
      const solution = await triggerErrorRemediation(errId);
      setRemediationLogs(prev => ({
        ...prev,
        [errId]: solution
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setHealingErrorId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-ui-bg text-zinc-100 p-6 space-y-6">
      
      {/* Upper Diagnostic Diagnostic Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-zinc-950 to-[#0e1017] border border-white/5 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">AetherOS Telemetry Protection</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
            System Integrity & Core Backups
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Automatic state-dump checklists persist your workspace coordinates instantly on every activity step. AI diagnostics actively monitor component registries across all active sections.
          </p>
        </div>

        {/* Dynamic Health Index Display */}
        <div className="flex items-center gap-4 bg-black/45 p-4 rounded-xl border border-white/5">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Workspace Health Index</span>
            <span className={cn(
              "text-3xl font-black tracking-tight",
              integrityIndex > 80 ? "text-emerald-400" : integrityIndex > 50 ? "text-amber-400" : "text-red-400"
            )}>
              {integrityIndex}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
            {activeErrors.length === 0 ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-red-400 animate-bounce" />
            )}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns - Errors & Simulator */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Active Section Errors Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-ui-accent" />
                <h3 className="text-xs font-mono font-black uppercase text-zinc-200 tracking-wider">
                  ACTIVE SECTION ERROR LOGS ({activeErrors.length})
                </h3>
              </div>
              {activeErrors.length > 0 && (
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                  Unresolved alerts in viewport
                </span>
              )}
            </div>

            <div className="bg-ui-panel border border-ui-border rounded-xl p-4 overflow-hidden shadow-xl space-y-4">
              {errors.length === 0 ? (
                <div className="py-12 border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400/60" />
                  <p className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Workspace cleared of all warnings and issues</p>
                  <p className="text-[9px] font-sans text-zinc-600 uppercase">Use the simulation triggers to inject section exceptions</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {errors.map((err) => (
                    <div 
                      key={err.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all duration-300",
                        err.resolved 
                          ? "bg-emerald-950/5 border-emerald-500/10 text-emerald-100" 
                          : "bg-red-950/5 border-red-500/15 text-red-100"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5 mb-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                            err.resolved 
                              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" 
                              : "bg-red-500/20 border border-red-500/30 text-red-400"
                          )}>
                            Component: {err.section}
                          </span>
                          <span className="font-mono text-[9px] font-bold text-zinc-400 tracking-tight">
                            {err.code}
                          </span>
                        </div>
                        <span className="text-[8.5px] font-mono text-zinc-500">
                          {new Date(err.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <p className={cn(
                          "text-[10px] leading-relaxed uppercase font-mono",
                          err.resolved ? "text-zinc-400" : "text-zinc-300"
                        )}>
                          {err.message}
                        </p>

                        {/* remediation output log */}
                        {(err.resolved || remediationLogs[err.id]) && (
                          <div className="bg-black/55 p-3 rounded border border-white/5 font-mono text-[9px] space-y-1.5 leading-relaxed text-emerald-400">
                            <span className="font-black text-emerald-500 tracking-wider block text-[8.5px] uppercase">
                              ✔ AI REMEDIATION RECORDED
                            </span>
                            <span className="block font-sans whitespace-pre-wrap uppercase leading-normal">
                              {err.resolutionInfo || remediationLogs[err.id]}
                            </span>
                          </div>
                        )}

                        {!err.resolved && (
                          <div className="flex justify-end pt-1 bg-black/10 -m-4 p-3 rounded-b-xl border-t border-white/5 mt-2 gap-2">
                            <button
                              onClick={() => handleTriggerHeal(err.id)}
                              disabled={healingErrorId !== null}
                              className={cn(
                                "py-1.5 px-4 rounded text-[9px] font-black uppercase flex items-center gap-1.5 transition-all outline-none",
                                healingErrorId === err.id
                                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                  : "bg-ui-accent hover:opacity-85 text-zinc-950 font-bold cursor-pointer"
                              )}
                            >
                              {healingErrorId === err.id ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Applying patch coordinates...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>⚡ AI Heal Component</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section Exception Injection Sandbox Simulator */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-mono font-black uppercase text-zinc-200 tracking-wider">
                WORKSPACE EXCEPTION INJECTOR
              </h3>
            </div>

            <div className="bg-ui-panel border border-ui-border rounded-xl p-4 shadow-xl space-y-4">
              <p className="text-[10px] text-zinc-400 uppercase leading-relaxed font-mono">
                Inject deep exceptions inside specific workspace sections to verify live health indexes and AI remediation triggers.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8.5px] uppercase font-bold text-zinc-500 tracking-wider block">Target Component Section</label>
                  <select 
                    value={simErrorSection} 
                    onChange={e => setSimErrorSection(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-lg p-2 font-mono text-[10px] text-zinc-300 uppercase focus:border-ui-accent outline-none"
                  >
                    <option value="Kubernetes Pod Studio">Kubernetes Pod Studio</option>
                    <option value="Asset Pipeline Compiler">Asset Pipeline Compiler</option>
                    <option value="Spatial Core Canvas">Spatial Core Canvas</option>
                    <option value="Source Gulp/Vite Compiler">Source Gulp/Vite Compiler</option>
                    <option value="AetherShield Security Agent">AetherShield Security Agent</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8.5px] uppercase font-bold text-zinc-500 tracking-wider block">Error Identification Code</label>
                  <select 
                    value={simErrorCode} 
                    onChange={e => setSimErrorCode(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-lg p-2 font-mono text-[10px] text-zinc-300 focus:border-ui-accent outline-none"
                  >
                    <option value="ERR_POD_OOM_OUT_OF_MEMORY">ERR_POD_OOM_OUT_OF_MEMORY</option>
                    <option value="ERR_STRIPE_NOT_CONFIGURED">ERR_STRIPE_NOT_CONFIGURED</option>
                    <option value="ERR_DRACO_FAIL_MESH_COMPRESS">ERR_DRACO_FAIL_MESH_COMPRESS</option>
                    <option value="ERR_WEB_SOCKET_HALT">ERR_WEB_SOCKET_HALT</option>
                    <option value="ERR_WASM_MEM_CORRUPT">ERR_WASM_MEM_CORRUPT</option>
                    <option value="ERR_CPU_SPIKE_THERMAL">ERR_CPU_SPIKE_THERMAL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8.5px] uppercase font-bold text-zinc-500 tracking-wider block">Log Exception Message</label>
                <input 
                  type="text" 
                  value={simErrorMessage}
                  onChange={e => setSimErrorMessage(e.target.value)}
                  className="w-full bg-black/45 border border-white/10 rounded-lg p-2 font-mono text-[10px] text-zinc-300 uppercase focus:border-ui-accent outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSimulateError}
                className="w-full py-2 bg-red-950/25 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/50 rounded-lg text-red-400 font-mono text-[10px] font-black uppercase transition-all tracking-wider flex items-center justify-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Inject Exception Into Context Registry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Auto-Saves & Recovery Bench */}
        <div className="space-y-6">
          
          {/* Timeline and Save Controller */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-black uppercase text-zinc-200 tracking-wider">
                  REAL-TIME BACKUP CHRONOLOGY
                </h3>
              </div>
              
              {isSaving && (
                <span className="flex items-center gap-2 text-[8px] uppercase font-black text-emerald-400 bg-emerald-500/10 py-1 px-2.5 rounded border border-emerald-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Saving step...
                </span>
              )}
            </div>

            <div className="bg-ui-panel border border-ui-border rounded-xl p-4 shadow-xl space-y-4">
              
              {/* Manual Snap Trigger */}
              <form onSubmit={handleCreateCustomCheckpoint} className="space-y-2 bg-black/35 p-3 rounded-lg border border-white/5">
                <span className="text-[8.5px] uppercase font-black text-zinc-400 block tracking-wider font-mono">Create Manual Workspace Checkpoint</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={35}
                    placeholder="E.g., Added neon lights..."
                    value={customCheckpointName}
                    onChange={e => setCustomCheckpointName(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded p-1.5 text-[10px] font-mono text-zinc-300 placeholder:text-zinc-600 focus:border-ui-accent outline-none uppercase"
                  />
                  <button 
                    type="submit"
                    className="px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 rounded text-[9px] font-black uppercase tracking-wider flex items-center justify-center text-zinc-100 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* History index info banner */}
              <p className="text-[9px] text-zinc-500 uppercase leading-relaxed font-mono">
                A snapshot of your 3D models, coordinates, and config variables is committed automatically to secure Cache storage on each stage transition.
              </p>

              {/* Steps chronological ledger list */}
              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {checkpoints.length === 0 ? (
                  <div className="py-8 text-center uppercase font-mono text-[9px] text-zinc-600">No checkpoints recorded</div>
                ) : (
                  checkpoints.map((cp) => (
                    <div 
                      key={cp.id}
                      className="p-3 bg-zinc-950/45 border border-white/5 rounded-lg flex items-center justify-between gap-3 group hover:border-ui-accent/30 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-mono font-black uppercase text-zinc-100 block truncate leading-tight group-hover:text-ui-accent transition-colors">
                          {cp.actionName}
                        </span>
                        <div className="flex items-center gap-2 text-[8px] text-zinc-500 font-mono">
                          <span className="uppercase text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded border border-white/5">
                            {cp.viewMode}
                          </span>
                          <span>
                            {new Date(cp.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => restoreCheckpoint(cp.id)}
                        className="py-1 px-2.5 bg-zinc-900 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 rounded text-[8.5px] font-black uppercase text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-all"
                        title="Rollback workspace parameters directly to this snapshot"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Diagnostics controls */}
              {checkpoints.length > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase">
                    Stored Backups: {checkpoints.length} snaps
                  </span>
                  <button
                    onClick={clearCheckpoints}
                    className="text-[8.5px] font-mono font-black uppercase text-red-400/80 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Format Journal</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Secure SSL Storage Details */}
          <div className="bg-ui-panel border border-ui-border rounded-xl p-4 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-zinc-400" />
              <h4 className="text-xs font-mono font-black uppercase text-zinc-300">SECURE LOCAL LEDGER BUS</h4>
            </div>
            
            <p className="text-[9.5px] font-mono text-zinc-400 leading-normal uppercase">
              Physical backups bypass secondary cloud storage networks to respect network security controls safely. All assets, mesh matrices, and deployment options persist locally in modern LocalCache.
            </p>

            <div className="space-y-1.5 bg-black/45 p-3 rounded-lg border border-white/5 font-mono text-[9px]">
              <div className="flex justify-between py-1 border-b border-white/5 text-zinc-500">
                <span>BUS PROTOCOL</span>
                <span className="text-zinc-200">AETHEROS_LOCALCACHE/1.1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-zinc-500">
                <span>SSL ENVELOPE</span>
                <span className="text-emerald-400 font-bold">AES-GCM-256 (ACTIVE)</span>
              </div>
              <div className="flex justify-between py-1 text-zinc-500">
                <span>SNAPSHOT COMPRESSION</span>
                <span className="text-emerald-400 font-bold">LZMA2 STREAM</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
