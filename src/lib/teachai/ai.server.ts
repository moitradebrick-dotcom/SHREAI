const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export class AiUnavailableError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AiUnavailableError";
  }
}

/**
 * Single low-level entry point to the LLM. Every teaching agent goes through
 * here with its own system prompt so responsibilities stay separated.
 */
export async function runAgent<T>(opts: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<T> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiUnavailableError("AI service is not configured");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: opts.temperature ?? 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AiUnavailableError(
      res.status === 429
        ? "The AI teacher is busy right now. Try again in a moment."
        : res.status === 402
          ? "AI credits are exhausted for this workspace."
          : `AI request failed (${res.status}) ${detail.slice(0, 200)}`,
      res.status,
    );
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new AiUnavailableError("The AI teacher returned an empty response");

  try {
    return JSON.parse(stripFences(content)) as T;
  } catch {
    throw new AiUnavailableError("The AI teacher returned an unreadable lesson");
  }
}

function stripFences(text: string) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}
