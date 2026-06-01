import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { GitBranch, GitCommit, GitMerge, GitPullRequest, RotateCcw, Plus, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const BRANCHES = [
  { name: 'main',          current: true,  ahead: 0, behind: 0 },
  { name: 'feat/spatial-canvas', current: false, ahead: 4, behind: 1 },
  { name: 'fix/dre-mesh',  current: false, ahead: 2, behind: 0 },
  { name: 'chore/deps',    current: false, ahead: 0, behind: 7 }
];

const COMMITS = [
  { sha: 'a3f1c9d', branch: 'feat/spatial-canvas', author: 'you',     message: 'Wire up SpatialCanvas GPU instancing',     time: '2m ago',  additions: 184, deletions: 22 },
  { sha: '8e22b10', branch: 'feat/spatial-canvas', author: 'opencode', message: 'Add wasm vertex shader for godot target',  time: '14m ago', additions: 92,  deletions: 4 },
  { sha: 'f02d771', branch: 'main',                  author: 'aether-bot', message: 'chore: bump @react-three/fiber to 8.16.6', time: '1h ago', additions: 1,   deletions: 1 },
  { sha: '61abc04', branch: 'main',                  author: 'you',     message: 'Initial commit of spatial workspace',      time: '4h ago',  additions: 12048, deletions: 0 }
];

export default function GitView() {
  const { addAgentLog } = useWorkspace();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex-1 flex h-full bg-[var(--ui-bg)] text-[var(--ui-text)] overflow-hidden">
      <aside className="w-72 border-r border-[var(--ui-border)] flex flex-col bg-[var(--ui-panel)]">
        <div className="p-3 border-b border-[var(--ui-border)] flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-[var(--ui-accent)]" />
          <div className="flex-1">
            <div className="text-sm font-semibold">spatial-workspace</div>
            <div className="text-[10px] text-[var(--ui-text-muted)]">main · 4 branches</div>
          </div>
          <button onClick={() => addAgentLog('Pulling latest from origin…', 'info')} className="p-1.5 rounded hover:bg-white/5">
            <RotateCcw className="w-3 h-3 text-[var(--ui-text-muted)]" />
          </button>
        </div>
        <div className="p-2">
          <div className="text-[9px] uppercase tracking-wider text-[var(--ui-text-muted)] px-2 py-1">Branches</div>
          {BRANCHES.map(b => (
            <button
              key={b.name}
              onClick={() => { setSelected(b.name); addAgentLog(`Checked out ${b.name}`, 'info'); }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs",
                b.current ? "bg-[var(--ui-accent)]/10 text-[var(--ui-accent)]" : "hover:bg-white/5"
              )}
            >
              <GitBranch className="w-3 h-3" />
              <span className="flex-1 text-left">{b.name}</span>
              {b.ahead > 0 && <span className="text-[9px] text-emerald-400">↑{b.ahead}</span>}
              {b.behind > 0 && <span className="text-[9px] text-rose-400">↓{b.behind}</span>}
            </button>
          ))}
        </div>
        <div className="mt-auto p-3 border-t border-[var(--ui-border)] space-y-2">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs border border-dashed border-[var(--ui-border)] hover:border-[var(--ui-accent)]/50 text-[var(--ui-text-muted)]">
            <Plus className="w-3 h-3" /> New branch
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs bg-[var(--ui-accent)]/10 text-[var(--ui-accent)] hover:bg-[var(--ui-accent)]/20">
            <GitPullRequest className="w-3 h-3" /> Open pull request
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-[var(--ui-border)] flex items-center px-4 gap-3 bg-[var(--ui-panel)]">
          <span className="text-sm font-semibold">History</span>
          <span className="text-[10px] text-[var(--ui-text-muted)]">{COMMITS.length} commits</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => addAgentLog('Staged 3 files for commit', 'info')}
              className="text-[10px] px-3 py-1 rounded bg-[var(--ui-accent)] text-black font-semibold hover:brightness-110 flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Commit
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {COMMITS.map(c => (
            <div key={c.sha} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--ui-border)]/50 hover:bg-white/[0.02]">
              <div className="mt-1 w-6 h-6 rounded-full bg-gradient-to-br from-[var(--ui-accent)] to-purple-500 flex items-center justify-center text-[10px] font-bold text-black">
                {c.author[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{c.message}</span>
                  <span className="text-[10px] text-[var(--ui-text-muted)] font-mono">{c.sha}</span>
                </div>
                <div className="text-[10px] text-[var(--ui-text-muted)] flex items-center gap-2 mt-0.5">
                  <GitBranch className="w-2.5 h-2.5" /> {c.branch}
                  <span>·</span>
                  <span>{c.author}</span>
                  <span>·</span>
                  <span>{c.time}</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-right">
                <div className="text-emerald-400">+{c.additions}</div>
                <div className="text-rose-400">-{c.deletions}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
