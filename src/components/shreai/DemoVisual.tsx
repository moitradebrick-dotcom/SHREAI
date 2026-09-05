export type DemoVisualKind = "formula" | "circuit" | "water" | "inverse";

export function DemoVisual({
  kind,
  caption,
}: {
  kind: DemoVisualKind;
  caption?: string | undefined;
}) {
  return (
    <figure className="glass-card animate-in fade-in duration-500 p-6">
      <div className="flex min-h-56 items-center justify-center">
        {kind === "formula" ? <FormulaCard main="V = I × R" /> : null}
        {kind === "inverse" ? <FormulaCard main="I = V / R" /> : null}
        {kind === "circuit" ? <CircuitSvg /> : null}
        {kind === "water" ? <WaterSvg /> : null}
      </div>
      {caption ? (
        <figcaption className="mt-4 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function FormulaCard({ main }: { main: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-5xl font-semibold tracking-tight text-primary md:text-6xl">
        {main}
      </p>
      <div className="mt-6 flex justify-center gap-6 text-xs uppercase tracking-wide text-muted-foreground">
        <span>V · volts</span>
        <span>I · amperes</span>
        <span>R · ohms</span>
      </div>
    </div>
  );
}

function CircuitSvg() {
  return (
    <svg viewBox="0 0 320 180" className="w-full max-w-md" role="img" aria-label="Simple circuit with a battery and a resistor">
      <rect x="20" y="20" width="280" height="140" rx="12" fill="none" className="stroke-primary" strokeWidth="3" />
      <rect x="130" y="8" width="60" height="24" className="fill-background" />
      <text x="160" y="26" textAnchor="middle" className="fill-foreground" fontSize="14">
        R
      </text>
      <rect x="138" y="10" width="44" height="20" rx="4" fill="none" className="stroke-accent" strokeWidth="3" />
      <rect x="8" y="76" width="24" height="28" className="fill-background" />
      <line x1="14" y1="80" x2="14" y2="100" className="stroke-foreground" strokeWidth="4" />
      <line x1="26" y1="86" x2="26" y2="94" className="stroke-foreground" strokeWidth="4" />
      <text x="52" y="96" className="fill-muted-foreground" fontSize="13">
        V
      </text>
      <circle r="5" className="fill-accent">
        <animateMotion dur="3s" repeatCount="indefinite" path="M20,20 H300 V160 H20 Z" />
      </circle>
      <text x="230" y="150" className="fill-muted-foreground" fontSize="13">
        I flows
      </text>
    </svg>
  );
}

function WaterSvg() {
  return (
    <svg viewBox="0 0 340 180" className="w-full max-w-md" role="img" aria-label="Water pipe analogy: a narrow pipe lets less water through">
      <text x="10" y="24" className="fill-muted-foreground" fontSize="13">
        Wide pipe · low resistance
      </text>
      <rect x="10" y="34" width="300" height="30" rx="8" className="fill-primary/20 stroke-primary" strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cy="49" r="6" className="fill-primary">
          <animate
            attributeName="cx"
            from="18"
            to="302"
            dur="1.4s"
            begin={`${i * 0.28}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      <text x="10" y="108" className="fill-muted-foreground" fontSize="13">
        Narrow pipe · high resistance
      </text>
      <rect x="10" y="118" width="300" height="12" rx="6" className="fill-accent/20 stroke-accent" strokeWidth="2" />
      {[0, 1].map((i) => (
        <circle key={i} cy="124" r="4" className="fill-accent">
          <animate
            attributeName="cx"
            from="18"
            to="302"
            dur="3.6s"
            begin={`${i * 1.8}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      <text x="10" y="160" className="fill-muted-foreground" fontSize="13">
        Same pump (voltage) → narrower pipe (more resistance) → less flow (less current)
      </text>
    </svg>
  );
}
