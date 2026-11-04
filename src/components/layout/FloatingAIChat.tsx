/**
 * FloatingAIChat.tsx
 * Floating AI button (bottom-right, every page) → compact chat card.
 * Uses a React Portal so it escapes any parent overflow:hidden.
 * Logo: /Logo.png from public folder.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Send, Bot, User, RefreshCw, ChevronDown } from "lucide-react";
import { useLiveKpi, useSensorHealth } from "@/hooks/useLiveMonitoring";

/* ── types ─────────────────────────────────────────────────────────────────── */
interface Msg {
  id:       string;
  role:     "user" | "assistant";
  content:  string;
  loading?: boolean;
}

/* ── Groq streaming ─────────────────────────────────────────────────────────── */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "openai/gpt-oss-120b";

async function callGroq(
  messages: { role: string; content: string }[],
  onChunk:  (d: string) => void,
  onDone:   () => void,
  onError:  (e: string) => void,
  signal:   AbortSignal,
) {
  const key = import.meta.env["VITE_GROQ_API_KEY"] as string | undefined;
  if (!key || key === "your_groq_api_key_here") {
    onError("VITE_GROQ_API_KEY not set in .env"); return;
  }
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST", signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, messages, stream: true, max_tokens: 400, temperature: 0.35 }),
    });
    if (!res.ok) { onError(`Groq error ${res.status}`); return; }
    const reader = res.body!.getReader();
    const dec    = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of dec.decode(value, { stream: true }).split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const j = line.slice(6).trim();
        if (j === "[DONE]") { onDone(); return; }
        try { const d = JSON.parse(j).choices?.[0]?.delta?.content ?? ""; if (d) onChunk(d); } catch { /* skip */ }
      }
    }
    onDone();
  } catch (e: any) { if (e?.name !== "AbortError") onError(e?.message ?? "Network error"); }
}

/* ── markdown renderer ──────────────────────────────────────────────────────── */
function Md({ text }: { text: string }) {
  return (
    <div className="space-y-0.5">
      {text.split("\n").map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={j}>{p.slice(2, -2)}</strong>
            : <span key={j}>{p}</span>
        );
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.trim().match(/^[-•]\s/))
          return (
            <div key={i} className="flex gap-1.5 items-start">
              <span className="mt-1.5 size-1 rounded-full bg-green-600 shrink-0 inline-block" />
              <span>{parts}</span>
            </div>
          );
        return <div key={i}>{parts}</div>;
      })}
    </div>
  );
}

/* ── quick prompts ──────────────────────────────────────────────────────────── */
const QUICK = [
  { e: "📡", t: "Network health summary" },
  { e: "🔴", t: "Active risk zones"       },
  { e: "⚠️", t: "Offline sensors"         },
  { e: "🔋", t: "Low battery nodes"       },
];

/* ── Chat card ──────────────────────────────────────────────────────────────── */
function ChatCard({ onClose, kpiSummary }: { onClose: () => void; kpiSummary: string }) {
  const [msgs,  setMsgs]  = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy,  setBusy]  = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const taRef     = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  /* auto-grow textarea */
  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height = `${Math.min(taRef.current.scrollHeight, 80)}px`;
  }, [input]);

  const sysPrompt = useMemo(() =>
    `You are BHURAKSHAK AI — a concise mine-safety assistant for Moonidih Colliery (BCCL, Jharkhand).
${kpiSummary}
SITE: 296 sensors (Vibration/Tilt/Displacement), 4 principal nodes, LoRa mesh.
Risk zones: H2 (high, 23.724°N 86.360°E), H1 (moderate, 23.748°N 86.338°E).
Rules: Keep answers under 100 words. Flag hazards ⚠️. Never fabricate data.`,
    [kpiSummary]
  );

  const send = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user",      content: t };
    const lid          = crypto.randomUUID();
    const aiMsg:  Msg  = { id: lid,                  role: "assistant", content: "", loading: true };
    setMsgs(p => [...p, userMsg, aiMsg]);
    setBusy(true);

    const history = [...msgs, userMsg].filter(m => !m.loading).slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

    abortRef.current = new AbortController();
    let acc = "";

    callGroq(
      [{ role: "system", content: sysPrompt }, ...history],
      d   => { acc += d; setMsgs(p => p.map(m => m.id === lid ? { ...m, content: acc, loading: false } : m)); },
      ()  => { setBusy(false); abortRef.current = null; },
      err => { setMsgs(p => p.map(m => m.id === lid ? { ...m, content: `⚠️ ${err}`, loading: false } : m)); setBusy(false); },
      abortRef.current.signal,
    );
  }, [busy, msgs, sysPrompt]);

  return (
    <div
      className="fixed flex flex-col bg-white border border-gray-200 overflow-hidden rounded-2xl"
      style={{
        /* mobile: stretch almost edge-to-edge, above bottom nav (~64px) */
        bottom:  "calc(4rem + 0.75rem)",
        right:   "0.75rem",
        left:    "0.75rem",
        maxWidth: "340px",
        margin:  "0 auto",          /* centre on very wide mobile screens */
        /* will be overridden on sm+ via the sm:* classes below */
        height:  "min(440px, calc(100dvh - 8rem))",
        zIndex: 9999,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      {/* ── header ── */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border-b border-gray-100 shrink-0">
        {/* Logo */}
        <img
          src="/Logo.png"
          alt="BHURAKSHAK AI"
          className="size-8 rounded-lg object-contain shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-gray-900 leading-none">BHURAKSHAK AI</p>
          <p className="text-[9px] text-gray-400 mt-0.5 leading-none">Mine-safety assistant · live data</p>
        </div>
        {/* Online dot */}
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        {/* Close */}
        <button onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="size-3.5" />
        </button>
      </div>

      {/* ── messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50/50 min-h-0">

        {/* welcome + quick chips */}
        {msgs.length === 0 && (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <img src="/Logo.png" alt="" className="size-6 rounded-md object-contain shrink-0 mt-0.5" />
              <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 border border-gray-200 shadow-sm flex-1">
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  Hello! I have live access to all sensor nodes and KML site data.
                  How can I assist you?
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pl-8">
              {QUICK.map(q => (
                <button key={q.t} onClick={() => send(q.t)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50/50 transition-all text-left">
                  <span className="text-xs shrink-0">{q.e}</span>
                  <span className="text-[10px] font-medium text-gray-600 leading-tight">{q.t}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* messages */}
        {msgs.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <img src="/Logo.png" alt="" className="size-6 rounded-md object-contain shrink-0 mt-0.5" />
            )}

            <div className={`max-w-[82%] px-3 py-2 rounded-xl text-[11px] leading-relaxed shadow-sm ${
              msg.role === "user"
                ? "bg-green-600 text-white rounded-br-none"
                : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
            }`}>
              {msg.loading ? (
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="size-2.5 animate-spin text-green-600" />
                  <span className="text-[10px] text-gray-500">Thinking…</span>
                  {[0,1,2].map(i => (
                    <span key={i} className="size-1 rounded-full bg-green-400 animate-bounce"
                      style={{ animationDelay: `${i * 130}ms` }} />
                  ))}
                </div>
              ) : msg.role === "user" ? (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              ) : (
                <Md text={msg.content} />
              )}
            </div>

            {msg.role === "user" && (
              <div className="size-6 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                <User className="size-3 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {msgs.length > 3 && (
          <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-gray-600 mx-auto transition-colors">
            <ChevronDown className="size-3" /> latest
          </button>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── input ── */}
      <div className="px-3 py-2.5 border-t border-gray-100 bg-white shrink-0">
        <div className="flex gap-2 items-end bg-gray-50 rounded-xl border border-gray-200 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all px-3 py-2">
          <textarea
            ref={taRef}
            value={input}
            rows={1}
            disabled={busy}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask about sensors, risk zones…"
            className="flex-1 bg-transparent text-[11px] text-gray-800 placeholder-gray-400 resize-none outline-none leading-5 py-0 disabled:opacity-60"
            style={{ minHeight: 20, maxHeight: 80, overflowY: "auto" }}
          />
          {busy ? (
            <button onClick={() => { abortRef.current?.abort(); setBusy(false); }}
              className="size-6 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shrink-0">
              <span className="size-2 rounded-sm bg-white inline-block" />
            </button>
          ) : (
            <button onClick={() => send(input)} disabled={!input.trim()}
              className="size-6 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0">
              <Send className="size-3 text-white" />
            </button>
          )}
        </div>
        <p className="text-[8.5px] text-gray-400 text-center mt-1 leading-tight">
          Advisory only — verify safety-critical decisions
        </p>
      </div>
    </div>
  );
}

/* ── Floating button + portal ───────────────────────────────────────────────── */
export function FloatingAIChat() {
  const [open, setOpen] = useState(false);

  const { data: kpi }    = useLiveKpi();
  const { data: health } = useSensorHealth();

  const kpiSummary = useMemo(() =>
    `LIVE: ${kpi.activeNodes}/${kpi.deployedNodes} nodes | health ${kpi.networkHealth}% | latency ${kpi.avgLatencyMs}ms | faults ${health.fault} | offline ${health.offline}`,
    [kpi, health]
  );

  const portal = typeof document !== "undefined" ? document.body : null;

  return (
    <>
      {/* Chat card via portal — escapes overflow:hidden */}
      {open && portal && createPortal(
        <ChatCard onClose={() => setOpen(false)} kpiSummary={kpiSummary} />,
        portal
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="BHURAKSHAK AI"
        aria-label="Open BHURAKSHAK AI chat"
        className="fixed z-[9998] size-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 overflow-hidden bg-white"
        style={{
          bottom: "calc(4rem + 0.5rem)",   /* sits just above the bottom nav on mobile */
          right: "1rem",
          boxShadow: open
            ? "0 8px 32px rgba(22,163,74,0.45), 0 0 0 3px rgba(22,163,74,0.20)"
            : "0 8px 28px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10), 0 0 0 3px rgba(255,255,255,0.90)",
        }}
      >
        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none bg-green-500" />
        )}

        {open ? (
          /* X icon when open */
          <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="size-4 text-gray-600" />
          </div>
        ) : (
          /* Logo when closed — fills the circle */
          <img
            src="/Logo.png"
            alt="BHURAKSHAK AI"
            className="size-full object-contain p-1.5"
          />
        )}

        {/* Online indicator dot */}
        {!open && (
          <span className="absolute top-0.5 right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse pointer-events-none" />
        )}
      </button>
    </>
  );
}
