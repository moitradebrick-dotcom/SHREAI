import type { AnswerEvaluation, GradedAssessment, LessonPlan, LessonStep, TeachingQuestion } from "./types";

/**
 * Deterministic Demo Mode: a fully scripted Current Electricity lesson in
 * Hinglish that demonstrates the entire teaching loop — explain, demonstrate,
 * question, misconception, adapt, re-question, assess — without any external
 * AI call. Used when the AI service is unavailable or the user picks "Try Demo".
 */
export const DEMO_PLAN: LessonPlan = {
  title: "Current Electricity — Basics that actually stick",
  objective:
    "Samajhna ki current, voltage aur resistance kya hain, aur Ohm's Law inhe kaise jodta hai.",
  duration: 10,
  language: "Hinglish",
  difficulty: "Beginner",
  concepts: [
    { id: "current", name: "Current", importance: "high", estimated_minutes: 2 },
    { id: "voltage", name: "Voltage", importance: "high", estimated_minutes: 2 },
    { id: "resistance", name: "Resistance", importance: "high", estimated_minutes: 3 },
    { id: "ohms-law", name: "Ohm's Law", importance: "high", estimated_minutes: 3 },
  ],
  steps: [
    {
      step_id: "s1",
      type: "intro",
      concept_id: "current",
      concept_name: "Current",
      teacher_script:
        "Chalo Current Electricity ko ekdum basic se samajhte hain. Main tumhe teen cheezein sikhaunga — current, voltage aur resistance — aur phir ye teeno ek hi formula mein kaise judte hain. Beech-beech mein main sawal bhi puchhunga, taaki pata chale samajh aaya ya nahi.",
      visual: {
        type: "concept",
        title: "Aaj ka plan",
        items: ["Current", "Voltage", "Resistance", "Ohm's Law"],
        caption: "Har concept ke baad ek chhota sa check.",
      },
      estimated_seconds: 40,
    },
    {
      step_id: "s2",
      type: "explanation",
      concept_id: "current",
      concept_name: "Current",
      teacher_script:
        "Current matlab charge ka flow. Socho ek pipe mein paani beh raha hai — ek second mein kitna paani cross kar raha hai, wahi current hai. Electricity mein paani ki jagah electrons hote hain, aur unit hoti hai ampere.",
      visual: {
        type: "diagram",
        title: "Water flow analogy",
        items: [
          "Pipe = wire",
          "Paani ka bahav = current (I)",
          "Pump ka pressure = voltage (V)",
          "Pipe ki tightness = resistance (R)",
        ],
      },
      estimated_seconds: 55,
    },
    {
      step_id: "s3",
      type: "explanation",
      concept_id: "voltage",
      concept_name: "Voltage",
      teacher_script:
        "Voltage wo push hai jo charge ko chalata hai. Bina pump ke paani nahi behta — bina voltage ke current nahi chalta. Isliye battery ko hum circuit ka pump keh sakte hain.",
      visual: {
        type: "equation",
        title: "Voltage",
        content: "V  =  push jo charge ko move karta hai  (volts)",
      },
      estimated_seconds: 45,
    },
    {
      step_id: "s4",
      type: "explanation",
      concept_id: "resistance",
      concept_name: "Resistance",
      teacher_script:
        "Resistance wo rukawat hai jo flow ko kam karti hai. Agar pipe patli ho jaye, paani kam behega. Wire mein bhi resistance badhne par current kam ho jaata hai — same pressure par.",
      visual: {
        type: "steps",
        title: "Resistance badhne par kya hota hai",
        items: [
          "Pipe patli ho gayi (resistance ⬆)",
          "Pump ka pressure same hai (voltage =)",
          "Paani ka bahav kam ho gaya (current ⬇)",
        ],
      },
      estimated_seconds: 55,
    },
    {
      step_id: "s5",
      type: "question",
      concept_id: "resistance",
      concept_name: "Resistance",
      teacher_script:
        "Ab tumhari baari. Agar voltage same rahe aur resistance badh jaye, toh current ka kya hoga?",
      question: {
        id: "q1",
        concept_id: "resistance",
        type: "mcq",
        difficulty: "easy",
        question: "Voltage same, resistance badh gaya — current ka kya hoga?",
        options: ["Current badh jayega", "Current kam ho jayega", "Current same rahega"],
        expected_answer: "Current kam ho jayega",
        hint: "Patli pipe mein paani zyada behta hai ya kam?",
        common_misconceptions: [
          "Resistance badhne se current badhta hai (ulta relationship samajh liya)",
        ],
      },
      estimated_seconds: 60,
    },
    {
      step_id: "s6",
      type: "explanation",
      concept_id: "ohms-law",
      concept_name: "Ohm's Law",
      teacher_script:
        "Ab teeno ko jodte hain. Ohm's Law kehta hai V = I × R. Isse current nikalna ho toh I = V / R. Dekho — R denominator mein hai, isliye R badhega toh I chhota hoga.",
      visual: {
        type: "equation",
        title: "Ohm's Law",
        content: "V = I × R      →      I = V / R",
        caption: "R neeche hai, isliye resistance aur current ulte chalte hain.",
      },
      estimated_seconds: 50,
    },
    {
      step_id: "s7",
      type: "question",
      concept_id: "ohms-law",
      concept_name: "Ohm's Law",
      teacher_script:
        "Thoda mushkil karte hain. Agar resistance double ho jaye aur voltage same rahe, toh current?",
      question: {
        id: "q2",
        concept_id: "ohms-law",
        type: "mcq",
        difficulty: "medium",
        question: "Resistance double, voltage same — current kya hoga?",
        options: ["Double ho jayega", "Half ho jayega", "Same rahega"],
        expected_answer: "Half ho jayega",
        hint: "I = V / R mein R ko 2R kar ke dekho.",
        common_misconceptions: ["Double resistance = double current"],
      },
      estimated_seconds: 60,
    },
    {
      step_id: "s8",
      type: "recap",
      concept_id: "ohms-law",
      concept_name: "Recap",
      teacher_script:
        "Shabaash. Recap: current charge ka flow hai, voltage uska push hai, resistance rukawat hai, aur V = I × R teeno ko jodta hai. Ab ek chhota assessment lete hain.",
      visual: {
        type: "concept",
        title: "Yaad rakhne wali cheezein",
        items: [
          "I = charge flow (A)",
          "V = push (V)",
          "R = rukawat (Ω)",
          "V = I × R",
        ],
      },
      estimated_seconds: 40,
    },
  ],
};

export const DEMO_ADAPTIVE_STEP: LessonStep = {
  step_id: "adaptive-resistance",
  type: "explanation",
  concept_id: "resistance",
  concept_name: "Resistance (re-explained)",
  adaptive: true,
  teacher_script:
    "Tumne socha current badhega — ye ek bahut common galatfehmi hai. Log resistance ko 'zyada energy' samajh lete hain, lekin resistance rukawat hai, madad nahi. Ek naya example: highway par agar do lanes band kar do, gaadiyan kam nikalengi, zyada nahi. Formula bhi yahi kehta hai: I = V / R.",
  visual: {
    type: "diagram",
    title: "Highway analogy",
    items: [
      "4 lanes khuli = kam resistance = zyada cars/second",
      "2 lanes band = zyada resistance = kam cars/second",
      "Speed limit same = voltage same",
    ],
  },
  estimated_seconds: 55,
};

export function demoEvaluate(
  question: TeachingQuestion,
  answer: string,
): AnswerEvaluation {
  const normalized = answer.trim().toLowerCase();
  const expected = question.expected_answer.trim().toLowerCase();
  const correct =
    normalized === expected ||
    (expected.includes("kam") && /kam|decrease|less|ghat/.test(normalized)) ||
    (expected.includes("half") && /half|aadha|adha|0\.5/.test(normalized));

  if (correct) {
    return {
      correct: true,
      partial: false,
      understanding: 0.9,
      misconception: null,
      feedback:
        "Exactly. Tumne relationship theek pakda — R badhega toh I kam hoga. Ab thoda mushkil karte hain.",
      next_action: "ask_harder",
      adaptive_step: null,
    };
  }

  return {
    correct: false,
    partial: false,
    understanding: 0.25,
    misconception: "Resistance badhne se current badhta hai",
    feedback:
      "Close nahi, par tumhari soch kahan mudi ye main samajh gaya. Tum resistance ko 'zyada power' maan rahe ho, jabki wo rukawat hai. Ek naye example se dekhte hain.",
    next_action: "re_explain",
    adaptive_step: DEMO_ADAPTIVE_STEP,
  };
}

export const DEMO_ASSESSMENT: TeachingQuestion[] = [
  {
    id: "a1",
    concept_id: "current",
    type: "mcq",
    difficulty: "easy",
    question: "Current ka matlab kya hai?",
    options: ["Charge ka flow", "Charge ka push", "Charge ki rukawat"],
    expected_answer: "Charge ka flow",
  },
  {
    id: "a2",
    concept_id: "voltage",
    type: "mcq",
    difficulty: "easy",
    question: "Circuit mein battery kis cheez ki tarah kaam karti hai?",
    options: ["Pipe", "Pump", "Valve"],
    expected_answer: "Pump",
  },
  {
    id: "a3",
    concept_id: "ohms-law",
    type: "mcq",
    difficulty: "medium",
    question: "12V aur 4Ω ke saath current kitna hoga?",
    options: ["3 A", "48 A", "0.33 A"],
    expected_answer: "3 A",
  },
  {
    id: "a4",
    concept_id: "resistance",
    type: "short_answer",
    difficulty: "medium",
    question: "Apne shabdon mein batao: resistance current ko kaise affect karta hai?",
    expected_answer:
      "Resistance badhne par, voltage same rehte hue, current kam ho jaata hai kyunki I = V/R.",
  },
];

export function demoGrade(answers: Record<string, string>): GradedAssessment {
  const results = DEMO_ASSESSMENT.map((q) => {
    const given = (answers[q.id] ?? "").trim();
    const correct =
      q.type === "mcq"
        ? given.toLowerCase() === q.expected_answer.toLowerCase()
        : /kam|decrease|less|v\s*\/\s*r/i.test(given);
    return {
      question: q.question,
      concept: q.concept_id,
      answer: given || "—",
      correct,
      feedback: correct
        ? "Bilkul sahi."
        : "Yahan thoda gap hai — I = V / R ko dobara dekho.",
    };
  });
  const score = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
  return {
    score,
    results,
    strong_areas: ["Current", "Voltage"],
    weak_areas: ["Resistance", "Ohm's Law"],
    misconceptions: ["Resistance badhne se current badhta hai"],
    recommendation:
      "Ohm's Law dobara revise karo aur resistance ke 3 numerical practice karo, phir Series & Parallel Circuits par jao.",
    next_topic: "Series & Parallel Circuits",
  };
}
