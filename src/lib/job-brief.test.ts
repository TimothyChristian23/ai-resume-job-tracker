import { describe, expect, it } from "vitest";
import { buildJobBrief } from "./job-brief";

describe("buildJobBrief", () => {
  it("summarizes fit, strongest skills, and the main gap", () => {
    const brief = buildJobBrief({
      score: 80,
      matchedSkills: ["TypeScript", "React", "Testing"],
      missingSkills: ["AWS", "Accessibility"],
      evidence: ["TypeScript: Works well."],
      suggestions: ["Add AWS."],
    });

    expect(brief).toContain("Overall fit: 80/100");
    expect(brief).toContain("Strongest signals: TypeScript, React, Testing");
    expect(brief).toContain("What to make more visible: AWS, Accessibility");
    expect(brief).toContain("Recommended next move");
  });
});
