import { Activity, Code2, GitBranch, ListOrdered, Sigma, Sparkles, Timer } from "lucide-react";

import type { TeachingVisual } from "@/lib/teachai/types";

const ICONS = {
  equation: Sigma,
  diagram: GitBranch,
  graph: Activity,
  code: Code2,
  timeline: Timer,
  concept: Sparkles,
  steps: ListOrdered,
} as const;

export function VisualPanel({ visual }: { visual?: TeachingVisual | null }) {
  if (!visual) {
    return (
      <div className="glass-card flex min-h-[280px] items-center justify-center p-8 text-center text-sm text-muted-foreground">
        The teaching board is clear for this part of the lesson.
      </div>
    );
  }

  const Icon = ICONS[visual.type] ?? Sparkles;

  return (
    <section
      className="glass-card min-h-[280px] p-6"
      aria-label={`Teaching visual: ${visual.title}`}
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
        <Icon className="size-4" />
        {visual.type}
      </div>
      <h2 className="mt-2 font-display text-xl font-semibold">{visual.title}</h2>

      <div className="mt-5">
        {visual.type === "equation" && visual.content ? (
          <p className="rounded-xl border border-primary/25 bg-surface px-5 py-6 text-center font-display text-2xl tracking-tight md:text-3xl">
            {visual.content}
          </p>
        ) : null}

        {visual.type === "code" && visual.content ? (
          <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-4 text-sm">
            <code>{visual.content}</code>
          </pre>
        ) : null}

        {visual.type === "graph" && visual.content ? (
          <p className="rounded-xl border border-border bg-surface px-5 py-6 text-center text-lg">
            {visual.content}
          </p>
        ) : null}

        {visual.type === "steps" && visual.items?.length ? (
          <ol className="space-y-3">
            {visual.items.map((item, i) => (
              <li key={item} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {visual.type === "timeline" && visual.items?.length ? (
          <ol className="relative space-y-4 border-l border-primary/30 pl-6">
            {visual.items.map((item) => (
              <li key={item} className="text-sm">
                <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ol>
        ) : null}

        {(visual.type === "diagram" || visual.type === "concept") && visual.items?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {visual.items.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed"
              >
                {item}
              </div>
            ))}
          </div>
        ) : null}

        {!visual.items?.length && !visual.content ? (
          <p className="text-sm text-muted-foreground">{visual.caption}</p>
        ) : null}
      </div>

      {visual.caption && (visual.items?.length || visual.content) ? (
        <p className="mt-4 text-sm text-muted-foreground">{visual.caption}</p>
      ) : null}
    </section>
  );
}
