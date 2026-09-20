import { describe, expect, it } from "vitest";
import { analyzeMatch } from "./match";

describe("analyzeMatch", () => {
  it("returns a transparent score, matched skills, gaps, and evidence", () => {
    const result = analyzeMatch(
      "Built a TypeScript and React dashboard. Added testing for the application.",
      "Frontend Engineer requiring TypeScript, React, testing, and AWS.",
    );

    expect(result.score).toBe(75);
    expect(result.matchedSkills).toEqual(["TypeScript", "React", "Testing"]);
    expect(result.missingSkills).toEqual(["AWS"]);
    expect(result.evidence[0]).toContain("TypeScript:");
    expect(result.suggestions[0]).toContain("AWS");
  });

  it("returns a neutral result when no known skills appear in the job", () => {
    expect(analyzeMatch("A general resume.", "A role with broad responsibilities.")).toEqual({
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      evidence: [],
      suggestions: [],
    });
  });
});