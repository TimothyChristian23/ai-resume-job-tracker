import { MatchResult } from "@/lib/match";

export type InterviewQuestion = {
  category: "Experience" | "Technical" | "Gap";
  question: string;
  prompt: string;
};

export function buildInterviewPrep(result: MatchResult, resumeText: string): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  const evidence = result.evidence[0]?.split(": ").slice(1).join(": ") ?? "one of your projects";
  const matchedSkill = result.matchedSkills[0] ?? "the skills listed in your resume";
  const missingSkill = result.missingSkills[0];

  questions.push({
    category: "Experience",
    question: `Tell me about a project where you used ${matchedSkill}.`,
    prompt: `Use this resume evidence as your starting point: “${evidence}” Then explain your contribution, the decisions you made, and the result.`,
  });
  questions.push({
    category: "Technical",
    question: "How would you approach building a reliable feature for this role?",
    prompt: "Connect your answer to a real project or class assignment. Mention how you would test it, handle edge cases, and decide what to improve next.",
  });
  if (missingSkill) {
    questions.push({
      category: "Gap",
      question: `What is your current experience with ${missingSkill}?`,
      prompt: `Be direct about what you have and have not used. You can discuss adjacent experience from your resume and describe a concrete plan to learn or apply ${missingSkill}.`,
    });
  }
  if (resumeText.length > 180) {
    questions.push({
      category: "Experience",
      question: "Which accomplishment on your resume best represents how you work?",
      prompt: "Choose one specific example, then structure your answer with situation, action, and result. Avoid listing every project.",
    });
  }
  return questions;
}
