import React from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Save, 
  FileCode, 
} from 'lucide-react';
import { cn } from '../lib/utils';

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

export default function Editor() {
  const { tabs, activeTabPath, closeTab, setActiveTabPath, updateTabContent, saveActiveFile } = useWorkspace();
  const activeTab = tabs.find(t => t.path === activeTabPath);

  if (!activeTabPath || !activeTab) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: COLORS.bg, color: COLORS.textFaint }}>
        <FileCode size={64} style={{ marginBottom: 16, opacity: 0.1 }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Select source to inspect</p>
      </div>
    );
  }

  const tabColors: Record<string, string> = { tsx: "#61dafb", ts: "#3178c6", json: COLORS.amber };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, fontFamily: "'Inter', sans-serif" }}>

      {/* TAB BAR */}
      <div style={{
        height: 36, background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "flex-end", paddingLeft: 4, flexShrink: 0, overflow: "auto",
      }} className="no-scrollbar">
        {tabs.map(tab => {
          const isActive = tab.path === activeTabPath;
          const lang = tab.name.split('.').pop() || 'tsx';
          const color = tabColors[lang] || COLORS.textDim;
          return (
            <div key={tab.path} onClick={() => setActiveTabPath(tab.path)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px 7px", cursor: "pointer", flexShrink: 0,
              background: isActive ? COLORS.surface : "transparent",
              borderTop: isActive ? `1px solid ${COLORS.border}` : "1px solid transparent",
              borderLeft: isActive ? `1px solid ${COLORS.border}` : "1px solid transparent",
              borderRight: isActive ? `1px solid ${COLORS.border}` : "1px solid transparent",
              borderTopLeftRadius: 5, borderTopRightRadius: 5, marginRight: 1,
              borderBottom: isActive ? `1px solid ${COLORS.surface}` : "1px solid transparent",
              marginBottom: isActive ? -1 : 0,
              transition: "background 0.1s",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, opacity: isActive ? 1 : 0.4, flexShrink: 0 }}/>
              <span style={{
                fontSize: 12, fontFamily: "'Geist Mono', 'Fira Code', monospace",
                color: isActive ? COLORS.text : COLORS.textFaint,
                letterSpacing: "-0.01em", whiteSpace: "nowrap"
              }}>
                {tab.name}
                {tab.isDirty && <span style={{color: COLORS.accent, marginLeft: 4}}>*</span>}
              </span>
              <div onClick={(e) => { e.stopPropagation(); closeTab(tab.path); }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.textFaint} strokeWidth="2.5"
                  style={{ opacity: 0.5, transition: "opacity 0.1s", marginLeft: 4, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
                >
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* BREADCRUMB */}
      <div style={{
        height: 28, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", padding: "0 14px", gap: 6, flexShrink: 0,
      }}>
        {activeTabPath.split('/').map((crumb, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: i === arr.length - 1 ? COLORS.textDim : COLORS.textFaint, fontFamily: "monospace" }}>{crumb}</span>
            {i < arr.length - 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity: 0.3}}><polyline points="9 18 15 12 9 6"></polyline></svg>}
          </div>
        ))}
      </div>

      {/* Editor Surface */}
      <div style={{ flex: 1, position: 'relative', background: COLORS.bg, fontFamily: "monospace", fontSize: 13, display: 'flex' }} className="group">
         <textarea 
            style={{ width: "100%", height: "100%", padding: 24, background: "transparent", border: "none", outline: "none", resize: "none", color: COLORS.text }}
            value={activeTab.content}
            onChange={(e) => updateTabContent(activeTab.path, e.target.value)}
            spellCheck={false}
         />
         
         <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <button 
              onClick={saveActiveFile}
              style={{
                 display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: COLORS.accent, color: '#000', borderRadius: 8, fontSize: 10, fontWeight: 700,
                 boxShadow: `0 8px 24px ${COLORS.accentGlow}`, border: 'none', cursor: 'pointer'
              }}
            >
              <Save size={14} />
              SAVE FILE
            </button>
         </div>
      </div>

    </div>
  );
}
