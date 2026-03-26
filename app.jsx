import { useState, useEffect } from "react";

const STORAGE_KEY = "bulk-tracker-data-v1";

const PHASE_CONFIG = [
    {
        phase: 1,
        weeks: [1, 4],
        label: "Foundation",
        calories: 2800,
        color: "#4ade80",
        desc: "Adapt to surplus, build habits",
    },
    {
        phase: 2,
        weeks: [5, 16],
        label: "Growth",
        calories: 2900,
        color: "#60a5fa",
        desc: "Progressive overload, protein priority",
    },
    {
        phase: 3,
        weeks: [17, 32],
        label: "Push",
        calories: 3000,
        color: "#f472b6",
        desc: "Plateau-busting, reassess monthly",
    },
];

const MEAL_PLAN = [
    {
        meal: "Meal 1 — Breakfast (7–8 AM)",
        emoji: "🌅",
        kcal: 620,
        protein: 28,
        items: [
            "200g Greek yogurt (full fat)",
            "50g GF oats (overnight)",
            "1 banana",
            "30g mixed nuts",
            "1 tbsp honey",
            "1 tbsp chia seeds",
        ],
        tip: "Prep overnight — zero morning effort",
    },
    {
        meal: "Meal 2 — Lunch (12–1 PM)",
        emoji: "🍱",
        kcal: 680,
        protein: 42,
        items: [
            "150g paneer",
            "150g cooked rice",
            "2 eggs (optional)",
            "100g spinach",
            "1 tbsp ghee",
            "Spices",
        ],
        tip: "Use pre-cooked rice — 10 min total",
    },
    {
        meal: "Meal 3 — Snack (4–5 PM)",
        emoji: "🥤",
        kcal: 580,
        protein: 30,
        items: [
            "300ml whole milk",
            "1 scoop GF whey protein",
            "2 tbsp peanut butter",
            "1 banana",
            "50g roasted chana",
        ],
        tip: "Blend in 30 seconds — zero cooking",
    },
    {
        meal: "Meal 4 — Dinner (8–9 PM)",
        emoji: "🍛",
        kcal: 640,
        protein: 38,
        items: [
            "80g moong/masoor dal",
            "200g rice or sweet potato",
            "100g paneer or tofu",
            "1 tbsp ghee",
            "150ml milk/curd",
        ],
        tip: "Batch-cook dal for 3–4 days",
    },
];

const MOTIVATION_QUOTES = [
    "Every meal is a rep. Every rep builds the body you want.",
    "You're not just eating — you're engineering yourself.",
    "Consistency beats intensity. Show up today.",
    "10kg is 10 months of discipline. You're already on day one.",
    "The body achieves what the mind believes.",
    "Small surpluses, compounded daily, build great physiques.",
    "Track it. Eat it. Lift it. Repeat.",
    "Your future body is being built right now, one meal at a time.",
];

const getPhaseForWeek = (week) =>
    PHASE_CONFIG.find((p) => week >= p.weeks[0] && week <= p.weeks[1]) ||
    PHASE_CONFIG[2];
const getTodayKey = () => new Date().toISOString().split("T")[0];
const getWeekNumber = (startDate) => {
    if (!startDate) return 1;
    const diff = new Date() - new Date(startDate);
    return Math.min(Math.max(1, Math.ceil(diff / (7 * 24 * 3600 * 1000))), 32);
};

export default function BulkTracker() {
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("today");
    const [logWeight, setLogWeight] = useState("");
    const [logCalories, setLogCalories] = useState("");
    const [logNote, setLogNote] = useState("");
    const [saved, setSaved] = useState(false);
    const [mealsChecked, setMealsChecked] = useState([
        false,
        false,
        false,
        false,
    ]);

    useEffect(() => {
        (async () => {
            try {
                const r = await window.storage.get(STORAGE_KEY);
                if (r) setData(JSON.parse(r.value));
                else
                    setData({
                        startDate: getTodayKey(),
                        logs: {},
                        startWeight: 55,
                        goalWeight: 65,
                    });
            } catch {
                setData({
                    startDate: getTodayKey(),
                    logs: {},
                    startWeight: 55,
                    goalWeight: 65,
                });
            }
        })();
    }, []);

    useEffect(() => {
        if (!data) return;
        const todayLog = data.logs[getTodayKey()];
        if (todayLog?.mealsChecked) setMealsChecked(todayLog.mealsChecked);
    }, [data]);

    const save = async (newData) => {
        setData(newData);
        try {
            await window.storage.set(STORAGE_KEY, JSON.stringify(newData));
        } catch {}
    };

    const logToday = () => {
        if (!logWeight && !logCalories) return;
        const today = getTodayKey();
        const newData = {
            ...data,
            logs: {
                ...data.logs,
                [today]: {
                    weight: logWeight
                        ? parseFloat(logWeight)
                        : data.logs[today]?.weight,
                    calories: logCalories
                        ? parseInt(logCalories)
                        : data.logs[today]?.calories,
                    note: logNote || data.logs[today]?.note,
                    mealsChecked,
                },
            },
        };
        save(newData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setLogWeight("");
        setLogCalories("");
        setLogNote("");
    };

    const toggleMeal = (i) => {
        const updated = mealsChecked.map((v, idx) => (idx === i ? !v : v));
        setMealsChecked(updated);
        const today = getTodayKey();
        const newData = {
            ...data,
            logs: {
                ...data.logs,
                [today]: { ...data.logs[today], mealsChecked: updated },
            },
        };
        save(newData);
    };

    if (!data)
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    background: "#0a0a0a",
                    color: "#fff",
                    fontFamily: "monospace",
                }}
            >
                Loading your bulk tracker...
            </div>
        );

    const week = getWeekNumber(data.startDate);
    const phase = getPhaseForWeek(week);
    const todayLog = data.logs[getTodayKey()];
    const quote =
        MOTIVATION_QUOTES[new Date().getDay() % MOTIVATION_QUOTES.length];
    const allLogs = Object.entries(data.logs).sort(([a], [b]) =>
        a.localeCompare(b)
    );
    const latestWeight =
        allLogs.filter(([, v]) => v.weight).slice(-1)[0]?.[1]?.weight ||
        data.startWeight;
    const gained = (latestWeight - data.startWeight).toFixed(1);
    const remaining = (data.goalWeight - latestWeight).toFixed(1);
    const progress = Math.min(
        100,
        Math.max(
            0,
            ((latestWeight - data.startWeight) /
                (data.goalWeight - data.startWeight)) *
                100
        )
    );

    const tabs = ["today", "progress", "meals", "plan"];
    const tabLabels = {
        today: "📋 Today",
        progress: "📈 Progress",
        meals: "🍽️ Meals",
        plan: "🗓️ Plan",
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#080c10",
                color: "#e8edf2",
                fontFamily: "'DM Mono', 'Courier New', monospace",
                maxWidth: 480,
                margin: "0 auto",
                padding: "0 0 80px",
            }}
        >
            {/* Header */}
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #0f1923 0%, #0a1628 100%)",
                    padding: "24px 20px 20px",
                    borderBottom: "1px solid #1a2535",
                }}
            >
                <div
                    style={{
                        fontSize: 11,
                        letterSpacing: 4,
                        color: "#4a6080",
                        marginBottom: 6,
                        textTransform: "uppercase",
                    }}
                >
                    Lean Bulk Tracker
                </div>
                <div
                    style={{
                        fontSize: 26,
                        fontWeight: 700,
                        letterSpacing: -1,
                        color: "#e8edf2",
                    }}
                >
                    Week <span style={{ color: phase.color }}>{week}</span>{" "}
                    <span
                        style={{
                            fontSize: 13,
                            color: "#4a6080",
                            fontWeight: 400,
                        }}
                    >
                        of 32
                    </span>
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#4a6080" }}>
                    Phase {phase.phase} —{" "}
                    <span style={{ color: phase.color }}>{phase.label}</span> ·{" "}
                    {phase.calories} kcal/day
                </div>

                {/* Progress Bar */}
                <div style={{ marginTop: 16 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 11,
                            color: "#4a6080",
                            marginBottom: 6,
                        }}
                    >
                        <span>55kg</span>
                        <span style={{ color: "#e8edf2", fontWeight: 600 }}>
                            {latestWeight}kg current
                        </span>
                        <span>65kg</span>
                    </div>
                    <div
                        style={{
                            height: 6,
                            background: "#0f1923",
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "1px solid #1a2535",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${progress}%`,
                                background: `linear-gradient(90deg, ${phase.color}, ${phase.color}88)`,
                                borderRadius: 3,
                                transition: "width 0.8s ease",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 11,
                            marginTop: 6,
                        }}
                    >
                        <span style={{ color: phase.color }}>
                            +{gained}kg gained
                        </span>
                        <span style={{ color: "#4a6080" }}>
                            {remaining}kg to go
                        </span>
                    </div>
                </div>
            </div>

            {/* Tab Nav */}
            <div
                style={{
                    display: "flex",
                    borderBottom: "1px solid #1a2535",
                    background: "#080c10",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                {tabs.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            flex: 1,
                            padding: "12px 4px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 11,
                            color: tab === t ? phase.color : "#4a6080",
                            borderBottom:
                                tab === t
                                    ? `2px solid ${phase.color}`
                                    : "2px solid transparent",
                            transition: "all 0.2s",
                            fontFamily: "inherit",
                            letterSpacing: 0.5,
                        }}
                    >
                        {tabLabels[t]}
                    </button>
                ))}
            </div>

            <div style={{ padding: "20px" }}>
                {/* TODAY TAB */}
                {tab === "today" && (
                    <div>
                        {/* Quote */}
                        <div
                            style={{
                                background: "#0f1923",
                                border: `1px solid ${phase.color}22`,
                                borderLeft: `3px solid ${phase.color}`,
                                borderRadius: 8,
                                padding: "14px 16px",
                                marginBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    color: phase.color,
                                    letterSpacing: 3,
                                    marginBottom: 6,
                                    textTransform: "uppercase",
                                }}
                            >
                                Daily Motivation
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: "#c8d8e8",
                                    lineHeight: 1.6,
                                    fontStyle: "italic",
                                }}
                            >
                                "{quote}"
                            </div>
                        </div>

                        {/* Meal Checklist */}
                        <div style={{ marginBottom: 20 }}>
                            <div
                                style={{
                                    fontSize: 11,
                                    letterSpacing: 3,
                                    color: "#4a6080",
                                    marginBottom: 12,
                                    textTransform: "uppercase",
                                }}
                            >
                                Today's Meals
                            </div>
                            {MEAL_PLAN.map((m, i) => (
                                <div
                                    key={i}
                                    onClick={() => toggleMeal(i)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "12px 14px",
                                        marginBottom: 8,
                                        background: mealsChecked[i]
                                            ? `${phase.color}15`
                                            : "#0f1923",
                                        border: `1px solid ${
                                            mealsChecked[i]
                                                ? phase.color + "44"
                                                : "#1a2535"
                                        }`,
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 4,
                                            border: `1.5px solid ${
                                                mealsChecked[i]
                                                    ? phase.color
                                                    : "#2a3a4a"
                                            }`,
                                            background: mealsChecked[i]
                                                ? phase.color
                                                : "transparent",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            fontSize: 12,
                                        }}
                                    >
                                        {mealsChecked[i] ? "✓" : ""}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: mealsChecked[i]
                                                    ? phase.color
                                                    : "#c8d8e8",
                                            }}
                                        >
                                            {m.emoji}{" "}
                                            {m.meal.split("—")[1]?.trim()}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: "#4a6080",
                                                marginTop: 2,
                                            }}
                                        >
                                            {m.kcal} kcal · {m.protein}g protein
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#4a6080",
                                    textAlign: "right",
                                    marginTop: 4,
                                }}
                            >
                                {mealsChecked.filter(Boolean).length}/4 meals ·{" "}
                                {mealsChecked.reduce(
                                    (s, v, i) =>
                                        s + (v ? MEAL_PLAN[i].kcal : 0),
                                    0
                                )}{" "}
                                kcal logged
                            </div>
                        </div>

                        {/* Log Form */}
                        <div
                            style={{
                                background: "#0f1923",
                                border: "1px solid #1a2535",
                                borderRadius: 10,
                                padding: 16,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    letterSpacing: 3,
                                    color: "#4a6080",
                                    marginBottom: 14,
                                    textTransform: "uppercase",
                                }}
                            >
                                Log Today
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    marginBottom: 10,
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#4a6080",
                                            marginBottom: 5,
                                        }}
                                    >
                                        WEIGHT (kg)
                                    </div>
                                    <input
                                        value={logWeight}
                                        onChange={(e) =>
                                            setLogWeight(e.target.value)
                                        }
                                        type="number"
                                        step="0.1"
                                        placeholder={`e.g. ${latestWeight}`}
                                        style={{
                                            width: "100%",
                                            background: "#080c10",
                                            border: "1px solid #1a2535",
                                            borderRadius: 6,
                                            padding: "9px 10px",
                                            color: "#e8edf2",
                                            fontFamily: "inherit",
                                            fontSize: 13,
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#4a6080",
                                            marginBottom: 5,
                                        }}
                                    >
                                        CALORIES
                                    </div>
                                    <input
                                        value={logCalories}
                                        onChange={(e) =>
                                            setLogCalories(e.target.value)
                                        }
                                        type="number"
                                        placeholder={`e.g. ${phase.calories}`}
                                        style={{
                                            width: "100%",
                                            background: "#080c10",
                                            border: "1px solid #1a2535",
                                            borderRadius: 6,
                                            padding: "9px 10px",
                                            color: "#e8edf2",
                                            fontFamily: "inherit",
                                            fontSize: 13,
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                            </div>
                            <input
                                value={logNote}
                                onChange={(e) => setLogNote(e.target.value)}
                                placeholder="Quick note (optional — e.g. 'Felt strong today')"
                                style={{
                                    width: "100%",
                                    background: "#080c10",
                                    border: "1px solid #1a2535",
                                    borderRadius: 6,
                                    padding: "9px 10px",
                                    color: "#e8edf2",
                                    fontFamily: "inherit",
                                    fontSize: 13,
                                    marginBottom: 10,
                                    boxSizing: "border-box",
                                }}
                            />
                            <button
                                onClick={logToday}
                                style={{
                                    width: "100%",
                                    padding: "11px",
                                    background: saved
                                        ? "#1a3a2a"
                                        : `${phase.color}22`,
                                    border: `1px solid ${
                                        saved ? "#4ade80" : phase.color
                                    }`,
                                    borderRadius: 6,
                                    color: saved ? "#4ade80" : phase.color,
                                    fontFamily: "inherit",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    letterSpacing: 1,
                                    transition: "all 0.3s",
                                }}
                            >
                                {saved ? "✓ Saved!" : "Save Today's Log"}
                            </button>
                        </div>

                        {todayLog && (
                            <div
                                style={{
                                    marginTop: 12,
                                    background: "#0f1923",
                                    border: "1px solid #1a2535",
                                    borderRadius: 8,
                                    padding: 14,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "#4a6080",
                                        letterSpacing: 3,
                                        marginBottom: 8,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Today's Record
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 16,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {todayLog.weight && (
                                        <div>
                                            <span
                                                style={{
                                                    color: "#4a6080",
                                                    fontSize: 10,
                                                }}
                                            >
                                                WEIGHT{" "}
                                            </span>
                                            <span
                                                style={{
                                                    color: phase.color,
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {todayLog.weight}kg
                                            </span>
                                        </div>
                                    )}
                                    {todayLog.calories && (
                                        <div>
                                            <span
                                                style={{
                                                    color: "#4a6080",
                                                    fontSize: 10,
                                                }}
                                            >
                                                CALORIES{" "}
                                            </span>
                                            <span
                                                style={{
                                                    color: phase.color,
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {todayLog.calories}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {todayLog.note && (
                                    <div
                                        style={{
                                            marginTop: 8,
                                            fontSize: 12,
                                            color: "#6a8099",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        "{todayLog.note}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* PROGRESS TAB */}
                {tab === "progress" && (
                    <div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 10,
                                marginBottom: 20,
                            }}
                        >
                            {[
                                {
                                    label: "Current Weight",
                                    value: `${latestWeight}kg`,
                                    sub: `Started at ${data.startWeight}kg`,
                                },
                                {
                                    label: "Total Gained",
                                    value: `+${gained}kg`,
                                    sub: `${remaining}kg remaining`,
                                },
                                {
                                    label: "Current Week",
                                    value: `Week ${week}`,
                                    sub: `Phase ${phase.phase}: ${phase.label}`,
                                },
                                {
                                    label: "Days Logged",
                                    value: allLogs.length,
                                    sub: "Keep the streak!",
                                },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    style={{
                                        background: "#0f1923",
                                        border: "1px solid #1a2535",
                                        borderRadius: 10,
                                        padding: "14px 16px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#4a6080",
                                            letterSpacing: 2,
                                            marginBottom: 6,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {s.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: phase.color,
                                        }}
                                    >
                                        {s.value}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#4a6080",
                                            marginTop: 4,
                                        }}
                                    >
                                        {s.sub}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Weekly Gain Indicator */}
                        <div
                            style={{
                                background: "#0f1923",
                                border: "1px solid #1a2535",
                                borderRadius: 10,
                                padding: 16,
                                marginBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    letterSpacing: 3,
                                    color: "#4a6080",
                                    marginBottom: 14,
                                    textTransform: "uppercase",
                                }}
                            >
                                Weekly Gain Guide
                            </div>
                            {[
                                {
                                    label: "Too slow",
                                    range: "< 0.2kg/week",
                                    color: "#f59e0b",
                                    action: "Add 150 kcal/day",
                                },
                                {
                                    label: "Perfect",
                                    range: "0.25–0.35kg/week",
                                    color: "#4ade80",
                                    action: "Stay the course ✓",
                                },
                                {
                                    label: "Too fast",
                                    range: "> 0.4kg/week",
                                    color: "#f87171",
                                    action: "Cut 150 kcal/day",
                                },
                            ].map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        marginBottom: 10,
                                        padding: "10px 12px",
                                        background: "#080c10",
                                        borderRadius: 6,
                                        border: `1px solid ${r.color}22`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            background: r.color,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <span
                                            style={{
                                                color: r.color,
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {r.label}
                                        </span>
                                        <span
                                            style={{
                                                color: "#4a6080",
                                                fontSize: 11,
                                            }}
                                        >
                                            {" "}
                                            · {r.range}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#4a6080",
                                        }}
                                    >
                                        {r.action}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Log history */}
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    letterSpacing: 3,
                                    color: "#4a6080",
                                    marginBottom: 12,
                                    textTransform: "uppercase",
                                }}
                            >
                                Log History
                            </div>
                            {allLogs.length === 0 && (
                                <div
                                    style={{
                                        color: "#4a6080",
                                        fontSize: 13,
                                        textAlign: "center",
                                        padding: 30,
                                    }}
                                >
                                    No logs yet. Start logging today!
                                </div>
                            )}
                            {allLogs
                                .slice(-10)
                                .reverse()
                                .map(([date, log]) => (
                                    <div
                                        key={date}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "10px 14px",
                                            marginBottom: 6,
                                            background: "#0f1923",
                                            border: "1px solid #1a2535",
                                            borderRadius: 7,
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#4a6080",
                                                }}
                                            >
                                                {date}
                                            </div>
                                            {log.note && (
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: "#4a6080",
                                                        fontStyle: "italic",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    "{log.note}"
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            {log.weight && (
                                                <div
                                                    style={{
                                                        fontSize: 14,
                                                        color: phase.color,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {log.weight}kg
                                                </div>
                                            )}
                                            {log.calories && (
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: "#4a6080",
                                                    }}
                                                >
                                                    {log.calories} kcal
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* MEALS TAB */}
                {tab === "meals" && (
                    <div>
                        <div
                            style={{
                                background: "#0f1923",
                                border: `1px solid ${phase.color}33`,
                                borderRadius: 10,
                                padding: "12px 16px",
                                marginBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#4a6080",
                                    letterSpacing: 2,
                                    marginBottom: 4,
                                    textTransform: "uppercase",
                                }}
                            >
                                Daily Target — Phase {phase.phase}
                            </div>
                            <div style={{ display: "flex", gap: 20 }}>
                                <div>
                                    <span
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: phase.color,
                                        }}
                                    >
                                        {phase.calories}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: "#4a6080",
                                        }}
                                    >
                                        {" "}
                                        kcal
                                    </span>
                                </div>
                                <div>
                                    <span
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: "#e8edf2",
                                        }}
                                    >
                                        155
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: "#4a6080",
                                        }}
                                    >
                                        g protein
                                    </span>
                                </div>
                            </div>
                        </div>

                        {MEAL_PLAN.map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#0f1923",
                                    border: "1px solid #1a2535",
                                    borderRadius: 10,
                                    padding: 16,
                                    marginBottom: 12,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: 10,
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#e8edf2",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {m.emoji} {m.meal}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: "#4a6080",
                                                marginTop: 3,
                                            }}
                                        >
                                            {m.kcal} kcal · {m.protein}g protein
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 10 }}>
                                    {m.items.map((item, j) => (
                                        <div
                                            key={j}
                                            style={{
                                                fontSize: 11,
                                                color: "#6a8099",
                                                padding: "3px 0",
                                                borderBottom:
                                                    j < m.items.length - 1
                                                        ? "1px solid #0f1923"
                                                        : "none",
                                            }}
                                        >
                                            · {item}
                                        </div>
                                    ))}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: phase.color,
                                        background: `${phase.color}11`,
                                        padding: "6px 10px",
                                        borderRadius: 5,
                                    }}
                                >
                                    ⚡ {m.tip}
                                </div>
                            </div>
                        ))}

                        <div
                            style={{
                                background: "#0f1923",
                                border: "1px solid #1a2535",
                                borderRadius: 10,
                                padding: 16,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    letterSpacing: 3,
                                    color: "#4a6080",
                                    marginBottom: 12,
                                    textTransform: "uppercase",
                                }}
                            >
                                GF Safety Checklist
                            </div>
                            {[
                                {
                                    label: "✅ Always safe",
                                    items: "Rice, dal, paneer, eggs, milk, curd, all fruits, all veg, nuts, seeds, ghee, potatoes, roasted chana",
                                },
                                {
                                    label: "⚠️ Check labels",
                                    items: "Oats (must say certified GF), whey protein, peanut butter, spice mixes",
                                },
                                {
                                    label: "🚫 Always avoid",
                                    items: "Wheat roti, regular bread, pasta, seitan, soy sauce, barley",
                                },
                            ].map((s, i) => (
                                <div key={i} style={{ marginBottom: 12 }}>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#c8d8e8",
                                            fontWeight: 600,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {s.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#4a6080",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {s.items}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PLAN TAB */}
                {tab === "plan" && (
                    <div>
                        <div
                            style={{
                                fontSize: 11,
                                letterSpacing: 3,
                                color: "#4a6080",
                                marginBottom: 14,
                                textTransform: "uppercase",
                            }}
                        >
                            32-Week Roadmap
                        </div>
                        {PHASE_CONFIG.map((p) => (
                            <div
                                key={p.phase}
                                style={{
                                    background:
                                        week >= p.weeks[0] && week <= p.weeks[1]
                                            ? `${p.color}10`
                                            : "#0f1923",
                                    border: `1px solid ${
                                        week >= p.weeks[0] && week <= p.weeks[1]
                                            ? p.color + "44"
                                            : "#1a2535"
                                    }`,
                                    borderRadius: 10,
                                    padding: 16,
                                    marginBottom: 12,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: 8,
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: p.color,
                                                fontWeight: 700,
                                            }}
                                        >
                                            Phase {p.phase} — {p.label}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "#4a6080",
                                                marginTop: 2,
                                            }}
                                        >
                                            Weeks {p.weeks[0]}–{p.weeks[1]}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                color: "#e8edf2",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {p.calories} kcal
                                        </div>
                                        {week >= p.weeks[0] &&
                                            week <= p.weeks[1] && (
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: p.color,
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    ← YOU ARE HERE
                                                </div>
                                            )}
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: "#6a8099" }}>
                                    {p.desc}
                                </div>
                                <div
                                    style={{
                                        marginTop: 10,
                                        height: 4,
                                        background: "#080c10",
                                        borderRadius: 2,
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "100%",
                                            borderRadius: 2,
                                            background: p.color,
                                            width:
                                                week > p.weeks[1]
                                                    ? "100%"
                                                    : week < p.weeks[0]
                                                    ? "0%"
                                                    : `${
                                                          ((week - p.weeks[0]) /
                                                              (p.weeks[1] -
                                                                  p.weeks[0])) *
                                                          100
                                                      }%`,
                                            transition: "width 1s ease",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Weekly checklist */}
                        <div
                            style={{
                                background: "#0f1923",
                                border: "1px solid #1a2535",
                                borderRadius: 10,
                                padding: 16,
                                marginTop: 8,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    letterSpacing: 3,
                                    color: "#4a6080",
                                    marginBottom: 14,
                                    textTransform: "uppercase",
                                }}
                            >
                                Weekly Routine
                            </div>
                            {[
                                {
                                    day: "MON",
                                    action: "Official weigh-in (morning, fasted)",
                                    icon: "⚖️",
                                },
                                {
                                    day: "Daily",
                                    action: "Log weight + calories in this app",
                                    icon: "📋",
                                },
                                {
                                    day: "Every 4W",
                                    action: "Reassess — adjust calories ±100–150 kcal",
                                    icon: "🔄",
                                },
                                {
                                    day: "Every 4W",
                                    action: "Check gym progressive overload",
                                    icon: "💪",
                                },
                                {
                                    day: "Batch",
                                    action: "Sunday: cook dal + rice for 3 days",
                                    icon: "🍛",
                                },
                            ].map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        padding: "9px 0",
                                        borderBottom:
                                            i < 4
                                                ? "1px solid #1a2535"
                                                : "none",
                                        alignItems: "center",
                                    }}
                                >
                                    <div style={{ fontSize: 16 }}>{r.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                color: phase.color,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {r.day}{" "}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: "#c8d8e8",
                                            }}
                                        >
                                            {r.action}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
