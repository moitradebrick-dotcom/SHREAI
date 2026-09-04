import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/report/$lessonId")({
  head: () => ({
    meta: [
      { title: "Your lesson report — TeachAI" },
      {
        name: "description",
        content:
          "See your score, the concepts you mastered, what still needs work and exactly what to learn next.",
      },
      { property: "og:title", content: "Your lesson report — TeachAI" },
      {
        property: "og:description",
        content: "Score, strong areas, weak areas and your recommended next lesson.",
      },
    ],
  }),
  component: Report,
});

function Report() {
  const { lessonId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["report", lessonId],
    queryFn: async () => {
      const [lesson, assessment] = await Promise.all([
        supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle(),
        supabase
          .from("assessments")
          .select("*")
          .eq("lesson_id", lessonId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      return { lesson: lesson.data, assessment: assessment.data };
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const lesson = data?.lesson;
  const a = data?.assessment;
  const score = a?.score ?? 0;
  const strong = (a?.strong_areas as string[] | null) ?? [];
  const resultItems = (a?.results as { correct?: boolean }[] | null) ?? [];
  const correctCount = Array.isArray(resultItems)
    ? resultItems.filter((r) => r?.correct).length
    : 0;
  const weak = (a?.weak_areas as string[] | null) ?? [];

  return (
    <AppShell
      title="Lesson report"
      subtitle={lesson?.title ?? ""}
      action={
        <Button asChild>
          <Link to="/learn">
            <Sparkles className="mr-2 size-4" /> Next lesson
          </Link>
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="glass-card p-6 text-center lg:col-span-1">
          <p className="text-xs uppercase tracking-wider text-primary">Your score</p>
          <p className="mt-4 font-display text-6xl font-semibold">{score}%</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {correctCount} of {a?.total_questions ?? 0} answered correctly
          </p>
          <Progress value={score} className="mt-5" />
          <p className="mt-5 text-sm">
            {score >= 80
              ? "Strong understanding — you're ready to go deeper."
              : score >= 50
                ? "Good progress. A short revision will lock this in."
                : "Worth revisiting — your teacher will take it slower next time."}
          </p>
        </section>

        <div className="space-y-5 lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <section className="glass-card p-6">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="size-4" />
                <h2 className="font-display text-lg font-semibold">You understood well</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {strong.length ? (
                  strong.map((s) => <li key={s}>· {s}</li>)
                ) : (
                  <li className="text-muted-foreground">Nothing recorded here.</li>
                )}
              </ul>
            </section>

            <section className="glass-card p-6">
              <div className="flex items-center gap-2 text-warning">
                <TriangleAlert className="size-4" />
                <h2 className="font-display text-lg font-semibold">Needs revision</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {weak.length ? (
                  weak.map((s) => <li key={s}>· {s}</li>)
                ) : (
                  <li className="text-muted-foreground">No weak areas — nicely done.</li>
                )}
              </ul>
            </section>
          </div>

          <section className="glass-card border-primary/30 p-6">
            <p className="text-xs uppercase tracking-wider text-primary">What to do next</p>
            <p className="mt-2 text-sm leading-relaxed">
              {a?.recommendation ?? "Keep going with the next topic in this subject."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/learn" search={lesson?.topic ? { topic: lesson.topic } : {}}>
                  Continue this topic
                </Link>
              </Button>
              {weak.length ? (
                <Button asChild variant="outline">
                  <Link to="/revision">
                    <RefreshCw className="mr-2 size-4" /> Revise weak areas
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="ghost">
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
