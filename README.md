# a new way of doing everything, 
# Ai-Wonderland 

![Ai-Wonderland Banner](README_md_f19a0258.png)

> A next-generation spatial development platform. Build, deploy, and manage 3D applications with Kubernetes-powered infrastructure, multi-engine rendering, and AI-assisted development — all from one unified IDE.

---

## What is this?

**Spatial_IDE** is the core of Ai-Wonderland — a browser-based development environment that combines a full code editor, 3D spatial canvas, Kubernetes pod management, asset pipeline, and AI intelligence into a single platform. Think Coder.com meets a 3D game engine, with an AI architect built in.

---

## Features

**3D Pod Studio**
- Launch and manage live WebGL render environments
- Choose from Three.js, Babylon.js, PlayCanvas, or a fully custom engine sandbox
- Real-time material inspector: albedo, metalness, roughness, geometry
- Live mesh editor with wireframe, bounding boxes, and gizmo controls
- Built-in pod terminal with container log streaming

**AI Intelligence Core**
- Powered by Google Gemini + Claude AI
- Natural language commands to generate 3D entities, debug errors, and write code
- AI Architect: procedurally generate spatial scenes from a text prompt
- Auto-remediation: AI detects and patches workspace errors automatically

**Kubernetes & Infrastructure**
- Full pod lifecycle management: spin up, reboot, terminate
- Real-time CPU, memory, and restart metrics per pod
- Multi-namespace filtering and bulk actions
- AetherShield IPS: live intrusion detection and threat simulation
- Historical cluster charts and telemetry

**Integrity & Backups**
- AetherOS Telemetry Protection with live integrity index
- Checkpoint timeline: snapshot and restore workspace state at any point
- AI-powered error remediation with resolution logs

**Source Code Editor**
- Monaco-style editor with multi-tab support
- File explorer with full project tree
- Hybrid Split mode: code editor + spatial canvas side by side
- Resizable terminal panel with command history

**Asset Pipeline**
- Automatic Draco/Meshopt compression for GLTF/GLB assets
- Drag-and-drop import with real-time processing status
- Supports: `.glb`, `.gltf`, textures, audio, scripts

**UI Design Canvas**
- Visual drag-and-drop entity editor
- Zoom, pan, place, and select tools
- Scene management with save/load

**Deployment**
- One-click deploy to Workspace Cloud (containerized)
- Cluster verification and WASI validation
- Release bundle download for offline distribution
- Export NPM-ready packages

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| 3D Rendering | Three.js, Babylon.js, PlayCanvas |
| AI | Google Gemini (`@google/genai`), Claude (Anthropic) |
| Backend | Node.js, Express 5, socket.io |
| Infrastructure | Kubernetes (`k8s`), Docker |
| Payments | Stripe |
| Data Viz | D3.js |
| Animation | Motion (Framer Motion) |
| Styling | Tailwind CSS |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A Gemini API key (get one at [ai.google.dev](https://ai.google.dev))

### Installation

```bash
git clone https://github.com/AI-WonderLand1/laughing-system.git
cd laughing-system
npm install
```

### Configuration

Copy the example env file and add your keys:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_gemini_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
VITE_APP_NAME=Spatial_IDE
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
laughing-system/
├── src/
│   ├── components/
│   │   ├── Shell.tsx              # Main IDE layout & navigation
│   │   ├── PodStudio.tsx          # 3D engine launcher & inspector
│   │   ├── KubernetesView.tsx     # Pod cluster management
│   │   ├── IntegrityDashboard.tsx # Error monitoring & checkpoints
│   │   ├── AIArchitect.tsx        # Procedural world generation
│   │   ├── AetherShieldIPS.tsx    # Intrusion prevention system
│   │   ├── SpatialView.tsx        # Engine connection panel
│   │   ├── EngineEditor.tsx       # Engine orchestrator & custom lab
│   │   ├── CanvasEditor.tsx       # Visual entity canvas
│   │   ├── Editor.tsx             # Source code editor
│   │   ├── Terminal.tsx           # Resizable terminal panel
│   │   ├── FileExplorer.tsx       # Project file tree
│   │   ├── GltfPipeline.tsx       # Asset optimization pipeline
│   │   ├── WebView.tsx            # Live site preview
│   │   ├── SetupGate.tsx          # Workspace initialization wizard
│   │   ├── ProjectSettings.tsx    # API keys & configuration
│   │   └── PodStudio.tsx          # 3D Pod launcher
│   ├── WorkspaceContext.tsx        # Global state management
│   ├── types.ts                   # TypeScript definitions
│   └── App.tsx                    # Root component
├── server.ts                      # Express + socket.io backend
├── vite.config.ts
└── package.json
```

---

---

## Roadmap

- [ ] Real Kubernetes cluster provisioning via `@kubernetes/client-node`
- [ ] User authentication and isolated workspaces
- [ ] Vercel / Railway / Render / Fly.io one-click deploy configs
- [ ] VS Code extension protocol support
- [ ] Multiplayer collaborative editing via socket.io
- [ ] Mobile-responsive spatial view
- [ ] Plugin marketplace

---

## Contributing

Pull requests welcome. For major changes open an issue first.

---

## License

MIT — free to use, modify, and distribute.

---

<p align="center">
  <strong>Ai-Wonderland</strong> — a new way of doing everything.
</p>
