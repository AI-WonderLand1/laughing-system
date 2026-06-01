import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles,
  Command,
  Layout,
  Cpu,
  Layers,
  Palette
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';

interface AIArchitectProps {
  onClose: () => void;
}

export default function AIArchitect({ onClose }: { onClose: () => void }) {
  const [promptValue, setPromptValue] = useState("");
  const { setEntities, addAgentLog, entities } = useWorkspace();

  const handleGenerate = async () => {
    if (!promptValue.trim()) return;
    
    addAgentLog(`AI Architect processing: "${promptValue}"`, 'thinking');
    
    try {
      const response = await fetch('/api/architect/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptValue, currentEntities: entities })
      });
      
      if (!response.ok) throw new Error('API_REJECTION: ARCHITECT_CONTEXT_ERROR');
      
      const generatedEntities = await response.json();
      
      // Transform coordinates for spatial view if needed (assuming engine coordinates are different)
      const transformedEntities = generatedEntities.map((ent: any) => ({
        ...ent,
        id: ent.id || `gen-${Math.random().toString(36).substr(2, 5)}`
      }));
        
      setEntities([...entities, ...transformedEntities]);
      addAgentLog(`AI successfully synthesized ${transformedEntities.length} new components`, 'success');
      onClose();
    } catch (error) {
      console.error('Generation Error:', error);
      addAgentLog(`Architectural synthesis failed: ${error}`, 'error');
    }
  };

  const applyQuickOption = (text: string) => {
    setPromptValue(text);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-ui-bg/40 animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-2xl bg-ui-panel border border-ui-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ui-border flex items-center justify-between bg-gradient-to-r from-ui-accent/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ui-accent/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-ui-accent" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-ui-text uppercase tracking-widest">Spatial Architect</h2>
              <p className="text-[10px] text-ui-text-muted uppercase">Procedural World Generation Proxy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full text-ui-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Area */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-ui-text-muted uppercase px-1">Describe the construction...</label>
            <textarea 
              autoFocus
              className="w-full h-32 bg-ui-bg border border-ui-border rounded-xl p-4 text-[13px] text-ui-text outline-none focus:border-ui-accent transition-all resize-none font-medium leading-relaxed"
              placeholder="e.g. 'Build a symmetrical brutalist platform with four floating neon pillars and a central light core...'"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleGenerate();
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <QuickOption icon={<Layout className="w-4 h-4" />} title="Brutalist Base" desc="Heavy stone slabs" onClick={() => applyQuickOption("Build a symmetrical brutalist platform with heavy stone slab styling")} />
            <QuickOption icon={<Cpu className="w-4 h-4" />} title="Logic Node" desc="Functional triggers" onClick={() => applyQuickOption("Generate a central logic node floating mid-air with surrounding trigger zones")} />
            <QuickOption icon={<Layers className="w-4 h-4" />} title="Voxel Grid" desc="Subdivided workspace" onClick={() => applyQuickOption("Construct a 4x4 voxel terrain grid optimized for pathfinding")} />
            <QuickOption icon={<Palette className="w-4 h-4" />} title="Material Set" desc="Cyberpunk aesthetics" onClick={() => applyQuickOption("Apply cyberpunk neon materials to all current standing structures")} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-ui-bg/30 border-t border-ui-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-ui-text-muted">
            <Command className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase opacity-50">CTRL + ENTER TO_EXEC</span>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={!promptValue.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-ui-accent text-white rounded-lg text-[12px] font-bold shadow-lg shadow-ui-accent/20 enabled:hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
          >
            GENERATE_LEVEL
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickOption({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 p-3 bg-white/5 border border-ui-border rounded-xl hover:border-ui-accent/40 hover:bg-ui-accent/5 transition-all text-left">
      <div className="p-2 bg-ui-bg rounded-lg text-ui-text-muted">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold text-ui-text uppercase">{title}</div>
        <div className="text-[8px] text-ui-text-muted uppercase tracking-tight">{desc}</div>
      </div>
    </button>
  );
}
