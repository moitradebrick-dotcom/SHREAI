import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Speaks lesson scripts using the server TTS route, falling back to the
 * browser's built-in speech synthesis when the AI voice is unavailable.
 */
export function useTeacherVoice(language: string, enabled: boolean) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const tokenRef = useRef(0);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  useEffect(() => stop, [stop]);

  const speak = useCallback(
    async (text: string) => {
      stop();
      if (!enabled || !text.trim()) return;
      const token = tokenRef.current;
      setSpeaking(true);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language }),
        });
        if (!res.ok) throw new Error("tts failed");
        const blob = await res.blob();
        if (token !== tokenRef.current) return;

        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          if (token === tokenRef.current) setSpeaking(false);
        };
        await audio.play();
      } catch {
        if (token !== tokenRef.current) return;
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const utter = new SpeechSynthesisUtterance(text);
          utter.rate = 0.95;
          utter.lang = language === "English" ? "en-IN" : "hi-IN";
          utter.onend = () => {
            if (token === tokenRef.current) setSpeaking(false);
          };
          window.speechSynthesis.speak(utter);
        } else {
          setSpeaking(false);
        }
      }
    },
    [enabled, language, stop],
  );

  return { speak, stop, speaking };
}
