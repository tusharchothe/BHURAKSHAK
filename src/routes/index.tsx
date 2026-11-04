import { createFileRoute, Link } from "@tanstack/react-router";
import ImmersiveFullscreenNavDemo from "@/components/landing/ImmersiveFullscreenNavDemo";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CircleDollarSign,
  Crosshair,
  GitCompareArrows,
  HeartPulse,
  Map,
  Mountain,
  Radar,
  Satellite,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { motion } from "framer-motion";
import { Hero } from "@/components/ui/animated-hero";
import { AboutBento } from "@/components/ui/about-bento";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BhuRakshak — AI-Enabled Mine Subsidence Monitoring & Early Warning" },
      {
        name: "description",
        content:
          "AI-enabled, low-cost surface sensor network for continuous mine deformation monitoring, risk assessment and early warning in underground coal mines. SIH26025, Ministry of Coal.",
      },
    ],
  }),
  component: Landing,
});

/* ------------------------------ content ------------------------------ */

const workflow = [
  {
    step: "01",
    title: "SENSE",
    icon: Radar,
    text: "Distributed surface nodes observe ground behaviour above active workings.",
  },
  {
    step: "02",
    title: "VALIDATE",
    icon: HeartPulse,
    text: "Check sensor health and data quality before any reading is trusted.",
  },
  {
    step: "03",
    title: "CORRELATE",
    icon: GitCompareArrows,
    text: "Compare neighbouring sensors and temporal trends to separate signal from noise.",
  },
  {
    step: "04",
    title: "ASSESS",
    icon: Activity,
    text: "Generate zone-wise risk intelligence with confidence and contributing drivers.",
  },
  {
    step: "05",
    title: "WARN",
    icon: ShieldAlert,
    text: "Provide evidence-based alerts that carry the signals behind them.",
  },
];

const whyCards = [
  { title: "REAL-TIME", icon: Satellite, text: "Continuous surface monitoring over active panels." },
  { title: "LOW-COST", icon: CircleDollarSign, text: "Distributed low-cost sensing, deployable at mine scale." },
  { title: "AI-ENABLED", icon: BrainCircuit, text: "Anomaly and trend analysis on every incoming stream." },
  { title: "SPATIAL", icon: Crosshair, text: "Neighbouring sensor corroboration before risk is raised." },
  { title: "OFFLINE-RESILIENT", icon: WifiOff, text: "Local buffering and edge intelligence when links drop." },
  { title: "GIS-BASED", icon: Map, text: "Location-specific risk visualisation over panel geometry." },
];

const roleViews = [
  {
    title: "MINE OPERATOR",
    tagline: "ACT NOW",
    text: "Live ground conditions, active alerts and immediate response actions for the shift in charge.",
    route: "/operator" as const,
    color: "border-critical/30 hover:border-critical",
    tagColor: "text-critical bg-critical/10",
  },
  {
    title: "MINE PLANNER",
    tagline: "PLAN AHEAD",
    text: "Deformation trends and predicted subsidence behaviour to sequence extraction responsibly.",
    route: "/planner" as const,
    color: "border-primary/30 hover:border-primary",
    tagColor: "text-primary bg-primary/10",
  },
  {
    title: "REGULATOR",
    tagline: "OVERSEE",
    text: "Evidence trails behind every alert and a cross-mine portfolio view of monitoring posture.",
    route: "/regulator" as const,
    color: "border-purple-500/30 hover:border-purple-500",
    tagColor: "text-purple-400 bg-purple-500/10",
  },
];

const chain = [
  "SURFACE SENSOR NETWORK",
  "WIRELESS NETWORK",
  "EDGE GATEWAY",
  "AI + RISK ENGINE",
  "GIS",
  "EARLY WARNING",
  "THREE DECISION VIEWS",
];

/* ------------------------------ page ------------------------------ */

function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      <ImmersiveFullscreenNavDemo />

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden border-b bg-card min-h-[600px] flex items-center">
        {/* Background Image & Overlays */}
        <div 
          className="absolute inset-0 z-0" 
          style={{
            backgroundImage: "url('/image.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 z-0 bg-background/50 backdrop-blur-[2px]"></div>
        
        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 relative z-10 w-full flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-[1.15] tracking-tight lg:text-6xl text-foreground text-shadow-sm">
              Making Underground Coal Mining <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 drop-shadow-sm">Safer</span> Through Real-Time Ground Intelligence
            </h1>
            
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-2 sm:px-0">
              <Link
                to="/system"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-1 hover:shadow-primary/40"
              >
                Proceed to System
                <ArrowRight className="size-5 shrink-0" aria-hidden />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Animated Hero ===== */}
      <section className="border-b bg-background">
        <Hero />
      </section>

      {/* ===== Section 4: three decision views ===== */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold sm:text-4xl tracking-tight">
              ONE INTELLIGENCE LAYER. THREE DECISION VIEWS.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              BhuRakshak provides tailored interfaces for the shift operator, the long-term planner, and the institutional regulator.
            </p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-3">
            {roleViews.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={role.route}
                  className={`group flex flex-col h-full rounded-xl border bg-background p-8 transition-all hover:shadow-xl ${role.color}`}
                >
                  <p className={`inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest w-fit mb-4 ${role.tagColor}`}>
                    {role.tagline}
                  </p>
                  <h3 className="font-display text-2xl font-bold tracking-tight">{role.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {role.text}
                  </p>
                  <span className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors group-hover:text-foreground">
                    Launch Dashboard
                    <ArrowRight className="size-4 transform group-hover:translate-x-1 transition-transform" aria-hidden />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== About Bento ===== */}
      <AboutBento />

      {/* ===== Section 2: workflow ===== */}
      <section id="how-it-works" className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">System Workflow</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">FIVE STEPS FROM SIGNAL TO WARNING</h2>
          
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {workflow.map((step, i) => (
              <motion.div 
                key={step.step} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col bg-card border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
              >
                <div className="absolute -right-4 -top-4 text-8xl font-black text-muted/20 group-hover:text-primary/5 transition-colors">
                  {step.step}
                </div>
                <step.icon className="size-8 text-primary mb-6" aria-hidden />
                <h3 className="font-display text-lg font-bold tracking-tight mb-2 relative z-10">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground relative z-10">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-card border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="flex size-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <Mountain className="size-4" aria-hidden />
            </span>
            <span className="font-display text-lg font-bold tracking-widest uppercase">BHURAKSHAK</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            AI-Enabled Mine Subsidence Monitoring &amp; Early Warning System.<br/>
            Smart India Hackathon 2026 · SIH26025
          </p>
          <p className="mt-8 inline-block rounded border bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Prototype / Demonstration Environment
          </p>
        </div>
      </footer>
    </div>
  );
}
