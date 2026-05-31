import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import { CbsLogo } from "./Logo";
import {
  ArrowRight, BookOpen, Calendar, CheckCircle2, Coffee, Download,
  LayoutDashboard, LogOut, MessageSquare, Shield, Sparkles, Star, Users,
  Zap, ClipboardCheck, Lightbulb, ChevronRight, TrendingUp, Target,
  RefreshCw, Loader2, FileText, PlayCircle, Timer, Mic, X,
  Cloud, FolderOpen, Lock, ExternalLink, Activity, BarChart3, GitBranch,
  GraduationCap, AlertTriangle, Award, Bell, GripVertical,
} from "lucide-react";
import {
  ACTIVE_STUDENTS, CURRENT_STAGE_INDEX, JUNE_2026_EVENTS, MOCK_STUDENTS,
  RECEIVED_FEEDBACK, TIMELINE_STAGES, TRAIT_META, computeMeetingWindow,
  generateCharter, generateInsights, pickIcebreaker, type Student, type UserProfile,
} from "@/lib/cbs-data";

type View = "profile" | "matching" | "calendar" | "feedback" | "faculty";

const NAV: { key: View; label: string; icon: typeof LayoutDashboard; divider?: boolean }[] = [
  { key: "profile", label: "My Teams", icon: Users },
  { key: "matching", label: "Matching Portal", icon: Sparkles },
  { key: "calendar", label: "Academic Toolkit", icon: Calendar },
  { key: "feedback", label: "Feedback Portal", icon: MessageSquare },
  { key: "faculty", label: "Faculty Dashboard", icon: GraduationCap, divider: true },
];

const HEADER_TABS: { key: View; label: string }[] = [
  { key: "matching", label: "Matching Portal" },
  { key: "calendar", label: "Academic Toolkit" },
  { key: "feedback", label: "Feedback Portal" },
];

const NOTIFICATIONS = [
  { id: 1, icon: "🔔", title: "Deadline Alert", body: "'Draft Review' locking down in 48 hours. Ensure your files are pushed to OneDrive." },
  { id: 2, icon: "👥", title: "Team Assignment", body: "Rohan Verma marked the 'Analyst Workshop' task as [In Progress]." },
];

export function Dashboard({
  user, team, onMatch, onLogout, onGoHome,
}: {
  user: UserProfile;
  team: Student[] | null;
  onMatch: () => void;
  onLogout: () => void;
  onGoHome?: () => void;
}) {
  const [view, setView] = useState<View>(team ? "matching" : "profile");
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [calEventTrigger, setCalEventTrigger] = useState<string | null>(null);
  const [calTabTrigger, setCalTabTrigger] = useState<"calendar" | "kanban" | null>(null);
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  function handleNotifClick(notifId: number) {
    setNotifOpen(false);
    setView("calendar");
    if (notifId === 1) {
      setCalTabTrigger("calendar");
      setCalEventTrigger("Draft Review");
    } else {
      setCalTabTrigger("kanban");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b bg-card">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <CbsLogo showTagline={false} onGoHome={onGoHome} />
            <nav className="hidden items-center gap-x-1 md:flex">
              {HEADER_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setView(t.key)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                    t.key === "faculty"
                      ? view === t.key
                        ? "bg-[#0078D4]/15 text-[#0078D4]"
                        : "text-[#0078D4]/70 hover:text-[#0078D4]"
                      : view === t.key
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              {notifOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              )}
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-secondary"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-card p-2 shadow-lg">
                  <div className="mb-1.5 flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-semibold text-foreground">Notifications</span>
                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">2 new</span>
                  </div>
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n.id)}
                      className="cursor-pointer rounded-lg px-3 py-2.5 transition hover:bg-secondary"
                    >
                      <div className="text-xs font-semibold text-foreground">{n.icon} {n.title}</div>
                      <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{n.body}</div>
                      <div className="mt-1 text-[10px] font-medium text-accent">Tap to open →</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden text-right md:block">
              <div className="text-sm font-semibold text-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</div>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className={`sticky top-[57px] hidden h-[calc(100vh-57px)] shrink-0 border-r bg-card transition-all md:block ${collapsed ? "w-16" : "w-60"}`}>
          <div className="flex h-full flex-col p-3">
            <nav className="flex-1 space-y-1">
              {NAV.map((n) => {
                const Icon = n.icon;
                const active = view === n.key;
                const isFaculty = n.key === "faculty";
                return (
                  <div key={n.key}>
                    {n.divider && !collapsed && (
                      <div className="my-2 flex items-center gap-2 px-3">
                        <div className="flex-1 border-t border-border/60" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Staff</span>
                        <div className="flex-1 border-t border-border/60" />
                      </div>
                    )}
                    {n.divider && collapsed && <div className="my-2 border-t border-border/60 mx-2" />}
                    <button
                      onClick={() => setView(n.key)}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                        active
                          ? isFaculty
                            ? "bg-[#0078D4] text-white shadow-[var(--shadow-card)]"
                            : "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                          : isFaculty
                            ? "text-[#0078D4] hover:bg-[#0078D4]/10"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{n.label}</span>}
                    </button>
                  </div>
                );
              })}
            </nav>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-secondary"
            >
              <ChevronRight className={`h-4 w-4 transition ${collapsed ? "" : "rotate-180"}`} />
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-8 md:px-8">
          {view === "profile" && <ProfileView user={user} team={team} onSwitch={setView} />}
          {view === "matching" && (
            team ? <MatchingResults user={user} team={team} /> : <MatchingCTA user={user} onMatch={onMatch} />
          )}
          {view === "calendar" && (
            <CalendarView
              user={user}
              team={team}
              eventTrigger={calEventTrigger}
              tabTrigger={calTabTrigger}
              onTriggerConsumed={() => { setCalEventTrigger(null); setCalTabTrigger(null); }}
            />
          )}
          {view === "feedback" && <FeedbackView team={team} />}
          {view === "faculty" && <FacultyDashboard />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Profile / "My Teams" ---------------- */

function ProfileView({ user, team, onSwitch }: { user: UserProfile; team: Student[] | null; onSwitch: (v: View) => void }) {
  return (
    <div className="animate-fade-in-up">
      <p className="text-sm font-medium text-accent">Welcome back, {user.name.split(" ")[0]}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">My Profile & Teams</h1>
      <p className="mt-2 text-muted-foreground">{team ? "Your active team for this course is locked in." : "Your psychometric profile is ready — head to the Matching Portal to find your squad."}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-accent" /> Academic context
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Course" value={user.course} />
            <Field label="Degree" value={user.degree} />
            <Field label="Semester" value={user.semester} />
          </div>
          <div className="mt-6 border-t pt-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Work-style profile (1–5)</div>
            <div className="mt-3 space-y-3">
              {TRAIT_META.map((t) => (
                <div key={t.key}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{t.label}</span>
                    <span className="font-mono font-semibold text-accent">{user.traits[t.key]} / 5</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-[image:var(--gradient-accent)]" style={{ width: `${(user.traits[t.key] / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Pills title="Strengths" items={user.strengths} accent />
            <Pills title="Areas to cover" items={user.weaknesses} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your team</div>
            {team ? (
              <>
                <div className="mt-3 -space-x-2">
                  {[{ id: "me", avatar: user.name.split(" ").map((n) => n[0]).join("").slice(0, 2), me: true }, ...team.map((s) => ({ id: s.id, avatar: s.avatar, me: false }))].map((m, idx) => (
                    <span key={m.id} className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-card ${m.me ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`} style={{ zIndex: 10 - idx }}>{m.avatar}</span>
                  ))}
                </div>
                <div className="mt-4 text-sm">
                  <div className="font-semibold text-foreground">{team.length + 1}-person squad</div>
                  <div className="text-xs text-muted-foreground">for {user.course.split(" (")[0]}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => onSwitch("matching")} className="mt-4 w-full gap-1.5">
                  Open team workspace <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted-foreground">No active team yet for this semester.</p>
                <Button size="sm" onClick={() => onSwitch("matching")} className="mt-4 w-full gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Find my team
                </Button>
              </>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Peer reputation</div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-3xl font-bold tracking-tight text-foreground">{RECEIVED_FEEDBACK.reliability.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">/ 5 average · {RECEIVED_FEEDBACK.notes.length} reviews</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onSwitch("feedback")} className="mt-3 w-full">Open Feedback Portal →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Matching Portal: CTA before matching ---------------- */

function MatchingCTA({ user, onMatch }: { user: UserProfile; onMatch: () => void }) {
  return (
    <div className="animate-fade-in-up">
      <p className="text-sm font-medium text-accent">Matching Portal</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Your profile is ready. Let's find your team.</h1>

      <div className="mt-8 relative overflow-hidden rounded-2xl bg-[image:var(--gradient-hero)] p-8 text-primary-foreground shadow-[var(--shadow-elegant)]">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
            <Sparkles className="h-3 w-3" /> Matchmaking engine
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            Find your perfect team for<br />
            <span className="text-accent">{user.course.split(" (")[0]}</span>
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/80">
            We'll scan 3,420+ active CBS profiles in your program, balance traits across 5 psychometric dimensions, cover your weaknesses, and propose a 4-person squad in seconds.
          </p>
          <Button onClick={onMatch} size="lg" className="mt-6 h-14 gap-2 rounded-md bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-accent/90 animate-pulse-ring">
            <Zap className="h-5 w-5" /> Find My Perfect Team <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Matching Portal: Results ---------------- */

function MatchingResults({ user, team }: { user: UserProfile; team: Student[] }) {
  const [charterOpen, setCharterOpen] = useState(false);
  const me: Student = {
    id: "me", name: user.name, email: user.email,
    avatar: user.name.split(" ").map((n) => n[0]).join("").slice(0, 2),
    program: user.degree, semester: user.semester, course: user.course,
    traits: user.traits, strengths: user.strengths, weaknesses: user.weaknesses,
    role: "You — Project Driver", bio: "The person bringing this team together.",
  };
  const fullTeam = [me, ...team];

  const radarData = TRAIT_META.map((t) => ({
    axis: t.label.split(" ")[0],
    value: Math.round((fullTeam.reduce((a, s) => a + s.traits[t.key], 0) / fullTeam.length) * 20),
  }));

  // Dynamic synergy score seeded from team composition — unique per squad, always 85–98%
  const synergyScore = useMemo(() => {
    const seed = team.reduce((a, s) => a + s.id.split("").reduce((x, c) => x + c.charCodeAt(0), 0), 0);
    return 85 + (seed % 14);
  }, [team]);

  const insights = useMemo(() => generateInsights(user, team), [user, team]);
  const charter = useMemo(() => generateCharter(user, team), [user, team]);
  const window = computeMeetingWindow(team, user);
  const icebreaker = pickIcebreaker(team.reduce((a, s) => a + s.id.charCodeAt(1), 0));

  return (
    <div className="animate-fade-in-up">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-foreground">
        <Sparkles className="h-3 w-3 text-accent" /> Match generated · {user.course.split(" (")[0]}
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Your Perfect Team Match</h1>
      <p className="text-muted-foreground">A balanced 4-person squad optimised for cognitive diversity and weakness coverage.</p>

      {/* Insights + Radar */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CBS Synergy Radar</div>
              <div className="mt-1 text-sm text-muted-foreground">Combined trait coverage across 5 dimensions</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">Team Synergy</div>
              <div className="text-5xl font-bold tracking-tight text-foreground">{synergyScore}%</div>
            </div>
          </div>
          <div className="mt-4 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="78%">
                <PolarGrid stroke="oklch(0.91 0.01 250)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "oklch(0.35 0.04 255)" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Team" dataKey="value" stroke="oklch(0.72 0.13 195)" fill="oklch(0.72 0.13 195)" fillOpacity={0.35} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-accent" /> My Match Insights
            </div>
            <div className="mt-3 space-y-3">
              {insights.map((ins) => (
                <div key={ins.title} className={`rounded-lg border-l-4 bg-secondary/50 p-3 ${ins.kind === "synergy" ? "border-accent" : ins.kind === "risk" ? "border-gold" : "border-primary"}`}>
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>{ins.title}</span>
                    {ins.pct && <span className="text-accent">{ins.pct}%</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{ins.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[image:var(--gradient-accent)] p-5 text-accent-foreground shadow-[var(--shadow-card)]">
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Collective peak window</div>
            <div className="mt-1 text-xl font-bold tracking-tight">{window}</div>
            <div className="mt-1 text-xs opacity-80">Calculated across all 4 work profiles.</div>
          </div>
        </div>
      </div>

      {/* Team cards */}
      <h2 className="mt-12 text-xl font-bold tracking-tight text-foreground">Meet your team</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {fullTeam.map((s, i) => (
          <div key={s.id} className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]" style={{ animation: `fade-in-up 0.4s ease-out ${i * 0.05}s both` }}>
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${s.id === "me" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>{s.avatar}</div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-foreground">{s.name}</div>
                <div className="truncate text-xs text-muted-foreground">{s.email}</div>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">{s.role}</div>
            <p className="mt-3 text-sm text-muted-foreground">{s.bio}</p>
            <div className="mt-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Brings</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {s.strengths.map((str) => <span key={str} className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-foreground">{str}</span>)}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Watch out</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {s.weaknesses.map((w) => <span key={w} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">{w}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role allocator */}
      <RoleAllocator team={fullTeam} />

      {/* Microsoft Graph Integration Hub */}
      <MicrosoftGraphHub user={user} team={fullTeam} />

      {/* Slacker insurance + first meeting */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <button
          onClick={() => setCharterOpen(true)}
          className="group text-left rounded-2xl border-2 border-accent/40 bg-card p-6 shadow-[var(--shadow-card)] transition hover:border-accent hover:shadow-[var(--shadow-elegant)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-bold tracking-tight text-foreground">🛡️ Slacker Insurance</h3>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-accent" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Tap to open your auto-generated <strong>Team Working Charter</strong> — built from this team's combined weaknesses. {charter.length} rules ready to sign.</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {charter.slice(0, 4).map((r) => (
              <span key={r.title} className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">{r.title}</span>
            ))}
            {charter.length > 4 && <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground">+{charter.length - 4} more</span>}
          </div>
        </button>

        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-bold tracking-tight text-foreground">First Meeting Icebreaker</h3>
          </div>
          <p className="mt-3 italic text-foreground">"{icebreaker}"</p>
          <div className="mt-4 text-xs text-muted-foreground">
            Suggested agenda · 5-min intros · 10-min charter sign-off · 30-min scope split · 5-min Teams channel setup.
          </div>
          <a
            href="https://teams.microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:bg-primary/90"
          >
            <MessageSquare className="h-4 w-4" /> Launch CBS Teams Channel
          </a>
        </div>
      </div>

      <CharterDialog open={charterOpen} onClose={() => setCharterOpen(false)} charter={charter} user={user} team={team} />
    </div>
  );
}

function CharterDialog({ open, onClose, charter, user, team }: { open: boolean; onClose: () => void; charter: { title: string; body: string }[]; user: UserProfile; team: Student[] }) {
  function exportText(kind: "pdf" | "docx") {
    const lines = [
      `CBS TeamUp · Team Working Charter`,
      `Course: ${user.course}`,
      `Team: ${[user.name, ...team.map((t) => t.name)].join(", ")}`,
      ``,
      ...charter.map((r, i) => `${i + 1}. ${r.title}\n   ${r.body}`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cbs-team-charter.${kind === "pdf" ? "pdf.txt" : "docx.txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-accent" /> Team Working Charter</DialogTitle>
          <DialogDescription>Auto-generated from your team's combined weaknesses. Sign once, enforce by default.</DialogDescription>
        </DialogHeader>
        <ul className="mt-2 max-h-[55vh] space-y-3 overflow-auto pr-1 text-sm">
          {charter.map((r, i) => (
            <li key={r.title} className="rounded-lg border bg-secondary/40 p-4">
              <div className="flex items-center gap-2 text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">{i + 1}</span>
                <strong>{r.title}</strong>
              </div>
              <p className="mt-1.5 text-muted-foreground">{r.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportText("pdf")}>
            <Download className="h-3.5 w-3.5" /> Export PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportText("docx")}>
            <Download className="h-3.5 w-3.5" /> Export Word
          </Button>
          <Button size="sm" className="gap-1.5" onClick={onClose}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Sign & accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Academic Toolkit (Calendar + Timeline) ---------------- */

type CalEvent = (typeof JUNE_2026_EVENTS)[number];

const MONTH_CONFIG = [
  {
    label: "May 2026",
    short: "May",
    firstWeekday: 5, // May 1, 2026 = Friday → 4 blank cells before it
    daysInMonth: 31,
    events: [
      { day: 8,  label: "Team Formation",   tone: "review"       } as CalEvent,
      { day: 14, label: "Scope Workshop",   tone: "draft"        } as CalEvent,
      { day: 19, label: "Charter Signing",  tone: "review"       } as CalEvent,
      { day: 26, label: "Research Kick-off",tone: "draft"        } as CalEvent,
    ],
  },
  {
    label: "June 2026",
    short: "Jun",
    firstWeekday: 1, // June 1, 2026 = Monday → no blank cells
    daysInMonth: 30,
    events: JUNE_2026_EVENTS as unknown as CalEvent[],
  },
  {
    label: "July 2026",
    short: "Jul",
    firstWeekday: 3, // July 1, 2026 = Wednesday → 2 blank cells
    daysInMonth: 31,
    events: [
      { day: 3,  label: "Grade Release",         tone: "review"       } as CalEvent,
      { day: 8,  label: "Portfolio Review",       tone: "draft"        } as CalEvent,
      { day: 15, label: "Reflection Canvas Due",  tone: "presentation" } as CalEvent,
      { day: 22, label: "Summer Cohort Kick-off", tone: "review"       } as CalEvent,
    ],
  },
] as const;

const COL_META = [
  { id: "todo",     label: "To Do",         hd: "border-b border-border/60 bg-secondary/30",      badge: "bg-secondary text-muted-foreground" },
  { id: "progress", label: "In Progress",   hd: "border-b border-[#0078D4]/30 bg-[#0078D4]/5",    badge: "bg-[#0078D4]/15 text-[#0078D4]" },
  { id: "review",   label: "Under Review",  hd: "border-b border-amber-200 bg-amber-50/40",        badge: "bg-amber-100 text-amber-700" },
  { id: "done",     label: "Completed",     hd: "border-b border-[#7FBA00]/30 bg-[#7FBA00]/5",    badge: "bg-[#7FBA00]/15 text-[#3d6b00]" },
] as const;

type ColId = (typeof COL_META)[number]["id"];
const COL_ORDER: ColId[] = ["todo", "progress", "review", "done"];

type KCard = { id: string; title: string; tag: string; col: ColId };

const INITIAL_CARDS: KCard[] = [
  { id: "k1",  title: "Literature Review",           tag: "Research",     col: "todo" },
  { id: "k2",  title: "Data Collection Plan",        tag: "Planning",     col: "todo" },
  { id: "k3",  title: "Slide Structure Outline",     tag: "Design",       col: "todo" },
  { id: "k4",  title: "Analyst Workshop",            tag: "Analysis",     col: "progress" },
  { id: "k5",  title: "Team Charter Finalization",   tag: "Operations",   col: "progress" },
  { id: "k6",  title: "Draft Review",                tag: "Writing",      col: "review" },
  { id: "k7",  title: "Financial Model Assumptions", tag: "Finance",      col: "review" },
  { id: "k8",  title: "Project Kickoff Meeting",     tag: "Planning",     col: "done" },
  { id: "k9",  title: "Work Distribution Matrix",    tag: "Operations",   col: "done" },
  { id: "k10", title: "Prof. Stratmann Presentation",tag: "Presentation", col: "done" },
];

function KanbanBoard() {
  const [cards, setCards] = useState<KCard[]>(INITIAL_CARDS);
  const [addingTo, setAddingTo] = useState<ColId | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Hydrate from backend on mount; fall back to INITIAL_CARDS if unavailable
  useEffect(() => {
    import("@/lib/api").then(({ api }) => {
      api.kanban.get()
        .then((tasks) => { setCards(tasks as KCard[]); })
        .catch(() => { /* keep INITIAL_CARDS */ });
    });
  }, []);

  function persistCards(next: KCard[]) {
    import("@/lib/api").then(({ api }) => {
      api.kanban.save(next).catch(() => {});
    });
  }

  function moveCard(cardId: string, dir: 1 | -1) {
    setCards((prev) => {
      const next = prev.map((c) => {
        if (c.id !== cardId) return c;
        const idx = COL_ORDER.indexOf(c.col);
        const nextIdx = Math.max(0, Math.min(COL_ORDER.length - 1, idx + dir));
        return { ...c, col: COL_ORDER[nextIdx] };
      });
      persistCards(next);
      return next;
    });
  }

  function addCard(col: ColId) {
    const t = newTitle.trim();
    if (!t) return;
    setCards((prev) => {
      const next = [...prev, { id: `k${Date.now()}`, title: t, tag: "Task", col }];
      persistCards(next);
      return next;
    });
    setNewTitle("");
    setAddingTo(null);
  }

  return (
    <div className="mt-6 overflow-x-auto pb-4">
      <div className="flex min-w-[760px] gap-4">
        {COL_META.map((col) => {
          const colCards = cards.filter((c) => c.col === col.id);
          const colIdx = COL_ORDER.indexOf(col.id);
          return (
            <div key={col.id} className="flex flex-1 flex-col rounded-xl border bg-card shadow-[var(--shadow-card)]">
              <div className={`rounded-t-xl px-4 py-3 ${col.hd}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">{col.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${col.badge}`}>{colCards.length}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                {colCards.map((card) => (
                  <div
                    key={card.id}
                    className="group flex items-start gap-2 rounded-lg border bg-background p-3 shadow-sm transition hover:border-accent/40 hover:shadow-md"
                  >
                    <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/30 transition group-hover:text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold leading-snug text-foreground">{card.title}</div>
                      <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${col.badge}`}>{card.tag}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                      {colIdx > 0 && (
                        <button
                          onClick={() => moveCard(card.id, -1)}
                          title="Move left"
                          className="flex h-5 w-5 items-center justify-center rounded text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        >‹</button>
                      )}
                      {colIdx < COL_ORDER.length - 1 && (
                        <button
                          onClick={() => moveCard(card.id, 1)}
                          title="Move right"
                          className="flex h-5 w-5 items-center justify-center rounded text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        >›</button>
                      )}
                    </div>
                  </div>
                ))}

                {addingTo === col.id ? (
                  <div className="rounded-lg border border-accent/40 bg-accent/5 p-2.5">
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCard(col.id);
                        if (e.key === "Escape") { setAddingTo(null); setNewTitle(""); }
                      }}
                      placeholder="Task title..."
                      className="w-full rounded-md border bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent/50"
                    />
                    <div className="mt-2 flex gap-1.5">
                      <button
                        onClick={() => addCard(col.id)}
                        className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground transition hover:opacity-90"
                      >Save</button>
                      <button
                        onClick={() => { setAddingTo(null); setNewTitle(""); }}
                        className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition hover:bg-secondary"
                      >Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingTo(col.id); setNewTitle(""); }}
                    className="mt-1 flex w-full items-center gap-1.5 rounded-md border border-dashed px-3 py-2 text-[11px] text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
                  >
                    ➕ Add Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarView({
  user, team, eventTrigger, tabTrigger, onTriggerConsumed,
}: {
  user: UserProfile;
  team: Student[] | null;
  eventTrigger?: string | null;
  tabTrigger?: "calendar" | "kanban" | null;
  onTriggerConsumed?: () => void;
}) {
  const [monthIdx, setMonthIdx] = useState(1); // default: June 2026
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [calTab, setCalTab] = useState<"calendar" | "kanban">("calendar");

  useEffect(() => {
    if (eventTrigger) {
      for (let i = 0; i < MONTH_CONFIG.length; i++) {
        const found = MONTH_CONFIG[i].events.find((e) => e.label === eventTrigger);
        if (found) {
          setMonthIdx(i);
          setCalTab("calendar");
          setSelectedEvent(found);
          break;
        }
      }
      onTriggerConsumed?.();
    }
  }, [eventTrigger]);

  useEffect(() => {
    if (tabTrigger) {
      setCalTab(tabTrigger);
      onTriggerConsumed?.();
    }
  }, [tabTrigger]);

  const month = MONTH_CONFIG[monthIdx];

  const cells: (number | null)[] = [];
  for (let i = 0; i < month.firstWeekday - 1; i++) cells.push(null);
  for (let d = 1; d <= month.daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const eventByDay = new Map(month.events.map((e) => [e.day, e]));
  const toneClass: Record<string, string> = {
    draft: "bg-gold/20 text-foreground border-gold/50",
    rehearsal: "bg-accent/20 text-foreground border-accent/50",
    presentation: "bg-primary text-primary-foreground border-primary",
    review: "bg-secondary text-foreground border-border",
  };

  return (
    <div className="animate-fade-in-up">
      <p className="text-sm font-medium text-accent">Academic Toolkit</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Group Projects & Milestones</h1>
      <p className="mt-2 text-muted-foreground">Your project calendar and current timeline phase — at a glance.</p>

      <RehearsalBanner />

      {/* View tab switcher */}
      <div className="mt-6 flex gap-1 rounded-lg border bg-secondary/30 p-1 w-fit">
        <button
          onClick={() => setCalTab("calendar")}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${calTab === "calendar" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          📅 Calendar View
        </button>
        <button
          onClick={() => setCalTab("kanban")}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${calTab === "kanban" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          📋 Group Kanban Board
        </button>
      </div>

      {calTab === "kanban" && <KanbanBoard />}

      {calTab === "calendar" && (
      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] xl:col-span-3">
          {/* Month navigator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
                disabled={monthIdx === 0}
                className="flex h-8 w-8 items-center justify-center rounded-md border text-sm font-bold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous month"
              >
                ‹
              </button>
              <h2 className="min-w-[130px] text-center text-lg font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5 text-accent" /> {month.label}
              </h2>
              <button
                onClick={() => setMonthIdx((i) => Math.min(MONTH_CONFIG.length - 1, i + 1))}
                disabled={monthIdx === MONTH_CONFIG.length - 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border text-sm font-bold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
            <SyncToMicrosoft />
          </div>

          {/* Month indicator pills */}
          <div className="mt-3 flex items-center gap-2">
            {MONTH_CONFIG.map((m, i) => (
              <button
                key={m.short}
                onClick={() => setMonthIdx(i)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${i === monthIdx ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
              >
                {m.short}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-3 text-[11px] text-muted-foreground">
            <LegendDot tone="presentation" label="Presentation" />
            <LegendDot tone="rehearsal" label="Rehearsal" />
            <LegendDot tone="draft" label="Draft" />
            <LegendDot tone="review" label="Review" />
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="px-1 py-1">{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              const ev = d ? eventByDay.get(d) : undefined;
              return (
                <div key={i} className={`min-h-[68px] rounded-md border p-1.5 text-xs ${d ? "bg-background" : "bg-secondary/40 border-transparent"}`}>
                  {d && (
                    <>
                      <div className="text-[10px] font-semibold text-muted-foreground">{d}</div>
                      {ev && (
                        <button
                          onClick={() => setSelectedEvent(ev)}
                          className={`mt-1 block w-full truncate rounded-sm border px-1 py-0.5 text-[10px] font-semibold transition hover:opacity-80 hover:shadow-sm ${toneClass[ev.tone]}`}
                          title={ev.label}
                        >
                          {ev.label}
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming · {month.label}
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {month.events.map((e) => (
                <li key={e.day} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <div className="font-medium text-foreground">{e.label}</div>
                    <div className="text-[11px] text-muted-foreground">{month.short} {e.day}, 2026</div>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${e.tone === "presentation" ? "bg-primary" : e.tone === "rehearsal" ? "bg-accent" : e.tone === "draft" ? "bg-gold" : "bg-muted-foreground"}`} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      )}

      {/* Timeline */}
      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2"><TrendingUp className="h-5 w-5 text-accent" /> Project Timeline Stages</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your team is currently in <strong className="text-foreground">{TIMELINE_STAGES[CURRENT_STAGE_INDEX]}</strong>.</p>

        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-[680px] items-center gap-1">
            {TIMELINE_STAGES.map((stage, idx) => {
              const done = idx < CURRENT_STAGE_INDEX;
              const active = idx === CURRENT_STAGE_INDEX;
              return (
                <div key={stage} className="flex flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${active ? "border-accent bg-accent text-accent-foreground shadow-[var(--shadow-elegant)] animate-pulse-ring" : done ? "border-accent bg-accent/15 text-accent" : "border-border bg-card text-muted-foreground"}`}>
                      {done ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                    </div>
                    <div className={`mt-2 text-center text-xs font-medium ${active ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground"}`}>{stage}</div>
                  </div>
                  {idx < TIMELINE_STAGES.length - 1 && (
                    <div className={`mb-6 h-0.5 flex-1 ${done ? "bg-accent" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AIReflectionCanvas />

      <TeamEvolutionLog />

      {/* Outlook Sync + OneDrive — placed below calendar in Academic Toolkit */}
      {team && team.length > 0 && (
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <OutlookSyncHub user={user} team={team} />
          <OneDriveHub />
        </div>
      )}

      <EventDetailDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}

function LegendDot({ tone, label }: { tone: string; label: string }) {
  const dot: Record<string, string> = {
    presentation: "bg-primary", rehearsal: "bg-accent", draft: "bg-gold", review: "bg-muted-foreground",
  };
  return <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${dot[tone]}`} />{label}</span>;
}

/* ---------------- Feedback Portal ---------------- */

function FeedbackView({ team }: { team: Student[] | null }) {
  const [mode, setMode] = useState<"give" | "receive">("give");
  return (
    <div className="animate-fade-in-up">
      <p className="text-sm font-medium text-accent">Feedback Portal</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Peer Feedback Loop</h1>
      <p className="mt-2 text-muted-foreground">Anonymous, structured, and aggregated — feedback that actually changes behaviour.</p>

      <div className="mt-6 inline-flex rounded-lg border bg-card p-1 text-sm">
        <button onClick={() => setMode("give")} className={`rounded-md px-4 py-1.5 font-medium transition ${mode === "give" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Give Feedback</button>
        <button onClick={() => setMode("receive")} className={`rounded-md px-4 py-1.5 font-medium transition ${mode === "receive" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Receive Feedback</button>
      </div>

      <VelocityCheck />

      {mode === "give" ? <GiveFeedback team={team} /> : <ReceiveFeedback />}
    </div>
  );
}

function GiveFeedback({ team }: { team: Student[] | null }) {
  const sampleTeam = team ?? [];
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mt-6 space-y-4">
      {sampleTeam.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Run the Matching Portal first to populate your teammates here.
        </div>
      )}
      {sampleTeam.map((m) => <FeedbackCard key={m.id} member={m} onSubmit={() => setSubmitted(true)} />)}
      {submitted && (
        <div className="rounded-2xl border-2 border-accent bg-accent/10 p-4 text-sm text-foreground">
          <CheckCircle2 className="mr-2 inline h-4 w-4 text-accent" /> Thanks — your anonymous review has been logged for the cohort aggregate.
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ member, onSubmit }: { member: Student; onSubmit: () => void }) {
  const [collab, setCollab] = useState(4);
  const [rely, setRely] = useState(4);
  const [comm, setComm] = useState(4);
  const [note, setNote] = useState("");

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{member.avatar}</div>
        <div>
          <div className="font-semibold text-foreground">{member.name}</div>
          <div className="text-xs text-muted-foreground">{member.role}</div>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <StarRow label="Collaboration" value={collab} onChange={setCollab} />
        <StarRow label="Reliability" value={rely} onChange={setRely} />
        <StarRow label="Communication" value={comm} onChange={setComm} />
      </div>
      <div className="mt-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Anonymous note</label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What worked? What could be sharper next sprint?" className="mt-2" rows={3} />
      </div>
      <Button size="sm" onClick={onSubmit} className="mt-4 gap-1.5">
        <ClipboardCheck className="h-3.5 w-3.5" /> Submit anonymous review
      </Button>
    </div>
  );
}

function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{value} / 5</span>
      </div>
      <div className="mt-1.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onChange(n)} className="transition hover:scale-110">
            <Star className={`h-6 w-6 ${n <= value ? "fill-accent text-accent" : "text-border"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReceiveFeedback() {
  const data = [
    { axis: "Collaboration", value: RECEIVED_FEEDBACK.collaboration * 20 },
    { axis: "Reliability", value: RECEIVED_FEEDBACK.reliability * 20 },
    { axis: "Communication", value: RECEIVED_FEEDBACK.communication * 20 },
  ];
  const colors = ["oklch(0.72 0.13 195)", "oklch(0.82 0.14 85)", "oklch(0.42 0.11 220)"];

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aggregate scores — last sprint</div>
        <div className="mt-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <XAxis dataKey="axis" tick={{ fontSize: 12, fill: "oklch(0.35 0.04 255)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "oklch(0.5 0.03 255)" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "oklch(0.96 0.01 250)" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {data.map((d, i) => (
            <div key={d.axis} className="rounded-lg border bg-secondary/40 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d.axis}</div>
              <div className="mt-1 text-2xl font-bold tracking-tight" style={{ color: colors[i] }}>{(d.value / 20).toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Positive keywords</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {RECEIVED_FEEDBACK.keywords.map((k) => (
              <span key={k} className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-foreground">{k}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Anonymous notes</div>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            {RECEIVED_FEEDBACK.notes.map((n, i) => (
              <li key={i} className="rounded-md border-l-2 border-accent/60 bg-secondary/40 px-3 py-2 italic text-muted-foreground">{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shared bits ---------------- */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}

function Pills({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((s) => (
          <span key={s} className={`rounded-full px-3 py-1 text-xs font-medium ${accent ? "bg-accent/15 text-foreground" : "border text-foreground"}`}>{s}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- New: Role Allocator ---------------- */

function allocateRole(s: Student): { title: string; why: string } {
  const has = (k: string) => s.strengths.some((x) => x.toLowerCase().includes(k));
  const t = s.traits;
  if (t.leadership >= 4 && (has("coach") || has("ethic") || has("public"))) {
    return { title: "Project Lead & Coach", why: "High leadership + facilitation skills — keeps the team aligned and unblocks people." };
  }
  if (t.analytical >= 4 && (has("data") || has("coding") || has("excel"))) {
    return { title: "Operations & Data Lead", why: "Deep analytical rigor — owns the numbers, models, and evidence base." };
  }
  if (has("slide") || has("creative") || has("writing")) {
    return { title: "Narrative & Deck Architect", why: "Translates findings into the story the panel actually remembers." };
  }
  if (has("public speaking") || has("strategic presentation")) {
    return { title: "Pitch Lead & Presenter", why: "Confident in the room — anchors Q&A and final delivery." };
  }
  if (has("research") || has("ethical")) {
    return { title: "Research & Quality Anchor", why: "Sources, cites, and pressure-tests every claim before submission." };
  }
  if (has("agile") || has("project coordination") || has("time management")) {
    return { title: "Sprint Coordinator", why: "Owns the Gantt — keeps every workstream honest to the milestone." };
  }
  return { title: "Generalist Builder", why: "Plugs into whichever workstream needs an extra pair of expert hands." };
}

function RoleAllocator({ team }: { team: Student[] }) {
  return (
    <div className="mt-10 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-bold tracking-tight text-foreground">🎯 Optimal Core Role Assignments</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Auto-assigned from each profile's strengths and trait signature.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {team.map((s) => {
          const r = allocateRole(s);
          return (
            <div key={s.id} className="flex gap-3 rounded-lg border bg-secondary/40 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${s.id === "me" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>{s.avatar}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{s.name}</div>
                <div className="text-xs font-semibold text-accent">{r.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{r.why}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- New: Microsoft Sync ---------------- */

function SyncToMicrosoft() {
  const [state, setState] = useState<"idle" | "syncing" | "done">("idle");
  function run() {
    setState("syncing");
    setTimeout(() => setState("done"), 1800);
  }
  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={run}
        disabled={state === "syncing"}
        className="gap-1.5 border-accent/50 text-foreground hover:bg-accent/10"
      >
        {state === "syncing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        🔄 Sync to Microsoft Outlook & Teams
      </Button>
      {state === "done" && (
        <div className="max-w-[320px] rounded-md border border-accent bg-accent/10 px-3 py-2 text-[11px] text-foreground animate-fade-in-up">
          <CheckCircle2 className="mr-1 inline h-3 w-3 text-accent" /> Project calendar, deadlines, and shared OneDrive folders successfully provisioned for your cbs-mail.de group!
        </div>
      )}
    </div>
  );
}

/* ---------------- New: AI Reflection Canvas ---------------- */

const REFLECTION_TAGS: Record<string, { label: string; insert: string }[]> = {
  limits: [
    { label: "Client-side data only", insert: "Currently restricted by client-side mock parameters; production needs persistent backend storage." },
    { label: "No real auth", insert: "Microsoft SSO is simulated — real integration requires CBS tenant admin consent for Graph API scopes." },
    { label: "Static cohort", insert: "Matching pool is hardcoded to 14 profiles; live system needs cohort sync from CBS student records." },
  ],
  potentials: [
    { label: "ML-driven matching", insert: "Replace heuristic scoring with a trained model on historic team-outcome data (grades + peer reviews)." },
    { label: "Outlook + Teams hooks", insert: "Auto-provision shared Teams channel, OneDrive folder, and Outlook calendar invites on team formation." },
    { label: "Longitudinal feedback", insert: "Track peer-review deltas across courses to refine personal trait calibration over time." },
  ],
  scalability: [
    { label: "Scalability Constraint", insert: "Currently restricted by client-side mock parameters; next iteration scales via Python ML API deployment on Azure nodes." },
    { label: "Cross-faculty rollout", insert: "Architecture supports plugging in any CBS faculty's course catalog with zero schema changes." },
    { label: "Multi-tenant ready", insert: "Tenant-scoped data model means TeamUp can ship to other Microsoft 365 universities with config-only changes." },
  ],
};

function AIReflectionCanvas() {
  const [limits, setLimits] = useState("");
  const [potentials, setPotentials] = useState("");
  const [scale, setScale] = useState("");
  const [exported, setExported] = useState(false);

  function add(setter: (v: string) => void, current: string, text: string) {
    setter(current ? `${current}\n• ${text}` : `• ${text}`);
  }

  function exportDraft() {
    const body = [
      "CBS TeamUp · AI Reflection Canvas",
      "",
      "## Application Limits",
      limits || "—",
      "",
      "## Development Potentials",
      potentials || "—",
      "",
      "## Scalability Opportunities",
      scale || "—",
    ].join("\n");
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cbs-teamup-reflection-canvas.txt";
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="mt-8 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold tracking-tight text-foreground">AI Reflection Canvas Generator</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Mirrors the graded syllabus structure. Click a starter tag to inject a tailored reflection line, then refine.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <CanvasBlock title="Application Limits" value={limits} onChange={setLimits} tags={REFLECTION_TAGS.limits} onAdd={(t) => add(setLimits, limits, t)} />
        <CanvasBlock title="Development Potentials" value={potentials} onChange={setPotentials} tags={REFLECTION_TAGS.potentials} onAdd={(t) => add(setPotentials, potentials, t)} />
        <CanvasBlock title="Scalability Opportunities" value={scale} onChange={setScale} tags={REFLECTION_TAGS.scalability} onAdd={(t) => add(setScale, scale, t)} />
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {exported && <span className="text-xs text-accent"><CheckCircle2 className="mr-1 inline h-3 w-3" /> Draft exported</span>}
        <Button size="sm" onClick={exportDraft} className="gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Export Analysis Draft
        </Button>
      </div>
    </div>
  );
}

function CanvasBlock({
  title, value, onChange, tags, onAdd,
}: {
  title: string; value: string; onChange: (v: string) => void;
  tags: { label: string; insert: string }[]; onAdd: (t: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-secondary/30 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <button key={t.label} onClick={() => onAdd(t.insert)} className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] text-foreground hover:bg-accent/20">
            + {t.label}
          </button>
        ))}
      </div>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} placeholder="Click a tag above or type your reflection…" className="mt-3 text-xs" />
    </div>
  );
}

/* ---------------- New: Rehearsal Mode Banner + Modal ---------------- */

function RehearsalBanner() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-accent/50 bg-[image:var(--gradient-hero)] p-5 text-left text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:border-accent"
      >
        <div className="flex items-center gap-3">
          <PlayCircle className="h-6 w-6 text-accent" />
          <div>
            <div className="text-base font-bold tracking-tight">🛠️ Final Session Presentation Rehearsal Mode</div>
            <div className="text-xs text-primary-foreground/80">No slides · Live screen share · Working MVP link · 5-min countdown · Peer Q&amp;A simulator.</div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-accent transition group-hover:translate-x-1" />
      </button>
      <RehearsalModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function RehearsalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [seconds, setSeconds] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState({ slides: false, share: false, mvp: false });
  const [qa, setQa] = useState<string | null>(null);

  const QA_BANK = [
    "What's your single biggest assumption — and what happens if it breaks?",
    "How is this different from a Notion template plus a Teams channel?",
    "Walk me through your matching algorithm in 60 seconds. No jargon.",
    "Where does this fail at scale — 500 students, 50 courses, one semester?",
    "If we cut your scope by 50% tomorrow, what survives?",
  ];

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [running, seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><PlayCircle className="h-5 w-5 text-accent" /> Rehearsal Mode — Live Conditions</DialogTitle>
          <DialogDescription>Mirrors the exam-day setup: no slides, live screen share, MVP demo, 5-minute hard cap, peer Q&amp;A.</DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-secondary/40 p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Timer className="h-3.5 w-3.5 text-accent" /> Countdown
            </div>
            <div className="mt-2 font-mono text-5xl font-bold tracking-tight text-foreground">{mm}:{ss}</div>
            <div className="mt-3 flex justify-center gap-2">
              <Button size="sm" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start"}</Button>
              <Button size="sm" variant="outline" onClick={() => { setRunning(false); setSeconds(5 * 60); }}>Reset</Button>
            </div>
          </div>

          <div className="rounded-xl border bg-secondary/40 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pre-flight checklist</div>
            <div className="mt-3 space-y-2 text-sm">
              <Checkline label="No slides — talking from the live MVP only" checked={checks.slides} onChange={(v) => setChecks({ ...checks, slides: v })} />
              <Checkline label="Screen-share working in MS Teams" checked={checks.share} onChange={(v) => setChecks({ ...checks, share: v })} />
              <Checkline label="Working MVP link verified (open in incognito)" checked={checks.mvp} onChange={(v) => setChecks({ ...checks, mvp: v })} />
            </div>
          </div>
        </div>

        <div className="mt-2 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Mic className="h-3.5 w-3.5 text-accent" /> Peer Q&amp;A simulator
          </div>
          <div className="mt-3 min-h-[3rem] rounded-md bg-secondary/40 px-3 py-2 text-sm italic text-foreground">
            {qa ?? "Tap below to draw a randomised peer question."}
          </div>
          <Button size="sm" variant="outline" onClick={() => setQa(QA_BANK[Math.floor(Math.random() * QA_BANK.length)])} className="mt-3">
            Draw a question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Checkline({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center gap-2 text-left">
      <span className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card"}`}>
        {checked && <CheckCircle2 className="h-3 w-3" />}
      </span>
      <span className={checked ? "text-muted-foreground line-through" : "text-foreground"}>{label}</span>
    </button>
  );
}

/* ---------------- New: Calendar Event Detail Dialog ---------------- */

const EVENT_DESCRIPTIONS: Record<string, string> = {
  "Kick-off Sync": "Align on scope, divide early research workstreams, and set your shared OneDrive folder structure. Confirm team availability windows for the semester.",
  "Draft Review": "Internal checkpoint — each member presents their section draft. Use the Charter's 12h feedback SLA: written comments due by midnight.",
  "Analyst Workshop": "Deep-dive session with your Operations & Data Lead. Review datasets, pressure-test your model assumptions, and finalize the evidence base.",
  "Final Rehearsal": "Full run-through under exam-day conditions: no slides, live MVP only, 5-minute hard cap, peer Q&A from the Rehearsal Mode simulator.",
  "Peer Critique": "Anonymous structured critique session with another team. Each team presents for 5 min, then 10 min of written feedback.",
  "Prof. Stratmann Presentation": "Graded final presentation to Prof. Stratmann and the peer panel. No slides — working MVP and live screen share only.",
  "Submission": "Final deliverables due: PDF report, working app link, and signed Team Charter uploaded to the course portal by 23:59.",
};

const POWERPOINT_EVENTS = new Set(["Final Rehearsal", "Prof. Stratmann Presentation", "Draft Review"]);

function EventDetailDialog({ event, onClose }: { event: CalEvent | null; onClose: () => void }) {
  if (!event) return null;
  const toneLabel: Record<string, string> = {
    draft: "Draft Milestone",
    rehearsal: "Rehearsal Session",
    presentation: "Graded Presentation",
    review: "Team Review",
  };
  const toneBg: Record<string, string> = {
    draft: "bg-gold/15 text-foreground border-gold/40",
    rehearsal: "bg-accent/15 text-foreground border-accent/40",
    presentation: "bg-primary/15 text-foreground border-primary/40",
    review: "bg-secondary text-foreground border-border",
  };
  const showPPT = POWERPOINT_EVENTS.has(event.label);

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            {event.label}
          </DialogTitle>
          <DialogDescription>June {event.day}, 2026</DialogDescription>
        </DialogHeader>

        <div className="mt-1">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${toneBg[event.tone]}`}>
            {toneLabel[event.tone]}
          </span>
        </div>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {EVENT_DESCRIPTIONS[event.label] ?? "Team milestone — check with your group for details."}
        </p>

        {showPPT && (
          <div className="mt-4 rounded-xl border-2 border-accent/40 bg-accent/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
              <Cloud className="h-3.5 w-3.5" /> Microsoft 365 Resource
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">Your shared presentation deck is ready in OneDrive.</p>
            <a
              href="https://office.live.com/start/PowerPoint.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#D83B01] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              🖥️ Open Team Presentation Deck
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="text-xs opacity-80">(PowerPoint Online)</span>
            </a>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- New: Team Evolution Log ---------------- */

const EVOLUTION_MILESTONES = [
  {
    date: "May 19",
    icon: "🚀",
    title: "Team Formed",
    desc: "CBS TeamUp matched 4 profiles with 94% synergy score. Roles auto-assigned.",
    done: true,
  },
  {
    date: "May 22",
    icon: "📋",
    title: "Charter Signed",
    desc: "Team Working Charter ratified — 6 rules, Slacker Insurance activated.",
    done: true,
  },
  {
    date: "Jun 3",
    icon: "📅",
    title: "Kick-off Sync",
    desc: "Scope locked. OneDrive folder provisioned. Research workstreams divided.",
    done: true,
  },
  {
    date: "Jun 8",
    icon: "📝",
    title: "Draft Review",
    desc: "Internal draft reviewed. 3 sections revised based on peer feedback.",
    done: false,
    active: true,
  },
  {
    date: "Jun 17",
    icon: "🎤",
    title: "Final Rehearsal",
    desc: "Full run-through under exam conditions with the Rehearsal Mode timer.",
    done: false,
  },
  {
    date: "Jun 23",
    icon: "🏆",
    title: "Graded Presentation",
    desc: "Live delivery to Prof. Stratmann. No slides — working MVP only.",
    done: false,
  },
];

function TeamEvolutionLog() {
  return (
    <div className="mt-8 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold tracking-tight text-foreground">Team Evolution Log</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Your team's journey — from first match to graded submission.</p>

      <div className="mt-6 space-y-0">
        {EVOLUTION_MILESTONES.map((m, i) => (
          <div key={m.title} className="flex gap-4">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-base transition ${
                m.active
                  ? "border-accent bg-accent/15 shadow-[var(--shadow-elegant)] animate-pulse-ring"
                  : m.done
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card"
              }`}>
                {m.icon}
              </div>
              {i < EVOLUTION_MILESTONES.length - 1 && (
                <div className={`mt-1 mb-1 w-0.5 flex-1 min-h-[28px] ${m.done ? "bg-accent/50" : "bg-border"}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-5 min-w-0 ${i === EVOLUTION_MILESTONES.length - 1 ? "" : ""}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{m.title}</span>
                {m.active && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">Current</span>
                )}
                {m.done && !m.active && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                )}
              </div>
              <div className="text-[11px] text-accent font-medium">{m.date}, 2026</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- New: Microsoft Graph Integration Hub ---------------- */

const ONEDRIVE_FILES = [
  { name: "CBS_TeamUp_Project_Charter.docx", size: "48 KB", icon: "📄", type: "docx" },
  { name: "Market_Analysis_Dataset_v3.xlsx", size: "1.2 MB", icon: "📊", type: "xlsx" },
  { name: "Team_Presentation_Deck_FINAL.pptx", size: "3.4 MB", icon: "📑", type: "pptx", ppt: true },
  { name: "Competitor_Research_Notes.docx", size: "92 KB", icon: "📄", type: "docx" },
  { name: "Meeting_Recordings/", size: "—", icon: "📁", type: "folder" },
];

function MicrosoftGraphHub({ user, team }: { user: UserProfile; team: Student[] }) {
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "done">("idle");
  const hasProcrastinator = team.some((s) => s.weaknesses.some((w) => w.toLowerCase().includes("procrastin")))
    || user.weaknesses.some((w) => w.toLowerCase().includes("procrastin"));

  function runSync() {
    setSyncState("syncing");
    setTimeout(() => setSyncState("done"), 1000);
  }

  return (
    <div className="mt-10 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-[#0078D4]" />
          <h3 className="text-lg font-bold tracking-tight text-foreground">Microsoft Graph Integration Hub</h3>
        </div>
        <button
          onClick={runSync}
          disabled={syncState === "syncing"}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#0078D4]/40 bg-[#0078D4]/5 px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-[#0078D4]/10 disabled:opacity-60"
        >
          {syncState === "syncing" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 text-[#0078D4]" />
          )}
          Sync with Microsoft 365
        </button>
      </div>

      {syncState === "done" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent bg-accent/10 px-4 py-2.5 text-sm text-foreground animate-fade-in-up">
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          <span>Calendar, Teams channel, and OneDrive folder successfully provisioned for <strong>{user.email.split("@")[0]}</strong>'s cbs-mail.de group!</span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* OneDrive File Explorer */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <FolderOpen className="h-3.5 w-3.5 text-[#0078D4]" /> OneDrive — Shared Team Folder
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border">
            {ONEDRIVE_FILES.map((file, i) => (
              <div
                key={file.name}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition hover:bg-secondary/60 ${i > 0 ? "border-t" : ""}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">{file.icon}</span>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{file.name}</div>
                    <div className="text-[10px] text-muted-foreground">{file.size}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {file.name.includes("Charter") && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-foreground flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5" /> Slacker Insurance
                    </span>
                  )}
                  {hasProcrastinator && file.name.includes("Dataset") && (
                    <span className="rounded-full bg-gold/20 border border-gold/40 px-2 py-0.5 text-[10px] font-semibold text-foreground flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" /> Deadline Locked
                    </span>
                  )}
                  {file.ppt && (
                    <a
                      href="https://office.live.com/start/PowerPoint.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-[#D83B01]/40 bg-[#D83B01]/10 px-2 py-0.5 text-[10px] font-semibold text-[#D83B01] hover:bg-[#D83B01]/20 transition"
                    >
                      Open ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {hasProcrastinator && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3 text-gold" />
              Deadline-lock active: a procrastination flag was detected in your team profile. Files are read-only 48h before each milestone.
            </p>
          )}
        </div>

        {/* Microsoft Viva Team Insights */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-[#0078D4]" /> Microsoft Viva · Team Pulse
          </div>
          <div className="mt-3 space-y-4 rounded-xl border p-4">
            <VivaBar label="Team Collaboration Score" value={94} color="oklch(0.72 0.13 195)" />
            <VivaBar label="Focus Time (weekly avg)" value={88} color="oklch(0.72 0.13 195)" />
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
                  Burnout Risk Index
                </span>
                <span className="font-mono font-bold text-amber-500">Amber</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700"
                  style={{ width: "62%" }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">62% — 2 members nearing overload. Consider redistributing 1 analytical task.</p>
            </div>
            <div className="rounded-lg bg-secondary/50 px-3 py-2 text-[11px] text-muted-foreground">
              <BarChart3 className="mr-1 inline h-3 w-3 text-[#0078D4]" />
              Viva Insights syncs every 24h from Microsoft 365 activity data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VivaBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ---------------- New: Outlook Sync Hub ---------------- */

const CONFETTI_COLORS = [
  "#0078D4", "#FFB900", "#00A4EF", "#7FBA00",
  "oklch(0.72 0.13 195)", "oklch(0.82 0.14 85)", "oklch(0.42 0.11 220)",
];

function OutlookSyncHub({ user, team }: { user: UserProfile; team: Student[] }) {
  const [syncState, setSyncState] = useState<"idle" | "loading" | "done">("idle");
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number; angle: number }[]>([]);
  const confettiId = useRef(0);

  function launch() {
    setSyncState("loading");
    setTimeout(() => {
      setSyncState("done");
      // Burst 28 confetti particles
      const particles = Array.from({ length: 28 }, (_, i) => ({
        id: confettiId.current++,
        x: 50 + Math.random() * 10 - 5, // center ± 5%
        y: 50,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        angle: (360 / 28) * i + Math.random() * 15,
      }));
      setConfetti(particles);
      setTimeout(() => setConfetti([]), 2200);
    }, 1400);
  }

  const recipients = [user, ...team].map((s) => s.name.split(" ")[0]).join(", ");

  return (
    <div className="relative mt-10 overflow-hidden rounded-2xl border-2 border-[#0078D4]/30 bg-card p-6 shadow-[var(--shadow-card)]">
      {/* Confetti particles */}
      {confetti.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: "translate(-50%, -50%)",
            animation: `confetti-burst 2s ease-out forwards`,
            "--angle": `${p.angle}deg`,
            "--dist": `${80 + Math.random() * 120}px`,
          } as React.CSSProperties}
        />
      ))}

      <style>{`
        @keyframes confetti-burst {
          0%   { opacity: 1; transform: translate(-50%,-50%) rotate(0deg) translate(0,0); }
          80%  { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%,-50%) rotate(calc(var(--angle) * 3)) translate(var(--dist), calc(var(--dist) * -0.6)); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📅</span>
        <h3 className="text-lg font-bold tracking-tight text-foreground">Automated Microsoft Outlook Sync Hub</h3>
        <span className="ml-auto rounded-full bg-[#0078D4]/10 border border-[#0078D4]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0078D4]">
          Microsoft Graph
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        One-click dispatch — auto-generates recurring weekly sprint invites and syncs them to every team member's @cbs-mail.de Outlook calendar.
      </p>

      <div className="mt-5 rounded-xl border bg-secondary/40 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex -space-x-2">
            {[user, ...team].map((s) => (
              <div key={s.email} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-card">
                {s.avatar}
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {recipients} — {team.length + 1} participants · <span className="text-foreground font-medium">cbs-mail.de</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          {[
            { icon: "🗓️", label: "Cadence", value: "Weekly Sprint · Mon 10:00" },
            { icon: "📍", label: "Location", value: "Microsoft Teams (auto-link)" },
            { icon: "🔔", label: "Reminders", value: "24h + 15min before" },
          ].map((d) => (
            <div key={d.label} className="rounded-lg border bg-card px-3 py-2">
              <div className="text-muted-foreground">{d.icon} {d.label}</div>
              <div className="mt-0.5 font-medium text-foreground">{d.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          {syncState === "idle" && (
            <Button onClick={launch} className="gap-2 bg-[#0078D4] hover:bg-[#0078D4]/90 text-white">
              <span>📨</span> Generate Shared Team Sync Invite
            </Button>
          )}
          {syncState === "loading" && (
            <Button disabled className="gap-2 bg-[#0078D4]/80 text-white">
              <Loader2 className="h-4 w-4 animate-spin" /> Dispatching via Microsoft Graph…
            </Button>
          )}
          {syncState === "done" && (
            <div className="animate-fade-in-up">
              <div className="flex items-start gap-3 rounded-xl border-2 border-[#7FBA00]/50 bg-[#7FBA00]/10 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#7FBA00]" />
                <div>
                  <div className="text-sm font-bold text-foreground">
                    Microsoft Graph synchronised successfully!
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Automated invitation links dispatched to all cbs-mail.de student calendar profiles for regular weekly sprints. Your shared <strong>CBS Teams channel</strong>, <strong>OneDrive folder</strong>, and <strong>Outlook calendar series</strong> are live.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[user, ...team].map((s) => (
                      <span key={s.email} className="rounded-full bg-[#7FBA00]/20 px-2 py-0.5 text-[11px] font-medium text-foreground">
                        ✓ {s.email}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSyncState("idle")}
                className="mt-2 text-[11px] text-muted-foreground hover:text-foreground transition"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ---------------- OneDrive Deliverables Hub ---------------- */

const DELIVERABLES_FILES: { name: string; type: string; status: "synced" | "pending" }[] = [
  { name: "CBS_TeamCharter_Final.pdf",          type: "PDF",   status: "synced"  },
  { name: "Digital_Literacy_SlideDeck.pptx",    type: "PPTX",  status: "pending" },
  { name: "Research_Analysis_Draft_v3.docx",    type: "DOCX",  status: "synced"  },
  { name: "Peer_Eval_Matrix_WS2526.xlsx",       type: "XLSX",  status: "synced"  },
  { name: "Sprint_Backlog_Week4.pdf",           type: "PDF",   status: "pending" },
  { name: "TeamReflection_Canvas_Final.pptx",   type: "PPTX",  status: "synced"  },
];

const DELIV_TYPE_ICONS: Record<string, string> = {
  PDF: "📄", PPTX: "📊", DOCX: "📝", XLSX: "📈",
};

function OneDriveHub() {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, "synced">>({});

  function triggerSync(name: string) {
    if (syncing || overrides[name]) return;
    setSyncing(name);
    setTimeout(() => {
      setOverrides((prev) => ({ ...prev, [name]: "synced" }));
      setSyncing(null);
    }, 1200);
  }

  return (
    <div className="rounded-2xl border-2 border-[#0078D4]/30 bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <span className="text-xl">📂</span>
        <h3 className="text-lg font-bold tracking-tight text-foreground">Shared OneDrive Deliverables Hub</h3>
        <span className="ml-auto rounded-full bg-[#0078D4]/10 border border-[#0078D4]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0078D4]">
          OneDrive
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Project milestones synced to your shared CBS OneDrive workspace. Click a pending row to trigger real-time sync.
      </p>

      <ul className="mt-4 space-y-2">
        {DELIVERABLES_FILES.map((f) => {
          const effectiveStatus = overrides[f.name] ?? f.status;
          const isSyncing = syncing === f.name;

          return (
            <li key={f.name}>
              <button
                onClick={() => triggerSync(f.name)}
                disabled={effectiveStatus === "synced" && !isSyncing}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition hover:bg-secondary/60 disabled:cursor-default ${
                  effectiveStatus === "pending" ? "border-amber-400/40 bg-amber-50/30 dark:bg-amber-900/10" : "border-border bg-secondary/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{DELIV_TYPE_ICONS[f.type]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-foreground">{f.name}</div>
                    <div className="text-[10px] text-muted-foreground">{f.type} · CBS OneDrive</div>
                  </div>
                  <div className="shrink-0">
                    {isSyncing ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-[#0078D4]">
                        <Loader2 className="h-3 w-3 animate-spin" /> Syncing…
                      </span>
                    ) : effectiveStatus === "synced" ? (
                      <span className="flex items-center gap-1 rounded-full bg-[#7FBA00]/15 px-2 py-0.5 text-[10px] font-semibold text-[#538a00]">
                        <CheckCircle2 className="h-3 w-3" /> Synced to OneDrive
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        ⚠️ Changes Pending Approval
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{DELIVERABLES_FILES.filter((f) => (overrides[f.name] ?? f.status) === "synced").length} / {DELIVERABLES_FILES.length} files synced</span>
        <span className="text-[#0078D4]">Microsoft OneDrive · cbs-mail.de</span>
      </div>
    </div>
  );
}

/* ---------------- New: Group Velocity Check ---------------- */

const VELOCITY_OPTIONS: { label: string; strategy: string }[] = [
  {
    label: "Communication Lag",
    strategy: "Your team's high-Analytical members tend to silo. Trigger the Charter's 12h Communication SLA + pin a daily 09:00 async stand-up in your Teams channel.",
  },
  {
    label: "Conflicting Work Styles",
    strategy: "Pairing high-Vision with high-Execution traits creates friction. Lock the scope in a written one-pager so the Visionary stops re-opening decisions mid-sprint.",
  },
  {
    label: "Uneven Workload",
    strategy: "Your Operations Lead is over-indexed. Re-balance using the Role Allocator and offload one analytical task to a Generalist contributor.",
  },
  {
    label: "Deadline Slippage",
    strategy: "Procrastination flag detected in trait combo. Activate Milestone Lock (48h) from the Charter and assign the strongest Time-Management member as deadline owner.",
  },
  {
    label: "Unclear Decisions",
    strategy: "Conflict-avoidance pattern. Trigger the Disagreement Protocol: silent dissent is not consent. Schedule a 15-min decision sync.",
  },
];

function VelocityCheck() {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div className="mt-6 rounded-2xl border-2 border-accent/40 bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-accent" />
        <h3 className="text-base font-bold tracking-tight text-foreground">Group Velocity Check</h3>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Anonymous</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Log team friction in one tap. We map it to your matched-trait profile and surface a counter-move.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {VELOCITY_OPTIONS.map((o, i) => (
          <button
            key={o.label}
            onClick={() => setPick(i)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${pick === i ? "border-accent bg-accent text-accent-foreground" : "border-border bg-secondary text-foreground hover:border-accent/60"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {pick !== null && (
        <div className="mt-4 rounded-lg border-l-4 border-accent bg-accent/10 p-4 text-sm text-foreground animate-fade-in-up">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">Strategy prompt</div>
          <p className="mt-1">{VELOCITY_OPTIONS[pick].strategy}</p>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   FACULTY DASHBOARD — Prof. Stratmann command centre
   ================================================================ */

// Simulate 3 matched teams of 4 + 2 unmatched students from the mock pool
const FACULTY_TEAMS = [
  { id: 0, members: MOCK_STUDENTS.slice(0, 4),  course: "Digital Literacy" },
  { id: 1, members: MOCK_STUDENTS.slice(4, 8),  course: "Advanced Corporate Strategy" },
  { id: 2, members: MOCK_STUDENTS.slice(8, 12), course: "Data Analytics & Business Intelligence" },
];
const FACULTY_UNMATCHED = MOCK_STUDENTS.slice(12);

const COURSE_VELOCITY = [
  { course: "Digital Literacy",       velocity: 87, submissions: 23 },
  { course: "Financial Management",   velocity: 74, submissions: 18 },
  { course: "Sustainable Business",   velocity: 91, submissions: 31 },
  { course: "Strategic Management",   velocity: 68, submissions: 14 },
  { course: "Data Analytics",         velocity: 95, submissions: 27 },
  { course: "Advanced Strategy",      velocity: 82, submissions: 19 },
];

function facultySynergyScore(members: typeof MOCK_STUDENTS): number {
  const seed = members.reduce(
    (a, s) => a + s.id.split("").reduce((x, c) => x + c.charCodeAt(0), 0), 0
  );
  return 85 + (seed % 14);
}

function synergyColor(score: number): string {
  if (score >= 92) return "oklch(0.42 0.11 220)";
  if (score >= 85) return "oklch(0.72 0.13 195)";
  if (score >= 70) return "oklch(0.82 0.14 85)";
  return "oklch(0.63 0.21 29)";
}

function velocityColor(score: number): string {
  if (score >= 90) return "oklch(0.46 0.15 155)";
  if (score >= 75) return "oklch(0.72 0.13 195)";
  return "oklch(0.82 0.14 85)";
}

function SynergyBadge({ score }: { score: number }) {
  const label = score >= 92 ? "Elite" : score >= 85 ? "Strong" : score >= 70 ? "Good" : "At Risk";
  const cls =
    score >= 92
      ? "bg-[#0078D4]/15 text-[#0078D4]"
      : score >= 85
        ? "bg-accent/15 text-foreground"
        : score >= 70
          ? "bg-amber-100 text-amber-700"
          : "bg-red-100 text-red-700";
  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>{label}</span>
      <span className="text-2xl font-bold tracking-tight text-foreground">{score}%</span>
    </div>
  );
}

function FacultyDashboard() {
  const teams = useMemo(() =>
    FACULTY_TEAMS.map((t) => ({ ...t, synergy: facultySynergyScore(t.members) })),
  []);

  const avgSynergy = Math.round(teams.reduce((a, t) => a + t.synergy, 0) / teams.length);
  const matchedCount = MOCK_STUDENTS.length - FACULTY_UNMATCHED.length;

  return (
    <div className="animate-fade-in-up">

      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#0078D4]">
            <GraduationCap className="h-4 w-4" /> Faculty Command Centre
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Prof. Stratmann
          </h1>
          <p className="mt-1 text-muted-foreground">
            Digital Literacy · SoSe 26 · CBS International Business School Cologne
          </p>
        </div>
        <span className="mt-1 rounded-full border border-[#7FBA00]/40 bg-[#7FBA00]/10 px-3 py-1 text-xs font-semibold text-[#3d6b00]">
          ● Live cohort · {ACTIVE_STUDENTS.toLocaleString()}+ enrolled
        </span>
      </div>

      {/* ── KPI strip ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Students",
            value: MOCK_STUDENTS.length,
            sub: "enrolled this semester",
            Icon: Users,
            accent: "text-foreground",
          },
          {
            label: "Matched",
            value: `${Math.round((matchedCount / MOCK_STUDENTS.length) * 100)}%`,
            sub: `${matchedCount} of ${MOCK_STUDENTS.length} placed in teams`,
            Icon: CheckCircle2,
            accent: "text-[#7FBA00]",
          },
          {
            label: "Teams Active",
            value: teams.length,
            sub: "squads running this cohort",
            Icon: Shield,
            accent: "text-accent",
          },
          {
            label: "Avg Synergy",
            value: `${avgSynergy}%`,
            sub: "cross-cohort cognitive score",
            Icon: Award,
            accent: "text-[#0078D4]",
          },
        ].map(({ label, value, sub, Icon, accent }) => (
          <div key={label} className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
              <Icon className={`h-4 w-4 ${accent}`} />
            </div>
            <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Heatmap + Unmatched ── */}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">

        {/* Synergy Heatmap */}
        <div className="xl:col-span-2 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">Team Synergy Heatmap</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Cognitive diversity scores per matched squad — colour-coded from at-risk to elite.
          </p>

          <div className="mt-5 space-y-4">
            {teams.map((t) => (
              <div key={t.id} className="rounded-xl border p-4 transition hover:bg-secondary/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm text-foreground">
                      Team {String.fromCharCode(65 + t.id)}
                    </div>
                    <div className="text-xs text-muted-foreground">{t.course}</div>
                  </div>
                  <SynergyBadge score={t.synergy} />
                </div>

                {/* Member chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-1.5 rounded-full border bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                        {m.avatar}
                      </span>
                      {m.name.split(" ")[0]}
                      <span className="text-muted-foreground">· {m.role.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>

                {/* Synergy bar */}
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${t.synergy}%`, backgroundColor: synergyColor(t.synergy) }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-muted-foreground border-t pt-4">
            {[
              { label: "At Risk (<70%)",   color: "oklch(0.63 0.21 29)"   },
              { label: "Good (70–84%)",    color: "oklch(0.82 0.14 85)"   },
              { label: "Strong (85–91%)",  color: "oklch(0.72 0.13 195)"  },
              { label: "Elite (92%+)",     color: "oklch(0.42 0.11 220)"  },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className="h-2 w-5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Unmatched Students Alert */}
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`h-5 w-5 ${FACULTY_UNMATCHED.length > 0 ? "text-amber-500" : "text-[#7FBA00]"}`}
            />
            <h2 className="text-lg font-bold tracking-tight text-foreground">Unmatched Students</h2>
            <span
              className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                FACULTY_UNMATCHED.length > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-[#7FBA00]/15 text-[#3d6b00]"
              }`}
            >
              {FACULTY_UNMATCHED.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {FACULTY_UNMATCHED.length > 0
              ? "These students have not yet been placed in a matched team."
              : "All students successfully placed — no action needed."}
          </p>

          {FACULTY_UNMATCHED.length > 0 ? (
            <>
              <ul className="mt-4 space-y-2">
                {FACULTY_UNMATCHED.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2.5 rounded-lg border border-amber-200/60 bg-amber-50/40 px-3 py-2.5 dark:bg-amber-900/10"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {s.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-foreground">{s.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">
                        {s.semester} · {s.program}
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 shrink-0">
                      ⚠ Pending
                    </span>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="mt-4 w-full gap-1.5 bg-[#0078D4] hover:bg-[#0078D4]/90 text-white">
                <Sparkles className="h-3.5 w-3.5" /> Auto-assign pending students
              </Button>
            </>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-[#7FBA00]" />
              <div className="text-sm font-medium text-foreground">Cohort fully matched</div>
              <div className="text-xs text-muted-foreground">All {MOCK_STUDENTS.length} students are in active squads.</div>
            </div>
          )}

          {/* Matching health summary */}
          <div className="mt-5 rounded-xl border bg-secondary/40 p-3 text-xs space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Match rate</span>
              <span className="font-semibold text-foreground">
                {Math.round((matchedCount / MOCK_STUDENTS.length) * 100)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-[#7FBA00] transition-all duration-700"
                style={{ width: `${Math.round((matchedCount / MOCK_STUDENTS.length) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-muted-foreground pt-1">
              <span>Risk flags detected</span>
              <span className="font-semibold text-amber-600">
                {teams.filter((t) =>
                  t.members.some((m) => m.weaknesses.some((w) => w.toLowerCase().includes("procrastin")))
                ).length} teams
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Submission Velocity ── */}
      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Submission Velocity by Course
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Average on-time delivery rate and submission count per module — SoSe 26.
        </p>

        <div className="mt-5 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COURSE_VELOCITY} margin={{ top: 8, right: 16, bottom: 32, left: 0 }}>
              <XAxis
                dataKey="course"
                tick={{ fontSize: 11, fill: "oklch(0.35 0.04 255)" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-18}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "oklch(0.35 0.04 255)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "Velocity"]}
                contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid oklch(0.91 0.01 250)" }}
              />
              <Bar dataKey="velocity" radius={[4, 4, 0, 0]}>
                {COURSE_VELOCITY.map((entry, i) => (
                  <Cell key={i} fill={velocityColor(entry.velocity)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Course table */}
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 pr-4 font-semibold text-muted-foreground">Course</th>
                <th className="pb-2 pr-4 text-right font-semibold text-muted-foreground">Velocity</th>
                <th className="pb-2 pr-4 text-right font-semibold text-muted-foreground">Submissions</th>
                <th className="pb-2 text-right font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {COURSE_VELOCITY.map((c) => (
                <tr key={c.course} className="transition hover:bg-secondary/40">
                  <td className="py-2 pr-4 font-medium text-foreground">{c.course}</td>
                  <td
                    className="py-2 pr-4 text-right font-mono font-bold"
                    style={{ color: velocityColor(c.velocity) }}
                  >
                    {c.velocity}%
                  </td>
                  <td className="py-2 pr-4 text-right text-muted-foreground">{c.submissions}</td>
                  <td className="py-2 text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        c.velocity >= 90
                          ? "bg-[#7FBA00]/15 text-[#3d6b00]"
                          : c.velocity >= 75
                            ? "bg-accent/15 text-foreground"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {c.velocity >= 90 ? "On Track" : c.velocity >= 75 ? "Good" : "At Risk"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}