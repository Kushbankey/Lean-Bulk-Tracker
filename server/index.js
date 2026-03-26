const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files in production
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));

// ─── Settings ───────────────────────────────────────────────
async function ensureSettings() {
  let s = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!s) {
    s = await prisma.settings.create({
      data: {
        id: 1,
        startDate: new Date().toISOString().split("T")[0],
        startWeight: 55.0,
        goalWeight: 65.0,
      },
    });
  }
  return s;
}

app.get("/api/settings", async (_req, res) => {
  try {
    const s = await ensureSettings();
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    await ensureSettings();
    const { startDate, startWeight, goalWeight, calorieOverride } = req.body;
    const s = await prisma.settings.update({
      where: { id: 1 },
      data: {
        ...(startDate !== undefined && { startDate }),
        ...(startWeight !== undefined && { startWeight: parseFloat(startWeight) }),
        ...(goalWeight !== undefined && { goalWeight: parseFloat(goalWeight) }),
        ...(calorieOverride !== undefined && {
          calorieOverride: calorieOverride === null ? null : parseInt(calorieOverride),
        }),
      },
    });
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Daily Logs ─────────────────────────────────────────────
app.get("/api/logs", async (_req, res) => {
  try {
    const logs = await prisma.dailyLog.findMany({ orderBy: { date: "asc" } });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/logs/:date", async (req, res) => {
  try {
    const log = await prisma.dailyLog.findUnique({
      where: { date: req.params.date },
    });
    res.json(log || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/logs", async (req, res) => {
  try {
    const { date, weight, calories, notes, mealsChecked } = req.body;
    const logDate = date || new Date().toISOString().split("T")[0];

    const existing = await prisma.dailyLog.findUnique({ where: { date: logDate } });

    let log;
    if (existing) {
      log = await prisma.dailyLog.update({
        where: { date: logDate },
        data: {
          ...(weight !== undefined && { weight: weight === null ? null : parseFloat(weight) }),
          ...(calories !== undefined && { calories: calories === null ? null : parseInt(calories) }),
          ...(notes !== undefined && { notes }),
          ...(mealsChecked !== undefined && {
            mealsChecked: JSON.stringify(mealsChecked),
          }),
        },
      });
    } else {
      log = await prisma.dailyLog.create({
        data: {
          date: logDate,
          weight: weight != null ? parseFloat(weight) : null,
          calories: calories != null ? parseInt(calories) : null,
          notes: notes || null,
          mealsChecked: mealsChecked ? JSON.stringify(mealsChecked) : "[false,false,false,false]",
        },
      });
    }
    res.json(log);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Stats ──────────────────────────────────────────────────
app.get("/api/stats", async (_req, res) => {
  try {
    const settings = await ensureSettings();
    const logs = await prisma.dailyLog.findMany({ orderBy: { date: "asc" } });

    // Streak calculation
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (logs.find((l) => l.date === key)) {
        streak++;
      } else {
        break;
      }
    }

    // Weekly averages (last 4 weeks)
    const weeklyAverages = [];
    for (let w = 0; w < 4; w++) {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      const weekLogs = logs.filter((l) => {
        const d = new Date(l.date);
        return d >= weekStart && d <= weekEnd && l.weight;
      });

      if (weekLogs.length > 0) {
        const avg = weekLogs.reduce((s, l) => s + l.weight, 0) / weekLogs.length;
        weeklyAverages.push({
          weekStart: weekStart.toISOString().split("T")[0],
          weekEnd: weekEnd.toISOString().split("T")[0],
          avgWeight: Math.round(avg * 10) / 10,
          logCount: weekLogs.length,
        });
      }
    }

    // Weekly gain (compare last 2 weekly averages)
    let weeklyGain = null;
    if (weeklyAverages.length >= 2) {
      weeklyGain =
        Math.round((weeklyAverages[0].avgWeight - weeklyAverages[1].avgWeight) * 10) / 10;
    }

    // Latest weight
    const logsWithWeight = logs.filter((l) => l.weight);
    const latestWeight =
      logsWithWeight.length > 0
        ? logsWithWeight[logsWithWeight.length - 1].weight
        : settings.startWeight;

    // Milestones
    const totalGained = latestWeight - settings.startWeight;
    const milestones = {
      first1kg: totalGained >= 1,
      first5kg: totalGained >= 5,
      halfway: totalGained >= (settings.goalWeight - settings.startWeight) / 2,
      goalReached: latestWeight >= settings.goalWeight,
    };

    res.json({
      streak,
      totalLogged: logs.length,
      latestWeight,
      totalGained: Math.round(totalGained * 10) / 10,
      remaining: Math.round((settings.goalWeight - latestWeight) * 10) / 10,
      weeklyAverages,
      weeklyGain,
      milestones,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Export CSV ──────────────────────────────────────────────
app.get("/api/export", async (_req, res) => {
  try {
    const logs = await prisma.dailyLog.findMany({ orderBy: { date: "asc" } });
    let csv = "date,weight,calories,notes,mealsChecked\n";
    for (const log of logs) {
      const notes = (log.notes || "").replace(/"/g, '""');
      csv += `${log.date},${log.weight || ""},${log.calories || ""},"${notes}","${log.mealsChecked}"\n`;
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leanbulk-logs.csv");
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Reset ──────────────────────────────────────────────────
app.delete("/api/reset", async (_req, res) => {
  try {
    await prisma.dailyLog.deleteMany();
    await prisma.settings.update({
      where: { id: 1 },
      data: {
        startDate: new Date().toISOString().split("T")[0],
        startWeight: 55.0,
        goalWeight: 65.0,
        calorieOverride: null,
      },
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`LeanBulk Tracker API running on port ${PORT}`);
});
