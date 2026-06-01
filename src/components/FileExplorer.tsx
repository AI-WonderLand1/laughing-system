import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';
import { FileNode } from '../types';

const COLORS = {
  bg: "#0a0b0e",
  surface: "#111318",
  surfaceHover: "#1a1d24",
  border: "#1e2330",
  borderBright: "#2a3040",
  accent: "#00d4ff",
  accentDim: "#00a8cc",
  accentGlow: "rgba(0,212,255,0.12)",
  accentGlow2: "rgba(0,212,255,0.06)",
  green: "#00e5a0",
  amber: "#ffb340",
  red: "#ff4d6a",
  text: "#e2e8f0",
  textDim: "#8892a4",
  textFaint: "#4a5568",
};

const LangBadge = ({ lang }: { lang?: string }) => {
  if (!lang) return null;
  const colors: Record<string, string> = { tsx: "#61dafb", ts: "#3178c6", json: COLORS.amber, js: "#f7df1e", css: "#264de4" };
  const color = colors[lang] || COLORS.textDim;
  return (
    <span style={{
      fontSize: "9px", fontFamily: "monospace", fontWeight: 700,
      color, opacity: 0.8, letterSpacing: "0.05em",
      background: `${color}18`, borderRadius: 3, padding: "1px 4px",
      border: `1px solid ${color}30`
    }}>{lang.toUpperCase()}</span>
  );
};

const FileIcon = ({ type, open }: { type: 'dir' | 'file', open?: boolean }) => (
  type === "dir"
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill={open ? COLORS.accent+"44" : "transparent"} stroke={open ? COLORS.accent : COLORS.textDim} strokeWidth="1.8" style={{flexShrink:0}}>
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      </svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.textFaint} strokeWidth="1.8" style={{flexShrink:0}}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
      </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.textFaint} strokeWidth="2.5"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}>
    <polyline points="9,6 15,12 9,18"/>
  </svg>
);

const FileNodeEntry = ({ node, depth = 0, onSelect, activeFile }: { node: FileNode, depth?: number, onSelect: (path: string) => void, activeFile?: string }) => {
  const [open, setOpen] = useState(true);
  const isActive = activeFile === node.path;
  const indent = 12 + depth * 16;
  
  if (node.type === "directory") {
    return (
      <div>
        <div onClick={() => setOpen(o => !o)} style={{
          display: "flex", alignItems: "center", gap: 5, padding: `4px 8px 4px ${indent}px`,
          cursor: "pointer", borderRadius: 4, color: COLORS.textDim, fontSize: 13,
          fontWeight: 500, transition: "background 0.1s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <ChevronIcon open={open} />
          <FileIcon type="dir" open={open} />
          <span style={{ fontFamily: "'Geist Mono', 'Fira Code', monospace", letterSpacing: "-0.01em" }}>{node.name}</span>
        </div>
        {open && node.children?.map((child, i) => (
          <FileNodeEntry key={i} node={child} depth={depth + 1} onSelect={onSelect} activeFile={activeFile} />
        ))}
      </div>
    );
  }

  const lang = node.name.split('.').pop() || 'txt';
  
  return (
    <div onClick={() => onSelect(node.path)} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: `4px 10px 4px ${indent}px`, cursor: "pointer", borderRadius: 4,
      background: isActive ? COLORS.accentGlow : "transparent",
      borderLeft: isActive ? `2px solid ${COLORS.accent}` : "2px solid transparent",
      marginLeft: 2, transition: "all 0.12s",
    }}
    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = COLORS.surfaceHover; }}
    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FileIcon type="file" />
        <span style={{
          fontFamily: "'Geist Mono', 'Fira Code', monospace", fontSize: 12.5,
          color: isActive ? COLORS.text : COLORS.textDim, letterSpacing: "-0.01em"
        }}>{node.name}</span>
      </div>
      <LangBadge lang={lang} />
    </div>
  );
};

export default function FileExplorer() {
  const { activeTabPath, openFile } = useWorkspace();
  
  const mockFiles: FileNode[] = [
    {
      name: 'src',
      path: 'src',
      type: 'directory',
      children: [
        { name: 'App.tsx', path: 'src/App.tsx', type: 'file' },
        { name: 'main.tsx', path: 'src/main.tsx', type: 'file' },
        { name: 'WorkspaceContext.tsx', path: 'src/WorkspaceContext.tsx', type: 'file' },
        { 
          name: 'components', 
          path: 'src/components', 
          type: 'directory',
          children: [
            { name: 'Shell.tsx', path: 'src/components/Shell.tsx', type: 'file' },
            { name: 'CanvasEditor.tsx', path: 'src/components/CanvasEditor.tsx', type: 'file' },
            { name: 'SpatialView.tsx', path: 'src/components/SpatialView.tsx', type: 'file' },
          ]
        }
      ]
    },
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file' }
  ];

  return (
    <div style={{
      width: "100%", height: "100%", background: COLORS.surface,
      display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      {/* Panel Header */}
      <div style={{
        height: 36, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 12px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.textFaint }}>
          Explorer
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {[
             <svg key="add" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
             <svg key="refresh" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          ].map((icon, i) => (
            <button key={i} style={{
              background: "transparent", border: "none", color: COLORS.textFaint, cursor: "pointer",
              padding: 3, borderRadius: 4, display: "flex", alignItems: "center",
              transition: "color 0.1s"
            }}
            onMouseEnter={e => e.currentTarget.style.color = COLORS.text}
            onMouseLeave={e => e.currentTarget.style.color = COLORS.textFaint}
            >{icon}</button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "8px 10px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: COLORS.bg, border: `1px solid ${COLORS.border}`,
          borderRadius: 6, padding: "5px 8px",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={COLORS.textFaint} strokeWidth="2.5">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input placeholder="Filter..." style={{
            background: "none", border: "none", outline: "none", color: COLORS.textDim,
            fontSize: 12, fontFamily: "'Geist Mono', monospace", width: "100%",
          }}/>
        </div>
      </div>

      {/* File Tree */}
      <div style={{ flex: 1, overflow: "auto", padding: "4px 0" }}>
        {mockFiles.map((node, i) => (
          <FileNodeEntry key={i} node={node} onSelect={(path) => openFile(path)} activeFile={activeTabPath || undefined} />
        ))}
      </div>
    </div>
  );
}
