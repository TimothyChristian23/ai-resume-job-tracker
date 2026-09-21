import { MatchResult } from "@/lib/match";

export function buildJobBrief(result: MatchResult): string {
  const strongestSkills = result.matchedSkills.slice(0, 3).join(", ") || "No strong matches detected yet.";
  const gapSkills = result.missingSkills.slice(0, 2).join(", ") || "No clear gaps detected yet.";
  const summary = result.score >= 75 ? "This role looks like a strong fit based on your current evidence." : result.score >= 50 ? "This role is promising with a few targeted improvements." : "This role may need more tailored positioning before you apply.";

  return [
    "Job brief",
    `Overall fit: ${result.score}/100`,
    summary,
    `Strongest signals: ${strongestSkills}`,
    `What to make more visible: ${gapSkills}`,
    "Recommended next move: tighten your resume bullets, prep for the key interview question, and save this application for follow-up.",
  ].join("\n");
}
