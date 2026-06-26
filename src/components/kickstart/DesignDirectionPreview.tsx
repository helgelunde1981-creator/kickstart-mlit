interface PreviewProps { id: string; selected: boolean }

export default function DesignDirectionPreview({ id, selected }: PreviewProps) {
  const base: React.CSSProperties = {
    width: "100%", height: "96px", borderRadius: "6px", overflow: "hidden",
    position: "relative", flexShrink: 0,
    border: selected ? "2px solid #2563eb" : "2px solid transparent",
    transition: "border-color 0.15s",
  };

  if (id === "01-dark-luxury-motion") return (
    <div style={{ ...base, background: "#080808", display: "flex", flexDirection: "column", padding: "12px 14px", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "Georgia,serif", fontSize: "9px", letterSpacing: "0.25em", color: "#C9A96E", textTransform: "uppercase" }}>MAISON · ÉLITE</span>
      <div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "22px", lineHeight: 1.1, color: "#F5EDD6", fontWeight: 400 }}>Luxury<br/>Redefined</div>
        <div style={{ width: "32px", height: "1px", background: "#C9A96E", margin: "8px 0 6px" }} />
        <span style={{ fontSize: "8px", letterSpacing: "0.18em", color: "#C9A96E", textTransform: "uppercase" }}>Explore ↗</span>
      </div>
    </div>
  );

  if (id === "02-editorial-bento") return (
    <div style={{ ...base, background: "#EEEEE8", padding: "6px", display: "grid", gridTemplateColumns: "3fr 2fr", gridTemplateRows: "1fr 1fr", gap: "4px" }}>
      <div style={{ background: "#111", color: "#fff", padding: "6px 8px", gridColumn: "span 2", display: "flex", alignItems: "flex-end" }}>
        <span style={{ fontFamily: "Arial Black,sans-serif", fontSize: "18px", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em" }}>EDITORIAL</span>
      </div>
      <div style={{ background: "#fff", padding: "6px", fontSize: "8px", color: "#555", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: "9px", color: "#111" }}>Feature Story</span>
        <span style={{ color: "#999" }}>2 min read</span>
      </div>
      <div style={{ background: "#3B82F6", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: "20px", fontWeight: 900 }}>→</span>
      </div>
    </div>
  );

  if (id === "03-swiss-minimal-refined") return (
    <div style={{ ...base, background: "#FFFFFF", padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "8px", height: "8px", background: "#E52222", borderRadius: "50%" }} />
        <span style={{ fontFamily: "Helvetica,Arial,sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", color: "#111", textTransform: "uppercase" }}>Studio</span>
      </div>
      <div>
        <div style={{ width: "100%", height: "1px", background: "#E52222", marginBottom: "8px" }} />
        <div style={{ fontFamily: "Helvetica,Arial,sans-serif", fontSize: "20px", fontWeight: 700, color: "#111", lineHeight: 1.1, letterSpacing: "-0.03em" }}>Precision<br/>Design</div>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        {["#111","#E52222","#fff"].map((c,i) => (
          <div key={i} style={{ width: "14px", height: "14px", background: c, border: "1px solid #ddd" }} />
        ))}
      </div>
    </div>
  );

  if (id === "04-brutalism-refined") return (
    <div style={{ ...base, background: "#F5F52A", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", border: selected ? "2px solid #2563eb" : "2px solid #111" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Arial Black,sans-serif", fontSize: "11px", fontWeight: 900, color: "#111", textTransform: "uppercase" }}>BRUTAL</span>
        <div style={{ width: "18px", height: "18px", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#F5F52A", fontSize: "10px", fontWeight: 900 }}>×</span>
        </div>
      </div>
      <div style={{ fontFamily: "Arial Black,sans-serif", fontSize: "24px", fontWeight: 900, color: "#111", lineHeight: 1, letterSpacing: "-0.03em", textTransform: "uppercase" }}>RAW<br/>POWER</div>
      <div style={{ height: "3px", background: "#111" }} />
    </div>
  );

  if (id === "05-glassmorphism-depth") return (
    <div style={{ ...base, background: "linear-gradient(135deg,#7C3AED 0%,#2563EB 50%,#06B6D4 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", padding: "10px 16px", textAlign: "center" }}>
        <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>Dashboard</div>
        <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "16px", fontWeight: 700, color: "#fff" }}>Glass UI</div>
        <div style={{ marginTop: "6px", display: "flex", gap: "4px", justifyContent: "center" }}>
          {[0.4,0.6,0.8].map((o,i) => (
            <div key={i} style={{ width: "20px", height: "4px", background: `rgba(255,255,255,${o})`, borderRadius: "2px" }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (id === "06-retro-futurism") return (
    <div style={{ ...base, background: "#04050F", padding: "10px 12px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(0,255,180,0.03) 8px,rgba(0,255,180,0.03) 9px),repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(0,255,180,0.03) 8px,rgba(0,255,180,0.03) 9px)" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#00FFB4", letterSpacing: "0.15em", marginBottom: "6px" }}>SYS_2049 ▶ INIT</div>
        <div style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: 700, color: "#00FFB4", textShadow: "0 0 10px #00FFB4", lineHeight: 1.1, letterSpacing: "0.05em" }}>RETRO<br/>FUTURE</div>
        <div style={{ marginTop: "8px", display: "flex", gap: "3px" }}>
          {[1,1,0.5,0.3].map((o,i) => (
            <div key={i} style={{ height: "3px", flex: 1, background: `rgba(0,255,180,${o})`, borderRadius: "1px" }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (id === "07-scrollytelling-editorial") return (
    <div style={{ ...base, background: "#FAFAF8", padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ width: "3px", height: "14px", background: "#111" }} />
        <span style={{ fontFamily: "Georgia,serif", fontSize: "9px", color: "#555", fontStyle: "italic" }}>Chapter 01</span>
      </div>
      <div style={{ fontFamily: "Georgia,serif", fontSize: "18px", color: "#111", lineHeight: 1.25 }}>The Story<br/>Unfolds</div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ flex: 1, height: "1px", background: "#ddd" }} />
        <span style={{ fontSize: "10px", color: "#999" }}>↓ scroll</span>
        <div style={{ flex: 1, height: "1px", background: "#ddd" }} />
      </div>
    </div>
  );

  if (id === "08-3d-integration") return (
    <div style={{ ...base, background: "linear-gradient(135deg,#0F172A 0%,#1E293B 100%)", display: "flex", alignItems: "center", justifyContent: "center", perspective: "200px" }}>
      <div style={{ transform: "rotateY(-15deg) rotateX(8deg)", background: "linear-gradient(135deg,#334155,#1e293b)", border: "1px solid rgba(99,102,241,0.5)", borderRadius: "8px", padding: "10px 16px", boxShadow: "8px 8px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: "8px", color: "#818CF8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>3D Interface</div>
        <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "18px", fontWeight: 700, color: "#E2E8F0" }}>Depth First</div>
        <div style={{ marginTop: "6px", width: "100%", height: "2px", background: "linear-gradient(90deg,#6366F1,transparent)" }} />
      </div>
    </div>
  );

  if (id === "09-industrial-robust") return (
    <div style={{ ...base, background: "#1A1A1A", padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ width: "8px", height: "8px", background: "#F97316", transform: "rotate(45deg)" }} />
        <span style={{ fontFamily: "Arial,sans-serif", fontSize: "9px", fontWeight: 700, color: "#F97316", textTransform: "uppercase", letterSpacing: "0.1em" }}>Industrial</span>
      </div>
      <div style={{ fontFamily: "Arial Black,sans-serif", fontSize: "22px", fontWeight: 900, color: "#F5F5F5", lineHeight: 1, textTransform: "uppercase", letterSpacing: "-0.02em" }}>BUILT<br/>TOUGH</div>
      <div style={{ display: "flex", gap: "2px" }}>
        {Array.from({length: 8}).map((_,i) => (
          <div key={i} style={{ flex: 1, height: "4px", background: i < 6 ? "#F97316" : "#333" }} />
        ))}
      </div>
    </div>
  );

  return <div style={{ ...base, background: "#f3f4f6" }} />;
}
