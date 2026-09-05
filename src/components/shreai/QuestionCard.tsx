import { Check, X } from "lucide-react";

import type { DemoQuestion, Lang } from "@/lib/shreai/demoScript";

export function QuestionCard({
  question,
  language,
  selected,
  revealed,
  onSelect,
  hint,
}: {
  question: DemoQuestion;
  language: Lang;
  selected: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  hint?: string;
}) {
  return (
    <section className="glass-card animate-in fade-in slide-in-from-bottom-2 p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {question.concept} · {question.kind}
      </p>
      <h3 className="mt-2 font-display text-lg font-semibold">{question.prompt[language]}</h3>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correctIndex;
          const showState = revealed && (isSelected || isCorrect);
          return (
            <button
              key={option}
              type="button"
              disabled={revealed}
              onClick={() => onSelect(i)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-300 ${
                showState && isCorrect
                  ? "border-primary bg-primary/15"
                  : showState && isSelected
                    ? "border-destructive bg-destructive/15"
                    : isSelected
                      ? "border-primary/60 bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-surface"
              } ${revealed ? "cursor-default" : ""}`}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
              {showState && isCorrect ? <Check className="size-4 text-primary" /> : null}
              {showState && isSelected && !isCorrect ? (
                <X className="size-4 text-destructive" />
              ) : null}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <p className="mt-4 rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
          {question.explain[language]}
        </p>
      ) : null}
    </section>
  );
}
