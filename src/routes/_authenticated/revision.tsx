import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress as Bar } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/revision")({
  head: () => ({
    meta: [
      { title: "Revision — fix your weak concepts | SHREAI" },
      {
        name: "description",
        content:
          "SHREAI tracks the concepts you got wrong and rebuilds short lessons around exactly those gaps.",
      },
      { property: "og:title", content: "Revision — fix your weak concepts" },
      {
        property: "og:description",
        content: "Short, targeted lessons built around the concepts you got wrong.",
      },
    ],
  }),
  component: Revision,
});

function Revision() {
  const { user } = useAuth();

  const { data: weak } = useQuery({
    queryKey: ["revision", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("concept_mastery")
        .select("*")
        .lt("mastery", 0.7)
        .order("mastery", { ascending: true });
      return data ?? [];
    },
  });

  const items = weak ?? [];

  return (
    <AppShell title="Revision" subtitle="Your teacher re-teaches only what didn't stick.">
      {items.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <RefreshCw className="mx-auto size-6 text-primary" />
          <h2 className="mt-4 font-display text-xl font-semibold">Nothing to revise yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Once a lesson finds a gap, it shows up here as a short targeted session.
          </p>
          <Button asChild className="mt-5">
            <Link to="/learn">Start a lesson</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((m) => (
            <section key={m.id} className="glass-card p-6">
              <p className="text-xs uppercase tracking-wider text-warning">Needs work</p>
              <h2 className="mt-2 font-display text-lg font-semibold">{m.concept}</h2>
              {m.topic ? <p className="text-sm text-muted-foreground">from {m.topic}</p> : null}
              <Bar value={Number(m.mastery) * 100} className="mt-4" />
              <p className="mt-2 text-xs text-muted-foreground">
                {Math.round(Number(m.mastery) * 100)}% mastery
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link to="/learn" search={{ topic: m.concept, revise: true }}>
                  Revise this
                </Link>
              </Button>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
