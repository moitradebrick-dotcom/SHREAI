import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to TeachAI — your personal AI teacher" },
      {
        name: "description",
        content:
          "Create your TeachAI account to get personalized lessons taught by an AI teacher that adapts to how you learn.",
      },
      { property: "og:title", content: "Sign in to TeachAI" },
      {
        property: "og:description",
        content: "Personalized lessons from an AI teacher that adapts to how you learn.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;
    void navigate({ to: profile?.onboarded ? "/dashboard" : "/onboarding" });
  }, [session, profile?.onboarded, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created. Let's personalize your teacher.");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Password reset link sent to your email.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in didn't work. Try email instead.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">TeachAI</span>
        </Link>

        <div className="glass-card p-7">
          <h1 className="font-display text-2xl font-semibold">
            {mode === "signup"
              ? "Create your account"
              : mode === "reset"
                ? "Reset your password"
                : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "reset"
              ? "We'll email you a link to set a new password."
              : "Your teacher remembers what you already know."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aisha"
                  required
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {mode !== "reset" ? (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : mode === "reset"
                    ? "Send reset link"
                    : "Sign in"}
            </Button>
          </form>

          {mode !== "reset" ? (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" className="w-full" onClick={google}>
                Continue with Google
              </Button>
            </>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
            <button
              type="button"
              className="hover:text-foreground"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? "I already have an account" : "Create an account"}
            </button>
            <button
              type="button"
              className="hover:text-foreground"
              onClick={() => setMode(mode === "reset" ? "signin" : "reset")}
            >
              {mode === "reset" ? "Back to sign in" : "Forgot password?"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
