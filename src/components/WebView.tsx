import React from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Globe, 
  ExternalLink, 
  RotateCcw, 
  Shield, 
  Share2,
  Lock,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function WebView() {
  const { targetUrl, setTargetUrl } = useWorkspace();

  return (
    <div className="flex-1 flex flex-col bg-ui-bg animate-in fade-in duration-500">
      <div className="h-12 border-b border-ui-border flex items-center px-4 gap-4 bg-ui-panel/40 backdrop-blur-md">
        <div className="flex items-center gap-2 pr-4 border-r border-ui-border">
          <Globe className="w-4 h-4 text-ui-accent" />
          <span className="text-[10px] font-bold text-ui-text uppercase tracking-widest">LIVE_PREVIEW</span>
        </div>
        
        <div className="flex-1 flex items-center gap-2 bg-ui-bg border border-ui-border rounded-lg px-3 py-1.5 focus-within:border-ui-accent transition-all">
          <Lock className="w-3 h-3 text-emerald-400 opacity-50" />
          <input 
            className="flex-1 bg-transparent border-none outline-none text-[11px] text-ui-text/80 font-medium"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
          />
          <button title="Refresh" className="p-1 hover:bg-white/5 rounded"><RotateCcw className="w-3 h-3 text-ui-text-muted" /></button>
        </div>

        <div className="flex items-center gap-2">
           <button className="p-2 hover:bg-white/5 rounded text-ui-text-muted transition-colors"><Share2 className="w-4 h-4" /></button>
           <button className="p-2 hover:bg-white/5 rounded text-ui-text-muted transition-colors"><ExternalLink className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 relative bg-white">
        <iframe 
          src={targetUrl} 
          className="w-full h-full border-none shadow-2xl"
          title="Preview Area"
        />
        
        {/* Placeholder for when no URL matches or just for aesthetic */}
        <div className="absolute inset-0 pointer-events-none border-[12px] border-ui-bg/5" />
      </div>
    </div>
  );
}
