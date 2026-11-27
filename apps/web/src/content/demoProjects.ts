export type DemoProject = {
  slug: string;
  name: string;
  category: string;
  image: string;
  story: string;
  brief: string;
  duration: string;
  built: string;
  liveUrl: string | null;
  size: "feature" | "tall" | "standard";
};

// Temporary studio demos. This is the single swap-point until projects are
// managed from the admin area.
export const demoProjects: DemoProject[] = [
  { slug: "kazipay", name: "KaziPay", category: "Merchant operations", image: "/projects/kazipay-demo.png", story: "A calmer place to see orders, settlements, and the work still waiting.", brief: "A merchant workspace that shows what needs doing next on a busy day.", duration: "8 weeks", built: "Concept build · 2026", liveUrl: null, size: "feature" },
  { slug: "nyota-health", name: "Nyota Health", category: "Care journeys", image: "/projects/nyota-health-demo.png", story: "Appointment booking and follow-through designed to feel reassuring.", brief: "A care pathway that keeps appointments and follow-up clear from the first screen.", duration: "6 weeks", built: "Concept build · 2026", liveUrl: null, size: "standard" },
  { slug: "juagrid", name: "JuaGrid", category: "Clean energy", image: "/projects/juagrid-demo.png", story: "A complex solar quote becomes a clear, step-by-step decision.", brief: "A solar planning tool that makes system options, savings, and the next decision easy to understand.", duration: "7 weeks", built: "Concept build · 2026", liveUrl: null, size: "tall" },
  { slug: "nuru-learning", name: "Nuru Learning", category: "Education platform", image: "/projects/nuru-learning-demo.png", story: "Learning plans, live discussion, and progress in one focused space.", brief: "One place for students and facilitators to keep a course moving.", duration: "8 weeks", built: "Concept build · 2026", liveUrl: null, size: "standard" },
  { slug: "soko-table", name: "Soko Table", category: "Restaurant operations", image: "/projects/soko-table-demo.png", story: "Ordering, reservations, and the kitchen view share the same information.", brief: "A hospitality workflow that gives front-of-house and kitchen teams the same live picture.", duration: "6 weeks", built: "Concept build · 2026", liveUrl: null, size: "standard" },
  { slug: "staykind", name: "StayKind", category: "Hospitality platform", image: "/projects/staykind-demo.png", story: "A better guest experience from the first booking to check-in.", brief: "One consistent look and feel for guests, from booking through arrival.", duration: "7 weeks", built: "Concept build · 2026", liveUrl: null, size: "tall" },
];
