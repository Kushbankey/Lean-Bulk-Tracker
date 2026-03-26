import { useState } from "react";
import { MEAL_PLAN, GF_SAFETY, BATCH_TIPS } from "../data";

export default function MealPlan({ ctx }) {
  const { phase, calorieTarget } = ctx;
  const [expanded, setExpanded] = useState(null);

  const totalKcal = MEAL_PLAN.reduce((s, m) => s + m.kcal, 0);
  const totalProtein = MEAL_PLAN.reduce((s, m) => s + m.protein, 0);

  return (
    <div>
      {/* Phase Target */}
      <div style={{ background: "#0f1923", border: `1px solid ${phase.color}33`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Daily Target — Phase {phase.phase}</div>
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <span style={{ fontSize: 22, fontWeight: 700, color: phase.color }}>{calorieTarget}</span>
            <span style={{ fontSize: 11, color: "#4a6080" }}> kcal</span>
          </div>
          <div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#e8edf2" }}>{phase.protein}</span>
            <span style={{ fontSize: 11, color: "#4a6080" }}>g protein</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#4a6080", marginTop: 6 }}>
          Meal plan total: {totalKcal} kcal · {totalProtein}g protein
        </div>
      </div>

      {/* Meal Cards */}
      {MEAL_PLAN.map((m, i) => (
        <div key={i} onClick={() => setExpanded(expanded === i ? null : i)} style={{ background: "#0f1923", border: `1px solid ${expanded === i ? phase.color + "44" : "#1a2535"}`, borderRadius: 10, padding: 16, marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 13, color: "#e8edf2", fontWeight: 600 }}>
                {m.emoji} {m.meal}
              </div>
              <div style={{ fontSize: 10, color: "#4a6080", marginTop: 3 }}>
                {m.kcal} kcal · {m.protein}g protein
              </div>
            </div>
            <div style={{ color: "#4a6080", fontSize: 14, transition: "transform 0.2s", transform: expanded === i ? "rotate(180deg)" : "rotate(0)" }}>
              ▾
            </div>
          </div>

          {expanded === i && (
            <div className="fade-in" style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 10 }}>
                {m.items.map((item, j) => (
                  <div key={j} style={{ fontSize: 11, color: "#6a8099", padding: "4px 0", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: phase.color, fontSize: 8 }}>●</span>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: phase.color, background: `${phase.color}11`, padding: "8px 12px", borderRadius: 6 }}>
                ⚡ {m.tip}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* GF Safety Checklist */}
      <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", marginBottom: 12, textTransform: "uppercase" }}>Gluten-Free Safety</div>
        {GF_SAFETY.map((s, i) => (
          <div key={i} style={{ marginBottom: i < GF_SAFETY.length - 1 ? 12 : 0 }}>
            <div style={{ fontSize: 11, color: "#c8d8e8", fontWeight: 600, marginBottom: 4 }}>
              {s.emoji} {s.label}
            </div>
            <div style={{ fontSize: 11, color: "#4a6080", lineHeight: 1.7 }}>{s.items}</div>
          </div>
        ))}
      </div>

      {/* Batch Cooking Tips */}
      <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", marginBottom: 12, textTransform: "uppercase" }}>Batch Cooking Tips</div>
        {BATCH_TIPS.map((t, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < BATCH_TIPS.length - 1 ? "1px solid #1a2535" : "none" }}>
            <div style={{ fontSize: 12, color: phase.color, fontWeight: 600, marginBottom: 3 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "#6a8099", lineHeight: 1.5 }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
