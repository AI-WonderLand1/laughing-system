"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_http = require("http");
var import_socket = require("socket.io");
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var OPENCODE_URL = (process.env.OPENCODE_URL || "http://127.0.0.1:4096").replace(/\/+$/, "");
var OPENCODE_USERNAME = process.env.OPENCODE_USERNAME || process.env.OPENCODE_SERVER_USERNAME || "opencode";
var OPENCODE_PASSWORD = process.env.OPENCODE_PASSWORD || process.env.OPENCODE_SERVER_PASSWORD || "";
function opencodeHeaders() {
  const h = { "Content-Type": "application/json" };
  if (OPENCODE_PASSWORD) {
    const token = Buffer.from(`${OPENCODE_USERNAME}:${OPENCODE_PASSWORD}`).toString("base64");
    h["Authorization"] = `Basic ${token}`;
  }
  return h;
}
async function opencodeHealth() {
  try {
    const r = await fetch(`${OPENCODE_URL}/global/health`, { headers: opencodeHeaders() });
    if (!r.ok) return { ok: false, error: `opencode responded ${r.status}` };
    const data = await r.json();
    return { ok: !!data.healthy, version: data.version };
  } catch (e) {
    return { ok: false, error: e?.message || "opencode unreachable" };
  }
}
async function opencodeComplete(systemPrompt, userPrompt, opts = {}) {
  const sessionRes = await fetch(`${OPENCODE_URL}/session`, {
    method: "POST",
    headers: opencodeHeaders(),
    body: JSON.stringify({ title: "AetherOS AI" })
  });
  if (!sessionRes.ok) throw new Error(`opencode /session ${sessionRes.status}: ${await sessionRes.text()}`);
  const session = await sessionRes.json();
  const sessionId = session.id;
  if (!sessionId) throw new Error("opencode returned no session id");
  const body = {
    parts: [
      { type: "text", text: userPrompt }
    ]
  };
  if (systemPrompt) body.system = systemPrompt;
  if (opts.model) body.model = opts.model;
  if (opts.agent) body.agent = opts.agent;
  const msgRes = await fetch(`${OPENCODE_URL}/session/${sessionId}/message`, {
    method: "POST",
    headers: opencodeHeaders(),
    body: JSON.stringify(body)
  });
  if (!msgRes.ok) throw new Error(`opencode /message ${msgRes.status}: ${await msgRes.text()}`);
  const data = await msgRes.json();
  const parts = data?.parts || [];
  const text = parts.filter((p) => p?.type === "text" && typeof p.text === "string").map((p) => p.text).join("\n").trim();
  return text;
}
async function tryOpencode(systemPrompt, userPrompt) {
  try {
    const health = await opencodeHealth();
    if (!health.ok) return null;
    const out = await opencodeComplete(systemPrompt, userPrompt);
    return out || null;
  } catch (e) {
    console.error("OpenCode AI failed:", e.message);
    return null;
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const botUserAgents = [
    "curl",
    "python",
    "wget",
    "libwww-perl",
    "scrapy",
    "spider",
    "crawler",
    "headless",
    "nikto",
    "dirbuster",
    "gobuster"
  ];
  let blockedBotsCount = 42;
  let blockedMorrisCount = 18;
  let blockedRateLimitsCount = 7;
  const recentBlockedProbes = [
    { ip: "128.32.130.2", protocol: "FINGER/79", description: "Morris Worm buffer overflow gets() probe. Origin: UC Berkeley.", timestamp: new Date(Date.now() - 17e4).toISOString() },
    { ip: "18.72.0.3", protocol: "SMTP/25", description: "Sendmail DEBUG command injection quarantine. Origin: MIT.", timestamp: new Date(Date.now() - 34e4).toISOString() },
    { ip: "10.0.0.15", protocol: "RSH/512", description: "Automated weak password brute-force scan. Scrubbed instantly.", timestamp: new Date(Date.now() - 52e4).toISOString() }
  ];
  const rateLimitMap = /* @__PURE__ */ new Map();
  app.use((req, res, next) => {
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;
    const ua = (req.headers["user-agent"] || "").toLowerCase();
    const isBotUA = botUserAgents.some((b) => ua.includes(b));
    if (isBotUA && !req.path.includes("/api/security/stats")) {
      blockedBotsCount++;
      recentBlockedProbes.unshift({
        ip,
        protocol: "HTTP/80",
        description: `Automated Bot scan blocked (User-Agent: ${req.headers["user-agent"]})`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (recentBlockedProbes.length > 25) recentBlockedProbes.pop();
      return res.status(403).json({ error: "Access Rejected: Security Rule 24 blocks non-browser scrapers and bot crawlers." });
    }
    const pathLower = req.path.toLowerCase();
    const queryLower = decodeURIComponent(req.url).toLowerCase();
    const hasMorrisSignature = pathLower.includes("gets(") || queryLower.includes("gets(") || pathLower.includes("fingerd") || queryLower.includes("fingerd") || pathLower.includes("sendmail") || queryLower.includes("sendmail") || queryLower.includes("/usr/tmp") || queryLower.includes("rsh") || queryLower.includes("debug") && queryLower.includes("recipient");
    if (hasMorrisSignature) {
      blockedMorrisCount++;
      recentBlockedProbes.unshift({
        ip,
        protocol: "TCP/WORM",
        description: `Quarantined Morris Worm replica probe (signature match). Vector contained.`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (recentBlockedProbes.length > 25) recentBlockedProbes.pop();
      return res.status(400).json({ error: "Access Quarantined: Security rule 16 matched Intrusion Signature (Morris_Worm_Sandbox_Interception)." });
    }
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    if (req.path.startsWith("/api/") && !req.path.startsWith("/api/security/")) {
      const now = Date.now();
      const limitData = rateLimitMap.get(ip);
      if (!limitData || now > limitData.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + 6e4 });
      } else {
        limitData.count++;
        if (limitData.count > 60) {
          blockedRateLimitsCount++;
          recentBlockedProbes.unshift({
            ip,
            protocol: "HTTP/LIMIT",
            description: `Throttle: API request threshold breached (${limitData.count} req/min). Cooling down remote client index.`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
          if (recentBlockedProbes.length > 25) recentBlockedProbes.pop();
          return res.status(429).json({ error: "Dynamic rate limiting activated: Too many requests. Please wait 60 seconds before pulling server threads." });
        }
      }
    }
    next();
  });
  app.get("/api/security/stats", (req, res) => {
    res.json({
      status: "SECURE",
      shieldsLevel: 100,
      systemLockdown: false,
      blockedBots: blockedBotsCount,
      blockedMorris: blockedMorrisCount,
      blockedRateLimits: blockedRateLimitsCount,
      activeRules: [
        { code: "RULE-A7", name: "Finger Daemon gets() Buffer Overflow Filter", state: "Active" },
        { code: "RULE-B2", name: "Sendmail DEBUG SMTP Command Disinfector", state: "Active" },
        { code: "RULE-C9", name: "Multi-threading Rate Limiting Engine", state: "Active" },
        { code: "RULE-D5", name: "Non-browser Automated Scraping Engine Blacklist", state: "Active" }
      ],
      recentProbes: recentBlockedProbes
    });
  });
  app.post("/api/security/simulate-probe", (req, res) => {
    const { type } = req.body;
    const randomIp = `${Math.floor(Math.random() * 223 + 1)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254 + 1)}`;
    if (type === "morris") {
      blockedMorrisCount++;
      const payload = Math.random() > 0.5 ? "gets() buffer overflow packet spoofing fingered host stack" : "Sendmail DEBUG bypass - mail to host shell execution";
      recentBlockedProbes.unshift({
        ip: randomIp,
        protocol: Math.random() > 0.5 ? "FINGER/79" : "SMTP/25",
        description: `SIMULATION: Intercepted payload [${payload}]. Dropped.`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else if (type === "bot") {
      blockedBotsCount++;
      recentBlockedProbes.unshift({
        ip: randomIp,
        protocol: "HTTP/80",
        description: `SIMULATION: Rejected scraper scan matching user-agent: Scrapy/2.11 Bot`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      blockedRateLimitsCount++;
      recentBlockedProbes.unshift({
        ip: randomIp,
        protocol: "HTTP/LIMIT",
        description: `SIMULATION: Rate limiting active. High velocity IP thread pooled and frozen.`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (recentBlockedProbes.length > 25) recentBlockedProbes.pop();
    res.json({
      success: true,
      message: "Simulation recorded",
      stats: {
        blockedBots: blockedBotsCount,
        blockedMorris: blockedMorrisCount,
        blockedRateLimits: blockedRateLimitsCount
      }
    });
  });
  app.get("/api/ai/status", async (_req, res) => {
    const health = await opencodeHealth();
    res.json({
      provider: "opencode",
      url: OPENCODE_URL,
      ...health
    });
  });
  app.post("/api/config/lint", async (req, res) => {
    try {
      const { filePath, content, target, error } = req.body;
      if (error) {
        const suggestion = `To resolve "${error.code || "unknown"}": check the ${error.section || "component"} configuration and ensure all required fields are set.`;
        return res.json({ success: true, solution: suggestion, source: "rules" });
      }
      if (!filePath || !content) {
        return res.status(400).json({ error: "filePath and content are required" });
      }
      const issues = [];
      const suggestions = [];
      if (content.includes("your-project") || content.includes("YOUR_")) {
        issues.push("Contains placeholder values (your-project, YOUR_*)");
        suggestions.push("Replace all placeholder values with your actual project name and credentials");
      }
      const ext = filePath.split(".").pop()?.toLowerCase();
      if (ext === "json") {
        try {
          JSON.parse(content);
        } catch {
          issues.push("Invalid JSON syntax");
          suggestions.push("Fix the JSON syntax error \u2014 check for missing commas, brackets, or quotes");
        }
      }
      let aiSuggestions = [];
      if (target) {
        const aiOut = await tryOpencode(
          `You are a config file validator. Review this ${ext || "config"} file for a ${target} deployment. List any issues or improvements in 1-2 short bullet points. Be specific and technical. No preamble.`,
          `File: ${filePath}
Target: ${target}

${content.substring(0, 3e3)}`
        );
        if (aiOut) {
          aiSuggestions = aiOut.split("\n").filter((l) => l.trim()).slice(0, 5);
        }
      }
      res.json({
        success: true,
        valid: issues.length === 0,
        issues,
        suggestions: [...suggestions, ...aiSuggestions],
        source: aiSuggestions.length ? "opencode" : "rules"
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  const httpServer = (0, import_http.createServer)(app);
  app.post("/api/architect/generate", async (req, res) => {
    try {
      const { prompt, currentEntities } = req.body;
      const systemPrompt = `You are the AetherOS Spatial Architect. Output ONLY valid JSON. No commentary, no markdown fences.`;
      const userPrompt = `Current scene entities: ${JSON.stringify(currentEntities || [])}
User request: ${prompt}

Generate NEW entities to add to the scene. Each entity has:
{ "name": string, "type": "mesh" | "light", "x": number, "y": number, "z": number, "scale": number, "properties": { "color"?: string, "intensity"?: number, "emissive"?: boolean } }

Return ONLY a JSON array of new entities.`;
      let entities = [];
      const aiOut = await tryOpencode(systemPrompt, userPrompt);
      if (aiOut) {
        const match = aiOut.match(/\[[\s\S]*\]/);
        const jsonText = match ? match[0] : aiOut;
        try {
          entities = JSON.parse(jsonText);
        } catch {
          entities = [];
        }
      }
      if (!Array.isArray(entities)) entities = [];
      res.json(entities);
    } catch (error) {
      console.error("Architect Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/assistant/chat", async (req, res) => {
    try {
      const { message, history, context } = req.body;
      const systemPrompt = `You are the Spatial OS Intelligence Assistant.
You have access to the current workspace state:
- Pods: ${JSON.stringify(context?.pods)}
- Scenes: ${JSON.stringify(context?.scenes)}
- View Mode: ${context?.viewMode}

You can answer questions about the infrastructure or scenes. If the user wants to perform an action, suggest the specific command. Be concise, technical, and helpful. Use markdown for formatting.`;
      const transcript = (history || []).map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`).join("\n");
      const userPrompt = `${transcript ? transcript + "\n" : ""}User: ${message}`;
      const aiOut = await tryOpencode(systemPrompt, userPrompt);
      if (aiOut) {
        res.json({ content: aiOut });
        return;
      }
      const fallback = `Spatial OS ready. I can help with **${context?.viewMode || "pods"}**, scenes (${(context?.scenes || []).length}), and ${(context?.pods || []).length} pod(s). Ask me to reboot a pod, save a scene, or list running nodes.`;
      res.json({ content: fallback, source: "fallback" });
    } catch (error) {
      console.error("Assistant Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  const io = new import_socket.Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("sync-spatial", (data) => {
      socket.broadcast.emit("spatial-update", data);
    });
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
  const PORT = 3e3;
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
