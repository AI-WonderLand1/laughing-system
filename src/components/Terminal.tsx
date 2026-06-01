import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Terminal as TerminalIcon, 
  ChevronRight, 
  X, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Terminal() {
  const { terminalLogs, sendTerminalCommand } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendTerminalCommand(input);
    setInput("");
  };

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setIsOpen(true);

    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (mmE: MouseEvent) => {
      const dy = mmE.clientY - startY;
      const newHeight = Math.max(100, Math.min(window.innerHeight - 120, startHeight - dy));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className={cn(
        "w-full bg-ui-panel border-t border-ui-border flex flex-col shrink-0 relative",
        isResizing ? "select-none" : "transition-all duration-300"
      )}
      style={{
        height: isOpen ? `${height}px` : "2.5rem"
      }}
    >
      {/* Top resize handle */}
      {isOpen && (
        <div 
          className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize z-50 hover:bg-ui-accent/35 active:bg-ui-accent/70 transition-colors"
          onMouseDown={handleStartResize}
          title="Drag up/down to resize process console"
        />
      )}

      {/* Navbar / Toggle */}
      <div 
        className="h-10 flex items-center justify-between px-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
           <TerminalIcon className="w-4 h-4 text-ui-accent" />
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-ui-text uppercase tracking-widest">Process_Console</span>
              <div className="flex gap-1">
                 <div className="w-1 h-3 bg-emerald-500/40 rounded-full" />
                 <div className="w-1 h-3 bg-emerald-500/40 rounded-full" />
                 <div className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-2 py-0.5 bg-ui-bg rounded border border-ui-border text-[8px] font-bold text-ui-text-muted uppercase">
             <Zap className="w-3 h-3 text-ui-accent" />
             Worker_Active
           </div>
           <button className="p-1 hover:bg-white/10 rounded transition-all">
             {isOpen ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 -rotate-90" />}
           </button>
        </div>
      </div>

      {/* Console Area */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0 bg-black/40 backdrop-blur-3xl font-mono p-4 text-[12px] leading-relaxed overflow-hidden">
           <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pb-2 select-text">
              {terminalLogs.map((log, i) => (
                <div key={i} className="flex gap-3 text-ui-text/70 animate-in slide-in-from-bottom-1 duration-200">
                   <span className="text-ui-accent opacity-50 shrink-0 select-none">[{i.toString().padStart(3, '0')}]</span>
                   <span className={cn(log.startsWith('>') ? "text-ui-accent font-bold" : "text-white/80")}>
                      {log}
                   </span>
                </div>
              ))}
              <div ref={endRef} />
           </div>
           
           <form onSubmit={handleSubmit} className="mt-2 relative">
              <ChevronRight className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-accent" />
              <input 
                 autoFocus
                 className="w-full bg-transparent border-none outline-none pl-6 text-ui-accent font-bold placeholder:text-ui-accent/20"
                 placeholder="INITIALIZE_SEQUENCER..."
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
              />
           </form>
        </div>
      )}
    </div>
  );
}
