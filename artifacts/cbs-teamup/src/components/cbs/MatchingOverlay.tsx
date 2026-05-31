import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STEPS = [
  "Analyzing cognitive diversity…",
  "Balancing weaknesses with complementary strengths…",
  "Optimizing team synergy across 1,247 CBS profiles…",
  "Locking in your perfect team…",
];

export function MatchingOverlay({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t1 = setInterval(() => setI((x) => Math.min(x + 1, STEPS.length - 1)), 500);
    const t2 = setTimeout(onDone, 2100);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[image:var(--gradient-hero)] animate-fade-in">
      <div className="w-full max-w-md px-6 text-center text-primary-foreground">
        <div className="relative mx-auto h-24 w-24">
          <div className="absolute inset-0 rounded-full border-2 border-accent/40 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-accent/60 animate-ping" style={{ animationDelay: "0.3s" }} />
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-accent">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-bold tracking-tight">Building your perfect team</h2>
        <div className="mt-8 space-y-3 text-left">
          {STEPS.map((s, idx) => (
            <div
              key={s}
              className={`flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-sm transition ${idx <= i ? "bg-white/10 text-primary-foreground" : "bg-transparent text-primary-foreground/40"}`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${idx < i ? "bg-accent text-accent-foreground" : idx === i ? "bg-white/20" : "bg-white/5"}`}>
                {idx < i ? "✓" : idx === i ? <Loader2 className="h-3 w-3 animate-spin" /> : ""}
              </span>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}