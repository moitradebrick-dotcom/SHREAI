import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Loader2, PlayCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { planLesson } from "@/lib/teachai/agents.functions";
import { DEMO_PLAN } from "@/lib/teachai/demo";
import {
  DURATIONS,
  KNOWLEDGE_LEVELS,
  LANGUAGES,
  LEARNING_GOALS,
  TEACHING_STYLES,
} from "@/lib/teachai/types";

const SUGGESTIONS = [
  "Current Electricity",
  "Newton's Laws",
  "Machine Learning",
  "React Hooks",
  "Photosynthesis",
  "World War II",
];

const PLANNING_STEPS = [
  "Understanding your goal…",
  "Planning your lesson…",
  "Choosing the best examples…",
  "Preparing your teacher…",
];

export const Route = createFileRoute("/_authenticated/learn")({
  validateSearch: (search: Record<string, unknown>): { topic?: string; revise?: boolean } => ({
    ...(typeof search["topic"] === "string" ? { topic: search["topic"] as string } : {}),
    ...(search["revise"] === true || search["revise"] === "true" ? { revise: true } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Teach me a topic — SHREAI lesson setup" },
      {
        name: "description",
        content:
          "Choose a topic, your language, level and how many minutes you have. SHREAI plans the whole lesson around it.",
      },
      { property: "og:title", content: "Teach me a topic — SHREAI" },
      {
        property: "og:description",
        content: "Set the topic, time and language; your AI teacher plans the rest.",
      },
    ],
  }),
  component: Learn,
});

function Learn() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_authenticated/learn" });
  const runPlan = useServerFn(planLesson);

  const [topic, setTopic] = useState(search.topic ?? "");
  const [duration, setDuration] = useState<number>(10);
  const [language, setLanguage] = useState(profile?.preferred_language ?? "English");
  const [level, setLevel] = useState(profile?.knowledge_level ?? "Beginner");
  const [style, setStyle] = useState(profile?.teaching_style ?? "Simple explanations");
  const [goal, setGoal] = useState(profile?.learning_goal ?? "Understand a concept");
  const [phase, setPhase] = useState(-1);

  const busy = phase >= 0;

  const start = async (demo = false) => {
    if (!user) return;
    if (!demo && !topic.trim()) {
      toast.error("Tell your teacher what to teach first.");
      return;
    }

    setPhase(0);
    const ticker = window.setInterval(
      () => setPhase((p) => Math.min(PLANNING_STEPS.length - 1, p + 1)),
      1400,
    );

    try {
      let plan = DEMO_PLAN;
      let demoMode = true;

      if (!demo) {
        const { data: weakRows } = await supabase
          .from("concept_mastery")
          .select("concept")
          .lt("mastery", 0.6)
          .limit(6);

        const result = await runPlan({
          data: {
            topic: topic.trim(),
            duration,
            language,
            difficulty: level,
            teachingStyle: style,
            goal,
            profile: {
              education_level: profile?.education_level ?? null,
              knowledge_level: level,
              preferred_language: language,
              learning_goal: goal,
              teaching_style: style,
              lesson_depth: profile?.lesson_depth ?? "Standard",
            },
            weakConcepts: (weakRows ?? []).map((r) => r.concept),
          },
        });
        plan = result.plan;
        demoMode = result.demo;
        if (result.demo && result.notice) toast.message("Demo Mode", { description: result.notice });
      }

      const { data: lesson, error } = await supabase
        .from("lessons")
        .insert({
          user_id: user.id,
          title: plan.title,
          topic: demo ? "Current Electricity" : topic.trim(),
          objective: plan.objective,
          language: plan.language,
          difficulty: plan.difficulty ?? level,
          duration_minutes: demo ? 10 : duration,
          teaching_style: style,
          plan: plan as unknown as never,
          demo_mode: demoMode,
        })
        .select("id")
        .single();

      if (error || !lesson) throw error ?? new Error("no lesson");
      void navigate({ to: "/lesson/$lessonId", params: { lessonId: lesson.id } });
    } catch {
      toast.error("Couldn't start the lesson. Please try again.");
      setPhase(-1);
    } finally {
      window.clearInterval(ticker);
    }
  };

  if (busy) {
    return (
      <AppShell title="Preparing your lesson" subtitle="This takes a few seconds.">
        <div className="glass-card mx-auto max-w-lg p-8">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <ul className="mt-6 space-y-3">
            {PLANNING_STEPS.map((s, i) => (
              <li
                key={s}
                className={`text-sm ${i <= phase ? "text-foreground" : "text-muted-foreground/50"}`}
              >
                {i < phase ? "✓ " : i === phase ? "→ " : "· "}
                {s}
              </li>
            ))}
          </ul>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={search.revise ? "Revision session" : "Teach me a topic"}
      subtitle="Your teacher builds the whole lesson around these choices."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="glass-card p-6">
            <Label htmlFor="topic" className="text-base">
              What would you like to learn?
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Current Electricity"
              className="mt-3 h-12 text-base"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-lg font-semibold">How long do you have?</h2>
            <p className="text-sm text-muted-foreground">
              The lesson structure changes with your time — fewer minutes means only the concepts
              that matter most.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`rounded-xl border px-3 py-3 text-sm transition-colors ${
                    duration === d
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock className="mx-auto mb-1 size-4" />
                  {d} min
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card grid gap-5 p-6 sm:grid-cols-2">
            <Choice label="Language" value={language} onChange={setLanguage} options={[...LANGUAGES]} />
            <Choice label="Level" value={level} onChange={setLevel} options={[...KNOWLEDGE_LEVELS]} />
            <Choice label="Goal" value={goal} onChange={setGoal} options={[...LEARNING_GOALS]} />
            <Choice
              label="Teaching style"
              value={style}
              onChange={setStyle}
              options={[...TEACHING_STYLES]}
            />
          </section>
        </div>

        <div className="space-y-5">
          <section className="glass-card p-6">
            <h2 className="font-display text-lg font-semibold">Lesson summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Topic" value={topic || "—"} />
              <Row label="Source" value="Topic-based" />
              <Row label="Level" value={level} />
              <Row label="Language" value={language} />
              <Row label="Goal" value={goal} />
              <Row label="Style" value={style} />
              <Row label="Time" value={`${duration} minutes`} />
            </dl>
            <Button className="mt-5 w-full" onClick={() => void start(false)}>
              <Sparkles className="mr-2 size-4" /> Start lesson
            </Button>
          </section>

          <section className="glass-card border-accent/30 p-6">
            <p className="text-xs uppercase tracking-wider text-accent">Demo Mode</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A fully scripted Current Electricity lesson in Hinglish that shows the whole loop —
              including a wrong answer, a detected misunderstanding and the teacher adapting.
            </p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => void start(true)}>
              <PlayCircle className="mr-2 size-4" /> Try demo lesson
            </Button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              value === o
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right">{value}</dd>
    </div>
  );
}
