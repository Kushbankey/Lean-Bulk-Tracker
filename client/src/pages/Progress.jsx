import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function Progress({ ctx }) {
  const { phase, logs, stats, settings, calorieTarget } = ctx;
  const [showAll, setShowAll] = useState(false);

  const logsWithWeight = logs.filter((l) => l.weight);
  const weightData = (showAll ? logsWithWeight : logsWithWeight.slice(-30)).map((l) => ({
    date: l.date.slice(5),
    weight: l.weight,
  }));

  const logsWithCalories = logs.filter((l) => l.calories);
  const calorieData = (showAll ? logsWithCalories : logsWithCalories.slice(-30)).map((l) => ({
    date: l.date.slice(5),
    calories: l.calories,
    target: calorieTarget,
  }));

  const weeklyGain = stats?.weeklyGain;
  let gainColor = "#4a6080";
  let gainLabel = "No data yet";
  let gainAdvice = "";
  if (weeklyGain !== null && weeklyGain !== undefined) {
    if (weeklyGain < 0.2) {
      gainColor = "#f59e0b";
      gainLabel = `${weeklyGain >= 0 ? "+" : ""}${weeklyGain}kg/week`;
      gainAdvice = "Too slow \u2014 add 150 kcal/day";
    } else if (weeklyGain > 0.4) {
      gainColor = "#f87171";
      gainLabel = `+${weeklyGain}kg/week`;
      gainAdvice = "Too fast \u2014 cut 150 kcal/day";
    } else {
      gainColor = "#4ade80";
      gainLabel = `+${weeklyGain}kg/week`;
      gainAdvice = "Perfect pace! Stay the course";
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 6, padding: "8px 12px", fontSize: 11 }}>
        <div style={{ color: "#4a6080", marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.name === "weight" ? "kg" : ""}</div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Current Weight", value: `${stats?.latestWeight || settings.startWeight}kg`, sub: `Started at ${settings.startWeight}kg` },
          { label: "Total Gained", value: `+${stats?.totalGained || 0}kg`, sub: `${stats?.remaining || 10}kg remaining` },
          { label: "Current Week", value: `Week ${ctx.week}`, sub: `Phase ${phase.phase}: ${phase.label}` },
          { label: "Days Logged", value: stats?.totalLogged || 0, sub: `${stats?.streak || 0} day streak` },
        ].map((s, i) => (
          <div key={i} style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: phase.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#4a6080", marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly Gain Indicator */}
      <div style={{ background: "#0f1923", border: `1px solid ${gainColor}33`, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", marginBottom: 8, textTransform: "uppercase" }}>Weekly Gain Rate</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: gainColor }}>{gainLabel}</span>
        </div>
        {gainAdvice && <div style={{ fontSize: 11, color: gainColor, marginTop: 6, opacity: 0.8 }}>{gainAdvice}</div>}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[
            { range: "<0.2", color: "#f59e0b", label: "Slow" },
            { range: "0.25-0.35", color: "#4ade80", label: "Perfect" },
            { range: ">0.4", color: "#f87171", label: "Fast" },
          ].map((r, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "6px 4px", background: "#080c10", borderRadius: 4, border: `1px solid ${r.color}22` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color, margin: "0 auto 4px" }} />
              <div style={{ fontSize: 8, color: r.color }}>{r.label}</div>
              <div style={{ fontSize: 8, color: "#4a6080" }}>{r.range}kg</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weight Chart */}
      <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", textTransform: "uppercase" }}>Weight Trend</div>
          <button onClick={() => setShowAll(!showAll)} style={{ background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 4, padding: "4px 8px", color: "#4a6080", cursor: "pointer", fontSize: 9, fontFamily: "inherit" }}>
            {showAll ? "Last 30d" : "All Time"}
          </button>
        </div>
        {weightData.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2535" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#4a6080" }} tickLine={false} axisLine={{ stroke: "#1a2535" }} />
              <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fontSize: 9, fill: "#4a6080" }} tickLine={false} axisLine={{ stroke: "#1a2535" }} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="weight" stroke={phase.color} strokeWidth={2} dot={{ r: 3, fill: phase.color }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", padding: 30, color: "#4a6080", fontSize: 12 }}>Log at least 2 days to see the chart</div>
        )}
      </div>

      {/* Calorie Chart */}
      <div style={{ background: "#0f1923", border: "1px solid #1a2535", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", textTransform: "uppercase", marginBottom: 12 }}>Calorie Intake vs Target</div>
        {calorieData.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2535" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#4a6080" }} tickLine={false} axisLine={{ stroke: "#1a2535" }} />
              <YAxis tick={{ fontSize: 9, fill: "#4a6080" }} tickLine={false} axisLine={{ stroke: "#1a2535" }} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={calorieTarget} stroke="#4a6080" strokeDasharray="5 5" label={{ value: "Target", position: "right", fill: "#4a6080", fontSize: 9 }} />
              <Line type="monotone" dataKey="calories" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: "#60a5fa" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", padding: 30, color: "#4a6080", fontSize: 12 }}>Log at least 2 days to see the chart</div>
        )}
      </div>

      {/* Log History */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080", marginBottom: 10, textTransform: "uppercase" }}>Recent Logs</div>
        {logs.length === 0 && (
          <div style={{ color: "#4a6080", fontSize: 12, textAlign: "center", padding: 30 }}>No logs yet. Start logging today!</div>
        )}
        {logs.slice(-10).reverse().map((log) => (
          <div key={log.date} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", marginBottom: 6, background: "#0f1923", border: "1px solid #1a2535", borderRadius: 7 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#4a6080" }}>{log.date}</div>
              {log.notes && <div style={{ fontSize: 9, color: "#4a6080", fontStyle: "italic", marginTop: 2 }}>"{log.notes}"</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              {log.weight && <div style={{ fontSize: 14, color: phase.color, fontWeight: 700 }}>{log.weight}kg</div>}
              {log.calories && <div style={{ fontSize: 10, color: "#4a6080" }}>{log.calories} kcal</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
