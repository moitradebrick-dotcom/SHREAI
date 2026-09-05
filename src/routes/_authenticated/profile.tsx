import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your learning profile — SHREAI" },
      {
        name: "description",
        content:
          "Change your language, level, goal and teaching style. Every future lesson adapts to these settings.",
      },
      { property: "og:title", content: "Your learning profile — SHREAI" },
      {
        property: "og:description",
        content: "Update your language, level, goal and teaching style at any time.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [form, setForm] = useState({
    display_name: profile?.display_name ?? "",
    education_level: profile?.education_level ?? EDUCATION_LEVELS[0],
    knowledge_level: profile?.knowledge_level ?? KNOWLEDGE_LEVELS[0],
    preferred_language: profile?.preferred_language ?? "English",
    learning_goal: profile?.learning_goal ?? LEARNING_GOALS[0],
    teaching_style: profile?.teaching_style ?? TEACHING_STYLES[0],
    lesson_depth: profile?.lesson_depth ?? "Standard",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save your changes.");
      return;
    }
    await refreshProfile();
    toast.success("Saved. Your next lesson uses these settings.");
  };

  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });

  return (
    <AppShell title="Your profile" subtitle="Your teacher adapts to everything here.">
      <div className="max-w-3xl space-y-5">
        <section className="glass-card p-6">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            className="mt-2 max-w-sm"
            value={form.display_name}
            onChange={(e) => set("display_name")(e.target.value)}
          />
          <p className="mt-3 text-sm text-muted-foreground">Signed in as {user?.email}</p>
        </section>

        <section className="glass-card space-y-5 p-6">
          <Choice label="Education level" value={form.education_level} onChange={set("education_level")} options={[...EDUCATION_LEVELS]} />
          <Choice label="Knowledge level" value={form.knowledge_level} onChange={set("knowledge_level")} options={[...KNOWLEDGE_LEVELS]} />
          <Choice label="Teaching language" value={form.preferred_language} onChange={set("preferred_language")} options={[...LANGUAGES]} />
          <Choice label="Learning goal" value={form.learning_goal} onChange={set("learning_goal")} options={[...LEARNING_GOALS]} />
          <Choice label="Teaching style" value={form.teaching_style} onChange={set("teaching_style")} options={[...TEACHING_STYLES]} />
          <Choice label="Lesson depth" value={form.lesson_depth} onChange={set("lesson_depth")} options={[...LESSON_DEPTHS]} />
        </section>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
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
