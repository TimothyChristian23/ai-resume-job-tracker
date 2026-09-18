import { MatchResult } from "@/lib/match";

export type BulletSuggestion = {
  original: string;
  suggested: string;
  supports: string;
};

const bulletLead = /^(?:[-*•]\s*|\d+[.)]\s*)/;

function cleanLine(line: string) {
  return line.replace(bulletLead, "").replace(/\s+/g, " ").trim();
}

function findSkill(text: string, skills: string[]) {
  const lowerText = text.toLowerCase();
  return skills.find((skill) => lowerText.includes(skill.toLowerCase()));
}

export function buildBulletSuggestions(resume: string, result: MatchResult): BulletSuggestion[] {
  const lines = resume.split(/\n+/).map(cleanLine).filter((line) => line.length >= 35 && line.length <= 240);
  const sourceLines = lines.length ? lines : resume.split(/(?<=[.!?])\s+/).map(cleanLine).filter(Boolean);
  const suggestions: BulletSuggestion[] = [];
  for (const line of sourceLines) {
    const supports = findSkill(line, result.matchedSkills);
    if (!supports || suggestions.some((suggestion) => suggestion.original === line)) continue;
    const ending = /[.!?]$/.test(line) ? "" : ".";
    suggestions.push({
      original: line,
      suggested: `Built and improved solutions using ${supports}, ${line.charAt(0).toLowerCase()}${line.slice(1)}${ending}`,
      supports,
    });
    if (suggestions.length === 3) break;
  }

  return suggestions;
}