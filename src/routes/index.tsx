import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  GraduationCap,
  Languages,
  LineChart,
  MessagesSquare,
  Mic,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SHREAI — an AI teacher that actually teaches you" },
      {
        name: "description",
        content:
          "SHREAI explains any topic out loud, checks your understanding, spots what you misunderstood and re-teaches until it clicks. In your language, at your level.",
      },
      { property: "og:title", content: "SHREAI — an AI teacher that actually teaches you" },
      {
        property: "og:description",
        content:
          "Live spoken lessons that adapt in real time: explain, question, detect the gap, re-teach, assess.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Mic,
    title: "It speaks, not scrolls",
    body: "Lessons are taught out loud with captions and a visual board — not a wall of text you skim.",
  },
  {
    icon: Brain,
    title: "It notices what you missed",
    body: "Wrong answers are diagnosed, not just marked. The teacher names the misunderstanding and fixes it.",
  },
  {
    icon: Sparkles,
    title: "It re-teaches on the spot",
    body: "A fresh analogy, a simpler example, an easier question — the lesson bends around you mid-flow.",
  },
  {
    icon: Languages,
    title: "In your language",
    body: "English, Hindi, Hinglish, Bengali, Tamil, Telugu or Marathi — switch whenever you like.",
  },
  {
    icon: MessagesSquare,
    title: "Interrupt any time",
    body: "Ask a follow-up mid-lesson. Your teacher answers, then picks up exactly where it left off.",
  },
  {
    icon: LineChart,
    title: "Proof you improved",
    body: "Every lesson ends with a score, your strong and weak concepts, and what to learn next.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">SHREAI</span>
        </span>
        <Link
          to="/auth"
          className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          Sign in
        </Link>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-4 pb-16 pt-14 text-center md:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="size-3.5" /> Not a chatbot. A teacher.
          </p>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight md:text-6xl">
            SHREAI
            <span className="mt-2 block text-2xl text-muted-foreground md:text-3xl">
              NOT A CHATBOT. A TEACHER.
            </span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            An AI teacher that understands your level, teaches visually, checks your
            understanding, detects misconceptions, and adapts.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              Start Learning
            </Link>
            <Link
              to="/teacher-room"
              className="rounded-full border border-accent/50 bg-accent/10 px-6 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
            >
              Experience Demo — no account
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="glass-card overflow-hidden p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Inside the Teacher Room
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_180px]">
              <div className="rounded-xl border border-border bg-surface p-4 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <GraduationCap className="size-6" />
                </span>
                <p className="mt-3 text-sm font-medium">SHREAI Teacher</p>
                <p className="text-xs text-primary">Speaking</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-6 text-center">
                <p className="font-display text-3xl font-semibold text-primary">V = I × R</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  “If voltage stays constant and resistance increases, what happens to current?”
                </p>
                <p className="mt-3 inline-block rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs text-destructive">
                  Misconception detected → teaching method changed
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4 text-left text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Your progress</p>
                <p className="mt-2">✓ Current — 92%</p>
                <p>✓ Voltage — 86%</p>
                <p>⚠ Resistance — 63%</p>
                <p>● Ohm's Law — 61%</p>
              </div>
            </div>
          </div>
        </section>


        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="glass-card p-6">
                <f.icon className="size-5 text-primary" />
                <h2 className="mt-4 font-display text-lg font-semibold">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="text-center font-display text-3xl font-semibold">How SHREAI teaches</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Understands you",
              "Plans your lesson",
              "Teaches visually",
              "Checks understanding",
              "Detects misconceptions",
              "Adapts",
              "Re-teaches",
              "Tracks mastery",
            ].map((label, i) => (
              <article key={label} className="glass-card flex items-center gap-3 p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-sm text-accent">
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <h2 className="text-center font-display text-3xl font-semibold">
            Why this isn't a chatbot
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <article className="glass-card p-6">
              <h3 className="font-display text-base font-semibold">Traditional learning</h3>
              <p className="mt-3 text-sm text-muted-foreground">Content → Student</p>
            </article>
            <article className="glass-card p-6">
              <h3 className="font-display text-base font-semibold">A chatbot</h3>
              <p className="mt-3 text-sm text-muted-foreground">Question → Answer</p>
            </article>
            <article className="glass-card border-primary/50 p-6 shadow-glow">
              <h3 className="font-display text-base font-semibold text-primary">SHREAI</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Student → Understand → Teach → Check → Adapt → Re-teach → Master
              </p>
            </article>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link
              to="/teacher-room"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              Try SHREAI Demo
            </Link>
            <Link
              to="/auth"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-primary/50"
            >
              Teach me my own topic
            </Link>
          </div>
        </section>

      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        SHREAI — not a chatbot. A teacher.
      </footer>
    </div>
  );
}
