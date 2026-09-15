export type MatchResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  evidence: string[];
  suggestions: string[];
};

const skillPatterns = [
  "typescript", "javascript", "react", "next.js", "nextjs", "node.js", "nodejs", "python", "java", "sql",
  "postgresql", "mongodb", "html", "css", "tailwind", "aws", "docker", "git", "rest api", "graphql",
  "accessibility", "testing", "figma", "agile",
];

function containsPhrase(text: string, phrase: string) {
  return text.toLowerCase().includes(phrase);
}

function displaySkill(skill: string) {
  const labels: Record<string, string> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    nextjs: "Next.js",
    "nodejs": "Node.js",
    postgresql: "PostgreSQL",
    mongodb: "MongoDB",
    rest: "REST",
    "rest api": "REST APIs",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    aws: "AWS",
  };
  return labels[skill] ?? skill.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function extractEvidence(resume: string, skill: string) {
  const sentence = resume.split(/(?<=[.!?])\s+|\n+/).find((part) => containsPhrase(part, skill));
  return sentence?.trim().replace(/\s+/g, " ") ?? `Resume mentions ${displaySkill(skill)}.`;
}

export function analyzeMatch(resume: string, job: string): MatchResult {
  const requestedSkills = skillPatterns.filter((skill) => containsPhrase(job, skill));
  const matchedSkills = requestedSkills.filter((skill) => containsPhrase(resume, skill));
  const missingSkills = requestedSkills.filter((skill) => !containsPhrase(resume, skill));
  const score = requestedSkills.length === 0 ? 0 : Math.round((matchedSkills.length / requestedSkills.length) * 100);
  const evidence = matchedSkills.slice(0, 3).map((skill) => `${displaySkill(skill)}: ${extractEvidence(resume, skill)}`);
  const suggestions = missingSkills.slice(0, 3).map((skill) => `If you have relevant experience, consider making ${displaySkill(skill)} more visible in your resume.`);

  return { score, matchedSkills: matchedSkills.map(displaySkill), missingSkills: missingSkills.map(displaySkill), evidence, suggestions };
}