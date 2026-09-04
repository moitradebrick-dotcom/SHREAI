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
      { title: "TeachAI — an AI teacher that actually teaches you" },
      {
        name: "description",
        content:
          "TeachAI explains any topic out loud, checks your understanding, spots what you misunderstood and re-teaches until it clicks. In your language, at your level.",
      },
      { property: "og:title", content: "TeachAI — an AI teacher that actually teaches you" },
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

const STEPS = [
  { n: "1", t: "Tell it a topic", d: "Plus how many minutes you have and how you like to be taught." },
  { n: "2", t: "Get taught", d: "Explanation, visuals, and questions that check you really followed." },
  { n: "3", t: "Get adapted to", d: "Miss something and the teacher changes approach instead of moving on." },
  { n: "4", t: "See where you stand", d: "A short assessment and a report with your next step." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">TeachAI</span>
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
            An AI that teaches you like the best teacher you ever had
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            It explains out loud, stops to check if you followed, works out exactly what you
            misunderstood — then teaches it again a different way.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              Start learning free
            </Link>
            <Link
              to="/auth"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-primary/50"
            >
              Watch the demo lesson
            </Link>
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

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <h2 className="text-center font-display text-3xl font-semibold">How a lesson runs</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {STEPS.map((s) => (
              <article key={s.n} className="glass-card p-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-accent/15 font-display text-accent">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/auth"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              Teach me something
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        TeachAI — learning that adapts to you.
      </footer>
    </div>
  );
}
