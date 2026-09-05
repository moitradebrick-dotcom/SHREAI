import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  Captions,
  GraduationCap,
  Languages as LanguagesIcon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { DemoVisual, type DemoVisualKind } from "@/components/shreai/DemoVisual";
import { ProgressPanel } from "@/components/shreai/ProgressPanel";
import { QuestionCard } from "@/components/shreai/QuestionCard";
import { TeachingEnginePanel, type EngineState } from "@/components/shreai/TeachingEnginePanel";
import { TeacherAvatar } from "@/components/teacher/TeacherAvatar";
import { Button } from "@/components/ui/button";
import { useTeacherVoice } from "@/hooks/useTeacherVoice";
import {
  CONTROL_RESPONSES,
  CORRECT_LINE,
  DEMO_LANGUAGES,
  EASIER_QUESTION,
  FORMULA_CAPTION,
  HARDER_INTRO,
  HARDER_QUESTION,
  INITIAL_MASTERY,
  INTRO_SCRIPT,
  LESSON_TITLE,
  MAIN_QUESTION,
  MISCONCEPTION_LINE,
  QUICK_CHECK,
  RETEACH_FORMULA_CAPTION,
  RETEACH_SCRIPT,
  type Bilingual,
  type Lang,
} from "@/lib/shreai/demoScript";

export const Route = createFileRoute("/teacher-room")({
  head: () => ({
    meta: [
      { title: "SHREAI Teacher Room — a live adaptive lesson" },
      {
        name: "description",
        content:
          "Sit in a live SHREAI lesson on Ohm's Law: spoken teaching, visual board, understanding checks, misconception detection and on-the-spot re-teaching.",
      },
      { property: "og:title", content: "SHREAI Teacher Room — a live adaptive lesson" },
      {
        property: "og:description",
        content:
          "Watch SHREAI detect a misconception and change how it teaches, then assess and report on what you mastered.",
      },
    ],
  }),
  component: TeacherRoom,
});

type Stage = "intro" | "q1" | "reteach" | "q2" | "harder" | "quickcheck" | "report";

const FALLBACK_NOTE: Record<string, string> = {
  Hindi: "Hindi voice is coming soon — showing the English script for now.",
  Bengali: "Bengali is coming soon — showing the English script for now.",
  Tamil: "Tamil is coming soon — showing the English script for now.",
  Telugu: "Telugu is coming soon — showing the English script for now.",
  Marathi: "Marathi is coming soon — showing the English script for now.",
};

function TeacherRoom() {
  const [uiLanguage, setUiLanguage] = useState<string>("English");
  const language: Lang = uiLanguage === "Hinglish" ? "Hinglish" : "English";

  const [stage, setStage] = useState<Stage>("intro");
  const [line, setLine] = useState<Bilingual>(INTRO_SCRIPT);
  const [visual, setVisual] = useState<DemoVisualKind>("formula");
  const [caption, setCaption] = useState<Bilingual>(FORMULA_CAPTION);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);

  const [mainChoice, setMainChoice] = useState<number | null>(null);
  const [easyChoice, setEasyChoice] = useState<number | null>(null);
  const [hardChoice, setHardChoice] = useState<number | null>(null);
  const [qcIndex, setQcIndex] = useState(0);
  const [qcChoice, setQcChoice] = useState<number | null>(null);
  const [qcScore, setQcScore] = useState(0);
  const [misconceptionFound, setMisconceptionFound] = useState(false);

  const [mastery, setMastery] = useState(INITIAL_MASTERY);
  const [engine, setEngine] = useState<EngineState>({
    concept: "Ohm's Law",
    understanding: 61,
    issue: null,
    strategy: "Formula explanation",
    next: "Check understanding with a question",
  });

  const { speaking, speak, stop } = useTeacherVoice(language, voiceOn) as {
    speaking: boolean;
    speak: (text: string) => Promise<void> | void;
    stop: () => void;
  };

  const say = useCallback(
    (next: Bilingual) => {
      setLine(next);
      void speak(next[language]);
    },
    [language, speak],
  );

  useEffect(() => {
    void speak(line[language]);
    // Re-narrate whenever the language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const overall = Math.round(mastery.reduce((s, m) => s + m.value, 0) / mastery.length);

  const bump = (name: string, value: number) =>
    setMastery((prev) => prev.map((m) => (m.name === name ? { ...m, value } : m)));

  function answerMain(index: number) {
    setMainChoice(index);
    const correct = index === MAIN_QUESTION.correctIndex;
    if (correct) {
      bump("Ohm's Law", 78);
      setEngine((e) => ({
        ...e,
        understanding: 78,
        issue: null,
        strategy: "Formula explanation",
        next: "Move to a numerical application",
      }));
      say(CORRECT_LINE);
    } else {
      setMisconceptionFound(true);
      setEngine({
        concept: "Ohm's Law",
        understanding: 61,
        issue: "Inverse relationship confusion",
        strategy: "Visual + analogy",
        next: "Re-teach with a simpler example",
      });
      say(MISCONCEPTION_LINE);
    }
  }

  function startReteach() {
    setStage("reteach");
    setVisual("water");
    setCaption(RETEACH_FORMULA_CAPTION);
    say(RETEACH_SCRIPT);
  }

  function answerEasy(index: number) {
    setEasyChoice(index);
    if (index === EASIER_QUESTION.correctIndex) {
      bump("Ohm's Law", 79);
      bump("Resistance", 74);
      setEngine((e) => ({
        ...e,
        understanding: 79,
        issue: null,
        strategy: "Visual + analogy (working)",
        next: "Try a numerical question",
      }));
      say(CORRECT_LINE);
    } else {
      say({
        English: "Not quite — look at the pipes again. Narrower pipe, less flow.",
        Hinglish: "Thoda miss — pipes dobara dekho. Patli pipe, kam flow.",
      });
    }
  }

  function control(kind: keyof typeof CONTROL_RESPONSES | "visual" | "hinglish") {
    if (kind === "visual") {
      setVisual((v) => (v === "circuit" ? "water" : "circuit"));
      setCaption({
        English: "Same idea, drawn out: the pump pushes, the narrow part holds back.",
        Hinglish: "Wahi baat, drawing mein: pump push karta hai, patla hissa rokta hai.",
      });
      return;
    }
    if (kind === "hinglish") {
      setUiLanguage("Hinglish");
      return;
    }
    const response = CONTROL_RESPONSES[kind];
    if (response) say(response);
  }

  const quickQuestion = QUICK_CHECK[qcIndex]!;

  function answerQuick(index: number) {
    setQcChoice(index);
    if (index === quickQuestion.correctIndex) setQcScore((s) => s + 1);
  }

  function nextQuick() {
    if (qcIndex < QUICK_CHECK.length - 1) {
      setQcIndex((i) => i + 1);
      setQcChoice(null);
      return;
    }
    bump("Ohm's Law", 82);
    setStage("report");
    stop();
  }

  function restart() {
    stop();
    setStage("intro");
    setLine(INTRO_SCRIPT);
    setVisual("formula");
    setCaption(FORMULA_CAPTION);
    setMainChoice(null);
    setEasyChoice(null);
    setHardChoice(null);
    setQcIndex(0);
    setQcChoice(null);
    setQcScore(0);
    setMisconceptionFound(false);
    setMastery(INITIAL_MASTERY);
    setEngine({
      concept: "Ohm's Law",
      understanding: 61,
      issue: null,
      strategy: "Formula explanation",
      next: "Check understanding with a question",
    });
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">SHREAI</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Not a chatbot. A teacher.
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs">
            <LanguagesIcon className="size-3.5 text-primary" />
            <span className="sr-only">Teaching language</span>
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value)}
              className="bg-transparent text-xs outline-none"
            >
              {DEMO_LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-background">
                  {l}
                </option>
              ))}
            </select>
          </label>
          <Button variant="ghost" size="sm" onClick={restart}>
            <RotateCcw className="mr-2 size-4" /> Restart demo
          </Button>
        </div>
      </header>

      {FALLBACK_NOTE[uiLanguage] ? (
        <p className="border-b border-accent/30 bg-accent/10 px-4 py-2 text-center text-xs text-accent md:px-8">
          {FALLBACK_NOTE[uiLanguage]}
        </p>
      ) : null}

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-8 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        {/* LEFT — teacher */}
        <div className="space-y-4">
          <TeacherAvatar
            speaking={speaking}
            status={speaking ? "Speaking" : "Listening"}
            language={uiLanguage}
            voiceOn={voiceOn}
          />
          <div className="glass-card grid grid-cols-2 gap-2 p-4">
            <Button variant="outline" size="sm" onClick={() => (speaking ? stop() : say(line))}>
              {speaking ? <Pause className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
              {speaking ? "Pause" : "Play"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => say(line)}>
              <RotateCcw className="mr-2 size-4" /> Replay
            </Button>
            <Button variant="outline" size="sm" onClick={() => control("slower")}>
              Slower
            </Button>
            <Button
              variant={captionsOn ? "secondary" : "outline"}
              size="sm"
              onClick={() => setCaptionsOn((c) => !c)}
            >
              <Captions className="mr-2 size-4" /> Captions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="col-span-2 text-muted-foreground"
              onClick={() => {
                setVoiceOn((v) => !v);
                stop();
              }}
            >
              {voiceOn ? "Turn voice off" : "Turn voice on"}
            </Button>
          </div>
        </div>

        {/* CENTER — board */}
        <div className="space-y-4">
          <section className="glass-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {LESSON_TITLE} · Beginner · {uiLanguage}
            </p>
            {captionsOn ? (
              <p className="mt-2 font-display text-lg leading-relaxed">{line[language]}</p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Captions are off.</p>
            )}
          </section>

          {stage !== "report" ? (
            <DemoVisual kind={visual} caption={captionsOn ? caption[language] : undefined} />
          ) : null}

          {stage === "intro" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setStage("q1");
                  setVisual("circuit");
                  say({
                    English: "Here's a question to check you followed that.",
                    Hinglish: "Ek sawal, ye check karne ke liye ki samajh aaya ya nahi.",
                  });
                }}
              >
                I'm ready — check me <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          ) : null}

          {stage === "q1" ? (
            <>
              <QuestionCard
                question={MAIN_QUESTION}
                language={language}
                selected={mainChoice}
                revealed={mainChoice !== null}
                onSelect={answerMain}
              />
              {mainChoice !== null && misconceptionFound ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 glass-card border-destructive/50 p-5">
                  <p className="flex items-center gap-2 font-display text-sm font-semibold text-destructive">
                    <Brain className="size-4" /> SHREAI DETECTED A MISCONCEPTION
                  </p>
                  <p className="mt-2 text-sm">{MISCONCEPTION_LINE[language]}</p>
                  <Button className="mt-4" onClick={startReteach}>
                    Let's try this differently <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              ) : null}
              {mainChoice !== null && !misconceptionFound ? (
                <Button
                  onClick={() => {
                    setStage("harder");
                    setVisual("inverse");
                    say(HARDER_INTRO);
                  }}
                >
                  Continue <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : null}
            </>
          ) : null}

          {stage === "reteach" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setVisual("inverse");
                  setCaption(RETEACH_FORMULA_CAPTION);
                }}
              >
                Show me the formula again
              </Button>
              <Button
                onClick={() => {
                  setStage("q2");
                  say({
                    English: "Now the same idea, one step simpler.",
                    Hinglish: "Ab wahi baat, ek step aur simple.",
                  });
                }}
              >
                Ask me again <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          ) : null}

          {stage === "q2" ? (
            <>
              <QuestionCard
                question={EASIER_QUESTION}
                language={language}
                selected={easyChoice}
                revealed={easyChoice !== null}
                onSelect={answerEasy}
              />
              {easyChoice === EASIER_QUESTION.correctIndex ? (
                <Button
                  onClick={() => {
                    setStage("harder");
                    setVisual("inverse");
                    say(HARDER_INTRO);
                  }}
                >
                  Give me a harder one <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : null}
            </>
          ) : null}

          {stage === "harder" ? (
            <>
              <QuestionCard
                question={HARDER_QUESTION}
                language={language}
                selected={hardChoice}
                revealed={hardChoice !== null}
                onSelect={(i) => {
                  setHardChoice(i);
                  if (i === HARDER_QUESTION.correctIndex) {
                    bump("Ohm's Law", 81);
                    setEngine((e) => ({
                      ...e,
                      understanding: 81,
                      strategy: "Worked numerical practice",
                      next: "Quick check on the whole lesson",
                    }));
                    say(CORRECT_LINE);
                  }
                }}
              />
              {hardChoice !== null ? (
                <Button
                  onClick={() => {
                    setStage("quickcheck");
                    say({
                      English: "Quick check — three short questions on what we covered.",
                      Hinglish: "Quick check — jo padha uspe teen chhote sawal.",
                    });
                  }}
                >
                  Start Quick Check <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : null}
            </>
          ) : null}

          {stage === "quickcheck" ? (
            <>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Quick Check · question {qcIndex + 1} of {QUICK_CHECK.length}
              </p>
              <QuestionCard
                question={quickQuestion}
                language={language}
                selected={qcChoice}
                revealed={qcChoice !== null}
                onSelect={answerQuick}
              />
              {qcChoice !== null ? (
                <Button onClick={nextQuick}>
                  {qcIndex < QUICK_CHECK.length - 1 ? "Next question" : "See my report"}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : null}
            </>
          ) : null}

          {stage === "report" ? <Report score={qcScore} onRestart={restart} /> : null}

          {stage !== "report" ? (
            <section className="glass-card p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Ask your teacher
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["Explain again", "again"],
                  ["Simplify", "simplify"],
                  ["Give example", "example"],
                  ["Show visual", "visual"],
                  ["Explain in Hinglish", "hinglish"],
                  ["Slow down", "slower"],
                ].map(([label, kind]) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    onClick={() => control(kind as never)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* RIGHT — progress + engine */}
        <div className="space-y-4">
          <TeachingEnginePanel state={engine} changed={misconceptionFound} />
          <ProgressPanel
            overall={overall}
            currentConcept={engine.concept}
            mastery={mastery}
          />
        </div>
      </main>
    </div>
  );
}

function Report({ score, onRestart }: { score: number; onRestart: () => void }) {
  const percent = Math.round((score / QUICK_CHECK.length) * 100);
  return (
    <section className="glass-card animate-in fade-in p-6">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-accent">
        <Sparkles className="size-4" /> SHREAI Learning Report
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold">{LESSON_TITLE}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Quick Check: {score} / {QUICK_CHECK.length} correct
      </p>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex size-24 items-center justify-center rounded-full border-4 border-primary/40 font-display text-2xl font-semibold text-primary">
          {percent}%
        </div>
        <p className="text-sm text-muted-foreground">
          Lesson complete 🎉 You started at 61% on Ohm's Law and finished at 82% after the
          re-teach.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-sm font-semibold">Strong areas</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>✓ Current</li>
            <li>✓ Voltage</li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold">Needs practice</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>⚠ Resistance</li>
            <li>⚠ Ohm's Law</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Misconception corrected
        </p>
        <p className="mt-1 text-sm">Inverse relationship between resistance and current.</p>
        <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
          SHREAI recommends
        </p>
        <p className="mt-1 text-sm">
          Practice 2 more Ohm's Law questions before moving to Series Circuits.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={onRestart}>Practice again</Button>
        <Button variant="outline" asChild>
          <Link to="/auth">Continue learning with my own topic</Link>
        </Button>
      </div>
    </section>
  );
}
