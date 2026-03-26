import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import { buildPhaseConfig, getPhaseForWeek, getWeekNumber, getTodayKey, QUOTES } from "./data";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import DailyLog from "./pages/DailyLog";
import Progress from "./pages/Progress";
import MealPlan from "./pages/MealPlan";
import Roadmap from "./pages/Roadmap";
import Settings from "./pages/Settings";
import Calendar from "./components/Calendar";

const TABS = [
  { id: "dashboard", label: "Home", icon: "\u2302" },
  { id: "log", label: "Log", icon: "\u270e" },
  { id: "progress", label: "Stats", icon: "\u2191" },
  { id: "meals", label: "Meals", icon: "\u2615" },
  { id: "calendar", label: "Calendar", icon: "\u25a1" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [s, l, st] = await Promise.all([
        api.getSettings(),
        api.getLogs(),
        api.getStats(),
      ]);
      setSettings(s);
      setLogs(l);
      setStats(st);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading || !settings) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #1a2535", borderTopColor: "#4ade80", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: "#4a6080", fontSize: 12, letterSpacing: 2 }}>LOADING</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Show onboarding if setup not complete
  if (!settings.setupComplete) {
    return <Onboarding onComplete={fetchAll} />;
  }

  const phaseConfig = buildPhaseConfig(settings);
  const totalWeeks = settings.durationWeeks || 32;
  const week = getWeekNumber(settings.startDate);
  const phase = getPhaseForWeek(week, phaseConfig);
  const todayQuote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

  const logsWithWeight = logs.filter((l) => l.weight);
  const latestWeight = logsWithWeight.length > 0 ? logsWithWeight[logsWithWeight.length - 1].weight : settings.startWeight;
  const gained = Math.round((latestWeight - settings.startWeight) * 10) / 10;
  const remaining = Math.round((settings.goalWeight - latestWeight) * 10) / 10;
  const progress = Math.min(100, Math.max(0, ((latestWeight - settings.startWeight) / (settings.goalWeight - settings.startWeight)) * 100));

  const calorieTarget = settings.calorieOverride || phase.calories;

  const ctx = { settings, logs, stats, week, phase, phaseConfig, totalWeeks, todayQuote, latestWeight, gained, remaining, progress, calorieTarget, fetchAll };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f1923 0%, #0a1628 100%)", padding: "20px 20px 18px", borderBottom: "1px solid #1a2535" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#4a6080", marginBottom: 4, textTransform: "uppercase" }}>LeanBulk Tracker</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -1 }}>
              Week <span style={{ color: phase.color }}>{week}</span>
              <span style={{ fontSize: 13, color: "#4a6080", fontWeight: 400 }}> of {totalWeeks}</span>
            </div>
          </div>
          <button onClick={() => setShowSettings(true)} style={{ background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 8, padding: "8px 12px", color: "#4a6080", cursor: "pointer", fontSize: 16 }}>
            {"\u2699"}
          </button>
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: "#4a6080" }}>
          Phase {phase.phase} — <span style={{ color: phase.color }}>{phase.label}</span> · {calorieTarget} kcal/day
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4a6080", marginBottom: 5 }}>
            <span>{settings.startWeight}kg</span>
            <span style={{ color: "#e8edf2", fontWeight: 600 }}>{latestWeight}kg</span>
            <span>{settings.goalWeight}kg</span>
          </div>
          <div style={{ height: 6, background: "#0f1923", borderRadius: 3, overflow: "hidden", border: "1px solid #1a2535" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${phase.color}, ${phase.color}88)`, borderRadius: 3, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 5 }}>
            <span style={{ color: phase.color }}>+{gained}kg gained</span>
            <span style={{ color: "#4a6080" }}>{remaining}kg to go</span>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ padding: 16 }} className="fade-in">
        {tab === "dashboard" && <Dashboard ctx={ctx} onQuickLog={() => setTab("log")} />}
        {tab === "log" && <DailyLog ctx={ctx} />}
        {tab === "progress" && <Progress ctx={ctx} />}
        {tab === "meals" && <MealPlan ctx={ctx} />}
        {tab === "calendar" && <Calendar ctx={ctx} />}
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: "#0a0e14",
        borderTop: "1px solid #1a2535",
        display: "flex",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0 8px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: tab === t.id ? phase.color : "#4a6080", transition: "color 0.2s", fontFamily: "inherit" }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: phase.color, marginTop: 1 }} />}
          </button>
        ))}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <>
          <div className="overlay active" onClick={() => setShowSettings(false)} />
          <div className="bottom-sheet active">
            <div className="handle" />
            <Settings ctx={ctx} onClose={() => { setShowSettings(false); fetchAll(); }} />
          </div>
        </>
      )}

      {/* Quick Log FAB */}
      {tab !== "log" && tab !== "calendar" && (
        <button onClick={() => setTab("log")} style={{
          position: "fixed",
          bottom: "calc(70px + env(safe-area-inset-bottom))",
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: phase.color,
          border: "none",
          color: "#080c10",
          fontSize: 24,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: `0 4px 20px ${phase.color}44`,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
        }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          +
        </button>
      )}
    </div>
  );
}
