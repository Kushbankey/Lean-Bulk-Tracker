import { PHASE_CONFIG } from "../data";

export default function Roadmap({ ctx }) {
  const { week, phase } = ctx;

  const weeklyRoutine = [
    { day: "MON", action: "Official weigh-in (morning, fasted)", icon: "\u2696\ufe0f" },
    { day: "Daily", action: "Log weight + calories in this app", icon: "\ud83d\udccb" },
    { day: "Every 4W", action: "Reassess \u2014 adjust calories \u00b1100\u2013150 kcal", icon: "\ud83d\udd04" },
    { day: "Every 4W", action: "Check gym progressive overload", icon: "\ud83d\udcaa" },
    { day: "Sunday", action: "Batch-cook dal + rice for 3 days", icon: "\ud83c\udf5b" },
  ];

  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", marginBottom: 14, textTransform: "uppercase" }}>32-Week Roadmap</div>

      {/* Visual Timeline */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, padding: "0 4px" }}>
        {Array.from({ length: 32 }, (_, i) => i + 1).map((w) => {
          const p = PHASE_CONFIG.find((p) => w >= p.weeks[0] && w <= p.weeks[1]) || PHASE_CONFIG[2];
          return (
            <div key={w} style={{ flex: 1, height: w === week ? 20 : 12, background: w <= week ? p.color : `${p.color}22`, borderRadius: 2, transition: "all 0.3s", position: "relative" }}>
              {w === week && (
                <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: p.color, fontWeight: 700, whiteSpace: "nowrap" }}>
                  W{w}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Phase Cards */}
      {PHASE_CONFIG.map((p) => {
        const isActive = week >= p.weeks[0] && week <= p.weeks[1];
        const isComplete = week > p.weeks[1];
        const phaseWeeks = p.weeks[1] - p.weeks[0] + 1;
        const weeksDone = isComplete ? phaseWeeks : isActive ? week - p.weeks[0] : 0;
        const phasePct = (weeksDone / phaseWeeks) * 100;

        return (
          <div key={p.phase} style={{ background: isActive ? `${p.color}10` : "#0f1923", border: `1px solid ${isActive ? p.color + "44" : "#1a2535"}`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, color: p.color, fontWeight: 700 }}>
                  Phase {p.phase} \u2014 {p.label}
                </div>
                <div style={{ fontSize: 10, color: "#4a6080", marginTop: 2 }}>
                  Weeks {p.weeks[0]}\u2013{p.weeks[1]}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, color: "#e8edf2", fontWeight: 700 }}>{p.calories} kcal</div>
                <div style={{ fontSize: 10, color: "#4a6080" }}>{p.protein}g protein</div>
                {isActive && <div style={{ fontSize: 9, color: p.color, marginTop: 2, fontWeight: 700 }}>\u2190 YOU ARE HERE</div>}
                {isComplete && <div style={{ fontSize: 9, color: "#4ade80", marginTop: 2 }}>\u2713 Complete</div>}
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#6a8099", marginBottom: 10 }}>{p.desc}</div>
            <div style={{ height: 4, background: "#080c10", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, background: p.color, width: `${phasePct}%`, transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: 9, color: "#4a6080", marginTop: 4, textAlign: "right" }}>
              {weeksDone}/{phaseWeeks} weeks
            </div>
          </div>
        );
      })}

      {/* Weekly Routine */}
      <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: 16, marginTop: 6 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", marginBottom: 14, textTransform: "uppercase" }}>Weekly Routine</div>
        {weeklyRoutine.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < weeklyRoutine.length - 1 ? "1px solid #1a2535" : "none", alignItems: "center" }}>
            <div style={{ fontSize: 18 }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, color: phase.color, fontWeight: 700 }}>{r.day} </span>
              <span style={{ fontSize: 12, color: "#c8d8e8" }}>{r.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
