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
  { slug: "kazipay", name: "KaziPay", category: "Merchant operations", image: "/projects/kazipay-demo.png", story: "A calmer place to see orders, settlements, and the work still waiting.", brief: "A focused merchant workspace that turns a busy day into a clear next action.", duration: "8 weeks", built: "Concept build · 2026", liveUrl: null, size: "feature" },
  { slug: "nyota-health", name: "Nyota Health", category: "Care journeys", image: "/projects/nyota-health-demo.png", story: "Appointment booking and follow-through designed to feel reassuring.", brief: "A care pathway built to make appointments and follow-up feel considered from the first screen.", duration: "6 weeks", built: "Concept build · 2026", liveUrl: null, size: "standard" },
  { slug: "juagrid", name: "JuaGrid", category: "Clean energy", image: "/projects/juagrid-demo.png", story: "A complex solar quote becomes a clear, step-by-step decision.", brief: "A solar planning tool that makes system options, savings, and the next decision easy to understand.", duration: "7 weeks", built: "Concept build · 2026", liveUrl: null, size: "tall" },
  { slug: "nuru-learning", name: "Nuru Learning", category: "Education platform", image: "/projects/nuru-learning-demo.png", story: "Learning plans, live discussion, and progress in one focused space.", brief: "A learning home that gives students and facilitators one calm place to keep momentum.", duration: "8 weeks", built: "Concept build · 2026", liveUrl: null, size: "standard" },
  { slug: "soko-table", name: "Soko Table", category: "Restaurant operations", image: "/projects/soko-table-demo.png", story: "Ordering, reservations, and the kitchen view finally speak to each other.", brief: "A hospitality workflow that gives front-of-house and kitchen teams the same live picture.", duration: "6 weeks", built: "Concept build · 2026", liveUrl: null, size: "standard" },
  { slug: "staykind", name: "StayKind", category: "Hospitality platform", image: "/projects/staykind-demo.png", story: "A better guest experience from the first booking to check-in.", brief: "A stay experience designed to carry one warm visual system from booking through arrival.", duration: "7 weeks", built: "Concept build · 2026", liveUrl: null, size: "tall" },
];
