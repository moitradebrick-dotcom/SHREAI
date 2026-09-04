import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { AiUnavailableError, runAgent } from "./ai.server";
import {
  ASK_TEACHER_PROMPT,
  ASSESSMENT_PROMPT,
  EVALUATOR_PROMPT,
  GRADER_PROMPT,
  LESSON_PLANNER_PROMPT,
} from "./prompts.server";
import { DEMO_ASSESSMENT, DEMO_PLAN, demoEvaluate, demoGrade } from "./demo";
import type {
  AnswerEvaluation,
  GradedAssessment,
  LessonPlan,
  TeachingQuestion,
} from "./types";
import { questionsForDuration } from "./types";

const profileSchema = z.object({
  education_level: z.string().nullable().optional(),
  knowledge_level: z.string().nullable().optional(),
  preferred_language: z.string().nullable().optional(),
  learning_goal: z.string().nullable().optional(),
  teaching_style: z.string().nullable().optional(),
  lesson_depth: z.string().nullable().optional(),
});

function describeProfile(p: z.infer<typeof profileSchema>) {
  return [
    `Education level: ${p.education_level ?? "unspecified"}`,
    `Current knowledge: ${p.knowledge_level ?? "Beginner"}`,
    `Preferred language: ${p.preferred_language ?? "English"}`,
    `Learning goal: ${p.learning_goal ?? "Understand a concept"}`,
    `Teaching style: ${p.teaching_style ?? "Simple explanations"}`,
    `Lesson depth: ${p.lesson_depth ?? "Standard"}`,
  ].join("\n");
}

/** LESSON PLANNER — turns a topic + student profile into a structured lesson. */
export const planLesson = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        topic: z.string().min(1),
        duration: z.number(),
        language: z.string(),
        difficulty: z.string(),
        teachingStyle: z.string(),
        goal: z.string(),
        profile: profileSchema,
        weakConcepts: z.array(z.string()).default([]),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<{ plan: LessonPlan; demo: boolean; notice?: string }> => {
    const user = `Student profile:
${describeProfile(data.profile)}

Lesson request:
Topic: ${data.topic}
Available time: ${data.duration} minutes
Teaching language: ${data.language}
Difficulty: ${data.difficulty}
Teaching style: ${data.teachingStyle}
Objective: ${data.goal}
Previously weak concepts to reinforce: ${data.weakConcepts.join(", ") || "none recorded yet"}

Build the lesson plan now.`;

    try {
      const plan = await runAgent<LessonPlan>({ system: LESSON_PLANNER_PROMPT, user });
      if (!plan?.steps?.length) throw new AiUnavailableError("Empty plan");
      plan.duration = data.duration;
      plan.language = data.language;
      return { plan, demo: false };
    } catch (error) {
      return {
        plan: DEMO_PLAN,
        demo: true,
        notice:
          error instanceof AiUnavailableError
            ? error.message
            : "The AI teacher is unavailable, so a scripted demo lesson is running instead.",
      };
    }
  });

/** ANSWER EVALUATION + MISCONCEPTION + ADAPTATION. */
export const evaluateAnswer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        question: z.any(),
        answer: z.string(),
        conceptName: z.string(),
        language: z.string(),
        level: z.string(),
        streakCorrect: z.number().default(0),
        demo: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<AnswerEvaluation> => {
    const question = data.question as TeachingQuestion;
    if (data.demo) return demoEvaluate(question, data.answer);

    const user = `Concept: ${data.conceptName}
Lesson language: ${data.language}
Student level: ${data.level}
Consecutive correct answers so far: ${data.streakCorrect}

Question asked: ${question.question}
Options: ${question.options?.join(" | ") ?? "none (open answer)"}
Expected answer: ${question.expected_answer}
Known misconceptions: ${question.common_misconceptions?.join("; ") ?? "none"}

Student's answer: "${data.answer}"

Evaluate now.`;

    try {
      return await runAgent<AnswerEvaluation>({
        system: EVALUATOR_PROMPT,
        user,
        temperature: 0.4,
      });
    } catch {
      return demoEvaluate(question, data.answer);
    }
  });

/** ASSESSMENT GENERATOR — questions based on what was actually taught. */
export const buildAssessment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        topic: z.string(),
        language: z.string(),
        level: z.string(),
        duration: z.number(),
        conceptsTaught: z.array(z.string()),
        performance: z.string().default(""),
        demo: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<{ questions: TeachingQuestion[]; demo: boolean }> => {
    if (data.demo) return { questions: DEMO_ASSESSMENT, demo: true };

    const count = questionsForDuration(data.duration);
    const user = `Topic: ${data.topic}
Language: ${data.language}
Student level: ${data.level}
Concepts actually taught: ${data.conceptsTaught.join(", ")}
In-lesson performance: ${data.performance || "no interactions recorded"}
Generate exactly ${count} questions.`;

    try {
      const out = await runAgent<{ questions: TeachingQuestion[] }>({
        system: ASSESSMENT_PROMPT,
        user,
        temperature: 0.5,
      });
      if (!out?.questions?.length) throw new Error("empty");
      return { questions: out.questions, demo: false };
    } catch {
      return { questions: DEMO_ASSESSMENT, demo: true };
    }
  });

/** ASSESSMENT EVALUATOR + RECOMMENDATION. */
export const gradeAssessment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        topic: z.string(),
        language: z.string(),
        questions: z.array(z.any()),
        answers: z.record(z.string(), z.string()),
        demo: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<GradedAssessment> => {
    if (data.demo) return demoGrade(data.answers);

    const questions = data.questions as TeachingQuestion[];
    const user = `Topic: ${data.topic}
Language: ${data.language}

${questions
  .map(
    (q, i) =>
      `${i + 1}. [${q.concept_id}] ${q.question}\n   Expected: ${q.expected_answer}\n   Student answered: "${data.answers[q.id] ?? ""}"`,
  )
  .join("\n")}

Grade the assessment now.`;

    try {
      const out = await runAgent<GradedAssessment>({
        system: GRADER_PROMPT,
        user,
        temperature: 0.3,
      });
      if (typeof out?.score !== "number") throw new Error("bad grade");
      return out;
    } catch {
      return demoGrade(data.answers);
    }
  });

/** ASK TEACHER — mid-lesson follow-up without losing lesson state. */
export const askTeacher = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        question: z.string().min(1),
        topic: z.string(),
        concept: z.string(),
        script: z.string(),
        language: z.string(),
        level: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<{ answer: string }> => {
    const user = `Lesson topic: ${data.topic}
Current concept: ${data.concept}
What you just said to the student: "${data.script}"
Language: ${data.language}
Student level: ${data.level}

Student asks: "${data.question}"`;

    try {
      return await runAgent<{ answer: string }>({
        system: ASK_TEACHER_PROMPT,
        user,
        temperature: 0.5,
      });
    } catch {
      return {
        answer:
          "Main abhi is sawal ka live jawab nahi la pa raha — demo mode chal raha hai. Filhaal lesson jari rakhte hain, aur is point par main baad mein wapas aata hoon.",
      };
    }
  });

/** TRANSLATION of the current script when the student switches language mid-lesson. */
export const retranslateScript = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ script: z.string(), language: z.string() }).parse(data),
  )
  .handler(async ({ data }): Promise<{ script: string }> => {
    try {
      return await runAgent<{ script: string }>({
        system: `You re-express a teacher's spoken explanation in another language while keeping every technical term accurate. Hinglish means a natural Hindi-English mix in Latin script. Return exactly {"script":string}.`,
        user: `Target language: ${data.language}\n\nExplanation:\n${data.script}`,
        temperature: 0.3,
      });
    } catch {
      return { script: data.script };
    }
  });
