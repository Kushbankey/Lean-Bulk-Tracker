import { useState, useEffect } from "react";
import { api } from "../api";
import { MEAL_PLAN, getTodayKey } from "../data";

export default function Calendar({ ctx, onClose }) {
  const { phase, logs, calorieTarget, latestWeight, fetchAll } = ctx;
  const today = getTodayKey();

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [editLog, setEditLog] = useState(null);
  const [weight, setWeight] = useState("");
  const [calories, setCalories] = useState("");
  const [note, setNote] = useState("");
  const [mealsChecked, setMealsChecked] = useState([false, false, false, false]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const logMap = {};
  logs.forEach((l) => { logMap[l.date] = l; });

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month);
  const monthName = new Date(viewDate.year, viewDate.month).toLocaleString("default", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setViewDate((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { ...v, month: v.month - 1 };
    });
    setSelectedDate(null);
    setEditLog(null);
  };

  const nextMonth = () => {
    setViewDate((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 };
      return { ...v, month: v.month + 1 };
    });
    setSelectedDate(null);
    setEditLog(null);
  };

  const selectDay = (day) => {
    const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    const log = logMap[dateStr];
    if (log) {
      setWeight(log.weight ? String(log.weight) : "");
      setCalories(log.calories ? String(log.calories) : "");
      setNote(log.notes || "");
      try { setMealsChecked(JSON.parse(log.mealsChecked)); } catch { setMealsChecked([false, false, false, false]); }
    } else {
      setWeight("");
      setCalories("");
      setNote("");
      setMealsChecked([false, false, false, false]);
    }
    setEditLog(log || null);
    setSaved(false);
  };

  const toggleMeal = (i) => {
    setMealsChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const handleSave = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      await api.saveLog({
        date: selectedDate,
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

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div>
      {/* Month Navigator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 6, padding: "6px 12px", color: "#4a6080", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>&larr;</button>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e8edf2" }}>{monthName}</div>
        <button onClick={nextMonth} style={{ background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 6, padding: "6px 12px", color: "#4a6080", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>&rarr;</button>
      </div>

      {/* Day Names */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {dayNames.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 9, color: "#4a6080", padding: "4px 0", letterSpacing: 1 }}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 16 }}>
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasLog = !!logMap[dateStr];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isFuture = dateStr > today;
          const log = logMap[dateStr];
          const hasWeight = log?.weight;
          const hasCalories = log?.calories;

          return (
            <div key={day} onClick={() => !isFuture && selectDay(day)} style={{
              textAlign: "center",
              padding: "6px 2px",
              borderRadius: 8,
              cursor: isFuture ? "default" : "pointer",
              opacity: isFuture ? 0.3 : 1,
              background: isSelected ? `${phase.color}22` : isToday ? "#1a2535" : "transparent",
              border: isSelected ? `2px solid ${phase.color}` : isToday ? "2px solid #2a3a4a" : "2px solid transparent",
              transition: "all 0.15s",
              position: "relative",
            }}>
              <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isSelected ? phase.color : isToday ? "#e8edf2" : hasLog ? "#c8d8e8" : "#4a6080" }}>
                {day}
              </div>
              {/* Log indicators */}
              <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2, height: 4 }}>
                {hasWeight && <div style={{ width: 4, height: 4, borderRadius: "50%", background: phase.color }} />}
                {hasCalories && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#60a5fa" }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: phase.color }} />
          <span style={{ fontSize: 9, color: "#4a6080" }}>Weight</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa" }} />
          <span style={{ fontSize: 9, color: "#4a6080" }}>Calories</span>
        </div>
      </div>

      {/* Selected Day Edit Form */}
      {selectedDate && (
        <div className="fade-in" style={{ background: "#0f1923", border: `1px solid ${phase.color}33`, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", textTransform: "uppercase" }}>
              {selectedDate === today ? "Today" : selectedDate}
            </div>
            {editLog && (
              <div style={{ fontSize: 9, color: phase.color, padding: "2px 8px", background: `${phase.color}11`, borderRadius: 4 }}>Editing</div>
            )}
            {!editLog && selectedDate !== today && (
              <div style={{ fontSize: 9, color: "#f59e0b", padding: "2px 8px", background: "#f59e0b11", borderRadius: 4 }}>Backfill</div>
            )}
          </div>

          {/* Meal Checklist */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: "#4a6080", marginBottom: 8, letterSpacing: 1 }}>MEALS</div>
            <div style={{ display: "flex", gap: 6 }}>
              {MEAL_PLAN.map((m, i) => (
                <div key={i} onClick={() => toggleMeal(i)} style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "8px 4px",
                  background: mealsChecked[i] ? `${phase.color}15` : "#080c10",
                  border: `1px solid ${mealsChecked[i] ? phase.color + "44" : "#1a2535"}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: 14 }}>{m.emoji}</div>
                  <div style={{ fontSize: 8, color: mealsChecked[i] ? phase.color : "#4a6080", marginTop: 2 }}>{mealsChecked[i] ? "\u2713" : m.kcal}</div>
                </div>
              ))}
            </div>
          </div>

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
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes (optional)" rows={2} style={{ ...inputStyle, marginBottom: 12, resize: "none" }} />

          <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: 12, background: saved ? "#1a3a2a" : `${phase.color}22`, border: `1px solid ${saved ? "#4ade80" : phase.color}`, borderRadius: 6, color: saved ? "#4ade80" : phase.color, fontSize: 13, cursor: "pointer", fontWeight: 600, letterSpacing: 1, transition: "all 0.3s", fontFamily: "inherit" }}>
            {saving ? "Saving..." : saved ? "\u2713 Saved!" : editLog ? "Update Log" : "Add Log"}
          </button>
        </div>
      )}

      {/* No date selected */}
      {!selectedDate && (
        <div style={{ textAlign: "center", padding: 20, color: "#4a6080", fontSize: 12 }}>
          Tap a date to view or edit its log
        </div>
      )}
    </div>
  );
}
