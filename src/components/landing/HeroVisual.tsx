/**
 * HeroVisual — schematic cross-section of the BhuRakshak monitoring chain.
 * Underground coal panels → surface sensor nodes → wireless links →
 * edge gateway → AI + GIS platform. Pure SVG, subtle motion, no imagery.
 */
export function HeroVisual() {
  const nodes = [
    { x: 86, label: "N-01" },
    { x: 216, label: "N-02" },
    { x: 346, label: "N-03" },
    { x: 476, label: "N-04" },
  ];
  const gateway = { x: 290, y: 96 };
  const surfaceY = 196;

  return (
    <svg
      viewBox="0 0 580 430"
      role="img"
      aria-label="Schematic: underground coal panels, surface sensor nodes, wireless network, edge gateway and AI plus GIS platform"
      className="h-auto w-full"
    >
      {/* faint survey grid */}
      <g className="stroke-navy-foreground/10" strokeWidth="1">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={i * 58} y1="0" x2={i * 58} y2="430" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 58 + 10} x2="580" y2={i * 58 + 10} />
        ))}
      </g>

      {/* ===== AI + GIS platform ===== */}
      <g>
        <rect
          x="356"
          y="18"
          width="206"
          height="58"
          rx="3"
          className="fill-navy-foreground/5 stroke-saffron/70"
          strokeWidth="1.2"
        />
        <text x="370" y="38" className="fill-navy-foreground text-[10px] font-semibold tracking-[0.18em]">
          AI + GIS PLATFORM
        </text>
        <text x="370" y="52" className="fill-navy-foreground/55 font-mono text-[8px] tracking-[0.08em]">
          RISK ENGINE · SPATIAL LAYERS
        </text>
        {/* tiny risk bars */}
        <g className="fill-saffron/80">
          <rect x="512" y="34" width="6" height="14" />
          <rect x="522" y="28" width="6" height="20" className="fill-caution/80" />
          <rect x="532" y="40" width="6" height="8" className="fill-safe/80" />
          <rect x="542" y="30" width="6" height="18" className="fill-warning/80" />
        </g>
        <circle cx="552" cy="26" r="2.4" className="fill-safe soft-blink" />
      </g>

      {/* uplink gateway → platform */}
      <path
        d={`M ${gateway.x + 26} ${gateway.y - 14} C 380 60, 420 52, 452 48`}
        fill="none"
        className="stroke-saffron/80 dash-flow"
        strokeWidth="1.4"
        strokeDasharray="5 7"
      />

      {/* ===== edge gateway ===== */}
      <g>
        <rect
          x={gateway.x - 58}
          y={gateway.y - 14}
          width="116"
          height="34"
          rx="3"
          className="fill-navy-foreground/8 stroke-navy-foreground/50"
          strokeWidth="1.2"
        />
        <text
          x={gateway.x}
          y={gateway.y + 2}
          textAnchor="middle"
          className="fill-navy-foreground text-[9px] font-semibold tracking-[0.2em]"
        >
          EDGE GATEWAY
        </text>
        <text
          x={gateway.x}
          y={gateway.y + 13}
          textAnchor="middle"
          className="fill-navy-foreground/55 font-mono text-[7.5px] tracking-[0.06em]"
        >
          BUFFER · SCREEN · RELAY
        </text>
        <circle cx={gateway.x - 48} cy={gateway.y + 3} r="2.4" className="fill-safe soft-blink" />
      </g>

      {/* ===== wireless links node → gateway ===== */}
      {nodes.map((n, i) => (
        <path
          key={`link-${n.label}`}
          d={`M ${n.x} ${surfaceY - 34} Q ${(n.x + gateway.x) / 2} ${surfaceY - 96 - i * 4}, ${gateway.x} ${gateway.y + 20}`}
          fill="none"
          className="stroke-navy-foreground/45 dash-flow"
          strokeWidth="1.1"
          strokeDasharray="4 6"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* ===== ground surface ===== */}
      <line x1="14" y1={surfaceY} x2="566" y2={surfaceY} className="stroke-navy-foreground/70" strokeWidth="1.6" />
      {/* surface hatching */}
      <g className="stroke-navy-foreground/30" strokeWidth="1">
        {Array.from({ length: 28 }, (_, i) => (
          <line key={`hatch${i}`} x1={20 + i * 20} y1={surfaceY} x2={12 + i * 20} y2={surfaceY + 8} />
        ))}
      </g>
      <text x="20" y={surfaceY - 44} className="fill-navy-foreground/55 font-mono text-[8px] tracking-[0.14em]">
        GROUND SURFACE
      </text>

      {/* ===== sensor nodes ===== */}
      {nodes.map((n, i) => (
        <g key={n.label}>
          <circle
            cx={n.x}
            cy={surfaceY - 34}
            r="7"
            fill="none"
            className="stroke-saffron ping-ring"
            strokeWidth="1.2"
            style={{ animationDelay: `${i * 0.7}s` }}
          />
          {/* mast */}
          <line x1={n.x} y1={surfaceY} x2={n.x} y2={surfaceY - 28} className="stroke-navy-foreground/80" strokeWidth="1.6" />
          <line x1={n.x - 7} y1={surfaceY} x2={n.x} y2={surfaceY - 16} className="stroke-navy-foreground/50" strokeWidth="1" />
          <line x1={n.x + 7} y1={surfaceY} x2={n.x} y2={surfaceY - 16} className="stroke-navy-foreground/50" strokeWidth="1" />
          <circle cx={n.x} cy={surfaceY - 34} r="3.4" className="fill-saffron" />
          <text
            x={n.x}
            y={surfaceY + 22}
            textAnchor="middle"
            className="fill-navy-foreground/70 font-mono text-[8px] tracking-[0.1em]"
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* ===== subsurface strata ===== */}
      <g fill="none" className="stroke-navy-foreground/25" strokeWidth="1">
        <path d="M14 246 C 120 238, 200 254, 300 246 S 480 238, 566 248" />
        <path d="M14 286 C 110 294, 230 278, 330 288 S 500 296, 566 284" />
      </g>
      <text x="20" y="240" className="fill-navy-foreground/40 font-mono text-[8px] tracking-[0.14em]">
        OVERBURDEN STRATA
      </text>

      {/* deformation signal rising from panel to surface */}
      <g className="stroke-warning/70" strokeWidth="1.1" strokeDasharray="3 6">
        <line x1="216" y1="330" x2="216" y2={surfaceY + 6} className="dash-flow" />
        <line x1="346" y1="330" x2="346" y2={surfaceY + 6} className="dash-flow" style={{ animationDelay: "0.6s" }} />
      </g>

      {/* ===== coal seam with bord-and-pillar panels ===== */}
      <g>
        <rect x="14" y="330" width="552" height="72" rx="2" className="fill-charcoal/90" />
        {/* pillars: dark blocks with galleries between */}
        <g className="fill-navy-foreground/12">
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={`pillar${i}`} x={30 + i * 60} y="342" width="34" height="48" rx="1" />
          ))}
        </g>
        <text x="20" y="326" className="fill-navy-foreground/55 font-mono text-[8px] tracking-[0.14em]">
          UNDERGROUND COAL PANELS · BORD &amp; PILLAR
        </text>
        <text x="566" y="396" textAnchor="end" className="fill-navy-foreground/35 font-mono text-[7.5px]">
          SCHEMATIC — NOT TO SCALE
        </text>
      </g>
    </svg>
  );
}
