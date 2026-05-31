// All traits on a 1–5 numerical scale (precise psychometric)
export type Trait = {
  leadership: number;   // 1 = pure execution → 5 = high leadership / delegation
  analytical: number;   // 1 = high-level concepts → 5 = deep data rigor
  complexity: number;   // 1 = single-thread tasks → 5 = thrives in complex systems
  research: number;     // 1 = quick intuition → 5 = exhaustive methodical research
  vision: number;       // 1 = tactical executor → 5 = strategic visionary
};

export const TRAIT_META: {
  key: keyof Trait;
  label: string;
  left: string;
  right: string;
  helpers: Record<number, string>;
}[] = [
  {
    key: "leadership",
    label: "Leadership vs. Execution",
    left: "Execution",
    right: "Leadership",
    helpers: {
      1: "Thrives in core execution and milestone delivery.",
      2: "Thrives in core execution and milestone delivery.",
      3: "Balanced collaborator, coordinates tasks easily.",
      4: "Highly effective with shared vision, delegates appropriately.",
      5: "Highly effective with shared vision, delegates appropriately.",
    },
  },
  {
    key: "analytical",
    label: "Analytical Rigor",
    left: "Conceptual",
    right: "Deeply Analytical",
    helpers: {
      1: "Focuses on high-level concepts and ideas.",
      2: "Focuses on high-level concepts and ideas.",
      3: "Balanced approach to data and concepts.",
      4: "Thrives in deep data — watches project scope carefully.",
      5: "Thrives in deep data — watches project scope carefully.",
    },
  },
  {
    key: "complexity",
    label: "Complexity Capability",
    left: "Focused scope",
    right: "Complex systems",
    helpers: {
      1: "Performs best with single-thread, well-scoped tasks.",
      2: "Performs best with single-thread, well-scoped tasks.",
      3: "Comfortable juggling 2–3 parallel workstreams.",
      4: "Energised by interdependent, multi-stakeholder problems.",
      5: "Energised by interdependent, multi-stakeholder problems.",
    },
  },
  {
    key: "research",
    label: "Research Rigor",
    left: "Intuitive",
    right: "Methodical",
    helpers: {
      1: "Moves quickly on intuition and prior knowledge.",
      2: "Moves quickly on intuition and prior knowledge.",
      3: "Cross-checks key claims with 2–3 reliable sources.",
      4: "Methodical, peer-reviewed sourcing — protects academic credibility.",
      5: "Methodical, peer-reviewed sourcing — protects academic credibility.",
    },
  },
  {
    key: "vision",
    label: "Strategic Vision",
    left: "Tactical",
    right: "Visionary",
    helpers: {
      1: "Tactical executor — translates strategy into clean deliverables.",
      2: "Tactical executor — translates strategy into clean deliverables.",
      3: "Connects daily tasks to the bigger project narrative.",
      4: "Reframes the brief — spots strategic opportunities others miss.",
      5: "Reframes the brief — spots strategic opportunities others miss.",
    },
  },
];

export type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string; // initials
  program: string;
  semester: string;
  course: string;
  traits: Trait;
  strengths: string[];
  weaknesses: string[];
  role: string;
  bio: string;
};

export const CBS_COURSES = [
  "Digital Literacy (Prof. Stratmann)",
  "Financial Management & Corporate Finance (Prof. Becker)",
  "Sustainable Business Models & Ethics (Prof. Weber)",
  "Strategic Management & International Marketing (Prof. Schmidt)",
  "Data Analytics & Business Intelligence (Prof. Hoffmann)",
  "Advanced Corporate Strategy (Prof. Müller)",
  "Organizational Behavior (Prof. Weber)",
];

export const CBS_DEGREES = [
  "B.Sc. International Business",
  "B.Sc. Business Psychology",
  "B.A. Digital Business",
  "M.Sc. Digital Management",
  "M.A. Strategic Management",
  "M.Sc. Financial Management",
  "MBA",
];

export const CBS_SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
];

export const STRENGTH_OPTIONS = [
  "Public Speaking",
  "Data Analysis",
  "Time Management",
  "Slide Design",
  "Research",
  "Writing & Editing",
  "Project Coordination",
  "Coding / Excel",
  "Critical Thinking",
  "Creative Ideation",
  "Data Visualization",
  "Rapid Prototyping",
  "Peer Coaching",
  "Ethical Reasoning",
  "Strategic Presentation",
  "Agile Methodology",
];

export const WEAKNESS_OPTIONS = [
  "Procrastination",
  "Detail Blindness",
  "Conflict Avoidance",
  "Perfectionism",
  "Public Speaking Anxiety",
  "Over-Committing",
  "Disorganization",
  "Research Method Rigor",
  "Research Design",
];

// 14 robust mock CBS students with 1-5 trait scores
export const MOCK_STUDENTS: Student[] = [
  {
    id: "s1", name: "Lena Hoffmann", email: "lena.hoffmann@cbs-mail.de", avatar: "LH",
    program: "M.A. Strategic Management", semester: "Semester 3",
    course: "Advanced Corporate Strategy (Prof. Müller)",
    traits: { leadership: 5, analytical: 4, complexity: 4, research: 4, vision: 5 },
    strengths: ["Project Coordination", "Strategic Presentation", "Critical Thinking"],
    weaknesses: ["Perfectionism", "Conflict Avoidance"],
    role: "Team Lead & Strategist",
    bio: "Keeps the team aligned, sets milestones, and runs decisive stand-ups.",
  },
  {
    id: "s2", name: "Jonas Becker", email: "jonas.becker@cbs-mail.de", avatar: "JB",
    program: "B.Sc. International Business", semester: "Semester 5",
    course: "Data Analytics for Business (Prof. Hoffmann)",
    traits: { leadership: 2, analytical: 5, complexity: 5, research: 5, vision: 3 },
    strengths: ["Data Analysis", "Coding / Excel", "Data Visualization"],
    weaknesses: ["Public Speaking Anxiety", "Detail Blindness"],
    role: "Data & Insights Lead",
    bio: "Turns messy datasets into the evidence that wins the argument.",
  },
  {
    id: "s3", name: "Sophia Weber", email: "sophia.weber@cbs-mail.de", avatar: "SW",
    program: "B.A. Digital Business", semester: "Semester 4",
    course: "International Marketing (Prof. Schmidt)",
    traits: { leadership: 3, analytical: 2, complexity: 3, research: 2, vision: 4 },
    strengths: ["Slide Design", "Creative Ideation", "Writing & Editing"],
    weaknesses: ["Procrastination", "Disorganization"],
    role: "Creative & Narrative Lead",
    bio: "Crafts the deck and the story arc that makes the panel lean in.",
  },
  {
    id: "s4", name: "Maximilian Schulz", email: "max.schulz@cbs-mail.de", avatar: "MS",
    program: "M.Sc. Financial Management", semester: "Semester 2",
    course: "Financial Modelling (Prof. Becker)",
    traits: { leadership: 3, analytical: 5, complexity: 4, research: 4, vision: 3 },
    strengths: ["Data Analysis", "Critical Thinking", "Time Management"],
    weaknesses: ["Conflict Avoidance"],
    role: "Analyst & Quality Anchor",
    bio: "Pressure-tests every assumption before submission day.",
  },
  {
    id: "s5", name: "Amélie Dubois", email: "amelie.dubois@cbs-mail.de", avatar: "AD",
    program: "B.A. Digital Business", semester: "Semester 2",
    course: "Digital Literacy (Prof. Stratmann)",
    traits: { leadership: 4, analytical: 3, complexity: 3, research: 3, vision: 4 },
    strengths: ["Public Speaking", "Strategic Presentation", "Writing & Editing"],
    weaknesses: ["Over-Committing"],
    role: "Presenter & Storyteller",
    bio: "The voice in the room — pitches calmly and answers Q&A on her feet.",
  },
  {
    id: "s6", name: "Rohan Verma", email: "rohan.verma@cbs-mail.de", avatar: "RV",
    program: "M.A. Strategic Management", semester: "Semester 1",
    course: "Advanced Corporate Strategy (Prof. Müller)",
    traits: { leadership: 4, analytical: 4, complexity: 5, research: 4, vision: 4 },
    strengths: ["Project Coordination", "Agile Methodology", "Time Management"],
    weaknesses: ["Detail Blindness"],
    role: "Operations Lead",
    bio: "Owns the Gantt chart and keeps every workstream on schedule.",
  },
  {
    id: "s7", name: "Clara Fischer", email: "clara.fischer@cbs-mail.de", avatar: "CF",
    program: "B.Sc. International Business", semester: "Semester 3",
    course: "Organizational Behavior (Prof. Weber)",
    traits: { leadership: 2, analytical: 3, complexity: 3, research: 5, vision: 3 },
    strengths: ["Writing & Editing", "Research", "Ethical Reasoning"],
    weaknesses: ["Procrastination"],
    role: "Research & Docs Lead",
    bio: "Citations, references, and a clean executive summary every time.",
  },
  {
    id: "s8", name: "Felix Krüger", email: "felix.krueger@cbs-mail.de", avatar: "FK",
    program: "B.A. Digital Business", semester: "Semester 4",
    course: "Data Analytics for Business (Prof. Hoffmann)",
    traits: { leadership: 2, analytical: 5, complexity: 4, research: 3, vision: 3 },
    strengths: ["Coding / Excel", "Rapid Prototyping", "Data Visualization"],
    weaknesses: ["Public Speaking Anxiety", "Procrastination"],
    role: "Technical Builder",
    bio: "Prototypes the dashboard while everyone else is still scoping.",
  },
  {
    id: "s9", name: "Isabella Conti", email: "isabella.conti@cbs-mail.de", avatar: "IC",
    program: "M.Sc. Financial Management", semester: "Semester 2",
    course: "International Marketing (Prof. Schmidt)",
    traits: { leadership: 5, analytical: 3, complexity: 4, research: 3, vision: 5 },
    strengths: ["Public Speaking", "Project Coordination", "Strategic Presentation"],
    weaknesses: ["Perfectionism"],
    role: "Stakeholder & Pitch Lead",
    bio: "Manages prof check-ins and delivers a confident final pitch.",
  },
  {
    id: "s10", name: "Tobias Lang", email: "tobias.lang@cbs-mail.de", avatar: "TL",
    program: "B.Sc. International Business", semester: "Semester 5",
    course: "Advanced Corporate Strategy (Prof. Müller)",
    traits: { leadership: 3, analytical: 3, complexity: 3, research: 4, vision: 3 },
    strengths: ["Research", "Slide Design", "Peer Coaching"],
    weaknesses: ["Over-Committing", "Disorganization"],
    role: "Generalist Contributor",
    bio: "Plugs into any workstream that needs an extra pair of hands.",
  },
  {
    id: "s11", name: "Mei Tanaka", email: "mei.tanaka@cbs-mail.de", avatar: "MT",
    program: "M.A. Strategic Management", semester: "Semester 3",
    course: "Organizational Behavior (Prof. Weber)",
    traits: { leadership: 4, analytical: 4, complexity: 5, research: 4, vision: 5 },
    strengths: ["Data Analysis", "Critical Thinking", "Project Coordination"],
    weaknesses: ["Conflict Avoidance"],
    role: "Strategy Analyst",
    bio: "Frames the problem crisply so the team stops debating in circles.",
  },
  {
    id: "s12", name: "Noah Bauer", email: "noah.bauer@cbs-mail.de", avatar: "NB",
    program: "B.A. Digital Business", semester: "Semester 2",
    course: "Digital Literacy (Prof. Stratmann)",
    traits: { leadership: 2, analytical: 2, complexity: 2, research: 2, vision: 4 },
    strengths: ["Creative Ideation", "Slide Design", "Rapid Prototyping"],
    weaknesses: ["Detail Blindness", "Disorganization"],
    role: "Visual Designer",
    bio: "Designs slides that don't look like every other CBS submission.",
  },
  {
    id: "s13", name: "Aisha Karim", email: "aisha.karim@cbs-mail.de", avatar: "AK",
    program: "M.A. Strategic Management", semester: "Semester 1",
    course: "Organizational Behavior (Prof. Weber)",
    traits: { leadership: 5, analytical: 3, complexity: 4, research: 4, vision: 5 },
    strengths: ["Peer Coaching", "Ethical Reasoning", "Public Speaking"],
    weaknesses: ["Research Method Rigor"],
    role: "Facilitator & Coach",
    bio: "Unblocks teammates and keeps morale and ethics on the table.",
  },
  {
    id: "s14", name: "Lukas Vogel", email: "lukas.vogel@cbs-mail.de", avatar: "LV",
    program: "M.Sc. Financial Management", semester: "Semester 2",
    course: "Financial Modelling (Prof. Becker)",
    traits: { leadership: 3, analytical: 5, complexity: 5, research: 5, vision: 3 },
    strengths: ["Agile Methodology", "Data Visualization", "Research"],
    weaknesses: ["Public Speaking Anxiety", "Research Design"],
    role: "Research Engineer",
    bio: "Builds the analytical backbone — clean models, tight assumptions.",
  },
];

export const ICEBREAKERS = [
  "Each share the most cursed group project you've survived — winner picks the café.",
  "Round-robin: one CBS prof you'd hire as a CEO, and why nobody else would.",
  "Two truths and a lie — but at least one truth must be about a deadline you missed.",
  "If this project were a Netflix show, what's the title and who's the villain?",
];

export type UserProfile = {
  name: string;
  email: string;
  course: string;
  degree: string;
  semester: string;
  traits: Trait;
  strengths: string[];
  weaknesses: string[];
};

// Matching algorithm: pick 3 teammates that maximize trait diversity & cover weaknesses
export function matchTeam(user: UserProfile, pool: Student[]): Student[] {
  const userStrengthsSet = new Set(user.strengths);
  const userWeaknessesSet = new Set(user.weaknesses);

  const scored = pool.map((s) => {
    let score = 0;
    // Trait diversity on 1-5 scale (multiplied so it stays comparable)
    score += Math.abs(s.traits.leadership - user.traits.leadership) * 6;
    score += Math.abs(s.traits.analytical - user.traits.analytical) * 7;
    score += Math.abs(s.traits.complexity - user.traits.complexity) * 5;
    score += Math.abs(s.traits.research - user.traits.research) * 5;
    score += Math.abs(s.traits.vision - user.traits.vision) * 5;
    s.strengths.forEach((str) => {
      if (userWeaknessesSet.has(weaknessToStrength(str))) score += 40;
      if (!userStrengthsSet.has(str)) score += 10;
    });
    return { student: s, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const chosen: Student[] = [];
  const covered = new Set<string>(user.strengths);
  for (const { student } of scored) {
    if (chosen.length >= 3) break;
    const adds = student.strengths.filter((s) => !covered.has(s)).length;
    if (chosen.length < 2 || adds >= 1) {
      chosen.push(student);
      student.strengths.forEach((s) => covered.add(s));
    }
  }
  while (chosen.length < 3) {
    const next = scored.find((s) => !chosen.includes(s.student));
    if (!next) break;
    chosen.push(next.student);
  }
  return chosen;
}

function weaknessToStrength(s: string): string {
  const map: Record<string, string> = {
    "Public Speaking": "Public Speaking Anxiety",
    "Strategic Presentation": "Public Speaking Anxiety",
    "Time Management": "Procrastination",
    "Agile Methodology": "Disorganization",
    "Project Coordination": "Disorganization",
    "Slide Design": "Detail Blindness",
    "Data Visualization": "Detail Blindness",
    "Research": "Research Method Rigor",
    "Ethical Reasoning": "Conflict Avoidance",
    "Peer Coaching": "Conflict Avoidance",
  };
  return map[s] ?? s;
}

// Use combined complexity + research rigor as a proxy for serious focus window
export function computeMeetingWindow(team: Student[], user: UserProfile): string {
  const avg =
    (team.reduce((a, s) => a + s.traits.complexity, 0) + user.traits.complexity) /
    (team.length + 1);
  if (avg >= 4) return "Tue & Thu · 09:00 – 11:00";
  if (avg >= 3) return "Mon & Wed · 14:00 – 16:00";
  return "Wed & Fri · 18:00 – 20:00";
}

export function hasProcrastinators(team: Student[], user: UserProfile): boolean {
  const all = [user.weaknesses, ...team.map((t) => t.weaknesses)].flat();
  return all.includes("Procrastination") || all.includes("Over-Committing");
}
export function hasDetailIssues(team: Student[], user: UserProfile): boolean {
  const all = [user.weaknesses, ...team.map((t) => t.weaknesses)].flat();
  return all.includes("Detail Blindness") || all.includes("Disorganization");
}
export function hasConflictAvoidance(team: Student[], user: UserProfile): boolean {
  const all = [user.weaknesses, ...team.map((t) => t.weaknesses)].flat();
  return all.includes("Conflict Avoidance") || all.includes("Perfectionism");
}
export function hasResearchGaps(team: Student[], user: UserProfile): boolean {
  const all = [user.weaknesses, ...team.map((t) => t.weaknesses)].flat();
  return all.includes("Research Method Rigor") || all.includes("Research Design");
}
export function hasSpeakingAnxiety(team: Student[], user: UserProfile): boolean {
  const all = [user.weaknesses, ...team.map((t) => t.weaknesses)].flat();
  return all.includes("Public Speaking Anxiety");
}

export function pickIcebreaker(seed: number): string {
  return ICEBREAKERS[seed % ICEBREAKERS.length];
}

// ---------- Insights, charter, calendar, timeline, feedback ----------

export type Insight = { kind: "synergy" | "risk" | "coverage"; title: string; body: string; pct?: number };

export function generateInsights(user: UserProfile, team: Student[]): Insight[] {
  const insights: Insight[] = [];
  const userIsAnalytical = user.traits.analytical >= 4;
  const lead = team.find((s) => s.traits.leadership >= 4);
  const dataPerson = team.find((s) => s.traits.analytical >= 4);
  const presenter = team.find((s) => s.strengths.some((x) => x.includes("Public Speaking") || x.includes("Strategic Presentation")));

  if (lead) {
    insights.push({
      kind: "synergy",
      title: "Key Synergy Found",
      body: `Pairing your meticulous planning with ${lead.name.split(" ")[0]}'s strategic communication. A 94% compatibility match.`,
      pct: 94,
    });
  }
  if (userIsAnalytical) {
    const weakOne = team.find((s) => s.weaknesses.includes("Detail Blindness") || s.weaknesses.includes("Research Design"));
    if (weakOne) {
      insights.push({
        kind: "risk",
        title: "Potential Risk Balance",
        body: `Your exceptional Analytical Rigor directly covers ${weakOne.name.split(" ")[0]}'s weakness in quantitative data tracking.`,
        pct: 88,
      });
    }
  }
  if (dataPerson && presenter && dataPerson.id !== presenter.id) {
    insights.push({
      kind: "coverage",
      title: "Pitch-Ready Pipeline",
      body: `${dataPerson.name.split(" ")[0]} builds the evidence, ${presenter.name.split(" ")[0]} delivers it — your pitch will not stall on Q&A.`,
      pct: 91,
    });
  }
  if (insights.length < 3) {
    insights.push({
      kind: "coverage",
      title: "Weakness Coverage",
      body: `Every declared gap in your profile is covered by at least one teammate's top-3 strength.`,
      pct: 92,
    });
  }
  return insights.slice(0, 3);
}

export type CharterRule = { title: string; body: string };

export function generateCharter(user: UserProfile, team: Student[]): CharterRule[] {
  const rules: CharterRule[] = [];
  if (hasProcrastinators(team, user) || hasDetailIssues(team, user)) {
    rules.push({
      title: "Milestone Lock (48h)",
      body: "Internal project milestones are strictly locked 48 hours prior to official CBS submission to safeguard final review quality.",
    });
  }
  if (hasDetailIssues(team, user)) {
    rules.push({
      title: "Two-Eyes Review",
      body: "Every deliverable section requires a second teammate's sign-off in the shared tracker before being marked done.",
    });
  }
  if (hasConflictAvoidance(team, user)) {
    rules.push({
      title: "Disagreement Protocol",
      body: "If a decision stalls more than 24 hours, the Team Lead calls a 15-minute sync. Silent dissent is not consent.",
    });
  }
  if (hasResearchGaps(team, user)) {
    rules.push({
      title: "Source Standard",
      body: "Every quantitative claim cites a peer-reviewed source or a CBS-approved database — no Wikipedia in final deliverables.",
    });
  }
  if (hasSpeakingAnxiety(team, user)) {
    rules.push({
      title: "Pitch Rehearsal Cadence",
      body: "Two full dry-runs scheduled 72h and 24h before the live presentation, with rotating speaker order to share exposure.",
    });
  }
  rules.push({
    title: "Communication SLA",
    body: "Teams channel messages answered within 12 working hours. Late replies forfeit decision vote for the next sync.",
  });
  rules.push({
    title: "Attendance Rule",
    body: "Missing a scheduled meeting without 24h notice forfeits decision-making vote for that session.",
  });
  return rules;
}

// ---------- Calendar (June 2026) ----------

export type CalEvent = { day: number; label: string; tone: "draft" | "rehearsal" | "presentation" | "review" };

export const ACTIVE_STUDENTS = 3420;

export const JUNE_2026_EVENTS: CalEvent[] = [
  { day: 3, label: "Kick-off Sync", tone: "review" },
  { day: 8, label: "Draft Review", tone: "draft" },
  { day: 12, label: "Analyst Workshop", tone: "review" },
  { day: 17, label: "Final Rehearsal", tone: "rehearsal" },
  { day: 19, label: "Peer Critique", tone: "review" },
  { day: 23, label: "Prof. Stratmann Presentation", tone: "presentation" },
  { day: 26, label: "Submission", tone: "presentation" },
];

// ---------- Timeline stages ----------

export const TIMELINE_STAGES = [
  "Kick-off",
  "Research Phase",
  "Analysis",
  "Presentation Draft",
  "Final Peer Review",
  "Submission",
] as const;

export const CURRENT_STAGE_INDEX = 2; // Analysis is active

// ---------- Peer feedback mock data ----------

export type FeedbackSummary = {
  collaboration: number;
  reliability: number;
  communication: number;
  keywords: string[];
  notes: string[];
};

export const RECEIVED_FEEDBACK: FeedbackSummary = {
  collaboration: 4.6,
  reliability: 4.8,
  communication: 4.3,
  keywords: ["organised", "calm under pressure", "thoughtful", "structured", "supportive", "data-driven"],
  notes: [
    "Anonymous · Kept the timeline visible — never had to ask what was next.",
    "Anonymous · Pushed back constructively in the analysis phase, made the deck sharper.",
    "Anonymous · Always replied within the SLA, even during exam week.",
  ],
};