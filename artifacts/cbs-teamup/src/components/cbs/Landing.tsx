import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CbsLogo, MicrosoftLogo } from "./Logo";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sparkles, ShieldCheck, Users, BarChart3, GraduationCap, Lock, Workflow,
} from "lucide-react";
import { ACTIVE_STUDENTS, type UserProfile } from "@/lib/cbs-data";

type ModalKey = null | "faculty" | "privacy";

function animateValue(
  setter: (v: number) => void,
  start: number,
  end: number,
  duration: number,
  onDone?: () => void,
) {
  const startTime = performance.now();
  function tick(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setter(Math.round(start + (end - start) * eased));
    if (progress < 1) requestAnimationFrame(tick);
    else onDone?.();
  }
  requestAnimationFrame(tick);
}

function useSequentialCounters() {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [students, setStudents] = useState(1250);
  const [synergy, setSynergy]   = useState(0);
  const [minutes, setMinutes]   = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
          // Stage 1 → Stage 2 → Stage 3 cascade
          animateValue(setStudents, 1250, ACTIVE_STUDENTS, 1800, () =>
            animateValue(setSynergy, 0, 94, 1000, () =>
              animateValue(setMinutes, 0, 5, 700),
            ),
          );
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered]);

  return { ref, students, synergy, minutes };
}

const HOW_IT_WORKS = [
  {
    icon: GraduationCap,
    title: "1 · Calibrate",
    body: "Sign in with your CBS Microsoft 365 account and score yourself 1–5 on five precise work-style dimensions.",
    badge: "🔒 100% Academic Safety Net Guaranteed – Free from bias",
  },
  {
    icon: Sparkles,
    title: "2 · Match",
    body: "Our engine scans active CBS profiles in your course, balances traits, and proposes a 4-person squad with weakness coverage.",
    badge: "📊 Syllabus & Rubric Alignment Checked",
  },
  {
    icon: Workflow,
    title: "3 · Launch",
    body: "Auto-generated Working Charter, calendar of milestones, and a one-click handoff to a private Microsoft Teams channel.",
    badge: "🛡️ Anonymous Friction Logging Options",
  },
];

export function Landing({
  onSignIn,
  profile,
  onReturnToDashboard,
}: {
  onSignIn: () => void;
  profile?: UserProfile | null;
  onReturnToDashboard?: () => void;
}) {
  const [modal, setModal] = useState<ModalKey>(null);
  const { ref: counterRef, students, synergy, minutes } = useSequentialCounters();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Authenticated session banner */}
      {profile && (
        <div className="border-b border-primary/20 bg-primary/5 py-2">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
            <span className="text-sm text-muted-foreground">
              Session active · <strong className="text-foreground">{profile.name}</strong>
            </span>
            <Button size="sm" onClick={onReturnToDashboard} className="gap-1.5 h-7 text-xs">
              Return to Dashboard →
            </Button>
          </div>
        </div>
      )}

      {/* Header with visible separator */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <CbsLogo />
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition">How it works</button>
            <button onClick={() => setModal("faculty")} className="hover:text-foreground transition">For faculty</button>
            <button onClick={() => setModal("privacy")} className="hover:text-foreground transition">Privacy</button>
          </nav>
          <Button variant="outline" size="sm" onClick={onSignIn}>Sign in</Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-10 md:pt-20">
        {/* Hero */}
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Live pilot · Summer Semester 2026 (SoSe 26) · CBS Cologne campus
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Stop guessing.<br />
              Build <span className="bg-[image:var(--gradient-accent)] bg-clip-text text-transparent">data-driven</span> academic teams at CBS.
            </h1>
            <p className="mt-6 max-w-lg text-base text-muted-foreground md:text-lg">
              TeamUp matches you with classmates whose strengths complete yours — using cognitive diversity, work-style fit, and weakness coverage. No more random pairings the morning of the deadline.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3">
              <Button
                size="lg"
                onClick={onSignIn}
                className="group h-14 gap-3 rounded-md bg-primary px-6 text-base font-semibold shadow-[var(--shadow-elegant)] hover:bg-primary/90"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded bg-white">
                  <MicrosoftLogo size={18} />
                </span>
                Sign in with Microsoft Office 365
              </Button>
              <p className="text-xs text-muted-foreground">
                CBS-issued accounts only · @cbs-mail.de · Single sign-on via Azure AD
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> GDPR-compliant</div>
              <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-accent" /> 1,200+ students onboarded</div>
              <div className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-accent" /> Avg. 92% synergy score</div>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 rounded-3xl bg-[image:var(--gradient-hero)] opacity-20 blur-2xl" />
            <div className="relative rounded-2xl border bg-card p-6 shadow-[var(--shadow-elegant)]">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team Synergy</div>
                <div className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">+94%</div>
              </div>
              <div className="mt-4 flex items-center">
                {["LH", "JB", "SW", "MS"].map((i, idx) => (
                  <div key={i} className="-ml-2 first:ml-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-4 ring-card" style={{ zIndex: 10 - idx }}>
                    {i}
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Analytical depth", v: 92 },
                  { label: "Strategic vision", v: 88 },
                  { label: "Project coordination", v: 96 },
                  { label: "Weakness coverage", v: 90 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{row.label}</span>
                      <span className="font-semibold text-foreground">{row.v}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-[image:var(--gradient-accent)]" style={{ width: `${row.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-dashed border-accent/40 bg-accent/5 p-3 text-xs text-foreground">
                <span className="font-semibold">🛡️ Slacker Insurance auto-enabled.</span> Internal milestones locked 48h before submission.
              </div>
            </div>
          </div>
        </div>

        {/* Animated student counter strip — left→middle→right cascade */}
        <div ref={counterRef} className="mt-20 rounded-2xl border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:justify-around sm:gap-0 sm:text-left">
            <div>
              <div className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
                {students.toLocaleString()}<span className="text-accent">+</span>
              </div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">Active CBS Students Matched</div>
            </div>
            <div className="hidden h-16 w-px bg-border sm:block" />
            <div>
              <div className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
                {synergy}<span className="text-2xl font-semibold text-accent">%</span>
              </div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">Average Team Synergy Score</div>
            </div>
            <div className="hidden h-16 w-px bg-border sm:block" />
            <div>
              <div className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
                &lt;&nbsp;{minutes || "—"}<span className="text-2xl font-semibold text-accent">min</span>
              </div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">From Sign-in to Signed Charter</div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="mt-24 scroll-mt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">How it works</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Three steps to a high-performing CBS squad.</h2>
            <p className="mt-3 text-muted-foreground">From Azure SSO to a signed team charter in under five minutes.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ icon: Icon, title, body, badge }) => (
              <div key={title} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="mt-4 text-base font-semibold text-foreground">{title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                <div className="mt-4 rounded-lg border border-dashed border-accent/30 bg-accent/5 px-3 py-2 text-[11px] font-medium text-foreground">
                  {badge}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 border-t pt-8 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>© 2026 Cologne Business School · TeamUp Pilot</span>
            <div className="flex gap-5">
              <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground">How it works</button>
              <button onClick={() => setModal("faculty")} className="hover:text-foreground">For faculty</button>
              <button onClick={() => setModal("privacy")} className="hover:text-foreground">Privacy</button>
            </div>
          </div>
        </footer>
      </main>

      <Dialog open={modal === "faculty"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-accent" /> TeamUp for CBS Faculty</DialogTitle>
            <DialogDescription>How TeamUp supports your teaching workflow.</DialogDescription>
          </DialogHeader>
          <ul className="mt-3 space-y-3 text-sm text-foreground">
            <li>• <strong>Auto-balanced cohorts.</strong> Generate diverse teams for any course in under a minute — no spreadsheet juggling.</li>
            <li>• <strong>Visibility, not surveillance.</strong> Read-only dashboard of team charters, milestones, and peer feedback aggregates.</li>
            <li>• <strong>Intervention signals.</strong> Quiet flags when a team's peer-review scores or velocity drop below the cohort average.</li>
            <li>• <strong>Pilot with Prof. Stratmann.</strong> Currently running in Digital Literacy SoSe 26 — full report available on request.</li>
          </ul>
          <Button className="mt-4" onClick={() => setModal(null)}>Request faculty briefing</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "privacy"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-accent" /> Privacy & data handling</DialogTitle>
            <DialogDescription>What we collect, where it lives, who can see it.</DialogDescription>
          </DialogHeader>
          <ul className="mt-3 space-y-3 text-sm text-foreground">
            <li>• <strong>EU-only hosting.</strong> All profile data stays on Frankfurt-region Microsoft Azure tenants.</li>
            <li>• <strong>Minimal collection.</strong> Only the 5 work-style scores, your declared strengths/weaknesses, and your CBS course.</li>
            <li>• <strong>Peer feedback is anonymised.</strong> Aggregates only — individual ratings are never shown to teammates.</li>
            <li>• <strong>Right to erasure.</strong> Delete your profile from the dashboard at any time — full data wipe within 24h.</li>
            <li>• GDPR Art. 6(1)(a) consent · Data Controller: CBS Datenschutzbeauftragter.</li>
          </ul>
          <Button className="mt-4" onClick={() => setModal(null)}>Got it</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
