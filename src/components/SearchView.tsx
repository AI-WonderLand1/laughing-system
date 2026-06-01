import React, { useMemo, useState } from 'react';
import { Search, FileCode, Box, Layers, GitCommit, Hash } from 'lucide-react';
import { cn } from '../lib/utils';

type ResultKind = 'scene' | 'entity' | 'file' | 'commit' | 'symbol';

interface Result {
  kind: ResultKind;
  title: string;
  subtitle: string;
  ref: string;
  match: string;
}

const SEED: Result[] = [
  { kind: 'scene',   title: 'Default Setup',         subtitle: '3 entities · 24 KB',         ref: 'scenes/s1',     match: 'aesthetic' },
  { kind: 'scene',   title: 'City Skyline',          subtitle: '87 entities · 2.1 MB',       ref: 'scenes/s2',     match: 'skyline' },
  { kind: 'scene',   title: 'Neon Atrium',           subtitle: '14 entities · 412 KB',       ref: 'scenes/s3',     match: 'aesthetic' },
  { kind: 'entity',  title: 'Primary Cube',          subtitle: 'mesh · cyan',                ref: 'entities/e1',   match: 'cube' },
  { kind: 'entity',  title: 'Key Light',             subtitle: 'light · cyan 1.5x',          ref: 'entities/e2',   match: 'light' },
  { kind: 'entity',  title: 'Ground Plane',          subtitle: 'mesh · dark',                ref: 'entities/e3',   match: 'ground' },
  { kind: 'file',    title: 'spatial-engine-v3.ts',  subtitle: 'src/runtime/engine.ts',      ref: 'src/runtime',   match: 'engine' },
  { kind: 'file',    title: 'aether-wasm-bind.ts',   subtitle: 'src/wasm/bind.ts',           ref: 'src/wasm',      match: 'aether' },
  { kind: 'commit',  title: 'Wire up SpatialCanvas GPU instancing', subtitle: 'a3f1c9d · you',          ref: 'main',          match: 'canvas' },
  { kind: 'commit',  title: 'Add wasm vertex shader for godot target', subtitle: '8e22b10 · opencode',  ref: 'feat/spatial-canvas', match: 'godot' },
  { kind: 'symbol',  title: 'spinUpEnginePod(engineId, buildTarget)', subtitle: 'WorkspaceContext.tsx:375',  ref: 'src',           match: 'engine' },
  { kind: 'symbol',  title: 'addEntity(entity)',     subtitle: 'WorkspaceContext.tsx:611',   ref: 'src',           match: 'entity' }
];

const KIND_ICON: Record<ResultKind, React.ComponentType<{ className?: string }>> = {
  scene:  Layers,
  entity: Box,
  file:   FileCode,
  commit: GitCommit,
  symbol: Hash
};

const FILTERS: { id: 'all' | ResultKind; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'scene',   label: 'Scenes' },
  { id: 'entity',  label: 'Entities' },
  { id: 'file',    label: 'Files' },
  { id: 'symbol',  label: 'Symbols' },
  { id: 'commit',  label: 'Commits' }
];

export default function SearchView() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | ResultKind>('all');

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return SEED.filter(r => filter === 'all' || r.kind === filter)
      .filter(r => !term || r.title.toLowerCase().includes(term) || r.subtitle.toLowerCase().includes(term) || r.match.includes(term));
  }, [q, filter]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--ui-bg)] text-[var(--ui-text)] overflow-hidden">
      <div className="max-w-3xl w-full mx-auto pt-16 px-6 flex-1 flex flex-col">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--ui-text-muted)] mb-3">
            <Search className="w-3 h-3 text-[var(--ui-accent)]" /> Workspace search
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Find anything in spatial</h2>
          <p className="text-sm text-[var(--ui-text-muted)] mt-1">Scenes, entities, files, symbols, and history — all in one place.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ui-text-muted)]" />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search scenes, entities, files…"
            className="w-full bg-[var(--ui-panel)] border border-[var(--ui-border)] rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[var(--ui-accent)] transition-colors shadow-xl shadow-black/40"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--ui-text-muted)] border border-[var(--ui-border)] rounded px-1.5 py-0.5">⌘K</kbd>
        </div>

        <div className="flex items-center gap-1 mt-4 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-medium border transition-colors",
                filter === f.id
                  ? "bg-[var(--ui-accent)] text-black border-[var(--ui-accent)]"
                  : "border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:border-[var(--ui-accent)]/40"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex-1 overflow-y-auto pb-12 space-y-1">
          {results.map((r, i) => {
            const Icon = KIND_ICON[r.kind];
            return (
              <button
                key={i}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--ui-panel)] border border-transparent hover:border-[var(--ui-border)] transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--ui-panel)] border border-[var(--ui-border)] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[var(--ui-accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-[11px] text-[var(--ui-text-muted)] truncate">{r.subtitle}</div>
                </div>
                <div className="text-[10px] font-mono text-[var(--ui-text-muted)]">{r.ref}</div>
              </button>
            );
          })}
          {results.length === 0 && (
            <div className="text-center text-[var(--ui-text-muted)] text-xs py-12">No results. Try a different term.</div>
          )}
        </div>
      </div>
    </div>
  );
}
