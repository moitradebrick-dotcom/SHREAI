import { Check, CircleDot, TriangleAlert } from "lucide-react";

import { LEARNING_PATH, LESSON_TITLE } from "@/lib/shreai/demoScript";

export function ProgressPanel({
  overall,
  currentConcept,
  mastery,
}: {
  overall: number;
  currentConcept: string;
  mastery: { name: string; value: number }[];
}) {
  return (
    <div className="space-y-4">
      <section className="glass-card p-5">
        <h3 className="font-display text-sm font-semibold tracking-wide">YOUR PROGRESS</h3>
        <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Lesson</p>
        <p className="text-sm">{LESSON_TITLE}</p>

        <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Overall</p>
        <div className="mt-1 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${overall}%` }}
            />
          </div>
          <span className="text-sm tabular-nums">{overall}%</span>
        </div>

        <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
          Current concept
        </p>
        <p className="text-sm">{currentConcept}</p>

        <ul className="mt-4 space-y-2">
          {mastery.map((m) => (
            <li key={m.name} className="flex items-center gap-2 text-sm">
              {m.value >= 80 ? (
                <Check className="size-4 text-primary" />
              ) : m.value >= 70 ? (
                <CircleDot className="size-4 text-accent" />
              ) : (
                <TriangleAlert className="size-4 text-destructive" />
              )}
              <span className="flex-1 truncate">{m.name}</span>
              <span className="tabular-nums text-muted-foreground transition-all duration-500">
                {m.value}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass-card p-5">
        <h3 className="font-display text-sm font-semibold tracking-wide">LEARNING PATH</h3>
        <ol className="mt-4 space-y-3">
          {LEARNING_PATH.map((node) => (
            <li key={node.name} className="flex items-center gap-3 text-sm">
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  node.state === "done"
                    ? "border-primary bg-primary/20 text-primary"
                    : node.state === "current"
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-border text-muted-foreground"
                }`}
              >
                {node.state === "done" ? "✓" : node.state === "current" ? "●" : "○"}
              </span>
              <span
                className={
                  node.state === "upcoming" ? "text-muted-foreground" : "text-foreground"
                }
              >
                {node.name}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
