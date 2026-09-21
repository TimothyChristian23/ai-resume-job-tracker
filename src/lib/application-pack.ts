import { MatchResult } from "@/lib/match";
import { InterviewQuestion } from "@/lib/interview";

export function buildApplicationPack(result: MatchResult, questions: InterviewQuestion[]): string {
  const strongestSkills = result.matchedSkills.slice(0, 3).join(", ") || "No strong matches detected yet.";
  const gapSkills = result.missingSkills.slice(0, 2).join(", ") || "No clear gaps detected yet.";

  const interviewLines = questions.map((question) => {
    return `- ${question.category}: ${question.question}\n  ${question.prompt}`;
  });

  return [
    "Application Pack",
    `Overall fit: ${result.score}/100`,
    `Strongest signals: ${strongestSkills}`,
    `What to make more visible: ${gapSkills}`,
    "",
    "Resume evidence:",
    ...result.evidence.map((item) => `- ${item}`),
    "",
    "Recommended wording:",
    ...result.suggestions.map((item) => `- ${item}`),
    "",
    "Interview prompts:",
    ...interviewLines,
  ].join("\n");
}
