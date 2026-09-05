/**
 * Scripted SHREAI demo lesson — Current Electricity / Ohm's Law.
 * Fully local: no account, no API keys, no external AI needed.
 */

export type Lang = "English" | "Hinglish";

export interface Bilingual {
  English: string;
  Hinglish: string;
}

export interface DemoQuestion {
  id: string;
  concept: string;
  kind: "conceptual" | "numerical" | "application";
  prompt: Bilingual;
  options: string[];
  correctIndex: number;
  /** Index the demo nudges the student toward first (used for the scripted misconception). */
  scriptedWrongIndex?: number;
  explain: Bilingual;
}

export const DEMO_LANGUAGES = [
  "English",
  "Hindi",
  "Hinglish",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
] as const;

export const LESSON_TITLE = "Current Electricity";

export const LEARNING_PATH = [
  { name: "Current", state: "done" as const },
  { name: "Voltage", state: "done" as const },
  { name: "Resistance", state: "current" as const },
  { name: "Ohm's Law", state: "current" as const },
  { name: "Series Circuits", state: "upcoming" as const },
  { name: "Parallel Circuits", state: "upcoming" as const },
  { name: "Electrical Power", state: "upcoming" as const },
];

export const INITIAL_MASTERY = [
  { name: "Current", value: 92 },
  { name: "Voltage", value: 86 },
  { name: "Resistance", value: 63 },
  { name: "Ohm's Law", value: 61 },
];

export const INTRO_SCRIPT: Bilingual = {
  English:
    "Today we're going to understand Ohm's Law. It ties together the three things you already met — current, voltage and resistance — in one short relationship: V equals I times R.",
  Hinglish:
    "Aaj hum Ohm's Law samjhenge. Ye teen cheezein jo tumne already padhi hain — current, voltage aur resistance — unhe ek chhote se relation mein jodta hai: V = I × R.",
};

export const FORMULA_CAPTION: Bilingual = {
  English: "Voltage = Current × Resistance. Keep voltage fixed and this becomes a tug of war.",
  Hinglish: "Voltage = Current × Resistance. Voltage fix rakho, toh ye ek tug of war ban jaata hai.",
};

export const RETEACH_SCRIPT: Bilingual = {
  English:
    "Let's try this differently. Think of a water pipe. Voltage is the pump pushing water, resistance is how narrow the pipe is. Narrow the pipe and less water flows per second — even though the pump is unchanged.",
  Hinglish:
    "Chalo isse alag tarike se dekhte hain. Ek paani ki pipe socho. Voltage pump hai jo paani push karta hai, resistance pipe ki tightness hai. Pipe patli karo toh paani kam behta hai — pump wahi ka wahi hai.",
};

export const RETEACH_FORMULA_CAPTION: Bilingual = {
  English: "Rearranged: I = V / R. Resistance sits underneath, so bigger R means smaller I.",
  Hinglish: "Rearrange karo: I = V / R. Resistance neeche hai, toh R bada matlab I chhota.",
};

export const MISCONCEPTION_LINE: Bilingual = {
  English: "You're mixing up the relationship between resistance and current.",
  Hinglish: "Tum resistance aur current ka relation ulta samajh rahe ho.",
};

export const CORRECT_LINE: Bilingual = {
  English: "Exactly. Now you've got the relationship.",
  Hinglish: "Bilkul sahi. Ab relation clear ho gaya.",
};

export const HARDER_INTRO: Bilingual = {
  English: "Good. Let's put a number on it.",
  Hinglish: "Badhiya. Ab ek number laga ke dekhte hain.",
};

export const CONTROL_RESPONSES: Record<string, Bilingual> = {
  again: {
    English:
      "Once more, slowly. Voltage is the push. Resistance is the opposition to that push. Current is what actually flows out of the fight between them.",
    Hinglish:
      "Ek baar phir, dhire se. Voltage push hai. Resistance us push ka opposition hai. Current wo hai jo dono ki ladai ke baad actually behta hai.",
  },
  simplify: {
    English: "Short version: more resistance, less current. Voltage staying the same is the key part.",
    Hinglish: "Chhota version: zyada resistance, kam current. Voltage same rehna important hai.",
  },
  example: {
    English:
      "A 6 V battery with a 2 ohm bulb gives 3 amperes. Swap in a 6 ohm bulb and the same battery only pushes 1 ampere.",
    Hinglish:
      "6 V battery aur 2 ohm bulb se 3 ampere milta hai. Wahi battery 6 ohm bulb ke saath sirf 1 ampere de paati hai.",
  },
  slower: {
    English: "Slowing down. V ... equals ... I ... times ... R. Three quantities, one relationship.",
    Hinglish: "Dhire chalte hain. V ... barabar ... I ... into ... R. Teen cheezein, ek relation.",
  },
};

export const MAIN_QUESTION: DemoQuestion = {
  id: "q-main",
  concept: "Ohm's Law",
  kind: "conceptual",
  prompt: {
    English: "If voltage stays constant and resistance increases, what happens to current?",
    Hinglish: "Agar voltage constant rahe aur resistance badhe, toh current ka kya hoga?",
  },
  options: [
    "Current increases",
    "Current decreases",
    "Current stays the same",
    "There is no relationship",
  ],
  correctIndex: 1,
  scriptedWrongIndex: 0,
  explain: {
    English: "With V fixed, I = V / R — a bigger R can only make I smaller.",
    Hinglish: "V fix hai, I = V / R — R bada hoga toh I chhota hi hoga.",
  },
};

export const EASIER_QUESTION: DemoQuestion = {
  id: "q-easy",
  concept: "Ohm's Law",
  kind: "conceptual",
  prompt: {
    English: "If resistance increases while voltage stays the same, current...",
    Hinglish: "Resistance badhe aur voltage same rahe, toh current...",
  },
  options: ["increases", "decreases", "stays the same"],
  correctIndex: 1,
  explain: {
    English: "Narrower pipe, same pump — less flow.",
    Hinglish: "Patli pipe, wahi pump — kam flow.",
  },
};

export const HARDER_QUESTION: DemoQuestion = {
  id: "q-hard",
  concept: "Ohm's Law",
  kind: "numerical",
  prompt: {
    English: "A 12 V battery is connected across a 4 ohm resistor. What current flows?",
    Hinglish: "12 V battery ko 4 ohm resistor se joda gaya. Kitna current behega?",
  },
  options: ["0.33 A", "3 A", "8 A", "48 A"],
  correctIndex: 1,
  explain: {
    English: "I = V / R = 12 / 4 = 3 amperes.",
    Hinglish: "I = V / R = 12 / 4 = 3 ampere.",
  },
};

export const QUICK_CHECK: DemoQuestion[] = [
  {
    id: "qc-1",
    concept: "Resistance",
    kind: "conceptual",
    prompt: {
      English: "What does resistance do in a circuit?",
      Hinglish: "Circuit mein resistance kya karta hai?",
    },
    options: [
      "It opposes the flow of current",
      "It creates voltage",
      "It stores current",
      "It has no effect",
    ],
    correctIndex: 0,
    explain: {
      English: "Resistance opposes the flow of current.",
      Hinglish: "Resistance basically current ke flow ko oppose karta hai.",
    },
  },
  {
    id: "qc-2",
    concept: "Ohm's Law",
    kind: "numerical",
    prompt: {
      English: "A 9 V supply pushes 3 A through a resistor. What is its resistance?",
      Hinglish: "9 V supply ek resistor se 3 A push karti hai. Resistance kitna hai?",
    },
    options: ["27 ohm", "3 ohm", "0.33 ohm", "12 ohm"],
    correctIndex: 1,
    explain: {
      English: "R = V / I = 9 / 3 = 3 ohm.",
      Hinglish: "R = V / I = 9 / 3 = 3 ohm.",
    },
  },
  {
    id: "qc-3",
    concept: "Ohm's Law",
    kind: "application",
    prompt: {
      English: "A torch dims when a thicker filament is swapped for a thinner one. Why?",
      Hinglish: "Torch dim ho jaati hai jab motta filament patle se badal dete hain. Kyun?",
    },
    options: [
      "The thinner filament has higher resistance, so less current flows",
      "The battery voltage drops to zero",
      "Thin wires create more current",
      "Resistance does not affect brightness",
    ],
    correctIndex: 0,
    explain: {
      English: "Higher resistance at the same voltage means less current, so less light.",
      Hinglish: "Same voltage par zyada resistance matlab kam current, isliye kam roshni.",
    },
  },
];
