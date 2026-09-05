import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, GraduationCap, Sparkles, Target, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your learning dashboard — SHREAI" },
      {
        name: "description",
        content:
          "Resume your lesson, see your strong and weak concepts, and get the next topic your AI teacher recommends.",
      },
      { property: "og:title", content: "Your learning dashboard — SHREAI" },
      {
        property: "og:description",
        content: "Resume lessons, track mastery and see what to learn next.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();

  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [lessons, mastery, assessments] = await Promise.all([
        supabase
          .from("lessons")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.from("concept_mastery").select("*").order("mastery", { ascending: false }),
        supabase.from("assessments").select("*").order("created_at", { ascending: false }),
      ]);
      return {
        lessons: lessons.data ?? [],
        mastery: mastery.data ?? [],
        assessments: assessments.data ?? [],
      };
    },
  });

  const lessons = data?.lessons ?? [];
  const mastery = data?.mastery ?? [];
  const assessments = data?.assessments ?? [];

  const active = lessons.find((l) => l.status === "in_progress");
  const completed = lessons.filter((l) => l.status === "completed").length;
  const avgScore = assessments.length
    ? Math.round(
        assessments.reduce((sum, a) => sum + (a.score ?? 0), 0) / assessments.length,
      )
    : 0;
  const strong = mastery.filter((m) => Number(m.mastery) >= 0.7).slice(0, 4);
  const weak = mastery.filter((m) => Number(m.mastery) < 0.6).slice(0, 4);
  const latest = assessments[0];

  return (
    <AppShell
      title={`Welcome back${profile?.display_name ? `, ${profile.display_name}` : ""} 👋`}
      subtitle="Ready to learn?"
      action={
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/learn">
              <Sparkles className="mr-2 size-4" /> Teach me a topic
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {active ? (
            <section className="glass-card p-6">
              <p className="text-xs uppercase tracking-wider text-primary">Continue learning</p>
              <h2 className="mt-2 font-display text-xl font-semibold">{active.title}</h2>
              <p className="text-sm text-muted-foreground">
                {active.topic} · {active.language} · {active.duration_minutes} min
              </p>
              <Progress value={active.progress ?? 0} className="mt-4" />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{active.progress ?? 0}% complete</span>
                <Button asChild size="sm">
                  <Link to="/lesson/$lessonId" params={{ lessonId: active.id }}>
                    Resume <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </section>
          ) : (
            <section className="glass-card p-6">
              <h2 className="font-display text-xl font-semibold">Start your first lesson</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell your teacher a topic and how long you have. Everything else is planned for you.
              </p>
              <Button asChild className="mt-4">
                <Link to="/learn">Teach me a topic</Link>
              </Button>
            </section>
          )}

          <div className="grid gap-4 sm:grid-cols-4">
            <Stat icon={GraduationCap} label="Lessons completed" value={String(completed)} />
            <Stat icon={Target} label="Topics studied" value={String(new Set(lessons.map((l) => l.topic)).size)} />
            <Stat icon={TrendingUp} label="Average score" value={`${avgScore}%`} />
            <Stat icon={Flame} label="Day streak" value={String(profile?.streak ?? 0)} />
          </div>

          <section className="glass-card p-6">
            <h2 className="font-display text-lg font-semibold">Recent lessons</h2>
            {lessons.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nothing here yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {lessons.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.topic} · {l.status === "completed" ? "Completed" : "In progress"}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        to={l.status === "completed" ? "/report/$lessonId" : "/lesson/$lessonId"}
                        params={{ lessonId: l.id }}
                      >
                        {l.status === "completed" ? "Report" : "Resume"}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="glass-card p-6">
            <h2 className="font-display text-lg font-semibold">Strong areas</h2>
            {strong.length ? (
              <ul className="mt-3 space-y-2">
                {strong.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <span>{m.concept}</span>
                    <span className="text-success">{Math.round(Number(m.mastery) * 100)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Finish a lesson and your strengths will appear here.
              </p>
            )}
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-lg font-semibold">Needs work</h2>
            {weak.length ? (
              <ul className="mt-3 space-y-2">
                {weak.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <span>{m.concept}</span>
                    <span className="text-warning">{Math.round(Number(m.mastery) * 100)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No weak areas detected yet.</p>
            )}
            {weak.length ? (
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link to="/revision">Start revision</Link>
              </Button>
            ) : null}
          </section>

          <section className="glass-card border-primary/30 p-6">
            <p className="text-xs uppercase tracking-wider text-primary">Recommended next</p>
            <p className="mt-2 text-sm leading-relaxed">
              {latest?.recommendation ??
                "Pick any topic to begin — your teacher will build the path from your first lesson."}
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/learn">Start it</Link>
            </Button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
