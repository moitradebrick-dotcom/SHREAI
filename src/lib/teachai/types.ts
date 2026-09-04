export type VisualType =
  | "equation"
  | "diagram"
  | "graph"
  | "code"
  | "timeline"
  | "concept"
  | "steps";

export interface TeachingVisual {
  type: VisualType;
  title: string;
  content?: string;
  items?: string[];
  caption?: string;
}

export interface TeachingQuestion {
  id: string;
  concept_id: string;
  type: "mcq" | "conceptual" | "short_answer" | "application";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  expected_answer: string;
  hint?: string;
  common_misconceptions?: string[];
}

export interface LessonStep {
  step_id: string;
  type: "intro" | "explanation" | "example" | "visual" | "question" | "recap";
  concept_id: string;
  concept_name?: string;
  teacher_script: string;
  visual?: TeachingVisual;
  question?: TeachingQuestion;
  estimated_seconds?: number;
  adaptive?: boolean;
}

export interface LessonConcept {
  id: string;
  name: string;
  importance: "high" | "medium" | "low";
  estimated_minutes: number;
}

export interface LessonPlan {
  title: string;
  objective: string;
  duration: number;
  language: string;
  difficulty: string;
  concepts: LessonConcept[];
  steps: LessonStep[];
}

export interface AnswerEvaluation {
  correct: boolean;
  partial: boolean;
  understanding: number;
  misconception: string | null;
  feedback: string;
  next_action:
    | "continue"
    | "re_explain"
    | "give_hint"
    | "ask_easier"
    | "ask_harder"
    | "recap";
  adaptive_step: LessonStep | null;
}

export interface AssessmentResultItem {
  question: string;
  concept: string;
  answer: string;
  correct: boolean;
  feedback: string;
}

export interface GradedAssessment {
  score: number;
  results: AssessmentResultItem[];
  strong_areas: string[];
  weak_areas: string[];
  misconceptions: string[];
  recommendation: string;
  next_topic: string;
}

export const LANGUAGES = [
  "English",
  "Hindi",
  "Hinglish",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
] as const;

export const EDUCATION_LEVELS = [
  "School",
  "Undergraduate",
  "Postgraduate",
  "Professional",
  "Other",
] as const;

export const KNOWLEDGE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const LEARNING_GOALS = [
  "Understand a concept",
  "Exam preparation",
  "Revision",
  "Interview preparation",
  "Practical application",
  "Build fundamentals",
] as const;

export const TEACHING_STYLES = [
  "Simple explanations",
  "Step-by-step",
  "Examples first",
  "Visual",
  "Question based",
  "Technical / deep",
] as const;

export const LESSON_DEPTHS = ["Quick", "Standard", "Deep"] as const;

export const DURATIONS = [5, 10, 20, 30, 60] as const;

export function questionsForDuration(duration: number) {
  if (duration <= 5) return 3;
  if (duration <= 10) return 4;
  if (duration <= 20) return 5;
  return 7;
}

export const TEACHER_NAME = "Aarav";
