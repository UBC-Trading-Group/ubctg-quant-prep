export type DecompositionField = {
  label: string;
  benchmark: number;
  suffix?: string;
};

export type FermiPrompt = {
  id: string;
  prompt: string;
  category: string;
  answer: number;
  unit: string;
  assumption: string;
  decomposition: DecompositionField[];
  crowdMedian: number;
  crowdLow: number;
  crowdHigh: number;
};

export type MarketAssumption = {
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  suffix?: string;
  prefix?: string;
};

export type MarketPrompt = {
  id: string;
  prompt: string;
  answer: number;
  unit: string;
  assumptions: [MarketAssumption, MarketAssumption, MarketAssumption, MarketAssumption];
};

export const fermiPrompts: FermiPrompt[] = [
  {
    id: "ubc-coffees-today",
    prompt: "How many coffees are sold on UBC campus today?",
    category: "UBC campus",
    answer: 25000,
    unit: "coffees",
    assumption: "People on campus x coffee-buying rate x cups per buyer.",
    decomposition: [
      { label: "People on campus today", benchmark: 65000 },
      { label: "Share buying coffee", benchmark: 0.32, suffix: "as decimal" },
      { label: "Cups per buyer", benchmark: 1.2 },
    ],
    crowdMedian: 18000,
    crowdLow: 9000,
    crowdHigh: 40000,
  },
  {
    id: "sauder-right-now",
    prompt: "How many students are in Sauder right now?",
    category: "UBC campus",
    answer: 1200,
    unit: "students",
    assumption: "Rooms in use x seats per room x occupancy.",
    decomposition: [
      { label: "Rooms and open areas in use", benchmark: 55 },
      { label: "Average seats per area", benchmark: 35 },
      { label: "Occupancy rate", benchmark: 0.62, suffix: "as decimal" },
    ],
    crowdMedian: 900,
    crowdLow: 450,
    crowdHigh: 1800,
  },
  {
    id: "ikb-laptops",
    prompt: "How many laptops are open in IKB at 3pm?",
    category: "UBC campus",
    answer: 1400,
    unit: "laptops",
    assumption: "Study seats x occupancy x laptop share.",
    decomposition: [
      { label: "Study seats", benchmark: 2200 },
      { label: "Occupancy rate", benchmark: 0.8, suffix: "as decimal" },
      { label: "Share with laptops open", benchmark: 0.8, suffix: "as decimal" },
    ],
    crowdMedian: 1600,
    crowdLow: 800,
    crowdHigh: 2500,
  },
  {
    id: "ubc-exchange-boardings",
    prompt: "How many daily bus boardings happen at UBC Exchange?",
    category: "Transit",
    answer: 75000,
    unit: "boardings",
    assumption: "Peak buses + off-peak buses, times average passengers.",
    decomposition: [
      { label: "Buses per day", benchmark: 1500 },
      { label: "Average boardings per bus", benchmark: 50 },
    ],
    crowdMedian: 60000,
    crowdLow: 25000,
    crowdHigh: 120000,
  },
  {
    id: "main-mall-airpods",
    prompt: "How many students wear AirPods on Main Mall at noon?",
    category: "UBC campus",
    answer: 1800,
    unit: "students",
    assumption: "People passing through x share wearing AirPods.",
    decomposition: [
      { label: "People passing in the noon window", benchmark: 9000 },
      { label: "Share wearing AirPods", benchmark: 0.2, suffix: "as decimal" },
    ],
    crowdMedian: 2200,
    crowdLow: 700,
    crowdHigh: 5000,
  },
  {
    id: "bubble-tea-month",
    prompt: "How many bubble tea cups are sold within 1km of campus per month?",
    category: "Local market",
    answer: 45000,
    unit: "cups",
    assumption: "Student buyers x cups per buyer per month plus local demand.",
    decomposition: [
      { label: "Active buyers", benchmark: 15000 },
      { label: "Cups per buyer per month", benchmark: 2.5 },
      { label: "Local demand multiplier", benchmark: 1.2 },
    ],
    crowdMedian: 36000,
    crowdLow: 15000,
    crowdHigh: 90000,
  },
  {
    id: "rides-friday-night",
    prompt: "How many Uber or Lyft rides end near campus on a Friday night?",
    category: "Local market",
    answer: 3500,
    unit: "rides",
    assumption: "Students out late x rideshare share x inbound rides per rider.",
    decomposition: [
      { label: "Students out late", benchmark: 14000 },
      { label: "Share using rideshare", benchmark: 0.22, suffix: "as decimal" },
      { label: "Inbound rides per rideshare user", benchmark: 1.1 },
    ],
    crowdMedian: 2500,
    crowdLow: 900,
    crowdHigh: 7000,
  },
  {
    id: "club-attendees-week",
    prompt: "How many club event attendees are there across UBC in one week?",
    category: "UBC campus",
    answer: 12000,
    unit: "attendees",
    assumption: "Active clubs x events per week x attendance.",
    decomposition: [
      { label: "Active clubs running events", benchmark: 300 },
      { label: "Events per club per week", benchmark: 0.8 },
      { label: "Average attendees per event", benchmark: 50 },
    ],
    crowdMedian: 9000,
    crowdLow: 3000,
    crowdHigh: 30000,
  },
  {
    id: "campus-parking-revenue",
    prompt: "What is annual paid parking revenue around UBC campus?",
    category: "Finance",
    answer: 28000000,
    unit: "dollars",
    assumption: "Paid spaces x utilization x average daily rate x days.",
    decomposition: [
      { label: "Paid spaces", benchmark: 6000 },
      { label: "Utilization", benchmark: 0.75, suffix: "as decimal" },
      { label: "Average daily rate", benchmark: 17, suffix: "dollars" },
      { label: "Paid days per year", benchmark: 365 },
    ],
    crowdMedian: 18000000,
    crowdLow: 6000000,
    crowdHigh: 60000000,
  },
  {
    id: "vancouver-coffee-day",
    prompt: "How many coffees are sold in Vancouver in one day?",
    category: "World estimation",
    answer: 420000,
    unit: "coffees",
    assumption: "Population x coffee-buying share x cups per buyer.",
    decomposition: [
      { label: "People in Vancouver area", benchmark: 1400000 },
      { label: "Share buying coffee today", benchmark: 0.25, suffix: "as decimal" },
      { label: "Cups per buyer", benchmark: 1.2 },
    ],
    crowdMedian: 300000,
    crowdLow: 100000,
    crowdHigh: 900000,
  },
  {
    id: "canada-atm-withdrawals",
    prompt: "How many ATM cash withdrawals happen in Canada per day?",
    category: "Finance",
    answer: 850000,
    unit: "withdrawals",
    assumption: "Adults x monthly withdrawal frequency divided by days.",
    decomposition: [
      { label: "Adults", benchmark: 31000000 },
      { label: "Withdrawals per adult per month", benchmark: 0.8 },
      { label: "Monthly-to-daily conversion", benchmark: 0.033, suffix: "about 1/30" },
    ],
    crowdMedian: 1200000,
    crowdLow: 250000,
    crowdHigh: 4000000,
  },
  {
    id: "lecture-hall-phone-checks",
    prompt: "How many phone unlocks happen in a 300-person lecture?",
    category: "Behavior",
    answer: 900,
    unit: "unlocks",
    assumption: "Students x lecture length x unlocks per student per hour.",
    decomposition: [
      { label: "Students", benchmark: 300 },
      { label: "Lecture hours", benchmark: 1.5 },
      { label: "Unlocks per student per hour", benchmark: 2 },
    ],
    crowdMedian: 700,
    crowdLow: 200,
    crowdHigh: 2000,
  },
];

export const marketPrompts: MarketPrompt[] = [
  {
    id: "annual-bubble-tea-ubc",
    prompt: "Estimate annual bubble tea spend around UBC.",
    unit: "dollars per year",
    answer: 6200000,
    assumptions: [
      { label: "Reachable students and locals", min: 10000, max: 90000, step: 1000, defaultValue: 70000 },
      { label: "Buyer penetration", min: 0.05, max: 0.7, step: 0.01, defaultValue: 0.35, suffix: "as decimal" },
      { label: "Cups per buyer per year", min: 4, max: 120, step: 1, defaultValue: 36 },
      { label: "Average price", min: 3, max: 12, step: 0.25, defaultValue: 7, prefix: "$" },
    ],
  },
  {
    id: "annual-campus-coffee",
    prompt: "Estimate annual coffee spend on UBC campus.",
    unit: "dollars per year",
    answer: 21000000,
    assumptions: [
      { label: "Daily campus population", min: 20000, max: 100000, step: 1000, defaultValue: 65000 },
      { label: "Coffee-buying share", min: 0.05, max: 0.8, step: 0.01, defaultValue: 0.4, suffix: "as decimal" },
      { label: "Cups per buyer per year", min: 20, max: 280, step: 5, defaultValue: 180 },
      { label: "Average price", min: 2, max: 8, step: 0.25, defaultValue: 4.5, prefix: "$" },
    ],
  },
  {
    id: "monthly-food-delivery-campus",
    prompt: "Estimate monthly food delivery spend near campus.",
    unit: "dollars per month",
    answer: 5200000,
    assumptions: [
      { label: "Potential ordering users", min: 10000, max: 80000, step: 1000, defaultValue: 40000 },
      { label: "Monthly active share", min: 0.05, max: 0.8, step: 0.01, defaultValue: 0.45, suffix: "as decimal" },
      { label: "Orders per active user", min: 1, max: 12, step: 0.5, defaultValue: 5 },
      { label: "Average order value", min: 10, max: 45, step: 1, defaultValue: 24, prefix: "$" },
    ],
  },
  {
    id: "annual-student-transit-pass",
    prompt: "Estimate annual student transit-pass value at UBC.",
    unit: "dollars per year",
    answer: 36000000,
    assumptions: [
      { label: "Eligible students", min: 30000, max: 85000, step: 1000, defaultValue: 60000 },
      { label: "Participation share", min: 0.4, max: 1, step: 0.01, defaultValue: 0.95, suffix: "as decimal" },
      { label: "Months charged", min: 4, max: 12, step: 1, defaultValue: 8 },
      { label: "Monthly pass value", min: 30, max: 120, step: 5, defaultValue: 80, prefix: "$" },
    ],
  },
  {
    id: "weekly-club-sponsorship-market",
    prompt: "Estimate weekly sponsor impressions from UBC club events.",
    unit: "impressions per week",
    answer: 180000,
    assumptions: [
      { label: "Events per week", min: 50, max: 600, step: 10, defaultValue: 240 },
      { label: "Average attendees", min: 10, max: 250, step: 5, defaultValue: 50 },
      { label: "Sponsor views per attendee", min: 1, max: 10, step: 0.5, defaultValue: 5 },
      { label: "Online multiplier", min: 0.5, max: 5, step: 0.1, defaultValue: 3 },
    ],
  },
];

export function formatEstimate(value: number) {
  const maximumFractionDigits = Math.abs(value) < 10 && !Number.isInteger(value) ? 2 : 0;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

export function factorError(estimate: number, answer: number) {
  if (estimate <= 0 || answer <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(estimate / answer, answer / estimate);
}

export function logPosition(value: number, min: number, max: number) {
  const safeMin = Math.max(min, 1e-9);
  const safeMax = Math.max(max, safeMin * 10);
  const safeValue = Math.min(Math.max(value, safeMin), safeMax);
  return ((Math.log10(safeValue) - Math.log10(safeMin)) / (Math.log10(safeMax) - Math.log10(safeMin))) * 100;
}
