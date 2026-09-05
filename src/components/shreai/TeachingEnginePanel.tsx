import { AlertTriangle, ArrowDown, Cpu } from "lucide-react";

export interface EngineState {
  concept: string;
  understanding: number;
  issue: string | null;
  strategy: string;
  next: string;
}

export function TeachingEnginePanel({
  state,
  changed,
}: {
  state: EngineState;
  changed: boolean;
}) {
  return (
    <section
      className={`glass-card p-5 transition-all duration-500 ${
        changed ? "border-accent/60 shadow-glow" : ""
      }`}
      aria-live="polite"
    >
      <header className="flex items-center gap-2">
        <Cpu className="size-4 text-accent" />
        <h3 className="font-display text-sm font-semibold tracking-wide">TEACHING ENGINE</h3>
      </header>

      <dl className="mt-4 space-y-3 text-sm">
        <Row label="Concept" value={state.concept} />
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Understanding</dt>
          <dd className="mt-1 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${state.understanding}%` }}
              />
            </div>
            <span className="tabular-nums">{state.understanding}%</span>
          </dd>
        </div>
        {state.issue ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-destructive">
              <AlertTriangle className="size-3.5" /> Detected issue
            </p>
            <p className="mt-1 text-sm">{state.issue}</p>
          </div>
        ) : null}
        <Row label="Strategy" value={state.strategy} />
        <Row label="Next" value={state.next} />
      </dl>

      {changed ? (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-accent/40 bg-accent/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Teaching method changed
          </p>
          <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
            {["Formula", "Visual analogy", "Simpler explanation", "Easier question"].map(
              (step, i) => (
                <li key={step} className="flex items-center gap-2">
                  {i > 0 ? <ArrowDown className="size-3 text-accent" /> : <span className="w-3" />}
                  <span className={i === 0 ? "line-through opacity-60" : "text-foreground"}>
                    {step}
                  </span>
                </li>
              ),
            )}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
