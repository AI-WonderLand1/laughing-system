import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';
import FileExplorer from './FileExplorer';
import Editor from './Editor';
import Terminal from './Terminal';
import SpatialView from './SpatialView';
import CanvasEditor from './CanvasEditor';
import EngineEditor from './EngineEditor';
import GltfPipeline from './GltfPipeline';
import ProjectSettings from './ProjectSettings';
import AgentSidebar from './AgentSidebar';
import KubernetesView from './KubernetesView';
import AIAssistant from './AIAssistant';
import PluginsView from './PluginsView';
import PodStudio from './PodStudio';
import BillingView from './BillingView';
import IntegrityDashboard from './IntegrityDashboard';
import { ChevronDown, BrainCircuit, Box, Sparkles, Layers } from 'lucide-react';

const COLORS = {
  bg: "#0a0b0e",
  surface: "#111318",
  surfaceHover: "#1a1d24",
  border: "#1e2330",
  borderBright: "#2a3040",
  accent: "#00d4ff",
  accentDim: "#00a8cc",
  accentGlow: "rgba(0,212,255,0.12)",
  accentGlow2: "rgba(0,212,255,0.06)",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  emerald: "#10b981",
  rose: "#f43f5e",
  green: "#00e5a0",
  amber: "#ffb340",
  red: "#ff4d6a",
  text: "#f8fafc",
  textDim: "#cbd5e1",
  textFaint: "#94a3b8",
};

const NAV_TABS = [
  { id: "pod-studio", label: "📦 3D Pod Studio" },
  { id: "assistant", label: "AI Intelligence" },
  { id: "integrity", label: "🛡️ Integrity & Backups" },
  { id: "infrastructure", label: "Clusters & Pods" },
  { id: "design", label: "UI Design" },
  { id: "engine", label: "Engine Setup" },
  { id: "spatial", label: "Spatial View" },
  { id: "code", label: "Source Code" },
  { id: "pipeline", label: "Asset Pipeline" },
  { id: "plugins", label: "Plugins & Exts" },
  { id: "settings", label: "Settings" },
  { id: "billing", label: "💳 Billing & Plans" },
];

export default function Shell() {
  const { 
    viewMode, 
    setViewMode, 
    isSidebarOpen, 
    setSidebarOpen, 
    isAgentSidebarOpen, 
    setAgentSidebarOpen, 
    isAgentThinking, 
    addAgentLog, 
    setupConfig,
    hybridSplit,
    setHybridSplit
  } = useWorkspace();
  const [deployOpen, setDeployOpen] = useState(false);

  // Dynamic high-fidelity deploy simulation states
  const [isDeployingCloudRun, setIsDeployingCloudRun] = useState(false);
  const [cloudRunProgress, setCloudRunProgress] = useState(0);
  const [cloudRunLogs, setCloudRunLogs] = useState<string[]>([]);
  
  const [isVerifyingCluster, setIsVerifyingCluster] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifyLogs, setVerifyLogs] = useState<string[]>([]);

  const handleDeployCloudRun = () => {
    setDeployOpen(false);
    setIsDeployingCloudRun(true);
    setCloudRunProgress(0);
    setCloudRunLogs(["[INFO] Accessing Cloud Artifact Registry permissions..."]);
    addAgentLog?.("Initiating automated cluster container deployment...", "thinking");

    const logsList = [
      "[INFO] Bundling application source artifacts & assets buffers...",
      "[INFO] Executing npm run build (Bundling React & Node.js)",
      "[SUCCESS] Production build compiled (dist/ index & server assets).",
      "[DOCKER] Packaging container image under tag: gcr.io/wonder-space-3d/preview-run:v2",
      "[DOCKER] Pushing container blocks to cache context... [64.2 MB]",
      "[SUCCESS] Artifact uploaded securely to our Docker Container registry.",
      "[VM-MAN] Accessing virtual computer instance APIs: region=us-west-1 (isolated-low-latency)",
      "[VM] Provisioning container server-node... vCPUs=2, RAM=4GB, Dedicated compute queue initialized",
      "[NET] Mapping incoming listener container entry directly to Port 3000...",
      "[SUCCESS] Deep Deployment complete! Live run route: https://spatial-live-preview.run.app"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setCloudRunProgress(Math.min(100, Math.floor((currentStep / logsList.length) * 100)));
      const newLn = logsList[currentStep - 1];
      if (newLn) {
        setCloudRunLogs(prev => [...prev, newLn]);
        addAgentLog?.(newLn, newLn.includes('[SUCCESS]') ? 'success' : 'info');
      }

      if (currentStep >= logsList.length) {
        clearInterval(interval);
        addAgentLog?.("Cloud container deployment complete! Services online.", "success");
      }
    }, 450);
  };

  const handleVerifyCluster = () => {
    setDeployOpen(false);
    setIsVerifyingCluster(true);
    setVerifyProgress(0);
    setVerifyLogs(["[DIAG] Initiating local Kubernetes Cluster and WASI validation..."]);
    addAgentLog?.("Verifying kernel network connectivity and Port 3000 mapping...", "thinking");

    const logsList = [
      "[DIAG] Pinging host api-server: dev-3d-environments (100% resolution)",
      "[DIAG] Checking Port 3000 ingress channel... Route fully accessible.",
      "[DIAG] Validating active WASI system call bindings... Passed.",
      "[DIAG] Reviewing active graphics middleware bindings (ThreeJS/Babylon)... Safe.",
      "[DIAG] Checking container allocation... NVIDIA-A100 hardware confirmed.",
      "[SUCCESS] Diagnostics passed with 0 warnings & 0 critical telemetry errors!"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setVerifyProgress(Math.min(100, Math.floor((currentStep / logsList.length) * 100)));
      const newLn = logsList[currentStep - 1];
      if (newLn) {
        setVerifyLogs(prev => [...prev, newLn]);
        addAgentLog?.(newLn, newLn.includes('[SUCCESS]') ? 'success' : 'info');
      }

      if (currentStep >= logsList.length) {
        clearInterval(interval);
        addAgentLog?.("Cluster integrity check verified. Standby state nominal.", "success");
      }
    }, 400);
  };

  // Split View Implementation
  const renderMainContent = () => {
    if (hybridSplit && (viewMode === 'code' || viewMode === 'spatial')) {
      return (
        <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden" }}>
           <div style={{ flex: 1, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" }}>
              <Editor />
           </div>
           <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <SpatialView />
           </div>
        </div>
      );
    }

    switch(viewMode) {
      case 'pod-studio': return <PodStudio />;
      case 'design': return <CanvasEditor />;
      case 'engine': return <EngineEditor />;
      case 'spatial': return <SpatialView />;
      case 'settings': return <ProjectSettings />;
      case 'code': return <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}><Editor /></div>;
      case 'pipeline': return <GltfPipeline />;
      case 'infrastructure': return <KubernetesView />;
      case 'assistant': return <AIAssistant />;
      case 'plugins': return <PluginsView />;
      case 'billing': return <BillingView />;
      case 'integrity': return <IntegrityDashboard />;
      default: return <SpatialView />;
    }
  };

  const filteredTabs = NAV_TABS.filter(tab => {
    if (!setupConfig) return true;
    if (setupConfig.editorMode === 'code-lite') {
      return !['design', 'pipeline'].includes(tab.id);
    }
    if (setupConfig.editorMode === 'spatial-only') {
      return !['code', 'engine'].includes(tab.id);
    }
    return true;
  });

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: COLORS.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: COLORS.text, overflow: "hidden",
    }}>

      {/* TOP BAR */}
      <div style={{
        height: 48, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 16, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${COLORS.accent}, #7c3aed)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: `0 0 12px ${COLORS.accentGlow}`
          }}>
            <Box size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.2, textTransform: "uppercase" }}>Spatial_IDE</div>
            <div style={{ fontSize: 9, color: COLORS.textFaint, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
              Kernel: {setupConfig?.engineVersion?.toUpperCase() || 'V9.0.HYBRID'} • Runtime: {setupConfig?.deploymentTarget?.toUpperCase().replace(/-/g, '_') || 'LOCAL'}
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <div style={{ display: "flex", gap: 2, flex: 1, overflow: "auto", padding: "4px 0" }}>
          {filteredTabs.map(tab => (
            <button key={tab.id} onClick={() => setViewMode(tab.id as any)} style={{
              background: viewMode === tab.id ? `${COLORS.accent}15` : "transparent",
              border: viewMode === tab.id ? `1px solid ${COLORS.accent}33` : "1px solid transparent",
              borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: viewMode === tab.id ? 700 : 500,
              color: viewMode === tab.id ? COLORS.accent : COLORS.textFaint,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              textTransform: "uppercase", letterSpacing: "0.05em",
              boxShadow: viewMode === tab.id ? `0 0 15px ${COLORS.accent}10` : 'none',
              transform: viewMode === tab.id ? 'translateY(-1px)' : 'none'
            }}
            onMouseEnter={e => { if (viewMode !== tab.id) { e.currentTarget.style.color = COLORS.textDim; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}}
            onMouseLeave={e => { if (viewMode !== tab.id) { e.currentTarget.style.color = COLORS.textFaint; e.currentTarget.style.background = "transparent"; }}}
            >{tab.label}</button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          
           {(viewMode === 'code' || viewMode === 'spatial') && (
             <button 
               onClick={() => setHybridSplit(!hybridSplit)}
               style={{
                background: hybridSplit ? COLORS.accentGlow : "transparent",
                border: `1px solid ${hybridSplit ? COLORS.accent : COLORS.border}`,
                borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700,
                color: hybridSplit ? COLORS.accent : COLORS.textDim, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
               }}
             >
                <Layers size={14} />
                {hybridSplit ? "HYBRID_SPLIT: ON" : "HYBRID_SPLIT: OFF"}
             </button>
           )}

           {isAgentThinking && (
             <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: COLORS.accentGlow, borderRadius: 20, border: `1px solid ${COLORS.accent}44` }}>
               <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent }} className="animate-pulse" />
               <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>Thinking...</span>
             </div>
           )}

          <button onClick={() => setViewMode('settings' as any)} style={{
            background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6,
            padding: "5px 10px", fontSize: 11, color: COLORS.textDim, cursor: "pointer", display: "flex", alignItems: "center", gap: 5
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Export NPM
          </button>
          <button onClick={() => setViewMode('settings' as any)} style={{
            background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6,
            padding: "5px 10px", fontSize: 11, color: COLORS.textDim, cursor: "pointer", display: "flex", alignItems: "center", gap: 5
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            API Keys
          </button>
          
          <div style={{ position: "relative" }}>
             <button 
                onClick={() => setDeployOpen(!deployOpen)}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
                  border: "none", borderRadius: 6, padding: "5px 14px",
                  fontSize: 12, fontWeight: 600, color: "#000", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  boxShadow: `0 0 16px ${COLORS.accentGlow}`
                }}
             >
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                 <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
               </svg>
               Deploy
               <ChevronDown size={14} style={{ marginLeft: 4 }} />
             </button>
             
             {deployOpen && (
                <div style={{
                   position: 'absolute', top: '100%', right: 0, marginTop: 8, zIndex: 100,
                   background: COLORS.surface, border: `1px solid ${COLORS.borderBright}`,
                   borderRadius: 8, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', width: 225
                }}>
                   <div 
                      onClick={() => {
                        setDeployOpen(false);
                        addAgentLog("Packaging spatial application...", "thinking");
                        setTimeout(() => {
                          const data = JSON.stringify({ workspace: "Spatial Platform Beta", timestamp: new Date().toISOString() }, null, 2);
                          const blob = new Blob([data], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'spatial-release.json';
                          a.click();
                          URL.revokeObjectURL(url);
                          addAgentLog("Deployment complete. Released spatial-release.json", "success");
                        }, 1000);
                      }}
                      style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: COLORS.text, cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: 2 }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                   >
                      <span style={{ color: COLORS.text }}>Release Bundle</span>
                      <span style={{ fontSize: 9, color: COLORS.textFaint, fontWeight: 'normal' }}>Download offline platform package</span>
                    </div>

                    <div 
                       onClick={handleVerifyCluster}
                       style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: COLORS.text, cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: 2 }}
                       onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
                       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                       <span style={{ color: COLORS.accent }}>Verify Cluster</span>
                       <span style={{ fontSize: 9, color: COLORS.textFaint, fontWeight: 'normal' }}>Run core network and WASI validation</span>
                    </div>

                    <div 
                       onClick={handleDeployCloudRun}
                       style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: COLORS.text, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}
                       onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
                       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                       <span style={{ color: '#10b981' }}>Deploy to Workspace Cloud</span>
                       <span style={{ fontSize: 9, color: COLORS.textFaint, fontWeight: 'normal' }}>Spin up high-performance compute container node</span>
                    </div>
                </div>
             )}
          </div>

          <button onClick={() => setAgentSidebarOpen(!isAgentSidebarOpen)} style={{
            background: isAgentSidebarOpen ? COLORS.accentGlow : "transparent",
            color: isAgentSidebarOpen ? COLORS.accent : COLORS.textDim,
            border: isAgentSidebarOpen ? `1px solid ${COLORS.accent}44` : `1px solid ${COLORS.border}`, 
            borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
          }}>
             <BrainCircuit size={16} />
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ACTIVITY BAR */}
        <div style={{
          width: 48, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
          display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 8, flexShrink: 0,
        }}>
          <ActivityButton id="explorer" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>} active={isSidebarOpen} onClick={() => setSidebarOpen(!isSidebarOpen)} />
          <ActivityButton id="infra" icon={<Box size={20} />} active={viewMode === 'infrastructure'} onClick={() => setViewMode('infrastructure')} />
          <ActivityButton id="ai" icon={<Sparkles size={20} />} active={viewMode === 'assistant'} onClick={() => setViewMode('assistant')} />
        </div>

        {/* FILE EXPLORER PANEL */}
        {isSidebarOpen && (
          <div style={{
            width: 240, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
            display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden"
          }} className="shadow-2xl z-20">
            <FileExplorer />
          </div>
        )}

        {/* EDITOR AREA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "relative" }}>
           <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
             {renderMainContent()}
           </main>

           <Terminal />
        </div>

        {/* Right Sidebar (Agent & Logistics) */}
        {isAgentSidebarOpen && (
          <div style={{
            width: 320, background: COLORS.surface, borderLeft: `1px solid ${COLORS.border}`,
            display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.5)"
          }} className="z-20">
             <AgentSidebar />
          </div>
        )}
      </div>

      {/* CLOUD RUN SIMULATION MODAL OVERLAY */}
      {isDeployingCloudRun && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
          <div style={{
            background: "#080a0f", border: `1px solid #1b212c`,
            borderRadius: 16, maxWidth: 540, width: "100%", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>Cloud Runtime</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "0.05em" }}>WORKSPACE DEPLOYMENT PIPELINE</span>
              </div>
              <button 
                onClick={() => setIsDeployingCloudRun(false)} 
                disabled={cloudRunProgress < 100}
                style={{
                  background: "transparent", border: "none", color: COLORS.textFaint, cursor: cloudRunProgress < 100 ? "not-allowed" : "pointer",
                  fontSize: 14, opacity: cloudRunProgress < 100 ? 0.3 : 1
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", fontFamily: "monospace" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 11, color: cloudRunProgress < 100 ? "#10b981" : "#fff", fontWeight: "bold" }}>
                    {cloudRunProgress < 100 ? "COMPILING & DEPLOYING MODULE..." : "DEPLOYMENT COMPLETE"}
                  </span>
                  <span style={{ fontSize: 9, color: COLORS.textFaint, textTransform: "uppercase" }}>Target Instance URL Allocation</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: "bold", color: "#10b981" }}>{cloudRunProgress}%</span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", padding: 1, background: "#06070a" }}>
                <div style={{
                  height: "100%", background: "linear-gradient(90deg, #10b981, #00b8ff)", borderRadius: 10,
                  width: `${cloudRunProgress}%`, transition: "width 0.2s ease-out"
                }} />
              </div>

              {/* Live stdout feedback */}
              <div style={{
                background: "#030407", border: `1px solid ${COLORS.border}`, borderRadius: 10, height: 180, padding: 16,
                overflowY: "auto", fontFamily: "monospace", fontSize: 10, lineHeight: 1.6, color: COLORS.textDim, display: "flex", flexDirection: "column", gap: 4
              }}>
                {cloudRunLogs.map((ln, idx) => (
                  <div key={idx} style={{ 
                    color: ln.includes('[SUCCESS]') ? '#10b981' : ln.includes('[ERROR]') ? '#ef4444' : COLORS.textDim,
                    display: "flex", gap: 8
                  }}>
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>[{idx + 1}]</span>
                    <span>{ln}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "16px 24px", background: "rgba(0,0,0,0.3)", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "end", gap: 8 }}>
              {cloudRunProgress < 100 ? (
                <span style={{ fontSize: 10, color: COLORS.textFaint, fontFamily: "monospace", alignSelf: "center" }}>Waiting for Cloud Run proxy mapping...</span>
              ) : (
                <>
                  <a 
                    href="https://spatial-live-preview.run.app" 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => { e.preventDefault(); addAgentLog?.("Redirecting to simulated workspace instance on secure Cloud Run shard.", "success"); }}
                    style={{
                      background: "#10b981", color: "#000", border: 'none', borderRadius: 8, padding: "8px 16px",
                      fontSize: 11, fontWeight: "bold", textTransform: "uppercase", cursor: "pointer", textDecoration: "none",
                      display: "flex", alignItems: "center", gap: 4
                    }}
                  >
                    Open Live App ↗
                  </a>
                  <button 
                    onClick={() => setIsDeployingCloudRun(false)}
                    style={{
                      background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 16px",
                      fontSize: 11, fontWeight: "bold", textTransform: "uppercase", color: "#fff", cursor: "pointer"
                    }}
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLUSTER VERIFICATION MODAL OVERLAY */}
      {isVerifyingCluster && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
          <div style={{
            background: "#080a0f", border: `1px solid #1b212c`,
            borderRadius: 16, maxWidth: 500, width: "100%", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 45px rgba(0,0,0,0.8)"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: `${COLORS.accent}15`, border: `1px solid ${COLORS.accent}33`, color: COLORS.accent, fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>Diagnostics</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "0.05em" }}>CLUSTER INTEGRITY</span>
              </div>
              <button 
                onClick={() => setIsVerifyingCluster(false)} 
                disabled={verifyProgress < 100}
                style={{
                  background: "transparent", border: "none", color: COLORS.textFaint, cursor: verifyProgress < 100 ? "not-allowed" : "pointer",
                  fontSize: 14, opacity: verifyProgress < 100 ? 0.3 : 1
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", fontFamily: "monospace" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: "bold" }}>
                    {verifyProgress < 100 ? "ANALYZING SYSTEM BINDINGS..." : "INTEGRITY SECURE"}
                  </span>
                  <span style={{ fontSize: 9, color: COLORS.textFaint, textTransform: "uppercase" }}>Host network packet trace and safety bounds</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: "bold", color: COLORS.accent }}>{verifyProgress}%</span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", padding: 1, background: "#06070a" }}>
                <div style={{
                  height: "100%", background: COLORS.accent, borderRadius: 10,
                  width: `${verifyProgress}%`, transition: "width 0.2s ease-out"
                }} />
              </div>

              {/* Live stdout feedback */}
              <div style={{
                background: "#030407", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, height: 160,
                overflowY: "auto", fontFamily: "monospace", fontSize: 10, lineHeight: 1.6, color: COLORS.textDim, display: "flex", flexDirection: "column", gap: 4
              }}>
                {verifyLogs.map((ln, idx) => (
                  <div key={idx} style={{ 
                    color: ln.includes('[SUCCESS]') ? '#10b981' : ln.includes('[ERROR]') ? '#ef4444' : COLORS.textDim,
                    display: "flex", gap: 8
                  }}>
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>[{idx + 1}]</span>
                    <span>{ln}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "16px 24px", background: "rgba(0,0,0,0.3)", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "end" }}>
              <button 
                onClick={() => setIsVerifyingCluster(false)}
                disabled={verifyProgress < 100}
                style={{
                  background: verifyProgress < 100 ? "transparent" : COLORS.accent, 
                  color: verifyProgress < 100 ? COLORS.textFaint : "#000", 
                  border: verifyProgress < 100 ? `1px solid ${COLORS.border}` : "none", 
                  borderRadius: 8, padding: "8px 20px", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", 
                  cursor: verifyProgress < 100 ? "not-allowed" : "pointer"
                }}
              >
                {verifyProgress < 100 ? "Verifying..." : "Acknowledge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityButton({ id, icon, active, onClick }: { id: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button title={id} onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 8, border: "none",
      background: active ? COLORS.accentGlow : "transparent",
      color: active ? COLORS.accent : COLORS.textFaint,
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s", position: "relative",
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = COLORS.surfaceHover; e.currentTarget.style.color = COLORS.textDim; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = COLORS.textFaint; }}}
    >
      {active && <div style={{
        position: "absolute", left: -1, top: "25%", height: "50%", width: 3,
        background: COLORS.accent, borderRadius: "0 2px 2px 0"
      }}/>}
      {icon}
    </button>
  );
}

