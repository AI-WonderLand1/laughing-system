import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Zap, 
  Loader2, 
  Command,
  MessageSquare,
  History,
  Settings,
  ChevronRight,
  BrainCircuit,
  Terminal,
  FileCode,
  Layout,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AIAssistant() {
  const { addAgentLog, pods, scenes, viewMode, rebootPod, config } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello. I am the Spatial Copilot. I can help you orchestrate pods, generate scene components, or refactor your scripts. What is our objective today?",
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    addAgentLog(`Routing request to AI compilation context...`, 'thinking');

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10), // Send last 10 messages for context
          context: { pods, scenes, viewMode }
        })
      });

      if (!response.ok) throw new Error('ASSISTANT_REJECTION: CONTEXT_OVERFLOW');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      addAgentLog(`Intelligence response received`, 'success');

      // Check for implicit actions (basic heuristic for now)
      if (userMessage.content.toLowerCase().includes('reboot all') || userMessage.content.toLowerCase().includes('restart all pods')) {
        pods.forEach(p => rebootPod(p.id));
      }

    } catch (error) {
      console.error('Assistant Error:', error);
      addAgentLog(`Assistant communication failure`, 'error');
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: "I apologize, but I encountered a parity error in the neural link. Please verify your connection or API configuration.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "Neural link established. History cleared. I am ready for new directives.",
      timestamp: Date.now()
    }]);
    addAgentLog('Assistant history cleared', 'info');
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0b0e] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 rounded-xl relative">
            <BrainCircuit className="w-5 h-5 text-blue-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-4 border-[#0a0b0e]" />
          </div>
          <div>
            <h2 className="text-[14px] font-extrabold text-white uppercase tracking-[0.2em] leading-tight">Spatial_Copilot</h2>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Kernel: {config.aiProvider === 'gemini-pro' ? 'Gemini 1.5 Pro' : config.aiProvider === 'opencode-ai' ? 'OpenCode AI (Pro)' : 'Spatial-AI-v9'} • State: Optimal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
            onClick={clearHistory}
            className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
            title="Clear Neural History"
          >
              <Trash2 className="w-4 h-4" />
           </button>
           <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors">
              <Settings className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={cn(
              "flex gap-4 max-w-3xl",
              m.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
              m.role === 'assistant' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-zinc-800 text-zinc-400 border border-white/5"
            )}>
              {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            
            <div className={cn(
              "space-y-1 flex-1 min-w-0",
              m.role === 'user' ? "text-right" : ""
            )}>
              <div className={cn("flex items-center gap-2 mb-1", m.role === 'user' ? "justify-end" : "")}>
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{m.role}</span>
                 <span className="text-[8px] text-zinc-700 font-mono italic">{new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-[13px] leading-relaxed markdown-body",
                m.role === 'assistant' 
                  ? "bg-[#111318] border border-white/5 text-zinc-200 shadow-xl" 
                  : "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
              )}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Bot size={16} className="text-blue-400" />
            </div>
            <div className="flex items-center gap-1 px-4 py-2 bg-[#111318] border border-white/5 rounded-2xl">
              <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 pt-2 border-t border-white/5 bg-[#0a0b0e]/80 backdrop-blur-sm">
        
        {/* Quick Commands */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
           <QuickTab icon={<Layout size={10} />} label="RECONSTRUCT_SCENE" onClick={() => setInputValue("Reconstruct the current scene with higher fidelity mesh components")} />
           <QuickTab icon={<Zap size={10} />} label="REBOOT_ALL_PODS" onClick={() => setInputValue("Analyze system health and reboot all pods in the spatial namespace")} />
           <QuickTab icon={<Terminal size={10} />} label="LIST_FILES" onClick={() => setInputValue("List all source files and analyze project structure")} />
           <QuickTab icon={<Sparkles size={10} />} label="OPTIMIZE_ENGINE" onClick={() => setInputValue("Suggest engine optimizations for the current scene complexity")} />
        </div>

        <div className="relative flex items-center">
          <div className="absolute left-4 text-blue-500 opacity-50">
            <Command size={16} />
          </div>
          <input 
            className="w-full bg-[#111318] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-zinc-200 outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700 shadow-2xl"
            placeholder="Type a directive or ask for intelligence..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-3 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center min-w-[40px]"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="mt-3 text-center text-[8px] text-zinc-700 font-bold uppercase tracking-widest">
          Press ENTER to dispatch directive. Assistant can manipulate workspace state directly.
        </p>
      </div>
    </div>
  );
}

function QuickTab({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-tight hover:bg-white/10 hover:text-zinc-300 transition-all whitespace-nowrap"
    >
      {icon}
      {label}
    </button>
  );
}
