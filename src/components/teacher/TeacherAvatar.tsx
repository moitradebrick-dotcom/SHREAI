import { Mic, MicOff } from "lucide-react";

import { TEACHER_NAME } from "@/lib/teachai/types";

export function TeacherAvatar({
  speaking,
  status,
  language,
  voiceOn,
}: {
  speaking: boolean;
  status: string;
  language: string;
  voiceOn: boolean;
}) {
  return (
    <div className="glass-card flex flex-col items-center gap-4 p-6">
      <div className="relative flex size-40 items-center justify-center">
        <span
          className={`absolute inset-0 rounded-full bg-teacher-glow ${speaking ? "animate-halo" : "opacity-50"}`}
          aria-hidden
        />
        <span className="relative flex size-32 items-center justify-center rounded-full border border-primary/30 bg-surface shadow-glow">
          <TeacherFace speaking={speaking} />
        </span>
      </div>

      <div className="text-center">
        <p className="font-display text-lg font-semibold">{TEACHER_NAME}</p>
        <p className="text-xs text-muted-foreground">
          Your AI teacher · teaching in {language}
        </p>
      </div>

      <div className="flex h-6 items-end gap-1" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span
            key={i}
            className={`w-1.5 rounded-full bg-primary ${speaking ? "animate-speak" : ""}`}
            style={{
              height: `${10 + ((i * 7) % 16)}px`,
              animationDelay: `${i * 90}ms`,
              opacity: speaking ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
        {voiceOn ? <Mic className="size-3.5 text-primary" /> : <MicOff className="size-3.5" />}
        {status}
      </div>
    </div>
  );
}

function TeacherFace({ speaking }: { speaking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="size-24" role="img" aria-label="AI teacher avatar">
      <defs>
        <linearGradient id="tf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <g className="text-primary">
        <circle cx="50" cy="38" r="19" fill="url(#tf)" />
        <path d="M20 84c0-16 13-26 30-26s30 10 30 26z" fill="url(#tf)" opacity="0.75" />
        <circle cx="43" cy="36" r="3" className="fill-background" />
        <circle cx="57" cy="36" r="3" className="fill-background" />
        <rect
          x="43"
          y={speaking ? 44 : 46}
          width="14"
          height={speaking ? 7 : 2.5}
          rx="3"
          className="fill-background"
        />
      </g>
    </svg>
  );
}
