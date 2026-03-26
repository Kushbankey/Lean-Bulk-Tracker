import { useState } from "react";
import { api } from "../api";

export default function Settings({ ctx, onClose }) {
  const { settings, phase } = ctx;
  const [startDate, setStartDate] = useState(settings.startDate || "");
  const [startWeight, setStartWeight] = useState(String(settings.startWeight || 55));
  const [goalWeight, setGoalWeight] = useState(String(settings.goalWeight || 65));
  const [calorieOverride, setCalorieOverride] = useState(settings.calorieOverride ? String(settings.calorieOverride) : "");
  const [saving, setSaving] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings({
        startDate,
        startWeight: parseFloat(startWeight),
        goalWeight: parseFloat(goalWeight),
        calorieOverride: calorieOverride ? parseInt(calorieOverride) : null,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    await api.resetAll();
    onClose();
  };

  const handleExport = () => {
    window.open(api.exportCSV(), "_blank");
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
      <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", marginBottom: 16, textTransform: "uppercase" }}>Settings</div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#4a6080", marginBottom: 5, letterSpacing: 1 }}>START DATE</div>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#4a6080", marginBottom: 5, letterSpacing: 1 }}>START WEIGHT (kg)</div>
          <input type="number" step="0.1" value={startWeight} onChange={(e) => setStartWeight(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#4a6080", marginBottom: 5, letterSpacing: 1 }}>GOAL WEIGHT (kg)</div>
          <input type="number" step="0.1" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#4a6080", marginBottom: 5, letterSpacing: 1 }}>CALORIE OVERRIDE (optional)</div>
        <input type="number" value={calorieOverride} onChange={(e) => setCalorieOverride(e.target.value)} placeholder={`Phase default: ${phase.calories}`} style={inputStyle} />
        <div style={{ fontSize: 9, color: "#4a6080", marginTop: 4 }}>Leave empty to use phase default</div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: 12, background: `${phase.color}22`, border: `1px solid ${phase.color}`, borderRadius: 6, color: phase.color, fontSize: 13, cursor: "pointer", fontWeight: 600, letterSpacing: 1, fontFamily: "inherit", marginBottom: 10 }}>
        {saving ? "Saving..." : "Save Settings"}
      </button>

      <button onClick={handleExport} style={{ width: "100%", padding: 12, background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 6, color: "#4a6080", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
        Export Logs as CSV
      </button>

      {!showReset ? (
        <button onClick={() => setShowReset(true)} style={{ width: "100%", padding: 12, background: "transparent", border: "1px solid #f8717133", borderRadius: 6, color: "#f87171", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
          Reset All Data
        </button>
      ) : (
        <div style={{ background: "#1a0a0a", border: "1px solid #f8717144", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, fontWeight: 600 }}>Are you sure? This deletes everything.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleReset} style={{ flex: 1, padding: 10, background: "#f87171", border: "none", borderRadius: 6, color: "#080c10", fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
              Yes, Reset
            </button>
            <button onClick={() => setShowReset(false)} style={{ flex: 1, padding: 10, background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 6, color: "#4a6080", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
