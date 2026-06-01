import React, { useState } from 'react';
import { 
  Box, 
  Workflow, 
  Settings, 
  CloudUpload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  RefreshCw
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';

export default function GltfPipeline() {
  const { pipelineItems, addAgentLog, addPipelineItem } = useWorkspace();
  const [importUrlOpen, setImportUrlOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');

  const queueStatus = pipelineItems.some(i => i.status === 'raw') ? "Processing" : "Idle";
  const processedCount = pipelineItems.filter(i => i.status === 'processed').length;

  const simulateUpload = () => {
    const names = ["Hero_Avatar.glb", "SciFi_Environment.glb", "Cyber_Katana.gltf", "Neon_Storefront.glb"];
    const name = names[Math.floor(Math.random() * names.length)];
    addPipelineItem({ name, type: 'gltf' });
    addAgentLog(`Injecting ${name} into optimization pipeline...`, 'info');
  };

  return (
    <div className="flex-1 flex flex-col bg-ui-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-ui-accent/5 to-transparent skew-x-[-12deg] translate-x-1/2 pointer-events-none" />

      <header className="p-8 border-b border-ui-border bg-ui-panel/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-ui-panel rounded-2xl border border-ui-border shadow-xl">
              <Workflow className="w-8 h-8 text-ui-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Asset Optimization Pipeline</h1>
              <p className="text-sm text-ui-text-muted flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Automatic Draco/Meshopt compression active
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button 
              onClick={() => {
                setImportUrl('');
                setImportUrlOpen(true);
              }}
              className="p-1 px-2 border border-[#1b1f26] hover:bg-[#12161c] rounded text-[9px] font-bold text-ui-text-muted flex items-center gap-1 transition-all"
            >
              <Globe className="w-3 h-3" />
              EXTERNAL
            </button>
            <button 
              onClick={simulateUpload}
              className="p-1 px-2 bg-ui-accent hover:opacity-90 rounded text-[9px] font-bold text-white flex items-center gap-1 transition-all shadow-lg"
            >
              <CloudUpload className="w-4 h-4" />
              IMPORT ASSET
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <PipelineStat label="Total Processed" value={processedCount > 0 ? `${(processedCount * 420.5).toFixed(1)} MB` : '0.0 MB'} icon={<Box className="w-4 h-4 text-ui-accent" />} />
            <PipelineStat label="Avg Compression" value={processedCount > 0 ? "78.4%" : "0%"} icon={<Zap className="w-4 h-4 text-emerald-400" />} />
            <PipelineStat label="Queue Status" value={queueStatus} icon={<Settings className="w-4 h-4 text-purple-400" />} />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-ui-text-muted uppercase tracking-[0.3em]">Processing Queue</label>
            <div className="bg-ui-panel border border-ui-border rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-ui-bg text-[9px] uppercase font-bold text-ui-text-muted/60 border-b border-ui-border">
                  <tr>
                    <th className="px-6 py-4">Asset_Identifier</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Stage</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border/50">
                  {pipelineItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-ui-text-muted/40 italic text-sm">
                        No assets in pipeline. Import GLB to begin.
                      </td>
                    </tr>
                  ) : pipelineItems.map((item) => (
                    <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-ui-bg rounded-lg border border-ui-border group-hover:border-ui-accent/30 transition-all">
                             <Box className="w-4 h-4 text-ui-text-muted" />
                          </div>
                          <span className="text-[11px] font-bold text-ui-text">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] px-2 py-0.5 bg-ui-bg border border-ui-border rounded-full text-ui-text-muted uppercase font-bold">{item.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-16 bg-ui-bg rounded-full overflow-hidden border border-ui-border">
                              <div className={cn(
                                "h-full bg-ui-accent transition-all duration-1000",
                                item.status === 'processed' ? "w-full" : "w-1/3 animate-pulse"
                              )} />
                           </div>
                           <span className="text-[9px] text-ui-text-muted font-bold italic">
                              {item.status === 'processed' ? "COMPLETED" : "QUANTIZING..."}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'processed' ? (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[9px] font-bold">READY</span>
                          </div>
                        ) : item.status === 'error' ? (
                          <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[9px] font-bold">FAILED</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-ui-accent">
                            <RefreshCw className="w-4 h-4 animate-spin-slow" />
                            <span className="text-[9px] font-bold">ACTIVE</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className={cn(
                          "p-2 hover:bg-ui-accent hover:text-white rounded-lg transition-all",
                          item.status !== 'processed' && "opacity-0 pointer-events-none"
                        )}>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* GLTF Custom URL Overlay Modal */}
      {importUrlOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d12] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Import GLTF / GLB Asset</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-mono mb-4">Provide valid absolute model URL</p>

            <div className="space-y-4">
              <input 
                type="text"
                placeholder="https://assets.gltf/model.glb"
                className="w-full bg-[#111318] border border-white/5 rounded-xl p-2.5 text-xs text-zinc-200 outline-none focus:border-ui-accent"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (importUrl.trim()) {
                      const urlVal = importUrl.trim();
                      addPipelineItem({
                        name: urlVal.split('/').pop() || 'external_model.glb',
                        type: 'gltf'
                      });
                      addAgentLog(`Importing external asset from: ${urlVal}`, 'info');
                    }
                    setImportUrlOpen(false);
                  }
                }}
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                type="button"
                onClick={() => setImportUrlOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (importUrl.trim()) {
                    const urlVal = importUrl.trim();
                    addPipelineItem({
                      name: urlVal.split('/').pop() || 'external_model.glb',
                      type: 'gltf'
                    });
                    addAgentLog(`Importing external asset from: ${urlVal}`, 'info');
                  }
                  setImportUrlOpen(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-colors"
              >
                Fetch GLTF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PipelineStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-ui-panel border border-ui-border rounded-2xl p-6 shadow-xl flex items-center gap-5 group hover:border-ui-accent/30 transition-all">
       <div className="p-3 bg-ui-bg rounded-xl border border-ui-border shadow-inner group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <div className="flex flex-col">
          <span className="text-[10px] font-bold text-ui-text-muted uppercase tracking-widest">{label}</span>
          <span className="text-[18px] font-bold text-ui-text font-mono truncate tracking-tighter">{value}</span>
       </div>
    </div>
  );
}
