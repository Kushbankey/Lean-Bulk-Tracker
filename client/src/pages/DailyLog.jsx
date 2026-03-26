import { useState, useEffect } from "react";
import { api } from "../api";
import { MEAL_PLAN, getTodayKey } from "../data";

export default function DailyLog({ ctx }) {
  const { phase, latestWeight, calorieTarget, logs, fetchAll } = ctx;
  const todayKey = getTodayKey();
  const todayLog = logs.find((l) => l.date === todayKey);

  const [weight, setWeight] = useState("");
  const [calories, setCalories] = useState("");
  const [note, setNote] = useState("");
  const [mealsChecked, setMealsChecked] = useState([false, false, false, false]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (todayLog) {
      if (todayLog.weight) setWeight(String(todayLog.weight));
      if (todayLog.calories) setCalories(String(todayLog.calories));
      if (todayLog.notes) setNote(todayLog.notes);
      try { setMealsChecked(JSON.parse(todayLog.mealsChecked)); } catch {}
    }
  }, [todayLog]);

  const toggleMeal = async (i) => {
    const updated = mealsChecked.map((v, idx) => (idx === i ? !v : v));
    setMealsChecked(updated);
    if (navigator.vibrate) navigator.vibrate(30);
    await api.saveLog({ date: todayKey, mealsChecked: updated });
    fetchAll();
  };

  const handleSave = async () => {
    if (!weight && !calories && !note) return;
    setSaving(true);
    try {
      await api.saveLog({
        date: todayKey,
        weight: weight ? parseFloat(weight) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        notes: note || undefined,
        mealsChecked,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "#080c10",
    border: "1px solid #1a2535",
    borderRadius: 6,
    padding: "10px 12px",
    color: "#e8edf2",
    fontFamily: "inherit",
    fontSize: 13,
    boxSizing: "border-box",
  };

  return (
    <div>
      {/* Meal Checklist */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", marginBottom: 10, textTransform: "uppercase" }}>Today's Meals</div>
        {MEAL_PLAN.map((m, i) => (
          <div key={i} onClick={() => toggleMeal(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 6, background: mealsChecked[i] ? `${phase.color}15` : "#0f1923", border: `1px solid ${mealsChecked[i] ? phase.color + "44" : "#1a2535"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, border: `2px solid ${mealsChecked[i] ? phase.color : "#2a3a4a"}`, background: mealsChecked[i] ? phase.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, color: "#080c10", fontWeight: 700, transition: "all 0.2s" }}>
              {mealsChecked[i] ? "\u2713" : ""}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: mealsChecked[i] ? phase.color : "#c8d8e8" }}>
                {m.emoji} {m.meal.split("\u2014")[1]?.trim() || m.meal}
              </div>
              <div style={{ fontSize: 10, color: "#4a6080", marginTop: 2 }}>{m.kcal} kcal \u00b7 {m.protein}g protein</div>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 10, color: "#4a6080", textAlign: "right", marginTop: 4 }}>
          {mealsChecked.filter(Boolean).length}/4 meals \u00b7 {mealsChecked.reduce((s, v, i) => s + (v ? MEAL_PLAN[i].kcal : 0), 0)} kcal from meals
        </div>
      </div>

      {/* Log Form */}
      <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", marginBottom: 14, textTransform: "uppercase" }}>Log Today</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "#4a6080", marginBottom: 5, letterSpacing: 1 }}>WEIGHT (kg)</div>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" placeholder={`e.g. ${latestWeight}`} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "#4a6080", marginBottom: 5, letterSpacing: 1 }}>CALORIES</div>
            <input value={calories} onChange={(e) => setCalories(e.target.value)} type="number" placeholder={`e.g. ${calorieTarget}`} style={inputStyle} />
          </div>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Quick note (optional)" rows={2} style={{ ...inputStyle, marginBottom: 12, resize: "none" }} />
        <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: 12, background: saved ? "#1a3a2a" : `${phase.color}22`, border: `1px solid ${saved ? "#4ade80" : phase.color}`, borderRadius: 6, color: saved ? "#4ade80" : phase.color, fontSize: 13, cursor: "pointer", fontWeight: 600, letterSpacing: 1, transition: "all 0.3s", fontFamily: "inherit" }}>
          {saving ? "Saving..." : saved ? "\u2713 Saved!" : "Save Today's Log"}
        </button>
      </div>

      {/* Today's Record */}
      {todayLog && (todayLog.weight || todayLog.calories) && (
        <div style={{ marginTop: 12, background: "#0f1923", border: "1px solid #1a2535", borderRadius: 8, padding: 14 }} className="fade-in">
          <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 3, marginBottom: 8, textTransform: "uppercase" }}>Today's Record</div>
          <div style={{ display: "flex", gap: 20 }}>
            {todayLog.weight && (
              <div>
                <span style={{ color: "#4a6080", fontSize: 9 }}>WEIGHT </span>
                <span style={{ color: phase.color, fontSize: 18, fontWeight: 700 }}>{todayLog.weight}kg</span>
              </div>
            )}
            {todayLog.calories && (
              <div>
                <span style={{ color: "#4a6080", fontSize: 9 }}>CALORIES </span>
                <span style={{ color: phase.color, fontSize: 18, fontWeight: 700 }}>{todayLog.calories}</span>
              </div>
            )}
          </div>
          {todayLog.notes && (
            <div style={{ marginTop: 8, fontSize: 11, color: "#6a8099", fontStyle: "italic" }}>"{todayLog.notes}"</div>
          )}
        </div>
      )}
    </div>
  );
}
