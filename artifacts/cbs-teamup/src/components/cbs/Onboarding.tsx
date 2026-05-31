import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CbsLogo } from "./Logo";
import {
  CBS_COURSES, CBS_DEGREES, CBS_SEMESTERS, STRENGTH_OPTIONS, WEAKNESS_OPTIONS, TRAIT_META,
  type UserProfile, type Trait,
} from "@/lib/cbs-data";
import { Check, ChevronRight, GraduationCap, Sparkles, Target } from "lucide-react";

export function Onboarding({
  name, email, onComplete, onBack,
}: {
  name: string;
  email: string;
  onComplete: (p: UserProfile) => void;
  onBack?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [course, setCourse] = useState(CBS_COURSES[0]);
  const [degree, setDegree] = useState(CBS_DEGREES[0]);
  const [semester, setSemester] = useState(CBS_SEMESTERS[0]);
  const [traits, setTraits] = useState<Trait>({
    leadership: 3, analytical: 3, complexity: 3, research: 3, vision: 3,
  });
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);

  function toggle(list: string[], set: (l: string[]) => void, val: string, max: number) {
    if (list.includes(val)) set(list.filter((v) => v !== val));
    else if (list.length < max) set([...list, val]);
  }

  const [dsgvoAccepted, setDsgvoAccepted] = useState(false);

  const canNext =
    (step === 1 && !!course && !!degree && !!semester && dsgvoAccepted) ||
    (step === 2) ||
    (step === 3 && strengths.length === 3 && weaknesses.length === 2);

  function next() {
    if (step < 3) return setStep(step + 1);
    onComplete({ name, email, course, degree, semester, traits, strengths, weaknesses });
  }

  const stepMeta = [
    { n: 1, label: "Academic Context", icon: GraduationCap },
    { n: 2, label: "Work Style", icon: Sparkles },
    { n: 3, label: "Strengths & Weaknesses", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <CbsLogo />
        <div className="text-xs text-muted-foreground">Signed in as <span className="font-semibold text-foreground">{email}</span></div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-20">
        <div className="flex items-center justify-between gap-2 pt-4">
          {stepMeta.map((s, i) => {
            const active = s.n === step;
            const done = s.n < step;
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex flex-1 items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${active ? "border-primary bg-primary text-primary-foreground" : done ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground"}`}>
                  {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="hidden sm:block">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Step {s.n}</div>
                  <div className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                </div>
                {i < stepMeta.length - 1 && <div className={`h-px flex-1 ${done ? "bg-accent" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        <div key={step} className="mt-10 rounded-2xl border bg-card p-8 shadow-[var(--shadow-card)] animate-fade-in-up">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Where are you studying right now?</h2>
              <p className="mt-2 text-sm text-muted-foreground">We match you with classmates in the same course and program.</p>
              <div className="mt-8 space-y-6">
                <div>
                  <label className="text-sm font-medium">Current CBS course</label>
                  <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger className="mt-2 h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>{CBS_COURSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Degree program</label>
                    <Select value={degree} onValueChange={setDegree}>
                      <SelectTrigger className="mt-2 h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>{CBS_DEGREES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Current semester</label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger className="mt-2 h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>{CBS_SEMESTERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Compact DSGVO compliance acknowledgment */}
              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[#0078D4]/30 bg-[#0078D4]/5 px-4 py-3 transition hover:bg-[#0078D4]/8">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={dsgvoAccepted}
                    onChange={(e) => setDsgvoAccepted(e.target.checked)}
                  />
                  <div className={`flex h-4 w-4 items-center justify-center rounded border-2 transition ${dsgvoAccepted ? "border-[#0078D4] bg-[#0078D4]" : "border-border bg-card"}`}>
                    {dsgvoAccepted && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
                <span className="text-xs text-foreground leading-relaxed">
                  🛡️ <strong>I accept</strong> university DSGVO data minimization parameters for optimized match routing.
                  <span className="ml-1 text-muted-foreground">(Art. 5 DSGVO · Educloud-hosted · Germany only)</span>
                </span>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">How do you actually work?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Score yourself <strong>1 to 5</strong> on each dimension — the helper text updates as you slide.</p>
              <div className="mt-8 space-y-10">
                {TRAIT_META.map((t) => {
                  const value = traits[t.key];
                  return (
                    <div key={t.key}>
                      <div className="flex items-baseline justify-between">
                        <div className="text-sm font-semibold text-foreground">{t.label}</div>
                        <div className="text-xs font-mono font-semibold text-accent">{value} / 5</div>
                      </div>
                      <div className="mt-1 flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                        <span>{t.left}</span>
                        <span>{t.right}</span>
                      </div>
                      <Slider
                        className="mt-3"
                        value={[value]}
                        min={1} max={5} step={1}
                        onValueChange={(v) => setTraits({ ...traits, [t.key]: v[0] })}
                      />
                      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                        {[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}
                      </div>
                      <div className="mt-3 rounded-md border border-dashed border-accent/40 bg-accent/5 px-3 py-2 text-xs text-foreground">
                        {t.helpers[value]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">What do you bring — and what trips you up?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Pick exactly 3 strengths and 2 weaknesses. We use weaknesses to cover you, not judge you.</p>
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Your 3 strengths</div>
                  <div className="text-xs text-muted-foreground">{strengths.length}/3 selected</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STRENGTH_OPTIONS.map((s) => {
                    const on = strengths.includes(s);
                    return (
                      <button key={s} onClick={() => toggle(strengths, setStrengths, s, 3)}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition ${on ? "border-accent bg-accent text-accent-foreground font-semibold" : "border-border bg-secondary text-muted-foreground hover:border-accent/60"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Your 2 weaknesses</div>
                  <div className="text-xs text-muted-foreground">{weaknesses.length}/2 selected</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WEAKNESS_OPTIONS.map((s) => {
                    const on = weaknesses.includes(s);
                    return (
                      <button key={s} onClick={() => toggle(weaknesses, setWeaknesses, s, 2)}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition ${on ? "border-primary bg-primary text-primary-foreground font-semibold" : "border-border bg-secondary text-muted-foreground hover:border-primary/60"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="mt-10 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => (step === 1 ? onBack?.() : setStep(step - 1))}
            >
              Back
            </Button>
            <Button disabled={!canNext} onClick={next} className="gap-2">
              {step === 3 ? "Go to dashboard" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}