import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress as Bar } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Your progress and mastery — SHREAI" },
      {
        name: "description",
        content:
          "Track scores over time, see mastery per concept and watch weak areas turn into strong ones.",
      },
      { property: "og:title", content: "Your progress and mastery — SHREAI" },
      {
        property: "og:description",
        content: "Scores over time and mastery for every concept you've studied.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [assessments, mastery] = await Promise.all([
        supabase.from("assessments").select("*").order("created_at", { ascending: true }),
        supabase.from("concept_mastery").select("*").order("mastery", { ascending: false }),
      ]);
      return { assessments: assessments.data ?? [], mastery: mastery.data ?? [] };
    },
  });

  const assessments = data?.assessments ?? [];
  const mastery = data?.mastery ?? [];
  const max = 100;

  return (
    <AppShell
      title="Your progress"
      subtitle="Every lesson moves these numbers."
      action={
        <Button asChild>
          <Link to="/learn">
            <Sparkles className="mr-2 size-4" /> New lesson
          </Link>
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold">Scores over time</h2>
          {assessments.length ? (
            <div className="mt-6 flex h-48 items-end gap-2">
              {assessments.slice(-14).map((a) => (
                <div key={a.id} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-primary/70"
                    style={{ height: `${Math.max(4, ((a.score ?? 0) / max) * 100)}%` }}
                    title={`${a.topic}: ${a.score}%`}
                  />
                  <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                    {a.score}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Finish a lesson to see your first score here.
            </p>
          )}
        </section>

        <section className="glass-card p-6">
          <h2 className="font-display text-lg font-semibold">Mastery by concept</h2>
          {mastery.length ? (
            <ul className="mt-4 space-y-4">
              {mastery.map((m) => (
                <li key={m.id}>
                  <div className="flex justify-between text-sm">
                    <span>{m.concept}</span>
                    <span className="text-muted-foreground">
                      {Math.round(Number(m.mastery) * 100)}%
                    </span>
                  </div>
                  <Bar value={Number(m.mastery) * 100} className="mt-2" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No concepts tracked yet.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
