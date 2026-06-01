import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Database, Plus, RefreshCw, Table, Key, Link2, Search, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

interface Column { name: string; type: string; pk?: boolean; }
interface DbTable { name: string; rows: number; size: string; columns: Column[]; }

const SEED_TABLES: DbTable[] = [
  {
    name: 'scenes',
    rows: 24, size: '128 KB',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'name', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
      { name: 'entities_json', type: 'jsonb' }
    ]
  },
  {
    name: 'entities',
    rows: 412, size: '2.1 MB',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'scene_id', type: 'uuid' },
      { name: 'kind', type: 'text' },
      { name: 'transform', type: 'jsonb' }
    ]
  },
  {
    name: 'agent_logs',
    rows: 9841, size: '14.8 MB',
    columns: [
      { name: 'id', type: 'bigserial', pk: true },
      { name: 'level', type: 'text' },
      { name: 'message', type: 'text' },
      { name: 'ts', type: 'timestamptz' }
    ]
  },
  {
    name: 'checkpoints',
    rows: 87, size: '420 KB',
    columns: [
      { name: 'id', type: 'text', pk: true },
      { name: 'state_dump', type: 'jsonb' },
      { name: 'created_at', type: 'timestamptz' }
    ]
  }
];

const SAMPLE_ROWS: Record<string, string[][]> = {
  scenes: [
    ['s1', 'Default Setup',  '2026-05-31 12:04', '{ "entities": [...] }'],
    ['s2', 'City Skyline',   '2026-05-30 18:22', '{ "entities": [...] }'],
    ['s3', 'Neon Atrium',    '2026-05-29 09:11', '{ "entities": [...] }']
  ],
  entities: [
    ['e1', 's1', 'mesh',  '{ x:0, y:2, z:-5 }'],
    ['e2', 's1', 'light', '{ x:10, y:10, z:10 }'],
    ['e3', 's2', 'mesh',  '{ x:0, y:0, z:0 }']
  ],
  agent_logs: [
    ['1', 'info',    'Canvas ready',           '2026-06-01 09:54:01'],
    ['2', 'success', 'Pod compiled',            '2026-06-01 09:54:04'],
    ['3', 'warning', 'Memory pressure on node', '2026-06-01 09:54:11']
  ],
  checkpoints: [
    ['init',  '{ ... }', '2026-06-01 09:54:00'],
    ['step_1','{ ... }', '2026-06-01 09:55:12']
  ]
};

export default function DatabaseView() {
  const { addAgentLog } = useWorkspace();
  const [activeTable, setActiveTable] = useState<string>('scenes');
  const [filter, setFilter] = useState('');

  const filteredRows = (SAMPLE_ROWS[activeTable] || []).filter(r =>
    !filter || r.some(cell => cell.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="flex-1 flex h-full bg-[var(--ui-bg)] text-[var(--ui-text)] overflow-hidden">
      <aside className="w-64 border-r border-[var(--ui-border)] flex flex-col bg-[var(--ui-panel)]">
        <div className="p-4 border-b border-[var(--ui-border)] flex items-center gap-2">
          <Database className="w-4 h-4 text-[var(--ui-accent)]" />
          <div>
            <div className="text-sm font-semibold">aether-postgres</div>
            <div className="text-[10px] text-[var(--ui-text-muted)]">localhost:5432 · healthy</div>
          </div>
          <button onClick={() => addAgentLog('Refreshing database schema…', 'info')} className="ml-auto p-1.5 rounded hover:bg-white/5">
            <RefreshCw className="w-3 h-3 text-[var(--ui-text-muted)]" />
          </button>
        </div>
        <div className="p-2">
          <div className="text-[9px] uppercase tracking-wider text-[var(--ui-text-muted)] px-2 py-1">public schema</div>
          {SEED_TABLES.map(t => (
            <button
              key={t.name}
              onClick={() => setActiveTable(t.name)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs",
                activeTable === t.name ? "bg-[var(--ui-accent)]/10 text-[var(--ui-accent)]" : "hover:bg-white/5"
              )}
            >
              <Table className="w-3 h-3" />
              <span className="flex-1 text-left">{t.name}</span>
              <span className="text-[10px] text-[var(--ui-text-muted)]">{t.rows}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto p-3 border-t border-[var(--ui-border)]">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs border border-dashed border-[var(--ui-border)] hover:border-[var(--ui-accent)]/50 text-[var(--ui-text-muted)]">
            <Plus className="w-3 h-3" /> New table
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-[var(--ui-border)] flex items-center px-4 gap-3 bg-[var(--ui-panel)]">
          <span className="text-sm font-semibold">{activeTable}</span>
          <span className="text-[10px] text-[var(--ui-text-muted)]">
            {SEED_TABLES.find(t => t.name === activeTable)?.rows.toLocaleString()} rows · {SEED_TABLES.find(t => t.name === activeTable)?.size}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[var(--ui-text-muted)]" />
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter rows…"
                className="bg-[var(--ui-bg)] border border-[var(--ui-border)] rounded pl-7 pr-2 py-1 text-[11px] outline-none focus:border-[var(--ui-accent)] w-48"
              />
            </div>
            <button className="p-1.5 rounded hover:bg-white/5"><MoreHorizontal className="w-3 h-3" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-[var(--ui-panel)] border-b border-[var(--ui-border)]">
              <tr>
                {(SEED_TABLES.find(t => t.name === activeTable)?.columns || []).map(c => (
                  <th key={c.name} className="text-left px-3 py-2 font-semibold text-[var(--ui-text-muted)]">
                    <div className="flex items-center gap-1">
                      {c.pk && <Key className="w-2.5 h-2.5 text-amber-400" />}
                      {c.name}
                      <span className="text-[9px] font-normal opacity-60">{c.type}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr key={i} className="border-b border-[var(--ui-border)]/50 hover:bg-white/[0.02]">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-1.5 font-mono text-[var(--ui-text-muted)]">{cell}</td>
                  ))}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr><td colSpan={99} className="text-center text-[var(--ui-text-muted)] py-6 text-[11px]">No matching rows.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
