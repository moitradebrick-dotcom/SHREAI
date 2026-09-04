import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Loader2,
  MessageCircleQuestion,
  Pause,
  Play,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { TeacherAvatar } from "@/components/teacher/TeacherAvatar";
import { VisualPanel } from "@/components/teacher/VisualPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherVoice } from "@/hooks/useTeacherVoice";
import { supabase } from "@/integrations/supabase/client";
import {
  askTeacher,
  buildAssessment,
  evaluateAnswer,
  gradeAssessment,
} from "@/lib/teachai/agents.functions";
import type {
  AnswerEvaluation,
  LessonPlan,
  LessonStep,
  TeachingQuestion,
} from "@/lib/teachai/types";

export const Route = createFileRoute("/_authenticated/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "Teacher Room — live AI lesson | TeachAI" },
      {
        name: "description",
        content:
          "Your AI teacher explains, checks your understanding, spots misunderstandings and re-teaches until the concept clicks.",
      },
      { property: "og:title", content: "Teacher Room — live AI lesson" },
      {
        property: "og:description",
        content: "An AI teacher that explains, questions and adapts in real time.",
      },
    ],
  }),
  component: TeacherRoom,
});

type Phase = "teaching" | "assessment" | "grading";

function TeacherRoom() {
  const { lessonId } = Route.useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const plan = lesson?.plan as unknown as LessonPlan | undefined;
  const demo = Boolean(lesson?.demo_mode);
  const language = lesson?.language ?? profile?.preferred_language ?? "English";
  const level = lesson?.difficulty ?? profile?.knowledge_level ?? "Beginner";

  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("teaching");
  const [voiceOn, setVoiceOn] = useState(true);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [checking, setChecking] = useState(false);
  const [streak, setStreak] = useState(0);
  const [askOpen, setAskOpen] = useState(false);
  const [askText, setAskText] = useState("");
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [performance, setPerformance] = useState<string[]>([]);

  const [questions, setQuestions] = useState<TeachingQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessAnswer, setAssessAnswer] = useState("");

  const { speak, stop, speaking } = useTeacherVoice(language, voiceOn);
  const runEvaluate = useServerFn(evaluateAnswer);
  const runAsk = useServerFn(askTeacher);
  const runBuildAssessment = useServerFn(buildAssessment);
  const runGrade = useServerFn(gradeAssessment);
  const initialised = useRef(false);

  useEffect(() => {
    if (!plan || initialised.current) return;
    initialised.current = true;
    setSteps(plan.steps);
    setIndex(Math.min(lesson?.step_index ?? 0, plan.steps.length - 1));
  }, [plan, lesson?.step_index]);

  const step = steps[index];

  useEffect(() => {
    if (phase !== "teaching" || !step) return;
    void speak(step.teacher_script);
    setAnswer("");
    setEvaluation(null);
    setAskAnswer(null);
  }, [step, phase, speak]);

  const saveProgress = useCallback(
    async (nextIndex: number, total: number, status?: string) => {
      await supabase
        .from("lessons")
        .update({
          step_index: nextIndex,
          progress: Math.round((nextIndex / Math.max(1, total)) * 100),
          ...(status ? { status } : {}),
        })
        .eq("id", lessonId);
    },
    [lessonId],
  );

  const startAssessment = useCallback(async () => {
    if (!plan) return;
    stop();
    setPhase("grading");
    const result = await runBuildAssessment({
      data: {
        topic: lesson?.topic ?? plan.title,
        language,
        level,
        duration: lesson?.duration_minutes ?? 10,
        conceptsTaught: plan.concepts?.map((c) => c.name) ?? [],
        performance: performance.join(" | "),
        demo,
      },
    });
    setQuestions(result.questions);
    setQIndex(0);
    setAnswers({});
    setAssessAnswer("");
    setPhase("assessment");
  }, [plan, lesson, language, level, performance, demo, runBuildAssessment, stop]);

  const advance = useCallback(() => {
    stop();
    if (index + 1 >= steps.length) {
      void saveProgress(steps.length, steps.length);
      void startAssessment();
      return;
    }
    const next = index + 1;
    setIndex(next);
    void saveProgress(next, steps.length);
  }, [index, steps.length, saveProgress, startAssessment, stop]);

  const submitAnswer = async () => {
    if (!step?.question || !answer.trim()) return;
    setChecking(true);
    stop();
    try {
      const result = await runEvaluate({
        data: {
          question: step.question,
          answer: answer.trim(),
          conceptName: step.concept_name ?? step.concept_id,
          language,
          level,
          streakCorrect: streak,
          demo,
        },
      });
      setEvaluation(result);
      setStreak(result.correct ? streak + 1 : 0);
      setPerformance([
        ...performance,
        `${step.concept_name ?? step.concept_id}: ${result.correct ? "correct" : result.partial ? "partial" : "incorrect"}${result.misconception ? ` (${result.misconception})` : ""}`,
      ]);
      void speak(result.feedback);

      if (user) {
        void supabase.from("lesson_events").insert({
          user_id: user.id,
          lesson_id: lessonId,
          concept: step.concept_name ?? step.concept_id,
          event_type: "answer",
          payload: {
            question: step.question.question,
            answer: answer.trim(),
            correct: result.correct,
            misconception: result.misconception ?? null,
          } as unknown as never,
        });
      }

      if (result.adaptive_step && !result.correct) {
        const inserted = [...steps];
        inserted.splice(index + 1, 0, result.adaptive_step);
        setSteps(inserted);
      }
    } catch {
      toast.error("Couldn't check that answer. Try again.");
    } finally {
      setChecking(false);
    }
  };

  const ask = async () => {
    if (!askText.trim() || !step) return;
    setAsking(true);
    stop();
    try {
      const result = await runAsk({
        data: {
          question: askText.trim(),
          topic: lesson?.topic ?? "",
          concept: step.concept_name ?? step.concept_id,
          script: step.teacher_script,
          language,
          level,
        },
      });
      setAskAnswer(result.answer);
      setAskText("");
      void speak(result.answer);
    } finally {
      setAsking(false);
    }
  };

  const submitAssessment = async (finalAnswers: Record<string, string>) => {
    if (!user || !plan) return;
    setPhase("grading");
    try {
      const graded = await runGrade({
        data: {
          topic: lesson?.topic ?? plan.title,
          language,
          questions,
          answers: finalAnswers,
          demo,
        },
      });

      await supabase.from("assessments").insert({
        user_id: user.id,
        lesson_id: lessonId,
        topic: lesson?.topic ?? plan.title,
        score: graded.score,
        total_questions: questions.length,
        strong_areas: graded.strong_areas ?? [],
        weak_areas: graded.weak_areas ?? [],
        misconceptions: graded.misconceptions ?? [],
        recommendation: graded.recommendation ?? null,
        results: graded as unknown as never,
      });

      const masteryRows = [
        ...(graded.strong_areas ?? []).map((c) => ({ concept: c, mastery: 0.85 })),
        ...(graded.weak_areas ?? []).map((c) => ({ concept: c, mastery: 0.4 })),
      ];
      if (masteryRows.length) {
        await supabase.from("concept_mastery").upsert(
          masteryRows.map((r) => ({
            user_id: user.id,
            concept: r.concept,
            mastery: r.mastery,
            topic: lesson?.topic ?? plan.title,
          })),
          { onConflict: "user_id,concept" },
        );
      }

      await supabase
        .from("lessons")
        .update({ status: "completed", progress: 100 })
        .eq("id", lessonId);

      void navigate({ to: "/report/$lessonId", params: { lessonId } });
    } catch {
      toast.error("Couldn't save your results. Try submitting again.");
      setPhase("assessment");
    }
  };

  const progressValue = useMemo(
    () => (steps.length ? Math.round(((index + 1) / steps.length) * 100) : 0),
    [index, steps.length],
  );

  if (isLoading || !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (phase === "grading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hero">
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Your teacher is preparing your questions…</p>
      </div>
    );
  }

  if (phase === "assessment") {
    const q = questions[qIndex];
    if (!q) return null;
    return (
      <div className="min-h-screen bg-hero px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-primary">Quick check · {lesson?.topic}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">
            Question {qIndex + 1} of {questions.length}
          </h1>
          <Progress value={((qIndex + 1) / questions.length) * 100} className="mt-4" />

          <div className="glass-card mt-6 p-6">
            <p className="text-lg">{q.question}</p>
            {q.options?.length ? (
              <div className="mt-5 space-y-2">
                {q.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setAssessAnswer(o)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      assessAnswer === o
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            ) : (
              <Input
                value={assessAnswer}
                onChange={(e) => setAssessAnswer(e.target.value)}
                placeholder="Type your answer"
                className="mt-5 h-12"
              />
            )}

            <Button
              className="mt-6 w-full"
              disabled={!assessAnswer.trim()}
              onClick={() => {
                const updated = { ...answers, [q.id]: assessAnswer.trim() };
                setAnswers(updated);
                setAssessAnswer("");
                if (qIndex + 1 >= questions.length) {
                  void submitAssessment(updated);
                } else {
                  setQIndex(qIndex + 1);
                }
              }}
            >
              {qIndex + 1 >= questions.length ? "Finish and see my report" : "Next question"}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{plan.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {step?.concept_name ?? step?.concept_id} · Step {index + 1} of {steps.length}
              {demo ? " · Demo Mode" : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={voiceOn ? "Turn voice off" : "Turn voice on"}
            onClick={() => {
              if (voiceOn) stop();
              setVoiceOn(!voiceOn);
            }}
          >
            {voiceOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={speaking ? "Pause narration" : "Replay narration"}
            onClick={() => (speaking ? stop() : step && void speak(step.teacher_script))}
          >
            {speaking ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
        </div>
        <Progress value={progressValue} className="h-1 rounded-none" />
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <TeacherAvatar
            speaking={speaking}
            status={speaking ? "Teaching" : evaluation ? "Waiting for you" : "Ready"}
            language={language}
            voiceOn={voiceOn}
          />

          <section className="glass-card max-h-[320px] overflow-y-auto p-5">
            <p className="text-xs uppercase tracking-wider text-primary">What your teacher says</p>
            <p className="mt-3 text-sm leading-relaxed">{step?.teacher_script}</p>
            {evaluation ? (
              <div
                className={`mt-4 rounded-xl border p-3 text-sm ${
                  evaluation.correct
                    ? "border-success/40 bg-success/10"
                    : "border-warning/40 bg-warning/10"
                }`}
              >
                {evaluation.feedback}
              </div>
            ) : null}
            {askAnswer ? (
              <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                {askAnswer}
              </div>
            ) : null}
          </section>

          <div className="glass-card p-5">
            <button
              type="button"
              className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setAskOpen(!askOpen)}
            >
              <MessageCircleQuestion className="size-4 text-primary" />
              Ask your teacher something
            </button>
            {askOpen ? (
              <div className="mt-3 flex gap-2">
                <Input
                  value={askText}
                  onChange={(e) => setAskText(e.target.value)}
                  placeholder="Wait, why does that happen?"
                  onKeyDown={(e) => e.key === "Enter" && void ask()}
                />
                <Button size="icon" onClick={() => void ask()} disabled={asking} aria-label="Send question">
                  {asking ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <VisualPanel visual={step?.visual ?? null} />

          {step?.question ? (
            <section className="glass-card p-6">
              <p className="text-xs uppercase tracking-wider text-accent">Your turn</p>
              <p className="mt-2 text-lg">{step.question.question}</p>

              {step.question.options?.length ? (
                <div className="mt-4 space-y-2">
                  {step.question.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      disabled={!!evaluation}
                      onClick={() => setAnswer(o)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:opacity-70 ${
                        answer === o
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              ) : (
                <Input
                  value={answer}
                  disabled={!!evaluation}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer"
                  className="mt-4 h-12"
                />
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {!evaluation ? (
                  <Button onClick={() => void submitAnswer()} disabled={checking || !answer.trim()}>
                    {checking ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Check my answer
                  </Button>
                ) : (
                  <Button onClick={advance}>
                    {index + 1 >= steps.length ? "Finish lesson" : "Continue"}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                )}
                {step.question.hint && !evaluation ? (
                  <Button
                    variant="ghost"
                    onClick={() => toast.message("Hint", { description: step.question?.hint })}
                  >
                    I need a hint
                  </Button>
                ) : null}
              </div>
            </section>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button onClick={advance}>
                {index + 1 >= steps.length ? "Finish lesson" : "Continue"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button variant="ghost" onClick={() => step && void speak(step.teacher_script)}>
                Say that again
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
