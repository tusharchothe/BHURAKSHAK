import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HardHat,
  BarChart3,
  Database,
  ArrowLeft,
  Mountain,
  Activity,
  Radar,
  ShieldAlert,
  Map,
  Clock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [
      { title: "System Home — BHURAKSHAK" },
      {
        name: "description",
        content: "Select the perspective you want to explore.",
      },
    ],
  }),
  component: SystemPage,
});

const roles = [
  {
    id: "operator",
    title: "MINE OPERATOR",
    tagline: "ACT NOW",
    purpose: "Real-time mine safety monitoring and operational response.",
    answers: [
      "What is happening now?",
      "Where is the risk?",
      "What requires attention?",
    ],
    buttonText: "Launch Operator Dashboard",
    route: "/operator",
    icon: HardHat,
    color: "border-critical/30 hover:border-critical",
    tagColor: "text-critical bg-critical/10",
  },
  {
    id: "planner",
    title: "MINE PLANNER",
    tagline: "PLAN AHEAD",
    purpose: "Mine planning, monitoring coverage and long-term ground-risk intelligence.",
    answers: [
      "How is ground behaviour changing?",
      "Which areas require closer monitoring?",
      "How should monitoring plans adapt?",
    ],
    buttonText: "Launch Planner Dashboard",
    route: "/planner",
    icon: BarChart3,
    color: "border-primary/30 hover:border-primary",
    tagColor: "text-primary bg-primary/10",
  },
  {
    id: "regulator",
    title: "REGULATOR",
    tagline: "OVERSEE",
    purpose: "Multi-mine safety oversight and evidence-based review.",
    answers: [
      "Which mines require attention?",
      "Are monitoring systems functioning?",
      "What alerts or unresolved issues require review?",
    ],
    buttonText: "Launch Regulator Dashboard",
    route: "/regulator",
    icon: Database,
    color: "border-purple-500/30 hover:border-purple-500",
    tagColor: "text-purple-400 bg-purple-500/10",
  }
];

const statusItems = [
  { label: "SYSTEM STATUS", value: "Operational", icon: CheckCircle2, color: "text-safe" },
  { label: "SURFACE NODES", value: "128", icon: Radar, suffix: "DEMO" },
  { label: "ACTIVE WARNINGS", value: "03", icon: ShieldAlert, color: "text-warning", suffix: "DEMO" },
  { label: "HIGH-RISK ZONES", value: "01", icon: Activity, color: "text-critical", suffix: "DEMO" },
  { label: "MINES MONITORED", value: "08", icon: Map, suffix: "DEMO" },
  { label: "LAST DATA SYNC", value: "12 sec ago", icon: Clock, suffix: "DEMO" },
];

function SystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden flex flex-col selection:bg-primary/20 selection:text-primary">
      
      {/* ===== Government-style header ===== */}
      <header className="border-b bg-card text-card-foreground shadow-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Government of India</p>
            <p className="text-xs font-bold uppercase tracking-widest">
              Ministry of Coal
            </p>
          </div>
          <Link to="/" className="flex items-center gap-3 justify-center group">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md group-hover:bg-primary/90 transition-colors">
              <Mountain className="size-5" aria-hidden />
            </span>
            <span className="font-display text-lg font-bold tracking-[0.2em] uppercase hidden sm:block">BHURAKSHAK</span>
          </Link>
          <div className="text-right">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Back to Landing Page</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-16 sm:px-6 relative z-10">
        
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary mb-6">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
            </span>
            PROTOTYPE / DEMONSTRATION ENVIRONMENT
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground uppercase mt-2">
            ONE INTELLIGENCE PLATFORM. <br/>
            <span className="text-muted-foreground">THREE DECISION VIEWS.</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            Select the perspective you want to explore. Each workspace surfaces the same validated sensor network through a tailored information hierarchy.
          </p>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-20">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className={`group flex flex-col h-full rounded-xl border bg-card p-8 transition-all hover:shadow-xl ${role.color}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className={`flex size-14 items-center justify-center rounded-xl border ${role.color} ${role.tagColor}`}>
                    <role.icon className="size-6" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${role.tagColor}`}>
                    {role.tagline}
                  </span>
                </div>

                <h2 className="text-2xl font-display font-bold text-foreground tracking-tight uppercase mb-4">{role.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground mb-8 border-b pb-8">
                  {role.purpose}
                </p>

                <div className="flex-1 mt-auto">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Key Questions Answered:</p>
                  <ul className="space-y-4 mb-10">
                    {role.answers.map((answer, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-medium text-foreground/80">
                        <div className="mt-2 size-1.5 rounded-full bg-primary/40 shrink-0" />
                        <span className="leading-snug">{answer}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  to={role.route}
                  className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-foreground"
                >
                  {role.buttonText}
                  <ArrowRight className="size-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Status Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl border bg-card p-6 shadow-sm overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 divide-x divide-border/50">
            {statusItems.map((item, idx) => (
              <div key={idx} className={`px-4 ${idx === 0 ? "pl-0" : ""} flex flex-col justify-center`}>
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`size-4 ${item.color || "text-muted-foreground"}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold font-mono tracking-tight ${item.color || "text-foreground"}`}>{item.value}</span>
                  {item.suffix && (
                    <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {item.suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t py-12 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <p>Ministry of Coal / Coal India Limited</p>
        </div>
      </footer>
    </div>
  );
}
