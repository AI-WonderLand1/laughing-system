import React from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Settings, Shield, Cpu, Database, Link as LinkIcon, Palette, Zap, Globe, Key, Eye, EyeOff, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProjectSettings() {
  const { config, updateConfig, entities, prefabs, addAgentLog } = useWorkspace();

  return (
    <div className="flex-1 overflow-y-auto w-full h-full relative">
      <div className="flex flex-col bg-ui-bg p-8 max-w-3xl mx-auto w-full space-y-12 py-16">
        <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-ui-panel rounded-2xl border border-ui-border shadow-xl">
            <Settings className="w-8 h-8 text-ui-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Project Architectura</h1>
            <p className="text-ui-text-muted text-sm italic">Global workspace and security configuration.</p>
          </div>
        </div>
      </div>

      {/* BYOK Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-ui-text-muted uppercase flex items-center gap-2">
          <BrainCircuit className="w-3 h-3 text-ui-accent" />
          Intelligence Provider
        </label>
        <div className="bg-ui-panel/40 border border-ui-border rounded-xl p-3">
          <select 
            className="w-full bg-ui-bg border border-ui-border rounded-lg p-2 text-[11px] text-ui-text outline-none focus:border-ui-accent appearance-none"
            value={config.aiProvider || 'spatial-v9'}
            onChange={(e) => updateConfig({ aiProvider: e.target.value as any })}
          >
            <option value="spatial-v9">Spatial Kernel v9 (Default)</option>
            <option value="gemini-pro">Gemini 1.5 Pro</option>
            <option value="opencode-ai">OpenCode AI (Pro)</option>
          </select>
        </div>

        <label className="text-[10px] font-bold text-ui-text-muted uppercase flex items-center gap-2 mt-4">
          <Key className="w-3 h-3 text-ui-accent" />
          BYOK (Bring Your Own Key)
        </label>
        <div className="space-y-3 bg-ui-panel/40 border border-ui-border rounded-xl p-3">
          <KeyInput 
            label="OpenAI API Key" 
            placeholder="sk-..." 
            value={config.keys?.openai || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, openai: val } })}
          />
          <KeyInput 
            label="Gemini API Key" 
            placeholder="AIza..." 
            value={config.keys?.gemini || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, gemini: val } })}
          />
          <KeyInput 
            label="Anthropic Key" 
            placeholder="sk-ant-..." 
            value={config.keys?.anthropic || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, anthropic: val } })}
          />
          <KeyInput 
            label="Perplexity Key" 
            placeholder="pplx-..." 
            value={config.keys?.perplexity || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, perplexity: val } })}
          />
          <KeyInput 
            label="Groq API Key" 
            placeholder="gsk_..." 
            value={config.keys?.groq || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, groq: val } })}
          />
          <KeyInput 
            label="OpenCode AI Key" 
            placeholder="ocode-..." 
            value={config.keys?.opencode || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, opencode: val } })}
          />
          <p className="text-[8px] text-ui-text-muted/60 italic leading-tight">
            Keys are stored locally in the workspace session. They will be used to prioritize your own quotas.
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <SectionHeader title="Visual & Identity" icon={<Palette className="w-4 h-4" />} />
        <div className="space-y-4">
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-ui-text-muted uppercase px-1">Theme Palette</label>
              <div className="grid grid-cols-4 gap-3">
                 <ThemeCard id="minimal" label="Minimal" active={config.theme === 'minimal'} onClick={() => updateConfig({ theme: 'minimal' })} color="#fafafa" />
                 <ThemeCard id="brutalist" label="Brutalist" active={config.theme === 'brutalist'} onClick={() => updateConfig({ theme: 'brutalist' })} color="#ffde00" />
                 <ThemeCard id="cyber" label="Cyberpunk" active={config.theme === 'cyber'} onClick={() => updateConfig({ theme: 'cyber' })} color="#06b6d4" />
                 <ThemeCard id="soft" label="Soft UI" active={config.theme === 'soft'} onClick={() => updateConfig({ theme: 'soft' })} color="#fbcfe8" />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-ui-text-muted uppercase px-1">Skybox Environment</label>
              <select 
                className="w-full bg-ui-bg border border-ui-border rounded-xl p-3 text-[12px] text-ui-text outline-none focus:border-ui-accent appearance-none capitalize shadow-inner cursor-pointer"
                value={config.skybox}
                onChange={(e) => updateConfig({ skybox: e.target.value as any })}
              >
                {["city", "night", "apartment", "forest", "dawn", "sunset", "warehouse"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
           </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 pb-20">
        <SectionHeader title="Infrastructure" icon={<Database className="w-4 h-4" />} />
        <div className="bg-ui-panel border border-ui-border rounded-2xl p-6 space-y-4 shadow-xl">
           <div className="flex items-center justify-between">
              <div>
                 <div className="text-[11px] font-bold text-ui-text">Cloud Sync Engine</div>
                 <div className="text-[9px] text-ui-text-muted italic">Synchronize world state across distributed clients</div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                 <Shield className="w-3 h-3 text-emerald-400" />
                 <span className="text-[8px] font-bold text-emerald-400 uppercase">ENCRYPTED_SSL</span>
              </div>
           </div>
           <div className="h-[1px] bg-ui-border" />
           <div className="flex items-center justify-between">
              <div>
                 <div className="text-[11px] font-bold text-ui-text">Automatic Optimization</div>
                 <div className="text-[9px] text-ui-text-muted italic">Mesh decimation and texture atlas generation</div>
              </div>
              <button 
                onClick={() => updateConfig({ pipeline: { ...config.pipeline, autoOptimize: !config.pipeline.autoOptimize } })}
                className={cn(
                  "w-12 h-6 rounded-full p-1 transition-all",
                  config.pipeline.autoOptimize ? "bg-ui-accent" : "bg-ui-bg border border-ui-border"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full bg-white transition-all transform",
                  config.pipeline.autoOptimize ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
           </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 pb-20">
        <SectionHeader title="Deployment & Integration" icon={<Globe className="w-4 h-4" />} />
        <div className="bg-ui-panel border border-ui-border rounded-2xl p-6 space-y-4 shadow-xl">
           <div className="flex items-start justify-between gap-4">
              <div>
                 <div className="text-[11px] font-bold text-ui-text">Export to Web (Standalone)</div>
                 <div className="text-[9px] text-ui-text-muted italic mt-1 leading-relaxed">
                   Compile your 3D workspace, entities, and UI elements into a standalone React application 
                   that you can host anywhere (Vercel, AWS, CMS). Supports iframe embedding into existing sites.
                 </div>
              </div>
              <button 
                onClick={() => {
                  const data = JSON.stringify({ config, entities, prefabs }, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'spatial-workspace-export.json';
                  a.click();
                  URL.revokeObjectURL(url);
                  addAgentLog?.('Exported workspace bundle successfully.', 'success');
                }}
                className="px-4 py-2 bg-ui-accent shrink-0 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-ui-accent/20 hover:scale-105 transition-all"
              >
                 EXPORT BUNDLE
              </button>
           </div>
           
           <div className="h-[1px] bg-ui-border my-2" />

           <div className="flex items-start justify-between gap-4">
              <div>
                 <div className="text-[11px] font-bold text-ui-text">NPM Package Build</div>
                 <div className="text-[9px] text-ui-text-muted italic mt-1 leading-relaxed">
                   Publish your spatial scene as an installable NPM component (`npm install @project/3d-scene`). 
                   Load it dynamically in arbitrary React apps.
                 </div>
              </div>
              <button 
                onClick={() => {
                  const pkg = {
                     name: "@project/3d-scene",
                     version: "1.0.0",
                     main: "index.js",
                     workspaceConfig: config,
                     sceneData: { entities, prefabs }
                  };
                  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'package.json';
                  a.click();
                  URL.revokeObjectURL(url);
                  addAgentLog?.('Generated NPM package configuration.', 'success');
                }}
                className="px-4 py-2 bg-white/5 border border-ui-border shrink-0 text-ui-text rounded-lg text-[10px] font-bold hover:bg-white/10 transition-all"
              >
                 PUBLISH PACKAGE
              </button>
           </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 pb-32">
        <SectionHeader title="Danger Zone" icon={<Shield className="w-4 h-4 text-ui-red" />} />
        <div className="bg-ui-red/5 border border-ui-red/20 rounded-2xl p-6 space-y-4">
           <div className="flex items-start justify-between gap-4">
              <div>
                 <div className="text-[11px] font-bold text-ui-red">Reset Workspace</div>
                 <div className="text-[9px] text-ui-text-muted italic mt-1 leading-relaxed">
                   Permanently wipe all locally stored entities, scenes, and configurations. This will return you to the initial setup gate.
                 </div>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to PERMANENTLY WIPE your local spatial workspace? This cannot be undone.")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-ui-red text-white shrink-0 rounded-lg text-[10px] font-bold shadow-lg shadow-ui-red/20 hover:scale-105 transition-all"
              >
                 RESET WORKSPACE
              </button>
           </div>
        </div>
      </div>
     </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-ui-panel rounded border border-ui-border text-ui-accent">
        {icon}
      </div>
      <h3 className="text-[11px] font-bold text-ui-text uppercase tracking-[0.2em]">{title}</h3>
      <div className="h-[1px] flex-1 bg-ui-border ml-2" />
    </div>
  );
}

function ThemeCard({ id, label, active, onClick, color }: { id: string; label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
        active ? "bg-ui-accent/10 border-ui-accent shadow-lg shadow-ui-accent/5 scale-105" : "bg-ui-panel border-ui-border hover:border-ui-accent/30"
      )}
    >
      <div className="w-full aspect-square rounded-xl shadow-inner border border-white/5" style={{ background: color }} />
      <span className={cn("text-[9px] font-bold uppercase tracking-tight", active ? "text-ui-accent" : "text-ui-text-muted")}>{label}</span>
    </button>
  );
}

function KeyInput({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = React.useState(false);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1">
        <label className="text-[8px] text-ui-text-muted uppercase font-bold">{label}</label>
      </div>
      <div className="relative group">
        <input 
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full bg-ui-bg border border-ui-border rounded-lg p-1.5 px-3 text-[10px] text-ui-text outline-none focus:border-ui-accent transition-all pr-8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button 
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-ui-text-muted hover:text-ui-accent transition-colors p-1"
        >
          {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
