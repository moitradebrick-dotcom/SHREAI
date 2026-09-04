import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  EDUCATION_LEVELS,
  KNOWLEDGE_LEVELS,
  LANGUAGES,
  LEARNING_GOALS,
  LESSON_DEPTHS,
  TEACHING_STYLES,
} from "@/lib/teachai/types";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Personalize your AI teacher — TeachAI" },
      {
        name: "description",
        content:
          "Tell TeachAI your level, language, goal and preferred teaching style so every lesson is built for you.",
      },
      { property: "og:title", content: "Personalize your AI teacher" },
      {
        property: "og:description",
        content: "Set your level, language, goal and teaching style in under a minute.",
      },
    ],
  }),
  component: Onboarding,
});

const STEPS = [
  { key: "education_level", question: "Where are you studying right now?", options: EDUCATION_LEVELS },
  { key: "knowledge_level", question: "How much do you already know?", options: KNOWLEDGE_LEVELS },
  { key: "preferred_language", question: "Which language should your teacher use?", options: LANGUAGES },
  { key: "learning_goal", question: "What are you learning for?", options: LEARNING_GOALS },
  { key: "teaching_style", question: "How do you like to be taught?", options: TEACHING_STYLES },
  { key: "lesson_depth", question: "How deep should lessons go by default?", options: LESSON_DEPTHS },
] as const;

function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const step = STEPS[index];
  const selected = answers[step.key];

  const finish = async (final: Record<string, string>) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name:
        profile?.display_name ??
        (user.user_metadata?.["display_name"] as string | undefined) ??
        user.email?.split("@")[0] ??
        "Student",
      onboarded: true,
      ...final,
    });
    setSaving(false);
    if (error) {
      toast.error("Couldn't save your preferences. Try again.");
      return;
    }
    await refreshProfile();
    void navigate({ to: "/dashboard" });
  };

  const next = () => {
    if (!selected) return;
    if (index === STEPS.length - 1) {
      void finish(answers);
      return;
    }
    setIndex(index + 1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-10">
      <div className="w-full max-w-2xl">
        <p className="text-center text-sm text-primary">Let's personalize your teacher</p>
        <h1 className="mt-2 text-center font-display text-3xl font-semibold">{step.question}</h1>

        <div className="mx-auto mt-6 flex max-w-sm gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="glass-card mt-8 grid gap-3 p-6 sm:grid-cols-2">
          {step.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setAnswers({ ...answers, [step.key]: option })}
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition-colors ${
                selected === option
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {option}
              {selected === option ? <Check className="size-4 text-primary" /> : null}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
          >
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>
          <Button onClick={next} disabled={!selected || saving}>
            {index === STEPS.length - 1 ? (saving ? "Saving…" : "Meet your teacher") : "Continue"}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
