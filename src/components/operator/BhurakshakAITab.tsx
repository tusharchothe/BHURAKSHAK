/**
 * BhurakshakAITab.tsx — BHURAKSHAK AI  (light / formal theme)
 *
 * Groq-powered mine-safety assistant.
 * Streams via llama-3.3-70b-versatile, system prompt pre-loaded with:
 *   • Live KPI, sensor health, principal-node statuses
 *   • KML site knowledge (coordinates, risk zones, mine boundary)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Send, Bot, User, Sparkles, RefreshCw,
  AlertTriangle, Radio, Wifi, Copy, Check,
  Trash2, Zap, ChevronDown,
} from "lucide-react";
import {
  useLiveKpi, useSensorHealth,
  usePrincipleNodes, useKmlSensorNodes,
} from "@/hooks/useLiveMonitoring";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface Message {
  id:       string;
  role:     "user" | "assistant";
  content:  string;
  time:     string;
  loading?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC MINE / KML KNOWLEDGE
───────────────────────────────────────────────────────────────────────────── */
const MINE_KNOWLEDGE = `
MINE SITE: Moonidih Colliery, Jharia Coalfield, Jharkhand, India
OPERATOR: BCCL (Bharat Coking Coal Limited)
COORDINATES: Centre ≈ 23.735°N, 86.349°E
MINE BOUNDARY: Elliptical, lon 86.329–86.369°, lat 23.706–23.763°

PRINCIPAL NODES (KML):
  PN1 — lat 23.7542, lon 86.3396, alt 206 m — NW sector
  PN2 — lat 23.7314, lon 86.3332, alt 190 m — W sector
  PN3 — lat 23.7411, lon 86.3589, alt 205 m — NE sector
  PN4 — lat 23.7184, lon 86.3531, alt 181 m — SE sector

RISK ZONES (KML High Risk Zone):
  H2 — High Risk: centre ~23.724°N, 86.360°E — active subsidence zone
  H1 — Moderate Risk fringe: centre ~23.748°N, 86.338°E — monitoring zone

DEPLOYMENT ZONES:
  Zone A (PN1) — Extreme Density, 50–100 m spacing
  Zone B (PN2) — Extreme–Moderate, 100–200 m spacing
  Zone C (PN3) — Extreme–Low, 200–400 m spacing
  Zone D (PN4) — Normal, 400–800 m spacing

SENSOR TYPES: Vibration (mm/s), Tilt (°), Displacement (mm)
TOTAL NODES: 296  |  MESH: LoRa → Principal Node → SDN → Cloud
NEARBY INFRASTRUCTURE: 17+ structures (I1–I19)
`;

/* ─────────────────────────────────────────────────────────────────────────────
   SYSTEM PROMPT
───────────────────────────────────────────────────────────────────────────── */
function buildSystemPrompt(kpi: string, health: string, pn: string, sn: string) {
  return `You are BHURAKSHAK AI, the intelligent mine-safety assistant for Moonidih Colliery. You assist shift operators with real-time situational awareness, sensor diagnostics, and safety decisions.

STYLE: Concise, professional, safety-first. Lead with critical information. Use bullet points. Bold key numbers with **value**. Flag hazards with ⚠️ or 🔴. Never fabricate data.

── LIVE DATA (${new Date().toLocaleTimeString("en-IN")}) ──
${kpi}
${health}
${pn}
${sn}

── SITE KNOWLEDGE ──
${MINE_KNOWLEDGE}

RULES:
1. Ground every answer in live data above.
2. For evacuation / structural-risk queries, always recommend contacting the shift supervisor.
3. Keep responses under 300 words unless a report is requested.`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   GROQ STREAMING
───────────────────────────────────────────────────────────────────────────── */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "openai/gpt-oss-120b";

async function streamGroq(
  msgs:    { role: string; content: string }[],
  onChunk: (d: string) => void,
  onDone:  () => void,
  onError: (e: string) => void,
  signal:  AbortSignal,
) {
  const key = import.meta.env["VITE_GROQ_API_KEY"] as string | undefined;
  if (!key || key === "your_groq_api_key_here") {
    onError("VITE_GROQ_API_KEY is not configured. Add it to .env and restart the dev server.");
    return;
  }
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST", signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, messages: msgs, stream: true, max_tokens: 1024, temperature: 0.35 }),
    });
    if (!res.ok) { onError(`Groq ${res.status}: ${await res.text()}`); return; }

    const reader  = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split("\n").filter(l => l.startsWith("data: "))) {
        const json = line.slice(6).trim();
        if (json === "[DONE]") { onDone(); return; }
        try { const d = JSON.parse(json).choices?.[0]?.delta?.content ?? ""; if (d) onChunk(d); } catch { /* skip */ }
      }
    }
    onDone();
  } catch (e: any) {
    if (e?.name !== "AbortError") onError(e?.message ?? "Network error");
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUGGESTED QUERIES
───────────────────────────────────────────────────────────────────────────── */
const SUGGESTED = [
  { icon: "🔴", label: "Active risk zones",          prompt: "Which risk zones are currently active and how many sensors are inside them?" },
  { icon: "📡", label: "Principal node health",       prompt: "Give me a health summary of all four principal nodes right now." },
  { icon: "⚠️", label: "Offline / failed sensors",   prompt: "List all offline or failed sensors and their principal nodes." },
  { icon: "🗺️", label: "Zone A deployment strategy", prompt: "Explain the sensor deployment strategy for Zone A (PN1 high-risk area)." },
  { icon: "🔋", label: "Low battery nodes",           prompt: "Which sensors have low battery and need immediate maintenance?" },
  { icon: "📊", label: "Network health summary",      prompt: "Give me a full network health summary including RSSI, latency and availability." },
  { icon: "🏔️", label: "Subsidence risk H2",          prompt: "Explain the H2 subsidence risk zone — location, affected sensors, and recommended actions." },
  { icon: "🧭", label: "Underground panel status",    prompt: "What underground panels are monitored and what is their current sensor coverage?" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MARKDOWN-LITE RENDERER
───────────────────────────────────────────────────────────────────────────── */
function Md({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={j} className="font-semibold text-gray-900">{p.slice(2, -2)}</strong>
            : <span key={j}>{p}</span>
        );
        if (line.trim() === "") return <div key={i} className="h-2" />;
        if (line.trim().startsWith("- ") || line.trim().startsWith("• "))
          return (
            <div key={i} className="flex items-start gap-2 my-0.5">
              <span className="mt-[7px] size-1.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-gray-700">{parts}</span>
            </div>
          );
        if (/^\d+\.\s/.test(line.trim())) {
          const n = line.trim().match(/^(\d+)\./)?.[1];
          return (
            <div key={i} className="flex items-start gap-2 my-0.5">
              <span className="shrink-0 text-[10px] font-bold text-blue-600 mt-0.5 w-4">{n}.</span>
              <span className="text-gray-700">{parts}</span>
            </div>
          );
        }
        if (line.startsWith("⚠️") || line.startsWith("🔴"))
          return <div key={i} className="font-semibold text-red-700 mt-1.5 mb-0.5">{parts}</div>;
        if (line.includes("──"))
          return <div key={i} className="font-bold text-gray-800 mt-2 mb-0.5 border-b border-gray-200 pb-0.5">{parts}</div>;
        return <div key={i} className="text-gray-700">{parts}</div>;
      })}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
      {done ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LIVE CONTEXT BAR
───────────────────────────────────────────────────────────────────────────── */
function ContextBar() {
  const { data: kpi,    loading: kl } = useLiveKpi();
  const { data: health, loading: hl } = useSensorHealth();
  const { data: pns,    loading: pl } = usePrincipleNodes();

  const stats = [
    { label: "Nodes",   val: kl ? "…" : `${kpi.activeNodes}/${kpi.deployedNodes}`,                                    icon: <Radio className="size-3" />,         color: "#3b82f6" },
    { label: "Health",  val: hl ? "…" : `${health.healthPct}%`,                                                       icon: <Wifi  className="size-3" />,         color: "#16a34a" },
    { label: "Faults",  val: hl ? "…" : String(health.fault),                                                         icon: <AlertTriangle className="size-3" />, color: health.fault > 0 ? "#dc2626" : "#16a34a" },
    { label: "PNs",     val: pl ? "…" : `${pns.filter(p => p.status === "Online").length}/${pns.length} online`,      icon: <Zap   className="size-3" />,         color: "#7c3aed" },
  ];

  return (
    <div className="flex items-center gap-2 px-5 py-2 bg-gray-50 border-b border-gray-200 flex-wrap shrink-0">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Live context</span>
      {stats.map(s => (
        <span key={s.label}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
          style={{ color: s.color, borderColor: s.color + "44", backgroundColor: s.color + "0d" }}>
          {s.icon} {s.label}: {s.val}
        </span>
      ))}
      <span className="ml-auto text-[9px] text-gray-400 flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
        Supabase · live
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────────────────────── */
export function BhurakshakAITab() {
  const { data: kpi }    = useLiveKpi();
  const { data: health } = useSensorHealth();
  const { data: pns }    = usePrincipleNodes();
  const { data: nodes }  = useKmlSensorNodes();

  const [messages,        setMessages]        = useState<Message[]>([]);
  const [input,           setInput]           = useState("");
  const [streaming,       setStreaming]        = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef  = useRef<AbortController | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* live context strings */
  const kpiStr = useMemo(() =>
    `KPI: deployed=${kpi.deployedNodes} active=${kpi.activeNodes} offline=${kpi.offlineSensors} health=${kpi.networkHealth}% alertZones=${kpi.activeAlertZones} latency=${kpi.avgLatencyMs}ms`,
    [kpi]);

  const healthStr = useMemo(() =>
    `HEALTH: total=${health.totalSensors} online=${health.online} offline=${health.offline} lowBatt=${health.lowBattery} faults=${health.fault} pct=${health.healthPct}%`,
    [health]);

  const pnStr = useMemo(() =>
    "PRINCIPAL NODES:\n" + pns.map(p =>
      `  ${p.id}: ${p.status} | batt=${p.batteryPct}% | sig=${p.signalDbm}dBm | connected=${p.connectedSensors}`
    ).join("\n"),
    [pns]);

  const snStr = useMemo(() => {
    const warn = nodes.filter(n => n.status === "Warning").length;
    const off  = nodes.filter(n => n.status === "Offline" || n.fault).length;
    const lb   = nodes.filter(n => n.batteryPct < 20).length;
    const ws   = nodes.filter(n => n.signalPct  < 30).length;
    return `SENSOR NODES (${nodes.length}): warning=${warn} offline=${off} lowBatt=${lb} weakSig=${ws}
BY PN: ${["PN1","PN2","PN3","PN4"].map(id => { const g = nodes.filter(n => n.pnId === id); return `${id}=${g.length}(${g.filter(n => n.status !== "Normal").length} bad)`; }).join(" ")}`;
  }, [nodes]);

  const send = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || streaming) return;
    setShowSuggestions(false);
    setInput("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user",      content: t, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) };
    const lid    = crypto.randomUUID();
    const aiMsg:  Message = { id: lid,                  role: "assistant", content: "", time: userMsg.time, loading: true };

    setMessages(p => [...p, userMsg, aiMsg]);
    setStreaming(true);

    const history = [...messages, userMsg]
      .filter(m => !m.loading)
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    abortRef.current = new AbortController();
    let acc = "";

    streamGroq(
      [{ role: "system", content: buildSystemPrompt(kpiStr, healthStr, pnStr, snStr) }, ...history],
      d  => { acc += d; setMessages(p => p.map(m => m.id === lid ? { ...m, content: acc, loading: false } : m)); },
      () => { setStreaming(false); abortRef.current = null; },
      e  => { setMessages(p => p.map(m => m.id === lid ? { ...m, content: `⚠️ ${e}`, loading: false } : m)); setStreaming(false); },
      abortRef.current.signal,
    );
  }, [streaming, messages, kpiStr, healthStr, pnStr, snStr]);

  const stop  = () => { abortRef.current?.abort(); setStreaming(false); };
  const clear = () => { setMessages([]); setShowSuggestions(true); };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] min-h-0 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative size-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
            <Sparkles className="size-4 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">BHURAKSHAK AI</h2>
            <p className="text-[10px] text-gray-400">Groq · GPT OSS 120B · Mine-safety intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Online
          </span>
          {messages.length > 0 && (
            <button onClick={clear} title="Clear conversation"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Context bar ─────────────────────────────────────────────────── */}
      <ContextBar />

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center gap-4 pt-4 pb-2">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                <Sparkles className="size-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">BHURAKSHAK AI Assistant</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm leading-relaxed">
                  Real-time access to 296 sensor nodes, 4 principal nodes, live telemetry, and full KML site knowledge. How can I assist you?
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center max-w-lg">
                {["Live sensor status", "Risk zone analysis", "Node diagnostics", "KML site knowledge", "Anomaly detection", "Deployment strategy"].map(c => (
                  <span key={c} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white text-gray-600 border border-gray-200 shadow-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested queries */}
          {showSuggestions && messages.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED.map(s => (
                <button key={s.prompt} onClick={() => send(s.prompt)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all text-left group shadow-sm">
                  <span className="text-sm shrink-0">{s.icon}</span>
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 leading-snug">{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Chat messages */}
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

              {/* AI avatar */}
              {msg.role === "assistant" && (
                <div className="size-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="size-3.5 text-white" />
                </div>
              )}

              <div className={`max-w-[82%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {/* Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-[12.5px] leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                }`}>
                  {msg.loading ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <RefreshCw className="size-3 animate-spin text-blue-500" />
                      <span className="text-[11px] text-gray-500">Processing query…</span>
                      <span className="flex gap-0.5 ml-1">
                        {[0,1,2].map(i => (
                          <span key={i} className="size-1.5 rounded-full bg-blue-400 animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </span>
                    </div>
                  ) : msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <Md text={msg.content} />
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[9px] text-gray-400">{msg.time}</span>
                  {msg.role === "assistant" && !msg.loading && msg.content && (
                    <CopyBtn text={msg.content} />
                  )}
                </div>
              </div>

              {/* User avatar */}
              {msg.role === "user" && (
                <div className="size-7 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="size-3.5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Scroll-to-bottom */}
      {messages.length > 4 && (
        <div className="flex justify-center py-1 bg-gray-50/50 shrink-0">
          <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
            <ChevronDown className="size-3" /> Latest message
          </button>
        </div>
      )}

      {/* ── Input area ──────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3 bg-white border-t border-gray-200 shrink-0">
        <div className="flex gap-2 items-end bg-white rounded-xl border border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3.5 py-2.5 shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask about sensor status, risk zones, network health, mine telemetry…"
            rows={1}
            disabled={streaming}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none min-h-[20px] max-h-[120px] py-0 leading-5 disabled:opacity-60"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          {streaming ? (
            <button onClick={stop}
              className="size-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shrink-0 shadow-sm"
              title="Stop generating">
              <span className="size-3 rounded-sm bg-white inline-block" />
            </button>
          ) : (
            <button onClick={() => send(input)} disabled={!input.trim()}
              className="size-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0 shadow-sm">
              <Send className="size-3.5 text-white disabled:text-gray-400" />
            </button>
          )}
        </div>
        <p className="text-[9px] text-gray-400 text-center mt-2">
          <kbd className="bg-gray-100 border border-gray-200 px-1 py-0.5 rounded text-[9px]">Enter</kbd> to send ·{" "}
          <kbd className="bg-gray-100 border border-gray-200 px-1 py-0.5 rounded text-[9px]">Shift + Enter</kbd> for new line · AI responses are advisory — verify all safety-critical decisions with qualified personnel
        </p>
      </div>
    </div>
  );
}
