import { useState } from "react";
import { api } from "../api";

const STEPS = ["welcome", "body", "goals", "ready"];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [startWeight, setStartWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("32");
  const [saving, setSaving] = useState(false);

  const accentColor = "#4ade80";

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = async () => {
    if (!startWeight || !goalWeight) return;
    setSaving(true);
    try {
      await api.updateSettings({
        setupComplete: true,
        startDate: new Date().toISOString().split("T")[0],
        startWeight: parseFloat(startWeight),
        goalWeight: parseFloat(goalWeight),
        durationWeeks: parseInt(durationWeeks) || 32,
      });
      onComplete();
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
    borderRadius: 8,
    padding: "14px 16px",
    color: "#e8edf2",
    fontFamily: "inherit",
    fontSize: 16,
    boxSizing: "border-box",
    textAlign: "center",
  };

  const totalGain = goalWeight && startWeight ? (parseFloat(goalWeight) - parseFloat(startWeight)).toFixed(1) : null;
  const weeklyRate = totalGain && durationWeeks ? (totalGain / parseInt(durationWeeks)).toFixed(2) : null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px", paddingTop: "calc(40px + env(safe-area-inset-top))" }}>
      {/* Progress dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i <= step ? accentColor : "#1a2535", transition: "all 0.3s" }} />
        ))}
      </div>

      {/* Step: Welcome */}
      {step === 0 && (
        <div className="fade-in" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#x1F4AA;</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>LeanBulk Tracker</div>
          <div style={{ fontSize: 13, color: "#4a6080", lineHeight: 1.7, marginBottom: 32 }}>
            Your personal diet and body composition tracker.<br />
            Let's set up your lean bulk plan in 30 seconds.
          </div>
          <button onClick={next} style={{ width: "100%", padding: 14, background: accentColor, border: "none", borderRadius: 8, color: "#080c10", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1 }}>
            Get Started
          </button>
        </div>
      )}

      {/* Step: Body Stats */}
      {step === 1 && (
        <div className="fade-in">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>&#x2696;&#xFE0F;</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Your Body Stats</div>
            <div style={{ fontSize: 12, color: "#4a6080" }}>We'll use these to calculate your targets</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#4a6080", marginBottom: 6, letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Current Weight (kg)</div>
            <input type="number" step="0.1" value={startWeight} onChange={(e) => setStartWeight(e.target.value)} placeholder="e.g. 55" style={inputStyle} autoFocus />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: "#4a6080", marginBottom: 6, letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Goal Weight (kg)</div>
            <input type="number" step="0.1" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} placeholder="e.g. 65" style={inputStyle} />
          </div>

          {totalGain > 0 && (
            <div style={{ textAlign: "center", padding: "12px 16px", background: `${accentColor}11`, border: `1px solid ${accentColor}33`, borderRadius: 8, marginBottom: 24 }}>
              <span style={{ color: accentColor, fontSize: 18, fontWeight: 700 }}>+{totalGain}kg</span>
              <span style={{ color: "#4a6080", fontSize: 12 }}> total gain target</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={prev} style={{ flex: 1, padding: 14, background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 8, color: "#4a6080", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Back</button>
            <button onClick={next} disabled={!startWeight || !goalWeight} style={{ flex: 2, padding: 14, background: startWeight && goalWeight ? accentColor : "#1a2535", border: "none", borderRadius: 8, color: startWeight && goalWeight ? "#080c10" : "#4a6080", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Next</button>
          </div>
        </div>
      )}

      {/* Step: Plan Duration */}
      {step === 2 && (
        <div className="fade-in">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>&#x1F4C5;</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Plan Duration</div>
            <div style={{ fontSize: 12, color: "#4a6080" }}>How many weeks for your lean bulk?</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#4a6080", marginBottom: 6, letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>Duration (weeks)</div>
            <input type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} placeholder="32" style={inputStyle} />
          </div>

          {/* Presets */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
            {[16, 24, 32, 40].map((w) => (
              <button key={w} onClick={() => setDurationWeeks(String(w))} style={{ padding: "8px 16px", background: durationWeeks === String(w) ? `${accentColor}22` : "#0f1923", border: `1px solid ${durationWeeks === String(w) ? accentColor : "#1a2535"}`, borderRadius: 6, color: durationWeeks === String(w) ? accentColor : "#4a6080", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                {w}w
              </button>
            ))}
          </div>

          {weeklyRate && (
            <div style={{ textAlign: "center", padding: "12px 16px", background: "#0f1923", border: "1px solid #1a2535", borderRadius: 8, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#4a6080", marginBottom: 4 }}>Estimated weekly gain</div>
              <span style={{ color: parseFloat(weeklyRate) >= 0.2 && parseFloat(weeklyRate) <= 0.4 ? accentColor : "#f59e0b", fontSize: 20, fontWeight: 700 }}>{weeklyRate} kg/week</span>
              <div style={{ fontSize: 10, color: "#4a6080", marginTop: 4 }}>
                {parseFloat(weeklyRate) < 0.2 ? "Very slow \u2014 consider shorter duration" : parseFloat(weeklyRate) > 0.5 ? "Quite fast \u2014 consider longer duration" : "Good pace for lean gains!"}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={prev} style={{ flex: 1, padding: 14, background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 8, color: "#4a6080", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Back</button>
            <button onClick={next} style={{ flex: 2, padding: 14, background: accentColor, border: "none", borderRadius: 8, color: "#080c10", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Next</button>
          </div>
        </div>
      )}

      {/* Step: Ready */}
      {step === 3 && (
        <div className="fade-in">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>&#x1F680;</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>You're All Set!</div>
            <div style={{ fontSize: 12, color: "#4a6080", lineHeight: 1.7 }}>Here's your personalized plan</div>
          </div>

          <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            {[
              { label: "Start Weight", value: `${startWeight} kg` },
              { label: "Goal Weight", value: `${goalWeight} kg` },
              { label: "Total Gain", value: `+${totalGain} kg` },
              { label: "Duration", value: `${durationWeeks} weeks` },
              { label: "Weekly Rate", value: `~${weeklyRate} kg/week` },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? "1px solid #1a2535" : "none" }}>
                <span style={{ fontSize: 12, color: "#4a6080" }}>{r.label}</span>
                <span style={{ fontSize: 13, color: accentColor, fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "#4a6080", textAlign: "center", marginBottom: 20, lineHeight: 1.6 }}>
            Calorie targets will be auto-calculated across 3 phases.<br />
            You can always adjust these in Settings.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={prev} style={{ flex: 1, padding: 14, background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 8, color: "#4a6080", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Back</button>
            <button onClick={handleFinish} disabled={saving} style={{ flex: 2, padding: 14, background: accentColor, border: "none", borderRadius: 8, color: "#080c10", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1 }}>
              {saving ? "Setting up..." : "Start Tracking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
