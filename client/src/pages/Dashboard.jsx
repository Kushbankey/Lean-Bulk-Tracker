import { MEAL_PLAN, getTodayKey } from "../data";

export default function Dashboard({ ctx, onQuickLog }) {
  const { phase, todayQuote, stats, logs, latestWeight, gained, remaining, calorieTarget } = ctx;
  const todayLog = logs.find((l) => l.date === getTodayKey());
  const mealsChecked = todayLog ? JSON.parse(todayLog.mealsChecked || "[]") : [false, false, false, false];

  return (
    <div>
      {/* Motivational Quote */}
      <div style={{ background: "#0f1923", border: `1px solid ${phase.color}22`, borderLeft: `3px solid ${phase.color}`, borderRadius: 8, padding: "14px 16px", marginBottom: 16 }} className="fade-in">
        <div style={{ fontSize: 9, color: phase.color, letterSpacing: 3, marginBottom: 6, textTransform: "uppercase" }}>Daily Motivation</div>
        <div style={{ fontSize: 12, color: "#c8d8e8", lineHeight: 1.6, fontStyle: "italic" }}>"{todayQuote}"</div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Current", value: `${latestWeight}kg`, color: phase.color },
          { label: "Gained", value: `+${gained}kg`, color: "#4ade80" },
          { label: "Streak", value: `${stats?.streak || 0}d`, color: "#f59e0b" },
          { label: "Logged", value: `${stats?.totalLogged || 0}`, color: "#60a5fa" },
        ].map((s, i) => (
          <div key={i} className="fade-in" style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: "14px 16px", animationDelay: `${i * 0.05}s` }}>
            <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Today's Target */}
      <div style={{ background: "#0f1923", border: `1px solid ${phase.color}33`, borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Today's Target</div>
          <div><span style={{ fontSize: 20, fontWeight: 700, color: phase.color }}>{calorieTarget}</span><span style={{ fontSize: 11, color: "#4a6080" }}> kcal</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          {todayLog?.calories ? (
            <>
              <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Logged</div>
              <div><span style={{ fontSize: 20, fontWeight: 700, color: todayLog.calories >= calorieTarget ? "#4ade80" : "#f59e0b" }}>{todayLog.calories}</span><span style={{ fontSize: 11, color: "#4a6080" }}> kcal</span></div>
            </>
          ) : (
            <button onClick={onQuickLog} style={{ background: `${phase.color}22`, border: `1px solid ${phase.color}`, borderRadius: 6, padding: "8px 16px", color: phase.color, cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>
              Log Now
            </button>
          )}
        </div>
      </div>

      {/* Meal Progress */}
      <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 2, textTransform: "uppercase" }}>Meals Today</div>
          <div style={{ fontSize: 11, color: phase.color, fontWeight: 600 }}>{mealsChecked.filter(Boolean).length}/4</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {MEAL_PLAN.map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ width: "100%", height: 4, background: mealsChecked[i] ? phase.color : "#1a2535", borderRadius: 2, marginBottom: 6, transition: "background 0.3s" }} />
              <div style={{ fontSize: 16 }}>{m.emoji}</div>
              <div style={{ fontSize: 8, color: mealsChecked[i] ? phase.color : "#4a6080", marginTop: 2 }}>{m.kcal}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      {stats?.milestones && (
        <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Milestones</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "First 1kg", done: stats.milestones.first1kg, icon: "\ud83c\udf1f" },
              { label: "5kg Gained", done: stats.milestones.first5kg, icon: "\ud83d\udcaa" },
              { label: "Halfway", done: stats.milestones.halfway, icon: "\ud83c\udfc6" },
              { label: "Goal!", done: stats.milestones.goalReached, icon: "\ud83d\ude80" },
            ].map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: m.done ? `${phase.color}11` : "#080c10", border: `1px solid ${m.done ? phase.color + "33" : "#1a2535"}`, borderRadius: 6 }}>
                <span style={{ fontSize: 18, filter: m.done ? "none" : "grayscale(1) opacity(0.3)" }}>{m.icon}</span>
                <span style={{ fontSize: 11, color: m.done ? phase.color : "#4a6080" }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
