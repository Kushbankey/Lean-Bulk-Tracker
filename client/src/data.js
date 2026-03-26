export const PHASE_CONFIG = [
  {
    phase: 1,
    weeks: [1, 4],
    label: "Foundation",
    calories: 2800,
    protein: 155,
    color: "#4ade80",
    desc: "Adapt to surplus, build habits",
  },
  {
    phase: 2,
    weeks: [5, 16],
    label: "Growth",
    calories: 2900,
    protein: 160,
    color: "#60a5fa",
    desc: "Progressive overload, protein priority",
  },
  {
    phase: 3,
    weeks: [17, 32],
    label: "Push",
    calories: 3000,
    protein: 165,
    color: "#f472b6",
    desc: "Plateau-busting, reassess monthly",
  },
];

export const MEAL_PLAN = [
  {
    meal: "Meal 1 — Breakfast (7\u20138 AM)",
    emoji: "\ud83c\udf05",
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
    tip: "Prep overnight \u2014 zero morning effort",
  },
  {
    meal: "Meal 2 — Lunch (12\u20131 PM)",
    emoji: "\ud83c\udf71",
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
    tip: "Use pre-cooked rice \u2014 10 min total",
  },
  {
    meal: "Meal 3 — Snack (4\u20135 PM)",
    emoji: "\ud83e\udd64",
    kcal: 580,
    protein: 30,
    items: [
      "300ml whole milk",
      "1 scoop GF whey protein",
      "2 tbsp peanut butter",
      "1 banana",
      "50g roasted chana",
    ],
    tip: "Blend in 30 seconds \u2014 zero cooking",
  },
  {
    meal: "Meal 4 — Dinner (8\u20139 PM)",
    emoji: "\ud83c\udf5b",
    kcal: 640,
    protein: 38,
    items: [
      "80g moong/masoor dal",
      "200g rice or sweet potato",
      "100g paneer or tofu",
      "1 tbsp ghee",
      "150ml milk/curd",
    ],
    tip: "Batch-cook dal for 3\u20134 days",
  },
];

export const QUOTES = [
  "Every meal is a rep. Every rep builds the body you want.",
  "You're not just eating \u2014 you're engineering yourself.",
  "Consistency beats intensity. Show up today.",
  "10kg is 10 months of discipline. You're already on day one.",
  "The body achieves what the mind believes.",
  "Small surpluses, compounded daily, build great physiques.",
  "Track it. Eat it. Lift it. Repeat.",
  "Your future body is being built right now, one meal at a time.",
  "Discipline is choosing between what you want now and what you want most.",
  "Success is the sum of small efforts repeated day in and day out.",
  "You don't have to be extreme, just consistent.",
  "The only bad workout is the one that didn't happen.",
  "Gains aren't made in the gym \u2014 they're made in the kitchen.",
  "Progress is progress, no matter how small.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "The difference between who you are and who you want to be is what you do.",
  "It's not about being the best. It's about being better than yesterday.",
];

export const GF_SAFETY = [
  {
    label: "Always safe",
    emoji: "\u2705",
    items: "Rice, dal, paneer, eggs, milk, curd, all fruits, all veg, nuts, seeds, ghee, potatoes, roasted chana",
  },
  {
    label: "Check labels",
    emoji: "\u26a0\ufe0f",
    items: "Oats (must say certified GF), whey protein, peanut butter, spice mixes",
  },
  {
    label: "Always avoid",
    emoji: "\ud83d\udeab",
    items: "Wheat roti, regular bread, pasta, seitan, soy sauce, barley",
  },
];

export const BATCH_TIPS = [
  { title: "Sunday Prep", desc: "Cook dal + rice for 3\u20134 days. Store in airtight containers." },
  { title: "Overnight Oats", desc: "Mix yogurt + oats + chia + honey the night before. Grab and eat." },
  { title: "Smoothie Bags", desc: "Pre-portion banana + PB + protein in freezer bags. Add milk and blend." },
  { title: "Paneer Blocks", desc: "Cut and marinate paneer in advance. Pan-fry in 5 min when needed." },
];

export function getPhaseForWeek(week) {
  return PHASE_CONFIG.find((p) => week >= p.weeks[0] && week <= p.weeks[1]) || PHASE_CONFIG[2];
}

export function getWeekNumber(startDate) {
  if (!startDate) return 1;
  const diff = Date.now() - new Date(startDate).getTime();
  return Math.min(Math.max(1, Math.ceil(diff / (7 * 24 * 3600 * 1000))), 32);
}

export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}
