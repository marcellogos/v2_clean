// Official CBS branding lockup.
// All three letters rendered as a single SVG text run so they share
// identical font-family, font-weight, font-size, baseline, and glyph metrics.
export function CbsLogo({
  className = "",
  showTagline = true,
  onGoHome,
}: {
  className?: string;
  showTagline?: boolean;
  onGoHome?: () => void;
}) {
  const inner = (
    <>
      <div className="flex items-center gap-2.5">
        {/*
          Single <text> element for "CBS" — guarantees all three glyphs share
          the same font metrics, cap-height, baseline, and advance widths.
          overflow-visible prevents clipping; height="34" scales to ~34 CSS px.
        */}
        <svg
          viewBox="0 0 96 44"
          height="34"
          className="overflow-visible text-foreground"
          aria-label="CBS"
        >
          <text
            x="0"
            y="36"
            fontFamily="'Arial Black', 'Helvetica Neue', Arial, system-ui, sans-serif"
            fontWeight="900"
            fontSize="44"
            letterSpacing="-2"
            fill="currentColor"
          >
            CBS
          </text>
        </svg>

        <div className="hidden sm:block text-foreground leading-[1.05]">
          <div className="text-[9px] font-bold uppercase tracking-[0.18em]">University</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.18em]">of Applied</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.18em]">Sciences</div>
        </div>
      </div>

      <div className="h-9 w-px bg-border" aria-hidden />

      <div className="leading-tight">
        <div className="text-lg font-medium tracking-tight text-foreground">TeamUp</div>
        {showTagline && (
          <div className="hidden md:block text-[10px] italic text-muted-foreground">
            Empowering Students, Transforming Learning
          </div>
        )}
      </div>
    </>
  );

  if (onGoHome) {
    return (
      <button
        onClick={onGoHome}
        className={`flex items-center gap-3 rounded-md transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-accent/50 ${className}`}
        aria-label="Go to home"
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {inner}
    </div>
  );
}

export function MicrosoftLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 23 23" aria-hidden>
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}
