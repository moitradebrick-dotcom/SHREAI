import { createFileRoute } from "@tanstack/react-router";

const VOICE_BY_LANGUAGE: Record<string, string> = {
  English: "alloy",
  Hindi: "verse",
  Hinglish: "verse",
  Bengali: "verse",
  Tamil: "verse",
  Telugu: "verse",
  Marathi: "verse",
};

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("voice unavailable", { status: 503 });

        const body = (await request.json().catch(() => null)) as {
          text?: string;
          language?: string;
        } | null;
        const text = body?.text?.slice(0, 3500);
        if (!text) return new Response("missing text", { status: 400 });

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice: VOICE_BY_LANGUAGE[body?.language ?? "English"] ?? "alloy",
            response_format: "mp3",
            instructions:
              "You are a warm, patient human teacher speaking to one student. Speak clearly and unhurriedly, with natural teaching rhythm.",
          }),
        });

        if (!res.ok) {
          return new Response("voice unavailable", { status: res.status });
        }

        return new Response(res.body, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
