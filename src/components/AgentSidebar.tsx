import React from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Sparkles, 
  ChevronRight, 
  Clock, 
  Send,
  Zap,
  Info,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AgentSidebar() {
  const { agentLogs } = useWorkspace();

  return (
    <div className="h-full w-full bg-ui-panel/40 flex flex-col relative">
      <div className="p-4 border-b border-ui-border flex items-center justify-between bg-ui-panel/60">
        <div className="flex items-center gap-2">
           <BrainCircuit className="w-4 h-4 text-ui-accent" />
           <label className="text-[10px] font-bold text-ui-text uppercase tracking-[0.2em]">Compiler_Action_Logs</label>
        </div>
        <button className="p-1 hover:bg-white/5 rounded text-ui-text-muted">
           <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
         {agentLogs.map((log) => (
           <div key={log.id} className="animate-in slide-in-from-right duration-300">
              <div className="flex items-start gap-4">
                 <div className="mt-1">
                    <LogIcon type={log.type} />
                 </div>
                 <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                       <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest",
                          log.type === 'success' ? "text-emerald-400" :
                          log.type === 'error' ? "text-red-400" :
                          log.type === 'warning' ? "text-orange-400" :
                          "text-ui-accent"
                       )}>
                          {log.type}
                       </span>
                       <span className="text-[8px] text-ui-text-muted/40 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                       </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-ui-text/80 font-medium bg-ui-bg/30 p-2 rounded-lg border border-white/5 select-text">
                       {log.message}
                    </p>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="p-4 border-t border-ui-border bg-ui-panel/60">
         <div className="relative group">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-accent opacity-50 group-focus-within:opacity-100 transition-opacity" />
            <input 
              placeholder="EXECUTE COMPILER ACTION..."
              className="w-full bg-ui-bg border border-ui-outline rounded-xl py-2.5 pl-10 pr-10 text-[11px] text-ui-text outline-none focus:border-ui-accent transition-all uppercase font-bold tracking-wider placeholder:opacity-30"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-ui-accent rounded-lg text-white shadow-lg shadow-ui-accent/20 hover:scale-105 active:scale-95 transition-all">
               <Send className="w-3.5 h-3.5" />
            </button>
         </div>
         <p className="mt-3 text-center text-[8px] text-ui-text-muted/40 uppercase font-bold tracking-tighter">
            Spatial Engine Orchestrator v9
         </p>
      </div>
    </div>
  );
}

function LogIcon({ type }: { type: string }) {
  switch (type) {
    case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
    case 'warning': return <AlertCircle className="w-4 h-4 text-orange-400" />;
    case 'thinking': return <Sparkles className="w-4 h-4 text-ui-accent animate-pulse" />;
    default: return <Info className="w-4 h-4 text-ui-accent" />;
  }
}
